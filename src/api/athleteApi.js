import api from '@/api/client';

/** Every /athelet endpoint the UI is allowed to call. */
const athleteApi = {
  getMyPerformanceLogs: (athleteId) =>
    api.get(`/athelet/viewDataPerformancelogAthid/${athleteId}`).then((r) => r.data),

  getWorkoutsByCoach: (coachId) =>
    api.get(`/athelet/viewDataWorkdrilByCoachid/${coachId}`).then((r) => r.data),
  getTodaysWorkouts: (coachId) =>
    api.get(`/athelet/viewDataWorkdrilByTodaysdateandCoachid/${coachId}`).then((r) => r.data),
  getWorkoutsBetween: (coachId, from, to) =>
    api.get(`/athelet/viewDataWorkdrilBydatetodate/${coachId}`, { params: { date: from, date2: to } })
      .then((r) => r.data),

  // Athlete id first, then work id - the backend route is /{aid}/{wid}.
  // Swapping these sends the work id where the athlete's own id is expected,
  // so AccessGuard.requireAccessToAthlete rejects it as unauthorized - which
  // is exactly what "athlete can't mark a drill complete" looks like.
  markWorkoutComplete: (athleteId, workId, status = 'Completed') =>
    api.put(`/athelet/updatePerformancelogs/${athleteId}/${workId}`, null, { params: { data: status } })
      .then((r) => r.data),

  submitComplaint: (athleteId, payload) =>
    api.post(`/athelet/viewDataFeedback/${athleteId}`, payload).then((r) => r.data),
  requestCoach: (athleteId, payload) =>
    api.post(`/athelet/addrequest/${athleteId}`, payload).then((r) => r.data),
  getMyCoachRequest: (athleteId) =>
    api.get(`/athelet/viewrequestbyathelet/${athleteId}`).then((r) => r.data),
};

export default athleteApi;
