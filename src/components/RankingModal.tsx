import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { LEAGUES, NATIONAL_TEAMS } from '../data/leagues';
import { X, Award, Shield, Globe } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const RankingModal = ({ visible, onClose }: Props) => {
  const { teams, nationalTeams } = useGameStore();
  const [activeTab, setActiveTab] = useState<'clubs' | 'nations'>('clubs');

  if (!visible) return null;

  const sortedClubs = Object.values(teams)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 15);
    
  const sortedNations = Object.values(nationalTeams)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 15);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {activeTab === 'clubs' ? (
                <Award color="#fbbf24" size={24} style={{ marginRight: 8 }} />
            ) : (
                <Globe color="#fbbf24" size={24} style={{ marginRight: 8 }} />
            )}
            <Text style={styles.title}>{activeTab === 'clubs' ? 'Top 15 Clubes' : 'Top Selecciones'}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'clubs' && styles.activeTab]} 
            onPress={() => setActiveTab('clubs')}
          >
            <Text style={[styles.tabText, activeTab === 'clubs' && styles.activeTabText]}>Clubes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'nations' && styles.activeTab]} 
            onPress={() => setActiveTab('nations')}
          >
            <Text style={[styles.tabText, activeTab === 'nations' && styles.activeTabText]}>Selecciones</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBar}>
          <Text style={styles.infoText}>
            {activeTab === 'clubs' 
               ? 'Los clubes más poderosos del planeta en la actualidad.' 
               : 'Las selecciones nacionales más fuertes del mundo.'}
          </Text>
        </View>

        <ScrollView style={styles.list}>
          {activeTab === 'clubs' ? sortedClubs.map((team, index) => {
            const league = LEAGUES.find(l => l.id === team.leagueId);
            const isTop3 = index < 3;
            
            return (
              <View key={team.id} style={[styles.row, isTop3 && styles.top3Row]}>
                <View style={styles.rankContainer}>
                  <Text style={[styles.rankText, isTop3 && styles.top3RankText]}>#{index + 1}</Text>
                </View>

                <View style={styles.teamMain}>
                  <Text style={styles.teamName} numberOfLines={1}>{team.name}</Text>
                  <Text style={styles.leagueName}>{league?.country} {league?.name}</Text>
                </View>

                <View style={styles.strengthContainer}>
                  <Shield size={14} color={isTop3 ? "#fbbf24" : "#71717a"} style={{ marginRight: 4 }} />
                  <Text style={[styles.strengthText, isTop3 && styles.top3StrengthText]}>{team.strength}</Text>
                </View>
              </View>
            );
          }) : sortedNations.map((team, index) => {
            const nationData = NATIONAL_TEAMS.find(n => n.id === team.id);
            const isTop3 = index < 3;
            
            return (
              <View key={team.id} style={[styles.row, isTop3 && styles.top3Row]}>
                <View style={styles.rankContainer}>
                  <Text style={[styles.rankText, isTop3 && styles.top3RankText]}>#{index + 1}</Text>
                </View>

                <View style={styles.teamMain}>
                  <Text style={styles.teamName} numberOfLines={1}>{nationData?.flag} {team.name}</Text>
                  <Text style={styles.leagueName}>Selección Nacional</Text>
                </View>

                <View style={styles.strengthContainer}>
                  <Shield size={14} color={isTop3 ? "#fbbf24" : "#71717a"} style={{ marginRight: 4 }} />
                  <Text style={[styles.strengthText, isTop3 && styles.top3StrengthText]}>{team.strength}</Text>
                </View>
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
  infoBar: {
    padding: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  infoText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#18181b',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#27272a',
  },
  tabText: {
    color: '#a1a1aa',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#18181b',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  top3Row: {
    borderColor: 'rgba(251, 191, 36, 0.3)',
    backgroundColor: 'rgba(251, 191, 36, 0.02)',
  },
  rankContainer: {
    width: 40,
  },
  rankText: {
    color: '#71717a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  top3RankText: {
    color: '#fbbf24',
  },
  teamMain: {
    flex: 1,
  },
  teamName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  leagueName: {
    color: '#71717a',
    fontSize: 12,
    marginTop: 2,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#09090b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  strengthText: {
    color: '#e4e4e7',
    fontSize: 18,
    fontWeight: '900',
  },
  top3StrengthText: {
    color: '#fbbf24',
  }
});
