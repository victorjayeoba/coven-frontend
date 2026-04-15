import axios from "axios";

// Hits the backend directly. NEXT_PUBLIC_API_URL must include the /api suffix
// in production (e.g. https://coven-api.discretliaison.com/api).
// CORS + SameSite=None;Secure cookies are configured on the backend.
const baseURL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});
