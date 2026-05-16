interface CollectionEntryLike {
  id?: string;
  slug?: string;
}

export function getEntrySlug(entry: CollectionEntryLike) {
  return entry.slug || entry.id || "";
}
