export function isStringUrl(str: string): boolean {
  const urlPattern = new RegExp(
    "^https?:\/\/([a-zA-Z0-9_-]+.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$",
    "i",
  );
  return urlPattern.test(str);
}

export function isLoginString(str: string): boolean {
  const pattern = new RegExp("^[a-zA-Z0-9_-]*$", "i");
  return pattern.test(str);
}

export function isEmailString(str: string): boolean {
  const pattern = new RegExp(
    "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
    "i",
  );
  return pattern.test(str);
}