import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, UserPlus } from 'lucide-react-native';
import { useGameStore } from '../store/gameStore';
import { TEAMS } from '../data/leagues';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  onStart: () => void;
  onNewGame: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStart, onNewGame }) => {
  const [hasSave, setHasSave] = useState<boolean | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { player, hasSavedGame } = useGameStore();

  useEffect(() => {
    checkSave();
  }, []);

  const checkSave = async () => {
    const exists = await hasSavedGame();
    setHasSave(exists);
  };

  const handleNewGame = async () => {
    if (hasSave) {
      setShowConfirmModal(true);
    } else {
      onNewGame();
    }
  };

  const handleConfirmNewGame = async () => {
    setShowConfirmModal(false);
    onNewGame();
  };

  const handleContinue = () => {
    onStart();
  };

  if (hasSave === null) {
    return (
      <LinearGradient
        colors={['#0a2e14', '#15803d', '#78350f']}
        style={styles.container}
      />
    );
  }

  const teamName = TEAMS.find(t => t.id === player.teamId)?.name || 'Sin equipo';

  return (
    <LinearGradient
      colors={['#0a2e14', '#15803d', '#78350f']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* LOGO SECTION */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={{ fontSize: 80 }}>⚽</Text>
            </View>
            <Text style={styles.title}>FOOTBALLERLIFE</Text>
            <Text style={styles.tagline}>Vive tu carrera</Text>
          </View>

          <View style={styles.middleSpacer} />

          {/* ACTIONS SECTION */}
          <View style={styles.actions}>
            {hasSave && (
              <TouchableOpacity 
                style={styles.continueCard} 
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <View style={styles.playIconContainer}>
                  <Play size={28} color="#fbbf24" fill="#fbbf24" />
                </View>
                <View style={styles.saveInfo}>
                  <Text style={styles.continueLabel}>CONTINUAR CARRERA</Text>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerStats}>Edad {player.age} • {teamName}</Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.newGameBtn} 
              onPress={handleNewGame}
              activeOpacity={0.9}
            >
              <UserPlus size={22} color="#000" style={{ marginRight: 10 }} />
              <Text style={styles.newGameText}>NUEVA PARTIDA</Text>
            </TouchableOpacity>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>v1.0.0 • Made by Gabri</Text>
          </View>
        </View>

        {/* CONFIRM NEW GAME MODAL */}
        <Modal
          visible={showConfirmModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowConfirmModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalIcon}>⚠️</Text>
              <Text style={styles.modalTitle}>¿Nueva partida?</Text>
              <Text style={styles.modalSubtitle}>
                Perderás todo tu progreso actual.{"\n"}Esta acción no se puede deshacer.
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.cancelBtn]} 
                  onPress={() => setShowConfirmModal(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.confirmBtn]} 
                  onPress={handleConfirmNewGame}
                >
                  <Text style={styles.confirmBtnText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    marginBottom: 10,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
    textShadowColor: 'rgba(251, 191, 36, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 18,
    color: '#d1d5db',
    marginTop: 4,
    letterSpacing: 1,
    fontWeight: '300',
  },
  middleSpacer: {
    flex: 1,
  },
  actions: {
    width: '100%',
    gap: 16,
    marginBottom: 40,
  },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  playIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  saveInfo: {
    flex: 1,
  },
  continueLabel: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  playerName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  playerStats: {
    color: '#a1a1aa',
    fontSize: 14,
    marginTop: 2,
  },
  newGameBtn: {
    backgroundColor: '#fbbf24',
    flexDirection: 'row',
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  newGameText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footer: {
    marginBottom: 10,
  },
  footerText: {
    color: '#3f3f46',
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#18181b',
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  modalIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#a1a1aa',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#27272a',
  },
  confirmBtn: {
    backgroundColor: '#ef4444',
  },
  cancelBtnText: {
    color: '#a1a1aa',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
