import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { TEAMS, LEAGUES } from '../data/leagues';
import { TrendingUp, TrendingDown, ArrowRight, Minus } from 'lucide-react-native';

export const EvolutionModal = () => {
  const { seasonEvolutionReport, clearEvolutionReport, player, history, teams } = useGameStore();
  const [activeLeague, setActiveLeague] = useState('all');

  if (!seasonEvolutionReport) return null;

  const lastSeasonAge = player.age - 1;
  const lastSeasonStandings = history[lastSeasonAge];

  if (!lastSeasonStandings) return null;

  // Function to get top 10 teams of a league from last season
  const getTop10Evolution = (leagueId: string) => {
    const leagueStandings = lastSeasonStandings[leagueId];
    if (!leagueStandings) return [];

    const sortedIds = Object.keys(leagueStandings).sort((a, b) => {
      const sA = leagueStandings[a];
      const sB = leagueStandings[b];
      if (sB.points !== sA.points) return sB.points - sA.points;
      return (sB.goalsFor - sB.goalsAgainst) - (sA.goalsFor - sA.goalsAgainst);
    }).slice(0, 10);

    return sortedIds.map(id => {
      const evolution = seasonEvolutionReport.find(rep => rep.teamId === id);
      const currentTeam = teams[id];
      return {
        teamId: id,
        name: TEAMS.find(t => t.id === id)?.name || 'Team',
        oldStrength: evolution ? evolution.oldStrength : currentTeam.strength,
        newStrength: currentTeam.strength,
        leagueId
      };
    });
  };

  let displayData: any[] = [];
  if (activeLeague === 'all') {
    LEAGUES.forEach(l => {
      displayData = [...displayData, ...getTop10Evolution(l.id)];
    });
  } else {
    displayData = getTop10Evolution(activeLeague);
  }

  return (
    <Modal visible={true} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Evolución del Mundo</Text>
            <Text style={styles.subtitle}>Evolución Top 10 • Temporada Finalizada (Edad {lastSeasonAge})</Text>
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
                  {league.country} {league.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {displayData.map((item, index) => {
              const diff = item.newStrength - item.oldStrength;
              const isPositive = diff > 0;
              const isNegative = diff < 0;

              return (
                <View key={`${item.teamId}-${index}`} style={[styles.row, activeLeague === 'all' && index % 10 === 0 && index !== 0 && styles.leagueSeparator]}>
                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName} numberOfLines={1}>{item.name}</Text>
                    {activeLeague === 'all' && (
                        <Text style={styles.leagueLabel}>{LEAGUES.find(l => l.id === item.leagueId)?.name}</Text>
                    )}
                  </View>
                  
                  <View style={styles.statsInfo}>
                    <Text style={styles.oldStat}>{item.oldStrength}</Text>
                    <ArrowRight size={14} color="#71717a" style={styles.arrow} />
                    <Text style={[styles.newStat, isPositive ? styles.positiveText : isNegative ? styles.negativeText : styles.neutralText]}>
                      {item.newStrength}
                    </Text>
                    
                    <View style={[
                        styles.badge, 
                        isPositive ? styles.positiveBadge : isNegative ? styles.negativeBadge : styles.neutralBadge
                    ]}>
                      {isPositive ? <TrendingUp size={12} color="#10b981" /> : 
                       isNegative ? <TrendingDown size={12} color="#ef4444" /> : 
                       <Minus size={12} color="#71717a" />}
                      <Text style={[
                          styles.badgeText, 
                          isPositive ? styles.positiveText : isNegative ? styles.negativeText : styles.neutralText
                      ]}>
                        {isPositive ? `+${diff}` : diff === 0 ? '0' : diff}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
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
    backgroundColor: 'rgba(0,0,0,0.85)',
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#a1a1aa',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
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
    backgroundColor: '#3b82f6',
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
    padding: 10,
    backgroundColor: '#27272a',
    borderRadius: 12,
  },
  leagueSeparator: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#3f3f46',
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
  leagueLabel: {
    color: '#71717a',
    fontSize: 10,
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
  neutralText: {
    color: '#71717a',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
    minWidth: 40,
    justifyContent: 'center',
  },
  positiveBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  negativeBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  neutralBadge: {
    backgroundColor: 'rgba(113, 113, 122, 0.1)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
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
