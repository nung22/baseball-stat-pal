'use client';

import { useState } from 'react';
import { Grid, Paper, Title } from '@mantine/core';
import PlayerSearch from '@/components/PlayerSearch';
import PlayerStats from '@/components/PlayerStats';
import { Player } from '@/types';

export default function Home() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  return (
    <Grid gutter="lg">
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Paper bg="dark.7" h="100%">
          <Title order={3} mb="md" c="blue.4">Player Search</Title>
          <PlayerSearch onPlayerSelect={setSelectedPlayer} />
        </Paper>
      </Grid.Col>
      
      <Grid.Col span={{ base: 12, md: 8 }}>
        <PlayerStats player={selectedPlayer} />
      </Grid.Col>
    </Grid>
  );
}