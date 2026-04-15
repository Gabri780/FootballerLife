import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { LEAGUES, TEAMS, NATIONAL_TEAMS } from '../data/leagues';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const HistoryModal = ({ visible, onClose }: Props) => {
  const { history, championsHistory, domesticCupsHistory, worldCupHistory, euroCupHistory } = useGameStore();
  const [activeLeague, setActiveLeague] = useState<string | 'champions' | 'world_cup' | 'euro_cup'>(LEAGUES[0].id);
  
  const availableYears = Object.keys(history).map(Number).sort((a, b) => b - a);
  const [selectedYear, setSelectedYear] = useState<number | null>(availableYears.length > 0 ? availableYears[0] : null);

  // Update selected year if it's null but years become available
  if (selectedYear === null && availableYears.length > 0) {
    setSelectedYear(availableYears[0]);
  }

  if (!visible) return null;

  const currentHistory = (selectedYear !== null && activeLeague !== 'champions' && activeLeague !== 'world_cup' && activeLeague !== 'euro_cup') ? history[selectedYear]?.[activeLeague] : null;
  const yearChamp = selectedYear !== null ? championsHistory[selectedYear] : null;
  const yearWorldCup = selectedYear !== null ? worldCupHistory[selectedYear] : null;
  const yearEuroCup = selectedYear !== null ? euroCupHistory[selectedYear] : null;
  const cupChampId = (selectedYear !== null && activeLeague !== 'champions' && activeLeague !== 'world_cup' && activeLeague !== 'euro_cup') ? domesticCupsHistory[selectedYear]?.[activeLeague] : null;
  
  const sortedTeams = currentHistory ? Object.keys(currentHistory).sort((a, b) => {
    const teamA = currentHistory[a];
    const teamB = currentHistory[b];
    if (teamB.points !== teamA.points) return teamB.points - teamA.points;
    const gdA = teamA.goalsFor - teamA.goalsAgainst;
    const gdB = teamB.goalsFor - teamB.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return teamB.goalsFor - teamA.goalsFor;
  }) : [];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Histórico Global</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        {/* Year Selector */}
        <View style={styles.selectorRow}>
            {availableYears.length > 0 ? (
                <View style={styles.yearPicker}>
                    <Text style={styles.pickerLabel}>Temporada (Edad {selectedYear})</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearsContent}>
                        {availableYears.map(year => (
                            <TouchableOpacity 
                                key={year} 
                                style={[styles.yearTab, selectedYear === year && styles.activeYearTab]}
                                onPress={() => setSelectedYear(year)}
                            >
                                <Text style={[styles.yearTabText, selectedYear === year && styles.activeYearTabText]}>
                                    Edad {year}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No hay temporadas finalizadas aún.</Text>
                </View>
            )}
        </View>

        {availableYears.length > 0 ? (
            <>
                {/* League Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer} contentContainerStyle={styles.tabsContent}>
                    {LEAGUES.map(league => (
                        <TouchableOpacity 
                        key={league.id} 
                        style={[styles.tab, activeLeague === league.id && styles.activeTab]}
                        onPress={() => setActiveLeague(league.id)}
                        >
                        <Text style={[styles.tabText, activeLeague === league.id && styles.activeTabText]}>
                            {league.country} {league.name}
                        </Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity 
                        style={[styles.tab, activeLeague === 'champions' && styles.activeChampTab]}
                        onPress={() => setActiveLeague('champions')}
                    >
                        <Text style={[styles.tabText, activeLeague === 'champions' && styles.activeChampTabText]}>
                            🌍 Champions
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeLeague === 'world_cup' && styles.activeWorldCupTab]}
                        onPress={() => setActiveLeague('world_cup')}
                    >
                        <Text style={[styles.tabText, activeLeague === 'world_cup' && styles.activeWorldCupText]}>
                            🏆 Mundial
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeLeague === 'euro_cup' && styles.activeEuroCupTab]}
                        onPress={() => setActiveLeague('euro_cup')}
                    >
                        <Text style={[styles.tabText, activeLeague === 'euro_cup' && styles.activeEuroCupText]}>
                            🇪🇺 Eurocopa
                        </Text>
                    </TouchableOpacity>
                </ScrollView>

                <ScrollView style={styles.tableList}>
                    {activeLeague !== 'champions' && activeLeague !== 'world_cup' && activeLeague !== 'euro_cup' ? (
                        <>
                            {/* Summary Card for Cup (Champions removed as requested to be in tabs) */}
                            <View style={styles.seasonSummary}>
                                <View style={styles.champCard}>
                                    <Text style={styles.champLabel}>🏆 CAMPEÓN COPA</Text>
                                    <Text style={styles.champName} numberOfLines={1}>
                                        {cupChampId ? TEAMS.find(t => t.id === cupChampId)?.name : '---'}
                                    </Text>
                                </View>
                            </View>

                            {/* Table Header */}
                            <View style={styles.tableHeader}>
                                <Text style={[styles.thText, { flex: 0.8 }]}>Pos</Text>
                                <Text style={[styles.thText, { flex: 4 }]}>Equipo</Text>
                                <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>DG</Text>
                                <Text style={[styles.thText, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>PTS</Text>
                            </View>

                            {sortedTeams.map((teamId, index) => {
                                const rowStr = currentHistory![teamId];
                                const team = TEAMS.find(t => t.id === teamId);
                                const gd = rowStr.goalsFor - rowStr.goalsAgainst;
                                
                                return (
                                <View key={teamId} style={styles.tableRow}>
                                    <Text style={[styles.tdText, { flex: 0.8, color: '#a1a1aa' }]}>{index + 1}</Text>
                                    <Text style={[styles.tdText, { flex: 4, fontWeight: '500' }]} numberOfLines={1}>{team?.name}</Text>
                                    <Text style={[styles.tdText, { flex: 1, textAlign: 'center' }]}>
                                    {gd > 0 ? `+${gd}` : gd}
                                    </Text>
                                    <Text style={[styles.tdText, { flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#fbbf24' }]}>
                                    {rowStr.points}
                                    </Text>
                                </View>
                                );
                            })}
                        </>
                    ) : activeLeague === 'champions' ? (
                        <View style={styles.championsHistoryContainer}>
                            {yearChamp ? (
                                <View style={styles.finalCard}>
                                    <Text style={styles.finalTitle}>FINAL EUROPA</Text>
                                    <View style={styles.finalRow}>
                                        <View style={styles.finalTeam}>
                                            <Text style={styles.finalTeamName}>{TEAMS.find(t => t.id === yearChamp.winnerId)?.name}</Text>
                                            <Text style={styles.finalStatus}>CAMPEÓN</Text>
                                        </View>
                                        <View style={styles.finalScoreBox}>
                                            <Text style={styles.finalScore}>{yearChamp.score}</Text>
                                        </View>
                                        <View style={styles.finalTeam}>
                                            <Text style={styles.finalTeamName}>{TEAMS.find(t => t.id === yearChamp.runnerUpId)?.name}</Text>
                                            <Text style={styles.finalStatus}>SUBCAMPEÓN</Text>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No hay datos de Champions para este año.</Text>
                                </View>
                            )}
                        </View>
                    ) : activeLeague === 'world_cup' ? (
                        <View style={styles.championsHistoryContainer}>
                            {yearWorldCup ? (
                                <View style={[styles.finalCard, { borderColor: '#fbbf24' }]}>
                                    <Text style={[styles.finalTitle, { color: '#fbbf24' }]}>FINAL MUNDIAL</Text>
                                    <View style={styles.finalRow}>
                                        <View style={styles.finalTeam}>
                                            <Text style={styles.finalTeamName}>
                                                {NATIONAL_TEAMS.find(t => t.id === yearWorldCup.winnerId)?.flag} {NATIONAL_TEAMS.find(t => t.id === yearWorldCup.winnerId)?.name}
                                            </Text>
                                            <Text style={styles.finalStatus}>CAMPEÓN DEL MUNDO</Text>
                                        </View>
                                        <View style={styles.finalScoreBox}>
                                            <Text style={styles.finalScore}>{yearWorldCup.score}</Text>
                                        </View>
                                        <View style={styles.finalTeam}>
                                            <Text style={styles.finalTeamName}>
                                                {NATIONAL_TEAMS.find(t => t.id === yearWorldCup.runnerUpId)?.flag} {NATIONAL_TEAMS.find(t => t.id === yearWorldCup.runnerUpId)?.name}
                                            </Text>
                                            <Text style={styles.finalStatus}>SUBCAMPEÓN</Text>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No hubo Mundial este año.</Text>
                                </View>
                            )}
                        </View>
                    ) : activeLeague === 'euro_cup' ? (
                        <View style={styles.championsHistoryContainer}>
                            {yearEuroCup ? (
                                <View style={[styles.finalCard, { borderColor: '#38bdf8' }]}>
                                    <Text style={[styles.finalTitle, { color: '#38bdf8' }]}>FINAL EUROCOPA</Text>
                                    <View style={styles.finalRow}>
                                        <View style={styles.finalTeam}>
                                            <Text style={styles.finalTeamName}>
                                                {NATIONAL_TEAMS.find(t => t.id === yearEuroCup.winnerId)?.flag} {NATIONAL_TEAMS.find(t => t.id === yearEuroCup.winnerId)?.name}
                                            </Text>
                                            <Text style={styles.finalStatus}>REY DE EUROPA</Text>
                                        </View>
                                        <View style={styles.finalScoreBox}>
                                            <Text style={styles.finalScore}>{yearEuroCup.score}</Text>
                                        </View>
                                        <View style={styles.finalTeam}>
                                            <Text style={styles.finalTeamName}>
                                                {NATIONAL_TEAMS.find(t => t.id === yearEuroCup.runnerUpId)?.flag} {NATIONAL_TEAMS.find(t => t.id === yearEuroCup.runnerUpId)?.name}
                                            </Text>
                                            <Text style={styles.finalStatus}>SUBCAMPEÓN</Text>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No hubo Eurocopa este año.</Text>
                                </View>
                            )}
                        </View>
                    ) : null}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </>
        ) : (
             <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay temporadas finalizadas aún.</Text>
             </View>
        )}
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
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
    backgroundColor: '#27272a',
    borderRadius: 20,
  },
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#18181b',
    padding: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#27272a',
  },
  activeModeBtn: {
    backgroundColor: '#fbbf24',
  },
  modeBtnText: {
    color: '#a1a1aa',
    fontWeight: '700',
    fontSize: 13,
  },
  activeModeBtnText: {
    color: '#000',
  },
  selectorRow: {
    padding: 16,
    backgroundColor: '#111114',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  yearPicker: {
    gap: 12,
  },
  pickerLabel: {
    color: '#71717a',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  yearsContent: {
    gap: 8,
  },
  yearTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  activeYearTab: {
    borderColor: '#fbbf24',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  yearTabText: {
    color: '#a1a1aa',
    fontSize: 14,
    fontWeight: '600',
  },
  activeYearTabText: {
    color: '#fbbf24',
  },
  activeChampTab: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderColor: '#fbbf24',
    borderWidth: 1,
  },
  activeChampTabText: {
    color: '#fbbf24',
    fontWeight: 'bold',
  },
  activeWorldCupTab: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3b82f6',
    borderWidth: 1,
  },
  activeWorldCupText: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  activeEuroCupTab: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: '#38bdf8',
    borderWidth: 1,
  },
  activeEuroCupText: {
    color: '#38bdf8',
    fontWeight: 'bold',
  },
  seasonSummary: {
    padding: 16,
    backgroundColor: '#111114',
  },
  championsHistoryContainer: {
    padding: 16,
  },
  finalCard: {
    backgroundColor: '#18181b',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#27272a',
    alignItems: 'center',
  },
  finalTitle: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 20,
  },
  finalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  finalTeam: {
    flex: 1,
    alignItems: 'center',
  },
  finalTeamName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  finalStatus: {
    color: '#71717a',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  finalScoreBox: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  finalScore: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
  },
  champCard: {
    padding: 12,
    backgroundColor: '#18181b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    alignItems: 'center',
  },
  champLabel: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },
  champName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#71717a',
    fontSize: 14,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    backgroundColor: '#18181b',
  },
  tabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#27272a',
  },
  activeTab: {
    backgroundColor: '#3f3f46',
  },
  tabText: {
    color: '#a1a1aa',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#09090b',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  thText: {
    color: '#71717a',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tableList: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(39, 39, 42, 0.5)',
  },
  tdText: {
    color: '#e4e4e7',
    fontSize: 14,
  }
});
