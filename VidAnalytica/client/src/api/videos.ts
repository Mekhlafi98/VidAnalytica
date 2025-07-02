import api from './api';

export interface Video {
  _id: string;
  channelId: string;
  channelName: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  views: number;
  likes: number;
  uploadDate: string;
  url: string;
  transcriptStatus: 'pending' | 'processing' | 'completed' | 'failed';
  ideasStatus: 'pending' | 'processing' | 'completed' | 'failed';
  transcriptId?: string;
  ideasCount: number;
}

// Description: Get all videos with filters
// Endpoint: GET /api/videos
// Request: { channelId?: string, transcriptStatus?: string, ideasStatus?: string, search?: string, page?: number, limit?: number }
// Response: { videos: Video[], total: number, page: number, totalPages: number }
export const getVideos = (filters: {
  channelId?: string;
  transcriptStatus?: string;
  ideasStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        videos: [
          {
            _id: '1',
            channelId: '1',
            channelName: 'Tech Insights',
            title: 'The Future of AI in 2024: What You Need to Know',
            description: 'Exploring the latest trends and developments in artificial intelligence...',
            thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=320&h=180&fit=crop',
            duration: '12:45',
            views: 45000,
            likes: 1200,
            uploadDate: '2024-01-10T00:00:00Z',
            url: 'https://youtube.com/watch?v=example1',
            transcriptStatus: 'completed',
            ideasStatus: 'completed',
            transcriptId: 'transcript1',
            ideasCount: 8
          },
          {
            _id: '2',
            channelId: '1',
            channelName: 'Tech Insights',
            title: 'Building Scalable Web Applications',
            description: 'Learn how to build applications that can handle millions of users...',
            thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=320&h=180&fit=crop',
            duration: '18:30',
            views: 32000,
            likes: 890,
            uploadDate: '2024-01-08T00:00:00Z',
            url: 'https://youtube.com/watch?v=example2',
            transcriptStatus: 'completed',
            ideasStatus: 'pending',
            ideasCount: 0
          },
          {
            _id: '3',
            channelId: '2',
            channelName: 'Marketing Masters',
            title: 'Social Media Strategy for 2024',
            description: 'Complete guide to dominating social media this year...',
            thumbnail: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=320&h=180&fit=crop',
            duration: '15:20',
            views: 28000,
            likes: 750,
            uploadDate: '2024-01-12T00:00:00Z',
            url: 'https://youtube.com/watch?v=example3',
            transcriptStatus: 'processing',
            ideasStatus: 'pending',
            ideasCount: 0
          }
        ],
        total: 75,
        page: 1,
        totalPages: 8
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const params = new URLSearchParams();
  //   Object.entries(filters).forEach(([key, value]) => {
  //     if (value !== undefined) params.append(key, value.toString());
  //   });
  //   return await api.get(`/api/videos?${params.toString()}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Generate transcript for video
// Endpoint: POST /api/videos/:id/transcript
// Request: {}
// Response: { success: boolean, message: string }
export const generateTranscript = (videoId: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Transcript generation started'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post(`/api/videos/${videoId}/transcript`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Generate ideas for video
// Endpoint: POST /api/videos/:id/ideas
// Request: {}
// Response: { success: boolean, message: string }
export const generateIdeas = (videoId: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Ideas generation started'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post(`/api/videos/${videoId}/ideas`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Bulk generate transcripts
// Endpoint: POST /api/videos/bulk/transcripts
// Request: { videoIds: string[] }
// Response: { success: boolean, message: string }
export const bulkGenerateTranscripts = (videoIds: string[]) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Transcript generation started for ${videoIds.length} videos`
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/videos/bulk/transcripts', { videoIds });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Bulk generate ideas
// Endpoint: POST /api/videos/bulk/ideas
// Request: { videoIds: string[] }
// Response: { success: boolean, message: string }
export const bulkGenerateIdeas = (videoIds: string[]) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Ideas generation started for ${videoIds.length} videos`
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/videos/bulk/ideas', { videoIds });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};