import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useGameStore } from './src/store/gameStore';
import { CalendarClock, FastForward, Trophy, History, Award, Star } from 'lucide-react-native';
import { StandingsModal } from './src/components/StandingsModal';
import { HistoryModal } from './src/components/HistoryModal';
import { EvolutionModal } from './src/components/EvolutionModal';
import { RankingModal } from './src/components/RankingModal';
import { ChampionsModal } from './src/components/ChampionsModal';
import { HomeScreen } from './src/screens/HomeScreen';
import { CreateCharacterScreen } from './src/screens/CreateCharacterScreen';
import { ChooseClubScreen } from './src/screens/ChooseClubScreen';
import { TEAMS } from './src/data/leagues';

const { width } = Dimensions.get('window');

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'create' | 'club' | 'game'>('home');
  const [pendingPlayer, setPendingPlayer] = useState<{ name: string, country: string, position: string } | null>(null);
  const { player, logs, advanceMatch, advanceSeason, createPlayer } = useGameStore();
  const [showStandings, setShowStandings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [showChampions, setShowChampions] = useState(false);

  const teamName = TEAMS.find(t => t.id === player.teamId)?.name || 'Club';

  if (currentScreen === 'home') {
    return <HomeScreen
      onStart={() => setCurrentScreen('game')}
      onNewGame={() => setCurrentScreen('create')}
    />;
  }

  if (currentScreen === 'create') {
    return <CreateCharacterScreen
      onBack={() => setCurrentScreen('home')}
      onNext={(data) => {
        setPendingPlayer(data);
        setCurrentScreen('club');
      }}
    />;
  }

  if (currentScreen === 'club' && pendingPlayer) {
    return <ChooseClubScreen
      playerData={pendingPlayer}
      onBack={() => setCurrentScreen('create')}
      onConfirm={async (teamId) => {
        await createPlayer(pendingPlayer.name, pendingPlayer.country, pendingPlayer.position, teamId);
        setPendingPlayer(null);
        setCurrentScreen('game');
      }}
    />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* HEADER: Player Info & Stats */}
      <View style={styles.header}>
        <View style={styles.playerInfoRow}>
          <View>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.playerSub}>Modo Observador: {teamName} • {player.age} años</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={styles.trophyBtn} onPress={() => setShowChampions(true)}>
              <Star size={20} color="#fbbf24" fill="rgba(251, 191, 36, 0.2)" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.trophyBtn} onPress={() => setShowRanking(true)}>
              <Award size={20} color="#fbbf24" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.trophyBtn} onPress={() => setShowHistory(true)}>
              <History size={20} color="#a1a1aa" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.trophyBtn} onPress={() => setShowStandings(true)}>
              <Trophy size={20} color="#a1a1aa" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* CENTER: Event Log */}
      <ScrollView style={styles.logContainer} contentContainerStyle={styles.logContent}>
        {logs.map((log) => (
          <View key={log.id} style={[
            styles.logEntry,
            log.type === 'good' && styles.logGood,
            log.type === 'bad' && styles.logBad,
            log.type === 'info' && styles.logInfo,
          ]}>
            <Text style={styles.logText}>{log.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* FOOTER: Actions */}
      <View style={styles.footer}>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.secondaryActionBtn} onPress={advanceMatch}>
            <CalendarClock size={24} color="#a1a1aa" style={{ marginRight: 8 }} />
            <Text style={styles.secondaryActionText}>JORNADA</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mainActionBtn} onPress={advanceSeason}>
            <FastForward size={28} color="#000" style={{ marginRight: 8 }} />
            <Text style={styles.mainActionText}>SIMULAR TEMP.</Text>
          </TouchableOpacity>
        </View>
      </View>

      <StandingsModal visible={showStandings} onClose={() => setShowStandings(false)} />
      <HistoryModal visible={showHistory} onClose={() => setShowHistory(false)} />
      <RankingModal visible={showRanking} onClose={() => setShowRanking(false)} />
      <ChampionsModal visible={showChampions} onClose={() => setShowChampions(false)} />
      <EvolutionModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    padding: 20,
    backgroundColor: '#18181b',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 10,
  },
  playerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingTop: 10,
  },
  playerName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  playerSub: {
    color: '#a1a1aa',
    fontSize: 14,
    marginTop: 2,
  },
  trophyBtn: {
    padding: 8,
    backgroundColor: '#27272a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logContainer: {
    flex: 1,
    padding: 16,
  },
  logContent: {
    paddingBottom: 20,
  },
  logEntry: {
    backgroundColor: '#18181b',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3f3f46',
  },
  logGood: {
    borderLeftColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  logBad: {
    borderLeftColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  logInfo: {
    borderLeftColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  logText: {
    color: '#e4e4e7',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#18181b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    backgroundColor: '#27272a',
    borderRadius: 20,
  },
  secondaryActionText: {
    color: '#a1a1aa',
    fontSize: 14,
    fontWeight: '700',
  },
  mainActionBtn: {
    flex: 2,
    backgroundColor: '#a3e635',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    shadowColor: '#a3e635',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  mainActionText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
