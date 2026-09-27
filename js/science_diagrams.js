/**
 * ATLAS Smart Board — Interactive Vector Science Diagrams Engine
 * 
 * Provides dynamic, animated SVG models for:
 * 1. Photosynthesis & Cellular Energy
 * 2. Plant Cell Microscopic Anatomy
 * 3. Electric Circuit & Electron Drift
 * 4. Solar System Planetary Orbits
 * 5. Water Cycle & Atmospheric Hydrology
 */

class ScienceDiagramsEngine {
  constructor(svgElementId) {
    this.svg = document.getElementById(svgElementId);
    this.currentDiagram = 'photosynthesis';
    this.animationId = null;
  }

  render(diagramType, highlightPart = null) {
    this.currentDiagram = diagramType;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    switch (diagramType) {
      case 'photosynthesis':
        this._renderPhotosynthesis(highlightPart);
        break;
      case 'plant_cell':
        this._renderPlantCell(highlightPart);
        break;
      case 'electric_circuit':
        this._renderElectricCircuit(highlightPart);
        break;
      case 'solar_system':
        this._renderSolarSystem(highlightPart);
        break;
      case 'water_cycle':
        this._renderWaterCycle(highlightPart);
        break;
      default:
        this._renderPhotosynthesis(highlightPart);
    }
  }

  // -------------------------------------------------------------------------
  // 1. Photosynthesis
  // -------------------------------------------------------------------------
  _renderPhotosynthesis(highlightPart) {
    this.svg.innerHTML = `
      <!-- Background Elements -->
      <defs>
        <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFE600" />
          <stop offset="100%" stop-color="#FF5500" />
        </linearGradient>
        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#10B981" />
          <stop offset="100%" stop-color="#047857" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Radiant Sun -->
      <g id="part-sun" class="diag-group">
        <circle cx="120" cy="90" r="45" fill="url(#sunGrad)" filter="url(#glow)" />
        <!-- Sun Rays -->
        <path d="M 120 30 L 120 15 M 120 150 L 120 165 M 60 90 L 45 90 M 180 90 L 195 90" stroke="#FFE600" stroke-width="4" stroke-linecap="round" />
        <path d="M 75 45 L 65 35 M 165 135 L 175 145 M 75 135 L 65 145 M 165 45 L 175 35" stroke="#FFE600" stroke-width="4" stroke-linecap="round" />
        <text x="120" y="96" fill="#000" font-weight="bold" font-size="12" text-anchor="middle">SUNLIGHT</text>
      </g>

      <!-- Ray Beams to Leaf -->
      <path d="M 160 115 Q 260 150 350 200" stroke="#FFE600" stroke-width="3" stroke-dasharray="6,4" fill="none" opacity="0.8" />
      <path d="M 170 100 Q 280 140 370 190" stroke="#FFE600" stroke-width="3" stroke-dasharray="6,4" fill="none" opacity="0.8" />

      <!-- Giant Green Leaf -->
      <g id="part-leaf" class="diag-group">
        <path d="M 330 260 C 330 140 500 130 640 180 C 650 300 520 380 330 260 Z" fill="url(#leafGrad)" stroke="#34D399" stroke-width="3" />
        <!-- Leaf Veins -->
        <path d="M 330 260 Q 480 230 640 180" stroke="#064E3B" stroke-width="4" fill="none" />
        <path d="M 420 240 Q 450 200 480 190" stroke="#064E3B" stroke-width="2.5" fill="none" />
        <path d="M 490 225 Q 530 195 560 180" stroke="#064E3B" stroke-width="2.5" fill="none" />
        <path d="M 440 245 Q 460 280 480 300" stroke="#064E3B" stroke-width="2.5" fill="none" />
        <path d="M 520 220 Q 550 250 580 270" stroke="#064E3B" stroke-width="2.5" fill="none" />
      </g>

      <!-- Inflowing Carbon Dioxide CO2 -->
      <g id="part-co2" class="diag-group">
        <rect x="220" y="290" width="110" height="40" rx="8" fill="#1F2937" stroke="#00F0FF" stroke-width="2" />
        <text x="275" y="315" fill="#00F0FF" font-weight="bold" font-size="14" text-anchor="middle">IN: 6 CO₂</text>
        <path d="M 330 310 L 370 290" stroke="#00F0FF" stroke-width="3" marker-end="url(#arrow)" />
      </g>

      <!-- Inflowing Water H2O from Stem -->
      <g id="part-h2o" class="diag-group">
        <path d="M 330 260 Q 280 340 240 420" stroke="#3B82F6" stroke-width="14" stroke-linecap="round" fill="none" />
        <rect x="180" y="380" width="100" height="40" rx="8" fill="#1F2937" stroke="#3B82F6" stroke-width="2" />
        <text x="230" y="405" fill="#3B82F6" font-weight="bold" font-size="14" text-anchor="middle">IN: 6 H₂O</text>
      </g>

      <!-- Outflowing Oxygen O2 -->
      <g id="part-o2" class="diag-group">
        <rect x="670" y="140" width="110" height="40" rx="8" fill="#1F2937" stroke="#10B981" stroke-width="2" />
        <text x="725" y="165" fill="#10B981" font-weight="bold" font-size="14" text-anchor="middle">OUT: 6 O₂</text>
        <path d="M 620 180 L 670 160" stroke="#10B981" stroke-width="3" />
      </g>

      <!-- Synthesized Glucose C6H12O6 -->
      <g id="part-glucose" class="diag-group">
        <rect x="660" y="260" width="140" height="44" rx="8" fill="#1F2937" stroke="#FFE600" stroke-width="2" />
        <text x="730" y="287" fill="#FFE600" font-weight="bold" font-size="13" text-anchor="middle">GLUCOSE (C₆H₁₂O₆)</text>
        <path d="M 600 240 L 660 270" stroke="#FFE600" stroke-width="3" />
      </g>

      <!-- Chemical Balanced Equation Banner -->
      <g id="part-equation">
        <rect x="180" y="430" width="540" height="40" rx="8" fill="rgba(17, 24, 39, 0.9)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
        <text x="450" y="455" fill="#FFF" font-family="'Fira Code', monospace" font-size="15" font-weight="bold" text-anchor="middle">
          6CO₂ + 6H₂O + Sunlight ⟶ C₆H₁₂O₆ + 6O₂
        </text>
      </g>
    `;
  }

  // -------------------------------------------------------------------------
  // 2. Plant Cell Microscopic Anatomy
  // -------------------------------------------------------------------------
  _renderPlantCell(highlightPart) {
    this.svg.innerHTML = `
      <!-- Outer Rigid Cell Wall -->
      <rect x="120" y="60" width="660" height="360" rx="40" fill="#064E3B" stroke="#10B981" stroke-width="8" />
      <!-- Plasma Membrane -->
      <rect x="135" y="75" width="630" height="330" rx="30" fill="#022C22" stroke="#34D399" stroke-width="3" stroke-dasharray="8,4" />

      <!-- Cytoplasm Area -->
      <text x="160" y="110" fill="#6EE7B7" font-weight="bold" font-size="14">CYTOPLASM</text>

      <!-- Large Central Vacuole -->
      <g id="part-vacuole">
        <path d="M 360 140 C 520 120 620 180 600 280 C 560 360 380 340 330 260 C 310 180 340 140 360 140 Z" fill="#1E3A8A" opacity="0.6" stroke="#60A5FA" stroke-width="3" />
        <text x="460" y="240" fill="#93C5FD" font-weight="bold" font-size="16" text-anchor="middle">CENTRAL VACUOLE</text>
        <text x="460" y="260" fill="#BFDBFE" font-size="12" text-anchor="middle">(Turgor Pressure & Water Storage)</text>
      </g>

      <!-- Nucleus with Nucleolus -->
      <g id="part-nucleus">
        <circle cx="240" cy="220" r="65" fill="#581C87" stroke="#A855F7" stroke-width="4" />
        <circle cx="240" cy="220" r="24" fill="#C084FC" />
        <text x="240" y="225" fill="#000" font-weight="bold" font-size="11" text-anchor="middle">DNA</text>
        <text x="240" y="305" fill="#E9D5FF" font-weight="bold" font-size="13" text-anchor="middle">NUCLEUS</text>
      </g>

      <!-- Chloroplasts (Photosynthetic Organelles) -->
      <g id="part-chloroplasts">
        <ellipse cx="220" cy="350" rx="40" ry="22" fill="#047857" stroke="#34D399" stroke-width="2" />
        <ellipse cx="680" cy="140" rx="38" ry="20" fill="#047857" stroke="#34D399" stroke-width="2" />
        <ellipse cx="660" cy="330" rx="42" ry="22" fill="#047857" stroke="#34D399" stroke-width="2" />
        <text x="660" y="335" fill="#FFF" font-size="10" font-weight="bold" text-anchor="middle">Chloroplast</text>
      </g>

      <!-- Mitochondria -->
      <ellipse cx="280" cy="115" rx="30" ry="14" fill="#991B1B" stroke="#F87171" stroke-width="2" />
      <text x="280" y="119" fill="#FFF" font-size="9" font-weight="bold" text-anchor="middle">Mito</text>
    `;
  }

  // -------------------------------------------------------------------------
  // 3. Electric Circuit & Electron Drift
  // -------------------------------------------------------------------------
  _renderElectricCircuit(highlightPart) {
    this.svg.innerHTML = `
      <!-- Wire Circuit Loop -->
      <rect x="150" y="100" width="600" height="260" rx="10" fill="none" stroke="#FFE600" stroke-width="5" />

      <!-- DC Battery (Power Source) on Left -->
      <g id="part-battery">
        <rect x="135" y="200" width="30" height="60" fill="#1F2937" stroke="#FFF" stroke-width="2" />
        <line x1="130" y1="215" x2="170" y2="215" stroke="#EF4444" stroke-width="6" />
        <line x1="140" y1="245" x2="160" y2="245" stroke="#3B82F6" stroke-width="6" />
        <text x="95" y="218" fill="#EF4444" font-weight="bold" font-size="16">+</text>
        <text x="95" y="248" fill="#3B82F6" font-weight="bold" font-size="18">-</text>
        <text x="80" y="235" fill="#FFF" font-weight="bold" font-size="12">12V DC</text>
      </g>

      <!-- Knife Switch on Top -->
      <g id="part-switch">
        <rect x="420" y="90" width="60" height="20" fill="#0B0F19" />
        <circle cx="430" cy="100" r="5" fill="#FFF" />
        <circle cx="470" cy="100" r="5" fill="#FFF" />
        <line x1="430" y1="100" x2="465" y2="85" stroke="#00F0FF" stroke-width="4" stroke-linecap="round" />
        <text x="450" y="70" fill="#00F0FF" font-size="12" font-weight="bold" text-anchor="middle">SWITCH (OPEN)</text>
      </g>

      <!-- Resistor (Ohmic Load) on Right -->
      <g id="part-resistor">
        <rect x="735" y="190" width="30" height="80" fill="#0B0F19" />
        <path d="M 750 180 L 760 190 L 740 205 L 760 220 L 740 235 L 760 250 L 750 260" stroke="#F59E0B" stroke-width="4" fill="none" />
        <text x="805" y="225" fill="#F59E0B" font-weight="bold" font-size="13">R = 10 Ω</text>
      </g>

      <!-- Glowing Light Bulb / Load on Bottom -->
      <g id="part-bulb">
        <circle cx="450" cy="360" r="28" fill="#FFE600" opacity="0.85" filter="url(#glow)" />
        <circle cx="450" cy="360" r="16" fill="#FFF" />
        <text x="450" y="415" fill="#FFE600" font-weight="bold" font-size="14" text-anchor="middle">LOAD (LED BULB)</text>
      </g>

      <!-- Ohm's Law Formula Banner -->
      <rect x="300" y="430" width="300" height="38" rx="8" fill="#1F2937" stroke="rgba(255,255,255,0.1)" />
      <text x="450" y="454" fill="#00F0FF" font-family="'Fira Code', monospace" font-size="14" font-weight="bold" text-anchor="middle">
        Ohm's Law: V = I × R ⟹ I = V / R
      </text>
    `;
  }

  // -------------------------------------------------------------------------
  // 4. Solar System Planetary Orbits
  // -------------------------------------------------------------------------
  _renderSolarSystem(highlightPart) {
    this.svg.innerHTML = `
      <!-- Sun -->
      <circle cx="450" cy="240" r="32" fill="#FFE600" filter="url(#glow)" />
      <text x="450" y="245" fill="#000" font-weight="bold" font-size="12" text-anchor="middle">SUN</text>

      <!-- Orbits -->
      <ellipse cx="450" cy="240" rx="80" ry="40" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
      <ellipse cx="450" cy="240" rx="140" ry="70" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
      <ellipse cx="450" cy="240" rx="210" ry="105" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
      <ellipse cx="450" cy="240" rx="290" ry="145" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
      <ellipse cx="450" cy="240" rx="380" ry="190" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" />

      <!-- Planets -->
      <!-- Mercury -->
      <circle cx="530" cy="240" r="5" fill="#9CA3AF" />
      <!-- Venus -->
      <circle cx="450" cy="170" r="9" fill="#F59E0B" />
      <!-- Earth & Moon -->
      <circle cx="240" cy="240" r="10" fill="#3B82F6" />
      <circle cx="225" cy="235" r="3" fill="#FFF" />
      <text x="240" y="265" fill="#93C5FD" font-size="10" font-weight="bold" text-anchor="middle">Earth</text>
      <!-- Mars -->
      <circle cx="450" cy="385" r="7" fill="#EF4444" />
      <!-- Jupiter -->
      <circle cx="830" cy="240" r="22" fill="#D97706" />
      <text x="830" y="275" fill="#FDE68A" font-size="11" font-weight="bold" text-anchor="middle">Jupiter</text>
    `;
  }

  // -------------------------------------------------------------------------
  // 5. Water Cycle
  // -------------------------------------------------------------------------
  _renderWaterCycle(highlightPart) {
    this.svg.innerHTML = `
      <!-- Ocean / Body of Water -->
      <path d="M 0 360 Q 220 340 450 370 T 900 360 L 900 480 L 0 480 Z" fill="#1E3A8A" />
      <text x="250" y="420" fill="#93C5FD" font-weight="bold" font-size="16">OCEAN / RESERVOIR</text>

      <!-- Mountains on Right -->
      <polygon points="600,360 720,160 840,360" fill="#374151" />
      <polygon points="700,360 790,200 890,360" fill="#4B5563" />
      <!-- Snowcap -->
      <polygon points="700,190 720,160 740,190" fill="#FFF" />

      <!-- Evaporation Arrows (Rising Vapor) -->
      <g stroke="#00F0FF" stroke-width="3" stroke-linecap="round" stroke-dasharray="6,4">
        <path d="M 220 330 Q 200 260 220 200" />
        <path d="M 280 320 Q 300 250 280 190" />
        <path d="M 340 330 Q 320 260 340 200" />
      </g>
      <text x="280" y="270" fill="#00F0FF" font-weight="bold" font-size="14" text-anchor="middle">EVAPORATION</text>

      <!-- Clouds (Condensation) -->
      <g fill="#9CA3AF">
        <circle cx="340" cy="120" r="30" />
        <circle cx="380" cy="110" r="40" />
        <circle cx="430" cy="120" r="35" />
        <circle cx="470" cy="130" r="25" />
      </g>
      <text x="400" y="125" fill="#000" font-weight="bold" font-size="13" text-anchor="middle">CONDENSATION</text>

      <!-- Precipitation (Rain over Mountains) -->
      <g stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round">
        <line x1="680" y1="180" x2="670" y2="210" />
        <line x1="720" y1="180" x2="710" y2="210" />
        <line x1="760" y1="180" x2="750" y2="210" />
        <line x1="700" y1="230" x2="690" y2="260" />
        <line x1="740" y1="230" x2="730" y2="260" />
      </g>
      <text x="730" y="140" fill="#60A5FA" font-weight="bold" font-size="14" text-anchor="middle">PRECIPITATION (RAIN)</text>

      <!-- Surface Runoff Arrow -->
      <path d="M 640 350 Q 520 380 440 370" stroke="#3B82F6" stroke-width="4" fill="none" marker-end="url(#arrow)" />
      <text x="540" y="355" fill="#93C5FD" font-size="12" font-weight="bold">Surface Runoff</text>
    `;
  }
}

// Global Export
window.ScienceDiagramsEngine = ScienceDiagramsEngine;
