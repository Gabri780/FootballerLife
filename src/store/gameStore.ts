import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TEAMS as INITIAL_TEAMS, LEAGUES, NATIONAL_TEAMS } from '../data/leagues';
import { generateLeagueSchedule, simulateMatch, WeekSchedule } from '../utils/engine';

export type EventLog = {
  id: string;
  text: string;
  type: 'good' | 'bad' | 'neutral' | 'info';
};

export type PlayerData = {
  name: string;
  age: number;
  matchesPlayed: number; // 38 matches = 1 year
  teamId: string;
  country?: string;
  position?: string;
};

export type StandingRecord = {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
};

export type TeamEvolution = {
  teamId: string;
  oldStrength: number;
  newStrength: number;
};

export type DynamicTeam = {
  id: string;
  name: string;
  leagueId: string;
  strength: number;
  form: number; // -5 to +5
  prestige: number; // 1 to 5
  yearsAtPeak: number; // Para medir ciclos de éxito
};

export type ChampionsMatch = {
  homeId: string;
  awayId: string;
  homeGoals: number;
  awayGoals: number;
  homePens?: number;
  awayPens?: number;
  homeAgg?: number;
  awayAgg?: number;
  isSecondLeg?: boolean;
};

export type ChampionsRound = {
  name: string;
  matches: { homeId: string; awayId: string }[];
  results: ChampionsMatch[];
};

export type ChampionsState = {
  participants: string[];
  rounds: ChampionsRound[];
  champion: string | null;
};

export type CupMatch = {
  homeId: string;
  awayId: string;
  homeGoals: number;
  awayGoals: number;
  homePens?: number;
  awayPens?: number;
  winner: string;
};

export type DomesticCup = {
  leagueId: string;
  name: string;
  rounds: {
    name: string;
    matches: { homeId: string; awayId: string }[];
    results: CupMatch[];
  }[];
  champion: string | null;
};

interface GameState {
  player: PlayerData;
  logs: EventLog[];

  // World State
  teams: Record<string, DynamicTeam>;
  schedules: Record<string, WeekSchedule[]>;
  standings: Record<string, Record<string, StandingRecord>>;
  history: Record<number, Record<string, Record<string, StandingRecord>>>;
  championsHistory: Record<number, { winnerId: string, runnerUpId: string, score: string }>;
  domesticCupsHistory: Record<number, Record<string, string>>; // age -> leagueId -> teamId
  worldCupHistory: Record<number, { winnerId: string, runnerUpId: string, score: string }>;
  euroCupHistory: Record<number, { winnerId: string, runnerUpId: string, score: string }>;
  seasonEvolutionReport: TeamEvolution[] | null;
  champions: ChampionsState;
  domesticCups: Record<string, DomesticCup>;
  nationalTeams: Record<string, DynamicTeam>;

  // Actions
  initializePlayer: () => void;
  advanceMatch: () => void;
  advanceSeason: () => Promise<void>;
  clearEvolutionReport: () => void;
  addLog: (text: string, type?: EventLog['type']) => void;
  resetGame: () => Promise<void>;
  hasSavedGame: () => Promise<boolean>;
  createPlayer: (name: string, country: string, position: string, teamId: string) => Promise<void>;
}

const FIRST_NAMES = ['Carlos', 'João', 'Mateo', 'Lucas', 'Lamine', 'Jude', 'Kylian', 'Alejandro', 'Enzo', 'Gavi'];
const LAST_NAMES = ['García', 'Silva', 'Martínez', 'Bellingham', 'Yamal', 'Mbappé', 'Garnacho', 'Fernández', 'Pedri'];

const generateRandomPlayer = () => {
  const name = `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`;
  const randomTeam = INITIAL_TEAMS[Math.floor(Math.random() * INITIAL_TEAMS.length)];

  return {
    player: {
      name,
      age: 18,
      matchesPlayed: 0,
      teamId: randomTeam.id,
    }
  };
};

const generateChampionsParticipants = (standings?: Record<string, Record<string, StandingRecord>>): string[] => {
  if (!standings) {
    const getTop = (lId: string, n: number) => INITIAL_TEAMS.filter(t => t.leagueId === lId).slice(0, n).map(t => t.id);
    return [...getTop('eng', 4), ...getTop('esp', 4), ...getTop('ita', 4), ...getTop('ger', 2), ...getTop('fra', 2)];
  } else {
    const getTop = (lId: string, n: number) => {
      if (!standings[lId]) return [];
      const sorted = Object.keys(standings[lId]).sort((a, b) => {
        const tA = standings[lId][a];
        const tB = standings[lId][b];
        if (!tA || !tB) return 0;
        if (tB.points !== tA.points) return tB.points - tA.points;
        const gdB = tB.goalsFor - tB.goalsAgainst;
        const gdA = tA.goalsFor - tA.goalsAgainst;
        if (gdB !== gdA) return gdB - gdA;
        return tB.goalsFor - tA.goalsFor; // Desempate por goles a favor
      });
      return sorted.slice(0, n);
    };
    return [...getTop('eng', 4), ...getTop('esp', 4), ...getTop('ita', 4), ...getTop('ger', 2), ...getTop('fra', 2)];
  }
}

const generateNextRound = (participants: string[], roundName: string): ChampionsRound => {
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  const matches = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    if (shuffled[i] && shuffled[i + 1]) {
      matches.push({ homeId: shuffled[i], awayId: shuffled[i + 1] });
    }
  }
  return { name: roundName, matches, results: [] };
}

const CHAMPIONS_SCHEDULE: Record<number, { roundIndex: number, isSecondLeg: boolean }> = {
  14: { roundIndex: 0, isSecondLeg: false }, // Octavos Ida
  18: { roundIndex: 0, isSecondLeg: true },  // Octavos Vuelta
  22: { roundIndex: 1, isSecondLeg: false }, // Cuartos Ida
  26: { roundIndex: 1, isSecondLeg: true },  // Cuartos Vuelta
  30: { roundIndex: 2, isSecondLeg: false }, // Semis Ida
  34: { roundIndex: 2, isSecondLeg: true },  // Semis Vuelta
  37: { roundIndex: 3, isSecondLeg: false }  // Final
};

const DOMESTIC_CUP_SCHEDULE: Record<number, number> = {
  6: 0,  // Octavos
  12: 1, // Cuartos
  20: 2, // Semis
  32: 3  // Final
};

const generateCupRound = (teamIds: string[], roundName: string) => {
  const shuffled = [...teamIds].sort(() => Math.random() - 0.5);
  const matches = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    if (shuffled[i] && shuffled[i + 1]) {
      matches.push({ homeId: shuffled[i], awayId: shuffled[i + 1] });
    }
  }
  return { name: roundName, matches, results: [] };
};

const createInitialWorld = () => {
  const schedules: Record<string, WeekSchedule[]> = {};
  const standings: Record<string, Record<string, StandingRecord>> = {};
  const teams: Record<string, DynamicTeam> = {};

  INITIAL_TEAMS.forEach(t => {
    const prestige = t.strength >= 88 ? 5 : t.strength >= 83 ? 4 : t.strength >= 78 ? 3 : t.strength >= 72 ? 2 : 1;
    teams[t.id] = { ...t, form: 0, prestige, yearsAtPeak: 0 };
  });

  LEAGUES.forEach(league => {
    const leagueTeams = INITIAL_TEAMS.filter(t => t.leagueId === league.id);
    const teamIds = leagueTeams.map(t => t.id);

    schedules[league.id] = generateLeagueSchedule(teamIds);
    standings[league.id] = {};

    teamIds.forEach(id => {
      standings[league.id][id] = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
    });
  });

  const initialParticipants = generateChampionsParticipants();
  const champions: ChampionsState = {
    participants: initialParticipants,
    rounds: [generateNextRound(initialParticipants, "Octavos de Final")],
    champion: null
  };

  const championsHistory: Record<number, { winnerId: string, runnerUpId: string, score: string }> = {};
  const domesticCupsHistory: Record<number, Record<string, string>> = {};

  const CUP_NAMES: Record<string, string> = {
    'eng': 'FA Cup',
    'esp': 'Copa del Rey',
    'ita': 'Coppa Italia',
    'ger': 'DFB-Pokal',
    'fra': 'Coupe de France',
  };

  const domesticCups: Record<string, DomesticCup> = {};
  LEAGUES.forEach(league => {
    const leagueTeams = INITIAL_TEAMS.filter(t => t.leagueId === league.id).slice(0, 16).map(t => t.id);
    domesticCups[league.id] = {
      leagueId: league.id,
      name: CUP_NAMES[league.id] || `Copa ${league.name}`,
      rounds: [generateCupRound(leagueTeams, "Octavos de Final")],
      champion: null
    };
  });

  const nationalTeams: Record<string, DynamicTeam> = {};
  NATIONAL_TEAMS.forEach(nt => {
    const prestige = nt.strength >= 88 ? 5 : nt.strength >= 83 ? 4 : nt.strength >= 78 ? 3 : nt.strength >= 72 ? 2 : 1;
    nationalTeams[nt.id] = { id: nt.id, name: nt.name, leagueId: 'world', strength: nt.strength, form: 0, prestige, yearsAtPeak: 0 };
  });

  return { schedules, standings, teams, history: {}, championsHistory, domesticCupsHistory, worldCupHistory: {}, euroCupHistory: {}, seasonEvolutionReport: null, champions, domesticCups, nationalTeams };
};

const clampForm = (val: number) => Math.max(-5, Math.min(5, val));
const clampStrength = (val: number) => Math.max(60, Math.min(99, val)); // Permitir hasta 99 para equipos históricos y bajar hasta 60

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...generateRandomPlayer(),
      ...createInitialWorld(),
      logs: [{ id: Date.now().toString(), text: 'Modo de simulación de mundo activado.', type: 'info' }],

      initializePlayer: () => {
        set({
          ...generateRandomPlayer(),
          ...createInitialWorld(),
          logs: [{ id: Date.now().toString(), text: 'Modo de simulación de mundo activado.', type: 'info' }],
        });
      },

      addLog: (text: string, type: EventLog['type'] = 'neutral') => {
        set((state) => ({
          logs: [{ id: Date.now().toString() + Math.random(), text, type }, ...state.logs].slice(0, 100)
        }));
      },

      clearEvolutionReport: () => set({ seasonEvolutionReport: null }),

      advanceMatch: () => {
        set((state) => {
          const { player, logs, schedules, standings, teams } = state;
          const weekIndex = player.matchesPlayed % 38;

          let eventLogs: EventLog[] = [];
          const newStandings = JSON.parse(JSON.stringify(standings)) as typeof standings;
          const newTeams = JSON.parse(JSON.stringify(teams)) as typeof teams;
          const newNationalTeams = JSON.parse(JSON.stringify(state.nationalTeams)) as typeof state.nationalTeams;

          LEAGUES.forEach(league => {
            const weekMatches = schedules[league.id][weekIndex];
            if (!weekMatches) return;

            weekMatches.forEach(match => {
              const homeId = match.homeTeamId;
              const awayId = match.awayTeamId;
              const homeTeam = newTeams[homeId];
              const awayTeam = newTeams[awayId];

              let isPlayerMatch = false;
              if (homeId === player.teamId || awayId === player.teamId) {
                isPlayerMatch = true;
              }

              // Simulation with FORM included
              const [homeGoals, awayGoals] = simulateMatch(homeTeam.strength, homeTeam.form, awayTeam.strength, awayTeam.form);

              // Update Standings
              const hs = newStandings[league.id][homeId];
              const as = newStandings[league.id][awayId];

              hs.played++; as.played++;
              hs.goalsFor += homeGoals; hs.goalsAgainst += awayGoals;
              as.goalsFor += awayGoals; as.goalsAgainst += homeGoals;

              // Update Points & Form
              if (homeGoals > awayGoals) {
                hs.won++; hs.points += 3; as.lost++;
                homeTeam.form = clampForm(homeTeam.form + 1);
                awayTeam.form = clampForm(awayTeam.form - 1);
              } else if (homeGoals < awayGoals) {
                as.won++; as.points += 3; hs.lost++;
                awayTeam.form = clampForm(awayTeam.form + 1);
                homeTeam.form = clampForm(homeTeam.form - 1);
              } else {
                hs.drawn++; as.drawn++;
                hs.points += 1; as.points += 1;
                // Form slowly rots towards 0 on draws
                if (homeTeam.form > 0) homeTeam.form--; else if (homeTeam.form < 0) homeTeam.form++;
                if (awayTeam.form > 0) awayTeam.form--; else if (awayTeam.form < 0) awayTeam.form++;
              }

              if (isPlayerMatch) {
                eventLogs.push({
                  id: Date.now().toString() + Math.random(),
                  text: `Jornada ${weekIndex + 1}: ${homeTeam.name} ${homeGoals} - ${awayGoals} ${awayTeam.name}`,
                  type: 'neutral'
                });
              }
            });
          });

          const matchesPlayed = player.matchesPlayed + 1;
          let currentAge = player.age;
          let historyCopy = state.history;
          let newChampionsHistory = state.championsHistory;
          let newDomesticCupsHistory = state.domesticCupsHistory;
          let newWorldCupHistory = state.worldCupHistory;
          let newEuroCupHistory = state.euroCupHistory;
          let newEvolutionReport: TeamEvolution[] | null = state.seasonEvolutionReport;
          const newChampions = JSON.parse(JSON.stringify(state.champions)) as ChampionsState;

          // CHAMPIONS SIMULATION
          const champSched = CHAMPIONS_SCHEDULE[weekIndex];
          if (champSched) {
            const round = newChampions.rounds[champSched.roundIndex];
            if (round && !newChampions.champion) {
              let nextRoundParticipants: string[] = [];

              round.matches.forEach((match, i) => {
                const isFinal = champSched.roundIndex === 3;
                let hId = match.homeId;
                let aId = match.awayId;
                if (champSched.isSecondLeg) {
                  hId = match.awayId;
                  aId = match.homeId;
                }

                const hTeam = newTeams[hId];
                const aTeam = newTeams[aId];
                if (!hTeam || !aTeam) return;

                const [hG, aG] = simulateMatch(
                  Math.max(80, hTeam.strength + 2), hTeam.form,
                  Math.max(80, aTeam.strength + 2), aTeam.form,
                  isFinal
                );

                let finalHomeGoals = hG;
                let finalAwayGoals = aG;
                let penaltiesH = 0;
                let penaltiesA = 0;
                let displayPens = "";

                if (isFinal) {
                  if (hG === aG) {
                    penaltiesH = 5; penaltiesA = 4;
                    if (Math.random() > 0.5) [penaltiesH, penaltiesA] = [4, 5];
                    displayPens = ` (${penaltiesH}-${penaltiesA} P)`;
                  }
                  const finalWinner = (penaltiesH > penaltiesA || (penaltiesH === 0 && hG > aG)) ? hId : aId;

                  eventLogs.push({
                    id: Date.now().toString() + Math.random(),
                    text: `🌟 FINAL CHAMPIONS: ${hTeam.name} ${hG} - ${aG} ${aTeam.name}${displayPens} 🌟`,
                    type: 'good'
                  });
                  newChampions.champion = finalWinner;
                  nextRoundParticipants.push(finalWinner);
                  round.results.push({
                    homeId: hId,
                    awayId: aId,
                    homeGoals: hG,
                    awayGoals: aG,
                    homePens: penaltiesH > 0 ? penaltiesH : undefined,
                    awayPens: penaltiesA > 0 ? penaltiesA : undefined
                  });
                } else if (champSched.isSecondLeg) {
                  const firstLeg = round.results[i];
                  if (firstLeg) {
                    const totalHomeAggregate = firstLeg.awayGoals + finalHomeGoals;
                    const totalAwayAggregate = firstLeg.homeGoals + finalAwayGoals;

                    if (totalHomeAggregate === totalAwayAggregate) {
                      penaltiesH = 5; penaltiesA = 4;
                      if (Math.random() > 0.5) [penaltiesH, penaltiesA] = [4, 5];
                      displayPens = ` (${penaltiesH}-${penaltiesA} P)`;
                    }

                    round.results.push({
                      homeId: hId,
                      awayId: aId,
                      homeGoals: hG,
                      awayGoals: aG,
                      homePens: penaltiesH > 0 ? penaltiesH : undefined,
                      awayPens: penaltiesA > 0 ? penaltiesA : undefined,
                      homeAgg: totalHomeAggregate,
                      awayAgg: totalAwayAggregate,
                      isSecondLeg: true
                    });

                    if (penaltiesH > penaltiesA || (penaltiesH === 0 && totalHomeAggregate > totalAwayAggregate)) {
                      nextRoundParticipants.push(hId);
                    } else {
                      nextRoundParticipants.push(aId);
                    }

                    const finalAggH = totalHomeAggregate;
                    const finalAggA = totalAwayAggregate;

                    if (player.teamId === hId || player.teamId === aId) {
                      eventLogs.push({
                        id: Date.now().toString() + Math.random(),
                        text: `🏆 CHAMPIONS (${round.name} Vuelta): ${hTeam.name} ${hG} - ${aG} ${aTeam.name}${displayPens} (Global: ${finalAggH}-${finalAggA})`,
                        type: 'good'
                      });
                    }
                  }
                } else {
                  round.results.push({
                    homeId: hId,
                    awayId: aId,
                    homeGoals: hG,
                    awayGoals: aG,
                  });

                  if (player.teamId === hId || player.teamId === aId) {
                    eventLogs.push({
                      id: Date.now().toString() + Math.random(),
                      text: `🏆 CHAMPIONS (${round.name} Ida): ${hTeam.name} ${hG} - ${aG} ${aTeam.name}`,
                      type: 'good'
                    });
                  }
                }
              });

              if (champSched.isSecondLeg) {
                if (champSched.roundIndex === 0) newChampions.rounds.push(generateNextRound(nextRoundParticipants, "Cuartos de Final"));
                else if (champSched.roundIndex === 1) newChampions.rounds.push(generateNextRound(nextRoundParticipants, "Semifinales"));
                else if (champSched.roundIndex === 2) newChampions.rounds.push(generateNextRound(nextRoundParticipants, "Final"));
              }
            }
          }

          // DOMESTIC CUP SIMULATION
          const newDomesticCups = JSON.parse(JSON.stringify(state.domesticCups)) as typeof state.domesticCups;
          const cupRoundIndex = DOMESTIC_CUP_SCHEDULE[weekIndex];
          if (cupRoundIndex !== undefined) {
            LEAGUES.forEach(league => {
              const cup = newDomesticCups[league.id];
              const round = cup.rounds[cupRoundIndex];
              if (round && !cup.champion) {
                let winners: string[] = [];
                round.matches.forEach(match => {
                  const hTeam = newTeams[match.homeId];
                  const aTeam = newTeams[match.awayId];
                  if (!hTeam || !aTeam) return;

                  let [hG, aG] = simulateMatch(hTeam.strength, hTeam.form, aTeam.strength, aTeam.form, cupRoundIndex === 3);

                  // Penalties for cup single-leg
                  let pH = 0;
                  let pA = 0;
                  let penaltiesStr = "";
                  if (hG === aG) {
                    pH = 5; pA = 4;
                    if (Math.random() > 0.5) [pH, pA] = [4, 5];
                    penaltiesStr = ` (${pH}-${pA} P)`;
                  }

                  const row: CupMatch = {
                    homeId: match.homeId,
                    awayId: match.awayId,
                    homeGoals: hG,
                    awayGoals: aG,
                    homePens: pH > 0 ? pH : undefined,
                    awayPens: pA > 0 ? pA : undefined,
                    winner: (pH > pA || (pH === 0 && hG > aG)) ? match.homeId : match.awayId
                  };
                  round.results.push(row);
                  winners.push(row.winner);

                  if (player.teamId === match.homeId || player.teamId === match.awayId) {
                    eventLogs.push({
                      id: Date.now().toString() + Math.random(),
                      text: `🏆 ${cup.name} (${round.name}): ${hTeam.name} ${hG} - ${aG} ${aTeam.name}${penaltiesStr}`,
                      type: row.winner === player.teamId ? 'good' : 'bad'
                    });
                  }
                });

                if (cupRoundIndex === 3) {
                  cup.champion = winners[0];
                  eventLogs.push({
                    id: Date.now().toString() + Math.random(),
                    text: `👑 El ${newTeams[winners[0]].name} se corona CAMPEÓN de la ${cup.name}`,
                    type: 'info'
                  });
                } else {
                  const nextRoundName = cupRoundIndex === 0 ? "Cuartos de Final" : cupRoundIndex === 1 ? "Semifinales" : "Final";
                  cup.rounds.push(generateCupRound(winners, nextRoundName));
                }
              }
            });
          }

          // End Of Season Logic (EVOLUTION ENGINE)
          if (matchesPlayed % 38 === 0) {
            historyCopy = JSON.parse(JSON.stringify(state.history));
            historyCopy[currentAge] = JSON.parse(JSON.stringify(newStandings));
            newEvolutionReport = [];

            currentAge++;
            eventLogs.push({ id: Date.now().toString() + Math.random(), text: `¡Termina la temporada! Edad: ${currentAge - 1}. Recalculando mundo...`, type: 'info' });

            // 1. Evaluate Team Evolution based on final Standings
            LEAGUES.forEach(league => {
              const leagueTeams = Object.keys(newStandings[league.id]);

              leagueTeams.sort((a, b) => {
                const teamA = newStandings[league.id][a];
                const teamB = newStandings[league.id][b];
                if (teamB.points !== teamA.points) return teamB.points - teamA.points;
                return (teamB.goalsFor - teamB.goalsAgainst) - (teamA.goalsFor - teamA.goalsAgainst);
              });

              const isPremier = league.id === 'eng';

              // Iterate over all teams to calculate evolution
              leagueTeams.forEach((id, index) => {
                const team = newTeams[id];
                const oldStrength = team.strength;
                team.form = 0; // Reset form

                const isTop4 = index < 4;
                const isTop2 = index < 2;
                const isRelegation = index >= leagueTeams.length - 3;

                // Actualizar estado de "Ciclo"
                if (isTop4) {
                  team.yearsAtPeak++;
                } else {
                  team.yearsAtPeak = Math.max(0, team.yearsAtPeak - 1);
                }

                // === 0. EVOLUCIÓN DINÁMICA DEL PRESTIGIO ===
                // El prestige sube si el equipo lleva 3+ años consecutivos en top 2
                if (isTop2 && team.yearsAtPeak >= 3 && team.prestige < 5) {
                  if (Math.random() < 0.35) { // 35% de probabilidad cada año de cumplir el umbral
                    team.prestige = Math.min(5, team.prestige + 1);
                    eventLogs.push({ id: Date.now().toString() + Math.random(), text: `⭐ ${team.name} asciende en prestigio (Prestige ${team.prestige}). ¡Un nuevo gigante europeo nace!`, type: 'good' });
                  }
                }
                // El prestige baja si un equipo de prestige alto lleva 4+ años en la zona baja
                if (isRelegation && team.yearsAtPeak === 0 && team.prestige > 2) {
                  if (Math.random() < 0.2) { // 20% de probabilidad de perder prestigio
                    team.prestige = Math.max(1, team.prestige - 1);
                    eventLogs.push({ id: Date.now().toString() + Math.random(), text: `📉 ${team.name} pierde reputación histórica (Prestige ${team.prestige}). Una caída generacional.`, type: 'bad' });
                  }
                }

                // === 1. SUELO Y TECHO DE PRESTIGIO ===
                const minStrength = 65 + (team.prestige * 4); // ej: Prestige 5 -> Suelo 85. Prestige 1 -> Suelo 69.

                // === 2. EVENTOS EXTREMOS (Generación Dorada & Fuga de Talentos) ===
                let extremeEventTriggered = false;

                // Fuga de Talentos (Equipos de bajo prestigio que brillan demasiado)
                if (team.prestige <= 3 && team.yearsAtPeak > 0 && team.strength >= 83) {
                  // Riesgo aumenta con los años en cima y fuerza total
                  const brainDrainRisk = 0.15 + (team.yearsAtPeak * 0.15);
                  if (Math.random() < brainDrainRisk) {
                    team.strength -= (Math.floor(Math.random() * 4) + 3); // Pierden de 3 a 6 puntos!
                    team.yearsAtPeak = 0; // Proyecto reseteado
                    extremeEventTriggered = true;
                    eventLogs.push({ id: Date.now().toString() + Math.random(), text: `📉 Fuga de Talentos: Gigantes europeos desmantelan al sorprendente ${team.name}.`, type: 'bad' });
                  }
                }

                // Generación Dorada (Equipos de media/baja tabla fuera de Champions con destellos)
                if (!extremeEventTriggered && !isTop4 && team.prestige <= 3) {
                  if (Math.random() < 0.03) { // 3% anual
                    team.strength += (Math.floor(Math.random() * 3) + 3); // Ganan de 3 a 5 puntos!
                    extremeEventTriggered = true;
                    eventLogs.push({ id: Date.now().toString() + Math.random(), text: `🌟 ¡Generación Dorada! La cantera del ${team.name} brilla de pronto y el equipo se dispara.`, type: 'good' });
                  }
                }

                // === 3. EVOLUCIÓN NORMAL ORGÁNICA ===
                if (!extremeEventTriggered) {
                  if (isTop4) {
                    // Fin de Ciclo Orgánico
                    const decayChance = 0.05 + (team.yearsAtPeak * 0.08); // Aumenta riesgo cada año en el top
                    if (Math.random() < decayChance) {
                      team.strength -= (Math.floor(Math.random() * 3) + 1); // Declive generacional
                      team.yearsAtPeak = 0;
                    } else {
                      // Impulso base de Champions (crecimiento controlado)
                      team.strength += (Math.floor(Math.random() * 2) + 1); // +1 a +2 max
                    }
                  } else if (isRelegation) {
                    // Rescate por Prestigio (Equipos gigantes "rebotan" antes de hundirse)
                    if (team.prestige === 5) {
                      team.strength += 2; // "Manager bounce" inmediato usando chequera
                    } else if (team.prestige >= 4) {
                      team.strength -= 1; // Crisis leve
                    } else {
                      team.strength -= (Math.floor(Math.random() * 3) + 2); // Relegación dura -2 a -4
                    }
                  } else if (index >= 4 && index <= 6) {
                    // Puestos Europa League
                    if (Math.random() > 0.4) team.strength += 1;
                  } else {
                    // Media Tabla
                    if (isPremier && Math.random() > 0.7) {
                      team.strength += 1; // Efecto económico Premier League
                    } else if (Math.random() > 0.6) {
                      team.strength += (Math.random() > 0.5 ? 1 : -1); // Volatilidad normal
                    }
                  }
                }

                // === 4. RUBBER-BANDING Y EQUILIBRIO ===
                // Limitador fuerte para super-equipos
                if (team.strength > 93) {
                  team.strength -= (Math.random() > 0.4 ? 1 : 0);
                  if (team.strength > 96) team.strength -= 1; // Soft-cap durísimo > 96
                }
                // Rebote "Cenicienta" para históricos malheridos
                if (team.strength < minStrength && Math.random() > 0.3) {
                  team.strength += (Math.floor(Math.random() * 2) + 1); // Suben automáticamente hacia su "Suelo" natural
                }

                team.strength = clampStrength(team.strength);

                if (team.strength !== oldStrength) {
                  newEvolutionReport!.push({
                    teamId: id,
                    oldStrength,
                    newStrength: team.strength
                  });
                }
              });

              // 2. Reset Standings for Next Year
              leagueTeams.forEach(id => {
                newStandings[league.id][id] = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
              });
            });

            // 3. Regen Schedules
            const nextSeasonSchedules = createInitialWorld().schedules;
            Object.assign(schedules, nextSeasonSchedules);

            // Guardar standings ANTES del reset para usarlos en Champions y Copa
            const finalSeasonStandings = JSON.parse(JSON.stringify(newStandings)) as typeof newStandings;

            newChampionsHistory = { ...state.championsHistory };
            if (newChampions.champion) {
              // Buscar la final en cualquier índice (puede no ser siempre el 3 si alguna ronda falló)
              const finalRound = newChampions.rounds.find(r => r.name === 'Final');
              const finalMatch = finalRound?.results[0];
              if (finalMatch) {
                const homeWinsByGoals = finalMatch.homeGoals > finalMatch.awayGoals;
                const homeWinsByPens = (finalMatch.homePens || 0) > (finalMatch.awayPens || 0);
                const winnerIsHome = homeWinsByGoals || (finalMatch.homeGoals === finalMatch.awayGoals && homeWinsByPens);
                const winnerId = winnerIsHome ? finalMatch.homeId : finalMatch.awayId;
                const loserId = winnerIsHome ? finalMatch.awayId : finalMatch.homeId;
                const winG = winnerIsHome ? finalMatch.homeGoals : finalMatch.awayGoals;
                const loseG = winnerIsHome ? finalMatch.awayGoals : finalMatch.homeGoals;
                const winPens = winnerIsHome ? (finalMatch.homePens || 0) : (finalMatch.awayPens || 0);
                const losePens = winnerIsHome ? (finalMatch.awayPens || 0) : (finalMatch.homePens || 0);
                const pensStr = winPens > 0 ? ` (${winPens}-${losePens} P)` : "";

                newChampionsHistory[currentAge - 1] = {
                  winnerId,
                  runnerUpId: loserId,
                  score: `${winG}-${loseG}${pensStr}`
                };
              }
            }

            newDomesticCupsHistory = { ...state.domesticCupsHistory };
            const currentCupsHistory: Record<string, string> = {};
            LEAGUES.forEach(league => {
              if (newDomesticCups[league.id].champion) {
                currentCupsHistory[league.id] = newDomesticCups[league.id].champion!;
              }
            });
            newDomesticCupsHistory[currentAge - 1] = currentCupsHistory;

            // Bonus de fortaleza para el campeón de la Champions (atrae jugadores top)
            if (newChampions.champion && newTeams[newChampions.champion]) {
              const champTeam = newTeams[newChampions.champion];
              champTeam.strength = clampStrength(champTeam.strength + 2);
              champTeam.prestige = Math.min(5, champTeam.prestige + (champTeam.prestige < 4 ? 1 : 0));
              eventLogs.push({ id: Date.now().toString() + Math.random(), text: `🏆 ${champTeam.name} ficha estrellas mundiales tras ganar la Champions. +2 Fuerza.`, type: 'good' });
            }

            // Usar standings FINALES (pre-reset) para calcular los participantes correctos
            const nextParticipants = generateChampionsParticipants(finalSeasonStandings);
            newChampions.participants = nextParticipants;
            newChampions.rounds = [generateNextRound(nextParticipants, "Octavos de Final")];
            newChampions.champion = null;

            // Reset Domestic Cups usando el ranking final de la temporada
            LEAGUES.forEach(league => {
              // Ordenar equipos por clasificación final (no por orden de objeto)
              const sortedTeams = Object.keys(finalSeasonStandings[league.id] || {}).sort((a, b) => {
                const tA = finalSeasonStandings[league.id][a];
                const tB = finalSeasonStandings[league.id][b];
                if (!tA || !tB) return 0;
                if (tB.points !== tA.points) return tB.points - tA.points;
                return (tB.goalsFor - tB.goalsAgainst) - (tA.goalsFor - tA.goalsAgainst);
              });
              const leagueTeams = sortedTeams.slice(0, 16); // Top 16 clasificados para copa
              newDomesticCups[league.id] = {
                leagueId: league.id,
                name: newDomesticCups[league.id].name,
                rounds: [generateCupRound(leagueTeams, "Octavos de Final")],
                champion: null
              };
            });

            // WORLD CUP LOGIC: Every 4 years (starting first season 2026 at age 18->19)
            if ((currentAge - 15) % 4 === 0) {
              eventLogs.push({ id: Date.now().toString() + Math.random(), text: `🌍🏆 ¡MUNDIAL DE SELECCIONES EN JUEGO! 🏆🌍`, type: 'info' });

              // Simular un torneo relámpago de 16 equipos
              const participantsIds = Object.keys(newNationalTeams);
              let roundTeams = [...participantsIds];

              // Octavos (16 -> 8), Cuartos (8 -> 4), Semis (4 -> 2), Final (2 -> 1)
              const roundsConfig = ['Octavos', 'Cuartos', 'Semifinales', 'Final'];
              let finalMatchResult = null;

              for (let r = 0; r < roundsConfig.length; r++) {
                let nextRoundTeams = [];
                // Shuffle for random draw
                roundTeams.sort(() => Math.random() - 0.5);

                for (let i = 0; i < roundTeams.length; i += 2) {
                  const hId = roundTeams[i];
                  const aId = roundTeams[i + 1];
                  if (!hId || !aId) continue;

                  const hT = newNationalTeams[hId];
                  const aT = newNationalTeams[aId];

                  let [hG, aG] = simulateMatch(hT.strength, 0, aT.strength, 0, true);
                  let pens = "";
                  let isHWin = hG > aG;
                  if (hG === aG) {
                    let pH = 5; let pA = 4;
                    if (Math.random() > 0.5) [pH, pA] = [4, 5];
                    pens = ` (${pH}-${pA} P)`;
                    isHWin = pH > pA;
                  }
                  nextRoundTeams.push(isHWin ? hId : aId);

                  if (roundsConfig[r] === 'Final') {
                    finalMatchResult = {
                      winId: isHWin ? hId : aId,
                      loseId: isHWin ? aId : hId,
                      winG: isHWin ? hG : aG,
                      loseG: isHWin ? aG : hG,
                      displayPens: pens
                    };
                  }
                }
                roundTeams = nextRoundTeams;
              }

              if (finalMatchResult) {
                newWorldCupHistory = { ...state.worldCupHistory };
                newWorldCupHistory[currentAge - 1] = {
                  winnerId: finalMatchResult.winId,
                  runnerUpId: finalMatchResult.loseId,
                  score: `${finalMatchResult.winG}-${finalMatchResult.loseG}${finalMatchResult.displayPens}`
                };
                const champName = newNationalTeams[finalMatchResult.winId].name;
                const runName = newNationalTeams[finalMatchResult.loseId].name;

                eventLogs.push({
                  id: Date.now().toString() + Math.random(),
                  text: `👑 ¡MUNDIAL: ${champName} CAMPEÓN DEL MUNDO! (Venció ${finalMatchResult.winG}-${finalMatchResult.loseG}${finalMatchResult.displayPens} a ${runName})`,
                  type: 'good'
                });
              }

              // Evolución de selecciones post-mundial
              participantsIds.forEach(id => {
                const team = newNationalTeams[id];
                if (Math.random() > 0.5) team.strength += (Math.random() > 0.5 ? 1 : -1);
                team.strength = clampStrength(team.strength);
              });
            }

            // EUROCOPA LOGIC: Every 4 years (offset by 2 from World Cup, starting at age 20->21)
            if ((currentAge - 17) % 4 === 0) {
              eventLogs.push({ id: Date.now().toString() + Math.random(), text: `🇪🇺🏆 ¡EUROCOPA EN JUEGO! 🏆🇪🇺`, type: 'info' });

              const euroTeamIds = ['fra', 'eng', 'esp', 'por', 'nee', 'ita', 'ger', 'bel', 'cro'];
              // Filtrar solo los IDs que existen en el estado dinámico de selecciones (evita crashes)
              const validEuroIds = euroTeamIds.filter(id => !!newNationalTeams[id]);
              // Simular un torneo relámpago de 8 equipos europeos más fuertes
              const participantsIds = validEuroIds.sort((a, b) => newNationalTeams[b].strength - newNationalTeams[a].strength).slice(0, 8);
              let roundTeams = [...participantsIds];

              // Cuartos (8 -> 4), Semis (4 -> 2), Final (2 -> 1)
              const roundsConfig = ['Cuartos', 'Semifinales', 'Final'];
              let finalMatchResult = null;

              for (let r = 0; r < roundsConfig.length; r++) {
                let nextRoundTeams = [];
                // Shuffle for random draw
                roundTeams.sort(() => Math.random() - 0.5);

                for (let i = 0; i < roundTeams.length; i += 2) {
                  const hId = roundTeams[i];
                  const aId = roundTeams[i + 1];
                  if (!hId || !aId) continue;

                  const hT = newNationalTeams[hId];
                  const aT = newNationalTeams[aId];

                  let [hG, aG] = simulateMatch(hT.strength, 0, aT.strength, 0, true);
                  let pens = "";
                  let isHWin = hG > aG;
                  if (hG === aG) {
                    let pH = 5; let pA = 4;
                    if (Math.random() > 0.5) [pH, pA] = [4, 5];
                    pens = ` (${pH}-${pA} P)`;
                    isHWin = pH > pA;
                  }
                  nextRoundTeams.push(isHWin ? hId : aId);

                  if (roundsConfig[r] === 'Final') {
                    finalMatchResult = {
                      winId: isHWin ? hId : aId,
                      loseId: isHWin ? aId : hId,
                      winG: isHWin ? hG : aG,
                      loseG: isHWin ? aG : hG,
                      displayPens: pens
                    };
                  }
                }
                roundTeams = nextRoundTeams;
              }

              if (finalMatchResult) {
                newEuroCupHistory = { ...state.euroCupHistory };
                newEuroCupHistory[currentAge - 1] = {
                  winnerId: finalMatchResult.winId,
                  runnerUpId: finalMatchResult.loseId,
                  score: `${finalMatchResult.winG}-${finalMatchResult.loseG}${finalMatchResult.displayPens}`
                };
                const champName = newNationalTeams[finalMatchResult.winId].name;
                const runName = newNationalTeams[finalMatchResult.loseId].name;

                eventLogs.push({
                  id: Date.now().toString() + Math.random(),
                  text: `👑 ¡EUROCOPA: ${champName} REY DE EUROPA! (Venció ${finalMatchResult.winG}-${finalMatchResult.loseG}${finalMatchResult.displayPens} a ${runName})`,
                  type: 'good'
                });
              }

              // Evolución de selecciones europeas post-eurocopa
              participantsIds.forEach(id => {
                const team = newNationalTeams[id];
                if (Math.random() > 0.5) team.strength += (Math.random() > 0.5 ? 1 : -1);
                team.strength = clampStrength(team.strength);
              });
            }
          }

          return {
            player: { ...player, matchesPlayed, age: currentAge },
            teams: newTeams,
            standings: newStandings,
            schedules: schedules,
            history: historyCopy,
            championsHistory: newChampionsHistory,
            domesticCupsHistory: newDomesticCupsHistory,
            worldCupHistory: newWorldCupHistory,
            euroCupHistory: newEuroCupHistory,
            seasonEvolutionReport: newEvolutionReport,
            champions: newChampions,
            domesticCups: newDomesticCups,
            nationalTeams: newNationalTeams,
            logs: [...eventLogs.reverse(), ...logs].slice(0, 100)
          };
        });
      },

      advanceSeason: async () => {
        for (let i = 0; i < 38; i++) {
          await new Promise(resolve => setTimeout(resolve, 0));
          get().advanceMatch();
        }
      },

      resetGame: async () => {
        await AsyncStorage.removeItem('footballerlife-storage');
        set({
          ...generateRandomPlayer(),
          ...createInitialWorld(),
          logs: [{ id: Date.now().toString(), text: 'Partida reiniciada.', type: 'info' }],
        });
      },

      hasSavedGame: async () => {
        const saved = await AsyncStorage.getItem('footballerlife-storage');
        return saved !== null;
      },

      createPlayer: async (name, country, position, teamId) => {
        await AsyncStorage.removeItem('footballerlife-storage');
        set({
          ...createInitialWorld(),
          player: {
            name,
            age: 18,
            matchesPlayed: 0,
            teamId,
            country,
            position,
          },
          logs: [{
            id: Date.now().toString(),
            text: `¡Bienvenido ${name}! Comienza tu carrera en el fútbol.`,
            type: 'info'
          }],
        });
      }
    }),
    {
      name: 'footballerlife-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      partialize: (state) => {
        const { seasonEvolutionReport, ...rest } = state;
        return rest;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[FootballerLife] Error al cargar estado guardado:', error);
        } else if (state) {
          console.log('[FootballerLife] Estado cargado desde disco. Edad del jugador:', state.player?.age);
        } else {
          console.log('[FootballerLife] No hay estado guardado, iniciando partida nueva.');
        }
      },
    }
  ));
