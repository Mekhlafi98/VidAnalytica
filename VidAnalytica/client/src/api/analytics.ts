import api from './api';

export interface DashboardStats {
  totalChannels: number;
  totalVideos: number;
  totalIdeas: number;
  totalTranscripts: number;
  recentActivity: Array<{
    id: string;
    type: 'channel_added' | 'transcript_completed' | 'ideas_generated' | 'sync_completed';
    message: string;
    timestamp: string;
  }>;
}

export interface ChannelAnalytics {
  channelId: string;
  channelName: string;
  metrics: {
    averageViews: number;
    engagementRate: number;
    uploadFrequency: number;
    totalVideos: number;
    transcribedVideos: number;
    ideasGenerated: number;
  };
  performanceData: Array<{
    date: string;
    views: number;
    engagement: number;
  }>;
  topTopics: Array<{
    topic: string;
    count: number;
    percentage: number;
  }>;
}

// Description: Get dashboard statistics
// Endpoint: GET /api/analytics/dashboard
// Request: {}
// Response: { stats: DashboardStats }
export const getDashboardStats = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        stats: {
          totalChannels: 3,
          totalVideos: 75,
          totalIdeas: 156,
          totalTranscripts: 45,
          recentActivity: [
            {
              id: '1',
              type: 'ideas_generated',
              message: 'Generated 8 ideas from "The Future of AI in 2024"',
              timestamp: '2024-01-15T10:30:00Z'
            },
            {
              id: '2',
              type: 'transcript_completed',
              message: 'Transcript completed for "Building Scalable Web Applications"',
              timestamp: '2024-01-15T09:15:00Z'
            },
            {
              id: '3',
              type: 'channel_added',
              message: 'Added new channel "Creative Studio"',
              timestamp: '2024-01-14T16:45:00Z'
            },
            {
              id: '4',
              type: 'sync_completed',
              message: 'Sync completed for "Tech Insights" - 5 new videos found',
              timestamp: '2024-01-14T14:20:00Z'
            }
          ]
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/analytics/dashboard');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Get channel analytics
// Endpoint: GET /api/analytics/channels/:id
// Request: {}
// Response: { analytics: ChannelAnalytics }
export const getChannelAnalytics = (channelId: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        analytics: {
          channelId,
          channelName: 'Tech Insights',
          metrics: {
            averageViews: 38500,
            engagementRate: 4.2,
            uploadFrequency: 2.5,
            totalVideos: 245,
            transcribedVideos: 30,
            ideasGenerated: 85
          },
          performanceData: [
            { date: '2024-01-01', views: 35000, engagement: 3.8 },
            { date: '2024-01-02', views: 42000, engagement: 4.1 },
            { date: '2024-01-03', views: 38000, engagement: 4.0 },
            { date: '2024-01-04', views: 45000, engagement: 4.5 },
            { date: '2024-01-05', views: 41000, engagement: 4.2 },
            { date: '2024-01-06', views: 39000, engagement: 3.9 },
            { date: '2024-01-07', views: 43000, engagement: 4.3 }
          ],
          topTopics: [
            { topic: 'Artificial Intelligence', count: 12, percentage: 40 },
            { topic: 'Web Development', count: 8, percentage: 27 },
            { topic: 'Machine Learning', count: 6, percentage: 20 },
            { topic: 'Cloud Computing', count: 4, percentage: 13 }
          ]
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/analytics/channels/${channelId}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Get ideas analytics
// Endpoint: GET /api/analytics/ideas
// Request: {}
// Response: { analytics: object }
export const getIdeasAnalytics = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        analytics: {
          totalIdeas: 156,
          categoriesBreakdown: [
            { category: 'main-concept', count: 45, percentage: 29 },
            { category: 'actionable-insight', count: 52, percentage: 33 },
            { category: 'content-suggestion', count: 38, percentage: 24 },
            { category: 'key-takeaway', count: 21, percentage: 14 }
          ],
          trendsOverTime: [
            { date: '2024-01-01', ideas: 8 },
            { date: '2024-01-02', ideas: 12 },
            { date: '2024-01-03', ideas: 15 },
            { date: '2024-01-04', ideas: 10 },
            { date: '2024-01-05', ideas: 18 },
            { date: '2024-01-06', ideas: 14 },
            { date: '2024-01-07', ideas: 16 }
          ],
          topChannels: [
            { channelName: 'Tech Insights', ideasCount: 85, percentage: 55 },
            { channelName: 'Marketing Masters', ideasCount: 42, percentage: 27 },
            { channelName: 'Creative Studio', ideasCount: 29, percentage: 18 }
          ]
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/analytics/ideas');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};