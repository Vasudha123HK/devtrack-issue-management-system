import api from './api';

export const dashboardService = {
  // Get aggregated dashboard statistics
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};
