export function getBasicAuthToken(): string {
  const username = 'admin';
  const password = 'qwerty';
  const token = Buffer.from(`${username}:${password}`).toString('base64');
  return `Basic ${token}`;
}