// ─── Store Constants & Helpers ─────────────────────────────────────
// Categories and sizes constants for the Darzan storefront

export const CATEGORIES = ['الكل', 'رجالي', 'نسائي', 'أطفال', 'فساتين', 'بيتي']

export const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']

export function findProduct(list, id) {
  if (!Array.isArray(list)) return null
  return list.find((p) => p.id === id)
}

