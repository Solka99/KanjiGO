import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'QuizResult'>;

const POINTS_PER_CORRECT_ANSWER = 50;

export default function QuizResultScreen({ route, navigation }: Props) {
  const { score, totalQuestions, returnTo } = route.params;
  
  const pointsEarned = score * POINTS_PER_CORRECT_ANSWER;

  const handleFinish = () => {
    if (returnTo) {
      // 戻り先が指定されている場合 (Practiceからの呼び出し)
      // クイズ結果画面とクイズ画面の2つを閉じて、指定された画面に戻る
      navigation.pop(2); 
    } else {
      // 戻り先が指定されていない場合 (HomeScreenからの呼び出し)
      // スタックの最初の画面（Home）に戻る
      navigation.popToTop();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={handleFinish}>
        <FontAwesome name="times" size={24} color="#757575" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Quiz complete!</Text>
        
        <View style={styles.iconContainer}>
            <FontAwesome name="trophy" size={80} color="#FFD700" />
        </View>

        <Text style={styles.scoreText}>{score}/{totalQuestions}</Text>
        <Text style={styles.correctText}>{score} correct questions</Text>

        <Text style={styles.pointsText}>+{pointsEarned} points earned</Text>
        
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  iconContainer: {
    marginBottom: 30,
  },
  scoreText: {
    color: 'white',
    fontSize: 56,
    fontWeight: 'bold',
  },
  correctText: {
    color: '#BDBDBD',
    fontSize: 18,
    marginBottom: 10,
  },
  pointsText: {
    color: '#4CAF50',
    fontSize: 22,
    fontWeight: '500',
    marginBottom: 50,
  },
  finishButton: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    width: 250,
    alignItems: 'center',
  },
  finishButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
