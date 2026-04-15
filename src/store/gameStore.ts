import { create } from 'zustand';
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
};

export type ChampionsMatch = {
  homeId: string;
  awayId: string;
  homeGoals: number;
  awayGoals: number;
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
  advanceSeason: () => void;
  clearEvolutionReport: () => void;
  addLog: (text: string, type?: EventLog['type']) => void;
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
       const sorted = Object.keys(standings[lId]).sort((a,b) => {
          const tA = standings[lId][a];
          const tB = standings[lId][b];
          if (tB.points !== tA.points) return tB.points - tA.points;
          return (tB.goalsFor - tB.goalsAgainst) - (tA.goalsFor - tA.goalsAgainst);
       });
       return sorted.slice(0, n);
    };
    return [...getTop('eng', 4), ...getTop('esp', 4), ...getTop('ita', 4), ...getTop('ger', 2), ...getTop('fra', 2)];
  }
}

const generateNextRound = (participants: string[], roundName: string): ChampionsRound => {
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  const matches = [];
  for(let i=0; i<shuffled.length; i+=2) {
     if (shuffled[i] && shuffled[i+1]) {
       matches.push({ homeId: shuffled[i], awayId: shuffled[i+1] });
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
    teams[t.id] = { ...t, form: 0 };
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

  const domesticCups: Record<string, DomesticCup> = {};
  LEAGUES.forEach(league => {
    const leagueTeams = INITIAL_TEAMS.filter(t => t.leagueId === league.id).slice(0, 16).map(t => t.id);
    domesticCups[league.id] = {
      leagueId: league.id,
      name: `Copa de ${league.name === 'Premier League' ? 'Inglaterra' : league.name === 'La Liga' ? 'España' : 'Liga'}`,
      rounds: [generateCupRound(leagueTeams, "Octavos de Final")],
      champion: null
    };
  });

  const nationalTeams: Record<string, DynamicTeam> = {};
  NATIONAL_TEAMS.forEach(nt => {
    nationalTeams[nt.id] = { id: nt.id, name: nt.name, leagueId: 'world', strength: nt.strength, form: 0 };
  });

  return { schedules, standings, teams, history: {}, championsHistory, domesticCupsHistory, worldCupHistory: {}, euroCupHistory: {}, seasonEvolutionReport: null, champions, domesticCups, nationalTeams };
};

const clampForm = (val: number) => Math.max(-5, Math.min(5, val));
const clampStrength = (val: number) => Math.max(60, Math.min(99, val)); // Permitir hasta 99 para equipos históricos y bajar hasta 60

export const useGameStore = create<GameState>()((set, get) => ({
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
                 if (Math.random() > 0.5) penaltiesH = 1; else penaltiesA = 1;
                 displayPens = " (P)";
              }
              const finalWinner = (hG + penaltiesH > aG + penaltiesA) ? hId : aId;
              
              eventLogs.push({
                 id: Date.now().toString() + Math.random(),
                 text: `🌟 FINAL CHAMPIONS: ${hTeam.name} ${hG + penaltiesH} - ${aG + penaltiesA} ${aTeam.name}${displayPens} 🌟`,
                 type: 'good'
              });
              newChampions.champion = finalWinner;
              nextRoundParticipants.push(finalWinner);
              round.results.push({
                homeId: hId,
                awayId: aId,
                homeGoals: hG + penaltiesH,
                awayGoals: aG + penaltiesA
              });
            } else if (champSched.isSecondLeg) {
              const firstLeg = round.results[i];
              if (firstLeg) {
                const totalHomeAggregate = firstLeg.awayGoals + finalHomeGoals; 
                const totalAwayAggregate = firstLeg.homeGoals + finalAwayGoals; 
                
                if (totalHomeAggregate === totalAwayAggregate) {
                   if (Math.random() > 0.5) penaltiesH = 1; else penaltiesA = 1;
                   displayPens = " (P)";
                }

                round.results.push({
                  homeId: hId,
                  awayId: aId,
                  homeGoals: hG + penaltiesH,
                  awayGoals: aG + penaltiesA,
                  homeAgg: totalHomeAggregate + penaltiesH,
                  awayAgg: totalAwayAggregate + penaltiesA,
                  isSecondLeg: true
                });

                if (totalHomeAggregate + penaltiesH > totalAwayAggregate + penaltiesA) {
                   nextRoundParticipants.push(hId);
                } else {
                   nextRoundParticipants.push(aId);
                }

                if (player.teamId === hId || player.teamId === aId) {
                   eventLogs.push({
                     id: Date.now().toString() + Math.random(),
                     text: `🏆 CHAMPIONS (${round.name} Vuelta): ${hTeam.name} ${hG + penaltiesH} - ${aG + penaltiesA} ${aTeam.name}${displayPens} (Global: ${totalHomeAggregate + penaltiesH}-${totalAwayAggregate + penaltiesA})`,
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
                      let penalties = "";
                      if (hG === aG) {
                          if (Math.random() > 0.5) { hG++; penalties = " (P)"; }
                          else { aG++; penalties = " (P)"; }
                      }

                      const row = {
                          homeId: match.homeId,
                          awayId: match.awayId,
                          homeGoals: hG,
                          awayGoals: aG,
                          winner: hG > aG ? match.homeId : match.awayId
                      };
                      round.results.push(row);
                      winners.push(row.winner);

                      if (player.teamId === match.homeId || player.teamId === match.awayId) {
                          eventLogs.push({
                              id: Date.now().toString() + Math.random(),
                              text: `🏆 ${cup.name} (${round.name}): ${hTeam.name} ${hG} - ${aG} ${aTeam.name}${penalties}`,
                              type: hG > aG ? (player.teamId === match.homeId ? 'good' : 'bad') : (player.teamId === match.awayId ? 'good' : 'bad')
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

            // Iterate over all teams to calculate evolution
            leagueTeams.forEach((id, index) => {
               const team = newTeams[id];
               const oldStrength = team.strength;
               team.form = 0; // Reset form

               // Bonus for Top 4 (o Fin de Ciclo)
               if (index < 4) {
                 // 15% de probabilidad de "Fin de ciclo" o desmantelamiento tras el éxito
                 if (Math.random() < 0.15) {
                   team.strength -= (Math.floor(Math.random() * 3) + 1); // Pierden de 1 a 3 puntos
                 } else {
                   // Champions League boost: +1 to +3
                   team.strength += (Math.floor(Math.random() * 3) + 1);
                 }
               } 
               // Penalty for Bottom 3
               else if (index >= leagueTeams.length - 3) {
                 // Relegation/Crisis: -2 to -4
                 team.strength -= (Math.floor(Math.random() * 3) + 2);
               }
               // Mid-table European spots (5, 6, 7) got a slight boost
               else if (index >= 4 && index <= 6) {
                 if (Math.random() > 0.5) team.strength += 1;
               }

               // Regression to mean applying to new strength
               if (team.strength > 92 && Math.random() > 0.5) {
                   team.strength -= 1; // "Tax" for being too good (aging, complacent)
                   if (Math.random() > 0.8) team.strength -= 1; // Severe tax
               } else if (team.strength < 75 && Math.random() > 0.5) {
                   team.strength += 1; // Lower teams get "new manager bounce"
                   if (Math.random() > 0.8) team.strength += 1;
               } else if (Math.random() > 0.6) {
                   // More volatile mid-table (40% chance to evolve)
                   team.strength += (Math.random() > 0.5 ? 1 : -1);
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

        newChampionsHistory = { ...state.championsHistory };
        if (newChampions.champion) {
           const finalRound = newChampions.rounds[3]; // Final
           const finalMatch = finalRound.results[0];
           if (finalMatch) {
              const isHomeWinner = finalMatch.homeGoals > finalMatch.awayGoals;
              const winId = isHomeWinner ? finalMatch.homeId : finalMatch.awayId;
              const loseId = isHomeWinner ? finalMatch.awayId : finalMatch.homeId;
              const winG = isHomeWinner ? finalMatch.homeGoals : finalMatch.awayGoals;
              const loseG = isHomeWinner ? finalMatch.awayGoals : finalMatch.homeGoals;

              newChampionsHistory[currentAge - 1] = {
                 winnerId: winId,
                 runnerUpId: loseId,
                 score: `${winG}-${loseG}`
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

        const nextParticipants = generateChampionsParticipants(newStandings);
        newChampions.participants = nextParticipants;
        newChampions.rounds = [generateNextRound(nextParticipants, "Octavos de Final")];
        newChampions.champion = null;

        // Reset Domestic Cups
        LEAGUES.forEach(league => {
           const leagueTeams = Object.keys(newStandings[league.id]).slice(0, 16); // Top 16 for next year's cup
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
                   const aId = roundTeams[i+1];
                   if (!hId || !aId) continue;
                   
                   const hT = newNationalTeams[hId];
                   const aT = newNationalTeams[aId];
                   
                   let [hG, aG] = simulateMatch(hT.strength, 0, aT.strength, 0, true);
                   let pens = "";
                   if (hG === aG) {
                       if (Math.random() > 0.5) { hG++; pens = " (P)"; }
                       else { aG++; pens = " (P)"; }
                   }
                   
                   const isHWin = hG > aG;
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
                   score: `${finalMatchResult.winG}-${finalMatchResult.loseG}`
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
            // Simular un torneo relámpago de 8 equipos europeos más fuertes
            const participantsIds = euroTeamIds.sort((a,b) => newNationalTeams[b].strength - newNationalTeams[a].strength).slice(0, 8);
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
                   const aId = roundTeams[i+1];
                   if (!hId || !aId) continue;
                   
                   const hT = newNationalTeams[hId];
                   const aT = newNationalTeams[aId];
                   
                   let [hG, aG] = simulateMatch(hT.strength, 0, aT.strength, 0, true);
                   let pens = "";
                   if (hG === aG) {
                       if (Math.random() > 0.5) { hG++; pens = " (P)"; }
                       else { aG++; pens = " (P)"; }
                   }
                   
                   const isHWin = hG > aG;
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
                   score: `${finalMatchResult.winG}-${finalMatchResult.loseG}`
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
        logs: matchesPlayed % 38 === 0 
          ? eventLogs.reverse() 
          : [...eventLogs.reverse(), ...logs].slice(0, 100)
      };
    });
  },

  advanceSeason: () => {
    for (let i = 0; i < 38; i++) {
      get().advanceMatch();
    }
  }
}));
