import axios from "axios";

// Always go through Next.js's own /api proxy (next.config.js rewrite).
// Keeps cookies first-party so the browser actually persists them across
// navigations — no SameSite/3rd-party-blocking nightmare.
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});
