// FIZO202 Fitness Tracker - Frontend JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('fitnessForm');
    const resultsSection = document.getElementById('resultsSection');
    const loadingSpinner = document.getElementById('loadingSpinner');

    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading spinner
        loadingSpinner.style.display = 'block';
        resultsSection.style.display = 'none';
        
        // Get form data
        const formData = new FormData(form);
        const runMinutes = parseInt(formData.get('runMinutes'));
        const runSeconds = parseInt(formData.get('runSeconds'));
        const runTime = `${runMinutes.toString().padStart(2, '0')}:${runSeconds.toString().padStart(2, '0')}`;
        
        const data = {
            email: formData.get('email'),
            nickname: formData.get('nickname'),
            age: parseInt(formData.get('age')),
            gender: formData.get('gender'),
            pushups: parseInt(formData.get('pushups')),
            crunches: parseInt(formData.get('crunches')),
            runTime: runTime
        };

        try {
            const response = await fetch('/api/submit-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            // Hide loading spinner
            loadingSpinner.style.display = 'none';

            if (result.success) {
                displayResults(result.results, data);
                
                // Scroll to results
                resultsSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            } else {
                alert('Error: ' + (result.error || 'Failed to submit results'));
            }
        } catch (error) {
            loadingSpinner.style.display = 'none';
            console.error('Error:', error);
            alert('Network error. Please try again.');
        }
    });

    // Display results function
    function displayResults(results, originalData) {
        // Update individual exercise results
        updateExerciseResult('pushups', results.breakdown.pushups, originalData.pushups + ' reps');
        updateExerciseResult('crunches', results.breakdown.crunches, originalData.crunches + ' reps');
        updateExerciseResult('run', results.breakdown.run, originalData.runTime);

        // Update total score
        document.getElementById('totalPoints').textContent = results.totalPoints;
        
        // Update overall status
        const overallStatus = document.getElementById('overallStatus');
        overallStatus.textContent = results.passesTest ? '✅ PASSED' : '❌ FAILED';
        overallStatus.className = 'overall-status ' + (results.passesTest ? 'pass' : 'fail');

        // Show results section
        resultsSection.style.display = 'block';
    }

    // Update individual exercise result
    function updateExerciseResult(exercise, data, displayValue) {
        const card = document.getElementById(exercise + 'Result');
        const valueElement = document.getElementById(exercise + (exercise === 'run' ? 'Time' : 'Reps'));
        const pointsElement = document.getElementById(exercise + 'Points');
        const statusElement = document.getElementById(exercise + 'Status');

        // Update values
        if (exercise === 'run') {
            valueElement.textContent = displayValue;
        } else {
            valueElement.textContent = data.value;
        }
        pointsElement.textContent = data.points;
        
        // Update status
        statusElement.textContent = data.passes ? '✅ PASS' : '❌ FAIL';
        statusElement.className = 'result-status ' + (data.passes ? 'pass' : 'fail');
        
        // Update card styling
        card.className = 'result-card ' + (data.passes ? 'pass' : 'fail');
    }

    // Input validation and formatting
    document.getElementById('runMinutes').addEventListener('input', function(e) {
        let value = parseInt(e.target.value);
        if (value < 10) e.target.value = 10;
        if (value > 40) e.target.value = 40;
    });

    document.getElementById('runSeconds').addEventListener('input', function(e) {
        let value = parseInt(e.target.value);
        if (value < 0) e.target.value = 0;
        if (value > 59) e.target.value = 59;
    });

    document.getElementById('age').addEventListener('input', function(e) {
        let value = parseInt(e.target.value);
        if (value < 18) e.target.value = 18;
        if (value > 65) e.target.value = 65;
    });

    document.getElementById('pushups').addEventListener('input', function(e) {
        let value = parseInt(e.target.value);
        if (value < 0) e.target.value = 0;
        if (value > 100) e.target.value = 100;
    });

    document.getElementById('crunches').addEventListener('input', function(e) {
        let value = parseInt(e.target.value);
        if (value < 0) e.target.value = 0;
        if (value > 100) e.target.value = 100;
    });

    // Auto-fill demo data for testing (remove in production)
    if (window.location.hostname === 'localhost') {
        // Add demo button for testing
        const demoButton = document.createElement('button');
        demoButton.type = 'button';
        demoButton.textContent = '🧪 Fill Demo Data';
        demoButton.className = 'secondary-btn';
        demoButton.style.marginBottom = '20px';
        demoButton.onclick = fillDemoData;
        
        const submitSection = document.querySelector('.submit-section');
        submitSection.insertBefore(demoButton, submitSection.firstChild);
    }

    function fillDemoData() {
        document.getElementById('email').value = 'soldier@military.com';
        document.getElementById('nickname').value = 'Warrior';
        document.getElementById('age').value = '25';
        document.getElementById('gender').value = 'M';
        document.getElementById('pushups').value = '65';
        document.getElementById('crunches').value = '70';
        document.getElementById('runMinutes').value = '15';
        document.getElementById('runSeconds').value = '30';
    }
});

// Submit another result function
function submitAnother() {
    document.getElementById('fitnessForm').reset();
    document.getElementById('resultsSection').style.display = 'none';
    
    // Scroll back to form
    document.querySelector('.form-container').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Scoring Tables Functionality
function openScoringTables() {
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    
    if (!age || !gender) {
        alert('Please enter your age and select gender first to see personalized targets!');
        return;
    }
    
    // Create scoring tables window content
    const tablesHTML = generateScoringTablesHTML(parseInt(age), gender);
    
    // Open in new window
    const newWindow = window.open('', 'ScoringTables', 'width=900,height=700,scrollbars=yes');
    newWindow.document.write(tablesHTML);
    newWindow.document.close();
}

function generateScoringTablesHTML(age, gender) {
    // Get personalized targets for 60 and 100 points
    const targets = getPersonalizedTargets(age, gender);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>FIZO202 Scoring Tables</title>
    <style>
        body { font-family: Inter, sans-serif; margin: 20px; background: #f0f8f0; }
        .header { text-align: center; color: #2d5016; margin-bottom: 30px; }
        .targets { background: #fff; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 2px solid #4a7c59; }
        .targets h3 { color: #2d5016; margin-top: 0; }
        .target-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 8px; }
        .exercise { font-weight: 600; color: #2d5016; }
        .target-60 { color: #ff6b35; font-weight: 600; }
        .target-100 { color: #4a7c59; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; }
        th, td { padding: 12px; text-align: center; border: 1px solid #ddd; }
        th { background: #4a7c59; color: white; font-weight: 600; }
        .age-group { background: #f0f8f0; font-weight: 600; color: #2d5016; }
        .highlight-60 { background: #fff3cd; }
        .highlight-100 { background: #d4edda; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🪖 FIZO202 Scoring Tables</h1>
        <p>Age: ${age} | Gender: ${gender === 'M' ? 'Male' : 'Female'}</p>
    </div>
    
    <div class="targets">
        <h3>🎯 Your Personal Targets</h3>
        <div class="target-row">
            <span class="exercise">💪 Push-ups</span>
            <span class="target-60">60 pts: ${targets.pushups.min60}</span>
            <span class="target-100">100 pts: ${targets.pushups.max100}</span>
        </div>
        <div class="target-row">
            <span class="exercise">🤸‍♂️ Crunches (Abs)</span>
            <span class="target-60">60 pts: ${targets.crunches.min60}</span>
            <span class="target-100">100 pts: ${targets.crunches.max100}</span>
        </div>
        <div class="target-row">
            <span class="exercise">🏃‍♂️ 3000m Run</span>
            <span class="target-60">60 pts: ${targets.run.min60}</span>
            <span class="target-100">100 pts: ${targets.run.max100}</span>
        </div>
    </div>
    
    <h2>📊 Complete Scoring Tables</h2>
    ${generateFullScoringTables(gender)}
</body>
</html>`;
}

function getPersonalizedTargets(age, gender) {
    // This uses the same scoring logic from the server
    // Simplified version for display - you might want to fetch this from server
    const ageGroup = getAgeGroup(age);
    
    // Sample targets based on age groups (you can expand this with full data)
    const targets = {
        pushups: { min60: '25-35', max100: '45-55' },
        crunches: { min60: '35-45', max100: '55-65' }, 
        run: { min60: '16:30-18:00', max100: '13:30-15:00' }
    };
    
    // Adjust based on age and gender (simplified logic)
    if (gender === 'F') {
        targets.pushups = { min60: '15-25', max100: '35-45' };
        targets.run = { min60: '18:00-20:00', max100: '15:00-17:00' };
    }
    
    return targets;
}

function getAgeGroup(age) {
    if (age <= 25) return '18-25';
    if (age <= 30) return '26-30';
    if (age <= 35) return '31-35';
    if (age <= 40) return '36-40';
    if (age <= 45) return '41-45';
    if (age <= 50) return '46-50';
    if (age <= 55) return '51-55';
    if (age <= 60) return '56-60';
    return '60+';
}

function generateFullScoringTables(gender) {
    // This would contain the full scoring tables
    // For now, return a simplified version
    return `
    <table>
        <tr><th colspan="4">Push-ups Scoring (${gender === 'M' ? 'Male' : 'Female'})</th></tr>
        <tr><th>Age Group</th><th>60 Points</th><th>80 Points</th><th>100 Points</th></tr>
        <tr class="age-group"><td>18-25</td><td class="highlight-60">${gender === 'M' ? '35' : '25'}</td><td>${gender === 'M' ? '42' : '32'}</td><td class="highlight-100">${gender === 'M' ? '50' : '40'}</td></tr>
        <tr class="age-group"><td>26-30</td><td class="highlight-60">${gender === 'M' ? '32' : '22'}</td><td>${gender === 'M' ? '39' : '29'}</td><td class="highlight-100">${gender === 'M' ? '47' : '37'}</td></tr>
        <tr class="age-group"><td>31-35</td><td class="highlight-60">${gender === 'M' ? '30' : '20'}</td><td>${gender === 'M' ? '37' : '27'}</td><td class="highlight-100">${gender === 'M' ? '45' : '35'}</td></tr>
    </table>
    
    <table>
        <tr><th colspan="4">Crunches (Abs) Scoring (${gender === 'M' ? 'Male' : 'Female'})</th></tr>
        <tr><th>Age Group</th><th>60 Points</th><th>80 Points</th><th>100 Points</th></tr>
        <tr class="age-group"><td>18-25</td><td class="highlight-60">42</td><td>52</td><td class="highlight-100">62</td></tr>
        <tr class="age-group"><td>26-30</td><td class="highlight-60">40</td><td>50</td><td class="highlight-100">60</td></tr>
        <tr class="age-group"><td>31-35</td><td class="highlight-60">38</td><td>48</td><td class="highlight-100">58</td></tr>
    </table>
    
    <table>
        <tr><th colspan="4">3000m Run Scoring (${gender === 'M' ? 'Male' : 'Female'})</th></tr>
        <tr><th>Age Group</th><th>60 Points</th><th>80 Points</th><th>100 Points</th></tr>
        <tr class="age-group"><td>18-25</td><td class="highlight-60">${gender === 'M' ? '16:30' : '19:00'}</td><td>${gender === 'M' ? '15:00' : '17:30'}</td><td class="highlight-100">${gender === 'M' ? '13:30' : '16:00'}</td></tr>
        <tr class="age-group"><td>26-30</td><td class="highlight-60">${gender === 'M' ? '17:00' : '19:30'}</td><td>${gender === 'M' ? '15:30' : '18:00'}</td><td class="highlight-100">${gender === 'M' ? '14:00' : '16:30'}</td></tr>
        <tr class="age-group"><td>31-35</td><td class="highlight-60">${gender === 'M' ? '17:30' : '20:00'}</td><td>${gender === 'M' ? '16:00' : '18:30'}</td><td class="highlight-100">${gender === 'M' ? '14:30' : '17:00'}</td></tr>
    </table>`;
}

// Service Worker registration for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}