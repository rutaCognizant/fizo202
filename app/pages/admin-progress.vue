<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { formatTime } from '~/utils';
import type { CompareResponse, ProgressRow } from '~~/server/api/tournaments/compare.get';

type Exercise = 'pushups' | 'crunches' | 'running';
type Metric = 'points' | 'raw';
type SortKey = 'name' | `${Exercise | 'total'}.${'first' | 'second' | 'delta'}`;

const pointsKey = { pushups: 'pushupPoints', crunches: 'crunchesPoints', running: 'runningPoints' } as const;

const tournaments = await $fetch('/api/tournaments');

// Tournaments come newest first, so the default comparison is "previous vs latest".
const first = ref<string>(tournaments[1]?.date ?? '');
const second = ref<string>(tournaments[0]?.date ?? '');

const metric = ref<Metric>('points');
const onlyBoth = ref<boolean>(true);
const sortKey = ref<SortKey>('total.delta');
const sortDesc = ref<boolean>(true);

const comparison = ref<CompareResponse | null>(null);
const error = ref<string>('');
const loading = ref<boolean>(false);

const loadComparison = async () => {
  if (!first.value || !second.value || first.value === second.value) {
    comparison.value = null;
    error.value = first.value === second.value ? 'Pick two different tournaments.' : '';
    return;
  }

  loading.value = true;
  error.value = '';
  try {
    comparison.value = await $fetch('/api/tournaments/compare', {
      query: { first: first.value, second: second.value },
    });
  } catch (e) {
    comparison.value = null;
    error.value = (e as { statusMessage?: string }).statusMessage || 'Failed to load the comparison.';
  } finally {
    loading.value = false;
  }
};

await loadComparison();
watch([first, second], loadComparison);

// A count or time of 0 means the exercise was not performed, so there is no value to show or score.
const value = (entry: ProgressRow['first'], exercise: Exercise): number | null => {
  if (!entry || entry[exercise] === 0) return null;
  return metric.value === 'points' ? entry[pointsKey[exercise]] : entry[exercise];
};

// The server already nulls out deltas for exercises that were skipped in either tournament.
const delta = (row: ProgressRow, exercise: Exercise): number | null => {
  if (!row.delta) return null;
  return metric.value === 'points' ? row.delta[pointsKey[exercise]] : row.delta[exercise];
};

const sortValue = (row: ProgressRow, key: SortKey): number | null => {
  if (key === 'name') return null;
  const [group, column] = key.split('.') as [Exercise | 'total', 'first' | 'second' | 'delta'];

  if (group === 'total') {
    if (column === 'delta') return row.delta?.totalPoints ?? null;
    return row[column]?.totalPoints ?? null;
  }

  if (column === 'delta') return delta(row, group);
  return value(row[column], group);
};

const rows = computed<ProgressRow[]>(() => {
  const all = comparison.value?.rows ?? [];
  const visible = onlyBoth.value ? all.filter((row) => row.delta) : [...all];

  return visible.sort((a, b) => {
    if (sortKey.value === 'name') {
      return sortDesc.value ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
    }

    const av = sortValue(a, sortKey.value);
    const bv = sortValue(b, sortKey.value);
    if (av === null && bv === null) return a.name.localeCompare(b.name);
    if (av === null) return 1; // missing values always sort last
    if (bv === null) return -1;
    if (av === bv) return a.name.localeCompare(b.name);
    return sortDesc.value ? bv - av : av - bv;
  });
});

const compared = computed(() => rows.value.filter((row) => row.delta));
const scored = computed(() => rows.value.filter((row) => row.delta?.totalPoints != null));
const improved = computed(() => scored.value.filter((row) => row.delta!.totalPoints! > 0).length);
const declined = computed(() => scored.value.filter((row) => row.delta!.totalPoints! < 0).length);
const averageDelta = computed(() => {
  if (!scored.value.length) return 0;
  const sum = scored.value.reduce((total, row) => total + row.delta!.totalPoints!, 0);
  return Math.round((sum / scored.value.length) * 10) / 10;
});

const sortBy = (key: SortKey) => {
  if (sortKey.value === key) {
    sortDesc.value = !sortDesc.value;
    return;
  }
  sortKey.value = key;
  // Names read best A→Z, numbers best from the top.
  sortDesc.value = key !== 'name';
};

const sortIndicator = (key: SortKey) => (sortKey.value === key ? (sortDesc.value ? ' ▼' : ' ▲') : '');

const displayValue = (entry: ProgressRow['first'], exercise: Exercise): string => {
  const raw = value(entry, exercise);
  if (raw === null) return '—';
  if (metric.value === 'raw' && exercise === 'running') return formatTime(raw);
  return String(raw);
};

const displayDelta = (row: ProgressRow, exercise: Exercise): string => {
  const raw = delta(row, exercise);
  if (raw === null) return '—';
  if (metric.value === 'raw' && exercise === 'running') return signedTime(raw);
  return signed(raw);
};

const signed = (n: number) => (n > 0 ? `+${n}` : String(n));
const signedTime = (seconds: number) =>
  seconds === 0 ? '0:00' : `${seconds > 0 ? '+' : '-'}${formatTime(Math.abs(seconds))}`;

// For the run, a lower raw time is an improvement; points always go up when better.
const deltaClass = (row: ProgressRow, exercise: Exercise): string => {
  const raw = delta(row, exercise);
  if (raw === null || raw === 0) return '';
  const better = metric.value === 'raw' && exercise === 'running' ? raw < 0 : raw > 0;
  return better ? 'delta-up' : 'delta-down';
};

const totalDeltaClass = (row: ProgressRow): string => {
  const raw = row.delta?.totalPoints;
  if (raw == null || raw === 0) return '';
  return raw > 0 ? 'delta-up' : 'delta-down';
};

const label = (date: string) => {
  const tournament = tournaments.find((t) => t.date === date);
  return tournament ? `${tournament.date} (${tournament.participants} participants)` : date;
};
</script>

<template>
  <div class="admin-container">
    <div class="admin-header">
      <h1>📈 Tournament Progress</h1>
      <p>Compare two tournaments and see how each participant moved</p>
      <div style="margin-top: 15px">
        <a href="/admin" class="secondary-btn">📊 Admin Dashboard</a>
        <a href="/" class="secondary-btn" style="margin-left: 10px">🏠 Main Page</a>
      </div>
    </div>

    <div v-if="tournaments.length < 2" class="admin-section">
      <h2>🏆 Tournaments</h2>
      <p>
        At least two tournaments are needed for a comparison. A tournament is a date with more than 5 participants — so
        far there {{ tournaments.length === 1 ? 'is 1' : 'are 0' }}.
      </p>
    </div>

    <template v-else>
      <div class="admin-section">
        <h2>🏆 Select Tournaments</h2>
        <div style="margin-bottom: 10px; gap: 10px; display: flex; align-items: center; flex-wrap: wrap">
          From:
          <select id="firstTournament" v-model="first" class="date-input">
            <option v-for="tournament in tournaments" :key="tournament.date" :value="tournament.date">
              {{ label(tournament.date) }}
            </option>
          </select>
          To:
          <select id="secondTournament" v-model="second" class="date-input">
            <option v-for="tournament in tournaments" :key="tournament.date" :value="tournament.date">
              {{ label(tournament.date) }}
            </option>
          </select>
        </div>

        <div style="margin-bottom: 10px; gap: 15px; display: flex; align-items: center; flex-wrap: wrap">
          Compare by:
          <label><input v-model="metric" type="radio" value="points" /> Points</label>
          <label><input v-model="metric" type="radio" value="raw" /> Raw results</label>
        </div>

        <div style="gap: 10px; display: flex; align-items: center">
          <input id="onlyBoth" v-model="onlyBoth" type="checkbox" />
          <label for="onlyBoth">Only participants present in both tournaments</label>
        </div>
      </div>

      <div v-if="error" class="admin-section">
        <p class="fail-indicator">{{ error }}</p>
      </div>

      <div v-else-if="loading" class="admin-section">
        <p>Loading comparison…</p>
      </div>

      <template v-else-if="comparison">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ compared.length }}</div>
            <div class="stat-label">Participants in both</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ scored.length ? signed(averageDelta) : '—' }}</div>
            <div class="stat-label">Average total delta ({{ scored.length }} comparable)</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ improved }}</div>
            <div class="stat-label">Improved</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ declined }}</div>
            <div class="stat-label">Declined</div>
          </div>
        </div>

        <div class="admin-section">
          <h2>📋 {{ comparison.first }} → {{ comparison.second }}</h2>
          <p style="margin-bottom: 10px">
            Click any column to sort. Δ is {{ comparison.second }} minus {{ comparison.first }}
            <template v-if="metric === 'raw'"> (for the run, a negative delta means a faster time)</template>. An
            exercise with 0 reps or a 0 run time was not performed: it shows as — and is left out of the total delta, so
            Δ total does not always equal 2nd − 1st.
          </p>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th rowspan="2" class="sortable" @click="sortBy('name')">🏷️ Nickname{{ sortIndicator('name') }}</th>
                  <th colspan="3">✋ Push-ups</th>
                  <th colspan="3">🦐 Crunches</th>
                  <th colspan="3">🏃‍♂️ 3000 m Run</th>
                  <th colspan="3">📊 Total Points</th>
                </tr>
                <tr>
                  <template v-for="exercise in ['pushups', 'crunches', 'running', 'total'] as const" :key="exercise">
                    <th class="sortable" @click="sortBy(`${exercise}.first`)">
                      1st{{ sortIndicator(`${exercise}.first`) }}
                    </th>
                    <th class="sortable" @click="sortBy(`${exercise}.second`)">
                      2nd{{ sortIndicator(`${exercise}.second`) }}
                    </th>
                    <th class="sortable" @click="sortBy(`${exercise}.delta`)">
                      Δ{{ sortIndicator(`${exercise}.delta`) }}
                    </th>
                  </template>
                </tr>
              </thead>

              <tbody v-if="rows.length">
                <tr v-for="row in rows" :key="row.userId">
                  <td>{{ row.name }}</td>

                  <template v-for="exercise in ['pushups', 'crunches', 'running'] as const" :key="exercise">
                    <td>{{ displayValue(row.first, exercise) }}</td>
                    <td>{{ displayValue(row.second, exercise) }}</td>
                    <td :class="deltaClass(row, exercise)">{{ displayDelta(row, exercise) }}</td>
                  </template>

                  <td>{{ row.first?.totalPoints ?? '—' }}</td>
                  <td>{{ row.second?.totalPoints ?? '—' }}</td>
                  <td :class="totalDeltaClass(row)">
                    {{ row.delta?.totalPoints != null ? signed(row.delta.totalPoints) : '—' }}
                  </td>
                </tr>
              </tbody>

              <tbody v-else>
                <tr>
                  <td colspan="13" class="empty">No participants to compare.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<style>
@import url('~/assets/styles.css');

.date-input {
  margin-right: 10px;
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.data-table th.sortable:hover {
  background: #eef6ff;
}

.data-table td.delta-up {
  color: #2e7d32;
  font-weight: 600;
}

.data-table td.delta-down {
  color: #c62828;
  font-weight: 600;
}
</style>
