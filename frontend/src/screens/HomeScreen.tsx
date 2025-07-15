import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../App';
import { API_CONFIG } from '../apiConfig';

// --- Type definitions ---
interface RankingInfo {
  rank: number;
  email: string;
  points: number;
}
interface RankingData {
  top_3: RankingInfo[];
  my_rank: RankingInfo;
}

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [isLoadingRanking, setIsLoadingRanking] = useState(true);

  // 画面が表示されるたびにランキングを再取得
  useFocusEffect(
    React.useCallback(() => {
      const fetchRanking = async () => {
        setIsLoadingRanking(true);
        try {
          const token = await AsyncStorage.getItem('access_token');
          if (!token) {
            navigation.replace('Login');
            return;
          };

          const response = await fetch(API_CONFIG.getRanking, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) throw new Error('Failed to fetch ranking');
          
          const data = await response.json();
          setRankingData(data);
        } catch (error) {
          console.error(error);
          setRankingData(null);
        } finally {
          setIsLoadingRanking(false);
        }
      };
      fetchRanking();
    }, [])
  );
  
  // ログアウト処理
  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      // バックエンドにログアウトを通知 (トークンを無効化リストに追加させるなど)
      await fetch(API_CONFIG.logout, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
        console.error("Logout API call failed, proceeding with client-side logout:", error);
    } finally {
        // バックエンドの成否に関わらず、スマホのトークンを削除してログイン画面に戻る
        await AsyncStorage.removeItem('access_token');
        navigation.replace('Login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity onPress={() => navigation.navigate('MyKanjis')}>
                <FontAwesome name="user-circle-o" size={28} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={{marginLeft: 15}}>
                <FontAwesome name="sign-out" size={28} color="#E53935" />
            </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Kanji Go</Text>
        <View style={{ width: 56 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <FontAwesome name="calendar" size={32} color="#555" />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Daily Challenge</Text>
            <Text style={styles.cardSubtitle}>xxxxxxxxxxxxxxxxxxxxxx</Text>
          </View>
        </View>

        <View style={[styles.card, styles.rankingCard]}>
          <FontAwesome name="trophy" size={36} color="white" />
          <View style={styles.cardTextContainer}>
            <Text style={[styles.cardTitle, styles.rankingCardTitle]}>Ranking</Text>
            {isLoadingRanking ? (
              <ActivityIndicator color="#ffffff" />
            ) : rankingData ? (
              <>
                {rankingData.top_3.map((item: RankingInfo) => (
                  <Text key={item.rank} style={styles.rankingCardSubtitle}>
                    {item.rank}. {item.email.split('@')[0]} - {item.points}
                  </Text>
                ))}
                {rankingData.my_rank.rank > 3 && (
                  <>
                    <Text style={styles.rankingCardSubtitle}>...</Text>
                    <Text style={styles.rankingCardSubtitle}>
                      {rankingData.my_rank.rank}. (You) - {rankingData.my_rank.points}
                    </Text>
                  </>
                )}
              </>
            ) : (
              <Text style={styles.rankingCardSubtitle}>Could not load ranking.</Text>
            )}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Camera')}
          >
            <FontAwesome name="camera" size={24} color="#333" />
            <Text style={styles.buttonText}>Kanji Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Quiz', {})}
          >
            <FontAwesome name="pencil" size={24} color="#333" />
            <Text style={styles.buttonText}>Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('MyKanjis')}
          >
            <FontAwesome name="book" size={24} color="#333" />
            <Text style={styles.buttonText}>My Kanjis</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: 'white' },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
    content: { flex: 1, paddingTop: 10 },
    card: { backgroundColor: 'white', borderRadius: 12, padding: 20, marginHorizontal: 20, marginVertical: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    rankingCard: { backgroundColor: '#f5a623', minHeight: 120, alignItems: 'flex-start' },
    cardTextContainer: { marginLeft: 15, flex: 1 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    rankingCardTitle: { color: 'white', marginBottom: 5 },
    cardSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
    rankingCardSubtitle: { fontSize: 14, color: 'white', marginTop: 2, fontWeight: '500' },
    buttonContainer: { marginTop: 20, paddingHorizontal: 40 },
    button: { backgroundColor: '#e0e0e0', paddingVertical: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
    buttonText: { marginLeft: 12, fontSize: 18, fontWeight: '500', color: '#333' },
});
