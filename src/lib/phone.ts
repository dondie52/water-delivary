export function normalizeBotswanaPhone(input: string) {
  const digits = input.replace(/\D/g, "");

  if (digits.length === 8) {
    return `+267${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("267")) {
    return `+${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("267")) {
    return `+${digits.slice(-11)}`;
  }

  if (input.trim().startsWith("+267") && digits.length >= 11) {
    return `+267${digits.slice(-8)}`;
  }

  return input.trim();
}
