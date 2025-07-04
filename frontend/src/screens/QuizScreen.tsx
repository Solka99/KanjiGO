import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { API_CONFIG } from '../apiConfig';

interface QuizQuestion {
  type: string;
  question: string;
  options: string[];
  answer: string;
}

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

export default function QuizScreen({ route, navigation }: Props) {
  const { kanjiList, returnTo } = route.params;
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const quizTypes = ['meaning', 'reading', 'reading_to_kanji'];

  useEffect(() => {
    const fetchAllQuestions = async () => {
      try {
        const fetchedQuestions: QuizQuestion[] = [];
        for (const kanji of kanjiList) {
          const randomType = quizTypes[Math.floor(Math.random() * quizTypes.length)];
          const response = await fetch(`${API_CONFIG.quiz}/${randomType}/${encodeURIComponent(kanji)}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch quiz for ${kanji}`);
          }
          const question = await response.json();
          fetchedQuestions.push(question);
        }
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
        <Text style={styles.questionText}>Could not load question. Please try again.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.nextButton}>
            <Text style={styles.nextButtonText}>Go Back</Text>
        </TouchableOpacity>
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
