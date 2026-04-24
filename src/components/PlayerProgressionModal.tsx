import React from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useGameStore } from '../store/gameStore';

const STAT_LABELS = [
  { key: 'pace', label: 'RIT' },
  { key: 'shooting', label: 'TIR' },
  { key: 'passing', label: 'PAS' },
  { key: 'dribbling', label: 'REG' },
  { key: 'defending', label: 'DEF' },
  { key: 'physical', label: 'FÍS' },
];

export const PlayerProgressionModal = () => {
  const { playerProgressionReport, clearPlayerProgressionReport } = useGameStore();

  if (!playerProgressionReport) return null;

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

  const delta = playerProgressionReport.newOverall - playerProgressionReport.oldOverall;

  return (
    <Modal visible={true} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.card}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.header}>
                <Text style={styles.headerSubtitle}>RESUMEN DE TEMPORADA</Text>
                <Text style={styles.headerTitle}>{playerProgressionReport.age} AÑOS</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.seasonSummary}>
                <View style={styles.miniStat}>
                  <Text style={styles.miniLabel}>PJ</Text>
                  <Text style={styles.miniValue}>{playerProgressionReport.seasonAppearances}</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={styles.miniLabel}>G</Text>
                  <Text style={styles.miniValue}>{playerProgressionReport.seasonGoals}</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={styles.miniLabel}>A</Text>
                  <Text style={styles.miniValue}>{playerProgressionReport.seasonAssists}</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={styles.miniLabel}>RATING</Text>
                  <Text style={[styles.miniValue, { color: getRatingColor(playerProgressionReport.seasonAvgRating) }]}>
                    {playerProgressionReport.seasonAvgRating.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.overallSection}>
                <Text style={styles.sectionLabel}>OVERALL</Text>
                <View style={styles.overallRow}>
                  <Text style={styles.oldOverall}>{playerProgressionReport.oldOverall}</Text>
                  <Text style={styles.arrow}>→</Text>
                  <Text style={styles.newOverall}>{playerProgressionReport.newOverall}</Text>
                </View>
                <Text style={[
                  styles.deltaText, 
                  { color: delta > 0 ? '#22c55e' : delta < 0 ? '#ef4444' : '#71717a' }
                ]}>
                  {delta > 0 ? `+${delta}` : delta < 0 ? delta : 'SIN CAMBIOS'}
                </Text>
              </View>

              <View style={styles.statsSection}>
                <Text style={styles.sectionLabel}>ATRIBUTOS</Text>
                {STAT_LABELS.map((stat) => {
                  const oldValue = playerProgressionReport.oldStats[stat.key as keyof typeof playerProgressionReport.oldStats];
                  const newValue = playerProgressionReport.newStats[stat.key as keyof typeof playerProgressionReport.newStats];
                  const statDelta = newValue - oldValue;
                  const barColor = getStatColor(newValue);

                  return (
                    <View key={stat.key} style={styles.statRow}>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                      <Text style={styles.oldStatValue}>{oldValue}</Text>
                      <Text style={styles.smallArrow}>→</Text>
                      <View style={styles.statBarContainer}>
                        <View style={styles.statBarBg}>
                          <View 
                            style={[
                              styles.statBarFill, 
                              { width: `${(newValue / 99) * 100}%`, backgroundColor: barColor }
                            ]} 
                          />
                        </View>
                      </View>
                      <View style={styles.newStatContainer}>
                        <Text style={[styles.newStatValue, { color: barColor }]}>{newValue}</Text>
                        {statDelta !== 0 && (
                          <Text style={[
                            styles.miniDelta, 
                            { color: statDelta > 0 ? '#22c55e' : '#ef4444' }
                          ]}>
                            {statDelta > 0 ? `+${statDelta}` : statDelta}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={clearPlayerProgressionReport}
            >
              <Text style={styles.continueButtonText}>CONTINUAR</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 420,
    maxHeight: '85%',
  },
  card: {
    backgroundColor: '#18181b',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  header: {
    alignItems: 'center',
  },
  headerSubtitle: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#27272a',
    marginVertical: 20,
  },
  seasonSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  miniStat: {
    alignItems: 'center',
    flex: 1,
  },
  miniLabel: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  miniValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  overallSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionLabel: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 12,
  },
  overallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  oldOverall: {
    fontSize: 36,
    color: '#71717a',
  },
  arrow: {
    fontSize: 28,
    color: '#fbbf24',
  },
  newOverall: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  deltaText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statsSection: {
    marginTop: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    width: 40,
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  oldStatValue: {
    width: 28,
    color: '#71717a',
    fontSize: 13,
    textAlign: 'right',
  },
  smallArrow: {
    color: '#71717a',
    fontSize: 12,
    marginHorizontal: 4,
  },
  statBarContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  statBarBg: {
    height: 8,
    backgroundColor: '#27272a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  newStatContainer: {
    width: 28,
    alignItems: 'center',
  },
  newStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  miniDelta: {
    fontSize: 10,
    marginTop: -2,
  },
  continueButton: {
    backgroundColor: '#fbbf24',
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  continueButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
