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

    // Demo data for simulation
    const demoTargets = {
        'charlidamelio': {
            displayName: 'Charli D\'Amelio',
            username: 'charlidamelio',
            userId: '5831967',
            avatar: 'https://i.pravatar.cc/150?img=1',
            followers: '151M',
            following: '1,234',
            likes: '11.2B',
            videos: '2,847',
            bio: 'dancer | actress | she/her 💕',
            verified: true
        },
        'khaby.lame': {
            displayName: 'Khabane Lame',
            username: 'khaby.lame',
            userId: '1284563',
            avatar: 'https://i.pravatar.cc/150?img=2',
            followers: '162M',
            following: '567',
            likes: '2.5B',
            videos: '1,892',
            bio: 'Simplicity is the key 🗝️',
            verified: true
        },
        'addisonre': {
            displayName: 'Addison Rae',
            username: 'addisonre',
            userId: '7456291',
            avatar: 'https://i.pravatar.cc/150?img=3',
            followers: '88M',
            following: '345',
            likes: '5.8B',
            videos: '1,567',
            bio: 'Gods plan 🙏',
            verified: true
        }
    };

    // Default demo data
    const getDefaultData = (username) => ({
        displayName: username.charAt(0).toUpperCase() + username.slice(1),
        username: username,
        userId: Math.floor(Math.random() * 9999999).toString(),
        avatar: `https://i.pravatar.cc/150?u=${username}`,
        followers: (Math.floor(Math.random() * 1000) + 1).toLocaleString(),
        following: Math.floor(Math.random() * 500).toString(),
        likes: (Math.floor(Math.random() * 50000)).toLocaleString(),
        videos: Math.floor(Math.random() * 200).toString(),
        bio: 'TikTok Creator | Content Maker 🎵',
        verified: Math.random() > 0.7
    });

    // Scan button click
    scanBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim().replace('@', '');
        
        if (!username) {
            showStatus('⚠', 'Please enter a username!', 'warning');
            return;
        }

        // Show loading
        profileCard.classList.remove('visible');
        reportBtn.disabled = true;
        loadingBar.classList.add('active');
        showStatus('🔍', `Scanning @${username}...`, 'scanning');

        // Simulate API call delay
        setTimeout(() => {
            loadingBar.classList.remove('active');
            
            // Get demo data
            let data = demoTargets[username.toLowerCase()];
            if (!data) {
                data = getDefaultData(username);
            }

            // Populate profile card
            document.getElementById('avatarImg').src = data.avatar;
            document.getElementById('displayName').textContent = data.displayName;
            document.getElementById('usernameDisplay').textContent = data.username;
            document.getElementById('userId').textContent = data.userId;
            document.getElementById('followers').textContent = data.followers;
            document.getElementById('following').textContent = data.following;
            document.getElementById('likes').textContent = data.likes;
            document.getElementById('videos').textContent = data.videos;
            document.getElementById('bio').textContent = data.bio;

            // Verified badge
            const verifiedBadge = document.getElementById('verifiedBadge');
            if (data.verified) {
                verifiedBadge.style.display = 'block';
            } else {
                verifiedBadge.style.display = 'none';
            }

            // Show profile card
            profileCard.classList.add('visible');
            reportBtn.disabled = false;
            
            showStatus('✅', `Target @${data.username} located successfully!`, 'success');
        }, 2000);
    });

    // Report button click
    reportBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim().replace('@', '');
        
        // Disable button during process
        reportBtn.disabled = true;
        reportBtn.querySelector('.report-text').textContent = 'REPORTING...';
        
        // Update status
        showStatus('🔄', 'Initiating report sequence...', 'reporting');
        statusDisplay.classList.add('reporting');

        // Simulate reporting process
        setTimeout(() => {
            showStatus('📡', 'Connecting to TikTok servers...', 'reporting');
        }, 1000);

        setTimeout(() => {
            showStatus('🔐', 'Bypassing security protocols...', 'reporting');
        }, 2000);

        setTimeout(() => {
            showStatus('📋', 'Submitting report data...', 'reporting');
        }, 3000);

        setTimeout(() => {
            showStatus('📨', 'Report received. Processing...', 'reporting');
        }, 4000);

        setTimeout(() => {
            // Success!
            statusDisplay.classList.remove('reporting');
            statusDisplay.classList.add('success');
            showStatus('✅', `SUCCESS! @${username} has been reported successfully!`, 'final-success');
            
            reportBtn.querySelector('.report-text').textContent = 'SUCCESS ✅';
            reportBtn.style.background = '#00ff41';
            reportBtn.style.color = '#000';
            reportBtn.style.boxShadow = '0 0 30px rgba(0, 255, 65, 0.7)';
            
            // Reset after 5 seconds
            setTimeout(() => {
                reportBtn.querySelector('.report-text').textContent = 'REPORT PROFILE';
                reportBtn.style.background = '#ff0040';
                reportBtn.style.color = '#fff';
                reportBtn.style.boxShadow = '0 0 20px rgba(255, 0, 64, 0.5)';
                statusDisplay.classList.remove('success');
                showStatus('⏳', 'Ready for next operation...', 'idle');
            }, 5000);
        }, 5000);
    });

    // Enter key support
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            scanBtn.click();
        }
    });

    // Status helper function
    function showStatus(icon, text, type) {
        statusIcon.textContent = icon;
        statusText.textContent = text;
        
        // Reset classes
        statusDisplay.classList.remove('reporting', 'success');
    }
});
