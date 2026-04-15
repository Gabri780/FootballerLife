import { Team } from '../data/leagues';

export type Match = {
  homeTeamId: string;
  awayTeamId: string;
};

export type MatchResult = {
  homeTeamId: string;
  awayTeamId: string;
  homeGoals: number;
  awayGoals: number;
};

export type WeekSchedule = Match[];

// Generates a double round-robin schedule (Home and Away)
export const generateLeagueSchedule = (teamIds: string[]): WeekSchedule[] => {
  const n = teamIds.length; 
  const schedule: WeekSchedule[] = [];
  const teams = [...teamIds];

  for (let round = 0; round < n - 1; round++) {
    const week: Match[] = [];
    for (let i = 0; i < n / 2; i++) {
      const home = teams[i];
      const away = teams[n - 1 - i];
      if (round % 2 === 0) {
        week.push({ homeTeamId: home, awayTeamId: away });
      } else {
        week.push({ homeTeamId: away, awayTeamId: home });
      }
    }
    schedule.push(week);
    teams.splice(1, 0, teams.pop()!);
  }

  const secondHalfSchedule: WeekSchedule[] = schedule.map(week => 
    week.map(match => ({ homeTeamId: match.awayTeamId, awayTeamId: match.homeTeamId }))
  );

  return [...schedule, ...secondHalfSchedule];
};

const simulateGoals = (expectedGoals: number): number => {
  let rng = Math.random();
  let chance = Math.exp(-expectedGoals);
  let p = chance;
  let goals = 0;
  
  while (rng > p) {
    goals++;
    chance *= expectedGoals / goals;
    p += chance;
  }
  return goals;
};

// Advanced Non-Linear Engine
export const simulateMatch = (homeStrength: number, homeForm: number, awayStrength: number, awayForm: number, neutral: boolean = false): [number, number] => {
  // Base effective strength summing base stats + current morale/form
  const effectiveHome = homeStrength + homeForm;
  const effectiveAway = awayStrength + awayForm;

  // Home advantage is statistically worth about ~1.5 to 2.5 rating points depending on the crowd
  const homeAdvantage = neutral ? 0 : 2; 

  const diff = (effectiveHome + homeAdvantage) - effectiveAway;
  
  // Base xG in modern football (approx 2.6 goals per game total)
  let homeXG = 1.45;
  let awayXG = 1.15;

  // Non-linear impact. A huge difference (e.g. 20 points) creates an exponential gap.
  // diff/10 limits the base, Math.pow creates the curve.
  const impact = Math.pow(Math.abs(diff) / 10, 1.3) * 0.4;

  if (diff > 0) {
    homeXG += impact; // Home dominates
    awayXG -= impact * 0.5; // Away struggles to shoot, but less exponentially so they can still maybe score
  } else {
    awayXG += impact; // Away dominates
    homeXG -= impact * 0.5; // Home struggles
  }

  // Pure chaos factor (Football is unpredictable. Unstoppable teams sometimes just fail to score)
  const chaosHome = (Math.random() * 0.4) - 0.2; // -0.2 to +0.2 random modifier
  const chaosAway = (Math.random() * 0.4) - 0.2;

  homeXG = Math.max(0.1, Math.min(6.0, homeXG + chaosHome));
  awayXG = Math.max(0.1, Math.min(5.0, awayXG + chaosAway));

  const homeGoals = simulateGoals(homeXG);
  const awayGoals = simulateGoals(awayXG);

  return [homeGoals, awayGoals];
};
