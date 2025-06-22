import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import SelectionScreen from './src/screens/SelectionScreen';

// アプリ全体の画面一覧と、画面間で受け渡すパラメータの型を定義
export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Preview: { photoUri: string };
  Selection: { recognizedCharacters: string[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Camera" 
          component={CameraScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Preview" 
          component={PreviewScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="Selection" 
          component={SelectionScreen} 
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}