-- database/schema/kanji_info_table.sql

-- 既存のテーブルを削除（注意: 本番環境では使用しないでください）
DROP TABLE IF EXISTS kanji_info;

-- kanji_infoテーブルの作成
CREATE TABLE kanji_info (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    username VARCHAR(100) NOT NULL,
    kanji_id INTEGER NOT NULL,
    kanji_character CHAR(1) NOT NULL,
    meaning TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 複合ユニーク制約（同一ユーザーが同じ漢字を重複登録できない）
    UNIQUE(user_id, kanji_character)
);

-- インデックスの作成（パフォーマンス向上）
CREATE INDEX idx_kanji_info_user_id ON kanji_info(user_id);
CREATE INDEX idx_kanji_info_character ON kanji_info(kanji_character);
CREATE INDEX idx_kanji_info_created_at ON kanji_info(created_at);

-- テスト用サンプルデータの挿入
INSERT INTO kanji_info (user_id, username, kanji_id, kanji_character, meaning) VALUES
(1, 'testuser', 1, '学', 'study, learning'),
(1, 'testuser', 2, '本', 'book, origin'),
(1, 'testuser', 3, '人', 'person'),
(2, 'alice', 1, '日', 'day, sun'),
(2, 'alice', 2, '月', 'month, moon');

-- テーブル構造の確認
\d kanji_info;

-- データ確認
SELECT * FROM kanji_info ORDER BY user_id, kanji_id;