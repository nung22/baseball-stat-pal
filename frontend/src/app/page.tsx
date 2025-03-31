// app/page.tsx
'use client';

import { useState } from 'react';
import PlayerSearch from '../components/PlayerSearch';
import PlayerStats from '../components/PlayerStats';
import { Player } from '@/types';

export default function Home() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Player Search</h2>
            <PlayerSearch onPlayerSelect={setSelectedPlayer} />
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <PlayerStats player={selectedPlayer} />
        </div>
      </div>
    </div>
  );
}