import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import SelectionScreen from './src/screens/SelectionScreen';
import KanjiDetailScreen from './src/screens/KanjiDetailScreen'; // ← 追加

export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Preview: { photoUri: string };
  Selection: { recognizedCharacters: string[] };
  KanjiDetail: { kanji: string }; // ← 追加 (選択された漢字一文字を受け取る)
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* ... HomeScreen, CameraScreen, PreviewScreen, SelectionScreen の定義は変更なし ... */}
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Preview" component={PreviewScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Selection" component={SelectionScreen} options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen // ↓ 追加
          name="KanjiDetail"
          component={KanjiDetailScreen}
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}