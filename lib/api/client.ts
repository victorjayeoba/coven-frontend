import axios from "axios";

// Always go through Next.js's own /api proxy. The rewrite in next.config.js
// forwards every /api/* request to the real backend (BACKEND_URL env var).
// This keeps cookies first-party — no cross-domain session breakage.
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});
