export interface StravaActivity {
  id: number;
  name: string;
  sport_type: string;
  type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  start_date: string;
  start_date_local: string;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  average_watts?: number;
  calories?: number;
  suffer_score?: number;
  map: {
    summary_polyline: string;
    polyline?: string;
  };
  gear?: {
    id: string;
    name: string;
  };
  best_efforts?: BestEffort[];
  splits_metric?: Split[];
  splits_imperial?: Split[];
  achievement_count: number;
  kudos_count: number;
  athlete: {
    id: number;
  };
}

export interface BestEffort {
  name: string;
  elapsed_time: number;
  distance: number;
  pr_rank?: number | null;
}

export interface Split {
  distance: number;
  elapsed_time: number;
  elevation_difference: number;
  moving_time: number;
  split: number;
  average_speed: number;
  pace_zone: number;
}

export interface StravaStream {
  type: string;
  data: number[] | number[][];
  series_type: string;
  original_size: number;
  resolution: string;
}

export interface StravaStreams {
  latlng?: { data: [number, number][] };
  altitude?: { data: number[] };
  velocity_smooth?: { data: number[] };
  heartrate?: { data: number[] };
  time?: { data: number[] };
}
