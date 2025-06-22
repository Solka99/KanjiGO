// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL接続設定
const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

const pool = new Pool(dbConfig);

// Kanji Alive API設定
const API_KEY = process.env.KANJI_ALIVE_API_KEY;
const API_HOST = "kanjialive-api.p.rapidapi.com";

// --- API エンドポイント ---

// 健康チェック
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Kanji Go API Server is running" });
});

// 漢字情報取得（キャッシュ機能付き）
app.get("/api/kanji/:character", async (req, res) => {
  const { character } = req.params;
  const userId = req.query.userId || 1; // 仮のユーザーID
  const username = req.query.username || "testuser"; // 仮のユーザー名

  try {
    // 漢字バリデーション
    const kanjiPattern = /^[一-龯]$/;
    if (!kanjiPattern.test(character)) {
      return res.status(400).json({ error: "漢字一文字を入力してください" });
    }

    const client = await pool.connect();

    try {
      // ローカルDBで既存データをチェック
      const checkResult = await client.query(
        "SELECT * FROM kanji_info WHERE user_id = $1 AND kanji_character = $2",
        [userId, character]
      );

      if (checkResult.rows.length > 0) {
        // キャッシュヒット
        console.log(`✅ Cache HIT for kanji: ${character}`);
        return res.json({
          character: checkResult.rows[0].kanji_character,
          meaning: checkResult.rows[0].meaning,
          source: "cache",
          cached: true,
          kanjiId: checkResult.rows[0].kanji_id,
        });
      }

      // APIから取得
      console.log(`🔍 Cache MISS for kanji: ${character} - fetching from API`);
      const meaning = await fetchKanjiMeaning(character);

      if (!meaning) {
        return res
          .status(404)
          .json({ error: "漢字の意味を取得できませんでした" });
      }

      // 新しいkanji_idを生成
      const maxIdResult = await client.query(
        "SELECT MAX(kanji_id) as max_id FROM kanji_info WHERE user_id = $1",
        [userId]
      );
      const newKanjiId = (maxIdResult.rows[0].max_id || 0) + 1;

      // データベースに保存
      const insertQuery = `
                INSERT INTO kanji_info (user_id, username, kanji_id, kanji_character, meaning) 
                VALUES ($1, $2, $3, $4, $5)
            `;
      await client.query(insertQuery, [
        userId,
        username,
        newKanjiId,
        character,
        meaning,
      ]);

      console.log(`💾 Saved kanji to database: ${character}`);

      res.json({
        character,
        meaning,
        source: "api",
        cached: false,
        kanjiId: newKanjiId,
        message: "データベースに登録しました",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      error: "サーバーエラーが発生しました",
      details: error.message,
    });
  }
});

// ユーザーの漢字一覧取得
app.get("/api/user/:userId/kanji", async (req, res) => {
  const { userId } = req.params;

  try {
    const client = await pool.connect();

    try {
      const result = await client.query(
        "SELECT kanji_id, kanji_character, meaning FROM kanji_info WHERE user_id = $1 ORDER BY kanji_id",
        [userId]
      );

      res.json({
        userId: parseInt(userId),
        kanjiCount: result.rows.length,
        kanji: result.rows,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({
      error: "データベースエラーが発生しました",
      details: error.message,
    });
  }
});

// テスト用ランダム漢字取得
app.get("/api/kanji/random/test", async (req, res) => {
  const testKanji = [
    "学",
    "本",
    "人",
    "日",
    "大",
    "小",
    "中",
    "高",
    "新",
    "今",
  ];
  const randomKanji = testKanji[Math.floor(Math.random() * testKanji.length)];

  try {
    const meaning = await fetchKanjiMeaning(randomKanji);
    res.json({
      character: randomKanji,
      meaning: meaning || "Unknown",
      source: "random_test",
    });
  } catch (error) {
    res.status(500).json({ error: "ランダム漢字取得に失敗しました" });
  }
});

// --- Kanji Alive API呼び出し関数 ---
async function fetchKanjiMeaning(kanji) {
  const url = `https://${API_HOST}/api/public/kanji/${kanji}`;
  const options = {
    method: "GET",
    url: url,
    headers: {
      "x-rapidapi-key": API_KEY,
      "x-rapidapi-host": API_HOST,
    },
    timeout: 10000, // 10秒タイムアウト
  };

  try {
    console.log(`🌐 Fetching from Kanji Alive API: ${kanji}`);
    const response = await axios.request(options);
    return response.data.kanji.meaning.english;
  } catch (error) {
    console.error(
      "Kanji Alive API Error:",
      error.response ? `Status ${error.response.status}` : error.message
    );
    return null;
  }
}

// データベース接続テスト
async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("✅ Database connected:", result.rows[0].now);
    client.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
}

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 Kanji Go API Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Test API: http://localhost:${PORT}/api/kanji/学`);
  testDatabaseConnection();
});

module.exports = app;
