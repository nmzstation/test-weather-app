<script setup lang="ts">
const location = ref('Tokyo');
const selectedDate = ref(new Date().toISOString().slice(0, 10));
const weather = ref<any>(null);
const loading = ref(false);
const errorMessage = ref('');

const selectedDateLabel = computed(() => {
  if (!selectedDate.value) {
    return '';
  }

  return new Date(`${selectedDate.value}T00:00:00`).toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });
});

function getWeatherIcon(code: number) {
  const icons: Record<number, string> = {
    0: '☀️',
    1: '🌤️',
    2: '⛅',
    3: '☁️',
    45: '🌫️',
    48: '🌫️',
    51: '🌦️',
    53: '🌦️',
    55: '🌦️',
    61: '🌧️',
    63: '🌧️',
    65: '🌧️',
    71: '🌨️',
    73: '🌨️',
    75: '🌨️',
    95: '⛈️',
    96: '⛈️',
    99: '⛈️'
  };

  return icons[code] ?? '🌈';
}

async function fetchWeather() {
  loading.value = true;
  errorMessage.value = '';

  try {
    weather.value = await $fetch('/api/weather', {
      query: {
        location: location.value,
        date: selectedDate.value
      }
    });
  } catch (error: any) {
    errorMessage.value = error?.data?.message || '天気情報の取得に失敗しました。';
    weather.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchWeather();
});
</script>

<template>
  <div class="page-shell">
    <section class="hero">
      <p class="eyebrow">Nuxt.js Weather App</p>
      <h1>地域名で今日の天気をチェック</h1>
      <p class="lead">入力した地域と日付に合わせて、天気を見やすく確認できます。</p>

      <form class="form-card" @submit.prevent="fetchWeather">
        <label>
          <span>地域名</span>
          <input v-model="location" type="text" placeholder="例: 東京" />
        </label>
        <label>
          <span>日付</span>
          <input v-model="selectedDate" type="date" />
        </label>
        <button type="submit" :disabled="loading">
          {{ loading ? '取得中...' : '天気を取得' }}
        </button>
      </form>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </section>

    <section v-if="weather" class="result-card">
      <div class="result-head">
        <div>
          <p class="eyebrow">{{ weather.location }}</p>
          <h2>{{ selectedDateLabel }}</h2>
          <p class="summary">{{ weather.summary }}</p>
        </div>
        <div class="icon-badge">{{ getWeatherIcon(weather.weatherCode) }}</div>
      </div>

      <div class="metrics">
        <div class="metric">
          <span>最高気温</span>
          <strong>{{ weather.maxTemp }}℃</strong>
        </div>
        <div class="metric">
          <span>最低気温</span>
          <strong>{{ weather.minTemp }}℃</strong>
        </div>
        <div class="metric">
          <span>降水確率</span>
          <strong>{{ weather.precipitationProbability }}%</strong>
        </div>
        <div class="metric">
          <span>風速</span>
          <strong>{{ weather.windSpeed }} km/h</strong>
        </div>
      </div>

      <div class="forecast-list">
        <div v-for="item in weather.weekly" :key="item.date" class="forecast-item">
          <span class="forecast-date">{{ item.date }}</span>
          <span class="forecast-icon">{{ getWeatherIcon(item.weatherCode) }}</span>
          <span class="forecast-temp">{{ item.maxTemp }}℃</span>
          <div class="bar-track">
            <div class="bar-fill" :style="{ height: `${Math.max(18, item.maxTemp + 20)}px` }"></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
:global(body) {
  margin: 0;
  font-family: 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #f4fbff 0%, #dceeff 100%);
  color: #123;
}

.page-shell {
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}

.hero,
.result-card {
  width: min(860px, 100%);
  background: rgba(255, 255, 255, 0.92);
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 18px 40px rgba(17, 34, 51, 0.12);
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.8rem;
  font-weight: 700;
  color: #2672c8;
  margin: 0 0 8px;
}

h1,
h2 {
  margin: 0;
}

.lead {
  margin: 8px 0 20px;
  color: #456;
}

.form-card {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: 12px;
  align-items: end;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
  color: #234;
}

input {
  border: 1px solid #cfe0f4;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 1rem;
}

button {
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  background: #2672c8;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.error {
  margin-top: 12px;
  color: #c0392b;
  font-weight: 600;
}

.result-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.summary {
  color: #567;
  margin-top: 8px;
}

.icon-badge {
  font-size: 3rem;
  background: #eef6ff;
  border-radius: 50%;
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.metric {
  background: #f7fbff;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric span {
  color: #678;
  font-size: 0.9rem;
}

.metric strong {
  font-size: 1.15rem;
}

.forecast-list {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.forecast-item {
  background: #f7fbff;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.forecast-date {
  font-size: 0.85rem;
  color: #567;
}

.forecast-icon {
  font-size: 1.5rem;
}

.forecast-temp {
  font-weight: 700;
}

.bar-track {
  width: 100%;
  height: 60px;
  border-radius: 999px;
  background: #e1ecf7;
  display: flex;
  align-items: end;
  justify-content: center;
  overflow: hidden;
}

.bar-fill {
  width: 60%;
  border-radius: 999px;
  background: linear-gradient(180deg, #6aa7ff 0%, #2672c8 100%);
}

demo-card {
  margin-top: 8px;
}

.demo-input {
  width: 100%;
  margin-bottom: 12px;
}

.demo-output {
  min-height: 48px;
  padding: 12px;
  border-radius: 12px;
  background: #f7fbff;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

@media (max-width: 760px) {
  .form-card {
    grid-template-columns: 1fr;
  }

  .metrics,
  .forecast-list {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
