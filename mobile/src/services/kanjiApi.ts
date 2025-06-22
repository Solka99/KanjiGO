import axios from "axios";
import { ENV } from "../../config/env";

const api = axios.create({
  baseURL: ENV.API_BASE_URL,
});

export const kanjiApi = {
  getAllKanji: () => api.get("/kanji"),
  getKanjiById: (id: string) => api.get(`/kanji/${id}`),
};
