// ngrokを再起動したら、この行のURLだけを書き換えます。
// 注意: このURLの末尾にスラッシュ(/)は付けないでください。
const NGROK_BASE_URL = 'https://3a26-106-72-159-195.ngrok-free.app'; 

// 各APIのエンドポイントを定義します
export const API_CONFIG = {
  ocr: `${NGROK_BASE_URL}/uploadfile`,
  translate: `${NGROK_BASE_URL}/translate`,
  jisho: `${NGROK_BASE_URL}/jisho`, // ← この行を追加
};