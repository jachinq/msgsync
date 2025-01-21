export function isLocalhost(url) {
  if (url.includes('localhost')
    || url.includes('127.0.0.1')
    || url.includes('0.0.0.0')
    || url.includes('192.168.')
  ) {
    return true;
  }
  return false;
}