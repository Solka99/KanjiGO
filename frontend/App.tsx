import * as React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen'; // ← 新しい画面をインポート
import CameraScreen from './src/screens/CameraScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import SelectionScreen from './src/screens/SelectionScreen';
import KanjiDetailScreen from './src/screens/KanjiDetailScreen';
import QuizScreen from './src/screens/QuizScreen';
import QuizResultScreen from './src/screens/QuizResultScreen';
import MyKanjisScreen from './src/screens/MyKanjisScreen';
import MyKanjiDetailScreen from './src/screens/MyKanjiDetailScreen';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined; // ← 新しい画面の型定義を追加
  Camera: undefined;
  Preview: { photoUri: string };
  Selection: { recognizedCharacters: string[], photoUri: string };
  KanjiDetail: { kanji: string, photoUri: string };
  Quiz: { kanjiList?: string[], returnTo?: keyof RootStackParamList };
  QuizResult: { score: number; totalQuestions: number; returnTo?: keyof RootStackParamList; };
  MyKanjis: undefined;
  MyKanjiDetail: { kanji: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="Preview" component={PreviewScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Selection" component={SelectionScreen} options={{ presentation: 'modal', headerShown: false }}/>
          <Stack.Screen name="KanjiDetail" component={KanjiDetailScreen} options={{ presentation: 'modal', headerShown: false }}/>
          <Stack.Screen name="Quiz" component={QuizScreen} options={{ presentation: 'modal', headerShown: false }}/>
          <Stack.Screen name="QuizResult" component={QuizResultScreen} options={{ presentation: 'modal', headerShown: false }}/>
          <Stack.Screen name="MyKanjis" component={MyKanjisScreen} options={{ presentation: 'modal', headerShown: false }}/>
          <Stack.Screen name="MyKanjiDetail" component={MyKanjiDetailScreen} options={{ presentation: 'modal', headerShown: false }}/>
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </View>
  );
}
