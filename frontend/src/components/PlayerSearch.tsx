// components/PlayerSearch.tsx
'use client';

import { useState } from 'react';
import { searchPlayers } from '@/lib/api';
import { Player } from '@/types';

interface PlayerSearchProps {
  onPlayerSelect: (player: Player) => void;
}

export default function PlayerSearch({ onPlayerSelect }: PlayerSearchProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchTerm.length < 2) {
      setError('Please enter at least 2 characters');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await searchPlayers(searchTerm);
      setPlayers(results);
      
      if (results.length === 0) {
        setError('No players found. Try another name.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to search players. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search players (e.g., Aaron Judge)"
            className="w-full px-4 py-2 focus:outline-none"
          />
          <button 
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}
      
      {players.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 bg-gray-100 font-medium">
            Found {players.length} players
          </div>
          <ul className="divide-y divide-gray-200">
            {players.map((player) => (
              <li 
                key={player.key_mlbam} 
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition"
                onClick={() => onPlayerSelect(player)}
              >
                <div className="font-medium">{player.name_first} {player.name_last}</div>
                <div className="text-sm text-gray-500">
                  {player.team_id && `Team: ${player.team_id}`}
                  {player.position && ` • Position: ${player.position}`}
                </div>
                <div className="text-xs text-gray-400">
                  Player ID: {player.key_mlbam}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}