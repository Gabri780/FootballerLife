import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';

interface MatchLiveScreenProps {
  finalHomeGoals: number;
  finalAwayGoals: number;
  homeName: string;
  awayName: string;
  onFinish: () => void;
  onBack: () => void;
}

export const MatchLiveScreen = ({ finalHomeGoals, finalAwayGoals, homeName, awayName, onFinish, onBack }: MatchLiveScreenProps) => {
  const [minute, setMinute] = useState(0);
  const [homeGoals, setHomeGoals] = useState(0);
  const [awayGoals, setAwayGoals] = useState(0);
  const [finished, setFinished] = useState(false);
  const goalEventsRef = useRef<{ minute: number; team: 'home' | 'away' }[]>([]);

  useEffect(() => {
    // Calcular minutos de gol aleatorios basados en los resultados finales recibidos
    const events: { minute: number; team: 'home' | 'away' }[] = [];
    for (let i = 0; i < finalHomeGoals; i++) {
      events.push({ minute: Math.floor(Math.random() * 88) + 1, team: 'home' });
    }
    for (let i = 0; i < finalAwayGoals; i++) {
      events.push({ minute: Math.floor(Math.random() * 88) + 1, team: 'away' });
    }
    events.sort((a, b) => a.minute - b.minute);
    goalEventsRef.current = events;

    let currentMin = 0;
    const interval = setInterval(() => {
      currentMin++;
      setMinute(currentMin);

      // Comprobar si hay gol en este minuto
      const goalsThisMinute = goalEventsRef.current.filter(g => g.minute === currentMin);
      goalsThisMinute.forEach(g => {
        if (g.team === 'home') setHomeGoals(h => h + 1);
        else setAwayGoals(a => a + 1);
      });

      if (currentMin >= 90) {
        setFinished(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [finalHomeGoals, finalAwayGoals]);

  const progress = Math.min(100, (minute / 90) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.teamHeaderName}>{homeName}</Text>
        <Text style={styles.vsText}>vs</Text>
        <Text style={styles.teamHeaderName}>{awayName}</Text>
      </View>

      <View style={styles.scoreboard}>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreNumber}>{homeGoals}</Text>
          <Text style={styles.scoreDash}>-</Text>
          <Text style={styles.scoreNumber}>{awayGoals}</Text>
        </View>

        <Text style={[styles.minuteText, finished && styles.finishedText]}>
          {finished ? 'FINAL' : `${minute}'`}
        </Text>

        {!finished && <Text style={styles.simulatingText}>SIMULANDO...</Text>}
      </View>

      <View style={styles.footer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>

        {finished && (
          <TouchableOpacity style={styles.finishButton} onPress={onFinish}>
            <Text style={styles.finishButtonText}>VER RESUMEN</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  teamHeaderName: {
    color: '#71717a',
    fontSize: 14,
    fontWeight: 'bold',
    maxWidth: 140,
    textAlign: 'center',
  },
  vsText: {
    color: '#3f3f46',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scoreboard: {
    alignItems: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  scoreNumber: {
    color: '#fff',
    fontSize: 96,
    fontWeight: 'bold',
  },
  scoreDash: {
    color: '#3f3f46',
    fontSize: 64,
    fontWeight: 'bold',
  },
  minuteText: {
    color: '#fbbf24',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
  },
  finishedText: {
    color: '#22c55e',
  },
  simulatingText: {
    color: '#3f3f46',
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 12,
  },
  footer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#27272a',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 40,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#a3e635',
  },
  finishButton: {
    backgroundColor: '#fbbf24',
    height: 60,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
