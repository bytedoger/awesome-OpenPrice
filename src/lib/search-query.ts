/**
 * Matches a whitespace-separated search query against one or more text fields.
 * Terms prefixed with "-" are excluded; all other terms must be present.
 */
export function matchesSearchQuery(
  values: Array<string | null | undefined>,
  query: string,
): boolean {
  const searchableText = values
    .filter((value): value is string => Boolean(value))
    .join(' ')
    .toLowerCase();

  const terms = query
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const includedTerms = terms
    .filter(term => !term.startsWith('-'))
    .map(term => term.toLowerCase());
  const excludedTerms = terms
    .filter(term => term.startsWith('-') && term.length > 1)
    .map(term => term.slice(1).toLowerCase());

  return includedTerms.every(term => searchableText.includes(term))
    && excludedTerms.every(term => !searchableText.includes(term));
}
