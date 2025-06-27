import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView, 
  Alert, 
  ScrollView 
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { SvgUri } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// These files are assumed to be correctly located in your project
import { RootStackParamList } from '../../App';
import { API_CONFIG } from '../apiConfig';

// --- Type definition matching the successful API response ---
interface Word {
  word: string;
  reading: string;
  meaning: string;
}

interface KanjiAliveData {
  kanji: string;
  meaning: string;
  strokes: number;
  onyomi: { katakana: string; romaji: string; };
  kunyomi: { hiragana: string; romaji: string; };
  radical: { character: string; name: { hiragana: string; }; };
  stroke_order: { image: string; };
  words: Word[];
}

type Props = NativeStackScreenProps<RootStackParamList, 'KanjiDetail'>;

// --- Reusable Section Title Component ---
const SectionTitle = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

export default function KanjiDetailScreen({ route, navigation }: Props) {
  const { kanji } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [kanjiData, setKanjiData] = useState<KanjiAliveData | null>(null);

  // --- Data fetching logic ---
  useEffect(() => {
    const fetchKanjiData = async () => {
      setIsLoading(true);
      try {
        const encodedKanji = encodeURIComponent(kanji);
        const response = await fetch(`${API_CONFIG.kanjialive}/${encodedKanji}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API Error ${response.status}: ${errorData.detail || 'Failed to fetch data'}`);
        }
        
        const data: KanjiAliveData = await response.json();
        setKanjiData(data);
      } catch (error) {
        console.error("Failed to fetch Kanji data:", error);
        Alert.alert('Error', (error as Error).message);
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };

    fetchKanjiData();
  }, [kanji]);

  // --- Helper function to generate stroke image URLs ---
  const generateStrokeImageUris = () => {
    if (!kanjiData || !kanjiData.stroke_order?.image || !kanjiData.strokes) {
      return [];
    }
    const baseUrl = kanjiData.stroke_order.image.replace(/_\d+\.svg$/, '');
    return Array.from({ length: kanjiData.strokes }, (_, i) => `${baseUrl}_${i + 1}.svg`);
  };

  // --- Loading State UI ---
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#ffffff" style={styles.centered} />
      </SafeAreaView>
    );
  }

  // --- Data Fetching Failed UI ---
  if (!kanjiData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
            <Text style={styles.errorText}>No data found.</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const strokeImageUris = generateStrokeImageUris();

  // --- Main Content UI ---
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <FontAwesome name="times" size={24} color="white" />
      </TouchableOpacity>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header Section (Kanji, Meaning, Readings) */}
        <View style={styles.header}>
          <View>
            <Text style={styles.meaningText}>{kanjiData.meaning}</Text>
            <Text style={styles.kanjiChar}>{kanjiData.kanji}</Text>
          </View>
          <View style={styles.readingContainer}>
            <Text style={styles.readingLabel}>Kun</Text>
            <Text style={styles.readingText}>{kanjiData.kunyomi.hiragana}</Text>
            <Text style={styles.readingLabel}>On</Text>
            <Text style={styles.readingText}>{kanjiData.onyomi.katakana}</Text>
          </View>
        </View>

        {/* Stroke Order Section */}
        <SectionTitle title="Stroke Order" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {strokeImageUris.map((uri, index) => (
            <View key={index} style={styles.strokeBox}>
              <SvgUri width="80%" height="80%" uri={uri} />
            </View>
          ))}
        </ScrollView>
        <Text style={styles.detailText}>
          {kanjiData.strokes} strokes, Radical: {kanjiData.radical.character} ({kanjiData.radical.name.hiragana})
        </Text>

        {/* Words Section */}
        {kanjiData.words && kanjiData.words.length > 0 && (
          <View style={styles.section}>
            <SectionTitle title="関連単語" />
            {kanjiData.words.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.itemJapanese}>
                  {item.word} <Text style={styles.itemReading}>【{item.reading}】</Text>
                </Text>
                <Text style={styles.itemMeaning}>{item.meaning}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Kanji Button (fixed at the bottom) */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Kanji</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 120 },
  errorText: { color: 'red', fontSize: 18, marginBottom: 20 },
  backButtonText: { color: '#007AFF', fontSize: 16 },

  header: { flexDirection: 'row', alignItems: 'center', marginTop: 70, marginBottom: 20 },
  meaningText: { color: '#BDBDBD', fontSize: 24 },
  kanjiChar: { color: 'white', fontSize: 100, fontWeight: 'bold' },
  readingContainer: { marginLeft: 24, alignSelf: 'center' },
  readingLabel: { color: '#BDBDBD', fontSize: 16 },
  readingText: { color: 'white', fontSize: 28, fontWeight: '500', marginBottom: 8 },

  sectionTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginTop: 30, marginBottom: 15, borderBottomColor: '#333', borderBottomWidth: 1, paddingBottom: 8 },
  
  strokeBox: { width: 80, height: 80, backgroundColor: '#FFFFFF', borderRadius: 8, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  detailText: { color: '#BDBDBD', fontSize: 16, marginTop: 10 },

  section: { marginTop: 10 },
  listItem: { paddingVertical: 15, borderBottomColor: '#2C2C2E', borderBottomWidth: 1 },
  itemJapanese: { color: 'white', fontSize: 22, fontWeight: '500', marginBottom: 5 },
  itemReading: { color: '#8E8E93', fontSize: 16 },
  itemMeaning: { color: '#BDBDBD', fontSize: 16, lineHeight: 22 },

  addButtonContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 40, backgroundColor: '#121212' },
  addButton: { backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 16, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: 'black', fontSize: 18, fontWeight: 'bold' },
});
