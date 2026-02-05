// =====================================================================
// WatchTheFall v4 - Donate Page Interactive Features
// Handles amount selection, slider, impact messages, progress bar, modal
// =====================================================================

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        targetGoal: 150,
        currentGoal: 0, // This will be loaded from backend/JSON in future
        impactMessages: {
            5: "Keeps the site live for 1 day",
            10: "Powers our servers for 2 days",
            15: "Covers hosting for 3 days",
            20: "Covers a week of hosting",
            30: "Supports half a month of hosting",
            50: "Supports development for a week",
            75: "Covers full monthly hosting",
            100: "Enables new features and improvements"
        },
        thankYouMessages: [
            "Your support keeps WatchTheFall alive and independent.",
            "You're helping us document the fall without compromise.",
            "Thank you for believing in independent media.",
            "Your contribution keeps our servers running and our content free.",
            "Every pound helps us stay independent and ad-free."
        ]
    };
    
    // DOM Elements
    const amountButtons = document.querySelectorAll('.amount-btn');
    const customSlider = document.getElementById('custom-amount');
    const sliderValue = document.getElementById('slider-value');
    const impactText = document.getElementById('impact-text');
    const donateBtn = document.getElementById('donate-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressPercentage = document.getElementById('progress-percentage');
    const currentGoalEl = document.getElementById('current-goal');
    const targetGoalEl = document.getElementById('target-goal');
    const goalStatus = document.getElementById('goal-status');
    const infoToggle = document.getElementById('info-toggle');
    const infoContent = document.getElementById('info-content');
    const thankYouModal = document.getElementById('thank-you-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalClose = thankYouModal.querySelector('.modal-close');
    const modalBackdrop = thankYouModal.querySelector('.modal-backdrop');
    
    let selectedAmount = 15; // Default
    
    // Initialize
    function init() {
        updateProgressBar();
        updateImpactMessage(selectedAmount);
        attachEventListeners();
        addParticleEffect();
        rotateGoalStatus();
    }
    
    // Update Progress Bar
    function updateProgressBar() {
        const percentage = Math.min((CONFIG.currentGoal / CONFIG.targetGoal) * 100, 100);
        progressBar.style.width = `${percentage}%`;
        progressPercentage.textContent = `${Math.round(percentage)}%`;
        currentGoalEl.textContent = `£${CONFIG.currentGoal}`;
        targetGoalEl.textContent = `£${CONFIG.targetGoal}`;
        
        // Update status message based on progress
        if (percentage >= 100) {
            goalStatus.textContent = "🎉 Goal reached! Thank you for your support!";
            goalStatus.style.color = "var(--color-gold)";
        } else if (percentage >= 75) {
            goalStatus.textContent = `Almost there! Only £${CONFIG.targetGoal - CONFIG.currentGoal} left to reach our goal`;
        } else {
            goalStatus.textContent = `Help us reach this month's hosting costs`;
        }
    }
    
    // Rotate goal status messages
    function rotateGoalStatus() {
        const messages = [
            "Every contribution makes a difference",
            "Support independent media documentation",
            "Help us stay ad-free and independent",
            "Your support keeps the network alive"
        ];
        let index = 0;
        
        setInterval(() => {
            if (CONFIG.currentGoal < CONFIG.targetGoal) {
                index = (index + 1) % messages.length;
                goalStatus.style.opacity = '0';
                setTimeout(() => {
                    goalStatus.textContent = messages[index];
                    goalStatus.style.opacity = '1';
                }, 300);
            }
        }, 8000);
    }
    
    // Update Impact Message
    function updateImpactMessage(amount) {
        // Find closest matching impact message
        const amounts = Object.keys(CONFIG.impactMessages).map(Number).sort((a, b) => a - b);
        let closestAmount = amounts[0];
        
        for (let i = 0; i < amounts.length; i++) {
            if (amount >= amounts[i]) {
                closestAmount = amounts[i];
            }
        }
        
        const message = CONFIG.impactMessages[closestAmount] || 
                       `Your £${amount} helps cover hosting costs and keeps the network running`;
        
        impactText.textContent = `Your £${amount} ${message.toLowerCase()}`;
        
        // Animate impact message
        const impactMessage = document.querySelector('.impact-message');
        impactMessage.style.animation = 'none';
        setTimeout(() => {
            impactMessage.style.animation = 'fadeIn 0.5s ease';
        }, 10);
    }
    
    // Handle Amount Button Click
    function handleAmountClick(event) {
        const btn = event.currentTarget;
        const amount = parseInt(btn.dataset.amount);
        
        // Remove active from all buttons
        amountButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update slider and selected amount
        selectedAmount = amount;
        customSlider.value = amount;
        sliderValue.textContent = amount;
        
        // Update impact message
        updateImpactMessage(amount);
    }
    
    // Handle Slider Change
    function handleSliderChange(event) {
        const amount = parseInt(event.target.value);
        selectedAmount = amount;
        sliderValue.textContent = amount;
        
        // Remove active from preset buttons
        amountButtons.forEach(b => b.classList.remove('active'));
        
        // Update impact message
        updateImpactMessage(amount);
    }
    
    // Handle Donate Button Click
    function handleDonateClick() {
        // Show thank you modal
        showThankYouModal(selectedAmount);
        
        // In production, redirect to PayPal with amount
        // window.location.href = `https://www.paypal.com/donate?business=YOUR_PAYPAL&amount=${selectedAmount}&currency_code=GBP`;
        
        console.log(`Donation initiated: £${selectedAmount}`);
    }
    
    // Show Thank You Modal
    function showThankYouModal(amount) {
        const title = document.getElementById('thank-you-title');
        const message = document.getElementById('thank-you-message');
        
        // Randomize thank you message
        const randomMessage = CONFIG.thankYouMessages[
            Math.floor(Math.random() * CONFIG.thankYouMessages.length)
        ];
        
        title.textContent = `Thank You for £${amount}!`;
        message.textContent = randomMessage;
        
        // Show modal
        thankYouModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }
    
    // Close Modal
    function closeModal() {
        thankYouModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }
    
    // Toggle Info Panel
    function toggleInfoPanel() {
        infoToggle.classList.toggle('active');
        infoContent.classList.toggle('collapsed');
        infoContent.classList.toggle('expanded');
    }
    
    // Add Particle Effect on Mouse Move
    function addParticleEffect() {
        const canvas = document.getElementById('network-canvas');
        if (!canvas) return;
        
        document.addEventListener('mousemove', (e) => {
            // Only add particles in donate section
            const donateSection = document.querySelector('.donation-section');
            if (!donateSection) return;
            
            const rect = donateSection.getBoundingClientRect();
            if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
                // Small chance to create a particle on mouse move
                if (Math.random() > 0.95) {
                    createGoldParticle(e.clientX, e.clientY);
                }
            }
        });
    }
    
    // Create Gold Particle
    function createGoldParticle(x, y) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.borderRadius = '50%';
        particle.style.backgroundColor = 'var(--color-gold)';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        particle.style.boxShadow = '0 0 10px rgba(212, 175, 55, 0.8)';
        particle.style.animation = 'particleFade 2s ease-out forwards';
        
        document.body.appendChild(particle);
        
        // Remove after animation
        setTimeout(() => {
            particle.remove();
        }, 2000);
    }
    
    // Add particle animation to CSS (injected)
    const style = document.createElement('style');
    style.textContent = `
        @keyframes particleFade {
            0% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            100% {
                opacity: 0;
                transform: translateY(-100px) scale(0);
            }
        }
        
        .goal-status {
            transition: opacity 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Attach Event Listeners
    function attachEventListeners() {
        amountButtons.forEach(btn => {
            btn.addEventListener('click', handleAmountClick);
        });
        
        customSlider.addEventListener('input', handleSliderChange);
        donateBtn.addEventListener('click', handleDonateClick);
        infoToggle.addEventListener('click', toggleInfoPanel);
        
        // Modal close handlers
        closeModalBtn.addEventListener('click', closeModal);
        modalClose.addEventListener('click', closeModal);
        modalBackdrop.addEventListener('click', closeModal);
        
        // Keyboard accessibility for modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && thankYouModal.getAttribute('aria-hidden') === 'false') {
                closeModal();
            }
        });
    }
    
    // Load goal data from backend (placeholder)
    async function loadGoalData() {
        try {
            // In production, fetch from backend
            // const response = await fetch('/api/donation-goal');
            // const data = await response.json();
            // CONFIG.currentGoal = data.current;
            // CONFIG.targetGoal = data.target;
            
            // For now, simulate some progress
            CONFIG.currentGoal = 45; // Simulated current donations
            updateProgressBar();
        } catch (error) {
            console.error('Error loading goal data:', error);
        }
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            loadGoalData();
        });
    } else {
        init();
        loadGoalData();
    }
    
    console.log('✅ Donate page initialized | Interactive features active');
})();
