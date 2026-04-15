export type Team = {
  id: string;
  name: string;
  leagueId: string;
  strength: number; // 1-100
};

export type League = {
  id: string;
  name: string;
  country: string;
};

export const LEAGUES: League[] = [
  { id: 'eng', name: 'Premier League', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'esp', name: 'La Liga', country: '🇪🇸' },
  { id: 'ita', name: 'Serie A', country: '🇮🇹' },
  { id: 'ger', name: 'Bundesliga', country: '🇩🇪' },
  { id: 'fra', name: 'Ligue 1', country: '🇫🇷' },
];

export const TEAMS: Team[] = [
  // Premier League (Status: April 2026)
  { id: 'eng_ars', name: 'Arsenal', leagueId: 'eng', strength: 97 }, // #1 Power Ranking 2026
  { id: 'eng_mci', name: 'Manchester City', leagueId: 'eng', strength: 94 }, 
  { id: 'eng_liv', name: 'Liverpool', leagueId: 'eng', strength: 92 },
  { id: 'eng_che', name: 'Chelsea', leagueId: 'eng', strength: 89 }, // Recovered status
  { id: 'eng_avl', name: 'Aston Villa', leagueId: 'eng', strength: 87 },
  { id: 'eng_new', name: 'Newcastle United', leagueId: 'eng', strength: 85 },
  { id: 'eng_tot', name: 'Tottenham Hotspur', leagueId: 'eng', strength: 78 }, // Simulation Slump 2026
  { id: 'eng_mnu', name: 'Manchester United', leagueId: 'eng', strength: 83 },
  { id: 'eng_bha', name: 'Brighton', leagueId: 'eng', strength: 82 },
  { id: 'eng_whu', name: 'West Ham United', leagueId: 'eng', strength: 80 },
  { id: 'eng_nfo', name: 'Nottingham Forest', leagueId: 'eng', strength: 79 },
  { id: 'eng_eve', name: 'Everton', leagueId: 'eng', strength: 77 },
  { id: 'eng_ful', name: 'Fulham', leagueId: 'eng', strength: 77 },
  { id: 'eng_bre', name: 'Brentford', leagueId: 'eng', strength: 76 },
  { id: 'eng_bou', name: 'Bournemouth', leagueId: 'eng', strength: 78 },
  { id: 'eng_wol', name: 'Wolverhampton', leagueId: 'eng', strength: 74 },
  { id: 'eng_ips', name: 'Ipswich Town', leagueId: 'eng', strength: 74 },
  { id: 'eng_lei', name: 'Leicester City', leagueId: 'eng', strength: 75 },
  { id: 'eng_lee', name: 'Leeds United', leagueId: 'eng', strength: 76 }, // Back in PL 2026
  { id: 'eng_sou', name: 'Southampton', leagueId: 'eng', strength: 73 },

  // La Liga (Status: April 2026)
  { id: 'esp_bar', name: 'Barcelona', leagueId: 'esp', strength: 95 }, // Resurgence under Flick
  { id: 'esp_rma', name: 'Real Madrid', leagueId: 'esp', strength: 95 }, // Top Tier Contender
  { id: 'esp_atm', name: 'Atlético Madrid', leagueId: 'esp', strength: 88 },
  { id: 'esp_ath', name: 'Athletic Club', leagueId: 'esp', strength: 86 },
  { id: 'esp_rso', name: 'Real Sociedad', leagueId: 'esp', strength: 84 },
  { id: 'esp_vil', name: 'Villarreal', leagueId: 'esp', strength: 83 },
  { id: 'esp_gir', name: 'Girona', leagueId: 'esp', strength: 82 },
  { id: 'esp_bet', name: 'Real Betis', leagueId: 'esp', strength: 82 },
  { id: 'esp_val', name: 'Valencia', leagueId: 'esp', strength: 80 },
  { id: 'esp_sev', name: 'Sevilla', leagueId: 'esp', strength: 79 },
  { id: 'esp_osa', name: 'Osasuna', leagueId: 'esp', strength: 78 },
  { id: 'esp_cel', name: 'Celta Vigo', leagueId: 'esp', strength: 78 },
  { id: 'esp_mll', name: 'Mallorca', leagueId: 'esp', strength: 77 },
  { id: 'esp_ala', name: 'Alavés', leagueId: 'esp', strength: 77 },
  { id: 'esp_get', name: 'Getafe', leagueId: 'esp', strength: 76 },
  { id: 'esp_ray', name: 'Rayo Vallecano', leagueId: 'esp', strength: 75 },
  { id: 'esp_lpa', name: 'Las Palmas', leagueId: 'esp', strength: 75 },
  { id: 'esp_leg', name: 'Leganés', leagueId: 'esp', strength: 74 },
  { id: 'esp_esp', name: 'Espanyol', leagueId: 'esp', strength: 74 },
  { id: 'esp_valld', name: 'Valladolid', leagueId: 'esp', strength: 73 },

  // Serie A (Status: April 2026)
  { id: 'ita_int', name: 'Inter Milan', leagueId: 'ita', strength: 93 },
  { id: 'ita_juv', name: 'Juventus', leagueId: 'ita', strength: 90 },
  { id: 'ita_nap', name: 'Napoli', leagueId: 'ita', strength: 89 },
  { id: 'ita_ata', name: 'Atalanta', leagueId: 'ita', strength: 88 },
  { id: 'ita_mil', name: 'AC Milan', leagueId: 'ita', strength: 88 },
  { id: 'ita_laz', name: 'Lazio', leagueId: 'ita', strength: 84 },
  { id: 'ita_fio', name: 'Fiorentina', leagueId: 'ita', strength: 85 },
  { id: 'ita_rom', name: 'Roma', leagueId: 'ita', strength: 83 },
  { id: 'ita_tor', name: 'Torino', leagueId: 'ita', strength: 80 },
  { id: 'ita_bol', name: 'Bologna', leagueId: 'ita', strength: 81 },
  { id: 'ita_mon', name: 'Monza', leagueId: 'ita', strength: 78 },
  { id: 'ita_gen', name: 'Genoa', leagueId: 'ita', strength: 78 },
  { id: 'ita_com', name: 'Como', leagueId: 'ita', strength: 77 },
  { id: 'ita_par', name: 'Parma', leagueId: 'ita', strength: 76 },
  { id: 'ita_lec', name: 'Lecce', leagueId: 'ita', strength: 75 },
  { id: 'ita_ver', name: 'Hellas Verona', leagueId: 'ita', strength: 75 },
  { id: 'ita_udo', name: 'Udinese', leagueId: 'ita', strength: 75 },
  { id: 'ita_emp', name: 'Empoli', leagueId: 'ita', strength: 74 },
  { id: 'ita_cag', name: 'Cagliari', leagueId: 'ita', strength: 75 },
  { id: 'ita_ven', name: 'Venezia', leagueId: 'ita', strength: 73 },

  // Bundesliga (Status: April 2026)
  { id: 'ger_bay', name: 'Bayern Munich', leagueId: 'ger', strength: 96 }, // Dominant 2026
  { id: 'ger_dor', name: 'Borussia Dortmund', leagueId: 'ger', strength: 88 }, 
  { id: 'ger_rbl', name: 'RB Leipzig', leagueId: 'ger', strength: 88 },
  { id: 'ger_lev', name: 'Bayer Leverkusen', leagueId: 'ger', strength: 87 }, // Tier 2 in 2026
  { id: 'ger_stu', name: 'VfB Stuttgart', leagueId: 'ger', strength: 85 },
  { id: 'ger_fra', name: 'Eintracht Frankfurt', leagueId: 'ger', strength: 85 },
  { id: 'ger_hof', name: 'Hoffenheim', leagueId: 'ger', strength: 82 },
  { id: 'ger_fri', name: 'Freiburg', leagueId: 'ger', strength: 81 },
  { id: 'ger_bre', name: 'Werder Bremen', leagueId: 'ger', strength: 79 },
  { id: 'ger_wol', name: 'Wolfsburg', leagueId: 'ger', strength: 79 },
  { id: 'ger_mai', name: 'Mainz 05', leagueId: 'ger', strength: 77 },
  { id: 'ger_mon', name: 'B. Mönchengladbach', leagueId: 'ger', strength: 78 },
  { id: 'ger_aug', name: 'Augsburg', leagueId: 'ger', strength: 77 },
  { id: 'ger_hei', name: 'Heidenheim', leagueId: 'ger', strength: 76 },
  { id: 'ger_uni', name: 'Union Berlin', leagueId: 'ger', strength: 77 },
  { id: 'ger_stp', name: 'St. Pauli', leagueId: 'ger', strength: 74 },
  { id: 'ger_boc', name: 'VfL Bochum', leagueId: 'ger', strength: 73 },
  { id: 'ger_hol', name: 'Holstein Kiel', leagueId: 'ger', strength: 72 },
  { id: 'ger_sch', name: 'Schalke 04', leagueId: 'ger', strength: 75 }, 
  { id: 'ger_ham', name: 'Hamburger SV', leagueId: 'ger', strength: 75 }, 

  // Ligue 1 (Status: April 2026)
  { id: 'fra_psg', name: 'Paris Saint-Germain', leagueId: 'fra', strength: 94 }, // Reigning UCL Champs
  { id: 'fra_lan', name: 'Lens', leagueId: 'fra', strength: 87 }, // Strong runner up 2026
  { id: 'fra_mon', name: 'Monaco', leagueId: 'fra', strength: 86 },
  { id: 'fra_lyo', name: 'Olympique Lyonnais', leagueId: 'fra', strength: 86 },
  { id: 'fra_mar', name: 'Marseille', leagueId: 'fra', strength: 86 },
  { id: 'fra_lil', name: 'Lille', leagueId: 'fra', strength: 85 },
  { id: 'fra_nic', name: 'Nice', leagueId: 'fra', strength: 83 },
  { id: 'fra_ren', name: 'Rennes', leagueId: 'fra', strength: 82 },
  { id: 'fra_rei', name: 'Reims', leagueId: 'fra', strength: 80 },
  { id: 'fra_tou', name: 'Toulouse', leagueId: 'fra', strength: 79 },
  { id: 'fra_met', name: 'Metz', leagueId: 'fra', strength: 77 },
  { id: 'fra_str', name: 'Strasbourg', leagueId: 'fra', strength: 78 },
  { id: 'fra_bre', name: 'Brest', leagueId: 'fra', strength: 80 },
  { id: 'fra_monp', name: 'Montpellier', leagueId: 'fra', strength: 77 },
  { id: 'fra_nan', name: 'Nantes', leagueId: 'fra', strength: 76 },
  { id: 'fra_ang', name: 'Angers', leagueId: 'fra', strength: 75 },
  { id: 'fra_hav', name: 'Le Havre', leagueId: 'fra', strength: 74 },
  { id: 'fra_aux', name: 'Auxerre', leagueId: 'fra', strength: 75 },
  { id: 'fra_bor', name: 'Bordeaux', leagueId: 'fra', strength: 75 }, 
  { id: 'fra_ste', name: 'Saint-Étienne', leagueId: 'fra', strength: 75 }, 
];

export type NationalTeam = {
  id: string;
  name: string;
  flag: string;
  strength: number; // 1-100
};

export const NATIONAL_TEAMS: NationalTeam[] = [
  { id: 'arg', name: 'Argentina', flag: '🇦🇷', strength: 96 },
  { id: 'fra', name: 'Francia', flag: '🇫🇷', strength: 95 },
  { id: 'bra', name: 'Brasil', flag: '🇧🇷', strength: 93 },
  { id: 'eng', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', strength: 92 },
  { id: 'esp', name: 'España', flag: '🇪🇸', strength: 91 },
  { id: 'por', name: 'Portugal', flag: '🇵🇹', strength: 89 },
  { id: 'nee', name: 'Países Bajos', flag: '🇳🇱', strength: 87 },
  { id: 'ita', name: 'Italia', flag: '🇮🇹', strength: 86 },
  { id: 'ger', name: 'Alemania', flag: '🇩🇪', strength: 86 },
  { id: 'bel', name: 'Bélgica', flag: '🇧🇪', strength: 85 },
  { id: 'uru', name: 'Uruguay', flag: '🇺🇾', strength: 84 },
  { id: 'cro', name: 'Croacia', flag: '🇭🇷', strength: 83 },
  { id: 'col', name: 'Colombia', flag: '🇨🇴', strength: 82 },
  { id: 'mor', name: 'Marruecos', flag: '🇲🇦', strength: 81 },
  { id: 'jap', name: 'Japón', flag: '🇯🇵', strength: 80 },
  { id: 'usa', name: 'Estados Unidos', flag: '🇺🇸', strength: 79 },
];
