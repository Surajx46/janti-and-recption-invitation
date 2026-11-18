/**
 * Sulav & Mannu Wedding Invitation
 * Canvas Petal Physics Particle Engine (Sayapatri & Gulab Petals)
 */

class PetalParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.petals = [];
    this.maxPetals = 34;
    this.isActive = true;
    this.animFrameId = null;

    // Bright floral petal palettes (Blush Rose, Marigold Gold, Peach Blossom, Festive Crimson)
    this.colors = [
      { fill: '#F48FB1', stroke: '#EC407A', type: 'blush' },
      { fill: '#FFAB91', stroke: '#FF7043', type: 'peach' },
      { fill: '#FFB300', stroke: '#F57F17', type: 'sayapatri' },
      { fill: '#E53935', stroke: '#B71C1C', type: 'rose' },
      { fill: '#F9D976', stroke: '#D4A244', type: 'gold' }
    ];

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Spawn initial petals
    for (let i = 0; i < this.maxPetals; i++) {
      this.petals.push(this.createPetal(true));
    }

    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createPetal(randomY = false) {
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    return {
      x: Math.random() * this.canvas.width,
      y: randomY ? Math.random() * this.canvas.height : -20,
      size: Math.random() * 8 + 7,
      speedY: Math.random() * 1.4 + 0.8,
      speedX: Math.sin(Math.random() * Math.PI) * 0.8,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 2.2,
      swing: Math.random() * 2 * Math.PI,
      swingSpeed: Math.random() * 0.03 + 0.015,
      opacity: Math.random() * 0.45 + 0.55,
      color: color
    };
  }

  drawPetal(p) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    this.ctx.rotate((p.rotation * Math.PI) / 180);
    this.ctx.globalAlpha = p.opacity;

    this.ctx.fillStyle = p.color.fill;
    this.ctx.strokeStyle = p.color.stroke;
    this.ctx.lineWidth = 0.8;

    this.ctx.beginPath();
    // Curved organic petal shape
    this.ctx.moveTo(0, -p.size);
    this.ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.5, p.size * 0.8, p.size * 0.5, 0, p.size);
    this.ctx.bezierCurveTo(-p.size * 0.8, p.size * 0.5, -p.size * 0.8, -p.size * 0.5, 0, -p.size);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.restore();
  }

  animate() {
    if (!this.isActive) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];
      p.swing += p.swingSpeed;
      p.x += Math.sin(p.swing) * 1.2 + p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotSpeed;

      this.drawPetal(p);

      // Recycle petals reaching bottom or edges
      if (p.y > this.canvas.height + 20 || p.x < -30 || p.x > this.canvas.width + 30) {
        this.petals[i] = this.createPetal(false);
      }
    }

    this.animFrameId = requestAnimationFrame(() => this.animate());
  }

  toggle() {
    this.isActive = !this.isActive;
    if (this.isActive) {
      this.animate();
    } else {
      cancelAnimationFrame(this.animFrameId);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    return this.isActive;
  }
}

// Confetti burst for celebrations
function triggerCelebrationConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '9999';
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confettiPieces = [];
  const colors = ['#FFE082', '#FFB300', '#D4AF37', '#E53935', '#4CAF50', '#ffffff'];

  for (let i = 0; i < 90; i++) {
    confettiPieces.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 18,
      size: Math.random() * 8 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 15,
      gravity: 0.35,
      opacity: 1
    });
  }

  let frames = 0;
  function updateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frames++;

    confettiPieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.rotSpeed;
      p.opacity -= 0.012;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    if (frames < 100) {
      requestAnimationFrame(updateConfetti);
    } else {
      canvas.remove();
    }
  }

  updateConfetti();
}

