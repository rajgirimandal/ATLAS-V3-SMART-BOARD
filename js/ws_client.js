/**
 * ATLAS Smart Board — High-Resilience WebSocket Client
 * 
 * Supports:
 * - Direct LAN / Localhost / Relay WebSocket connections
 * - Automatic reconnection with exponential backoff
 * - 4-Digit Hardware PIN pairing handshake
 * - Inbound multi-subject broadcast dispatch
 * - Outbound touch doubt / student question forwarding to Atlas Robot
 */

class SmartBoardWSClient {
  constructor() {
    this.ws = null;
    this.url = 'ws://localhost:8765';
    this.pin = '4242';
    this.isConnected = false;
    this.isPaired = false;
    this.retryInterval = 2000;
    this.maxRetryInterval = 10000;
    this.currentRetryInterval = 2000;
    this.reconnectTimer = null;
    this.manualDisconnect = false;

    // Event listener callbacks
    this.callbacks = {
      onConnectionChange: null,
      onHeaderUpdate: null,
      onNotesUpdate: null,
      onMathUpdate: null,
      onHighlightStep: null,
      onScienceDiagram: null,
      onSocialScience: null,
      onLaserPointer: null,
      onClearBoard: null,
    };
  }

  on(event, callback) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = callback;
    }
  }

  connect(url, pin) {
    if (url) this.url = url;
    if (pin) this.pin = pin;

    this.manualDisconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
    }

    this._notifyConnectionChange(false, 'CONNECTING...');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[SmartBoard WS] Connected to Atlas Robot:', this.url);
        this.isConnected = true;
        this.currentRetryInterval = this.retryInterval;
        this._notifyConnectionChange(true, 'CONNECTED');
      };

      this.ws.onmessage = (event) => {
        this._handleMessage(event.data);
      };

      this.ws.onclose = () => {
        console.warn('[SmartBoard WS] Connection closed.');
        this.isConnected = false;
        this.isPaired = false;
        this._notifyConnectionChange(false, 'DISCONNECTED');
        this._scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.error('[SmartBoard WS] Socket error:', err);
        this.isConnected = false;
        this._notifyConnectionChange(false, 'ERROR (OFFLINE)');
      };
    } catch (err) {
      console.error('[SmartBoard WS] Failed to initiate connection:', err);
      this._notifyConnectionChange(false, 'CONNECT FAILED');
      this._scheduleReconnect();
    }
  }

  disconnect() {
    this.manualDisconnect = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
    }
    this.isConnected = false;
    this.isPaired = false;
    this._notifyConnectionChange(false, 'DISCONNECTED');
  }

  _scheduleReconnect() {
    if (this.manualDisconnect) return;
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      console.log(`[SmartBoard WS] Retrying connection in ${this.currentRetryInterval}ms...`);
      this.connect(this.url, this.pin);
      this.currentRetryInterval = Math.min(this.currentRetryInterval * 1.5, this.maxRetryInterval);
    }, this.currentRetryInterval);
  }

  _notifyConnectionChange(status, label) {
    if (this.callbacks.onConnectionChange) {
      this.callbacks.onConnectionChange(status, label);
    }
  }

  _handleMessage(raw) {
    try {
      const data = JSON.parse(raw);
      const cmd = data.cmd;
      const payload = data.payload || {};

      switch (cmd) {
        case 'PIN_CHALLENGE':
          // Automatically respond with configured PIN
          this.sendPin(this.pin);
          break;

        case 'PAIR_SUCCESS':
          this.isPaired = true;
          this._notifyConnectionChange(true, 'LIVE SYNC (PAIRED)');
          if (this.callbacks.onAuthSuccess) this.callbacks.onAuthSuccess(payload);
          break;

        case 'PAIR_FAILURE':
          this.isPaired = false;
          this._notifyConnectionChange(false, 'INVALID PIN');
          if (this.callbacks.onAuthFailure) this.callbacks.onAuthFailure(payload);
          break;

        case 'CMD_IMAGE':
          if (this.callbacks.onImageUpdate) this.callbacks.onImageUpdate(payload);
          break;

        case 'CMD_HEADER':
          if (this.callbacks.onHeaderUpdate) this.callbacks.onHeaderUpdate(payload);
          break;

        case 'CMD_NOTES':
          if (this.callbacks.onNotesUpdate) this.callbacks.onNotesUpdate(payload);
          break;

        case 'CMD_MATH':
          if (this.callbacks.onMathUpdate) this.callbacks.onMathUpdate(payload);
          break;

        case 'CMD_HIGHLIGHT_STEP':
          if (this.callbacks.onHighlightStep) this.callbacks.onHighlightStep(payload.step_id);
          break;

        case 'CMD_SCIENCE_DIAGRAM':
          if (this.callbacks.onScienceDiagram) this.callbacks.onScienceDiagram(payload);
          break;

        case 'CMD_SOCIAL_SCIENCE':
          if (this.callbacks.onSocialScience) this.callbacks.onSocialScience(payload);
          break;

        case 'CMD_LASER_POINTER':
          if (this.callbacks.onLaserPointer) {
            this.callbacks.onLaserPointer(payload.x, payload.y, payload.is_visible);
          }
          break;

        case 'CMD_CLEAR_BOARD':
          if (this.callbacks.onClearBoard) this.callbacks.onClearBoard();
          break;

        default:
          console.debug('[SmartBoard WS] Unhandled command:', cmd);
      }
    } catch (err) {
      console.warn('[SmartBoard WS] JSON parse error:', err);
    }
  }

  // =========================================================================
  // Outbound Transmissions (Smart Board -> ATLAS Robot)
  // =========================================================================

  sendPin(pin) {
    this._send({
      cmd: 'PIN_RESPONSE',
      timestamp: Date.now() / 1000,
      payload: { pin: pin },
    });
  }

  sendStudentDoubt(queryText, studentId = 'smartboard_touch') {
    if (!queryText || !queryText.trim()) return;
    this._send({
      cmd: 'STUDENT_DOUBT',
      timestamp: Date.now() / 1000,
      payload: {
        query: queryText.trim(),
        student_id: studentId,
      },
    });
  }

  sendStudentHandRaise(studentId = 'smartboard_touch') {
    this._send({
      cmd: 'STUDENT_HAND_RAISE',
      timestamp: Date.now() / 1000,
      payload: {
        student_id: studentId,
      },
    });
  }

  _send(obj) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
    }
  }
}

// Global Export
window.SmartBoardWSClient = SmartBoardWSClient;
