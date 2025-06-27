const NGROK_BASE_URL = 'https://e4f9-202-18-108-163.ngrok-free.app'; 

export const API_CONFIG = {
  ocr: `${NGROK_BASE_URL}/uploadfile`,
  translate: `${NGROK_BASE_URL}/translate`,
  jisho: `${NGROK_BASE_URL}/jisho`,
  add_to_dictionary: `${NGROK_BASE_URL}/dictionary/add`, // ← この行を追加
  kanjialive: `${NGROK_BASE_URL}/kanjialive`,
};