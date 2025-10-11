<script setup lang="ts">

const now = new Date();
const back = new Date();
back.setDate(now.getDate() - 1); // Default to one day back

const reportDate = ref(back.toISOString().split('T')[0] as string);
const reportDateEnd = ref<string>(now.toISOString().split('T')[0] as string);
const includeAll = ref<boolean>(false);

const getReport = async () => {
  const reportData = await $fetch('/api/activities/report', {
    method: 'POST',
    body: {
      startDate: reportDate.value,
      endDate: reportDateEnd.value,
      includeAll: includeAll.value,
    },
  });

  // Download xlsx file
  const blob = new Blob([reportData as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fizo202_report.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

</script>

<template>
  <div class="admin-container">
    <!-- <Login /> -->

    <!-- Admin Dashboard -->
    <div id="adminDashboard">
      <!-- Header -->
      <div class="admin-header">
        <h1>📊 FIZO202 Admin Dashboard</h1>
        <p>Monitor fitness test results and system activity</p>
        <div style="margin-top: 15px">
          <a href="/" class="secondary-btn">🏠 Main Page</a>
          <button onclick="logout()" class="secondary-btn" style="margin-left: 10px">🚪 Logout</button>
        </div>
      </div>

      <!-- Statistics Section -->
      <form class="admin-section" @submit.prevent="getReport">
        <!-- <h2>📈 System Statistics</h2>
        <div id="statsGrid" class="stats-grid">
          Stats will be loaded here
        </div> -->

        <h2>📥 Download Reports</h2>
        <div style="margin-bottom: 10px; gap: 10px; display: flex; align-items: center;">
          Select Date Range:
          From: <input id="reportDate" v-model="reportDate" type="date" class="date-input" required />
          To: <input id="reportDateEnd" v-model="reportDateEnd" type="date" class="date-input" required />
        </div>
        <div style="margin-bottom: 20px; gap: 10px; display: flex; align-items: center;">
          <input id="includeAll" v-model="includeAll" type="checkbox" name="includeAll" />
          <label for="includeAll">Include all</label>
        </div>

        <button class="secondary-btn" style="margin-bottom: 20px" type="submit">
          Download Excel Report
        </button>
      </form>

      <!-- All Results Section -->
      <!-- <div class="admin-section">
        <h2>📋 All Fitness Results</h2>
        <div class="table-container">
          <table id="resultsTable" class="data-table">
            <thead>
              <tr>
                <th>📧 Email</th>
                <th>🏷️ Nickname</th>
                <th>🎂 Age</th>
                <th>⚥ Gender</th>
                <th>✋ Push-ups</th>
                <th>🦐 Crunches</th>
                <th>🏃‍♂️ Run</th>
                <th>📊 Total</th>
                <th>✅ Status</th>
                <th>📅 Date</th>
              </tr>
            </thead>
            <tbody id="resultsTableBody">
              Results will be loaded here
            </tbody>
          </table>
        </div>
      </div> -->

      <!-- Activity Log Section -->
      <!-- <div class="admin-section">
        <h2>📝 Activity Log</h2>
        <div class="table-container">
          <table id="activityTable" class="data-table">
            <thead>
              <tr>
                <th>🎬 Action</th>
                <th>📧 Email</th>
                <th>🏷️ Nickname</th>
                <th>📋 Details</th>
                <th>🌐 IP Address</th>
                <th>📅 Timestamp</th>
              </tr>
            </thead>
            <tbody id="activityTableBody">
              Activity log will be loaded here
            </tbody>
          </table>
        </div>
      </div> -->
    </div>
  </div>
</template>

<style>
@import url('~/assets/styles.css');

.date-input {
  margin-right: 10px;
}
</style>
