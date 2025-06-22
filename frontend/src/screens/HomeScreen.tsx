import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // App.tsxから型をインポート

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <FontAwesome name="user-circle-o" size={28} color="#333" />
        <Text style={styles.headerTitle}>Kanji Go</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <FontAwesome name="calendar" size={32} color="#555" />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Daily Challenge</Text>
            <Text style={styles.cardSubtitle}>xxxxxxxxxxxxxxxxxxxxxx</Text>
          </View>
        </View>

        <View style={[styles.card, styles.rankingCard]}>
          <FontAwesome name="trophy" size={36} color="white" />
          <View style={styles.cardTextContainer}>
            <Text style={[styles.cardTitle, styles.rankingCardTitle]}>Ranking</Text>
            <Text style={styles.rankingCardSubtitle}>@ana - 1097</Text>
            <Text style={styles.rankingCardSubtitle}>@john - 982</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Camera')}
          >
            <FontAwesome name="camera" size={24} color="#333" />
            <Text style={styles.buttonText}>Kanji Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <FontAwesome name="pencil" size={24} color="#333" />
            <Text style={styles.buttonText}>Quiz</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button}>
            <FontAwesome name="book" size={24} color="#333" />
            <Text style={styles.buttonText}>My Kanjis</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// スタイル定義 (完全版)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: 'white' },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
    content: { flex: 1, paddingTop: 10 },
    card: { backgroundColor: 'white', borderRadius: 12, padding: 20, marginHorizontal: 20, marginVertical: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    rankingCard: { backgroundColor: '#f5a623' },
    cardTextContainer: { marginLeft: 15, flex: 1 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    rankingCardTitle: { color: 'white' },
    cardSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
    rankingCardSubtitle: { fontSize: 14, color: 'white', marginTop: 2, fontWeight: '500' },
    buttonContainer: { marginTop: 20, paddingHorizontal: 40 },
    button: { backgroundColor: '#e0e0e0', paddingVertical: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
    buttonText: { marginLeft: 12, fontSize: 18, fontWeight: '500', color: '#333' },
});