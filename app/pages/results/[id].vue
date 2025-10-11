<script setup lang="ts">
import { formatTime } from '~/utils';

const route = useRoute();

console.log(route.params.id);

const {
  activity,
  user: _,
  pushupPoints,
  crunchesPoints,
  runningPoints,
} = await $fetch(`/api/activities/${route.params.id}`);

const goBack = () => {
  navigateTo({
    path: '/',
  });
};
</script>

<template>
  <div class="container">
    <div id="resultsSection" class="results-section">
      <h2>📊 Your Fitness Results</h2>

      <div class="results-grid">
        <div id="pushupsResult" class="result-card">
          <h3>💪 Push-ups</h3>
          <div class="result-value">{{ activity.pushups }} reps</div>
          <div class="result-points">{{ pushupPoints }} points</div>
          <div class="result-status">{{ pushupPoints >= 60 ? '✅' : '❌' }}</div>
        </div>

        <div id="crunchesResult" class="result-card">
          <h3>🤸‍♂️ Crunches</h3>
          <div class="result-value">{{ activity.crunches }} reps</div>
          <div class="result-points">{{ crunchesPoints }} points</div>
          <div class="result-status">{{ crunchesPoints >= 60 ? '✅' : '❌' }}</div>
        </div>

        <div id="runResult" class="result-card">
          <h3>🏃‍♂️ 3000m Run</h3>
          <div class="result-value">
            {{ formatTime(activity.running) }}
          </div>
          <div class="result-points">{{ runningPoints }} points</div>
          <div class="result-status">{{ runningPoints >= 60 ? '✅' : '❌' }}</div>
        </div>
      </div>

      <div class="total-result">
        <div class="total-points">Total Score: {{ pushupPoints + crunchesPoints + runningPoints }}/300 points</div>
        <div class="overall-status">{{ pushupPoints + crunchesPoints + runningPoints >= 180 ? '✅' : '❌' }}</div>
      </div>

      <div class="result-actions">
        <button class="secondary-btn" @click="goBack">📝 Submit Another Result</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('~/assets/styles.css');
</style>
