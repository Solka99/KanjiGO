export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api",
  GOOGLE_CLOUD_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY || "",
};

// src/types/index.ts
export interface User {
  id: string;
  email: string;
  username: string;
}

export interface Kanji {
  id: string;
  character: string;
  meaning: string;
  readings: string[];
}
