export const processAndCompressImage = (file: File, maxWidth = 1500, quality = 0.8): Promise<{base64: string, mimeType: string}> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                // AI 모델이 이미지를 더 잘 인식하도록 적절한 해상도 유지 (최대 1500px)
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    const result = e.target?.result as string;
                    resolve({ base64: result.split(',')[1], mimeType: file.type || 'image/jpeg' });
                    return;
                }
                
                // 흰색 배경으로 채우기 (투명 PNG 방지)
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                // JPEG 압축으로 용량 획기적으로 감소
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                const base64 = dataUrl.split(',')[1];
                resolve({ base64, mimeType: 'image/jpeg' });
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
};
