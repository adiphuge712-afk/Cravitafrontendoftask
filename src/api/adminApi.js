import api from '@/api/client';

/**
 * Every /admin endpoint the UI is allowed to call, in one place.
 *
 * Pages import these functions instead of writing URLs inline, so a route
 * change on the backend is a one-line edit here rather than a hunt through
 * components (DIP: pages depend on this abstraction, not on axios).
 */
const adminApi = {
  getAthletes: () => api.get('/admin/viewDataAthlet').then((r) => r.data),
  getCoaches: () => api.get('/admin/viewDataCoach').then((r) => r.data),
  getCoach: (coachId) => api.get(`/admin/viewDataCoach/${coachId}`).then((r) => r.data),
  updateCoach: (coachId, payload) => api.put(`/admin/viewDataCoach/${coachId}`, payload).then((r) => r.data),
  deleteCoach: (coachId) => api.delete(`/admin/viewDataCoach/${coachId}`).then((r) => r.data),
  registerCoach: (adminId, payload) => api.post(`/admin/registercoach/${adminId}`, payload).then((r) => r.data),
  assignCoach: (payload) => api.post('/admin/AssigendCoach', payload).then((r) => r.data),

  getPerformanceLogs: () => api.get('/admin/viewDataPerformancelog').then((r) => r.data),
  getFeedback: () => api.get('/admin/viewDataFeedback').then((r) => r.data),
  getCoachRequests: () => api.get('/admin/viewrequest').then((r) => r.data),
  getTrainingPlans: () => api.get('/admin/viewDataTraningplan').then((r) => r.data),
  getWorkouts: () => api.get('/admin/viewDataWorkdril').then((r) => r.data),
};

export default adminApi;
