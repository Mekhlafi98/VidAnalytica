import api from './api';

export interface Transcript {
  _id: string;
  videoId: string;
  videoTitle: string;
  channelName: string;
  content: string;
  timestamps: Array<{
    start: number;
    end: number;
    text: string;
    speaker?: string;
  }>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

// Description: Get all transcripts
// Endpoint: GET /api/transcripts
// Request: { channelId?: string, status?: string, search?: string, page?: number, limit?: number }
// Response: { transcripts: Transcript[], total: number, page: number, totalPages: number }
export const getTranscripts = (filters: {
  channelId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        transcripts: [
          {
            _id: 'transcript1',
            videoId: '1',
            videoTitle: 'The Future of AI in 2024: What You Need to Know',
            channelName: 'Tech Insights',
            content: 'Welcome to today\'s video about artificial intelligence. In this comprehensive guide, we\'ll explore the latest trends and developments that are shaping the AI landscape in 2024. From machine learning breakthroughs to ethical considerations, we\'ll cover everything you need to know to stay ahead in this rapidly evolving field...',
            timestamps: [
              { start: 0, end: 5, text: 'Welcome to today\'s video about artificial intelligence.', speaker: 'Host' },
              { start: 5, end: 12, text: 'In this comprehensive guide, we\'ll explore the latest trends and developments.', speaker: 'Host' },
              { start: 12, end: 20, text: 'From machine learning breakthroughs to ethical considerations.', speaker: 'Host' }
            ],
            status: 'completed',
            createdAt: '2024-01-10T10:00:00Z',
            updatedAt: '2024-01-10T10:15:00Z'
          },
          {
            _id: 'transcript2',
            videoId: '2',
            videoTitle: 'Building Scalable Web Applications',
            channelName: 'Tech Insights',
            content: 'Today we\'re diving deep into the world of scalable web applications. Building applications that can handle millions of users requires careful planning, the right architecture, and understanding of performance optimization techniques...',
            timestamps: [
              { start: 0, end: 8, text: 'Today we\'re diving deep into the world of scalable web applications.', speaker: 'Host' },
              { start: 8, end: 18, text: 'Building applications that can handle millions of users requires careful planning.', speaker: 'Host' }
            ],
            status: 'completed',
            createdAt: '2024-01-08T14:00:00Z',
            updatedAt: '2024-01-08T14:20:00Z'
          }
        ],
        total: 25,
        page: 1,
        totalPages: 3
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const params = new URLSearchParams();
  //   Object.entries(filters).forEach(([key, value]) => {
  //     if (value !== undefined) params.append(key, value.toString());
  //   });
  //   return await api.get(`/api/transcripts?${params.toString()}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Get transcript by ID
// Endpoint: GET /api/transcripts/:id
// Request: {}
// Response: { transcript: Transcript }
export const getTranscript = (transcriptId: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        transcript: {
          _id: transcriptId,
          videoId: '1',
          videoTitle: 'The Future of AI in 2024: What You Need to Know',
          channelName: 'Tech Insights',
          content: 'Welcome to today\'s video about artificial intelligence. In this comprehensive guide, we\'ll explore the latest trends and developments that are shaping the AI landscape in 2024. From machine learning breakthroughs to ethical considerations, we\'ll cover everything you need to know to stay ahead in this rapidly evolving field. Let\'s start by examining the current state of AI technology and where it\'s heading...',
          timestamps: [
            { start: 0, end: 5, text: 'Welcome to today\'s video about artificial intelligence.', speaker: 'Host' },
            { start: 5, end: 12, text: 'In this comprehensive guide, we\'ll explore the latest trends and developments.', speaker: 'Host' },
            { start: 12, end: 20, text: 'From machine learning breakthroughs to ethical considerations.', speaker: 'Host' },
            { start: 20, end: 28, text: 'We\'ll cover everything you need to know to stay ahead in this rapidly evolving field.', speaker: 'Host' }
          ],
          status: 'completed',
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:15:00Z'
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/transcripts/${transcriptId}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Update transcript content
// Endpoint: PUT /api/transcripts/:id
// Request: { content: string }
// Response: { success: boolean, message: string }
export const updateTranscript = (transcriptId: string, data: { content: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Transcript updated successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put(`/api/transcripts/${transcriptId}`, data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Export transcript
// Endpoint: GET /api/transcripts/:id/export
// Request: { format: 'txt' | 'pdf' }
// Response: { downloadUrl: string }
export const exportTranscript = (transcriptId: string, format: 'txt' | 'pdf') => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        downloadUrl: `https://example.com/downloads/transcript-${transcriptId}.${format}`
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/transcripts/${transcriptId}/export?format=${format}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};