'use client';

import { useState, useEffect, useCallback } from 'react';
// Import Autocomplete and Loader
import { Autocomplete, Loader, Text } from '@mantine/core';
// Import useDebouncedCallback for debouncing API calls
import { useDebouncedCallback } from 'use-debounce';
import { searchPlayers } from '@/lib/api';
import { capitalizeWords } from '@/lib/utils'; // Keep if needed for display elsewhere
import { Player } from '@/types';

interface PlayerSearchProps {
  onPlayerSelect: (player: Player) => void;
}

export default function PlayerSearch({ onPlayerSelect }: PlayerSearchProps) {
  // State for the input value
  const [value, setValue] = useState<string>('');
  // State to store the full Player objects from the last successful search
  const [playerResults, setPlayerResults] = useState<Player[]>([]);
  // State for the formatted data array (strings) for Autocomplete suggestions
  const [autocompleteData, setAutocompleteData] = useState<string[]>([]);
  // Loading and error states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced function to fetch players
  const fetchPlayersDebounced = useDebouncedCallback(async (query: string) => {
    if (query.length < 3) {
      setAutocompleteData([]);
      setPlayerResults([]);
      setLoading(false);
      setError(null); // Clear error if query becomes too short
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchPlayers(query);
      setPlayerResults(results); // Store full player objects

      // Format results for Autocomplete (e.g., "First Last (ID)")
      // Make sure this format is unique enough to identify the player later
      const formattedData = results.map(
        (p) => `${capitalizeWords(p.name_first + ' ' + p.name_last)} (${p.key_mlbam})`
      );
      setAutocompleteData(formattedData);

      if (results.length === 0) {
        setError('No players found matching that name.');
        // Keep showing potentially empty dropdown or hide it based on UX preference
        // setAutocompleteData([]); // Option: clear suggestions if API returns none
      }
    } catch (err) {
      console.error(err);
      setError('Failed to search players. Please try again.');
      setAutocompleteData([]); // Clear suggestions on error
      setPlayerResults([]);
    } finally {
      setLoading(false);
    }
  }, 500); // Debounce time in milliseconds (e.g., 500ms)

  // Effect to call the debounced fetch function when the input value changes
  useEffect(() => {
    fetchPlayersDebounced(value);
    // Cancel the debounce timer if the component unmounts or value changes quickly
    return fetchPlayersDebounced.cancel;
  }, [value, fetchPlayersDebounced]);

  // Handler when an option is selected from the Autocomplete dropdown
  const handleOptionSubmit = (selectedValue: string) => {
    // Find the full Player object corresponding to the selected string value
    const selectedPlayer = playerResults.find(
      (p) => `${capitalizeWords(p.name_first + ' ' + p.name_last)} (${p.key_mlbam})` === selectedValue
    );

    if (selectedPlayer) {
      onPlayerSelect(selectedPlayer);
      // Optionally clear the input and results after selection
      setValue('');
      setAutocompleteData([]);
      setPlayerResults([]);
      setError(null);
    } else {
        // Handle case where the selected value doesn't match any player (should be rare)
        setError('Could not find selected player details.');
        console.warn("Selected value didn't match any player in results:", selectedValue, playerResults);
    }
  };

  return (
    // Using a simple div or Stack wrapper, removed the form/button
    <div>
      <Autocomplete
        label="Search Players"
        placeholder="Start typing a player name (e.g., Aaron Judge)"
        value={value}
        onChange={setValue} // Update state on every keystroke
        onOptionSubmit={handleOptionSubmit} // Handle selection
        data={autocompleteData} // Provide suggestions
        limit={10} // Limit the number of suggestions shown
        radius="md"
        rightSection={loading ? <Loader size="1rem" /> : null} // Show loader when fetching
        error={error} // Display error message directly on the component
        // Clear error when user starts typing again in a valid way
        onFocus={() => { if (value.length >= 3) setError(null); } }
        // Ensure dropdown closes if input is cleared manually
        onBlur={() => { if(value === '') setAutocompleteData([]); } }
        comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }} // Optional: Nice transition
      />
      {/* You might still want a general error message area if needed */}
      {/* {error && !loading && <Text c="red.5" size="sm" mt="xs">{error}</Text>} */}
    </div>
  );
}