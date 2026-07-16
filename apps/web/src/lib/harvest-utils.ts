export function generateHarvestReportUrl(harvestId: string): string {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${origin}/harvest/report/${encodeURIComponent(harvestId)}`;
}

export function generateQrCodeDataUrl(text: string, size = 200): string {
  const encoded = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
}

export function generateQrCodeSvg(text: string, size = 200): string {
  const url = generateQrCodeDataUrl(text, size);
  return `<img src="${url}" width="${size}" height="${size}" alt="QR Code" />`;
}
