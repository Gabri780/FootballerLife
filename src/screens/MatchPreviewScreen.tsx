import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useGameStore, StandingRecord } from '../store/gameStore';
import { ArrowLeft, Play } from 'lucide-react-native';
import { LEAGUES } from '../data/leagues';

interface MatchPreviewScreenProps {
  onPlay: () => void;
  onBack: () => void;
}

export const MatchPreviewScreen = ({ onPlay, onBack }: MatchPreviewScreenProps) => {
  const { player, teams, schedules, standings, logs } = useGameStore();

  const weekIndex = player.matchesPlayed % 38;
  let playerMatch: { homeId: string; awayId: string } | null = null;
  let leagueId: string | null = null;

  for (const league of LEAGUES) {
    const weekMatches = schedules[league.id]?.[weekIndex];
    if (!weekMatches) continue;
    const match = weekMatches.find(m => m.homeTeamId === player.teamId || m.awayTeamId === player.teamId);
    if (match) {
      playerMatch = { homeId: match.homeTeamId, awayId: match.awayTeamId };
      leagueId = league.id;
      break;
    }
  }

  if (!playerMatch || !leagueId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noMatchContainer}>
          <Text style={styles.noMatchText}>No hay partido esta jornada</Text>
          <TouchableOpacity style={styles.playButton} onPress={onPlay}>
            <Text style={styles.playButtonText}>CONTINUAR</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const homeTeam = teams[playerMatch.homeId];
  const awayTeam = teams[playerMatch.awayId];
  const isPlayerHome = player.teamId === playerMatch.homeId;

  const getOrdinalPos = (tId: string, lId: string) => {
    const leagueStandings = standings[lId];
    if (!leagueStandings) return '?';
    const sorted = Object.entries(leagueStandings)
      .map(([id, s]) => ({ id, points: (s as StandingRecord).points, gd: (s as StandingRecord).goalsFor - (s as StandingRecord).goalsAgainst }))
      .sort((a, b) => b.points - a.points || b.gd - a.gd);
    const index = sorted.findIndex(s => s.id === tId);
    return index !== -1 ? `${index + 1}º` : '?';
  };

  const homePos = getOrdinalPos(playerMatch.homeId, leagueId);
  const awayPos = getOrdinalPos(playerMatch.awayId, leagueId);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>JORNADA {weekIndex + 1}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.vsSection}>
        <View style={styles.teamColumn}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>{homeTeam.name[0]}</Text>
          </View>
          <Text style={styles.teamName}>{homeTeam.name}</Text>
          <Text style={styles.teamRole}>LOCAL</Text>
        </View>

        <Text style={styles.vsText}>VS</Text>

        <View style={styles.teamColumn}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>{awayTeam.name[0]}</Text>
          </View>
          <Text style={styles.teamName}>{awayTeam.name}</Text>
          <Text style={styles.teamRole}>VISITANTE</Text>
        </View>
      </View>

      <View style={styles.comparisonSection}>
        <Text style={styles.sectionTitle}>COMPARATIVA</Text>
        
        <View style={styles.compareRow}>
          <Text style={[styles.compareValue, isPlayerHome && styles.highlighted]}>{homeTeam.strength}</Text>
          <Text style={styles.compareLabel}>OVERALL</Text>
          <Text style={[styles.compareValue, !isPlayerHome && styles.highlighted]}>{awayTeam.strength}</Text>
        </View>

        <View style={styles.compareRow}>
          <View style={styles.dotsContainer}>
            {[...Array(5)].map((_, i) => {
              const result = (homeTeam.lastResults || [])[i];
              const color = result === 'W' ? '#22c55e' : result === 'L' ? '#ef4444' : result === 'D' ? '#71717a' : '#27272a';
              return <View key={i} style={[styles.formDot, { backgroundColor: color }]} />;
            })}
          </View>
          <Text style={styles.compareLabel}>FORMA</Text>
          <View style={styles.dotsContainer}>
            {[...Array(5)].map((_, i) => {
              const result = (awayTeam.lastResults || [])[i];
              const color = result === 'W' ? '#22c55e' : result === 'L' ? '#ef4444' : result === 'D' ? '#71717a' : '#27272a';
              return <View key={i} style={[styles.formDot, { backgroundColor: color }]} />;
            })}
          </View>
        </View>

        <View style={styles.compareRow}>
          <Text style={[styles.compareValue, isPlayerHome && styles.highlighted]}>{homePos}</Text>
          <Text style={styles.compareLabel}>POSICIÓN</Text>
          <Text style={[styles.compareValue, !isPlayerHome && styles.highlighted]}>{awayPos}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.playButton} onPress={onPlay}>
        <Play color="#000" size={24} style={{ marginRight: 8 }} />
        <Text style={styles.playButtonText}>JUGAR</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  noMatchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noMatchText: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fbbf24',
    fontSize: 18,
    fontWeight: 'bold',
  },
  vsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 20,
  },
  teamColumn: {
    alignItems: 'center',
    width: 120,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  teamName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  teamRole: {
    color: '#71717a',
    fontSize: 12,
    marginTop: 4,
  },
  vsText: {
    color: '#fbbf24',
    fontSize: 40,
    fontWeight: 'bold',
  },
  comparisonSection: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  sectionTitle: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 30,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  compareLabel: {
    color: '#71717a',
    fontSize: 12,
    letterSpacing: 1,
  },
  compareValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    width: 60,
    textAlign: 'center',
  },
  highlighted: {
    color: '#fbbf24',
  },
  playButton: {
    backgroundColor: '#a3e635',
    height: 60,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  playButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
    width: 60,
    justifyContent: 'center',
  },
  formDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
