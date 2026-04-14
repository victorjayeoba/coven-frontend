import { api } from "./client";

export type User = {
  id: string;
  email: string;
  created_at: string;
  preferences: {
    mode: "paper" | "live";
    conviction_threshold: number;
    max_position_usd: number;
    chains: string[];
    auto_exit: boolean;
  };
};

export async function signUp(email: string, password: string) {
  const { data } = await api.post<User>("/auth/signup", { email, password });
  return data;
}

export async function signIn(email: string, password: string) {
  const { data } = await api.post<User>("/auth/signin", { email, password });
  return data;
}

export async function logout() {
  await api.post("/auth/logout");
}

export async function me() {
  const { data } = await api.get<User>("/auth/me");
  return data;
}
