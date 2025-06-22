import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { API_CONFIG } from '../apiConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'Selection'>;

export default function SelectionScreen({ route, navigation }: Props) {
  const { recognizedCharacters } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [translation, setTranslation] = useState('');
  const [kanjiList, setKanjiList] = useState<string[]>([]);
  const originalText = recognizedCharacters.join('');

  const filterKanji = (chars: string[]) => {
    const kanjiRegex = /[\u4e00-\u9faf\u3400-\u4dbf]/;
    const uniqueKanji = new Set<string>();
    chars.forEach(char => {
      if (kanjiRegex.test(char)) {
        uniqueKanji.add(char);
      }
    });
    return Array.from(uniqueKanji);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setKanjiList(filterKanji(recognizedCharacters));

      if (originalText.trim() === '') {
          setTranslation(''); // 空の場合はAPIを呼ばずに終了
          setIsLoading(false);
          return;
      }

      try {
        const encodedText = encodeURIComponent(originalText);
        const response = await fetch(`${API_CONFIG.translate}/${encodedText}`);
        if (!response.ok) throw new Error('Translation API error');
        
        const data = await response.json();
        setTranslation(data.translated_text);

      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to get translation.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [originalText]);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <FontAwesome name="times" size={24} color="white" />
      </TouchableOpacity>
      
      {isLoading ? (
        <ActivityIndicator size="large" color="#ffffff" />
      ) : (
        <View style={styles.content}>
          <View style={styles.translationCard}>
            <Text style={styles.originalText}>{originalText || '(No text recognized)'}</Text>
            <Text style={styles.translatedText}>{translation}</Text>
          </View>

          <Text style={styles.selectionTitle}>Select the kanji you want to learn</Text>
          <View style={styles.kanjiContainer}>
            {kanjiList.length > 0 ? (
              kanjiList.map((kanji, index) => (
                <TouchableOpacity key={index} style={styles.kanjiButton}>
                  <Text style={styles.kanjiText}>{kanji}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noKanjiText}>No kanji found to select.</Text>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#212121', alignItems: 'center', justifyContent: 'center' },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 1 },
  content: { width: '100%', alignItems: 'center', paddingTop: 80, paddingHorizontal: 20 },
  translationCard: { backgroundColor: '#424242', borderRadius: 12, padding: 20, width: '90%', alignItems: 'center', minHeight: 90 },
  originalText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  translatedText: { color: '#BDBDBD', fontSize: 18, marginTop: 8 },
  selectionTitle: { color: 'white', fontSize: 16, marginTop: 40, marginBottom: 20 },
  kanjiContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '90%' },
  kanjiButton: { backgroundColor: '#616161', borderRadius: 10, width: 80, height: 80, justifyContent: 'center', alignItems: 'center', margin: 10 },
  kanjiText: { color: 'white', fontSize: 36, fontWeight: 'bold' },
  noKanjiText: { color: '#BDBDBD', fontStyle: 'italic' },
});