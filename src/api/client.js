import axios from "axios";

const api = axios.create({
  baseURL:import.meta.env.VITE_API_URL,
});

// sessionStorage, not localStorage: localStorage is shared by every tab of
// this origin, so signing in as a different role in one tab overwrote the
// token every other open tab was reading, and that tab's next request would
// silently authenticate as whoever logged in most recently anywhere in the
// browser. sessionStorage is scoped to this one tab, so each tab keeps its
// own independent session and a logout in one tab cannot affect another.
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      sessionStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;