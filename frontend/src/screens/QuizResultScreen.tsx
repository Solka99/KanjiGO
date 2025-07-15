import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../App';
import { API_CONFIG } from '../apiConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'QuizResult'>;

const POINTS_PER_CORRECT_ANSWER = 50;

export default function QuizResultScreen({ route, navigation }: Props) {
  // 前の画面からスコア、問題数、戻り先情報を受け取る
  const { score, totalQuestions, returnTo } = route.params;
  
  // ポイントを計算する
  const pointsEarned = score * POINTS_PER_CORRECT_ANSWER;

  // ポイントをDBに保存する処理
  useEffect(() => {
    const savePoints = async () => {
      if (pointsEarned <= 0) return; // 0点なら何もしない
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) throw new Error("Could not find access token.");

        const userRes = await fetch(API_CONFIG.getCurrentUser, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        if (!userRes.ok) throw new Error("Could not verify user.");
        const user = await userRes.json();

        await fetch(API_CONFIG.addPoints(user.id), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ points: pointsEarned })
        });
      } catch (error) {
        console.error("Failed to save points:", error);
        // ここでのエラーはユーザー体験を損なわないよう、あえて通知しない
      }
    };
    savePoints();
  }, [pointsEarned]); // pointsEarnedが計算されたら一度だけ実行

  const handleFinish = () => {
    if (returnTo) {
      navigation.pop(2); 
    } else {
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
