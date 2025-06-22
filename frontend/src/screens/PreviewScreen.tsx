import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { API_CONFIG } from '../apiConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

export default function PreviewScreen({ route, navigation }: Props) {
  const { photoUri } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string[] | null>(null);

  const handleRecognize = async () => {
    setIsLoading(true);
    setRecognizedText(null);

    const formData = new FormData();
    formData.append('file', {
      uri: photoUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as any);

    try {
      const response = await fetch(API_CONFIG.ocr, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const result = await response.json();
      setRecognizedText(result);

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to recognize characters. Please make sure the backend server is running correctly.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground source={{ uri: photoUri }} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <FontAwesome name="times" size={30} color="white" />
        </TouchableOpacity>

        <View style={styles.bottomContainer}>
          <View style={styles.resultContainer}>
            {isLoading && <ActivityIndicator size="large" color="#ffffff" />}
            {recognizedText && (
              <View style={styles.textResultWrapper}>
                <Text style={styles.recognizedChar}>{recognizedText.join('')}</Text>
              </View>
            )}
          </View>

          {!recognizedText ? (
            <TouchableOpacity style={styles.recognizeButton} onPress={handleRecognize} disabled={isLoading}>
              <Text style={styles.recognizeButtonText}>この文字を認識する</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.nextButton} 
              onPress={() => navigation.navigate('Selection', { recognizedCharacters: recognizedText })}
            >
              <Text style={styles.recognizeButtonText}>次へ</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 15,
  },
  bottomContainer: {
    padding: 20,
  },
  resultContainer: {
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  textResultWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
  },
  recognizedChar: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  recognizeButton: {
    backgroundColor: '#f5a623',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  recognizeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});