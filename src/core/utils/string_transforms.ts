export function isStringUrl(str: string): boolean {
  const urlPattern = new RegExp(
    "^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$",
    "i",
  );
  return urlPattern.test(str);
}