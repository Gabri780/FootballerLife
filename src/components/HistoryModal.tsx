import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { LEAGUES, TEAMS } from '../data/leagues';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const HistoryModal = ({ visible, onClose }: Props) => {
  const { history } = useGameStore();
  const [activeLeague, setActiveLeague] = useState(LEAGUES[0].id);
  
  const availableYears = Object.keys(history).map(Number).sort((a, b) => b - a);
  const [selectedYear, setSelectedYear] = useState<number | null>(availableYears.length > 0 ? availableYears[0] : null);

  // Update selected year if it's null but years become available
  if (selectedYear === null && availableYears.length > 0) {
    setSelectedYear(availableYears[0]);
  }

  if (!visible) return null;

  const currentHistory = selectedYear !== null ? history[selectedYear]?.[activeLeague] : null;
  
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

        {availableYears.length > 0 && (
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
                </ScrollView>

                {/* Table Header */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.thText, { flex: 0.8 }]}>Pos</Text>
                    <Text style={[styles.thText, { flex: 4 }]}>Equipo</Text>
                    <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>DG</Text>
                    <Text style={[styles.thText, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>PTS</Text>
                </View>

                {/* Standings List */}
                <ScrollView style={styles.tableList}>
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
                    <View style={{ height: 40 }} />
                </ScrollView>
            </>
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
