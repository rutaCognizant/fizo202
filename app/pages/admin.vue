<template>
  <div class="admin-container">
    <!-- <Login /> -->

    <!-- Admin Dashboard -->
    <div id="adminDashboard">
      <!-- Header -->
      <div class="admin-header">
        <h1>📊 FIZO202 Admin Dashboard</h1>
        <p>Monitor fitness test results and system activity</p>
        <div style="margin-top: 15px;">
          <a href="/" class="secondary-btn">🏠 Main Page</a>
          <button onclick="logout()" class="secondary-btn" style="margin-left: 10px;">🚪 Logout</button>
        </div>
      </div>

      <!-- Statistics Section -->
      <div class="admin-section">
        <h2>📈 System Statistics</h2>
        <div class="stats-grid" id="statsGrid">
          <!-- Stats will be loaded here -->
        </div>
      </div>

      <!-- All Results Section -->
      <div class="admin-section">
        <h2>📋 All Fitness Results</h2>
        <div class="table-container">
          <table class="data-table" id="resultsTable">
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
              <!-- Results will be loaded here -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Activity Log Section -->
      <div class="admin-section">
        <h2>📝 Activity Log</h2>
        <div class="table-container">
          <table class="data-table" id="activityTable">
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
              <!-- Activity log will be loaded here -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>


<style>
@import url("~/assets/styles.css");
</style>