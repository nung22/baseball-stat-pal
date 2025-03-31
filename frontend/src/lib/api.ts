// lib/api.ts
'use client';

import { Player, BattingStats, PitchingStats } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function searchPlayers(name: string): Promise<Player[]> {
  // Add types for the Response
  const response: Response = await fetch(`${API_URL}/players/search?name=${encodeURIComponent(name)}`);
  
  if (!response.ok) {
    throw new Error('Failed to search players');
  }
  
  return response.json();
}

export async function getPlayerBattingStats(
  playerId: number, 
  startDate?: string, 
  endDate?: string
): Promise<BattingStats[]> {
  let url = `${API_URL}/player/batting/${playerId}`;
  
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
  playerId: number, 
  startDate?: string, 
  endDate?: string
): Promise<PitchingStats[]> {
  let url = `${API_URL}/player/pitching/${playerId}`;
  
  if (startDate && endDate) {
    url += `?start_date=${startDate}&end_date=${endDate}`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch pitching stats');
  }
  
  return response.json();
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