import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert, FlatList, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList } from '../../App';
import { API_CONFIG } from '../apiConfig';

interface SavedKanji {
  kanji_id: number;
  character: string;
  meaning: string;
}

type Props = NativeStackScreenProps<RootStackParamList, 'MyKanjis'>;

const NUM_COLUMNS = 3;
const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_MARGIN = 10;
const ITEM_PADDING = 10;
const ITEM_WIDTH = (SCREEN_WIDTH - (ITEM_PADDING * 2) - (ITEM_MARGIN * NUM_COLUMNS * 2)) / NUM_COLUMNS;

export default function MyKanjisScreen({ navigation }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [savedKanjis, setSavedKanjis] = useState<SavedKanji[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchSavedKanjis = async () => {
        setIsLoading(true);
        try {
          const token = await AsyncStorage.getItem('access_token');
          if (!token) throw new Error("Please log in first.");
          
          const userRes = await fetch(API_CONFIG.getCurrentUser, { headers: { Authorization: `Bearer ${token}` } });
          if (!userRes.ok) throw new Error("Could not verify user.");
          const user = await userRes.json();

          // ★★★ ここが変更点：Authorizationヘッダーを追加 ★★★
          const response = await fetch(API_CONFIG.getUserKanji(user.id), {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (!response.ok) throw new Error('Failed to fetch saved kanji');
          
          const data = await response.json();
          setSavedKanjis(data);
        } catch (error) {
          console.error(error);
          Alert.alert("Error", (error as Error).message);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchSavedKanjis();
    }, [])
  );

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kanjis</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <FontAwesome name="times" size={24} color="#BDBDBD" />
        </TouchableOpacity>
      </View>

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
