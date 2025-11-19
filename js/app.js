// Storage Keys
const STORAGE_KEYS = {
    BMI: 'hl_fitness_bmi_history',
    ACTIVITY: 'hl_fitness_activities',
    HEART_RATE: 'hl_fitness_heart_rates',
    WEIGHT: 'hl_fitness_current_weight'
};

// MET values for activities
const MET_VALUES = {
    walking: 3.5,
    running: 7.0
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set today's date as default for date inputs
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('activityDate').value = today;
    document.getElementById('heartRateDate').value = today;

    // Load current weight from localStorage if available
    const lastBMI = getLastBMIRecord();
    if (lastBMI) {
        // Store weight for calorie calculation
        localStorage.setItem(STORAGE_KEYS.WEIGHT, lastBMI.weight);
    }

    // Attach event listeners
    document.getElementById('bmiForm').addEventListener('submit', handleBMISubmit);
    document.getElementById('activityForm').addEventListener('submit', handleActivitySubmit);
    document.getElementById('heartRateForm').addEventListener('submit', handleHeartRateSubmit);

    // Render initial data
    renderDashboard();
    renderBMIHistory();
    renderActivityList();
    renderHeartRateInfo();
}

// ==================== BMI Functions ====================

function handleBMISubmit(e) {
    e.preventDefault();
    
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const gender = document.getElementById('gender').value;
    const age = parseInt(document.getElementById('age').value);

    if (!validateBMIInputs(height, weight, age)) {
        return;
    }

    const bmi = calculateBMI(height, weight);
    const category = getBMICategory(bmi);
    const suggestion = getBMISuggestion(category);

    // Display result
    renderBMIResult(bmi, category, suggestion);

    // Save to history
    saveBMIRecord(height, weight, bmi, category);

    // Update dashboard
    renderDashboard();

    // Store weight for calorie calculation
    localStorage.setItem(STORAGE_KEYS.WEIGHT, weight);
}

function calculateBMI(height, weight) {
    // BMI = weight (kg) / (height (m))^2
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return Math.round(bmi * 10) / 10; // Round to 1 decimal place
}

function getBMICategory(bmi) {
    if (bmi < 18.5) {
        return { 
            name: 'Thiếu cân', 
            color: '#3B82F6',
            bgGradient: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
            borderColor: '#3B82F6',
            emoji: '💙'
        };
    } else if (bmi < 23) {
        return { 
            name: 'Bình thường', 
            color: '#10B981',
            bgGradient: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
            borderColor: '#10B981',
            emoji: '💚'
        };
    } else if (bmi < 25) {
        return { 
            name: 'Thừa cân', 
            color: '#F59E0B',
            bgGradient: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            borderColor: '#F59E0B',
            emoji: '💛'
        };
    } else {
        return { 
            name: 'Béo phì', 
            color: '#EF4444',
            bgGradient: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
            borderColor: '#EF4444',
            emoji: '❤️'
        };
    }
}

function getBMISuggestion(category) {
    const suggestions = {
        'Thiếu cân': 'Bạn nên tăng cường dinh dưỡng và tập luyện để tăng cân một cách lành mạnh.',
        'Bình thường': 'Chúc mừng! Bạn đang duy trì cân nặng hợp lý. Hãy tiếp tục chế độ ăn uống và tập luyện hiện tại.',
        'Thừa cân': 'Bạn nên điều chỉnh chế độ ăn uống và tăng cường vận động để giảm cân.',
        'Béo phì': 'Bạn nên tham khảo ý kiến bác sĩ và có kế hoạch giảm cân khoa học, kết hợp ăn uống và tập luyện.'
    };
    return suggestions[category.name] || '';
}

function validateBMIInputs(height, weight, age) {
    if (height < 50 || height > 250) {
        alert('Chiều cao phải từ 50 đến 250 cm');
        return false;
    }
    if (weight < 20 || weight > 300) {
        alert('Cân nặng phải từ 20 đến 300 kg');
        return false;
    }
    if (age < 1 || age > 120) {
        alert('Tuổi phải từ 1 đến 120');
        return false;
    }
    return true;
}

function renderBMIResult(bmi, category, suggestion) {
    const resultDiv = document.getElementById('bmiResult');
    const categoryEl = document.getElementById('bmiCategory');
    
    document.getElementById('bmiValue').textContent = bmi;
    categoryEl.textContent = `${category.emoji} ${category.name}`;
    categoryEl.style.color = category.color;
    categoryEl.style.background = category.bgGradient;
    categoryEl.style.border = `2px solid ${category.borderColor}`;
    categoryEl.style.padding = '10px 18px';
    categoryEl.style.borderRadius = '10px';
    categoryEl.style.display = 'inline-block';
    categoryEl.style.boxShadow = `0 4px 15px ${category.color}40`;
    
    document.getElementById('bmiSuggestion').textContent = suggestion;
    
    // Update result box styling
    resultDiv.style.background = category.bgGradient;
    resultDiv.style.borderLeftColor = category.borderColor;
    resultDiv.style.boxShadow = `0 8px 25px ${category.color}30`;
    
    resultDiv.style.display = 'block';
    
    // Add animation
    resultDiv.style.animation = 'none';
    setTimeout(() => {
        resultDiv.style.animation = 'slideIn 0.5s ease-out';
    }, 10);
}

function saveBMIRecord(height, weight, bmi, category) {
    const records = getBMIRecords();
    const newRecord = {
        date: new Date().toISOString(),
        height: height,
        weight: weight,
        bmi: bmi,
        category: category.name
    };
    records.push(newRecord);
    localStorage.setItem(STORAGE_KEYS.BMI, JSON.stringify(records));
    renderBMIHistory();
}

function getBMIRecords() {
    const data = localStorage.getItem(STORAGE_KEYS.BMI);
    return data ? JSON.parse(data) : [];
}

function getLastBMIRecord() {
    const records = getBMIRecords();
    return records.length > 0 ? records[records.length - 1] : null;
}

function renderBMIHistory() {
    const records = getBMIRecords();
    const tbody = document.getElementById('bmiHistoryBody');
    
    if (records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #94A3B8;">Chưa có lịch sử BMI</td></tr>';
        return;
    }

    // Sort by date (newest first)
    records.sort((a, b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = records.map(record => {
        const date = new Date(record.date);
        const dateStr = date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        return `
            <tr>
                <td>${dateStr}</td>
                <td>${record.height}</td>
                <td>${record.weight}</td>
                <td><strong>${record.bmi}</strong></td>
                <td>${record.category}</td>
            </tr>
        `;
    }).join('');
}

// ==================== Activity Functions ====================

function handleActivitySubmit(e) {
    e.preventDefault();
    
    const date = document.getElementById('activityDate').value;
    const type = document.getElementById('activityType').value;
    const distance = parseFloat(document.getElementById('distance').value);
    const duration = parseFloat(document.getElementById('duration').value);

    if (!validateActivityInputs(distance, duration)) {
        return;
    }

    const weight = parseFloat(localStorage.getItem(STORAGE_KEYS.WEIGHT)) || 70; // Default 70kg if no weight recorded
    const calories = calculateCalories(type, weight, duration);

    addActivity(date, type, distance, duration, calories);
    
    // Reset form
    document.getElementById('activityForm').reset();
    document.getElementById('activityDate').value = new Date().toISOString().split('T')[0];
    
    // Update UI
    renderActivityList();
    renderDashboard();
}

function calculateCalories(activityType, weight, durationMinutes) {
    const met = MET_VALUES[activityType];
    const durationHours = durationMinutes / 60;
    const calories = met * weight * durationHours;
    return Math.round(calories);
}

function validateActivityInputs(distance, duration) {
    if (distance <= 0) {
        alert('Quãng đường phải lớn hơn 0');
        return false;
    }
    if (duration <= 0) {
        alert('Thời gian phải lớn hơn 0');
        return false;
    }
    return true;
}

function addActivity(date, type, distance, duration, calories) {
    const activities = getActivities();
    const newActivity = {
        date: date,
        type: type,
        distance: distance,
        duration: duration,
        calories: calories,
        timestamp: new Date().toISOString()
    };
    activities.push(newActivity);
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(activities));
}

function getActivities() {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
    return data ? JSON.parse(data) : [];
}

function renderActivityList() {
    const activities = getActivities();
    const tbody = document.getElementById('activityBody');
    
    if (activities.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #94A3B8;">Chưa có hoạt động nào</td></tr>';
        return;
    }

    // Sort by date (newest first)
    activities.sort((a, b) => {
        const dateCompare = new Date(b.date) - new Date(a.date);
        if (dateCompare !== 0) return dateCompare;
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    tbody.innerHTML = activities.map(activity => {
        const date = new Date(activity.date);
        const dateStr = date.toLocaleDateString('vi-VN');
        const typeName = activity.type === 'walking' ? 'Đi bộ' : 'Chạy';
        return `
            <tr>
                <td>${dateStr}</td>
                <td>${typeName}</td>
                <td>${activity.distance}</td>
                <td>${activity.duration}</td>
                <td><strong>${activity.calories}</strong></td>
            </tr>
        `;
    }).join('');
}

function getTodayActivities() {
    const activities = getActivities();
    const today = new Date().toISOString().split('T')[0];
    return activities.filter(activity => activity.date === today);
}

function calculateTodayStats() {
    const todayActivities = getTodayActivities();
    let totalKm = 0;
    let totalCalories = 0;

    todayActivities.forEach(activity => {
        totalKm += activity.distance;
        totalCalories += activity.calories;
    });

    return {
        km: Math.round(totalKm * 10) / 10,
        calories: totalCalories
    };
}

// ==================== Heart Rate Functions ====================

function handleHeartRateSubmit(e) {
    e.preventDefault();
    
    const date = document.getElementById('heartRateDate').value;
    const heartRate = parseInt(document.getElementById('heartRate').value);

    if (!validateHeartRate(heartRate)) {
        return;
    }

    addHeartRate(date, heartRate);
    
    // Reset form
    document.getElementById('heartRateForm').reset();
    document.getElementById('heartRateDate').value = new Date().toISOString().split('T')[0];
    
    // Update UI
    renderHeartRateInfo();
    renderDashboard();
}

function validateHeartRate(heartRate) {
    if (heartRate < 30 || heartRate > 220) {
        alert('Nhịp tim phải từ 30 đến 220 bpm');
        return false;
    }
    return true;
}

function addHeartRate(date, heartRate) {
    const heartRates = getHeartRates();
    const newRecord = {
        date: date,
        heartRate: heartRate,
        timestamp: new Date().toISOString()
    };
    heartRates.push(newRecord);
    localStorage.setItem(STORAGE_KEYS.HEART_RATE, JSON.stringify(heartRates));
}

function getHeartRates() {
    const data = localStorage.getItem(STORAGE_KEYS.HEART_RATE);
    return data ? JSON.parse(data) : [];
}

function getLatestHeartRate() {
    const heartRates = getHeartRates();
    if (heartRates.length === 0) return null;
    
    // Sort by timestamp (newest first)
    heartRates.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return heartRates[0];
}

function getHeartRateComment(heartRate) {
    if (heartRate < 60) {
        return 'Nhịp chậm (có thể do thể trạng, cần theo dõi)';
    } else if (heartRate <= 100) {
        return 'Nhịp tim bình thường';
    } else {
        return 'Nhịp nhanh, nên chú ý';
    }
}

function renderHeartRateInfo() {
    const latest = getLatestHeartRate();
    const infoDiv = document.getElementById('heartRateInfo');
    
    if (!latest) {
        infoDiv.style.display = 'none';
        return;
    }

    const comment = getHeartRateComment(latest.heartRate);
    document.getElementById('latestHeartRateValue').textContent = `${latest.heartRate} bpm`;
    document.getElementById('heartRateComment').textContent = comment;
    infoDiv.style.display = 'block';
}

// ==================== Dashboard Functions ====================

function renderDashboard() {
    // Update BMI
    const lastBMI = getLastBMIRecord();
    const bmiElement = document.getElementById('currentBMI');
    if (lastBMI) {
        bmiElement.textContent = lastBMI.bmi;
    } else {
        bmiElement.textContent = '--';
    }

    // Update today's stats
    const todayStats = calculateTodayStats();
    document.getElementById('todayKm').textContent = `${todayStats.km} km`;
    document.getElementById('todayCalories').textContent = `${todayStats.calories} cal`;

    // Update heart rate
    const latestHeartRate = getLatestHeartRate();
    const heartRateElement = document.getElementById('latestHeartRate');
    if (latestHeartRate) {
        heartRateElement.textContent = `${latestHeartRate.heartRate} bpm`;
    } else {
        heartRateElement.textContent = '-- bpm';
    }
}

