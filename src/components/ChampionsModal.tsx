import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { TEAMS } from '../data/leagues';
import { X, Star } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ChampionsModal = ({ visible, onClose }: Props) => {
  const { champions } = useGameStore();

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Champions League</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {champions.rounds.map((round, index) => (
            <View key={index} style={styles.roundCard}>
              <Text style={styles.roundTitle}>{round.name}</Text>
              
              {round.results.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Pendiente de disputarse</Text>
                  {round.matches.map((m, i) => {
                     const hTeam = TEAMS.find(t => t.id === m.homeId)?.name || m.homeId;
                     const aTeam = TEAMS.find(t => t.id === m.awayId)?.name || m.awayId;
                     return (
                       <Text key={i} style={styles.matchPendingText}>
                         {hTeam} vs {aTeam}
                       </Text>
                     );
                  })}
                </View>
              ) : (
                round.results.map((result, i) => {
                  const hTeam = TEAMS.find(t => t.id === result.homeId)?.name || result.homeId;
                  const aTeam = TEAMS.find(t => t.id === result.awayId)?.name || result.awayId;
                  
                  return (
                    <View key={i} style={styles.matchRow}>
                      <View style={styles.teamContainer}>
                        <Text style={[
                          styles.teamName, 
                          (result.homeGoals > result.awayGoals || (result.homePens !== undefined && result.homePens > (result.awayPens || 0))) && styles.winner
                        ]}>{hTeam}</Text>
                      </View>
                      
                      <View style={styles.scoreContainer}>
                        <Text style={styles.scoreText}>
                          {result.homeGoals} - {result.awayGoals}
                          {result.homePens !== undefined && <Text style={styles.pensText}> ({result.homePens}-{result.awayPens} P)</Text>}
                        </Text>
                        {result.isSecondLeg && result.homeAgg !== undefined && (
                           <Text style={styles.aggText}>(Agg: {result.homeAgg}-{result.awayAgg})</Text>
                        )}
                      </View>

                      <View style={styles.teamContainerRight}>
                        <Text style={[
                          styles.teamNameRight, 
                          (result.awayGoals > result.homeGoals || (result.awayPens !== undefined && result.awayPens > (result.homePens || 0))) && styles.winner
                        ]}>{aTeam}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          ))}

          {champions.champion && (
            <View style={styles.championCard}>
              <Star color="#fbbf24" size={32} style={{ marginBottom: 10 }} />
              <Text style={styles.championTitle}>¡CAMPEÓN!</Text>
              <Text style={styles.championName}>{TEAMS.find(t => t.id === champions.champion)?.name}</Text>
            </View>
          )}
          
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
  content: {
    flex: 1,
    padding: 16,
  },
  roundCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  roundTitle: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(39, 39, 42, 0.5)',
  },
  teamContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  teamContainerRight: {
    flex: 1,
    alignItems: 'flex-start',
  },
  teamName: {
    color: '#e4e4e7',
    fontSize: 14,
    fontWeight: '500',
  },
  teamNameRight: {
    color: '#e4e4e7',
    fontSize: 14,
    fontWeight: '500',
  },
  winner: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scoreContainer: {
    paddingHorizontal: 12,
    alignItems: 'center',
    width: 90,
  },
  scoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aggText: {
    color: '#a1a1aa',
    fontSize: 10,
    marginTop: 2,
  },
  pensText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 10,
  },
  emptyText: {
    color: '#71717a',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  matchPendingText: {
    color: '#a1a1aa',
    fontSize: 13,
    marginBottom: 4,
  },
  championCard: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  championTitle: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  championName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  }
});
