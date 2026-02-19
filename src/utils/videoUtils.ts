/**
 * 捕获视频指定时间的帧
 * @param videoFile 视频文件
 * @param time 时间点（秒）
 * @returns Promise<string> Base64图片数据
 */
export const captureVideoFrame = (videoFile: File, time: number = 0): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const url = URL.createObjectURL(videoFile);

    video.src = url;
    video.muted = true;
    video.crossOrigin = "anonymous";
    video.currentTime = time;

    const onSeeked = () => {
      try {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          resolve(dataUrl);
        } else {
          reject(new Error("Canvas context is null"));
        }
      } catch (err) {
        reject(err);
      } finally {
        video.removeEventListener("seeked", onSeeked);
        video.removeEventListener("error", onError);
        URL.revokeObjectURL(url);
      }
    };

    const onError = () => {
      reject(new Error("Video load error"));
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      URL.revokeObjectURL(url);
    };

    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);

    video.load();
    video.onloadedmetadata = () => {
      video.currentTime = time;
    };
  });
};
