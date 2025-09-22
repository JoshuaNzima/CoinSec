import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Snowflake, 
  Wind, 
  Eye, 
  Droplets, 
  Thermometer,
  Umbrella,
  AlertTriangle,
  MapPin,
  Clock,
  Zap,
  CloudSnow
} from 'lucide-react';

interface WeatherData {
  location: string;
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    visibility: number;
    pressure: number;
    uvIndex: number;
    feelsLike: number;
  };
  forecast: Array<{
    time: string;
    temperature: number;
    condition: string;
    precipitation: number;
    windSpeed: number;
  }>;
  alerts: Array<{
    type: 'warning' | 'watch' | 'advisory';
    title: string;
    description: string;
    severity: 'low' | 'moderate' | 'high' | 'severe';
    startTime: string;
    endTime: string;
  }>;
}

const mockWeatherData: WeatherData = {
  location: 'Downtown Plaza',
  current: {
    temperature: 18,
    condition: 'partly-cloudy',
    humidity: 65,
    windSpeed: 12,
    windDirection: 'NW',
    visibility: 10,
    pressure: 1013,
    uvIndex: 3,
    feelsLike: 16
  },
  forecast: [
    { time: '21:00', temperature: 16, condition: 'cloudy', precipitation: 10, windSpeed: 10 },
    { time: '22:00', temperature: 15, condition: 'light-rain', precipitation: 70, windSpeed: 15 },
    { time: '23:00', temperature: 14, condition: 'rain', precipitation: 85, windSpeed: 18 },
    { time: '00:00', temperature: 13, condition: 'heavy-rain', precipitation: 90, windSpeed: 20 },
    { time: '01:00', temperature: 12, condition: 'rain', precipitation: 75, windSpeed: 16 },
    { time: '02:00', temperature: 12, condition: 'light-rain', precipitation: 40, windSpeed: 12 }
  ],
  alerts: [
    {
      type: 'warning',
      title: 'Heavy Rain Warning',
      description: 'Heavy rainfall expected between 11 PM and 2 AM. Potential for flooding in low-lying areas.',
      severity: 'moderate',
      startTime: '2024-12-19T23:00:00Z',
      endTime: '2024-12-20T02:00:00Z'
    }
  ]
};

export function WeatherIntegration() {
  const [weatherData, setWeatherData] = useState<WeatherData>(mockWeatherData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate weather data updates every 10 minutes
    const interval = setInterval(() => {
      // In a real app, this would fetch from a weather API
      setWeatherData(prev => ({
        ...prev,
        current: {
          ...prev.current,
          temperature: prev.current.temperature + (Math.random() - 0.5) * 2
        }
      }));
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'partly-cloudy': return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'cloudy': return <Cloud className="h-6 w-6 text-gray-600" />;
      case 'light-rain': return <CloudRain className="h-6 w-6 text-blue-500" />;
      case 'rain': return <CloudRain className="h-6 w-6 text-blue-600" />;
      case 'heavy-rain': return <CloudRain className="h-6 w-6 text-blue-700" />;
      case 'snow': return <Snowflake className="h-6 w-6 text-blue-200" />;
      case 'thunderstorm': return <Zap className="h-6 w-6 text-purple-600" />;
      default: return <Sun className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'sunny': return 'Sunny';
      case 'partly-cloudy': return 'Partly Cloudy';
      case 'cloudy': return 'Cloudy';
      case 'light-rain': return 'Light Rain';
      case 'rain': return 'Rain';
      case 'heavy-rain': return 'Heavy Rain';
      case 'snow': return 'Snow';
      case 'thunderstorm': return 'Thunderstorm';
      default: return 'Unknown';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
      case 'moderate': return 'border-orange-200 bg-orange-50 dark:bg-orange-900/20';
      case 'high': return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      case 'severe': return 'border-red-400 bg-red-100 dark:bg-red-900/40';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getPatrolRecommendations = () => {
    const recommendations = [];
    
    if (weatherData.current.temperature < 5) {
      recommendations.push({
        icon: <Thermometer className="h-4 w-4 text-blue-600" />,
        text: 'Cold weather: Check heating systems and ensure all entrances are secure',
        priority: 'medium'
      });
    }
    
    if (weatherData.current.windSpeed > 25) {
      recommendations.push({
        icon: <Wind className="h-4 w-4 text-gray-600" />,
        text: 'High winds: Secure loose objects and check signage stability',
        priority: 'high'
      });
    }
    
    if (weatherData.forecast.some(f => f.precipitation > 50)) {
      recommendations.push({
        icon: <Umbrella className="h-4 w-4 text-blue-600" />,
        text: 'Rain expected: Check drainage systems and monitor for flooding',
        priority: 'medium'
      });
    }
    
    if (weatherData.current.visibility < 5) {
      recommendations.push({
        icon: <Eye className="h-4 w-4 text-gray-600" />,
        text: 'Poor visibility: Increase patrol frequency and use additional lighting',
        priority: 'high'
      });
    }

    return recommendations;
  };

  const recommendations = getPatrolRecommendations();

  return (
    <div className="space-y-6">
      {/* Weather Alerts */}
      {weatherData.alerts.length > 0 && (
        <div className="space-y-3">
          {weatherData.alerts.map((alert, index) => (
            <Alert key={index} className={getSeverityColor(alert.severity)}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">{alert.title}</div>
                  <div className="text-sm">{alert.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(alert.startTime).toLocaleTimeString()} - {new Date(alert.endTime).toLocaleTimeString()}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Current Weather */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Current Weather
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {weatherData.location} • Last updated: {new Date().toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {getWeatherIcon(weatherData.current.condition)}
                <div>
                  <div className="text-3xl font-bold">{Math.round(weatherData.current.temperature)}°C</div>
                  <div className="text-sm text-muted-foreground">
                    Feels like {Math.round(weatherData.current.feelsLike)}°C
                  </div>
                </div>
              </div>
              <div className="text-lg font-medium">
                {getConditionText(weatherData.current.condition)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="font-medium">{weatherData.current.humidity}%</div>
                  <div className="text-muted-foreground">Humidity</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="font-medium">{weatherData.current.windSpeed} km/h</div>
                  <div className="text-muted-foreground">Wind {weatherData.current.windDirection}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="font-medium">{weatherData.current.visibility} km</div>
                  <div className="text-muted-foreground">Visibility</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <div>
                  <div className="font-medium">UV {weatherData.current.uvIndex}</div>
                  <div className="text-muted-foreground">UV Index</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hourly Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>6-Hour Forecast</CardTitle>
          <CardDescription>
            Weather conditions for the remainder of your shift
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2">
            {weatherData.forecast.map((hour, index) => (
              <div key={index} className="text-center space-y-2 p-2 rounded-lg bg-muted">
                <div className="text-xs font-medium">{hour.time}</div>
                <div className="flex justify-center">
                  {getWeatherIcon(hour.condition)}
                </div>
                <div className="text-sm font-medium">{Math.round(hour.temperature)}°</div>
                {hour.precipitation > 20 && (
                  <div className="text-xs text-blue-600">{hour.precipitation}%</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Patrol Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weather-Based Recommendations</CardTitle>
            <CardDescription>
              Suggested actions based on current weather conditions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                <div className="mt-0.5">{rec.icon}</div>
                <div className="flex-1">
                  <div className="text-sm">{rec.text}</div>
                </div>
                <Badge 
                  variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {rec.priority}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Weather Impact Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Weather Impact on Operations</CardTitle>
          <CardDescription>
            How current conditions may affect your patrol duties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
              <span className="text-sm">Visibility Conditions</span>
              <Badge variant={weatherData.current.visibility > 8 ? 'secondary' : 'destructive'}>
                {weatherData.current.visibility > 8 ? 'Good' : 'Poor'}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
              <span className="text-sm">Wind Impact</span>
              <Badge variant={weatherData.current.windSpeed < 20 ? 'secondary' : 'destructive'}>
                {weatherData.current.windSpeed < 20 ? 'Low' : 'High'}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
              <span className="text-sm">Precipitation Risk</span>
              <Badge variant={weatherData.forecast.some(f => f.precipitation > 50) ? 'destructive' : 'secondary'}>
                {weatherData.forecast.some(f => f.precipitation > 50) ? 'High' : 'Low'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}