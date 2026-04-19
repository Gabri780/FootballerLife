import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Star } from 'lucide-react-native';
import { TEAMS, LEAGUES } from '../data/leagues';

interface ChooseClubScreenProps {
  playerData: { name: string, country: string, position: string };
  onConfirm: (teamId: string) => void;
  onBack: () => void;
}

export const ChooseClubScreen: React.FC<ChooseClubScreenProps> = ({ playerData, onConfirm, onBack }) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const availableClubs = useMemo(() => {
    // Sort all teams by strength descending
    const sortedTeams = [...TEAMS].sort((a, b) => b.strength - a.strength);

    // Filter rules
    // 1. Grande A: Random from TOP 15
    const top15 = sortedTeams.slice(0, 15);
    const club1 = top15[Math.floor(Math.random() * top15.length)];

    // 2. Grande B: Random from TOP 15 excluding the first chosen
    const remainingTop15 = top15.filter(t => t.id !== club1.id);
    const club2 = remainingTop15[Math.floor(Math.random() * remainingTop15.length)];

    // 3. Mediano: Random from strength 78-84
    const midTeams = TEAMS.filter(t => t.strength >= 78 && t.strength <= 84 && t.id !== club1.id && t.id !== club2.id);
    const club3 = midTeams[Math.floor(Math.random() * midTeams.length)];

    return [
      { ...club1, type: 'ELITE' },
      { ...club2, type: 'ELITE' },
      { ...club3, type: 'MID' },
    ];
  }, []);

  const handleConfirm = () => {
    if (selectedTeamId) {
      onConfirm(selectedTeamId);
    }
  };

  return (
    <LinearGradient colors={['#0a2e14', '#15803d', '#78350f']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <ArrowLeft size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Elige tu primer club</Text>
            <Text style={styles.subtitle}>3 clubes interesados en ficharte, {playerData.name}</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {availableClubs.map((club) => {
            const leagueName = LEAGUES.find(l => l.id === club.leagueId)?.name || 'Liga';
            const isSelected = selectedTeamId === club.id;

            return (
              <TouchableOpacity
                key={club.id}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected
                ]}
                onPress={() => setSelectedTeamId(club.id)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.badge,
                  club.type === 'ELITE' ? styles.badgeElite : styles.badgeMid
                ]}>
                  <Text style={styles.badgeText}>
                    {club.type === 'ELITE' ? 'ÉLITE' : 'EQUIPO MEDIO'}
                  </Text>
                </View>

                <Text style={styles.clubName}>{club.name}</Text>
                <Text style={styles.leagueName}>{leagueName}</Text>

                <View style={styles.footerRow}>
                  <Star size={18} color="#fbbf24" fill="#fbbf24" style={{ marginRight: 6 }} />
                  <Text style={styles.statLabel}>Overall: </Text>
                  <Text style={styles.statValue}>{club.strength}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.confirmBtn, !selectedTeamId && styles.confirmBtnDisabled]}
            disabled={!selectedTeamId}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmBtnText}>COMENZAR CARRERA</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backBtn: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#fbbf24',
    backgroundColor: 'rgba(251,191,36,0.1)',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeElite: {
    backgroundColor: '#dc2626',
  },
  badgeMid: {
    backgroundColor: '#16a34a',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  clubName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  leagueName: {
    fontSize: 14,
    color: '#a1a1aa',
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  statLabel: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  statValue: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 24,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  confirmBtn: {
    backgroundColor: '#fbbf24',
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
  confirmBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
