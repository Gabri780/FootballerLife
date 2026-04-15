import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { TEAMS, LEAGUES } from '../data/leagues';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react-native';

export const EvolutionModal = () => {
  const { seasonEvolutionReport, clearEvolutionReport, player } = useGameStore();
  const [activeLeague, setActiveLeague] = useState('all');

  if (!seasonEvolutionReport) return null;

  // Filter report based on league
  const filteredReport = activeLeague === 'all' 
    ? seasonEvolutionReport 
    : seasonEvolutionReport.filter(rep => TEAMS.find(t => t.id === rep.teamId)?.leagueId === activeLeague);

  // Sort report: Highest upgrades first, then biggest downgrades
  const sortedReport = [...filteredReport].sort((a, b) => {
    const diffA = a.newStrength - a.oldStrength;
    const diffB = b.newStrength - b.oldStrength;
    return diffB - diffA; // Descending order (+3, +2, ..., -1, -2)
  });

  return (
    <Modal visible={true} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Evolución del Mundo</Text>
            <Text style={styles.subtitle}>Fin de la Temporada (Edad {player.age - 1})</Text>
          </View>

          {/* League Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer} contentContainerStyle={styles.filtersContent}>
            <TouchableOpacity 
              style={[styles.filterBtn, activeLeague === 'all' && styles.activeFilterBtn]} 
              onPress={() => setActiveLeague('all')}
            >
              <Text style={[styles.filterText, activeLeague === 'all' && styles.activeFilterText]}>Todas</Text>
            </TouchableOpacity>
            {LEAGUES.map(league => (
              <TouchableOpacity 
                key={league.id} 
                style={[styles.filterBtn, activeLeague === league.id && styles.activeFilterBtn]} 
                onPress={() => setActiveLeague(league.id)}
              >
                <Text style={[styles.filterText, activeLeague === league.id && styles.activeFilterText]}>
                  {league.country} {league.name.split(' ')[0]} {/* Short name */}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {sortedReport.length > 0 ? (
              sortedReport.map((rep) => {
                const diff = rep.newStrength - rep.oldStrength;
                const isPositive = diff > 0;
                const team = TEAMS.find(t => t.id === rep.teamId);

                return (
                  <View key={rep.teamId} style={styles.row}>
                    <View style={styles.teamInfo}>
                      <Text style={styles.teamName} numberOfLines={1}>{team?.name}</Text>
                    </View>
                    
                    <View style={styles.statsInfo}>
                      <Text style={styles.oldStat}>{rep.oldStrength}</Text>
                      <ArrowRight size={14} color="#71717a" style={styles.arrow} />
                      <Text style={[styles.newStat, isPositive ? styles.positiveText : styles.negativeText]}>
                        {rep.newStrength}
                      </Text>
                      
                      <View style={[styles.badge, isPositive ? styles.positiveBadge : styles.negativeBadge]}>
                        {isPositive ? <TrendingUp size={12} color="#10b981" /> : <TrendingDown size={12} color="#ef4444" />}
                        <Text style={[styles.badgeText, isPositive ? styles.positiveText : styles.negativeText]}>
                          {isPositive ? `+${diff}` : diff}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hubo cambios significativos en esta liga.</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.okBtn} onPress={clearEvolutionReport}>
              <Text style={styles.okBtnText}>CONTINUAR AÑO {player.age}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#18181b',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  header: {
    padding: 20,
    backgroundColor: '#09090b',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#a1a1aa',
    fontSize: 14,
    marginTop: 4,
  },
  filtersContainer: {
    backgroundColor: '#09090b',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    maxHeight: 60,
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#27272a',
  },
  activeFilterBtn: {
    backgroundColor: '#3f3f46',
  },
  filterText: {
    color: '#a1a1aa',
    fontSize: 12,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#fff',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#27272a',
    borderRadius: 12,
  },
  teamInfo: {
    flex: 1,
    paddingRight: 10,
  },
  teamName: {
    color: '#e4e4e7',
    fontSize: 14,
    fontWeight: '600',
  },
  statsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  oldStat: {
    color: '#a1a1aa',
    fontSize: 12,
    fontWeight: '500',
  },
  arrow: {
    marginHorizontal: 4,
  },
  newStat: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  positiveText: {
    color: '#10b981',
  },
  negativeText: {
    color: '#ef4444',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  positiveBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  negativeBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#71717a',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    backgroundColor: '#09090b',
  },
  okBtn: {
    backgroundColor: '#a3e635',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  okBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
