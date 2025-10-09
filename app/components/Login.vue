<template>
  <div id="loginSection" class="login-container">
    <div class="login-header">
      <h2>🔐 Admin Login</h2>
      <p>🕹️ FIZO202 Military Fitness Tracker</p>
    </div>
    <form id="loginForm">
      <div class="form-group">
        <label for="username">👤 Username</label>
        <input type="text" id="username" name="username" required>
      </div>
      <div class="form-group">
        <label for="password">🔑 Password</label>
        <input type="password" id="password" name="password" required>
      </div>
      <div class="submit-section">
        <button type="submit" class="submit-btn">
          🚪 Login to Admin Panel
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 100px auto;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #2d5016;
  margin-bottom: 10px;
}
</style>