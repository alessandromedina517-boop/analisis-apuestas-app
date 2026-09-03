export default async function handler(req, res) {
  const API_TOKEN = '63b4ee7bd0cc43b8bcb2ba10a8c7e865';
  
  try {
    const response = await fetch(
      'https://api.football-data.org/v4/matches?status=SCHEDULED,LIVE,IN_PLAY&limit=50',
      { headers: { 'X-Auth-Token': API_TOKEN } }
    );
    
    const data = await response.json();
    const matches = data.matches || [];
    
    const enrichedMatches = matches.map(match => {
      // Probabilidades 1x2
      const homeWinProb = 0.45 + Math.random() * 0.2;
      const drawProb = 0.25 + Math.random() * 0.1;
      const awayWinProb = 1 - homeWinProb - drawProb;
      
      // Goles
      const homeGoals = 1.5 + Math.random() * 1.0;
      const awayGoals = 1.0 + Math.random() * 1.0;
      const totalGoals = homeGoals + awayGoals;
      
      // NUEVOS MERCADOS
      
      // Corners (5-8 por equipo en promedio)
      const homeCorners = 5 + Math.random() * 4;
      const awayCorners = 4 + Math.random() * 4;
      const totalCorners = homeCorners + awayCorners;
      
      // Remates totales (10-15 por equipo)
      const homeShots = 12 + Math.random() * 6;
      const awayShots = 10 + Math.random() * 6;
      const totalShots = homeShots + awayShots;
      
      // Remates a puerta (4-6 por equipo)
      const homeShotsOnTarget = 4 + Math.random() * 3;
      const awayShotsOnTarget = 3 + Math.random() * 3;
      const totalShotsOnTarget = homeShotsOnTarget + awayShotsOnTarget;
      
      // Over/Under Corners 8.5
      const overCorners85Prob = totalCorners > 8.5 ? 0.65 : 0.35;
      
      // Over/Under Remates 21.5
      const overShots215Prob = totalShots > 21.5 ? 0.60 : 0.40;
      
      // Over/Under Remates a puerta 7.5
      const overSoT75Prob = totalShotsOnTarget > 7.5 ? 0.55 : 0.45;
      
      // Handicap Asiático (ventaja/desventaja goles)
      // -1.5 local: Local gana por 2+
      const handicap15HomeProb = (homeWinProb * 0.6);
      // -1 local: Local gana por 2+ o empata
      const handicap1HomeProb = homeWinProb * 0.75 + drawProb * 0.5;
      // 0 local: Local no pierde
      const handicap0HomeProb = homeWinProb + drawProb * 0.5;
      // +1 local: Local gana o pierde por 1
      const handicap1AwayProb = 1 - (awayWinProb * 0.75);
      // +1.5 local: Visitante no gana por 2+
      const handicap15AwayProb = 1 - (awayWinProb * 0.6);
      
      return {
        id: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        competition: match.competition.name,
        date: match.utcDate,
        status: match.status,
        
        // Mercado 1: Ganador (1x2)
        mercado1x2: {
          '1': {
            cuota: (1 / homeWinProb).toFixed(2),
            probabilidad: (homeWinProb * 100).toFixed(1)
          },
          'X': {
            cuota: (1 / drawProb).toFixed(2),
            probabilidad: (drawProb * 100).toFixed(1)
          },
          '2': {
            cuota: (1 / awayWinProb).toFixed(2),
            probabilidad: (awayWinProb * 100).toFixed(1)
          }
        },
        
        // Mercado 2: Over/Under 2.5 goles
        overUnder25: {
          'Over2.5': {
            cuota: (1 / (totalGoals > 2.5 ? 0.65 : 0.35)).toFixed(2),
            probabilidad: (totalGoals > 2.5 ? 65 : 35).toString()
          },
          'Under2.5': {
            cuota: (1 / (totalGoals > 2.5 ? 0.35 : 0.65)).toFixed(2),
            probabilidad: (totalGoals > 2.5 ? 35 : 65).toString()
          }
        },
        
        // Mercado 3: Ambos anotan
        bothScore: {
          'Sí': {
            cuota: (1 / 0.55).toFixed(2),
            probabilidad: '55'
          },
          'No': {
            cuota: (1 / 0.45).toFixed(2),
            probabilidad: '45'
          }
        },
        
        // Mercado 4: CORNERS O/U 8.5
        overUnderCorners: {
          'Over8.5': {
            cuota: (1 / overCorners85Prob).toFixed(2),
            probabilidad: (overCorners85Prob * 100).toFixed(1)
          },
          'Under8.5': {
            cuota: (1 / (1 - overCorners85Prob)).toFixed(2),
            probabilidad: ((1 - overCorners85Prob) * 100).toFixed(1)
          }
        },
        
        // Mercado 5: REMATES O/U 21.5
        overUnderShots: {
          'Over21.5': {
            cuota: (1 / overShots215Prob).toFixed(2),
            probabilidad: (overShots215Prob * 100).toFixed(1)
          },
          'Under21.5': {
            cuota: (1 / (1 - overShots215Prob)).toFixed(2),
            probabilidad: ((1 - overShots215Prob) * 100).toFixed(1)
          }
        },
        
        // Mercado 6: REMATES A PUERTA O/U 7.5
        overUnderSoT: {
          'Over7.5': {
            cuota: (1 / overSoT75Prob).toFixed(2),
            probabilidad: (overSoT75Prob * 100).toFixed(1)
          },
          'Under7.5': {
            cuota: (1 / (1 - overSoT75Prob)).toFixed(2),
            probabilidad: ((1 - overSoT75Prob) * 100).toFixed(1)
          }
        },
        
        // Mercado 7: HANDICAP ASIÁTICO
        handicap: {
          '-1.5': {
            cuota: (1 / handicap15HomeProb).toFixed(2),
            probabilidad: (handicap15HomeProb * 100).toFixed(1),
            desc: `${match.homeTeam.name} -1.5`
          },
          '-1': {
            cuota: (1 / handicap1HomeProb).toFixed(2),
            probabilidad: (handicap1HomeProb * 100).toFixed(1),
            desc: `${match.homeTeam.name} -1`
          },
          '0': {
            cuota: (1 / handicap0HomeProb).toFixed(2),
            probabilidad: (handicap0HomeProb * 100).toFixed(1),
            desc: `${match.homeTeam.name} 0`
          },
          '+1': {
            cuota: (1 / handicap1AwayProb).toFixed(2),
            probabilidad: (handicap1AwayProb * 100).toFixed(1),
            desc: `${match.awayTeam.name} +1`
          }
        },
        
        stats: {
          promedioGoles: totalGoals.toFixed(1),
          golesLocal: homeGoals.toFixed(1),
          golesVisita: awayGoals.toFixed(1),
          cornersLocal: homeCorners.toFixed(1),
          cornersVisita: awayCorners.toFixed(1),
          rematesLocal: homeShots.toFixed(1),
          rematesVisita: awayShots.toFixed(1),
          rematesAuertaLocal: homeShotsOnTarget.toFixed(1),
          rematesAuertaVisita: awayShotsOnTarget.toFixed(1)
        }
      };
    });
    
    res.status(200).json({ matches: enrichedMatches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
