import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

export const storageService = {
  /**
   * Upload video file directly to Firebase Storage
   * @param file - Video file to upload
   * @param strategyId - Strategy ID for organizing files
   * @param onProgress - Callback for upload progress updates
   * @returns Promise with the download URL
   */
  async uploadVideo(
    file: File,
    strategyId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `video_${timestamp}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const storagePath = `strategies/${strategyId}/videos/${fileName}`;

      // Create storage reference
      const storageRef = ref(storage, storagePath);

      // Start upload with resumable upload
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
      });

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progress callback
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress({
                progress,
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
              });
            }
            console.log(`Upload progress: ${progress.toFixed(2)}%`);
          },
          (error) => {
            // Error callback
            console.error('Upload error:', error);
            reject(error);
          },
          async () => {
            // Success callback
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('✅ Video uploaded successfully:', downloadURL);
              resolve(downloadURL);
            } catch (error) {
              console.error('Error getting download URL:', error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  },

  /**
   * Format bytes to human-readable size
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },
};

