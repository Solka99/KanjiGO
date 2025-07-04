import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert, FlatList, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { API_CONFIG } from '../apiConfig';

interface SavedKanji {
  kanji_id: number;
  character: string;
  meaning: string;
}

type Props = NativeStackScreenProps<RootStackParamList, 'MyKanjis'>;

const USER_ID_FOR_TEST = 1;

const NUM_COLUMNS = 3;
const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_MARGIN = 10;
const ITEM_PADDING = 10;
const ITEM_WIDTH = (SCREEN_WIDTH - (ITEM_PADDING * 2) - (ITEM_MARGIN * NUM_COLUMNS * 2)) / NUM_COLUMNS;

export default function MyKanjisScreen({ navigation }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [savedKanjis, setSavedKanjis] = useState<SavedKanji[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_CONFIG.my_kanjis}/${USER_ID_FOR_TEST}`);
        if (!response.ok) throw new Error('Failed to fetch saved kanji');
        const data = await response.json();
        setSavedKanjis(data);
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Could not load your saved kanji.");
      } finally {
        setIsLoading(false);
      }
    });
    return unsubscribe;
  }, [navigation]);

  // ★★★ ここが変更点：遷移先を 'MyKanjiDetail' に変更 ★★★
  const renderGridItem = ({ item }: { item: SavedKanji }) => (
    <TouchableOpacity 
      style={styles.gridItem}
      onPress={() => navigation.navigate('MyKanjiDetail', { kanji: item.character })}
    >
      <Text style={styles.kanjiChar}>{item.character}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kanjis</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <FontAwesome name="times" size={24} color="#BDBDBD" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={savedKanjis}
          renderItem={renderGridItem}
          keyExtractor={(item) => item.kanji_id.toString()}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.gridContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No kanji saved yet.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1E1E' },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
  },
  gridContainer: {
    padding: ITEM_PADDING,
  },
  gridItem: {
    width: ITEM_WIDTH,
    aspectRatio: 1,
    margin: ITEM_MARGIN,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kanjiChar: {
    color: 'white',
    fontSize: 48,
  },
  emptyText: {
    color: '#757575',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
});
