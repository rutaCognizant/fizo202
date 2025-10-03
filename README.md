# FIZO202 Fitness Tracker 🕹️

A web application to track fitness test results and calculate scores based on age and gender ranges.

## Features ✨

- **📱 Mobile-friendly interface** for users to enter results
- **🏃‍♂️ Three exercise tracking**: Push-ups, Crunches, 3000m Run
- **📊 Automatic scoring** based on age and gender ranges
- **✅ Pass/Fail indicators** (60+ points per exercise required)
- **👨‍💼 Admin dashboard** to view all results and activity logs
- **🔄 Result updates** for existing users (same email/nickname)
- **📝 Complete activity logging** for audit trail

## Quick Start 🚀

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd fizo202-fitness-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
node server.js
```

4. Open your browser:
- **Main app**: http://localhost:3002
- **Admin panel**: http://localhost:3002/admin.html

### Admin Access 🔑

- **Username**: admin
- **Password**: fizo2025

## Scoring System 📈

The application uses fitness standards with age and gender-based scoring:

- **Push-ups**: Scored based on repetitions
- **Crunches**: Scored based on repetitions  
- **3000m Run**: Scored based on completion time

Each exercise requires **60+ points** to pass. The system automatically:
- Calculates individual exercise scores
- Determines pass/fail status for each exercise
- Computes total fitness score
- Highlights performance indicators

## Technology Stack 💻

- **Backend**: Node.js + Express
- **Database**: SQLite
- **Frontend**: HTML5, CSS3, JavaScript
- **Styling**: Responsive design with military theme

## Deployment 🌐

This application is configured for deployment on Render.com with automatic database initialization and environment-based configuration.

## License 📄

Fitness tracking application - FIZO202