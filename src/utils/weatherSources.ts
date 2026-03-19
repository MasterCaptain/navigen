/**
 * Weather Layer Sources for NAVIGEN
 * 
 * This file contains verified weather data tile sources for maritime use.
 * Each source has different requirements and coverage.
 */

export interface WeatherSource {
  id: string;
  name: string;
  url: string;
  attribution: string;
  requiresApiKey: boolean;
  apiKeyPlaceholder?: string;
  opacity: number;
  minZoom: number;
  maxZoom: number;
  description: string;
  coverage: 'global' | 'regional';
  dataTypes: string[];
}

export const WEATHER_SOURCES: Record<string, WeatherSource> = {
  // OpenWeatherMap - Requires FREE API key from openweathermap.org
  owm_clouds: {
    id: 'owm_clouds',
    name: 'OpenWeatherMap Clouds',
    url: 'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid={apiKey}',
    attribution: '© OpenWeatherMap',
    requiresApiKey: true,
    apiKeyPlaceholder: 'YOUR_OWM_API_KEY',
    opacity: 0.6,
    minZoom: 0,
    maxZoom: 18,
    description: 'Global cloud cover',
    coverage: 'global',
    dataTypes: ['clouds'],
  },

  owm_precipitation: {
    id: 'owm_precipitation',
    name: 'OpenWeatherMap Precipitation',
    url: 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid={apiKey}',
    attribution: '© OpenWeatherMap',
    requiresApiKey: true,
    apiKeyPlaceholder: 'YOUR_OWM_API_KEY',
    opacity: 0.7,
    minZoom: 0,
    maxZoom: 18,
    description: 'Global precipitation',
    coverage: 'global',
    dataTypes: ['precipitation'],
  },

  owm_wind: {
    id: 'owm_wind',
    name: 'OpenWeatherMap Wind',
    url: 'https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid={apiKey}',
    attribution: '© OpenWeatherMap',
    requiresApiKey: true,
    apiKeyPlaceholder: 'YOUR_OWM_API_KEY',
    opacity: 0.5,
    minZoom: 0,
    maxZoom: 18,
    description: 'Global wind speed and direction',
    coverage: 'global',
    dataTypes: ['wind'],
  },

  owm_temperature: {
    id: 'owm_temperature',
    name: 'OpenWeatherMap Temperature',
    url: 'https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid={apiKey}',
    attribution: '© OpenWeatherMap',
    requiresApiKey: true,
    apiKeyPlaceholder: 'YOUR_OWM_API_KEY',
    opacity: 0.5,
    minZoom: 0,
    maxZoom: 18,
    description: 'Global temperature',
    coverage: 'global',
    dataTypes: ['temperature'],
  },

  // RainViewer - FREE, no API key required (community favorite)
  rainviewer: {
    id: 'rainviewer',
    name: 'RainViewer Radar',
    url: 'https://tilecache.rainviewer.com/v2/radar/0/{z}/{x}/{y}/256.png',
    attribution: '© RainViewer',
    requiresApiKey: false,
    opacity: 0.6,
    minZoom: 0,
    maxZoom: 12,
    description: 'Global precipitation radar (last frame)',
    coverage: 'global',
    dataTypes: ['precipitation', 'radar'],
  },

  // Windy.com - Requires API key (free tier available)
  windy_wind: {
    id: 'windy_wind',
    name: 'Windy.com Wind',
    url: 'https://ims.windy.com/{apiKey}/ecmwf/{z}/{x}/{y}.png',
    attribution: '© Windy.com',
    requiresApiKey: true,
    apiKeyPlaceholder: 'YOUR_WINDY_API_KEY',
    opacity: 0.6,
    minZoom: 0,
    maxZoom: 11,
    description: 'High-quality wind visualization (ECMWF model)',
    coverage: 'global',
    dataTypes: ['wind'],
  },
};

/**
 * Get weather source URL with API key injected
 */
export function getWeatherSourceUrl(sourceId: string, apiKey?: string): string {
  const source = WEATHER_SOURCES[sourceId];
  if (!source) return '';

  if (source.requiresApiKey) {
    const key = apiKey || source.apiKeyPlaceholder || '';
    return source.url.replace('{apiKey}', key);
  }

  return source.url;
}

/**
 * Validate if API key is placeholder or missing
 */
export function isValidApiKey(apiKey: string | undefined, sourceId: string): boolean {
  if (!apiKey) return false;
  const source = WEATHER_SOURCES[sourceId];
  if (!source) return false;
  return apiKey !== source.apiKeyPlaceholder && apiKey.length > 10;
}
