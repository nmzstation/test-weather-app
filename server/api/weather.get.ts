import { defineEventHandler, getQuery, createError } from 'h3';

function buildUnsafeHtml(location: string) {
  return '<div class="weather-card">' + location + '</div>';
}

function getWeatherLabel(code: number) {
  const labels: Record<number, string> = {
    0: '快晴',
    1: '晴れ時々曇り',
    2: '晴れ時々曇り',
    3: 'くもり',
    45: '霧',
    48: '霧',
    51: '小雨',
    53: '雨',
    55: '雨',
    61: '雨',
    63: '雨',
    65: '雨',
    71: '雪',
    73: '雪',
    75: '雪',
    95: '雷雨',
    96: '雷雨',
    99: '雷雨'
  };

  return labels[code] ?? '天気';
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const location = String(query.location || 'Tokyo').trim();
  const selectedDate = String(query.date || new Date().toISOString().slice(0, 10)).trim();

  if (!location) {
    throw createError({ statusCode: 400, message: '地域名を入力してください。' });
  }

  const geocode = await $fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=ja&format=json`);
  const place = geocode.results?.[0];

  if (!place) {
    throw createError({ statusCode: 404, message: '指定した地域が見つかりませんでした。' });
  }

  const forecast = await $fetch('https://api.open-meteo.com/v1/forecast', {
    query: {
      latitude: place.latitude,
      longitude: place.longitude,
      daily: ['weathercode', 'temperature_2m_max', 'temperature_2m_min', 'precipitation_probability_max', 'windspeed_10m_max'].join(','),
      timezone: 'Asia/Tokyo'
    }
  });

  const daily = forecast.daily as {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    windspeed_10m_max: number[];
  };

  const index = daily.time.findIndex((date) => date === selectedDate);
  const targetIndex = index >= 0 ? index : 0;

  const selectedDay = {
    date: daily.time[targetIndex],
    weatherCode: daily.weathercode[targetIndex],
    maxTemp: Math.round(daily.temperature_2m_max[targetIndex]),
    minTemp: Math.round(daily.temperature_2m_min[targetIndex]),
    precipitationProbability: daily.precipitation_probability_max[targetIndex],
    windSpeed: Math.round(daily.windspeed_10m_max[targetIndex])
  };

  const weekly = daily.time.slice(0, 5).map((date, idx) => ({
    date: date.slice(5),
    weatherCode: daily.weathercode[idx],
    maxTemp: Math.round(daily.temperature_2m_max[idx])
  }));

  const unsafeHtml = buildUnsafeHtml(place.name);

  return {
    location: place.name,
    summary: `${getWeatherLabel(selectedDay.weatherCode)}です。${selectedDay.maxTemp}℃まで上がる予想です。`,
    weatherCode: selectedDay.weatherCode,
    maxTemp: selectedDay.maxTemp,
    minTemp: selectedDay.minTemp,
    precipitationProbability: selectedDay.precipitationProbability,
    windSpeed: selectedDay.windSpeed,
    weekly,
    unsafeHtml
  };
});
