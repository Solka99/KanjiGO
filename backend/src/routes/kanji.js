const express = require("express");
const router = express.Router();
const kanjiController = require("../controllers/kanjiController");

router.get("/", kanjiController.getAllKanji);
router.get("/:id", kanjiController.getKanjiById);
router.post("/search", kanjiController.searchKanji);

module.exports = router;
