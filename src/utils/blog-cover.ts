const LEGACY_BLOG_COVER = "/blog-cover.png";

const BLOG_COVER_IMAGES = [
  "/1.jpeg",
  "/2.jpeg",
  "/3.jpeg",
  "/4.jpeg",
  "/5.jpeg",
  "/6.jpeg",
  "/7.jpeg",
  "/8.jpeg",
  "/9.jpeg",
] as const;

const buildOffset = Math.floor(Math.random() * BLOG_COVER_IMAGES.length);

function hashString(value: string) {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  return hash;
}

export function getBlogCoverImage(image?: string | null, key = "") {
  if (image && image !== LEGACY_BLOG_COVER) {
    return image;
  }

  const index = (hashString(key) + buildOffset) % BLOG_COVER_IMAGES.length;
  return BLOG_COVER_IMAGES[index];
}
