import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { LEAGUES, TEAMS } from '../data/leagues';
import { X } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const StandingsModal = ({ visible, onClose }: Props) => {
  const { standings } = useGameStore();
  const [activeLeague, setActiveLeague] = useState(LEAGUES[0].id);

  if (!visible) return null;

  const currentStandings = standings[activeLeague];
  
  // Sort teams by points, then goal difference, then goals for
  const sortedTeams = Object.keys(currentStandings || {}).sort((a, b) => {
    const teamA = currentStandings[a];
    const teamB = currentStandings[b];
    
    if (teamB.points !== teamA.points) return teamB.points - teamA.points;
    
    const gdA = teamA.goalsFor - teamA.goalsAgainst;
    const gdB = teamB.goalsFor - teamB.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    
    return teamB.goalsFor - teamA.goalsFor;
  });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Clasificaciones</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
        </View>

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
          <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>PJ</Text>
          <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>DG</Text>
          <Text style={[styles.thText, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>PTS</Text>
        </View>

        {/* Standings List */}
        <ScrollView style={styles.tableList}>
          {sortedTeams.map((teamId, index) => {
            const rowStr = currentStandings[teamId];
            const team = TEAMS.find(t => t.id === teamId);
            const gd = rowStr.goalsFor - rowStr.goalsAgainst;
            
            return (
              <View key={teamId} style={styles.tableRow}>
                <Text style={[styles.tdText, { flex: 0.8, color: '#a1a1aa' }]}>{index + 1}</Text>
                <Text style={[styles.tdText, { flex: 4, fontWeight: '500' }]} numberOfLines={1}>{team?.name}</Text>
                <Text style={[styles.tdText, { flex: 1, textAlign: 'center' }]}>{rowStr.played}</Text>
                <Text style={[styles.tdText, { flex: 1, textAlign: 'center' }]}>
                  {gd > 0 ? `+${gd}` : gd}
                </Text>
                <Text style={[styles.tdText, { flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#a3e635' }]}>
                  {rowStr.points}
                </Text>
              </View>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>

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
    backgroundColor: '#a3e635',
  },
  tabText: {
    color: '#a1a1aa',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#000',
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
