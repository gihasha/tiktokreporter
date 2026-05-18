// ===== MATRIX RAIN EFFECT =====
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
const charArray = chars.split('');
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = [];

for (let i = 0; i < columns; i++) {
    drops[i] = Math.floor(Math.random() * canvas.height / fontSize);
}

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#0F0';
    ctx.font = fontSize + 'px monospace';
    
    for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 35);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ===== MAIN FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('usernameInput');
    const scanBtn = document.getElementById('scanBtn');
    const profileCard = document.getElementById('profileCard');
    const reportBtn = document.getElementById('reportBtn');
    const statusDisplay = document.getElementById('statusDisplay');
    const statusIcon = document.getElementById('statusIcon');
    const statusText = document.getElementById('statusText');
    const loadingBar = document.getElementById('loadingBar');
    const errorMessage = document.getElementById('errorMessage');
    const verifiedBadge = document.getElementById('verifiedBadge');

    // Backend server URL (change this if needed)
    const BACKEND_URL = 'http://localhost:5000';
    
    // Track current username
    let currentUsername = '';

    // ===== SCAN BUTTON CLICK =====
    scanBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim().replace('@', '');
        
        if (!username) {
            showError('Please enter a TikTok username!');
            return;
        }

        // Reset states
        resetUI();
        currentUsername = username;
        
        // Show loading
        loadingBar.classList.add('active');
        showStatus('🔍', `Fetching @${username} from TikTok servers...`, 'scanning');
        scanBtn.disabled = true;
        scanBtn.querySelector('.btn-text').textContent = 'SCANNING...';

        try {
            // Call backend API
            const response = await fetch(`${BACKEND_URL}/api/tiktok-profile?username=${encodeURIComponent(username)}`);
            const data = await response.json();
            
            loadingBar.classList.remove('active');
            scanBtn.disabled = false;
            scanBtn.querySelector('.btn-text').textContent = 'SCAN';

            if (data.success) {
                // Populate profile card with REAL data
                populateProfileCard(data);
                profileCard.classList.add('visible');
                reportBtn.disabled = false;
                hideError();
                showStatus('✅', `Target @${data.username} located! Ready for action.`, 'success');
            } else {
                showError(data.error || `Profile '@${username}' not found on TikTok!`);
                showStatus('❌', 'Profile not found. Check username and try again.', 'error');
                profileCard.classList.remove('visible');
                reportBtn.disabled = true;
            }
        } catch (error) {
            loadingBar.classList.remove('active');
            scanBtn.disabled = false;
            scanBtn.querySelector('.btn-text').textContent = 'SCAN';
            
            console.error('Fetch error:', error);
            
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                showError('⚠ Backend server not running!<br><br>Please start backend.py first:<br><code>python backend.py</code>');
            } else {
                showError('Connection error: ' + error.message);
            }
            
            showStatus('❌', 'Connection failed. Is the backend running?', 'error');
            profileCard.classList.remove('visible');
            reportBtn.disabled = true;
        }
    });

    // ===== POPULATE PROFILE CARD =====
    function populateProfileCard(data) {
        // Avatar
        const avatarImg = document.getElementById('avatarImg');
        if (data.avatar) {
            avatarImg.src = data.avatar;
        } else {
            avatarImg.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22150%22%3E%3Crect fill=%22%23333%22 width=%22150%22 height=%22150%22/%3E%3Ctext fill=%22%2300ff41%22 x=%2275%22 y=%2290%22 text-anchor=%22middle%22 font-size=%2250%22%3E?%3C/text%3E%3C/svg%3E';
        }

        // Name & Username
        document.getElementById('displayName').textContent = data.displayName || data.username;
        document.getElementById('usernameDisplay').textContent = data.username;
        document.getElementById('userId').textContent = data.userId || '---';

        // Stats with formatting
        document.getElementById('followers').textContent = formatNumber(data.followers || 0);
        document.getElementById('following').textContent = formatNumber(data.following || 0);
        document.getElementById('likes').textContent = formatNumber(data.likes || 0);
        document.getElementById('videos').textContent = formatNumber(data.videos || 0);

        // Bio
        document.getElementById('bio').textContent = data.bio || 'No bio available';

        // Verified Badge
        if (data.verified) {
            verifiedBadge.classList.add('visible');
        } else {
            verifiedBadge.classList.remove('visible');
        }
    }

    // ===== REPORT BUTTON CLICK =====
    reportBtn.addEventListener('click', () => {
        if (!currentUsername) return;

        // Disable button during process
        reportBtn.disabled = true;
        reportBtn.querySelector('.report-text').textContent = 'REPORTING...';
        scanBtn.disabled = true;
        
        // Update status
        showStatus('🔄', 'Initiating report sequence...', 'reporting');
        statusDisplay.classList.add('reporting');

        // Simulate reporting steps
        const steps = [
            { delay: 800, icon: '📡', text: 'Connecting to TikTok moderation servers...' },
            { delay: 1600, icon: '🔐', text: 'Establishing secure connection...' },
            { delay: 2400, icon: '📋', text: `Compiling report data for @${currentUsername}...` },
            { delay: 3200, icon: '📨', text: 'Submitting violation report...' },
            { delay: 4000, icon: '⏳', text: 'Awaiting server confirmation...' },
        ];

        steps.forEach(step => {
            setTimeout(() => {
                showStatus(step.icon, step.text, 'reporting');
            }, step.delay);
        });

        // Final success
        setTimeout(() => {
            statusDisplay.classList.remove('reporting');
            statusDisplay.classList.add('success');
            showStatus('✅', `SUCCESS! @${currentUsername} has been reported successfully!`, 'final-success');
            
            reportBtn.querySelector('.report-text').textContent = 'SUCCESS ✅';
            reportBtn.classList.add('success-state');
            
            // Reset after 5 seconds
            setTimeout(() => {
                resetReportButton();
                statusDisplay.classList.remove('success');
                showStatus('⏳', 'Ready for next operation...', 'idle');
            }, 5000);
        }, 5000);
    });

    // ===== RESET REPORT BUTTON =====
    function resetReportButton() {
        reportBtn.querySelector('.report-text').textContent = 'REPORT PROFILE';
        reportBtn.classList.remove('success-state');
        reportBtn.disabled = false;
        scanBtn.disabled = false;
    }

    // ===== RESET UI =====
    function resetUI() {
        profileCard.classList.remove('visible');
        reportBtn.disabled = true;
        resetReportButton();
        hideError();
        statusDisplay.classList.remove('reporting', 'success', 'error');
        verifiedBadge.classList.remove('visible');
    }

    // ===== ENTER KEY SUPPORT =====
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            scanBtn.click();
        }
    });

    // ===== STATUS HELPER =====
    function showStatus(icon, text, type) {
        statusIcon.textContent = icon;
        statusText.textContent = text;
        
        statusDisplay.classList.remove('reporting', 'success', 'error');
        if (type === 'error') statusDisplay.classList.add('error');
    }

    // ===== ERROR HELPER =====
    function showError(message) {
        errorMessage.innerHTML = message;
        errorMessage.classList.add('visible');
    }

    function hideError() {
        errorMessage.classList.remove('visible');
        errorMessage.innerHTML = '';
    }

    // ===== NUMBER FORMATTER =====
    function formatNumber(num) {
        if (!num) return '0';
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
});
