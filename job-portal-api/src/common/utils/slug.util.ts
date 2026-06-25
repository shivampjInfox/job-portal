interface SlugOptions {
  lower?: boolean;
  strict?: boolean;
}

export function generateSlug(text: string, options: SlugOptions = {}): string {
  const { lower = true, strict = true } = options;

  let slug = text.trim();

  if (lower) {
    slug = slug.toLowerCase();
  }

  if (strict) {
    slug = slug.replace(/[^\w\s-]/g, '');
  }

  return slug.replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}
