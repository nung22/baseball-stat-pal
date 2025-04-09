'use client';

import { useState, useEffect } from 'react';
import { 
  Paper, Stack, Text, Skeleton, Group, Badge, 
  SegmentedControl, Flex, Slider, Select, Grid, Image
} from '@mantine/core';
import { capitalizeWords } from '@/lib/utils';
import { getPlayerPercentileRankings } from '@/lib/api';
import { Player } from '@/types';

interface PlayerStatsProps {
  player: Player | null;
}

// Helper function to get color based on percentile value
const getPercentileColor = (value: number): string => {
  if (value >= 95) return 'red.9';
  if (value >= 90) return 'red.8';
  if (value >= 85) return 'red.7';
  if (value >= 80) return 'red.6';
  if (value >= 75) return 'red.5';
  if (value >= 70) return 'red.4';
  if (value >= 50) return 'red.3';
  if (value >= 45) return 'blue.3';
  if (value >= 25) return 'blue.4';
  if (value >= 20) return 'blue.5';
  if (value >= 15) return 'blue.6';
  if (value >= 10) return 'blue.7';
  if (value >= 5) return 'blue.8';
  if (value >= 0) return 'blue.9';
  return 'blue';
};

// Interface for percentile data
interface PercentileData {
  [key: string]: number | string;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ player }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [percentileData, setPercentileData] = useState<PercentileData | null>(null);
  const [categories, setCategories] = useState<{[key: string]: string[]}>({});
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Generate years for dropdown (from 2015 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2014 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString()
  }));

  // Function to categorize metrics
  const categorizeMetrics = (data: PercentileData): {[key: string]: string[]} => {
    const categories: {[key: string]: string[]} = {
      'Batting': [],
      'Pitching': [],
      'Expected': [],
      'Fielding': [],
      'Running': []
    };
    
    // Categorize metrics based on their names
    Object.keys(data).forEach(key => {
      if (typeof data[key] !== 'number') return;
      
      if (key.includes('launch_speed') || key.includes('launch_angle') || key.includes('hit_distance'))
        categories['Batting'].push(key);
      else if (key.includes('release_speed') || key.includes('release_spin_rate'))
        categories['Pitching'].push(key);
      else if (key.includes('expected'))
        categories['Expected'].push(key);
      else if (key.includes('field'))
        categories['Fielding'].push(key);
      else if (key.includes('run'))
        categories['Running'].push(key);
      else
        // Default to batting for unmatched keys
        categories['Batting'].push(key);
    });
    
    return categories;
  };
  
  // Format metric name for display
  const formatMetricName = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/percentile/i, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    if (!player) return;
  
    async function fetchPlayerData() {
      setLoading(true);
      setError(null);
      
      try {
        // Determine if player is pitcher based on position
        const isPitcher = player?.position === 'P' || 
                        player?.position === 'SP' || 
                        player?.position === 'RP';
        
        // Fetch percentile data
        const percentileRankings = await getPlayerPercentileRankings(
          player!.key_mlbam, 
          year, 
          isPitcher ? 'pitcher' : 'batter'
        );
        
        // Take the first item from the array
        const percentileData = percentileRankings[0];
        
        setPercentileData(percentileData);
        setCategories(categorizeMetrics(percentileData));
      } catch (err) {
        console.log(percentileData)
        console.error(err);
        setError('Failed to fetch player data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchPlayerData();
  }, [player, year]);

  if (!player) {
    return (
      <Paper bg="dark.7" p="xl" h="100%" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text c="dimmed">Select a player to view stats</Text>
      </Paper>
    );
  }

  // Get filtered metrics based on active category
  const getFilteredMetrics = (): string[] => {
    if (!percentileData) return [];
    
    if (activeCategory === 'all') {
      return Object.keys(percentileData).filter(key => 
        typeof percentileData[key] === 'number' && 
        key !== 'player_id'
      );
    }
    
    return categories[activeCategory] || [];
  };

  return (
    <Paper bg="dark.7" p="md" w="25rem">
      <Stack>
        <Group>
          <Stack gap={0}>
            <Text size="xl" fw={700}>{capitalizeWords(player.name_first + " " + player.name_last)}</Text>
            <Image
              style={{  width: '80px', height: 'auto' }}
              radius="md"
              // Use curly braces {} to signal a JS expression for the prop value
              // Use backticks `` for the template literal string
              src={`https://midfield.mlbstatic.com/v1/people/${player.key_mlbam}/spots/240`}
              // It's highly recommended to add alt text for accessibility:
              alt={`Headshot of player ${player.name_first || ''} ${player.name_last || ''}`} // Example alt text
              // You might want fallback logic or styling if the image fails to load
              // fallbackSrc="/path/to/placeholder-image.png" // Example fallback
              // style={{ width: '240px', height: 'auto' }} // Example sizing if needed
            />
            <Group gap="xs">
              {player.team_id && (
                <Badge color="gray" variant="outline">{player.team_id}</Badge>
              )}
              {player.position && (
                <Badge color="blue" variant="outline">{player.position}</Badge>
              )}
            </Group>
          </Stack>
          <Select
            data={years}
            value={year}
            onChange={(value) => setYear(value || new Date().getFullYear().toString())}
            label="Season"
            ml="auto"
            w={100}
          />
        </Group>
        
        {loading ? (
          <Stack>
            <Skeleton height={100} radius="md" />
            <Skeleton height={300} radius="md" />
          </Stack>
        ) : error ? (
          <Text c="red.5" p="md">{error}</Text>
        ) : percentileData ? (
          <Stack gap="0rem">
            <Text size="lg" fw={600}>Player Stats & Percentile Rankings</Text>
            
            {/* Category Tabs */}
            <SegmentedControl
              value={activeCategory}
              onChange={setActiveCategory}
              data={[
                { label: 'All', value: 'all' },
                ...Object.keys(categories)
                  .filter(category => categories[category].length > 0)
                  .map(category => ({ label: category, value: category }))
              ]}
            />
            
          {/* Percentile Sliders */}
          <Grid gutter="7px">
            {getFilteredMetrics().map(key => {
              // Skip rendering slider for 'year'
              if (key === 'year' || key === 'player_id') return null;

              const value = percentileData[key] as number;
              const color = getPercentileColor(value);
              const notAvailable = value == 101
              
              return (
                <Grid.Col key={key} span={12}>
                  <Flex 
                    gap="xs" 
                    align="center" 
                    style={{ width: '100%' }}
                  >
                    <Text 
                      fw={700} 
                      ta="right"
                      size="xs" 
                      style={{ minWidth: '120px', flexShrink: 0 }}
                    >
                      {formatMetricName(key)}
                    </Text>
                    <Slider
                      flex={1}
                      disabled={notAvailable}
                      thumbChildren={<Text size="7px" fw={900}>{value}</Text>}
                      value={value}
                      showLabelOnHover={false}
                      color={color}
                      thumbSize={25}
                      radius="lg"
                      size="lg"
                    />
                  </Flex>
                </Grid.Col>
              );
            })}
            
            {getFilteredMetrics().length === 0 && (
              <Text c="dimmed" ta="center">No metrics available in this category</Text>
            )}
          </Grid>
          </Stack>
        ) : (
          <Text c="dimmed" p="md">
            No stats available for this player
          </Text>
        )}
      </Stack>
    </Paper>
  );
};

export default PlayerStats;