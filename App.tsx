import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useGameStore } from './src/store/gameStore';
import { CalendarClock, FastForward, Trophy, History, Award, Star, User } from 'lucide-react-native';
import { StandingsModal } from './src/components/StandingsModal';
import { HistoryModal } from './src/components/HistoryModal';
import { EvolutionModal } from './src/components/EvolutionModal';
import { PlayerProgressionModal } from './src/components/PlayerProgressionModal';
import { RankingModal } from './src/components/RankingModal';
import { ChampionsModal } from './src/components/ChampionsModal';
import { HomeScreen } from './src/screens/HomeScreen';
import { CreateCharacterScreen } from './src/screens/CreateCharacterScreen';
import { ChooseClubScreen } from './src/screens/ChooseClubScreen';
import { ProfileModal } from './src/components/ProfileModal';
import { MatchPreviewScreen } from './src/screens/MatchPreviewScreen';
import { MatchLiveScreen } from './src/screens/MatchLiveScreen';
import { MatchResultScreen } from './src/screens/MatchResultScreen';
import { TEAMS, LEAGUES } from './src/data/leagues';

const { width } = Dimensions.get('window');

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'create' | 'club' | 'game' | 'matchPreview' | 'matchLive' | 'matchResult'>('home');
  const [pendingPlayer, setPendingPlayer] = useState<{ name: string, country: string, position: string } | null>(null);
  const [matchResultData, setMatchResultData] = useState<{
    homeGoals: number;
    awayGoals: number;
    homeId: string;
    awayId: string;
    homeName: string;
    awayName: string;
    playerGoals: number;
    playerAssists: number;
    playerRating: number;
  } | null>(null);
  const { player, logs, advanceMatchSilent, advanceSeason, createPlayer } = useGameStore();
  const [showStandings, setShowStandings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [showChampions, setShowChampions] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const teamName = TEAMS.find(t => t.id === player.teamId)?.name || 'Club';

  const handlePlayMatch = () => {
    const storeState = useGameStore.getState();
    const weekIndex = storeState.player.matchesPlayed % 38;

    // Encontrar el partido del jugador ANTES de avanzar
    let homeId = '';
    let awayId = '';
    for (const league of LEAGUES) {
      const wm = storeState.schedules[league.id]?.[weekIndex];
      if (!wm) continue;
      const m = wm.find(x => x.homeTeamId === storeState.player.teamId || x.awayTeamId === storeState.player.teamId);
      if (m) {
        homeId = m.homeTeamId;
        awayId = m.awayTeamId;
        break;
      }
    }

    const statsBefore = {
      goals: storeState.player.seasonGoals || 0,
      assists: storeState.player.seasonAssists || 0,
      ratingSum: storeState.player.seasonRatingSum || 0,
      appearances: storeState.player.seasonAppearances || 0,
    };

    advanceMatchSilent();

    const statsAfter = useGameStore.getState().player;
    const playerGoals = (statsAfter.seasonGoals || 0) - statsBefore.goals;
    const playerAssists = (statsAfter.seasonAssists || 0) - statsBefore.assists;
    const appearancesAdded = (statsAfter.seasonAppearances || 0) - statsBefore.appearances;
    const playerRating = appearancesAdded > 0
      ? ((statsAfter.seasonRatingSum || 0) - statsBefore.ratingSum) / appearancesAdded
      : 0;

    const latestMatch = statsAfter.lastMatches?.[0];
    const homeGoals = latestMatch ? (latestMatch.isHome ? latestMatch.teamGoals : latestMatch.opponentGoals) : 0;
    const awayGoals = latestMatch ? (latestMatch.isHome ? latestMatch.opponentGoals : latestMatch.teamGoals) : 0;

    return { playerGoals, playerAssists, playerRating, homeId, awayId, homeGoals, awayGoals };
  };

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

  if (currentScreen === 'matchPreview') {
    return <MatchPreviewScreen
      onBack={() => setCurrentScreen('game')}
      onPlay={() => {
        const result = handlePlayMatch();
        const teams = useGameStore.getState().teams;

        if (result.homeId === '') {
          setCurrentScreen('game');
          return;
        }

        setMatchResultData({
          homeGoals: result.homeGoals,
          awayGoals: result.awayGoals,
          homeId: result.homeId,
          awayId: result.awayId,
          homeName: teams[result.homeId]?.name || 'Local',
          awayName: teams[result.awayId]?.name || 'Visitante',
          playerGoals: result.playerGoals,
          playerAssists: result.playerAssists,
          playerRating: result.playerRating,
        });
        setCurrentScreen('matchLive');
      }}
    />;
  }

  if (currentScreen === 'matchLive' && matchResultData) {
    return <MatchLiveScreen
      finalHomeGoals={matchResultData.homeGoals}
      finalAwayGoals={matchResultData.awayGoals}
      homeName={matchResultData.homeName}
      awayName={matchResultData.awayName}
      onBack={() => setCurrentScreen('game')}
      onFinish={() => setCurrentScreen('matchResult')}
    />;
  }

  if (currentScreen === 'matchResult' && matchResultData) {
    return <MatchResultScreen
      matchResult={matchResultData}
      onContinue={() => {
        setMatchResultData(null);
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
            <TouchableOpacity style={styles.trophyBtn} onPress={() => setShowProfile(true)}>
              <User size={20} color="#a3e635" />
            </TouchableOpacity>
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
          <TouchableOpacity style={styles.secondaryActionBtn} onPress={() => setCurrentScreen('matchPreview')}>
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
      <ProfileModal visible={showProfile} onClose={() => setShowProfile(false)} />
      <PlayerProgressionModal />
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
