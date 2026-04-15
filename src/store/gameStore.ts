import { create } from 'zustand';
import { TEAMS as INITIAL_TEAMS, LEAGUES } from '../data/leagues';
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

interface GameState {
  player: PlayerData;
  logs: EventLog[];
  
  // World State
  teams: Record<string, DynamicTeam>;
  schedules: Record<string, WeekSchedule[]>;
  standings: Record<string, Record<string, StandingRecord>>;
  history: Record<number, Record<string, Record<string, StandingRecord>>>;
  seasonEvolutionReport: TeamEvolution[] | null;
  
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

  return { schedules, standings, teams, history: {}, seasonEvolutionReport: null };
};

const clampForm = (val: number) => Math.max(-5, Math.min(5, val));
const clampStrength = (val: number) => Math.max(65, Math.min(96, val)); // Hard limits for realism

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
      let newEvolutionReport: TeamEvolution[] | null = state.seasonEvolutionReport;
      
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

               // Bonus for Top 4
               if (index < 4) {
                 team.strength += (Math.floor(Math.random() * 2) + 1);
               } 
               // Penalty for Bottom 3
               else if (index >= leagueTeams.length - 3) {
                 team.strength -= (Math.floor(Math.random() * 2) + 2);
               }

               // Regression to mean applying to new strength
               if (team.strength > 90 && Math.random() > 0.4) {
                   team.strength--;
               } else if (team.strength < 75 && Math.random() > 0.6) {
                   team.strength++;
               } else if (Math.random() > 0.8) {
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
      }

      return {
        player: { ...player, matchesPlayed, age: currentAge },
        teams: newTeams,
        standings: newStandings,
        schedules: schedules,
        history: historyCopy,
        seasonEvolutionReport: newEvolutionReport,
        logs: [
          ...eventLogs.reverse(),
          ...logs
        ].slice(0, 100)
      };
    });
  },

  advanceSeason: () => {
    for (let i = 0; i < 38; i++) {
      get().advanceMatch();
    }
  }
}));
