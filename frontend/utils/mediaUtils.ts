
export function fileDataToBase64(data: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(data);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('FileReader did not return a string.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function extractVideoFramesAsBase64(videoFile: File, frameCount: number): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.style.display = 'none';
    video.muted = true;
    video.playsInline = true;
    const url = URL.createObjectURL(videoFile);
    video.src = url;

    let loaded = false;

    const captureFrame = (time: number): Promise<string> => {
      return new Promise((resolveFrame, rejectFrame) => {
        video.currentTime = time;
        
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return rejectFrame(new Error('Could not get canvas context.'));
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frameDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolveFrame(frameDataUrl);
        };

        const onSeekedError = () => {
            rejectFrame(new Error(`Failed to seek to time ${time}.`));
        }

        video.addEventListener('seeked', onSeeked, { once: true });
        video.addEventListener('error', onSeekedError, { once: true });
      });
    };

    video.addEventListener('loadeddata', async () => {
        if(loaded) return;
        loaded = true;
        
        const cleanup = () => {
            URL.revokeObjectURL(url);
            if (video.parentNode) {
                document.body.removeChild(video);
            }
        };

        try {
            const duration = video.duration;
            const interval = duration / (frameCount + 1);
            const capturePromises: Promise<string>[] = [];

            for (let i = 1; i <= frameCount; i++) {
                const time = i * interval;
                if (time < duration) {
                    capturePromises.push(captureFrame(time));
                }
            }
            
            const capturedFrames = await Promise.all(capturePromises);
            cleanup();
            resolve(capturedFrames);
        } catch (error) {
            cleanup();
            reject(error);
        }
    });

    video.addEventListener('error', (e) => {
      URL.revokeObjectURL(url);
      if(video.parentNode) {
        document.body.removeChild(video);
      }
      reject(new Error(`Error loading video: ${e.type}`));
    });

    document.body.appendChild(video);
    video.load();
  });
}
