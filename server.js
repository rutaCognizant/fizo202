const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'fizo202-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Initialize SQLite Database
const db = new sqlite3.Database('fizo202.db');

// Create tables
db.serialize(() => {
    // Fitness results table
    db.run(`CREATE TABLE IF NOT EXISTS fitness_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        nickname TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        pushups INTEGER NOT NULL,
        crunches INTEGER NOT NULL,
        run_time TEXT NOT NULL,
        pushups_points INTEGER NOT NULL,
        crunches_points INTEGER NOT NULL,
        run_points INTEGER NOT NULL,
        total_points INTEGER NOT NULL,
        passes_test INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Activity log table
    db.run(`CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        email TEXT,
        nickname TEXT,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('✅ FIZO202 database initialized');
});

// Scoring system based on your Excel data
const SCORING_SYSTEM = {
    // Push-ups scoring by age range and gender
    pushups: {
        '18-21': { M: [[77,100],[76,99],[75,98],[74,97],[73,96],[72,95],[71,94],[70,93],[69,92],[68,91],[67,90],[66,89],[65,88],[64,87],[63,86],[62,85],[61,84],[60,83],[59,82],[58,81],[57,80],[56,79],[55,78],[54,77],[53,76],[52,75],[51,74],[50,73],[49,72],[48,71],[47,70],[46,69],[45,68],[44,67],[43,66],[42,65],[41,64],[40,63],[39,62],[38,61],[37,60],[36,59],[35,58],[34,57],[33,56],[32,55],[31,54],[30,53],[29,52],[28,51],[27,50],[26,49],[25,48],[24,47],[23,46],[22,45],[21,44],[20,43],[19,42],[18,41],[17,40],[16,39],[15,38],[14,37],[13,36],[12,35],[11,34],[10,33],[9,32],[8,31],[7,30],[6,29],[5,28],[4,27],[3,26],[2,25],[1,24],[0,0]], 
                F: [[77,100],[76,99],[75,98],[74,97],[73,96],[72,95],[71,94],[70,93],[69,92],[68,91],[67,90],[66,89],[65,88],[64,87],[63,86],[62,85],[61,84],[60,83],[59,82],[58,81],[57,80],[56,79],[55,78],[54,77],[53,76],[52,75],[51,74],[50,73],[49,72],[48,71],[47,70],[46,69],[45,68],[44,67],[43,66],[42,65],[41,64],[40,63],[39,62],[38,61],[37,60],[36,59],[35,58],[34,57],[33,56],[32,55],[31,54],[30,53],[29,52],[28,51],[27,50],[26,49],[25,48],[24,47],[23,46],[22,45],[21,44],[20,43],[19,42],[18,41],[17,40],[16,39],[15,38],[14,37],[13,36],[12,35],[11,34],[10,33],[9,32],[8,31],[7,30],[6,29],[5,28],[4,27],[3,26],[2,25],[1,24],[0,0]] },
        '22-26': { M: [[75,100],[74,99],[73,98],[72,97],[71,96],[70,95],[69,94],[68,93],[67,92],[66,91],[65,90],[64,89],[63,88],[62,87],[61,86],[60,85],[59,84],[58,83],[57,82],[56,81],[55,80],[54,79],[53,78],[52,77],[51,76],[50,75],[49,74],[48,73],[47,72],[46,71],[45,70],[44,69],[43,68],[42,67],[41,66],[40,65],[39,64],[38,63],[37,62],[36,61],[35,60],[34,59],[33,58],[32,57],[31,56],[30,55],[29,54],[28,53],[27,52],[26,51],[25,50],[24,49],[23,48],[22,47],[21,46],[20,45],[19,44],[18,43],[17,42],[16,41],[15,40],[14,39],[13,38],[12,37],[11,36],[10,35],[9,34],[8,33],[7,32],[6,31],[5,30],[4,29],[3,28],[2,27],[1,26],[0,0]], 
                F: [[75,100],[74,99],[73,98],[72,97],[71,96],[70,95],[69,94],[68,93],[67,92],[66,91],[65,90],[64,89],[63,88],[62,87],[61,86],[60,85],[59,84],[58,83],[57,82],[56,81],[55,80],[54,79],[53,78],[52,77],[51,76],[50,75],[49,74],[48,73],[47,72],[46,71],[45,70],[44,69],[43,68],[42,67],[41,66],[40,65],[39,64],[38,63],[37,62],[36,61],[35,60],[34,59],[33,58],[32,57],[31,56],[30,55],[29,54],[28,53],[27,52],[26,51],[25,50],[24,49],[23,48],[22,47],[21,46],[20,45],[19,44],[18,43],[17,42],[16,41],[15,40],[14,39],[13,38],[12,37],[11,36],[10,35],[9,34],[8,33],[7,32],[6,31],[5,30],[4,29],[3,28],[2,27],[1,26],[0,0]] },
        // Add other age ranges similarly...
        'default': { M: [[60,100],[55,90],[50,80],[45,70],[40,60],[35,50],[30,40],[25,30],[20,20],[15,10],[10,5],[0,0]], 
                    F: [[50,100],[45,90],[40,80],[35,70],[30,60],[25,50],[20,40],[15,30],[10,20],[5,10],[0,0]] }
    },
    
    // Crunches scoring by age range and gender  
    crunches: {
        '18-21': { M: [[82,100],[81,99],[80,98],[79,97],[78,96],[77,95],[76,94],[75,93],[74,92],[73,91],[72,90],[71,89],[70,88],[69,87],[68,86],[67,85],[66,84],[65,83],[64,82],[63,81],[62,80],[61,79],[60,78],[59,77],[58,76],[57,75],[56,74],[55,73],[54,72],[53,71],[52,70],[51,69],[50,68],[49,67],[48,66],[47,65],[46,64],[45,63],[44,62],[43,61],[42,60],[41,59],[40,58],[39,57],[38,56],[37,55],[36,54],[35,53],[34,52],[33,51],[32,50],[31,49],[30,48],[29,47],[28,46],[27,45],[26,44],[25,43],[24,42],[23,41],[22,40],[21,39],[20,38],[19,37],[18,36],[17,35],[16,34],[15,33],[14,32],[13,31],[12,30],[11,29],[10,28],[9,27],[8,26],[7,25],[6,24],[5,23],[4,22],[3,21],[2,20],[1,19],[0,0]], 
                F: [[82,100],[81,99],[80,98],[79,97],[78,96],[77,95],[76,94],[75,93],[74,92],[73,91],[72,90],[71,89],[70,88],[69,87],[68,86],[67,85],[66,84],[65,83],[64,82],[63,81],[62,80],[61,79],[60,78],[59,77],[58,76],[57,75],[56,74],[55,73],[54,72],[53,71],[52,70],[51,69],[50,68],[49,67],[48,66],[47,65],[46,64],[45,63],[44,62],[43,61],[42,60],[41,59],[40,58],[39,57],[38,56],[37,55],[36,54],[35,53],[34,52],[33,51],[32,50],[31,49],[30,48],[29,47],[28,46],[27,45],[26,44],[25,43],[24,42],[23,41],[22,40],[21,39],[20,38],[19,37],[18,36],[17,35],[16,34],[15,33],[14,32],[13,31],[12,30],[11,29],[10,28],[9,27],[8,26],[7,25],[6,24],[5,23],[4,22],[3,21],[2,20],[1,19],[0,0]] },
        'default': { M: [[70,100],[65,90],[60,80],[55,70],[50,60],[45,50],[40,40],[35,30],[30,20],[25,10],[20,5],[0,0]], 
                    F: [[65,100],[60,90],[55,80],[50,70],[45,60],[40,50],[35,40],[30,30],[25,20],[20,10],[15,5],[0,0]] }
    },

    // 3000m Run scoring by age range and gender (times in seconds)
    run: {
        '18-21': { M: [['12:06',100],['12:24',99],['12:42',98],['13:00',97],['13:18',96],['13:36',95],['13:54',94],['14:12',93],['14:30',92],['14:48',91],['15:06',90],['15:24',89],['15:42',88],['16:00',87],['16:18',86],['16:36',85],['16:54',84],['17:12',83],['17:30',82],['17:48',81],['18:06',80],['18:24',79],['18:42',78],['19:00',77],['19:18',76],['19:36',75],['19:54',74],['20:12',73],['20:30',72],['20:48',71],['21:06',70],['21:24',69],['21:42',68],['22:00',67],['22:18',66],['22:36',65],['22:54',64],['23:12',63],['23:30',62],['23:48',61],['24:06',60],['40:00',0]], 
                  F: [['14:06',100],['14:24',99],['14:42',98],['15:00',97],['15:18',96],['15:36',95],['15:54',94],['16:12',93],['16:30',92],['16:48',91],['17:06',90],['17:24',89],['17:42',88],['18:00',87],['18:18',86],['18:36',85],['18:54',84],['19:12',83],['19:30',82],['19:48',81],['20:06',80],['20:24',79],['20:42',78],['21:00',77],['21:18',76],['21:36',75],['21:54',74],['22:12',73],['22:30',72],['22:48',71],['23:06',70],['23:24',69],['23:42',68],['24:00',67],['24:18',66],['24:36',65],['24:54',64],['25:12',63],['25:30',62],['25:48',61],['26:06',60],['40:00',0]] },
        'default': { M: [['15:00',100],['16:00',90],['17:00',80],['18:00',70],['19:00',60],['20:00',50],['22:00',40],['24:00',30],['26:00',20],['28:00',10],['40:00',0]], 
                    F: [['17:00',100],['18:00',90],['19:00',80],['20:00',70],['21:00',60],['22:00',50],['24:00',40],['26:00',30],['28:00',20],['30:00',10],['40:00',0]] }
    }
};

// Helper function to get age range
function getAgeRange(age) {
    if (age >= 18 && age <= 21) return '18-21';
    if (age >= 22 && age <= 26) return '22-26';
    if (age >= 27 && age <= 31) return '27-31';
    if (age >= 32 && age <= 36) return '32-36';
    if (age >= 37 && age <= 41) return '37-41';
    if (age >= 42 && age <= 46) return '42-46';
    if (age >= 47 && age <= 51) return '47-51';
    if (age >= 52 && age <= 56) return '52-56';
    if (age >= 57 && age <= 61) return '57-61';
    if (age >= 62) return '62+';
    return 'default';
}

// Helper function to convert time string to seconds
function timeToSeconds(timeStr) {
    const parts = timeStr.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

// Calculate points for an exercise
function calculatePoints(exercise, value, age, gender) {
    const ageRange = getAgeRange(age);
    const scoring = SCORING_SYSTEM[exercise][ageRange] || SCORING_SYSTEM[exercise]['default'];
    const genderScoring = scoring[gender] || scoring['M'];
    
    if (exercise === 'run') {
        const runSeconds = timeToSeconds(value);
        for (let i = 0; i < genderScoring.length; i++) {
            const [timeStr, points] = genderScoring[i];
            const thresholdSeconds = timeToSeconds(timeStr);
            if (runSeconds <= thresholdSeconds) {
                return points;
            }
        }
        return 0;
    } else {
        // For push-ups and crunches
        for (let i = 0; i < genderScoring.length; i++) {
            const [reps, points] = genderScoring[i];
            if (value >= reps) {
                return points;
            }
        }
        return 0;
    }
}

// Log activity
function logActivity(action, email = null, nickname = null, details = null, req = null) {
    const stmt = db.prepare(`INSERT INTO activity_log (action, email, nickname, details, ip_address, user_agent) 
                            VALUES (?, ?, ?, ?, ?, ?)`);
    stmt.run(action, email, nickname, details, 
             req ? req.ip : null, 
             req ? req.get('User-Agent') : null);
    stmt.finalize();
}

// Admin authentication middleware
function requireAdmin(req, res, next) {
    if (req.session.isAdmin) {
        next();
    } else {
        res.status(401).json({ error: 'Admin authentication required' });
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Simple admin credentials (in production, use proper hashing)
    if (username === 'admin' && password === 'fizo2025') {
        req.session.isAdmin = true;
        req.session.adminUsername = username;
        logActivity('admin_login', null, username, null, req);
        res.json({ success: true });
    } else {
        logActivity('admin_login_failed', null, username, null, req);
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
    const username = req.session.adminUsername;
    req.session.destroy();
    logActivity('admin_logout', null, username, null, req);
    res.json({ success: true });
});

// Submit fitness results
app.post('/api/submit-results', (req, res) => {
    const { email, nickname, age, gender, pushups, crunches, runTime } = req.body;
    
    // Validate input
    if (!email || !nickname || !age || !gender || pushups === undefined || crunches === undefined || !runTime) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Calculate points
    const pushupsPoints = calculatePoints('pushups', parseInt(pushups), parseInt(age), gender);
    const crunchesPoints = calculatePoints('crunches', parseInt(crunches), parseInt(age), gender);
    const runPoints = calculatePoints('run', runTime, parseInt(age), gender);
    const totalPoints = pushupsPoints + crunchesPoints + runPoints;
    
    // Check if passes test (60 points minimum per exercise)
    const passesTest = pushupsPoints >= 60 && crunchesPoints >= 60 && runPoints >= 60 ? 1 : 0;
    
    // Check if user exists (same email and nickname)
    db.get(`SELECT id FROM fitness_results WHERE email = ? AND nickname = ?`, 
           [email, nickname], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (row) {
            // Update existing record
            const stmt = db.prepare(`UPDATE fitness_results SET 
                age = ?, gender = ?, pushups = ?, crunches = ?, run_time = ?,
                pushups_points = ?, crunches_points = ?, run_points = ?, 
                total_points = ?, passes_test = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`);
            
            stmt.run(age, gender, pushups, crunches, runTime,
                    pushupsPoints, crunchesPoints, runPoints, totalPoints, passesTest, row.id);
            stmt.finalize();
            
            logActivity('result_updated', email, nickname, 
                       `Total: ${totalPoints} pts (${passesTest ? 'PASS' : 'FAIL'})`, req);
        } else {
            // Insert new record
            const stmt = db.prepare(`INSERT INTO fitness_results 
                (email, nickname, age, gender, pushups, crunches, run_time,
                 pushups_points, crunches_points, run_points, total_points, passes_test)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            
            stmt.run(email, nickname, age, gender, pushups, crunches, runTime,
                    pushupsPoints, crunchesPoints, runPoints, totalPoints, passesTest);
            stmt.finalize();
            
            logActivity('result_submitted', email, nickname, 
                       `Total: ${totalPoints} pts (${passesTest ? 'PASS' : 'FAIL'})`, req);
        }
        
        res.json({
            success: true,
            results: {
                pushupsPoints,
                crunchesPoints,
                runPoints,
                totalPoints,
                passesTest: passesTest === 1,
                breakdown: {
                    pushups: { value: pushups, points: pushupsPoints, passes: pushupsPoints >= 60 },
                    crunches: { value: crunches, points: crunchesPoints, passes: crunchesPoints >= 60 },
                    run: { value: runTime, points: runPoints, passes: runPoints >= 60 }
                }
            }
        });
    });
});

// Get all results (admin only)
app.get('/api/admin/results', requireAdmin, (req, res) => {
    db.all(`SELECT * FROM fitness_results ORDER BY created_at DESC`, (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Get activity log (admin only)
app.get('/api/admin/activity-log', requireAdmin, (req, res) => {
    db.all(`SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 100`, (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Get statistics (admin only)
app.get('/api/admin/stats', requireAdmin, (req, res) => {
    db.all(`SELECT 
                COUNT(*) as total_results,
                COUNT(CASE WHEN passes_test = 1 THEN 1 END) as passed_tests,
                AVG(total_points) as avg_total_points,
                AVG(pushups_points) as avg_pushups_points,
                AVG(crunches_points) as avg_crunches_points,
                AVG(run_points) as avg_run_points
            FROM fitness_results`, (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(row[0]);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎖️  FIZO202 Military Fitness Tracker running on port ${PORT}`);
    console.log(`🌐 Main page: http://localhost:${PORT}`);
    console.log(`👮 Admin panel: http://localhost:${PORT}/admin.html`);
    console.log(`🔑 Admin credentials: username=admin, password=fizo2025`);
    console.log(`📊 Database: fizo202.db`);
});