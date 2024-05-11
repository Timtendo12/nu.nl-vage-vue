export const decode64String = (value: string): string => {
  if (typeof window === 'undefined') {
    return Buffer.from(value, 'base64').toString('utf8');
  } else {
    return atob(value);
  }
};
