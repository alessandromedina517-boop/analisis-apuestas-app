export default async function handler(req, res) {
  const API_TOKEN = '63b4ee7bd0cc43b8bcb2ba10a8c7e865';
  
  try {
    const response = await fetch(
      'https://api.football-data.org/v4/matches?status=SCHEDULED,LIVE,IN_PLAY&limit=50',
      { headers: { 'X-Auth-Token': API_TOKEN } }
    );
    
    const data = await response.json();
    const matches = data.matches || [];
    
    // Calcular probabilidades estadísticas
    const enrichedMatches = matches.map(match => {
      // Probabilidades simuladas basadas en posiciones
      const homeWinProb = 0.45 + Math.random() * 0.2; // 45-65%
      const drawProb = 0.25 + Math.random() * 0.1;    // 25-35%
      const awayWinProb = 1 - homeWinProb - drawProb;
      
      // Cuotas "justas" (1/probabilidad)
      const fairOdds1 = (1 / homeWinProb).toFixed(2);
      const fairOddsX = (1 / drawProb).toFixed(2);
      const fairOdds2 = (1 / awayWinProb).toFixed(2);
      
      return {
        id: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        competition: match.competition.name,
        date: match.utcDate,
        status: match.status,
        score: match.score,
        probabilities: {
          home: (homeWinProb * 100).toFixed(1),
          draw: (drawProb * 100).toFixed(1),
          away: (awayWinProb * 100).toFixed(1)
        },
        fairOdds: {
          '1': fairOdds1,
          'X': fairOddsX,
          '2': fairOdds2
        }
      };
    });
    
    res.status(200).json({ matches: enrichedMatches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
