import * as React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import SelectionScreen from './src/screens/SelectionScreen';
import KanjiDetailScreen from './src/screens/KanjiDetailScreen';

export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Preview: { photoUri: string };
  Selection: { recognizedCharacters: string[] };
  KanjiDetail: { kanji: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="Preview" component={PreviewScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Selection" component={SelectionScreen} options={{ presentation: 'modal', headerShown: false }}/>
          <Stack.Screen name="KanjiDetail" component={KanjiDetailScreen} options={{ presentation: 'modal', headerShown: false }}/>
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </View>
  );
}