<script setup lang="ts">

const name = ref<string>('');
const age = ref<number | null>(null);
const gender = ref<'M' | 'F' | null>(null);

const pushups = ref<number | null>(null);
const crunches = ref<number | null>(null);
const runMinutes = ref<number | null>(null);
const runSeconds = ref<number | null>(null);

const scoringTableDisabled = computed(() => {
  return age.value === null || gender.value === null;
});

const openScoringTables = () => {
  const width = 900;
  const height = 700;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;
  window.open(
    `/scoring-table?age=${age.value}&gender=${gender.value}`,
    'Scoring Tables',
    `width=${width},height=${height},top=${top},left=${left}`
  );
};

const submitResults = async (_event: Event) => {
  const runningSeconds =
    runMinutes.value !== null && runSeconds.value !== null
      ? runMinutes.value * 60 + runSeconds.value
      : null;

  const results = await $fetch('/api/activities', {
    method: 'POST',
    body: {
      name: name.value,
      age: age.value,
      gender: gender.value,
      pushups: pushups.value,
      crunches: crunches.value,
      running: runningSeconds,
    },
  });

  navigateTo({
    path: `/results/${results.id}`,
  });
};
</script>

<template>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <h1>🪖 FIZO202 Fitness Tracker</h1>
    </header>

    <!-- Main Form -->
    <div class="form-container">
      <form id="fitnessForm" @submit.prevent="submitResults">
        <!-- Personal Information -->
        <div class="section">
          <h2>👤 Personal Information</h2>
          <div class="form-row">
            <div class="form-group">
              <label for="nickname">🏷️ Nickname</label>
              <input id="nickname" v-model="name" type="text" name="nickname" required />
            </div>
            <div class="form-group">
              <label for="user-age">🎂 Age</label>
              <input id="user-age" v-model="age" type="number" name="user-age" min="1" max="120" autocomplete="off"
                autocapitalize="off" autocorrect="off" spellcheck="false" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>⚥ Gender</label>
              <div class="radio-group">
                <label>
                  <input v-model="gender" type="radio" :value="'male'" name="gender" required />
                  Male
                </label>
                <label>
                  <input v-model="gender" type="radio" :value="'female'" name="gender" required />
                  Female
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Scoring Tables Link -->
        <div class="scoring-tables-section">
          <button type="button" class="scoring-btn" :disabled="scoringTableDisabled" @click="openScoringTables">📋 View
            Scoring Tables</button>
          <!-- <p class="scoring-help">
            See what you need for 60 and 100 points based on your age
          </p> -->
        </div>

        <!-- Exercise Results -->
        <div class="section">
          <h2>💪 Exercise Results</h2>

          <div class="exercise-group">
            <div class="exercise-header">
              <h3>💪 Push-ups</h3>
            </div>
            <div class="form-group">
              <label for="pushups">Number of repetitions</label>
              <input id="pushups" v-model="pushups" type="number" name="pushups" required />
            </div>
          </div>

          <div class="exercise-group">
            <div class="exercise-header">
              <h3>🤸‍♂️ Crunches</h3>
            </div>
            <div class="form-group">
              <label for="crunches">Number of repetitions</label>
              <input id="crunches" v-model="crunches" type="number" name="crunches" required />
            </div>
          </div>

          <div class="exercise-group">
            <div class="exercise-header">
              <h3>🏃‍♂️ 3000m Run</h3>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="runMinutes">Minutes</label>
                <input id="runMinutes" v-model="runMinutes" type="number" name="runMinutes" min="0" max="59" required />
              </div>
              <div class="form-group">
                <label for="runSeconds">Seconds</label>
                <input id="runSeconds" v-model="runSeconds" type="number" name="runSeconds" min="0" max="59" required />
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="submit-section">
          <button type="submit" class="submit-btn">📊 Calculate My Fitness Score</button>
        </div>
      </form>
    </div>

    <!-- Loading Spinner -->
    <div id="loadingSpinner" class="loading-spinner" style="display: none">
      <div class="spinner" />
      <p>Calculating your fitness score...</p>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-links">
        <a href="/admin">👮 Admin Panel</a>
        <span class="separator">|</span>
        <span class="version">FIZO202 v1.0.0</span>
      </div>
      <p>&copy; 2024 FIZO202 Fitness Tracker. Built for excellence.</p>
    </footer>
  </div>
</template>

<style>
@import url('~/assets/styles.css');
</style>
