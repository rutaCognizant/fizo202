// FIZO202 Military Fitness Tracker - Frontend JavaScript

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