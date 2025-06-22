import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { API_CONFIG } from '../apiConfig'; // ← 変更なし（apiConfigを読み込む）

// APIから受け取るデータの型を定義
interface KanjiData {
  word: string;
  reading: string;
  definitions: string[][];
}

type Props = NativeStackScreenProps<RootStackParamList, 'KanjiDetail'>;

export default function KanjiDetailScreen({ route, navigation }: Props) {
  const { kanji } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [kanjiData, setKanjiData] = useState<KanjiData | null>(null);

  useEffect(() => {
    const fetchKanjiData = async () => {
      setIsLoading(true);
      try {
        const encodedKanji = encodeURIComponent(kanji);
        
        // ★★★ apiConfigから直接jishoのURLを使うように変更 ★★★
        const response = await fetch(`${API_CONFIG.jisho}/${encodedKanji}`);
        
        if (!response.ok) {
          throw new Error('Jisho API error');
        }
        const data = await response.json();
        setKanjiData(data);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to get Kanji data.');
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };
    fetchKanjiData();
  }, [kanji]);

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#ffffff" />;
    }
    if (!kanjiData) {
      return <Text style={styles.errorText}>No data found.</Text>;
    }

    return (
      <ScrollView style={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{kanjiData.word}</Text>
          <View>
            <Text style={styles.readingText}>Kun: {kanjiData.reading}</Text>
            <Text style={styles.readingText}>On: </Text>
          </View>
        </View>
        
        {/* Definitions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Definitions</Text>
          {kanjiData.definitions.flat().map((def, index) => (
            <View key={index} style={styles.definitionItem}>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.definitionText}>{def}</Text>
            </View>
          ))}
        </View>

        {/* Add Button */}
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Kanji</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <FontAwesome name="times" size={24} color="white" />
      </TouchableOpacity>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#212121', paddingHorizontal: 15 },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 1 },
  scrollContainer: { marginTop: 80 },
  errorText: { color: 'red', textAlign: 'center', marginTop: 100 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  headerTitle: { color: 'white', fontSize: 80, fontWeight: 'bold', marginRight: 20 },
  readingText: { color: 'white', fontSize: 18, marginBottom: 5 },
  section: { marginBottom: 30 },
  sectionTitle: { color: '#BDBDBD', fontSize: 16, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#424242', paddingBottom: 5 },
  definitionItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  dot: { color: 'white', marginRight: 10, fontSize: 16 },
  definitionText: { color: 'white', fontSize: 16, flex: 1 },
  addButton: { backgroundColor: '#616161', borderRadius: 10, paddingVertical: 15, justifyContent: 'center', alignItems: 'center', marginVertical: 20 },
  addButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});