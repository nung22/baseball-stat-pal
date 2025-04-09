# app.py - Flask backend API for MLB statistics
# This application creates a RESTful API to serve baseball data from pybaseball
# Includes pre-loaded player search for autocomplete.

# Import necessary libraries
from flask import Flask, jsonify, request  # Flask web framework
from flask_cors import CORS  # Cross-Origin Resource Sharing support
import pybaseball as pyb  # Python package for baseball data
import pandas as pd  # Data manipulation library
from datetime import datetime, timedelta # Date handling
import logging # For logging status and errors
from typing import List, Dict, Any # For type hinting

# --- Basic Logging Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Pre-loaded Player Data ---
# Global variable to hold the player list in memory
# Each item will be a dict: {'key_mlbam': int, 'name_first': str, 'name_last': str}
player_list_for_search: List[Dict[str, Any]] = []

def load_player_data():
    """
    Loads the Chadwick Register data into memory on startup.
    Selects relevant columns and prepares them for searching.
    Called once when the module is loaded.
    """
    global player_list_for_search
    logger.info("Attempting to load Chadwick Register data for player search...")
    try:
        # Fetch the register data using pybaseball
        # Using cache link directly or function - adjust timeout as needed
        player_register_df = pyb.chadwick_register() # Use the public function

        logger.info(f"Successfully fetched Register data. Shape: {player_register_df.shape}")

        # Select and clean relevant columns
        relevant_cols_df = player_register_df[['name_first', 'name_last', 'key_mlbam']].copy()
        relevant_cols_df.dropna(subset=['name_first', 'name_last', 'key_mlbam'], inplace=True)

        # Convert key_mlbam to integer, handling potential non-numeric values robustly
        relevant_cols_df['key_mlbam'] = pd.to_numeric(relevant_cols_df['key_mlbam'], errors='coerce')
        relevant_cols_df.dropna(subset=['key_mlbam'], inplace=True) # Remove rows where conversion failed
        relevant_cols_df['key_mlbam'] = relevant_cols_df['key_mlbam'].astype(int)

        # Convert to list of dictionaries for easier searching
        player_list_for_search = relevant_cols_df.to_dict('records')

        logger.info(f"Successfully loaded and processed {len(player_list_for_search)} players into memory.")

    except Exception as e:
        logger.error(f"CRITICAL ERROR loading Chadwick Register: {e}", exc_info=True)
        # Keep the list empty on failure; the search endpoint will handle this.
        player_list_for_search = []


# --- Initialize Flask Application ---
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# --- Load Player Data ONCE on startup ---
# This runs when the Python script is loaded, before the first request (in typical dev/simple prod setups)
load_player_data()


# --- Helper Function ---
def df_to_json(df):
    """Converts pandas DataFrame to list of dictionaries (JSON suitable)."""
    # Handle potential NaN/NaT values before converting to JSON
    df = df.fillna(value=pd.NA) # Use pandas NA marker
    return df.where(pd.notna(df), None).to_dict(orient='records')


# --- API Routes ---

# Route to search for players by name (MODIFIED FOR PRE-LOADED SEARCH)
@app.route('/api/players/search', methods=['GET'])
def search_players():
    """
    Searches the pre-loaded player list for matches based on a name fragment.
    Performs a case-insensitive substring search on first, last, and full names.
    """
    name = request.args.get('name', '').strip() # Get name parameter and remove whitespace

    # --- Input validation (match frontend trigger length) ---
    min_search_length = 3
    if not name or len(name) < min_search_length:
        return jsonify({'error': f'Name parameter must be at least {min_search_length} characters'}), 400

    # --- Check if player data loaded ---
    if not player_list_for_search:
        logger.warning("Search attempted but player list is empty or failed to load.")
        # 503 Service Unavailable is appropriate if the data is essential and missing
        return jsonify({'error': 'Player data is currently unavailable. Please try again later.'}), 503

    # --- Perform Search ---
    query = name.lower()
    limit = 15 # Max results
    matches = []

    try:
        for player in player_list_for_search:
            first_name = player.get('name_first', '').lower()
            last_name = player.get('name_last', '').lower()
            full_name = f"{first_name} {last_name}"

            # Perform case-insensitive substring search
            if query in first_name or query in last_name or query in full_name:
                # Return the structure expected by frontend (adjust if needed)
                matches.append({
                    "key_mlbam": player['key_mlbam'],
                    "name_first": player['name_first'],
                    "name_last": player['name_last']
                    # Add other fields here if needed/available, e.g.:
                    # "team_id": player.get('team_id'),
                    # "position": player.get('position')
                })
                if len(matches) >= limit:
                    break # Stop searching once we hit the limit

        logger.info(f"Search for '{name}' found {len(matches)} matches.")
        return jsonify(matches) # Return list of matching player dicts

    except Exception as e:
        logger.error(f"Error during player search for query '{name}': {e}", exc_info=True)
        return jsonify({'error': 'An internal error occurred during search.'}), 500


# --- Other existing routes (Unchanged unless noted) ---

@app.route('/api/player/batting/<int:player_id>', methods=['GET'])
def player_batting(player_id):
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    try:
        if not (start_date and end_date):
            # Default to last 30 days if no dates provided (using explicit imports)
            end_date_dt = datetime.now()
            start_date_dt = end_date_dt - timedelta(days=30)
            start_date = start_date_dt.strftime('%Y-%m-%d')
            end_date = end_date_dt.strftime('%Y-%m-%d')

        logger.info(f"Fetching batting stats for {player_id} from {start_date} to {end_date}")
        data = pyb.statcast_batter(start_date, end_date, player_id)
        return jsonify(df_to_json(data))
    except Exception as e:
        logger.error(f"Error fetching batting stats for {player_id}: {e}", exc_info=True)
        return jsonify({'error': f'Failed to fetch batting stats: {str(e)}'}), 500

@app.route('/api/player/pitching/<int:player_id>', methods=['GET'])
def player_pitching(player_id):
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    try:
        if not (start_date and end_date):
            # Default to last 30 days
            end_date_dt = datetime.now()
            start_date_dt = end_date_dt - timedelta(days=30)
            start_date = start_date_dt.strftime('%Y-%m-%d')
            end_date = end_date_dt.strftime('%Y-%m-%d')

        logger.info(f"Fetching pitching stats for {player_id} from {start_date} to {end_date}")
        data = pyb.statcast_pitcher(start_date, end_date, player_id)
        return jsonify(df_to_json(data))
    except Exception as e:
        logger.error(f"Error fetching pitching stats for {player_id}: {e}", exc_info=True)
        return jsonify({'error': f'Failed to fetch pitching stats: {str(e)}'}), 500

@app.route('/api/standings', methods=['GET'])
def get_standings():
    try:
        # Use today's date if year is not specified, otherwise convert safely
        year_str = request.args.get('year')
        year = int(year_str) if year_str and year_str.isdigit() else datetime.now().year

        logger.info(f"Fetching standings for year {year}")
        standings_data = pyb.standings(year)
        # Ensure the result is a list before processing
        if not isinstance(standings_data, list):
             logger.error(f"Unexpected data type returned for standings: {type(standings_data)}")
             return jsonify({'error': 'Unexpected data format received for standings'}), 500

        # Format data by division name if possible, otherwise use index
        result = {}
        division_names = ["AL East", "AL Central", "AL West", "NL East", "NL Central", "NL West"] # Standard order
        for i, division_df in enumerate(standings_data):
             division_name = division_names[i] if i < len(division_names) else f'division_{i}'
             result[division_name] = df_to_json(division_df)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error fetching standings: {e}", exc_info=True)
        return jsonify({'error': f'Failed to fetch standings: {str(e)}'}), 500

@app.route('/api/team/schedule/<team_abbrev>', methods=['GET'])
def team_schedule(team_abbrev):
    try:
        year_str = request.args.get('year')
        year = int(year_str) if year_str and year_str.isdigit() else datetime.now().year
        team_upper = team_abbrev.upper() # Use uppercase for consistency if pyb expects it

        logger.info(f"Fetching schedule for {team_upper}, year {year}")
        schedule = pyb.schedule_and_record(year, team_upper)
        return jsonify(df_to_json(schedule))
    except Exception as e:
        logger.error(f"Error fetching schedule for {team_abbrev}: {e}", exc_info=True)
        return jsonify({'error': f'Failed to fetch team schedule: {str(e)}'}), 500

@app.route('/api/player/season-stats', methods=['GET'])
def season_stats():
    try:
        stat_type = request.args.get('type', 'batting').lower()
        year_str = request.args.get('year')
        year = int(year_str) if year_str and year_str.isdigit() else datetime.now().year

        logger.info(f"Fetching {stat_type} season stats for year {year}")
        if stat_type == 'batting':
            stats = pyb.batting_stats(year)
        elif stat_type == 'pitching':
            stats = pyb.pitching_stats(year)
        else:
            return jsonify({'error': 'Invalid stat type specified. Use "batting" or "pitching".'}), 400

        return jsonify(df_to_json(stats))
    except Exception as e:
        logger.error(f"Error fetching season stats: {e}", exc_info=True)
        return jsonify({'error': f'Failed to fetch season stats: {str(e)}'}), 500

@app.route('/api/cache/clear', methods=['POST'])
def clear_cache():
    try:
        logger.info("Clearing pybaseball cache...")
        import pybaseball.cache
        pybaseball.cache.flush()
        logger.info("Cache cleared successfully.")
        return jsonify({'success': True, 'message': 'Cache cleared successfully'})
    except Exception as e:
        logger.error(f"Error clearing cache: {e}", exc_info=True)
        return jsonify({'error': f'Failed to clear cache: {str(e)}'}), 500

@app.route('/api/player/percentile-rankings/<int:player_id>', methods=['GET'])
def player_percentile_rankings(player_id):
    try:
        year_str = request.args.get('year')
        year = int(year_str) if year_str and year_str.isdigit() else datetime.now().year
        player_type = request.args.get('type', 'batter').lower()

        logger.info(f"Fetching {player_type} percentile ranks for {player_id}, year {year}")
        if player_type == 'pitcher':
            data = pyb.statcast_pitcher_percentile_ranks(year)
        elif player_type == 'batter':
            data = pyb.statcast_batter_percentile_ranks(year)
        else:
            return jsonify({'error': 'Invalid player type specified. Use "batter" or "pitcher".'}), 400

        # Filter for the specific player
        player_data = data[data['player_id'] == player_id]

        if player_data.empty:
            logger.warning(f"No percentile data found for player ID {player_id}, year {year}, type {player_type}")
            # Return empty list instead of 404 to match frontend expectation potentially
            return jsonify([])
            # return jsonify({'error': f'No percentile data found for player ID {player_id}'}), 404

        # Handle potential NaN values before sending JSON
        return jsonify(df_to_json(player_data))
    except Exception as e:
        logger.error(f"Error fetching percentile ranks for {player_id}: {e}", exc_info=True)
        return jsonify({'error': f'Failed to fetch percentile ranks: {str(e)}'}), 500

# Run the Flask application
if __name__ == '__main__':
    # Use host='0.0.0.0' to be accessible externally, port 5000
    # debug=True is useful for development but should be False in production
    app.run(debug=True, host='0.0.0.0', port=5000)