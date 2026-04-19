export type Country = {
  id: string;
  name: string;
  flag: string;
  leagueId?: string;
};

export const COUNTRIES: Country[] = [
  { id: 'esp', name: 'España', flag: '🇪🇸', leagueId: 'esp' },
  { id: 'eng', name: 'Inglaterra', flag: '🏴', leagueId: 'eng' },
  { id: 'fra', name: 'Francia', flag: '🇫🇷', leagueId: 'fra' },
  { id: 'ita', name: 'Italia', flag: '🇮🇹', leagueId: 'ita' },
  { id: 'ger', name: 'Alemania', flag: '🇩🇪', leagueId: 'ger' },
  { id: 'por', name: 'Portugal', flag: '🇵🇹' },
  { id: 'bra', name: 'Brasil', flag: '🇧🇷' },
  { id: 'arg', name: 'Argentina', flag: '🇦🇷' },
  { id: 'uru', name: 'Uruguay', flag: '🇺🇾' },
  { id: 'mex', name: 'México', flag: '🇲🇽' },
  { id: 'col', name: 'Colombia', flag: '🇨🇴' },
  { id: 'nee', name: 'Países Bajos', flag: '🇳🇱' },
  { id: 'bel', name: 'Bélgica', flag: '🇧🇪' },
  { id: 'cro', name: 'Croacia', flag: '🇭🇷' },
  { id: 'nor', name: 'Noruega', flag: '🇳🇴' },
  { id: 'sen', name: 'Senegal', flag: '🇸🇳' },
  { id: 'mar', name: 'Marruecos', flag: '🇲🇦' },
  { id: 'nga', name: 'Nigeria', flag: '🇳🇬' },
  { id: 'jpn', name: 'Japón', flag: '🇯🇵' },
  { id: 'usa', name: 'Estados Unidos', flag: '🇺🇸' },
];
