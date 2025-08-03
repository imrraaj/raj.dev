---
layout: ../../layout/PostLayout.astro
title: Writing a Custom React Renderer
date: 03-08-2024
description: Why? Because I felt like it.
published: true
tags: react, javascript, internals
---

The other day, I was watching [Tsoding](https://twitch.tv/tsoding), and a huge shoutout to him. I'm a big fan—his streams are informative, entertaining, and have taught me so many things. Watching him code live has made programming feel more fun. He was streaming about creating a custom React renderer, and seeing him implement it, I thought, "Wait, I can do that too\!" The idea felt exciting and challenging.

## Starting from Scratch

I decided to build everything from scratch. My main goal was to implement a small, working React example on the web and then use the same React code to build a custom renderer from the ground up. I wanted to start with absolutely nothing, letting the build tools tell me what was missing.

To handle the build process, I chose **Parcel** for bundling and **Bun** for its native support for JSX. This setup allowed me to avoid complex configuration files and get straight to the fun part.

### The Role of a React Renderer

React itself doesn't render anything to the screen; that's the job of libraries like **React DOM**. When you call `ReactDOM.createRoot(app)`, you're using React DOM's renderer, which is responsible for translating React's instructions into browser DOM elements. React Native, on the other hand, takes the same tree-like structure and renders it using native mobile components.

Think of React as a **state machine**. It tells you what happens when a button is pressed—it transitions its internal state and gives you a new UI description. How to render that description is entirely up to you and your chosen renderer.

Here's the standard setup for a web app:

```js
import ReactDOM from "react-dom/client";
import { App } from "./App";
const root = ReactDOM.createRoot(app);
root.render(<App />);
```

First, I installed the necessary dependencies:

```bash
bun add parcel react react-dom
```

Then, I wrote a simple, yet feature-rich, single-component app using state, props, and conditional rendering:

```jsx
import React from "react";

export function App() {
    const [user, setUser] = React.useState({ name: "Blatzuka", age: 23 });
    const [clicks, setClicks] = React.useState(0);
    const [todos, setTodos] = React.useState([
        { id: 1, task: "Learn reconciler", done: false },
        { id: 2, task: "Build virtual DOM", done: true }
    ]);

    const handleClick = () => {
        setClicks(prev => prev + 1);
    };

    const toggleTodo = (id) => {
        setTodos(prev =>
            prev.map(todo =>
                todo.id === id ? { ...todo, done: !todo.done } : todo
            )
        );
    };

    return (
        <div className="app-container">
            <h1>Welcome, {user.name}!</h1>
            <p>You've clicked the button {clicks} times.</p>

            <button id="increment-button" onClick={handleClick}>
                Click Me!
            </button>

            <h2>Your Todos:</h2>
            <ul className="todo-list">
                {todos.map(todo => (
                    <li
                        key={todo.id}
                        style={{
                            textDecoration: todo.done ? "line-through" : "none"
                        }}
                        onClick={() => toggleTodo(todo.id)}
                    >
                        {todo.task}
                    </li>
                ))}
            </ul>

            {clicks >= 5 && <p className="bonus-message">You're on fire! 🔥</p>}
        </div>
    );
}
```

I built and served it using Parcel:

```bash
bunx parcel build main.js
bunx parcel serve index.html
```

And it worked perfectly.

<video controls muted autoplay transition:persist>
    <source src="/videos/normal-react-renderer.webm" type="video/mp4" />
</video>

-----

## Writing a Custom Renderer to Generate a UI Tree

The real challenge was to create a renderer that didn't output to the DOM, but instead, to a simple JavaScript object tree. To make this easier, I used the **`react-reconciler`** package, which is the engine at the heart of React. It handles the difficult logic of diffing the UI tree and deciding what needs to be changed. Our job is to provide it with a set of instructions—the `HostConfig`—that tells it *how* to make those changes in our custom environment.

First, I installed the package:

```bash
bun add react-reconciler
```

Then, I created a new file, `native.js`, and started building the renderer.

```js
import { App } from "./App";
import Reconciler from "react-reconciler";

const HostConfig = {
    supportsMutation: true,
    supportsPersistence: false,
    supportsHydration: false,
};
const CustomRenderer = Reconciler(HostConfig);

const root = CustomRenderer.createContainer({ type: 'window', children: [] }, 0);

CustomRenderer.updateContainer(<App />, root);
```

When I ran this file with `bun native.js`, it immediately threw an error:

```bash
TypeError: getRootHostContext is not a function. (In 'getRootHostContext(nextRootInstance)', 'getRootHostContext' is undefined)
```

This is where the fun begins. The reconciler is telling us exactly what it needs. To proceed, we have to implement the functions it expects, one by one.

### Implementing the HostConfig

The `HostConfig` is the bridge between React's reconciliation algorithm and our custom environment. It needs to contain a number of functions that React will call to perform tasks like creating elements, appending children, and updating properties.

Our goal is to construct a simple UI tree like this:

```json
{
    "type": "p",
    "children": [
        {
            "type" : "text",
            "value": "Hello, World!",
        }
    ]
}
```

I implemented the following functions to achieve this, tackling each error as it appeared:

  * **`createInstance(type, newProps)`**: This is called for every component in our app (`<div>`, `<h1>`, etc.). It returns a simple object representing our custom "element."
  * **`createTextInstance(text)`**: This creates a text node object with a `type` of "text" and a `value` for its content.
  * **`appendInitialChild(parent, child)`**: This is how the tree is built. It simply pushes the child object into the parent's `children` array.
  * **`removeChild(parent, child)`**: This is crucial for handling conditional rendering. When an element is removed from the UI (like our bonus message), this function finds and removes it from the parent's `children` array.
  * **`prepareUpdate(element, type, oldProps, newProps)`**: This function is called before an update. Its job is to compare the old and new props and return a payload of only the properties that have changed. This is a core part of React's efficiency.
  * **`commitUpdate(element, updatePayload, type, oldProps, newProps)`**: This function takes the payload from `prepareUpdate` and applies the changes to the element.
  * **`commitTextUpdate(element, oldVal, newVal)`**: This is a specialized function for updating text nodes without having to rebuild the entire element.

Here is the full implementation of the `HostConfig` and the final script:

```js
import { App } from "./App";
import Reconciler from "react-reconciler";

const HostConfig = {
    supportsMutation: true,
    supportsPersistence: false,
    supportsHydration: false,
    now: Date.now,

    getPublicInstance: function(instance) {
        return instance;
    },

    getRootHostContext: function() {
        return {};
    },

    prepareForCommit: function() {
        // no-op
    },

    resetAfterCommit: function() {
        // no-op
    },

    clearContainer: function(rootContainer) {
        rootContainer.children = [];
    },

    getChildHostContext: function() {
        return {};
    },

    shouldSetTextContent: function(type, props) {
        const typ = typeof props.children;
        return typ === "string" || typ === "number";
    },

    createInstance: function(type, newProps) {
        const element = { type, children: [] };
        Object.keys(newProps).forEach(function(name) {
            if (name === "children") {
                const typ = typeof newProps[name];
                if (typ === "string" || typ === "number") {
                    element[name].push(HostConfig.createTextInstance(newProps[name]));
                }
            } else {
                element[name] = newProps[name];
            }
        });
        return element;
    },

    finalizeInitialChildren: function() {
        // no-op
    },

    createTextInstance: function(text) {
        return {
            type: "text",
            value: text
        };
    },

    appendInitialChild: function(parent, child) {
        parent.children.push(child);
    },

    appendChildToContainer: function(parent, child) {
        parent.children.push(child);
    },

    appendChild: function(parent, child) {
        parent.children.push(child);
    },

    removeChild: function(parent, child) {
        const index = parent.children.findIndex(function(c) {
            return c === child;
        });
        console.log("removeChild", { parent, child, index });
        if (index > -1) {
            parent.children.splice(index, 1);
        }
    },

    prepareUpdate: function(element, type, oldProps, newProps) {
        const changes = [];
        for (var key in Object.assign({}, oldProps, newProps)) {
            if (oldProps[key] !== newProps[key]) {
                changes.push(key);
            }
        }
        return changes.length ? changes : null;
    },

    commitUpdate: function(element, updatePayload, type, oldProps, newProps) {
        if (updatePayload === null) return;
        updatePayload.forEach(function(name) {
            if (name === "children") {
                const typ = typeof newProps[name];
                if (typ === "string" || typ === "number") {
                    element[name].push(HostConfig.createTextInstance(newProps[name]));
                }
            } else {
                element[name] = newProps[name];
            }
        });
    },

    commitTextUpdate: function(element, oldVal, newVal) {
        element.text = newVal;
    }
};

const CustomRenderer = Reconciler(HostConfig);

const root = CustomRenderer.createContainer({ type: 'window', children: [] }, 0);
CustomRenderer.updateContainer(<App />, root);

console.log("Initial UI Tree:", root.containerInfo.children[0].children);

// Simulate button clicks to trigger state updates
root.containerInfo.children[0].children[2].onClick();
root.containerInfo.children[0].children[2].onClick();
root.containerInfo.children[0].children[2].onClick();
root.containerInfo.children[0].children[2].onClick();
root.containerInfo.children[0].children[2].onClick();
root.containerInfo.children[0].children[2].onClick();

console.log("Updated UI Tree:", root.containerInfo.children[0].children);
```

When I ran the final script, the output showed the initial UI tree and then the updated tree after the clicks. The second log clearly showed the addition of the "You're on fire\! 🔥" message, demonstrating that my custom renderer was correctly handling state changes and updating the tree.

```bash

Initial UI Tree: [
  {
    type: "h1",
    children: [
      {
        type: "text",
        value: "Welcome, ",
      }, {
        type: "text",
        value: "Blatzuka",
      }, {
        type: "text",
        value: "!",
      }
    ],
  }, {
    type: "p",
    children: [
      {
        type: "text",
        value: "You've clicked the button ",
      }, {
        type: "text",
        value: "0",
      }, {
        type: "text",
        value: " times.",
      }
    ],
  }, {
    type: "button",
    children: [
      {
        type: "text",
        value: "Click Me!",
      }
    ],
    id: "increment-button",
    onClick: [Function: handleClick],
  }, {
    type: "h2",
    children: [
      {
        type: "text",
        value: "Your Todos:",
      }
    ],
  }, {
    type: "ul",
    children: [
      {
        type: "li",
        children: [
          {
            type: "text",
            value: "Learn reconciler",
          }
        ],
        style: {
          textDecoration: "none",
        },
        onClick: [Function: onClick],
      }, {
        type: "li",
        children: [
          {
            type: "text",
            value: "Build virtual DOM",
          }
        ],
        style: {
          textDecoration: "line-through",
        },
        onClick: [Function: onClick],
      }
    ],
    className: "todo-list",
  }
]
Updated UI Tree: [
  {
    type: "h1",
    children: [
      {
        type: "text",
        value: "Welcome, ",
      }, {
        type: "text",
        value: "Blatzuka",
      }, {
        type: "text",
        value: "!",
      }
    ],
  }, {
    type: "p",
    children: [
      {
        type: "text",
        value: "You've clicked the button ",
      }, {
        type: "text",
        value: "0",
        text: "6",
      }, {
        type: "text",
        value: " times.",
      }
    ],
  }, {
    type: "button",
    children: [
      {
        type: "text",
        value: "Click Me!",
      }
    ],
    id: "increment-button",
    onClick: [Function: handleClick],
  }, {
    type: "h2",
    children: [
      {
        type: "text",
        value: "Your Todos:",
      }
    ],
  }, {
    type: "ul",
    children: [
      {
        type: "li",
        children: [
          {
            type: "text",
            value: "Learn reconciler",
          }
        ],
        style: {
          textDecoration: "none",
        },
        onClick: [Function: onClick],
      }, {
        type: "li",
        children: [
          {
            type: "text",
            value: "Build virtual DOM",
          }
        ],
        style: {
          textDecoration: "line-through",
        },
        onClick: [Function: onClick],
      }
    ],
    className: "todo-list",
  }, {
    type: "p",
    children: [
      {
        type: "text",
        value: "You're on fire! 🔥",
      }
    ],
    className: "bonus-message",
  }
]

```

Yay!, we got the expected output. The custom renderer successfully created a UI tree that represented our React app, including the dynamic updates from state changes. Now we can take this tree and render it in any way we want, whether that's printing it to the console, sending it over a network, or even rendering it in a different environment like a mobile app. We succesfully implemented a custom React renderer that outputs a simple JavaScript object tree instead of the browser DOM.

-----

### Wrapping Up

This project was a fantastic journey into the core of React. It proved that React's true power lies in its reconciliation engine, not its connection to the browser DOM. By providing a custom **`HostConfig`**, you can make React render to any environment imaginable, from the terminal to a native mobile app. That's all for now. I hope this inspires you to explore the depths of React and maybe even create your own custom renderer. Happy coding!