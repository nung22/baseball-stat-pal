// types/index.ts

export interface Player {
  key_mlbam: number;
  name_first: string;
  name_last: string;
  team_id?: string;
  position?: string;
  key_retro?: string;
  key_bbref?: string;
  mlb_played_first?: string;
  mlb_played_last?: string;
}

export interface BattingStats {
  game_date: string;
  pitch_type?: string;
  launch_speed?: number;
  launch_angle?: number;
  hit_distance_sc?: number;
  events?: string;
  at_bat_number?: number;
  type?: string;
  [key: string]: any;
}

export interface PitchingStats {
  game_date: string;
  pitch_type?: string;
  release_speed?: number;
  release_spin_rate?: number;
  events?: string;
  type?: string;
  [key: string]: any;
}

export interface BattingSummary {
  avg: string;
  hits: number;
  atBats: number;
  hr: number;
  avg_ev: string | number;
}

export interface PitchingSummary {
  pitches: number;
  strikes: number;
  strikePerc: string;
  avg_velo: string | number;
}

export interface Column {
  key: string;
  label: string;
}