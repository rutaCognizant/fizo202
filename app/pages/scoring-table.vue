<script setup lang="ts">
import { ref } from 'vue';
import { formatTime } from '~/utils';

const age = ref<number | null>(null);
const gender = ref<'M' | 'F' | null>(null);
const route = useRoute();

if (route.query.age) {
  age.value = parseInt(route.query.age as string, 10);
}
if (route.query.gender) {
  gender.value = route.query.gender as 'M' | 'F';
}

const { pushup60, pushup100, crunches60, crunches100, running60, running100 } = await $fetch('/api/get-targets', {
  method: 'POST',
  body: {
    age: age.value,
    gender: gender.value,
  },
});
</script>

<template>

  <body>
    <div class="header">
      <h1>🪖 FIZO202 Scoring Tables</h1>
      <p>Age: {{ age }} | Gender: {{ gender === 'M' ? 'Male' : 'Female' }}</p>
    </div>

    <div class="targets">
      <h3>🎯 Your Personal Targets</h3>
      <div class="target-row">
        <span class="exercise">💪 Push-ups</span>
        <span class="target-60">60 pts: {{ pushup60 }}</span>
        <span class="target-100">100 pts: {{ pushup100 }}</span>
      </div>
      <div class="target-row">
        <span class="exercise">🤸‍♂️ Crunches</span>
        <span class="target-60">60 pts: {{ crunches60 }}</span>
        <span class="target-100">100 pts: {{ crunches100 }}</span>
      </div>
      <div class="target-row">
        <span class="exercise">🏃‍♂️ 3000m Run</span>
        <span class="target-60">60 pts: {{ formatTime(running60) }}</span>
        <span class="target-100">100 pts: {{ formatTime(running100) }}</span>
      </div>
    </div>

    <!-- <h2>📊 Complete Scoring Tables</h2>
  <table></table> -->
  </body>
</template>

<style scoped>
@import url('~/assets/styles.css');

body {
  font-family: Inter, sans-serif;
  margin: 20px;
  background: #f0f8f0;
}

.header {
  text-align: center;
  color: #2d5016;
  margin-bottom: 30px;
}

.targets {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 2px solid #4a7c59;
}

.targets h3 {
  color: #2d5016;
  margin-top: 0;
}

.target-row {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.exercise {
  font-weight: 600;
  color: #2d5016;
}

.target-60 {
  color: #ff6b35;
  font-weight: 600;
}

.target-100 {
  color: #4a7c59;
  font-weight: 600;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

th,
td {
  padding: 12px;
  text-align: center;
  border: 1px solid #ddd;
}

th {
  background: #4a7c59;
  color: white;
  font-weight: 600;
}

.age-group {
  background: #f0f8f0;
  font-weight: 600;
  color: #2d5016;
}

.highlight-60 {
  background: #fff3cd;
}

.highlight-100 {
  background: #d4edda;
}
</style>
