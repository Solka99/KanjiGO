import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;

export default function CameraScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo?.uri) {
        navigation.navigate('Preview', { photoUri: photo.uri });
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={'back'} ref={cameraRef} />
      {/* ↓ ボタンをCameraViewの外に出し、絶対座標で重ねる */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={takePicture}>
          <View style={styles.innerButton} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: 'black' },
  camera: { flex: 1 },
  buttonContainer: {
    // ↓ この部分が変更点
    position: 'absolute', // 親要素に対して絶対配置
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: { backgroundColor: 'white', borderRadius: 50, width: 70, height: 70, alignItems: 'center', justifyContent: 'center' },
  innerButton: { borderWidth: 2, borderColor: '#EFEFEF', borderRadius: 50, width: 60, height: 60, backgroundColor: 'white' },
});