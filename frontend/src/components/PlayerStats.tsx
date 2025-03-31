// components/PlayerStats.tsx
'use client';

import { useState, useEffect } from 'react';
import { getPlayerBattingStats, getPlayerPitchingStats } from '@/lib/api';
import { Player, BattingStats, PitchingStats, BattingSummary, PitchingSummary, Column } from '@/types';

interface PlayerStatsProps {
  player: Player | null;
}

export default function PlayerStats({ player }: PlayerStatsProps) {
  const [statsType, setStatsType] = useState<'batting' | 'pitching'>('batting');
  const [timeframe, setTimeframe] = useState<'7days' | '30days' | 'season'>('30days');
  const [stats, setStats] = useState<BattingStats[] | PitchingStats[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!player) return;

    async function fetchStats() {
      setLoading(true);
      setError(null);
      
      try {
        // Calculate date range based on selected timeframe
        const endDate = new Date().toISOString().split('T')[0];
        let startDate: string;
        
        switch (timeframe) {
          case '7days':
            startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            break;
          case '30days':
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            break;
          case 'season':
            startDate = new Date(new Date().getFullYear(), 2, 30).toISOString().split('T')[0]; // March 30 (approx season start)
            break;
          default:
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        }
        
        // Fetch stats based on the selected type
        let data;
        if (statsType === 'batting') {
          if (player) {
            data = await getPlayerBattingStats(player.key_mlbam, startDate, endDate);
          }
        } else {
          if (player) {
            data = await getPlayerPitchingStats(player.key_mlbam, startDate, endDate);
          }
        }
        
        setStats(data || null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch player stats. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, [player, statsType, timeframe]);

  if (!player) {
    return <div className="text-center py-8">Select a player to view stats</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">{player.name_first} {player.name_last}</h2>
        {player.position && <div className="text-gray-600">Position: {player.position}</div>}
      </div>
      
      <div className="p-6">
        <div className="flex mb-6 space-x-2">
          <button
            className={`px-4 py-2 rounded-md ${statsType === 'batting' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setStatsType('batting')}
          >
            Batting
          </button>
          <button
            className={`px-4 py-2 rounded-md ${statsType === 'pitching' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setStatsType('pitching')}
          >
            Pitching
          </button>
        </div>
        
        <div className="flex mb-6 space-x-2">
          <button
            className={`px-4 py-2 rounded-md ${timeframe === '7days' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setTimeframe('7days')}
          >
            Last 7 Days
          </button>
          <button
            className={`px-4 py-2 rounded-md ${timeframe === '30days' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setTimeframe('30days')}
          >
            Last 30 Days
          </button>
          <button
            className={`px-4 py-2 rounded-md ${timeframe === 'season' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setTimeframe('season')}
          >
            Season
          </button>
        </div>
        
        {loading && <div className="text-center py-4">Loading stats...</div>}
        
        {error && <div className="text-red-500 py-4">{error}</div>}
        
        {stats && stats.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No {statsType} data available for the selected timeframe
          </div>
        )}
        
        {stats && stats.length > 0 && (
          <div className="overflow-x-auto">
            <StatsTable stats={stats} type={statsType} />
          </div>
        )}
      </div>
    </div>
  );
}

interface StatsTableProps {
  stats: BattingStats[] | PitchingStats[];
  type: 'batting' | 'pitching';
}

function StatsTable({ stats, type }: StatsTableProps) {
  // Define columns to display based on stats type
  const columns: Column[] = type === 'batting' 
    ? [
        { key: 'game_date', label: 'Date' },
        { key: 'pitch_type', label: 'Pitch Type' },
        { key: 'launch_speed', label: 'Exit Velocity' },
        { key: 'launch_angle', label: 'Launch Angle' },
        { key: 'hit_distance_sc', label: 'Distance' },
        { key: 'events', label: 'Result' },
      ]
    : [
        { key: 'game_date', label: 'Date' },
        { key: 'pitch_type', label: 'Pitch Type' },
        { key: 'release_speed', label: 'Velocity' },
        { key: 'release_spin_rate', label: 'Spin Rate' },
        { key: 'events', label: 'Result' },
      ];

  // Summary stats calculation (example for batting)
  let summary: BattingSummary | PitchingSummary = {} as any;
  
  if (type === 'batting' && stats.length > 0) {
    const battingStats = stats as BattingStats[];
    const hits = battingStats.filter(s => ['single', 'double', 'triple', 'home_run'].includes(s.events || '')).length;
    const atBats = battingStats.filter(s => s.at_bat_number).length;
    
    summary = {
      avg: atBats > 0 ? (hits / atBats).toFixed(3) : '.000',
      hits,
      atBats,
      hr: battingStats.filter(s => s.events === 'home_run').length,
      avg_ev: battingStats.filter(s => s.launch_speed).length > 0 
        ? (battingStats.reduce((sum, s) => sum + (s.launch_speed || 0), 0) / 
           battingStats.filter(s => s.launch_speed).length).toFixed(1)
        : 'N/A'
    } as BattingSummary;
  } else if (type === 'pitching' && stats.length > 0) {
    const pitchingStats = stats as PitchingStats[];
    const pitches = pitchingStats.length;
    const strikes = pitchingStats.filter(s => s.type === 'S').length;
    
    summary = {
      pitches,
      strikes,
      strikePerc: pitches > 0 ? ((strikes / pitches) * 100).toFixed(1) + '%' : '0.0%',
      avg_velo: pitchingStats.filter(s => s.release_speed).length > 0
        ? (pitchingStats.reduce((sum, s) => sum + (s.release_speed || 0), 0) / 
           pitchingStats.filter(s => s.release_speed).length).toFixed(1)
        : 'N/A'
    } as PitchingSummary;
  }

  return (
    <>
      {/* Summary Stats Panel */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {type === 'batting' && (
          <>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="text-lg font-bold">{(summary as BattingSummary).avg}</div>
              <div className="text-sm text-gray-600">AVG</div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="text-lg font-bold">{(summary as BattingSummary).hits} / {(summary as BattingSummary).atBats}</div>
              <div className="text-sm text-gray-600">H/AB</div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="text-lg font-bold">{(summary as BattingSummary).hr}</div>
              <div className="text-sm text-gray-600">HR</div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="text-lg font-bold">{(summary as BattingSummary).avg_ev}</div>
              <div className="text-sm text-gray-600">Avg Exit Velo</div>
            </div>
          </>
        )}
        
        {type === 'pitching' && (
          <>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="text-lg font-bold">{(summary as PitchingSummary).pitches}</div>
              <div className="text-sm text-gray-600">Pitches</div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="text-lg font-bold">{(summary as PitchingSummary).strikes}</div>
              <div className="text-sm text-gray-600">Strikes</div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="text-lg font-bold">{(summary as PitchingSummary).strikePerc}</div>
              <div className="text-sm text-gray-600">Strike %</div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="text-lg font-bold">{(summary as PitchingSummary).avg_velo}</div>
              <div className="text-sm text-gray-600">Avg Velocity</div>
            </div>
          </>
        )}
      </div>

      {/* Detailed Stats Table */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {stats.slice(0, 20).map((stat, index) => (
            <tr key={index}>
              {columns.map(column => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {column.key === 'game_date' 
                    ? new Date(stat[column.key]).toLocaleDateString() 
                    : stat[column.key] || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {stats.length > 20 && (
        <div className="text-center py-4 text-gray-500">
          Showing 20 of {stats.length} results
        </div>
      )}
    </>
  );
}