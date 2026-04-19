import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  SafeAreaView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { COUNTRIES } from '../data/countries';

interface CreateCharacterScreenProps {
  onNext: (data: { name: string, country: string, position: string }) => void;
  onBack: () => void;
}

const POSITIONS = ['POR', 'DFC', 'LT', 'RT', 'MCD', 'MC', 'MD', 'MI', 'EXD', 'EXI', 'DC'];

export const CreateCharacterScreen: React.FC<CreateCharacterScreenProps> = ({ onNext, onBack }) => {
  const [name, setName] = useState('');
  const [country, setCountry] = useState<string | null>(null);
  const [position, setPosition] = useState<string | null>(null);

  const isNextDisabled = !name.trim() || !country || !position;

  return (
    <LinearGradient colors={['#0a2e14', '#15803d', '#78350f']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <ArrowLeft size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Crea tu futbolista</Text>
            <Text style={styles.subtitle}>Empieza tu carrera a los 18 años</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* SECTION 1: NAME */}
          <View style={styles.section}>
            <Text style={styles.label}>NOMBRE COMPLETO</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ej: Lucas García"
              placeholderTextColor="#71717a"
              maxLength={30}
              color="#fff"
            />
          </View>

          {/* SECTION 2: COUNTRY */}
          <View style={styles.section}>
            <Text style={styles.label}>PAÍS DE ORIGEN</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {COUNTRIES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.chip,
                    country === item.id && styles.chipSelected
                  ]}
                  onPress={() => setCountry(item.id)}
                >
                  <Text style={styles.flagText}>{item.flag}</Text>
                  <Text style={styles.chipText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* SECTION 3: POSITION */}
          <View style={styles.section}>
            <Text style={styles.label}>POSICIÓN</Text>
            <View style={styles.grid}>
              {POSITIONS.map((pos) => (
                <TouchableOpacity
                  key={pos}
                  style={[
                    styles.posChip,
                    position === pos && styles.chipSelected
                  ]}
                  onPress={() => setPosition(pos)}
                >
                  <Text style={[styles.posText, position === pos && styles.posTextSelected]}>{pos}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextBtn, isNextDisabled && styles.nextBtnDisabled]}
            disabled={isNextDisabled}
            onPress={() => onNext({ name, country: country!, position: position! })}
          >
            <Text style={styles.nextBtnText}>SIGUIENTE</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backBtn: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
  },
  horizontalScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSelected: {
    borderColor: '#fbbf24',
    backgroundColor: 'rgba(251,191,36,0.15)',
  },
  flagText: {
    fontSize: 22,
    marginRight: 8,
  },
  chipText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  posChip: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  posText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  posTextSelected: {
    color: '#fbbf24',
  },
  footer: {
    padding: 24,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  nextBtn: {
    backgroundColor: '#fbbf24',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  nextBtnDisabled: {
    opacity: 0.4,
  },
  nextBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
