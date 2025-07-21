export function encodeForm(data: any): string {
  return btoa(encodeURIComponent(JSON.stringify(data)));
}

export function decodeForm(encoded: string): any | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)));
  } catch (e) {
    return null;
  }
}
