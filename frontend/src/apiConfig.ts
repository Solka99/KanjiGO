const NGROK_BASE_URL = 'https://8f57-202-18-108-163.ngrok-free.app'; 

export const API_CONFIG = {
  ocr: `${NGROK_BASE_URL}/uploadfile`,
  translate: `${NGROK_BASE_URL}/translate`,
  jisho: `${NGROK_BASE_URL}/jisho`,
  add_to_dictionary: `${NGROK_BASE_URL}/dictionary/add`, 
  kanjialive: `${NGROK_BASE_URL}/kanjialive`,
  quiz: `${NGROK_BASE_URL}/quiz`,
};