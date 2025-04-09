'use client';

import { Player, BattingStats, PitchingStats } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function searchPlayers(name: string): Promise<Player[]> {
  const response: Response = await fetch(`${API_URL}/players/search?name=${encodeURIComponent(name)}`);
  
  if (!response.ok) {
    throw new Error('Failed to search players');
  }
  
  return response.json();
}

export async function getPlayerBattingStats(
  playerMlbamKey: number, 
  startDate?: string, 
  endDate?: string
): Promise<BattingStats[]> {
  let url = `${API_URL}/player/batting/${playerMlbamKey}`;
  
  if (startDate && endDate) {
    url += `?start_date=${startDate}&end_date=${endDate}`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch batting stats');
  }
  
  return response.json();
}

export async function getPlayerPitchingStats(
  playerMlbamKey: number, 
  startDate?: string, 
  endDate?: string
): Promise<PitchingStats[]> {
  let url = `${API_URL}/player/pitching/${playerMlbamKey}`;
  
  if (startDate && endDate) {
    url += `?start_date=${startDate}&end_date=${endDate}`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch pitching stats');
  }
  
  return response.json();
}

export async function getPlayerPercentileRankings(
  playerMlbamKey: number, 
  year: string,
  type: 'batter' | 'pitcher'
): Promise<Record<string, number>[]> {
  const url = `${API_URL}/player/percentile-rankings/${playerMlbamKey}?year=${year}&type=${type}`;
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch percentile rankings');
  }
  
  const rawData = await response.text(); // Get raw text first
  
  try {
    // Replace NaN with null in the JSON string
    const cleanedData = rawData.replace(/NaN/g, 'null');
    
    // Parse the cleaned JSON
    const parsedData = JSON.parse(cleanedData);
    
    // Optional: Convert null back to 101 if needed
    return parsedData.map((item: Record<string, any>) => 
      Object.fromEntries(
        Object.entries(item).map(([key, value]) => 
          value === null ? [key, 101] : [key, value]
        )
      )
    );
  } catch (error) {
    console.error('Error parsing percentile rankings:', error);
    throw new Error('Failed to parse percentile rankings');
  }
}

export async function getStandings(year?: number): Promise<Record<string, any[]>> {
  const response = await fetch(`${API_URL}/standings${year ? `?year=${year}` : ''}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch standings');
  }
  
  return response.json();
}

export async function getTeamSchedule(teamAbbrev: string, year?: number): Promise<any[]> {
  const response = await fetch(`${API_URL}/team/schedule/${teamAbbrev}${year ? `?year=${year}` : ''}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch team schedule');
  }
  
  return response.json();
}

export async function getSeasonStats(type: 'batting' | 'pitching' = 'batting', year?: number): Promise<any[]> {
  const response = await fetch(`${API_URL}/player/season-stats?type=${type}${year ? `&year=${year}` : ''}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch season stats');
  }
  
  return response.json();
}