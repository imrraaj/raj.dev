export interface Book {
  title: string;
  author: string;
  status: "read" | "reading" | "want-to-read";
}

export const books: Book[] = [
  { title: "Psychology of Money", author: "Morgan Housel", status: "read" },
  { title: "Atomic Habits", author: "James Clear", status: "read" },
  { title: "Stranger", author: "Albert Camus", status: "read" },
  { title: "Ikigai", author: "Héctor García & Francesc Miralles", status: "read" },
  { title: "Sapiens", author: "Yuval Noah Harari", status: "read" },
  { title: "Steve Jobs", author: "Walter Isaacson", status: "reading" },
  { title: "The Republic", author: "Plato", status: "want-to-read" },
];
