/**
 * Compresses a local image File into a lightweight Data URL (<= maxBytes)
 * so it stays fast over mobile connections across Egypt and within Firestore limits.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 800,
  maxBytes = 110000
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('تعذر قراءة ملف الصورة'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('صيغة الصورة غير صالحة'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('تعذر معالجة الصورة'));
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.72;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        while (dataUrl.length > maxBytes && quality > 0.25) {
          quality -= 0.12;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        if (dataUrl.length > maxBytes) {
          // Downscale further if still too large
          const scale = 0.65;
          canvas.width = Math.max(320, Math.round(width * scale));
          canvas.height = Math.max(240, Math.round(height * scale));
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          dataUrl = canvas.toDataURL('image/jpeg', 0.55);
        }

        if (dataUrl.length > maxBytes) {
          reject(new Error('حجم الصورة كبير جداً، يرجى استخدام رابط صورة خارجي (URL) أو صورة أصغر.'));
          return;
        }

        resolve(dataUrl);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').slice(0, 120);
  return cleaned || `id-${Date.now()}`;
}
