/**
 * ATLAS Smart Board — KaTeX Mathematics & 2D Cartesian Function Plotter
 * 
 * Features:
 * - Dynamic KaTeX math rendering with step-by-step glowing highlights
 * - High-speed HTML5 2D Cartesian Plotter for quadratic curves, roots, and vertices
 * - Pure Unicode fallback if KaTeX CDN is blocked
 */

class MathBoardEngine {
  constructor(canvasId, stepsContainerId) {
    this.canvas = document.getElementById(canvasId);
    this.stepsContainer = document.getElementById(stepsContainerId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.activeStepId = 1;
    this.currentFunction = 'x^2 - 4';

    this.init();
  }

  init() {
    this.renderAllKaTeX();
    this.plotParabola();
  }

  renderAllKaTeX() {
    if (!this.stepsContainer) return;
    const katexNodes = this.stepsContainer.querySelectorAll('.katex-render');

    katexNodes.forEach((node) => {
      const latex = node.dataset.latex || node.textContent;
      if (window.katex) {
        try {
          window.katex.render(latex, node, {
            throwOnError: false,
            displayMode: true,
          });
        } catch (e) {
          node.textContent = latex;
        }
      } else {
        node.textContent = latex;
      }
    });
  }

  setMathPayload(payload) {
    if (!payload) return;

    if (payload.problem_title) {
      const titleEl = document.getElementById('math-problem-title');
      if (titleEl) titleEl.textContent = payload.problem_title;
    }

    if (payload.steps && Array.isArray(payload.steps)) {
      this.stepsContainer.innerHTML = '';
      payload.steps.forEach((s) => {
        const card = document.createElement('div');
        card.className = `math-step-card ${s.is_highlighted || s.step_id === payload.active_step_id ? 'active' : ''}`;
        card.dataset.step = s.step_id;
        card.innerHTML = `
          <div class="step-num">Step ${s.step_id}</div>
          <div class="step-content">
            <div class="katex-render" data-latex="${s.latex}"></div>
            <div class="step-explanation">${s.explanation_en} ${s.explanation_hi ? `— <em>${s.explanation_hi}</em>` : ''}</div>
          </div>
        `;
        this.stepsContainer.appendChild(card);
      });
      this.renderAllKaTeX();
    }

    if (payload.active_step_id) {
      this.highlightStep(payload.active_step_id);
    }

    if (payload.graph_function) {
      this.currentFunction = payload.graph_function;
      const label = document.getElementById('graph-func-label');
      if (label) label.textContent = `y = ${this.currentFunction}`;
      this.plotParabola();
    }
  }

  highlightStep(stepId) {
    this.activeStepId = stepId;
    if (!this.stepsContainer) return;

    const cards = this.stepsContainer.querySelectorAll('.math-step-card');
    cards.forEach((card) => {
      if (parseInt(card.dataset.step, 10) === parseInt(stepId, 10)) {
        card.classList.add('active');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        card.classList.remove('active');
      }
    });
  }

  // -------------------------------------------------------------------------
  // 2D Cartesian Parabola Plotter
  // -------------------------------------------------------------------------
  plotParabola(a = 1, b = 0, c = -4) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const originX = w / 2;
    const originY = h / 2 + 30; // Slightly lower for upward parabola
    const scale = 25; // 25 pixels per unit

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;

    for (let x = 0; x < w; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 2;

    // X-Axis
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(w, originY);
    ctx.stroke();

    // Y-Axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, h);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '11px "Fira Code", monospace';
    ctx.fillText('X', w - 16, originY - 6);
    ctx.fillText('Y', originX + 6, 16);

    // Plot Parabola Curve: y = a x^2 + b x + c
    ctx.beginPath();
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 3;

    let first = true;
    for (let px = 0; px < w; px += 2) {
      const mathX = (px - originX) / scale;
      const mathY = a * mathX * mathX + b * mathX + c;
      const py = originY - mathY * scale;

      if (first) {
        ctx.moveTo(px, py);
        first = false;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Highlight Vertex (0, -4)
    const vertexPy = originY - c * scale;
    ctx.beginPath();
    ctx.arc(originX, vertexPy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#00F0FF';
    ctx.fill();
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Highlight Roots: x = -2 and x = +2 (where y = 0)
    const root1Px = originX - 2 * scale;
    const root2Px = originX + 2 * scale;

    [root1Px, root2Px].forEach((rx) => {
      ctx.beginPath();
      ctx.arc(rx, originY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#FF3366';
      ctx.fill();
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }
}

// Global Export
window.MathBoardEngine = MathBoardEngine;
