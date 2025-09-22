import { apiCall } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export interface WeatherData {
  location: string;
  temperature: number; // Celsius
  humidity: number; // Percentage
  conditions: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'snowy';
  wind_speed: number; // km/h
  wind_direction?: string;
  visibility: number; // km
  pressure?: number; // hPa
  uv_index?: number;
  feels_like?: number;
  timestamp: string;
  forecast?: WeatherForecast[];
}

export interface WeatherForecast {
  date: string;
  high_temp: number;
  low_temp: number;
  conditions: WeatherData['conditions'];
  chance_of_rain: number;
  wind_speed: number;
}

export interface WeatherAlert {
  id: string;
  type: 'severe_weather' | 'extreme_temperature' | 'poor_visibility' | 'high_winds';
  severity: 'watch' | 'warning' | 'emergency';
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  affected_areas: string[];
  safety_recommendations: string[];
}

class WeatherService {
  private weatherCache: Map<string, { data: WeatherData; expires: number }> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  async getCurrentWeather(location: string): Promise<WeatherData | null> {
    try {
      // Check cache first
      const cached = this.weatherCache.get(location);
      if (cached && cached.expires > Date.now()) {
        return cached.data;
      }

      const { weather } = await apiCall(`/weather/${encodeURIComponent(location)}`);
      
      if (weather) {
        // Cache the result
        this.weatherCache.set(location, {
          data: weather,
          expires: Date.now() + this.CACHE_DURATION
        });
        
        // Check for severe weather and alert if needed
        this.checkForSevereWeather(weather);
        
        return weather;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      return this.getMockWeatherData(location);
    }
  }

  async getWeatherByCoordinates(latitude: number, longitude: number): Promise<WeatherData | null> {
    const location = `${latitude},${longitude}`;
    return this.getCurrentWeather(location);
  }

  async getWeatherAlerts(location: string): Promise<WeatherAlert[]> {
    try {
      const { alerts } = await apiCall(`/weather/${encodeURIComponent(location)}/alerts`);
      return alerts || [];
    } catch (error) {
      console.error('Failed to fetch weather alerts:', error);
      return this.getMockWeatherAlerts();
    }
  }

  async getForecast(location: string, days: number = 5): Promise<WeatherForecast[]> {
    try {
      const { forecast } = await apiCall(`/weather/${encodeURIComponent(location)}/forecast?days=${days}`);
      return forecast || [];
    } catch (error) {
      console.error('Failed to fetch weather forecast:', error);
      return this.getMockForecast(days);
    }
  }

  // Get weather conditions for multiple locations (for patrol routes)
  async getMultiLocationWeather(locations: string[]): Promise<WeatherData[]> {
    const weatherPromises = locations.map(location => this.getCurrentWeather(location));
    const results = await Promise.allSettled(weatherPromises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<WeatherData> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  }

  // Weather-based safety recommendations for guards
  getSafetyRecommendations(weather: WeatherData): string[] {
    const recommendations: string[] = [];

    // Temperature-based recommendations
    if (weather.temperature < 0) {
      recommendations.push('Wear appropriate cold weather gear');
      recommendations.push('Check for ice on walkways and surfaces');
      recommendations.push('Limit outdoor exposure time');
    } else if (weather.temperature > 35) {
      recommendations.push('Stay hydrated and take frequent breaks');
      recommendations.push('Seek shade when possible');
      recommendations.push('Watch for signs of heat exhaustion');
    }

    // Conditions-based recommendations
    switch (weather.conditions) {
      case 'rainy':
        recommendations.push('Use waterproof equipment covers');
        recommendations.push('Be cautious of slippery surfaces');
        recommendations.push('Ensure radio equipment stays dry');
        break;
      case 'stormy':
        recommendations.push('Avoid open areas and tall structures');
        recommendations.push('Stay indoors if possible');
        recommendations.push('Monitor emergency communications');
        break;
      case 'foggy':
        recommendations.push('Use additional lighting equipment');
        recommendations.push('Reduce patrol speed and increase vigilance');
        recommendations.push('Stay in communication with dispatch');
        break;
      case 'snowy':
        recommendations.push('Wear non-slip footwear');
        recommendations.push('Clear snow from equipment and vehicles');
        recommendations.push('Allow extra time for patrols');
        break;
    }

    // Visibility-based recommendations
    if (weather.visibility < 1) {
      recommendations.push('Use high-visibility equipment');
      recommendations.push('Increase patrol frequency in critical areas');
      recommendations.push('Coordinate closely with other guards');
    }

    // Wind-based recommendations
    if (weather.wind_speed > 40) {
      recommendations.push('Secure loose objects in patrol areas');
      recommendations.push('Be cautious around buildings and structures');
      recommendations.push('Monitor for falling debris');
    }

    return recommendations;
  }

  // Check if weather conditions are suitable for outdoor activities
  isWeatherSuitable(weather: WeatherData): {
    suitable: boolean;
    concerns: string[];
    risk_level: 'low' | 'medium' | 'high' | 'extreme';
  } {
    const concerns: string[] = [];
    let riskScore = 0;

    // Temperature risks
    if (weather.temperature < -10 || weather.temperature > 40) {
      concerns.push('Extreme temperature conditions');
      riskScore += 3;
    } else if (weather.temperature < 0 || weather.temperature > 35) {
      concerns.push('Challenging temperature conditions');
      riskScore += 2;
    }

    // Visibility risks
    if (weather.visibility < 0.5) {
      concerns.push('Very poor visibility');
      riskScore += 3;
    } else if (weather.visibility < 2) {
      concerns.push('Reduced visibility');
      riskScore += 1;
    }

    // Weather condition risks
    if (weather.conditions === 'stormy') {
      concerns.push('Severe weather conditions');
      riskScore += 4;
    } else if (weather.conditions === 'rainy' || weather.conditions === 'snowy') {
      concerns.push('Wet/slippery conditions');
      riskScore += 1;
    }

    // Wind risks
    if (weather.wind_speed > 60) {
      concerns.push('Dangerous wind speeds');
      riskScore += 3;
    } else if (weather.wind_speed > 40) {
      concerns.push('High wind speeds');
      riskScore += 2;
    }

    let risk_level: 'low' | 'medium' | 'high' | 'extreme';
    if (riskScore >= 6) risk_level = 'extreme';
    else if (riskScore >= 4) risk_level = 'high';
    else if (riskScore >= 2) risk_level = 'medium';
    else risk_level = 'low';

    return {
      suitable: riskScore < 4,
      concerns,
      risk_level
    };
  }

  // Get weather-based patrol adjustments
  getPatrolAdjustments(weather: WeatherData): {
    patrol_frequency: 'normal' | 'increased' | 'reduced';
    equipment_needed: string[];
    special_instructions: string[];
  } {
    const equipment: string[] = [];
    const instructions: string[] = [];
    let frequency: 'normal' | 'increased' | 'reduced' = 'normal';

    const suitability = this.isWeatherSuitable(weather);

    if (suitability.risk_level === 'high' || suitability.risk_level === 'extreme') {
      frequency = 'reduced';
      instructions.push('Prioritize indoor checkpoints');
      instructions.push('Coordinate with dispatch before outdoor patrols');
    } else if (weather.visibility < 2 || weather.conditions === 'foggy') {
      frequency = 'increased';
      equipment.push('High-visibility flashlight');
      equipment.push('Reflective vest');
    }

    // Equipment recommendations based on weather
    if (weather.temperature < 5) {
      equipment.push('Cold weather gear');
      equipment.push('Hand/foot warmers');
    }

    if (weather.conditions === 'rainy' || weather.conditions === 'snowy') {
      equipment.push('Waterproof radio covers');
      equipment.push('Non-slip footwear');
      equipment.push('Umbrella or rain gear');
    }

    if (weather.wind_speed > 30) {
      instructions.push('Secure all loose equipment');
      instructions.push('Be cautious around tall structures');
    }

    return {
      patrol_frequency: frequency,
      equipment_needed: equipment,
      special_instructions: instructions
    };
  }

  // Monitor weather changes and send alerts
  async startWeatherMonitoring(locations: string[], callback?: (alert: WeatherAlert) => void): Promise<() => void> {
    const checkWeather = async () => {
      for (const location of locations) {
        try {
          const weather = await this.getCurrentWeather(location);
          if (weather) {
            const suitability = this.isWeatherSuitable(weather);
            
            if (suitability.risk_level === 'high' || suitability.risk_level === 'extreme') {
              const alert: WeatherAlert = {
                id: `weather_alert_${Date.now()}`,
                type: 'severe_weather',
                severity: suitability.risk_level === 'extreme' ? 'emergency' : 'warning',
                title: `Severe Weather Alert - ${location}`,
                description: `Current conditions pose risks: ${suitability.concerns.join(', ')}`,
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
                affected_areas: [location],
                safety_recommendations: this.getSafetyRecommendations(weather)
              };
              
              if (callback) {
                callback(alert);
              }
              
              // Show toast notification
              toast.warning(alert.title, {
                description: alert.description,
                duration: 10000
              });
            }
          }
        } catch (error) {
          console.error(`Weather monitoring error for ${location}:`, error);
        }
      }
    };

    // Check immediately and then every 15 minutes
    checkWeather();
    const intervalId = setInterval(checkWeather, 15 * 60 * 1000);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }

  private checkForSevereWeather(weather: WeatherData): void {
    const suitability = this.isWeatherSuitable(weather);
    
    if (suitability.risk_level === 'extreme') {
      toast.error('⚠️ Extreme Weather Warning', {
        description: `Dangerous conditions detected: ${suitability.concerns.join(', ')}`,
        duration: 0 // Don't auto-dismiss
      });
    } else if (suitability.risk_level === 'high') {
      toast.warning('🌦️ Severe Weather Alert', {
        description: `Challenging conditions: ${suitability.concerns.join(', ')}`,
        duration: 8000
      });
    }
  }

  private getMockWeatherData(location: string): WeatherData {
    // Generate realistic mock weather data
    const conditions: WeatherData['conditions'][] = ['sunny', 'cloudy', 'rainy', 'stormy', 'foggy'];
    const baseTemp = 15 + Math.random() * 20; // 15-35°C
    
    return {
      location,
      temperature: Math.round(baseTemp),
      humidity: Math.round(30 + Math.random() * 60), // 30-90%
      conditions: conditions[Math.floor(Math.random() * conditions.length)],
      wind_speed: Math.round(Math.random() * 40), // 0-40 km/h
      wind_direction: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      visibility: Math.round((2 + Math.random() * 8) * 10) / 10, // 2-10 km
      pressure: Math.round(980 + Math.random() * 50), // 980-1030 hPa
      uv_index: Math.round(Math.random() * 11), // 0-11
      feels_like: Math.round(baseTemp + (Math.random() - 0.5) * 6),
      timestamp: new Date().toISOString()
    };
  }

  private getMockWeatherAlerts(): WeatherAlert[] {
    const now = new Date();
    return [
      {
        id: 'alert-001',
        type: 'severe_weather',
        severity: 'warning',
        title: 'Heavy Rain Warning',
        description: 'Heavy rainfall expected with reduced visibility and potential flooding',
        start_time: now.toISOString(),
        end_time: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
        affected_areas: ['Downtown Plaza', 'Corporate Center'],
        safety_recommendations: [
          'Use waterproof equipment covers',
          'Be cautious of slippery surfaces',
          'Monitor drainage areas for flooding'
        ]
      }
    ];
  }

  private getMockForecast(days: number): WeatherForecast[] {
    const forecast: WeatherForecast[] = [];
    const conditions: WeatherData['conditions'][] = ['sunny', 'cloudy', 'rainy'];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const baseTemp = 15 + Math.random() * 15;
      forecast.push({
        date: date.toISOString().split('T')[0],
        high_temp: Math.round(baseTemp + 5),
        low_temp: Math.round(baseTemp - 5),
        conditions: conditions[Math.floor(Math.random() * conditions.length)],
        chance_of_rain: Math.round(Math.random() * 100),
        wind_speed: Math.round(Math.random() * 30)
      });
    }
    
    return forecast;
  }
}

export const weatherService = new WeatherService();