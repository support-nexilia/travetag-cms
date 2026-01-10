export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function generateUniqueSlug(base: string, existingSlugs: string[]): string {
  let slug = slugify(base);
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${slugify(base)}-${counter}`;
    counter++;
  }
  
  return slug;
}
