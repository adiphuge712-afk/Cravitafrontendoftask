import api from '@/api/client';

/** Every /coach endpoint the UI is allowed to call. */
const coachApi = {
  getAthletes: () => api.get('/coach/viewDataAthlet').then((r) => r.data),
  getCoaches: () => api.get('/coach/viewDataCoach').then((r) => r.data),
  getMyAthletes: (coachId) => api.get(`/coach/viewDataAthletCoach/${coachId}`).then((r) => r.data),

  getTrainingPlans: (coachId) => api.get(`/coach/viewDataTraningplan/${coachId}`).then((r) => r.data),
  addTrainingPlan: (coachId, payload) => api.post(`/coach/addPlan/${coachId}`, payload).then((r) => r.data),
  updateTrainingPlan: (planId, payload) => api.put(`/coach/viewDataTraningplan/${planId}`, payload).then((r) => r.data),
  deleteTrainingPlan: (planId) => api.delete(`/coach/viewDataTraningplan/${planId}`).then((r) => r.data),

  addWorkout: (planId, payload) => api.post(`/coach/addwork/${planId}`, payload).then((r) => r.data),
  getWorkouts: (coachId) => api.get(`/coach/viewDataWorkdrilByCoachid/${coachId}`).then((r) => r.data),

  getPerformanceLogs: (coachId) => api.get(`/coach/viewDataPerformancelog/${coachId}`).then((r) => r.data),
  addPerformance: (athleteId, workId, payload) =>
    api.post(`/coach/addDataPerformancelog/${athleteId}/${workId}`, payload).then((r) => r.data),
  // Same athlete-first id order as addDataPerformancelog - the backend route is
  // /{athleteId}/{workId}, so swapping these silently writes the wrong row.
  updatePerformance: (athleteId, workId, payload) =>
    api.put(`/coach/updatePerformancelog/${athleteId}/${workId}`, payload).then((r) => r.data),

  getFeedback: (coachId) => api.get(`/coach/viewDataFeedback/${coachId}`).then((r) => r.data),
};

export default coachApi;
