export function getCountryNameChinese(countryCode: string): string {
  if (!countryCode) return '';
  try {
    const regionNames = new Intl.DisplayNames(['zh-CN'], { type: 'region' });
    return regionNames.of(countryCode.toUpperCase()) || countryCode.toUpperCase();
  } catch (error) {
    return countryCode.toUpperCase();
  }
}
