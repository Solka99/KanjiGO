import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { Feather, MaterialIcons, FontAwesome } from "@expo/vector-icons";

interface KanjiApiResponse {
  character: string;
  meaning: string;
  source: "cache" | "api";
  cached: boolean;
  kanjiId?: number;
  message?: string;
  error?: string;
}

interface UserKanjiData {
  userId: number;
  kanjiCount: number;
  kanji: Array<{
    kanji_id: number;
    kanji_character: string;
    meaning: string;
  }>;
}

const API_BASE_URL = "http://localhost:3000/api"; // 実際のバックエンドURL
const TEST_USER_ID = 1;
const TEST_USERNAME = "testuser";

const HomeScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiResult, setApiResult] = useState<KanjiApiResponse | null>(null);
  const [userKanji, setUserKanji] = useState<UserKanjiData | null>(null);
  const [inputKanji, setInputKanji] = useState("");
  const [showInput, setShowInput] = useState(false);

  // 健康チェック
  const checkAPIHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      Alert.alert("API Status", data.message);
    } catch (error) {
      Alert.alert("API Error", "バックエンドサーバーに接続できません");
    }
  };

  // 漢字をAPIから取得
  const fetchKanjiFromAPI = async (character: string) => {
    try {
      const url = `${API_BASE_URL}/kanji/${encodeURIComponent(
        character
      )}?userId=${TEST_USER_ID}&username=${TEST_USERNAME}`;
      console.log("🔍 Fetching:", url);

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  // カメラボタン（実際のAPI呼び出し）
  const handleKanjiPhotoPress = async () => {
    if (!inputKanji.trim()) {
      setShowInput(true);
      return;
    }

    setIsLoading(true);
    setApiResult(null);

    try {
      console.log(`🚀 Real API call for kanji: ${inputKanji}`);

      const result = await fetchKanjiFromAPI(inputKanji.trim());

      setApiResult(result);
      setInputKanji("");
      setShowInput(false);

      Alert.alert(
        result.cached ? "キャッシュから取得" : "新規取得完了",
        `漢字「${result.character}」\n意味: ${result.meaning}\n${
          result.message || ""
        }`
      );
    } catch (error: any) {
      console.error("❌ API Error:", error);
      setApiResult({
        character: inputKanji,
        meaning: "",
        source: "api",
        cached: false,
        error: error.message || "APIエラーが発生しました",
      });
      Alert.alert("エラー", error.message || "APIエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  // ランダム漢字テスト
  const handleRandomKanjiTest = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/kanji/random/test`);
      const data = await response.json();

      if (response.ok) {
        setApiResult({
          character: data.character,
          meaning: data.meaning,
          source: "api",
          cached: false,
        });
        Alert.alert("ランダム漢字", `${data.character}: ${data.meaning}`);
      }
    } catch (error) {
      Alert.alert("エラー", "ランダム漢字の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // ユーザーの漢字一覧取得
  const handleMyKanjisPress = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/user/${TEST_USER_ID}/kanji`
      );
      const data = await response.json();

      if (response.ok) {
        setUserKanji(data);
        Alert.alert(
          "マイ漢字",
          `登録済み漢字: ${data.kanjiCount}個\n${data.kanji
            .slice(0, 5)
            .map((k: any) => k.kanji_character)
            .join(", ")}${data.kanjiCount > 5 ? "..." : ""}`
        );
      }
    } catch (error) {
      Alert.alert("エラー", "マイ漢字の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizPress = () => {
    Alert.alert("Quiz", "クイズ機能は開発中です");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.userIcon} onPress={checkAPIHealth}>
            <Feather name="user" size={20} color="#666" />
          </TouchableOpacity>
          <View style={styles.indicators}>
            <View style={styles.indicator} />
            <View style={styles.indicator} />
          </View>
        </View>

        <Text style={styles.title}>Kanji Go</Text>
        <Text style={styles.subtitle}>Real API Integration</Text>
      </View>

      {/* 漢字入力フィールド */}
      {showInput && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>漢字を入力してください:</Text>
          <TextInput
            style={styles.textInput}
            value={inputKanji}
            onChangeText={setInputKanji}
            placeholder="例: 学"
            maxLength={1}
            autoFocus
          />
          <View style={styles.inputButtons}>
            <TouchableOpacity
              style={styles.inputButton}
              onPress={() => setShowInput(false)}
            >
              <Text style={styles.inputButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.inputButton, styles.primaryButton]}
              onPress={handleKanjiPhotoPress}
            >
              <Text style={[styles.inputButtonText, styles.primaryButtonText]}>
                検索
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Daily Challenge */}
      <View style={styles.dailyChallenge}>
        <Feather name="calendar" size={32} color="#333" />
        <View style={styles.challengeText}>
          <Text style={styles.challengeTitle}>Daily Challenge</Text>
          <Text style={styles.challengeContent}>
            Real API から漢字を学習しよう！
          </Text>
        </View>
      </View>

      {/* Ranking */}
      <View style={styles.ranking}>
        <FontAwesome name="trophy" size={32} color="#333" />
        <View style={styles.rankingText}>
          <Text style={styles.rankingTitle}>API Status</Text>
          <Text style={styles.rankingContent}>Backend: Connected</Text>
          <Text style={styles.rankingContent}>DB: PostgreSQL</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {/* Real API Kanji Search */}
        <TouchableOpacity
          style={[styles.actionButton, isLoading && styles.buttonDisabled]}
          onPress={() =>
            inputKanji.trim() ? handleKanjiPhotoPress() : setShowInput(true)
          }
          disabled={isLoading}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#333" />
          ) : (
            <Feather name="search" size={40} color="#333" />
          )}
          <Text style={styles.buttonText}>
            {isLoading ? "API呼び出し中..." : "Kanji Search (Real API)"}
          </Text>
        </TouchableOpacity>

        {/* Random Kanji Test */}
        <TouchableOpacity
          style={[styles.actionButton, styles.testButton]}
          onPress={handleRandomKanjiTest}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <MaterialIcons name="shuffle" size={40} color="#333" />
          <Text style={styles.buttonText}>Random Kanji Test</Text>
        </TouchableOpacity>

        {/* Quiz Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleQuizPress}
          activeOpacity={0.7}
        >
          <Feather name="edit" size={40} color="#333" />
          <Text style={styles.buttonText}>Quiz</Text>
        </TouchableOpacity>

        {/* My Kanjis Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleMyKanjisPress}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Feather name="book" size={40} color="#333" />
          <Text style={styles.buttonText}>
            My Kanjis ({userKanji?.kanjiCount || 0})
          </Text>
        </TouchableOpacity>
      </View>

      {/* API Result */}
      {apiResult && (
        <View style={styles.apiResult}>
          <Text style={styles.apiResultTitle}>
            🌐 Real API Response ({apiResult.source}):
          </Text>
          {apiResult.error ? (
            <Text style={styles.errorText}>{apiResult.error}</Text>
          ) : (
            <View style={styles.resultContent}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Character:</Text>
                <Text style={styles.kanjiChar}> {apiResult.character}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Meaning:</Text>
                <Text style={styles.resultValue}> {apiResult.meaning}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Source:</Text>
                <Text
                  style={[
                    styles.resultValue,
                    apiResult.cached && styles.cachedText,
                  ]}
                >
                  {apiResult.cached
                    ? " 🗄️ Database Cache"
                    : " 🌐 Kanji Alive API"}
                </Text>
              </View>
              {apiResult.kanjiId && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Kanji ID:</Text>
                  <Text style={styles.resultValue}> {apiResult.kanjiId}</Text>
                </View>
              )}
              {apiResult.message && (
                <Text style={styles.successMessage}>
                  ✅ {apiResult.message}
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* User Kanji List */}
      {userKanji && userKanji.kanjiCount > 0 && (
        <View style={styles.userKanjiContainer}>
          <Text style={styles.userKanjiTitle}>
            📚 My Kanji Collection ({userKanji.kanjiCount})
          </Text>
          <View style={styles.kanjiGrid}>
            {userKanji.kanji.slice(0, 10).map((kanji) => (
              <View key={kanji.kanji_id} style={styles.kanjiItem}>
                <Text style={styles.kanjiItemChar}>
                  {kanji.kanji_character}
                </Text>
                <Text style={styles.kanjiItemMeaning} numberOfLines={1}>
                  {kanji.meaning}
                </Text>
              </View>
            ))}
          </View>
          {userKanji.kanjiCount > 10 && (
            <Text style={styles.moreKanjiText}>
              ...and {userKanji.kanjiCount - 10} more
            </Text>
          )}
        </View>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <MaterialIcons name="cloud-sync" size={24} color="#2563eb" />
          <Text style={styles.loadingText}>Real API 呼び出し中...</Text>
        </View>
      )}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 24,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  userIcon: {
    width: 32,
    height: 32,
    backgroundColor: "#d1d5db",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  indicators: {
    flexDirection: "row",
    gap: 4,
  },
  indicator: {
    width: 8,
    height: 8,
    backgroundColor: "#9ca3af",
    borderRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#6b7280",
    marginTop: 4,
  },
  inputContainer: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    textAlign: "center",
    backgroundColor: "#f9fafb",
  },
  inputButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 12,
  },
  inputButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
  },
  inputButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  primaryButtonText: {
    color: "white",
  },
  dailyChallenge: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  challengeText: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ea580c",
    marginBottom: 4,
  },
  challengeContent: {
    color: "#6b7280",
  },
  ranking: {
    backgroundColor: "#fb923c",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  rankingText: {
    flex: 1,
  },
  rankingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  rankingContent: {
    color: "#374151",
    marginBottom: 2,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
    gap: 16,
  },
  actionButton: {
    backgroundColor: "#d1d5db",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  testButton: {
    backgroundColor: "#fef3c7",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    textAlign: "center",
  },
  apiResult: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  apiResultTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111827",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
  },
  resultContent: {
    gap: 8,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    minWidth: 80,
  },
  resultValue: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  kanjiChar: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  cachedText: {
    color: "#059669",
    fontWeight: "500",
  },
  successMessage: {
    color: "#059669",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
  },
  userKanjiContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userKanjiTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111827",
  },
  kanjiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  kanjiItem: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    minWidth: 60,
  },
  kanjiItemChar: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  kanjiItemMeaning: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 2,
  },
  moreKanjiText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },
  loadingContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: "#dbeafe",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#2563eb",
    fontSize: 14,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default HomeScreen;
