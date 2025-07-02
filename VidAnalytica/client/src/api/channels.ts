import api from './api';

export interface Channel {
  _id: string;
  name: string;
  handle: string;
  url: string;
  avatar: string;
  subscriberCount: number;
  totalVideos: number;
  videosAnalyzed: number;
  lastSync: string;
  status: 'active' | 'syncing' | 'error';
  createdAt: string;
}

// Description: Get all YouTube channels
// Endpoint: GET /api/channels
// Request: {}
// Response: { channels: Channel[] }
export const getChannels = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        channels: [
          {
            _id: '1',
            name: 'Tech Insights',
            handle: '@techinsights',
            url: 'https://youtube.com/@techinsights',
            avatar: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop&crop=face',
            subscriberCount: 125000,
            totalVideos: 245,
            videosAnalyzed: 30,
            lastSync: '2024-01-15T10:30:00Z',
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z'
          },
          {
            _id: '2',
            name: 'Marketing Masters',
            handle: '@marketingmasters',
            url: 'https://youtube.com/@marketingmasters',
            avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=face',
            subscriberCount: 89000,
            totalVideos: 156,
            videosAnalyzed: 25,
            lastSync: '2024-01-14T15:45:00Z',
            status: 'syncing',
            createdAt: '2024-01-05T00:00:00Z'
          },
          {
            _id: '3',
            name: 'Creative Studio',
            handle: '@creativestudio',
            url: 'https://youtube.com/@creativestudio',
            avatar: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&crop=face',
            subscriberCount: 67000,
            totalVideos: 89,
            videosAnalyzed: 20,
            lastSync: '2024-01-13T09:15:00Z',
            status: 'active',
            createdAt: '2024-01-10T00:00:00Z'
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/channels');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Add a new YouTube channel
// Endpoint: POST /api/channels
// Request: { url: string }
// Response: { success: boolean, message: string, channel: Channel }
export const addChannel = (data: { url: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Channel added successfully',
        channel: {
          _id: Date.now().toString(),
          name: 'New Channel',
          handle: '@newchannel',
          url: data.url,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
          subscriberCount: 45000,
          totalVideos: 120,
          videosAnalyzed: 0,
          lastSync: new Date().toISOString(),
          status: 'syncing',
          createdAt: new Date().toISOString()
        }
      });
    }, 1000);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/channels', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Delete a YouTube channel
// Endpoint: DELETE /api/channels/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteChannel = (channelId: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Channel deleted successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.delete(`/api/channels/${channelId}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Sync channel videos
// Endpoint: POST /api/channels/:id/sync
// Request: {}
// Response: { success: boolean, message: string }
export const syncChannel = (channelId: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Channel sync started'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post(`/api/channels/${channelId}/sync`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};