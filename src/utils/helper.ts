export const escapeHtml = (text: string) => {
  const map: Record<string, string> = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&#39;',
    '"': '&quot;',
    '/': '&#47;',
    '%': '&#37;',
    '+': '&#43;',
  };
  return text.replace(/[<>&'"\/]/g, (char: string): string => map[char]);
};

export const exclude = <T extends object, Key extends keyof T>(
  obj: T,
  keys: Key[],
): Omit<T, Key> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key as Key)),
  ) as Omit<T, Key>;
};
