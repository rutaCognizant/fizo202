<script setup lang="ts">

import { ref } from 'vue';
import { formatTime } from '~/utils';

const route = useRoute();

const name = ref<string>('');
const activities = ref<Array<{
  id: number;
  createdAt: string;
  pushups: number;
  crunches: number;
  running: number;
  totalPoints: number;
  username: string;
}>>([]);

if (route.query.name) {
  name.value = route.query.name as string;
}

const fetchedActivities = await $fetch('/api/activities/history', {
  method: 'GET',
  query: {
    user: name.value,
  },
});

activities.value = fetchedActivities;

const downloadHistory = async () => {
  const user = activities.value[0]?.username || name.value;
  if (!user) return;

  const res = await fetch(`/api/activities/history-xlsx?user=${encodeURIComponent(user)}`);
  if (!res.ok) {
    console.error('Failed to fetch XLSX:', res.statusText);
    return;
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', `${user}-history.xlsx`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

</script>

<template>
  <div class="container">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;">
      <h1 style="margin:0">Activity History for {{ activities[0]?.username || name }}</h1>
      <div class="history-controls">
        <button type="button" class="secondary-btn download-btn" @click="downloadHistory">⬇️ Download XLSX</button>
      </div>
    </div>

    <div class="history-table-wrapper">
      <table class="history-table" aria-describedby="history-caption">
        <caption id="history-caption">Recent activities and points</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Push-ups</th>
            <th scope="col">Crunches</th>
            <th scope="col">3000m Run Time</th>
            <th scope="col">Total Points</th>
          </tr>
        </thead>

        <tbody v-if="activities.length">
          <tr v-for="activity in activities" :key="activity.id">
            <td>{{ new Date(activity.createdAt).toLocaleDateString() }}</td>
            <td>{{ activity.pushups }}</td>
            <td>{{ activity.crunches }}</td>
            <td>{{ activity.running > 0 ? formatTime(activity.running) : '-' }}</td>
            <td class="total">{{ activity.totalPoints }}</td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td colspan="5" class="empty">No activities yet.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style>
@import url('~/assets/styles.css');
</style>