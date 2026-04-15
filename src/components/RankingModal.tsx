import React from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { LEAGUES } from '../data/leagues';
import { X, Award, Shield } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const RankingModal = ({ visible, onClose }: Props) => {
  const { teams } = useGameStore();

  if (!visible) return null;

  // Convert teams record to array and sort by strength
  const sortedTeams = Object.values(teams)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 15);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Award color="#fbbf24" size={24} style={{ marginRight: 8 }} />
            <Text style={styles.title}>Top 15 Mundial</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoBar}>
          <Text style={styles.infoText}>Los clubes más poderosos del planeta en la actualidad.</Text>
        </View>

        <ScrollView style={styles.list}>
          {sortedTeams.map((team, index) => {
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
  },
  infoText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '500',
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
