import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { X, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COUNTRIES } from '../data/countries';
import { TEAMS } from '../data/leagues';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

const POSITION_NAMES: Record<string, string> = {
  POR: 'Portero',
  DFC: 'Defensa central',
  LT: 'Lateral izquierdo',
  RT: 'Lateral derecho',
  MCD: 'Mediocentro defensivo',
  MC: 'Mediocentro',
  MD: 'Interior derecho',
  MI: 'Interior izquierdo',
  EXD: 'Extremo derecho',
  EXI: 'Extremo izquierdo',
  DC: 'Delantero',
};

export const ProfileModal = ({ visible, onClose }: ProfileModalProps) => {
  const { player } = useGameStore();
  const [activeTab, setActiveTab] = useState<'perfil' | 'temporadas' | 'trofeos'>('perfil');

  if (!player) return null;

  const playerCountry = COUNTRIES.find(c => c.id === player.country);
  const playerTeam = TEAMS.find(t => t.id === player.teamId);

  const getStatColor = (value: number) => {
    if (value >= 85) return '#22c55e'; // verde
    if (value >= 75) return '#fbbf24'; // dorado
    if (value >= 65) return '#f97316'; // naranja
    return '#ef4444'; // rojo
  };

  const getRatingColor = (value: number) => {
    if (value >= 8) return '#22c55e';
    if (value >= 7) return '#fbbf24';
    if (value >= 6) return '#fff';
    return '#ef4444';
  };

  const careerAvgRating = player.seasonsHistory && player.seasonsHistory.length > 0
    ? (player.seasonsHistory.reduce((acc, s) => acc + s.avgRating * s.appearances, 0) / 
       player.seasonsHistory.reduce((acc, s) => acc + s.appearances, 0)).toFixed(2)
    : '—';

  const statsList = [
    { label: 'RIT', value: player.stats.pace },
    { label: 'TIR', value: player.stats.shooting },
    { label: 'PAS', value: player.stats.passing },
    { label: 'REG', value: player.stats.dribbling },
    { label: 'DEF', value: player.stats.defending },
    { label: 'FÍS', value: player.stats.physical },
  ];

  const trophyCount = {
    league: (player.seasonsHistory || []).filter(s => s.trophies.league).length,
    domesticCup: (player.seasonsHistory || []).filter(s => s.trophies.domesticCup).length,
    champions: (player.seasonsHistory || []).filter(s => s.trophies.champions).length,
    worldCup: (player.seasonsHistory || []).filter(s => s.trophies.worldCup).length,
    euroCup: (player.seasonsHistory || []).filter(s => s.trophies.euroCup).length,
  };
  const totalTrophies = Object.values(trophyCount).reduce((a, b) => a + b, 0);

  const renderHeader = () => {
    const titles = {
      perfil: 'PERFIL',
      temporadas: 'TEMPORADAS',
      trofeos: 'TROFEOS'
    };
    return (
      <View style={styles.header}>
        <Text style={styles.title}>{titles[activeTab]}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <X color="#fff" size={24} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderTabs = () => (
    <View style={styles.tabBar}>
      {(['perfil', 'temporadas', 'trofeos'] as const).map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => setActiveTab(tab)}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPerfil = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* SECCIÓN 1 — Tarjeta de jugador estilo FIFA */}
      <LinearGradient
        colors={['#1e293b', '#0f172a']}
        style={styles.playerCard}
      >
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.cardOverall}>{player.overall}</Text>
            <Text style={styles.cardPosition}>
              {player.position ? POSITION_NAMES[player.position] || player.position : '—'}
            </Text>
          </View>
          <Text style={styles.cardFlag}>{playerCountry?.flag || '🏳️'}</Text>
        </View>
        
        <View style={styles.cardBottom}>
          <Text style={styles.cardName}>{player.name}</Text>
          <Text style={styles.cardSub}>
            {player.age} años · {playerTeam?.name || 'Agente Libre'}
          </Text>
        </View>
      </LinearGradient>

      {/* SECCIÓN 2 — Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ATRIBUTOS</Text>
        {statsList.map((stat, index) => (
          <View key={index} style={styles.statRow}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <View style={styles.statBarBg}>
              <View 
                style={[
                  styles.statBarFill, 
                  { 
                    width: `${(stat.value / 99) * 100}%`,
                    backgroundColor: getStatColor(stat.value)
                  }
                ]} 
              />
            </View>
            <Text style={[styles.statValue, { color: getStatColor(stat.value) }]}>
              {stat.value}
            </Text>
          </View>
        ))}
      </View>

      {/* SECCIÓN 3 — Carrera acumulada */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CARRERA</Text>
        <View style={styles.careerGrid}>
          <View style={styles.careerCard}>
            <Text style={styles.careerLabel}>PARTIDOS</Text>
            <Text style={styles.careerValue}>{player.careerAppearances}</Text>
          </View>
          <View style={styles.careerCard}>
            <Text style={styles.careerLabel}>GOLES</Text>
            <Text style={styles.careerValue}>{player.careerGoals}</Text>
          </View>
          <View style={styles.careerCard}>
            <Text style={styles.careerLabel}>ASISTENCIAS</Text>
            <Text style={styles.careerValue}>{player.careerAssists}</Text>
          </View>
          <View style={styles.careerCard}>
            <Text style={styles.careerLabel}>RATING MEDIO</Text>
            <Text style={styles.careerValue}>{careerAvgRating}</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const renderTemporadas = () => {
    const seasons = [...(player.seasonsHistory || [])].sort((a, b) => b.age - a.age);

    if (seasons.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aún no has completado ninguna temporada. ¡Simula al menos 38 jornadas!</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {seasons.map((season, index) => {
          const hasMajorTrophy = season.trophies.champions || season.trophies.worldCup || season.trophies.euroCup;
          const hasMinorTrophy = season.trophies.league || season.trophies.domesticCup;
          const borderColor = hasMajorTrophy ? '#fbbf24' : hasMinorTrophy ? '#a3e635' : '#3f3f46';

          return (
            <View key={index} style={[styles.seasonCard, { borderLeftColor: borderColor }]}>
              <View style={styles.seasonRow}>
                <Text style={styles.seasonNumber}>TEMPORADA {season.age - 17}</Text>
                <Text style={styles.seasonAge}>{season.age} AÑOS</Text>
              </View>
              <Text style={styles.seasonTeam}>{season.teamName}</Text>
              
              <View style={styles.seasonStatsRow}>
                <View style={styles.seasonStatCol}>
                  <Text style={styles.seasonStatLabel}>PJ</Text>
                  <Text style={styles.seasonStatValue}>{season.appearances}</Text>
                </View>
                <View style={styles.seasonStatCol}>
                  <Text style={styles.seasonStatLabel}>GOLES</Text>
                  <Text style={styles.seasonStatValue}>{season.goals}</Text>
                </View>
                <View style={styles.seasonStatCol}>
                  <Text style={styles.seasonStatLabel}>ASIST</Text>
                  <Text style={styles.seasonStatValue}>{season.assists}</Text>
                </View>
                <View style={styles.seasonStatCol}>
                  <Text style={styles.seasonStatLabel}>RATING</Text>
                  <Text style={[styles.seasonStatValue, { color: getRatingColor(season.avgRating) }]}>
                    {season.avgRating.toFixed(2)}
                  </Text>
                </View>
              </View>

              {(hasMajorTrophy || hasMinorTrophy) && (
                <View style={styles.trophyChipsRow}>
                  {season.trophies.league && <View style={styles.trophyChip}><Text style={styles.trophyChipText}>🏆 Liga</Text></View>}
                  {season.trophies.domesticCup && <View style={styles.trophyChip}><Text style={styles.trophyChipText}>🥈 Copa</Text></View>}
                  {season.trophies.champions && <View style={styles.trophyChip}><Text style={styles.trophyChipText}>⭐ Champions</Text></View>}
                  {season.trophies.worldCup && <View style={styles.trophyChip}><Text style={styles.trophyChipText}>👑 Mundial</Text></View>}
                  {season.trophies.euroCup && <View style={styles.trophyChip}><Text style={styles.trophyChipText}>🇪🇺 Eurocopa</Text></View>}
                </View>
              )}
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  const renderTrofeos = () => {
    const trophyItems = [
      { id: 'league', label: 'LIGA', emoji: '🏆', count: trophyCount.league },
      { id: 'domesticCup', label: 'COPA', emoji: '🥈', count: trophyCount.domesticCup },
      { id: 'champions', label: 'CHAMPIONS', emoji: '⭐', count: trophyCount.champions },
      { id: 'worldCup', label: 'MUNDIAL', emoji: '👑', count: trophyCount.worldCup },
      { id: 'euroCup', label: 'EUROCOPA', emoji: '🇪🇺', count: trophyCount.euroCup },
    ];

    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.vitrinaTitle}>VITRINA DE TROFEOS</Text>
        <View style={styles.totalTrophiesContainer}>
          <Text style={styles.totalTrophiesCount}>{totalTrophies}</Text>
          <Text style={styles.totalTrophiesLabel}>TROFEOS</Text>
        </View>

        <View style={styles.trophyGrid}>
          {trophyItems.map((item) => (
            <View 
              key={item.id} 
              style={[
                styles.trophyCard, 
                item.count > 0 ? styles.trophyCardActive : styles.trophyCardInactive
              ]}
            >
              <Text style={styles.trophyEmoji}>{item.emoji}</Text>
              <Text style={[styles.trophyNumber, item.count > 0 ? styles.trophyCountActive : styles.trophyCountInactive]}>
                {item.count}
              </Text>
              <Text style={styles.trophyLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {totalTrophies === 0 && (
          <Text style={styles.motivationText}>Gana tu primer trofeo y aparecerá aquí.</Text>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        {renderTabs()}
        {activeTab === 'perfil' && renderPerfil()}
        {activeTab === 'temporadas' && renderTemporadas()}
        {activeTab === 'trofeos' && renderTrofeos()}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#18181b',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  title: {
    color: '#fbbf24',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: '#27272a',
    borderRadius: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#18181b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#27272a',
  },
  tabText: {
    color: '#71717a',
    fontSize: 13,
  },
  activeTabText: {
    color: '#fbbf24',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  playerCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardOverall: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fbbf24',
    lineHeight: 48,
  },
  cardPosition: {
    fontSize: 14,
    color: '#a1a1aa',
    fontWeight: '500',
    marginTop: 4,
  },
  cardFlag: {
    fontSize: 40,
  },
  cardBottom: {
    marginTop: 10,
  },
  cardName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  cardSub: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 1,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    color: '#fff',
    fontSize: 13,
    width: 40,
    fontWeight: '600',
  },
  statBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#27272a',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 24,
    textAlign: 'right',
  },
  careerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  careerCard: {
    width: '48%',
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  careerLabel: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  careerValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#71717a',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  seasonCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  seasonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seasonNumber: {
    fontSize: 12,
    color: '#71717a',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  seasonAge: {
    fontSize: 12,
    color: '#71717a',
  },
  seasonTeam: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 4,
  },
  seasonStatsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  seasonStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  seasonStatLabel: {
    fontSize: 10,
    color: '#71717a',
    letterSpacing: 1,
    marginBottom: 4,
  },
  seasonStatValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  trophyChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  trophyChip: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trophyChipText: {
    fontSize: 11,
    color: '#fbbf24',
    fontWeight: 'bold',
  },
  vitrinaTitle: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 8,
  },
  totalTrophiesContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  totalTrophiesCount: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  totalTrophiesLabel: {
    fontSize: 14,
    color: '#71717a',
    marginTop: -10,
  },
  trophyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  trophyCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  trophyCardActive: {
    backgroundColor: '#18181b',
    borderColor: '#fbbf24',
  },
  trophyCardInactive: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
    opacity: 0.5,
  },
  trophyEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  trophyNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  trophyCountActive: {
    color: '#fbbf24',
  },
  trophyCountInactive: {
    color: '#71717a',
  },
  trophyLabel: {
    fontSize: 10,
    color: '#a1a1aa',
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 4,
  },
  motivationText: {
    fontSize: 13,
    color: '#71717a',
    textAlign: 'center',
    marginTop: 24,
  },
});
