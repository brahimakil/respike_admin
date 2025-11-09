import axios from 'axios';

const BUNNY_LIBRARY_ID = '534039';
const BUNNY_API_KEY = 'd9a3bbb9-65a0-46f9-ac8a77024036-0273-4d79';
const BUNNY_CDN_HOSTNAME = 'vz-59d272a1-969.b-cdn.net';
const BUNNY_API_BASE_URL = 'https://video.bunnycdn.com';

export interface BunnyUploadResult {
  videoId: string;
  playbackUrl: string;
}

/**
 * Upload video directly to Bunny.net Stream from the browser
 */
export const uploadVideoToBunny = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<BunnyUploadResult> => {
  try {
    console.log('🐰 [Bunny] Starting direct upload to Bunny.net...');
    console.log('📦 File size:', (file.size / 1024 / 1024).toFixed(2), 'MB');

    // Step 1: Create video object in Bunny.net
    console.log('📝 [Bunny] Creating video object...');
    const createResponse = await axios.post(
      `${BUNNY_API_BASE_URL}/library/${BUNNY_LIBRARY_ID}/videos`,
      { title: file.name },
      {
        headers: {
          AccessKey: BUNNY_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds for API call
      }
    );

    const videoId = createResponse.data.guid;
    console.log('✅ [Bunny] Video object created:', videoId);

    // Step 2: Upload video file directly
    console.log('📤 [Bunny] Uploading video file...');
    await axios.put(
      `${BUNNY_API_BASE_URL}/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
      file,
      {
        headers: {
          AccessKey: BUNNY_API_KEY,
          'Content-Type': 'application/octet-stream',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentComplete = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            onProgress(percentComplete);
          }
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 0, // No timeout for large file uploads
      }
    );

    console.log('✅ [Bunny] Video uploaded successfully!');

    // Step 3: Return playback URL
    const playbackUrl = `https://${BUNNY_CDN_HOSTNAME}/${videoId}/playlist.m3u8`;

    return {
      videoId,
      playbackUrl,
    };
  } catch (error: any) {
    console.error('❌ [Bunny] Upload failed:', error);
    
    // More detailed error message
    if (error.code === 'ECONNABORTED') {
      throw new Error('Upload timed out. Please check your internet connection and try again.');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your internet connection.');
    } else if (error.response?.status === 413) {
      throw new Error('File is too large for upload.');
    } else {
      throw new Error(error.response?.data?.message || error.message || 'Failed to upload video to Bunny.net');
    }
  }
};

/**
 * Delete video from Bunny.net Stream
 */
export const deleteVideoFromBunny = async (videoId: string): Promise<void> => {
  try {
    console.log('🗑️ [Bunny] Deleting video:', videoId);
    await axios.delete(`${BUNNY_API_BASE_URL}/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`, {
      headers: {
        AccessKey: BUNNY_API_KEY,
      },
    });
    console.log('✅ [Bunny] Video deleted successfully');
  } catch (error: any) {
    console.error('❌ [Bunny] Delete failed:', error);
    throw new Error('Failed to delete video from Bunny.net');
  }
};
