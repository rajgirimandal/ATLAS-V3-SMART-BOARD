/**
 * ATLAS Smart Board — Social Science, History Timelines & Geographic Maps
 * 
 * Provides:
 * 1. Interactive Chronological Historical Timelines
 * 2. 2D Orthographic / Equirectangular Geographic Coordinate Grid
 */

class SocialScienceEngine {
  constructor(globeCanvasId, timelineContainerId) {
    this.canvas = document.getElementById(globeCanvasId);
    this.timelineContainer = document.getElementById(timelineContainerId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.rotationAngle = 0;
    this.animId = null;

    if (this.canvas) {
      this._drawGlobeGrid();
    }
  }

  // -------------------------------------------------------------------------
  // Historical Timeline
  // -------------------------------------------------------------------------
  renderTimeline(title, events) {
    if (!this.timelineContainer) return;

    if (!events || events.length === 0) {
      events = [
        { year: "1857", title: "First War of Independence", description: "Beginning of organized resistance against colonial rule." },
        { year: "1920", title: "Non-Cooperation Movement", description: "Mass civil disobedience led by Mahatma Gandhi." },
        { year: "1930", title: "Dandi Salt March", description: "240-mile march challenging the colonial salt law." },
        { year: "1942", title: "Quit India Movement", description: "Do or Die call for complete self-rule." },
        { year: "1947", title: "Independence of India", description: "Birth of sovereign democratic India on August 15." },
      ];
    }

    const track = this.timelineContainer.querySelector('.timeline-track');
    if (!track) return;

    track.innerHTML = '';
    events.forEach((ev, idx) => {
      const card = document.createElement('div');
      card.className = `timeline-card ${ev.is_highlighted ? 'highlight active' : ''}`;
      card.dataset.index = idx;
      card.innerHTML = `
        <span class="card-year">${ev.year}</span>
        <h3>${ev.title}</h3>
        <p>${ev.description}</p>
      `;
      card.addEventListener('click', () => {
        track.querySelectorAll('.timeline-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
      track.appendChild(card);
    });
  }

  // -------------------------------------------------------------------------
  // Geographic Coordinate Grid (Latitude, Longitude & Earth Axis)
  // -------------------------------------------------------------------------
  _drawGlobeGrid() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(cx, cy) - 30;

    ctx.clearRect(0, 0, w, h);

    // Deep Space Radial Background
    const bgGrad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.2);
    bgGrad.addColorStop(0, '#0F2027');
    bgGrad.addColorStop(1, '#0B0F19');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Globe Silhouette Circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#06141D';
    ctx.fill();
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.clip(); // Clip inner lines inside globe sphere

    // Latitude Parallels
    // Equator (0°)
    ctx.beginPath();
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx + r, cy);
    ctx.strokeStyle = '#FFE600';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Tropic of Cancer (23.5° N) & Tropic of Capricorn (23.5° S)
    const cancerY = cy - r * 0.40;
    const capricornY = cy + r * 0.40;

    ctx.beginPath();
    ctx.ellipse(cx, cancerY, Math.sqrt(r * r - (cancerY - cy) ** 2), r * 0.08, 0, 0, Math.PI * 2);
    ctx.ellipse(cx, capricornY, Math.sqrt(r * r - (capricornY - cy) ** 2), r * 0.08, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 230, 0, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Longitude Meridians
    for (let angle = -60; angle <= 60; angle += 30) {
      const rad = (angle * Math.PI) / 180;
      const xRad = r * Math.cos(rad);
      ctx.beginPath();
      ctx.ellipse(cx, cy, xRad, r, 0, 0, Math.PI * 2);
      ctx.strokeStyle = angle === 0 ? '#00F0FF' : 'rgba(0, 240, 255, 0.2)';
      ctx.lineWidth = angle === 0 ? 2 : 1;
      ctx.stroke();
    }

    // Stylized Subcontinent & Continents Silhouette
    ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
    ctx.beginPath();
    // India & Southern Asia approximation
    ctx.moveTo(cx + 30, cy - 20);
    ctx.lineTo(cx + 60, cy + 20);
    ctx.lineTo(cx + 40, cy + 60); // Southern tip Kanyakumari
    ctx.lineTo(cx + 10, cy + 20);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();

    // Exterior Labels
    ctx.font = '12px "Inter", sans-serif';
    ctx.fillStyle = '#FFE600';
    ctx.fillText('Equator (0°)', cx + r + 10, cy + 4);
    ctx.fillStyle = 'rgba(255, 230, 0, 0.8)';
    ctx.fillText('Tropic of Cancer (23.5°N)', cx + r - 30, cancerY - 4);
    ctx.fillText('Tropic of Capricorn (23.5°S)', cx + r - 30, capricornY + 14);
    ctx.fillStyle = '#00F0FF';
    ctx.fillText('Prime Meridian (0°)', cx - 50, cy - r - 8);
  }
}

// Global Export
window.SocialScienceEngine = SocialScienceEngine;
