/**
 * Utility to process and resize images to ensure fast uploads and optimal Gemini AI analysis.
 */
export async function processImageFile(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 840;
        const MAX_HEIGHT = 840;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ base64: e.target?.result as string, mimeType: file.type || 'image/jpeg' });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.80);
        resolve({ base64: dataUrl, mimeType: 'image/jpeg' });
      };
      img.onerror = () => {
        reject(new Error('사진을 불러오지 못했어요. 다른 사진을 선택해 주세요.'));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('사진 파일을 읽는 데 실패했어요.'));
    };
    reader.readAsDataURL(file);
  });
}
