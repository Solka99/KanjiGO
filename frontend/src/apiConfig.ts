// ngrokを再起動したら、この行のURLだけを書き換えます。
const BASE_URL = 'https://99d055323a7f.ngrok-free.app'; 

export const API_CONFIG = {
  // Static endpoints
  ocr: `${BASE_URL}/uploadfile`,
  addKanji: `${BASE_URL}/dictionary_entries/add_kanji`,
  login: `${BASE_URL}/auth/jwt/login`,
  logout: `${BASE_URL}/auth/jwt/logout`,
  getCurrentUser: `${BASE_URL}/auth/users/me`,
  getRanking: `${BASE_URL}/ranking`,
  register: `${BASE_URL}/auth/register`, // ← この行を追加

  // Dynamic endpoints requiring parameters (as functions)
  translate: (text: string) => `${BASE_URL}/translate/${text}`,
  kanjialive: (kanji_char: string) => `${BASE_URL}/kanjialive/${kanji_char}`,
  quiz: (quiz_type: string, kanji_char: string) => `${BASE_URL}/quiz/${quiz_type}/${kanji_char}`,
  getUserKanji: (user_id: number) => `${BASE_URL}/my-kanjis/${user_id}`,
  addPoints: (user_id: number) => `${BASE_URL}/users/${user_id}/add-points`,
};