# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
import pybaseball as pyb
import pandas as pd
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Helper function to convert pandas dataframes to JSON
def df_to_json(df):
    return df.to_dict(orient='records')

@app.route('/api/players/search', methods=['GET'])
def search_players():
    name = request.args.get('name', '')
    if not name or len(name) < 2:
        return jsonify({'error': 'Name parameter must be at least 2 characters'}), 400
    
    try:
        players = pyb.playerid_lookup(name.split()[1] if len(name.split()) > 1 else '', 
                                    name.split()[0] if name.split() else name)
        return jsonify(df_to_json(players))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/player/batting/<int:player_id>', methods=['GET'])
def player_batting(player_id):
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    try:
        if start_date and end_date:
            data = pyb.statcast_batter(start_date, end_date, player_id)
        else:
            # Default to recent data if no dates provided
            from datetime import datetime, timedelta
            end_date = datetime.now().strftime('%Y-%m-%d')
            start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            data = pyb.statcast_batter(start_date, end_date, player_id)
        
        return jsonify(df_to_json(data))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/player/pitching/<int:player_id>', methods=['GET'])
def player_pitching(player_id):
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    try:
        if start_date and end_date:
            data = pyb.statcast_pitcher(start_date, end_date, player_id)
        else:
            # Default to recent data if no dates provided
            from datetime import datetime, timedelta
            end_date = datetime.now().strftime('%Y-%m-%d')
            start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            data = pyb.statcast_pitcher(start_date, end_date, player_id)
        
        return jsonify(df_to_json(data))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/standings', methods=['GET'])
def get_standings():
    year = request.args.get('year', datetime.now().year)
    
    try:
        standings_data = pyb.standings(int(year))
        result = {}
        for i, division in enumerate(standings_data):
            result[f'division_{i}'] = df_to_json(division)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/team/schedule/<team_abbrev>', methods=['GET'])
def team_schedule(team_abbrev):
    year = request.args.get('year', datetime.now().year)
    
    try:
        schedule = pyb.schedule_and_record(int(year), team_abbrev)
        return jsonify(df_to_json(schedule))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/player/season-stats', methods=['GET'])
def season_stats():
    stat_type = request.args.get('type', 'batting')  # batting or pitching
    year = request.args.get('year', datetime.now().year)
    
    try:
        if stat_type == 'batting':
            stats = pyb.batting_stats(int(year))
        else:
            stats = pyb.pitching_stats(int(year))
        
        return jsonify(df_to_json(stats))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cache/clear', methods=['POST'])
def clear_cache():
    try:
        import pybaseball.cache
        pybaseball.cache.flush()
        return jsonify({'success': True, 'message': 'Cache cleared successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)