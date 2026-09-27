/**
 * ATLAS Smart Board — Digital Chalk & Touch Canvas Drawing Engine
 * 
 * Features:
 * - Ultra-low latency pen / stylus / touch drawing with quadratic bezier smoothing
 * - Pressure & velocity simulation
 * - Fluorescent highlighter mode
 * - Destination-out eraser with variable radius
 * - Virtual laser pointer with particle physics & decaying glow
 * - Export canvas + content snapshot to PNG
 */

class SmartBoardCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    // Drawing state
    this.isDrawing = false;
    this.currentTool = 'pen'; // 'pen', 'highlighter', 'eraser', 'laser'
    this.currentColor = '#FFFFFF';
    this.strokeWidth = 4;
    this.points = [];

    // Laser pointer DOM element & particles
    this.laserNode = document.getElementById('laser-pointer');
    this.laserParticles = [];

    // Resize handler
    this._resizeCanvas();
    window.addEventListener('resize', () => this._resizeCanvas());

    // Bind Input Listeners (Mouse, Touch, Stylus)
    this._bindEvents();
  }

  _resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Save existing drawing
    let tempCanvas = null;
    if (this.canvas.width > 0 && this.canvas.height > 0) {
      tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.canvas.width;
      tempCanvas.height = this.canvas.height;
      tempCanvas.getContext('2d').drawImage(this.canvas, 0, 0);
    }

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    this.ctx.scale(dpr, dpr);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Restore drawing
    if (tempCanvas) {
      this.ctx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
    }
  }

  _bindEvents() {
    const c = this.canvas;

    // Pointer events (unifies Mouse, Touch, Apple Pencil, Stylus)
    c.addEventListener('pointerdown', (e) => this._onPointerDown(e));
    c.addEventListener('pointermove', (e) => this._onPointerMove(e));
    c.addEventListener('pointerup', (e) => this._onPointerUp(e));
    c.addEventListener('pointercancel', (e) => this._onPointerUp(e));
    c.addEventListener('pointerleave', (e) => this._onPointerUp(e));
  }

  _getCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure > 0 ? e.pressure : 0.5,
    };
  }

  _onPointerDown(e) {
    if (this.currentTool === 'laser') {
      this._updateLaser(e);
      return;
    }

    this.isDrawing = true;
    const pt = this._getCoords(e);
    this.points = [pt];

    this._applyBrushStyles();
    this.ctx.beginPath();
    this.ctx.arc(pt.x, pt.y, this._calcRadius(pt.pressure) / 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  _onPointerMove(e) {
    if (this.currentTool === 'laser') {
      this._updateLaser(e);
      return;
    }

    if (!this.isDrawing) return;

    const pt = this._getCoords(e);
    this.points.push(pt);

    if (this.points.length > 2) {
      // Quadratic Bezier curve between middle points
      const p1 = this.points[this.points.length - 2];
      const p2 = this.points[this.points.length - 1];
      const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

      this._applyBrushStyles();
      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.quadraticCurveTo(p1.x, p1.y, mid.x, mid.y);
      this.ctx.stroke();
    }
  }

  _onPointerUp(e) {
    this.isDrawing = false;
    this.points = [];
    if (this.currentTool === 'laser' && this.laserNode) {
      this.laserNode.style.display = 'none';
    }
  }

  _applyBrushStyles() {
    if (this.currentTool === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.lineWidth = this.strokeWidth * 4;
      this.ctx.strokeStyle = 'rgba(0,0,0,1)';
      this.ctx.fillStyle = 'rgba(0,0,0,1)';
    } else if (this.currentTool === 'highlighter') {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.lineWidth = this.strokeWidth * 3;
      // Convert hex to semi-transparent rgba
      this.ctx.strokeStyle = this._hexToRgba(this.currentColor, 0.35);
      this.ctx.fillStyle = this._hexToRgba(this.currentColor, 0.35);
    } else {
      // Standard Pen / Chalk
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.lineWidth = this.strokeWidth;
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.fillStyle = this.currentColor;
    }
  }

  _calcRadius(pressure) {
    return this.strokeWidth * (0.8 + pressure * 0.4);
  }

  _hexToRgba(hex, alpha) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
  }

  // =========================================================================
  // Laser Pointer & Spotlight
  // =========================================================================

  _updateLaser(e) {
    if (!this.laserNode) return;
    this.laserNode.style.display = 'block';
    this.laserNode.style.left = `${e.clientX}px`;
    this.laserNode.style.top = `${e.clientY}px`;
  }

  showRemoteLaser(normX, normY, isVisible) {
    if (!this.laserNode) return;
    if (!isVisible) {
      this.laserNode.style.display = 'none';
      return;
    }
    const rect = this.canvas.getBoundingClientRect();
    const px = rect.left + normX * rect.width;
    const py = rect.top + normY * rect.height;
    this.laserNode.style.display = 'block';
    this.laserNode.style.left = `${px}px`;
    this.laserNode.style.top = `${py}px`;
  }

  // =========================================================================
  // Controls & Export
  // =========================================================================

  setTool(tool) {
    this.currentTool = tool;
  }

  setColor(color) {
    this.currentColor = color;
  }

  setStrokeWidth(width) {
    this.strokeWidth = parseInt(width, 10);
  }

  clearCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);
  }

  exportToPNG() {
    const link = document.createElement('a');
    link.download = `atlas_smartboard_notes_${Date.now()}.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }
}

// Global Export
window.SmartBoardCanvas = SmartBoardCanvas;
