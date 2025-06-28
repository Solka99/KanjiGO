import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { API_CONFIG } from '../apiConfig';

// APIから受け取るクイズの型
interface QuizQuestion {
  type: string;
  question: string;
  options: string[];
  answer: string;
}

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

export default function QuizScreen({ route, navigation }: Props) {
  const { kanjiList } = route.params;
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const quizTypes = ['meaning', 'reading', 'reading_to_kanji'];

  // 最初に全クイズデータを取得する
  useEffect(() => {
    const fetchAllQuestions = async () => {
      try {
        const questionPromises = kanjiList.map(kanji => {
          const randomType = quizTypes[Math.floor(Math.random() * quizTypes.length)];
          return fetch(`${API_CONFIG.quiz}/${randomType}/${encodeURIComponent(kanji)}`).then(res => {
            if (!res.ok) {
              throw new Error(`Failed to fetch quiz for ${kanji}`);
            }
            return res.json();
          });
        });
        const fetchedQuestions = await Promise.all(questionPromises);
        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error("Failed to fetch quiz questions:", error);
        Alert.alert("Error", "Could not load the quiz. Please try again later.", [{ text: "OK", onPress: () => navigation.goBack() }]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllQuestions();
  }, [kanjiList]);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);
  const totalQuestions = kanjiList.length;

  const handleAnswerPress = (option: string) => {
    if (isAnswered) return; // 一度回答したら変更不可
    
    setIsAnswered(true);
    setSelectedAnswer(option);
    if (option === currentQuestion.answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextPress = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      // 次の問題のために状態をリセット
      setIsAnswered(false);
      setSelectedAnswer(null);
    } else {
      // 全ての問題が終了したら、結果画面へスコア情報を渡して遷移
      navigation.navigate('QuizResult', { 
        score: score, 
        totalQuestions: totalQuestions 
      });
    }
  };

  // 選択肢ボタンのスタイルを動的に決める
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
        <Text style={styles.questionText}>Could not load question. Please try again.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.nextButton}>
            <Text style={styles.nextButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="times" size={24} color="#757575" />
        </TouchableOpacity>
        <Text style={styles.progressText}>{currentQuestionIndex + 1} / {totalQuestions}</Text>
      </View>
      
      {/* Question Area */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
      </View>

      {/* Options Area */}
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

      {/* Next Button */}
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