import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList } from '../../App';
import { API_CONFIG } from '../apiConfig';

// --- Type definitions ---
interface QuizQuestion {
  type: string;
  question: string;
  options: string[];
  answer: string;
}
interface SavedKanji {
  character: string;
  kanji_id: number;
  meaning: string;
}

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

// 配列をシャッフルするためのヘルパー関数
const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function QuizScreen({ route, navigation }: Props) {
  // 前の画面から、練習したい漢字のリスト(kanjiList)と戻り先(returnTo)を受け取る
  const { kanjiList, returnTo } = route.params;
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const quizTypes = ['meaning', 'reading', 'reading_to_kanji'];

  useFocusEffect(
    useCallback(() => {
      const initializeQuiz = async () => {
        setIsLoading(true);
        try {
          const token = await AsyncStorage.getItem('access_token');
          if (!token) throw new Error("Please log in first.");

          let selectedKanji: string[];

          // ★★★ ここからが変更点：動作を切り替えるロジック ★★★
          if (kanjiList && kanjiList.length > 0) {
            // --- Practiceモード ---
            // MyKanjiDetailScreenから渡された漢字リストを使用する
            selectedKanji = kanjiList;
          } else {
            // --- 通常のQuizモード ---
            // 1. ログインユーザーの情報を取得
            const userRes = await fetch(API_CONFIG.getCurrentUser, { headers: { Authorization: `Bearer ${token}` } });
            if (!userRes.ok) throw new Error("Could not verify user.");
            const user = await userRes.json();

            // 2. ユーザーが保存した全漢字を取得
            const userKanjiRes = await fetch(API_CONFIG.getUserKanji(user.id), {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (!userKanjiRes.ok) throw new Error("Failed to fetch saved kanji");
            const allSavedKanji: SavedKanji[] = await userKanjiRes.json();
            
            // 3. 4つ以上ないとクイズが作れないためチェック
            if (allSavedKanji.length < 4) {
              Alert.alert("Not Enough Kanji", "You need at least 4 kanji in your dictionary to take a quiz.", [{ text: "OK", onPress: () => navigation.goBack() }]);
              return;
            }

            // 4. 全漢字の中からランダムに3つ選ぶ
            const shuffled = shuffleArray(allSavedKanji);
            selectedKanji = shuffled.slice(0, 3).map(k => k.character);
          }

          // --- 共通のクイズ生成ロジック ---
          const questionPromises = selectedKanji.map((kanji, index) => {
            // Practiceモードの場合は、可能な限り違うタイプの問題にする
            const shuffledTypes = shuffleArray(quizTypes);
            const type = shuffledTypes[index % shuffledTypes.length];

            return fetch(API_CONFIG.quiz(type, kanji), {
              headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                if (!res.ok) throw new Error(`Quiz fetch failed for ${kanji}`);
                return res.json();
            });
          });
          
          const fetchedQuestions = await Promise.all(questionPromises);
          setQuestions(fetchedQuestions);
          // ★★★ ここまでが変更点 ★★★

        } catch (error) {
          console.error("Failed to initialize quiz:", error);
          Alert.alert("Error", (error as Error).message, [{ text: "OK", onPress: () => navigation.goBack() }]);
        } finally {
          setIsLoading(false);
        }
      };

      initializeQuiz();

      // クリーンアップ関数
      return () => {
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setScore(0);
        setIsLoading(true);
      };
    }, [kanjiList]) // kanjiListの変更を検知して再実行
  );
  
  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);
  const totalQuestions = questions.length;

  const handleAnswerPress = (option: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(option);
    if (option === currentQuestion.answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextPress = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
    } else {
      navigation.navigate('QuizResult', { 
        score: score, 
        totalQuestions: totalQuestions,
        returnTo: returnTo
      });
    }
  };

  const getOptionStyle = (option: string) => {
    if (!isAnswered) return styles.optionButton;
    if (option === currentQuestion.answer) return [styles.optionButton, styles.correctOption];
    if (option === selectedAnswer) return [styles.optionButton, styles.incorrectOption];
    return styles.optionButton;
  };

  if (isLoading) {
    return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color="#fff" /></SafeAreaView>;
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.questionText}>Loading questions...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="times" size={24} color="#757575" />
        </TouchableOpacity>
        <Text style={styles.progressText}>{currentQuestionIndex + 1} / {totalQuestions}</Text>
      </View>
      
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity 
            key={index} 
            style={getOptionStyle(option)}
            onPress={() => handleAnswerPress(option)}
            disabled={isAnswered}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isAnswered && (
        <View style={styles.footer}>
            <TouchableOpacity style={styles.nextButton} onPress={handleNextPress}>
                <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressText: { color: '#757575', fontSize: 16 },
  questionContainer: { flex: 3, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 },
  questionText: { color: 'white', fontSize: 26, textAlign: 'center', fontWeight: 'bold' },
  optionsContainer: { flex: 4, justifyContent: 'center' },
  optionButton: { backgroundColor: '#2C2C2E', borderRadius: 12, paddingVertical: 16, marginBottom: 12, alignItems: 'center' },
  correctOption: { backgroundColor: '#4CAF50' },
  incorrectOption: { backgroundColor: '#F44336' },
  optionText: { color: 'white', fontSize: 20, fontWeight: '500' },
  footer: { flex: 1, justifyContent: 'flex-end', paddingBottom: 10 },
  nextButton: { backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  nextButtonText: { color: 'black', fontSize: 18, fontWeight: 'bold' },
});
