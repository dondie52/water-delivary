export const FWM_WHATSAPP = "+26775909515";
export const FWM_PHONE_DISPLAY = "+267 75 909 515";

export function buildPhoneLink(phoneNumber: string = FWM_WHATSAPP) {
  return `tel:${phoneNumber.replace(/\s/g, "")}`;
}

export function buildWhatsAppLink(text?: string, whatsappNumber: string = FWM_WHATSAPP) {
  const digits = whatsappNumber.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
