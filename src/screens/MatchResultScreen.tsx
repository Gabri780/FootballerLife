import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useGameStore } from '../store/gameStore';

interface MatchResultScreenProps {
  matchResult: {
    homeGoals: number;
    awayGoals: number;
    homeId: string;
    awayId: string;
    playerGoals: number;
    playerAssists: number;
    playerRating: number;
  };
  onContinue: () => void;
}

export const MatchResultScreen = ({ matchResult, onContinue }: MatchResultScreenProps) => {
  const { teams, player } = useGameStore();

  const homeTeam = teams[matchResult.homeId] || { name: 'Local' };
  const awayTeam = teams[matchResult.awayId] || { name: 'Visitante' };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return '#22c55e';
    if (rating >= 7) return '#fbbf24';
    if (rating >= 6) return '#fff';
    return '#ef4444';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>RESULTADO</Text>
      </View>

      <View style={styles.scoreSection}>
        <View style={styles.teamScoreRow}>
          <Text style={styles.teamNameLeft}>{homeTeam.name}</Text>
          <Text style={styles.scoreNumber}>{matchResult.homeGoals}</Text>
          <Text style={styles.scoreSeparator}>-</Text>
          <Text style={styles.scoreNumber}>{matchResult.awayGoals}</Text>
          <Text style={styles.teamNameRight}>{awayTeam.name}</Text>
        </View>
        <Text style={styles.matchMeta}>Jornada Finalizada</Text>
      </View>

      <View style={styles.playerPerformanceSection}>
        <Text style={styles.sectionTitle}>TU ACTUACIÓN</Text>
        
        <View style={styles.performanceCard}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>⚽</Text>
              <Text style={styles.statValue}>{matchResult.playerGoals}</Text>
              <Text style={styles.statLabel}>GOLES</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>🅰️</Text>
              <Text style={styles.statValue}>{matchResult.playerAssists}</Text>
              <Text style={styles.statLabel}>ASISTENCIAS</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>⭐</Text>
              <Text style={[styles.statValue, { color: getRatingColor(matchResult.playerRating) }]}>
                {matchResult.playerRating.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>RATING</Text>
            </View>
          </View>

          {matchResult.playerRating >= 8.5 && (
            <View style={styles.mvpBanner}>
              <Text style={styles.mvpText}>⭐ MVP DEL PARTIDO</Text>
            </View>
          )}

          <View style={styles.chipsRow}>
            {matchResult.playerGoals >= 3 && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>⚽ HAT-TRICK</Text>
              </View>
            )}
            {matchResult.playerGoals === 2 && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>⚽ DOBLETE</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
        <Text style={styles.continueButtonText}>CONTINUAR</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  scoreSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  teamScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  teamNameLeft: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  teamNameRight: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'left',
  },
  scoreNumber: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
    width: 30,
    textAlign: 'center',
  },
  scoreSeparator: {
    color: '#3f3f46',
    fontSize: 30,
    fontWeight: 'bold',
  },
  matchMeta: {
    color: '#71717a',
    fontSize: 12,
    marginTop: 12,
  },
  playerPerformanceSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 16,
  },
  performanceCard: {
    backgroundColor: '#18181b',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
  },
  mvpBanner: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: '#fbbf24',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  mvpText: {
    color: '#fbbf24',
    fontWeight: 'bold',
    fontSize: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  chip: {
    backgroundColor: '#27272a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#a3e635',
    height: 60,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  continueButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
