import api from './api';

export interface Idea {
  _id: string;
  videoId: string;
  videoTitle: string;
  channelName: string;
  category: 'main-concept' | 'actionable-insight' | 'content-suggestion' | 'key-takeaway';
  title: string;
  description: string;
  tags: string[];
  rating: number;
  isFavorite: boolean;
  createdAt: string;
}

// Description: Get all ideas with filters
// Endpoint: GET /api/ideas
// Request: { videoId?: string, channelId?: string, category?: string, tags?: string[], search?: string, page?: number, limit?: number }
// Response: { ideas: Idea[], total: number, page: number, totalPages: number }
export const getIdeas = (filters: {
  videoId?: string;
  channelId?: string;
  category?: string;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
} = {}) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ideas: [
          {
            _id: '1',
            videoId: '1',
            videoTitle: 'The Future of AI in 2024: What You Need to Know',
            channelName: 'Tech Insights',
            category: 'main-concept',
            title: 'AI Ethics Framework',
            description: 'Establishing comprehensive ethical guidelines for AI development and deployment is crucial for responsible innovation.',
            tags: ['ethics', 'ai', 'framework', 'responsibility'],
            rating: 5,
            isFavorite: true,
            createdAt: '2024-01-10T11:00:00Z'
          },
          {
            _id: '2',
            videoId: '1',
            videoTitle: 'The Future of AI in 2024: What You Need to Know',
            channelName: 'Tech Insights',
            category: 'actionable-insight',
            title: 'Implement AI Governance',
            description: 'Organizations should establish AI governance committees to oversee AI initiatives and ensure compliance with ethical standards.',
            tags: ['governance', 'implementation', 'compliance'],
            rating: 4,
            isFavorite: false,
            createdAt: '2024-01-10T11:05:00Z'
          },
          {
            _id: '3',
            videoId: '1',
            videoTitle: 'The Future of AI in 2024: What You Need to Know',
            channelName: 'Tech Insights',
            category: 'content-suggestion',
            title: 'AI Tools Comparison Series',
            description: 'Create a series comparing different AI tools and their practical applications in various industries.',
            tags: ['content', 'comparison', 'tools', 'series'],
            rating: 4,
            isFavorite: true,
            createdAt: '2024-01-10T11:10:00Z'
          },
          {
            _id: '4',
            videoId: '2',
            videoTitle: 'Building Scalable Web Applications',
            channelName: 'Tech Insights',
            category: 'key-takeaway',
            title: 'Microservices Architecture Benefits',
            description: 'Breaking down monolithic applications into microservices improves scalability, maintainability, and team productivity.',
            tags: ['microservices', 'architecture', 'scalability'],
            rating: 5,
            isFavorite: false,
            createdAt: '2024-01-08T15:00:00Z'
          }
        ],
        total: 32,
        page: 1,
        totalPages: 4
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const params = new URLSearchParams();
  //   Object.entries(filters).forEach(([key, value]) => {
  //     if (value !== undefined) {
  //       if (Array.isArray(value)) {
  //         value.forEach(v => params.append(key, v));
  //       } else {
  //         params.append(key, value.toString());
  //       }
  //     }
  //   });
  //   return await api.get(`/api/ideas?${params.toString()}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Update idea rating
// Endpoint: PUT /api/ideas/:id/rating
// Request: { rating: number }
// Response: { success: boolean, message: string }
export const updateIdeaRating = (ideaId: string, rating: number) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Idea rating updated successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put(`/api/ideas/${ideaId}/rating`, { rating });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Toggle idea favorite status
// Endpoint: PUT /api/ideas/:id/favorite
// Request: { isFavorite: boolean }
// Response: { success: boolean, message: string }
export const toggleIdeaFavorite = (ideaId: string, isFavorite: boolean) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Idea favorite status updated successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put(`/api/ideas/${ideaId}/favorite`, { isFavorite });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Export ideas
// Endpoint: GET /api/ideas/export
// Request: { format: 'csv' | 'pdf', filters?: object }
// Response: { downloadUrl: string }
export const exportIdeas = (format: 'csv' | 'pdf', filters: object = {}) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        downloadUrl: `https://example.com/downloads/ideas-export.${format}`
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/ideas/export?format=${format}`, { params: filters });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};