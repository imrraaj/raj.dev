---
layout: ../../layout/PostLayout.astro
title: How to hot-reload raylib from scratch
date: 12-08-2024
description: Why? Because I felt like it.
published: true
tags: C, raylib
---
## Pretext

I have always used build tools when working with web technologies and was always happy with the auto-reload functionality that happens when you save a file. Tools like Vite, Webpack, and Turbo allow us to hot-reload the website without closing and re-running the dev server. I've since stopped working on web technologies and am now more inclined towards low-level programming in languages like C and Go. I used raylib in my **[Bytestream](https://github.com/imrraaj/byte-stream)** project, which is an audio-video player I wrote from scratch using raylib and FFmpeg in C.

While developing the UI for that project, one of the most annoying things I had to face was having to close the window, compile the modified code, and then re-run the code. If I passed command-line arguments, I would also have to re-enter those to play the video. This process was cumbersome and time-consuming, especially since I hadn't planned the design beforehand and was experimenting with what worked best.

This got me thinking: what about hot-reloading the raylib window? What could I use and how could I achieve that? Luckily, I had some knowledge about static and dynamic libraries and how to use them. I thought I could use dynamic libraries, which are linked at runtime, allowing me to change the code while the program is running. This seemed like a fantastic idea.

### Setup the raylib project

The first step is to download the raylib library and unpack it based on your system. I've set up a Makefile to compile and test on my Mac and Linux machines.

Makefile

```
CC = clang
UNAME_S := $(shell uname -s)
INCLUDES = -I./include/
LDFLAGS = -lm
ifeq ($(UNAME_S),Darwin)
	CFLAGS = -ggdb -framework CoreVideo -framework IOKit -framework Cocoa -framework GLUT -framework OpenGL -L./lib/macos -lraylib -ldl
else
	CFLAGS = -ggdb -Wall -Wextra -pedantic -lGL -lm -lpthread -ldl -lrt -lX11 -L./lib/linux -l:libraylib.a -ldl
endif

main: main.c
	mkdir -p build
	$(CC) -o build/main *.c $(CFLAGS) $(INCLUDES) $(LDFLAGS)
```

Here's the initial `main.c` file:

```c
#include "raylib.h"
int main(void)
{
    const int screenWidth = 800;
    const int screenHeight = 450;
    InitWindow(screenWidth, screenHeight, "raylib Hello World");
    SetTargetFPS(60);
    while (!WindowShouldClose())
    {
        BeginDrawing();
            ClearBackground(RAYWHITE);
            DrawText("Hello World!", 190, 200, 20, LIGHTGRAY);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}
```

Running `make -B` compiles the `main.c` file and places the binary in the `build` folder. Running it will open a window with "Hello World" text.

## Architecture

### Main Idea

The main idea is to compile our main program, which handles window creation and closing, separately from the application logic. For instance, if we were implementing a game in raylib, the main game loop would be in the `main` file, and all the game logic would be in separate compilation units.

We then compile these logic units into a dynamic library that the main module can use to dynamically open the shared object (`.so` file) at runtime and execute the necessary functions. So, when we change the logic, we can recompile the shared library without closing the running window. Then, by pressing a key like 'R', we can reload all the function references from the shared library used in the main application loop.

To compile the shared library, add this to the Makefile:

Makefile:

```Makefile
plug.so: plug.c
	$(CC) -shared -fPIC -o build/plug.so plug.c $(CFLAGS) $(INCLUDES)
```

The **`-fPIC`** and **`-shared`** flags are essential. `-shared` tells the compiler to create a shared library, and `-fPIC` stands for Position-Independent Code, which is necessary so the code can be loaded anywhere in memory at runtime.

The `plug.c` file contains our application logic and state. For this example, it's a simple function that returns a color value to be used in the main game loop. This could be anything you want—you could return structs or functions, as long as you manage them properly.

```c
// plug.c

#include "raylib.h"
Color plug_init() {
	return BLUE;
}
```

This is a simple function that just returns the `BLUE` raylib color. Now, let's modify the main file to open the shared library and get the functions.

```c
#include <dlfcn.h>
#include <stdio.h>
#include "raylib.h"

Color windowColor = BLACK;
void reload() {
	void *handle = dlopen("./build/plug.so", RTLD_LAZY);
	if (!handle) {
		fprintf(stderr, "Error loading plug.so: %s\n", dlerror());
		return;
	}
	Color (*plug_init)() = dlsym(handle, "plug_init");
	if (!plug_init) {
		fprintf(stderr, "Error finding plug_init: %s\n", dlerror());
		dlclose(handle);
		return;
	}
	windowColor = plug_init();
	dlclose(handle);
}

int main() {
	InitWindow(800, 600, "Raylib Reloaded");
	while (!WindowShouldClose()) {
		if (IsKeyPressed(KEY_R)) {
			reload();
		}
		BeginDrawing();
		ClearBackground(windowColor);
		EndDrawing();
	}
	CloseWindow();
	return 0;
}
```

We've created a `reload` function that opens the shared object file and gets a function pointer to that piece of code. Whenever we press 'R', it will open the shared object file, read the specified function, and run it, giving us back the color value.

You can now see this in action. Run the main program from the Makefile. While the window is open showing a black color, press 'R' and the color will change to blue. Now, without closing the window, change the `BLUE` color in `plug.c` to `ORANGE` and compile `plug.c` again using the `plug.so` makefile command. After that, press 'R' again and you'll see the orange color on the screen, all without closing the window, recompiling the main code, and re-opening the window. The possibilities are endless. You can even save the state in the main program while reloading and then assign the state back to the `plug.so` module, so you'll never lose the state of your program.

<video controls muted autoplay transition:persist>
    <source src="/videos/raylib-reload.mp4" type="video/mp4" />
</video>