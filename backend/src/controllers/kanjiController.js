const pool = require("../config/database");

const kanjiController = {
  async getAllKanji(req, res) {
    try {
      const result = await pool.query("SELECT * FROM kanji_master LIMIT 50");
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getKanjiById(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query(
        "SELECT * FROM kanji_master WHERE id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Kanji not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = kanjiController;
