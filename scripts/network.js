// =====================================================================
// WatchTheFall v4 - Cinematic Particle Network Canvas
// Creates gold particle network overlay (z-index: -999)
// =====================================================================

(function() {
    'use strict';
    
    const canvas = document.getElementById('network-canvas');
    if (!canvas) {
        console.log('⚠️ Network canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    
    // Configuration
    const config = {
        particleCount: 80,
        particleColor: 'rgba(212, 175, 55, 0.6)', // Antique gold
        lineColor: 'rgba(212, 175, 55, 0.15)',
        particleSize: 2,
        maxDistance: 150,
        speed: 0.3
    };
    
    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * config.speed;
            this.vy = (Math.random() - 0.5) * config.speed;
            this.size = config.particleSize;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            // Wrap around edges
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }
        
        draw() {
            ctx.fillStyle = config.particleColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Initialize canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    // Create particles
    function initParticles() {
        particles = [];
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    // Draw connections between nearby particles
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < config.maxDistance) {
                    const opacity = (1 - distance / config.maxDistance) * 0.15;
                    ctx.strokeStyle = `rgba(212, 175, 55, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Draw connections
        drawConnections();
        
        animationId = requestAnimationFrame(animate);
    }
    
    // Initialize
    function init() {
        resizeCanvas();
        initParticles();
        animate();
        console.log('✅ Cinematic environment active: true');
        console.log('🌟 Particle network initialized:', config.particleCount, 'particles');
    }
    
    // Event listeners
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    });
})();
