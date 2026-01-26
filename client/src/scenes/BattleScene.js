/**
 * Battle Scene - Circular path tower defense gameplay
 * - Enemies spawn at 12 o'clock and move counter-clockwise
 * - Towers are placed inside the circular arena and can be dragged
 * - Timer-based wave system
 * - Random tower generation with card storage
 */

import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Tower } from '../entities/Tower';
import { Enemy } from '../entities/Enemy';
import { Button } from '../ui/Button';
import { EnemyDatabase } from '../data/EnemyDatabase';
import { CardDatabase } from '../data/CardDatabase';

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data) {
    this.nodeType = data.nodeType || 'battle';
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // VIRTUAL ZOOM/SCROLL SYSTEM:
    // Camera stays fixed at zoom=1.0, scroll=0
    // We manually transform game elements based on virtual zoom/scroll
    // UI elements are never transformed
    
    this.virtualZoom = 1.5; // User's zoom level
    this.virtualScrollX = 0; // User's scroll X
    this.virtualScrollY = 0; // User's scroll Y
    this.minZoom = 1.0; // 100% minimum
    this.maxZoom = 4.0; // 400% maximum
    
    // Track game elements that need transformation
    this.gameElements = [];
    
    // Camera stays completely fixed
    this.cameras.main.setZoom(1.0);
    this.cameras.main.setScroll(0, 0);
    
    // Initialize battle state
    this.initBattleState();
    
    // Create battlefield
    this.createTianBattlefield(width, height);
    
    // Setup virtual zoom controls
    this.setupCameraZoom();
    
    // Create UI
    this.createUI(width, height);
    
    // Center virtual view on map
    this.centerVirtualView();
    
    // Apply initial transformations
    this.updateGameElementTransforms();
    
    // Entrance animation
    this.cameras.main.fadeIn(500);
  }
  
  // Helper to add game world element (will be transformed by virtual zoom/scroll)
  addGameElement(element) {
    this.gameElements.push(element);
    return element;
  }
  
  // Helper to add UI element (never transformed)
  addUIElement(element) {
    // UI elements are not tracked, stay fixed on screen
    return element;
  }
  
  // Convert screen coordinates to world coordinates
  screenToWorld(screenX, screenY) {
    const { width, height } = this.cameras.main;
    const worldX = (screenX - width / 2) / this.virtualZoom + this.virtualScrollX;
    const worldY = (screenY - height / 2) / this.virtualZoom + this.virtualScrollY;
    return { x: worldX, y: worldY };
  }
  
  // Convert world coordinates to screen coordinates
  worldToScreen(worldX, worldY) {
    const { width, height } = this.cameras.main;
    const screenX = (worldX - this.virtualScrollX) * this.virtualZoom + width / 2;
    const screenY = (worldY - this.virtualScrollY) * this.virtualZoom + height / 2;
    return { x: screenX, y: screenY };
  }
  
  // Center virtual view on map
  centerVirtualView() {
    this.virtualScrollX = this.centerX;
    this.virtualScrollY = this.centerY;
  }
  
  // Clamp virtual scroll to prevent seeing outside map boundaries
  clampVirtualScrollToMapBounds() {
    const { width, height } = this.cameras.main;
    
    // Calculate visible world area at current zoom
    const visibleWorldWidth = width / this.virtualZoom;
    const visibleWorldHeight = (height - 200) / this.virtualZoom; // Account for bottom UI (updated height)
    
    // Map boundaries
    const mapLeft = this.centerX - this.mapSize / 2;
    const mapRight = this.centerX + this.mapSize / 2;
    const mapTop = this.centerY - this.mapSize / 2;
    const mapBottom = this.centerY + this.mapSize / 2;
    
    // If visible area is larger than map (at minZoom), center on map
    if (visibleWorldWidth >= this.mapSize) {
      this.virtualScrollX = this.centerX;
    } else {
      // Clamp so edges of map don't go past screen edges
      const minScrollX = mapLeft + visibleWorldWidth / 2;
      const maxScrollX = mapRight - visibleWorldWidth / 2;
      this.virtualScrollX = Phaser.Math.Clamp(this.virtualScrollX, minScrollX, maxScrollX);
    }
    
    if (visibleWorldHeight >= this.mapSize) {
      this.virtualScrollY = this.centerY;
    } else {
      const minScrollY = mapTop + visibleWorldHeight / 2;
      const maxScrollY = mapBottom - visibleWorldHeight / 2;
      this.virtualScrollY = Phaser.Math.Clamp(this.virtualScrollY, minScrollY, maxScrollY);
    }
  }
  
  // Update all game element transforms based on virtual zoom/scroll
  updateGameElementTransforms() {
    const { width, height } = this.cameras.main;
    
    this.gameElements.forEach(element => {
      if (element.worldX !== undefined && element.worldY !== undefined) {
        // Element has world coordinates, transform to screen
        const screen = this.worldToScreen(element.worldX, element.worldY);
        element.x = screen.x;
        element.y = screen.y;
        element.setScale(this.virtualZoom);
      }
    });
    
    // Update grid overlay if visible
    if (this.gridOverlay && this.gridOverlay.visible) {
      this.showGridOverlay();
    }
    
    // Update enemy info tooltip position if visible
    if (this.enemyInfoTooltip && this.enemyInfoTarget) {
      // Check if enemy is still alive
      if (this.enemyInfoTarget.isDead || !this.enemyInfoTarget.active || !this.enemyInfoTarget.scene) {
        this.hideEnemyInfo();
      } else {
        const screen = this.worldToScreen(this.enemyInfoTarget.worldX, this.enemyInfoTarget.worldY);
        this.enemyInfoTooltip.x = screen.x;
        this.enemyInfoTooltip.y = screen.y - 60;
        
        // Update health value in real-time (hpText is at index 2 in container)
        if (this.enemyInfoTooltip.list.length > 2) {
          const hpText = this.enemyInfoTooltip.list[2];
          hpText.setText(`HP: ${Math.ceil(this.enemyInfoTarget.health)} / ${this.enemyInfoTarget.maxHealth}`);
        }
      }
    }
  }

  setupCameraZoom() {
    const { width, height } = this.cameras.main;
    
    // Camera stays fixed, no bounds needed
    this.cameras.main.setBackgroundColor(0x1a0a2e);
    
    // Mouse wheel zoom
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      const zoomAmount = deltaY > 0 ? -0.1 : 0.1;
      
      // Get world point under cursor before zoom
      const worldBefore = this.screenToWorld(pointer.x, pointer.y);
      
      // Update virtual zoom
      const newZoom = Phaser.Math.Clamp(this.virtualZoom + zoomAmount, this.minZoom, this.maxZoom);
      this.virtualZoom = newZoom;
      
      // Get world point under cursor after zoom
      const worldAfter = this.screenToWorld(pointer.x, pointer.y);
      
      // Adjust scroll to keep same world point under cursor
      this.virtualScrollX += worldBefore.x - worldAfter.x;
      this.virtualScrollY += worldBefore.y - worldAfter.y;
      
      // Clamp scroll to keep map boundaries visible (prevent seeing outside map)
      this.clampVirtualScrollToMapBounds();
      
      // Update all game elements
      this.updateGameElementTransforms();
    });
    
    
    // Touch pinch zoom for mobile
    let initialDistance = 0;
    let initialZoom = 1;
    
    this.input.on('pointerdown', (pointer) => {
      if (this.input.pointer2.isDown) {
        // Two fingers down - start pinch
        initialDistance = Phaser.Math.Distance.Between(
          this.input.pointer1.x, this.input.pointer1.y,
          this.input.pointer2.x, this.input.pointer2.y
        );
        initialZoom = this.virtualZoom;
      }
    });
    
    this.input.on('pointermove', (pointer) => {
      if (this.input.pointer1.isDown && this.input.pointer2.isDown) {
        // Two fingers moving - pinch zoom
        const currentDistance = Phaser.Math.Distance.Between(
          this.input.pointer1.x, this.input.pointer1.y,
          this.input.pointer2.x, this.input.pointer2.y
        );
        
        const scale = currentDistance / initialDistance;
        this.virtualZoom = Phaser.Math.Clamp(initialZoom * scale, this.minZoom, this.maxZoom);
        this.updateGameElementTransforms();
      }
    });
    
    // Camera drag (single finger/mouse when not interacting with UI)
    let dragStartX = 0;
    let dragStartY = 0;
    let scrollStartX = 0;
    let scrollStartY = 0;
    let isDragging = false;
    
    this.input.on('pointerdown', (pointer) => {
      // Right-click or middle-click for camera drag
      if (pointer.rightButtonDown() || pointer.middleButtonDown()) {
        dragStartX = pointer.x;
        dragStartY = pointer.y;
        scrollStartX = this.virtualScrollX;
        scrollStartY = this.virtualScrollY;
        isDragging = true;
      }
    });
    
    this.input.on('pointermove', (pointer) => {
      if (isDragging && !this.input.pointer2.isDown) {
        const deltaX = (dragStartX - pointer.x) / this.virtualZoom;
        const deltaY = (dragStartY - pointer.y) / this.virtualZoom;
        
        // Update scroll position
        this.virtualScrollX = scrollStartX + deltaX;
        this.virtualScrollY = scrollStartY + deltaY;
        
        // Clamp to map boundaries (prevent seeing outside map)
        this.clampVirtualScrollToMapBounds();
        
        this.updateGameElementTransforms();
      }
    });
    
    this.input.on('pointerup', () => {
      isDragging = false;
    });
  }

  initBattleState() {
    const { width, height } = this.cameras.main;
    
    this.battleState = {
      gold: 100,
      currentWave: 1,
      waveTimer: 30,
      timerRunning: false,
      isGameOver: false,
      score: 0,
      scoreMultiplier: 1.0,
      maxEnemies: 200,
      isPaused: false,
      gameStarted: false,
      warningActive: false,
      warningTimer: 10
    };
    
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.towerCards = [];
    this.maxTowerCards = 100;
    this.cardScrollOffset = 0;
    this.visibleCards = 5;
    
    // Interaction modes
    this.isCardSelected = false;
    this.isMoveMode = false;
    this.movingTower = null;
    this.isSellMode = false;
    
    // 田字 map setup - total grid is 27x27 (3+9+3+9+3)
    this.centerX = width / 2;
    this.centerY = height / 2 - 60;
    this.quadrantSize = 9; // 9x9 per quadrant
    this.pathWidth = 3; // 3 cells wide for all paths (including outer border)
    
    // Total cells = 3 (outer) + 9 (quad) + 3 (center) + 9 (quad) + 3 (outer) = 27
    this.totalCells = this.pathWidth + this.quadrantSize + this.pathWidth + this.quadrantSize + this.pathWidth;
    
    // Calculate cell size based on screen
    const availableSize = Math.min(width * 0.85, (height - 200) * 0.95);
    this.cellSize = availableSize / this.totalCells;
    
    // Calculate map dimensions
    this.mapSize = this.cellSize * this.totalCells;
    this.mapLeft = this.centerX - this.mapSize / 2;
    this.mapTop = this.centerY - this.mapSize / 2;
    
    // Calculate minZoom to fit entire map at 100%
    const zoomToFitWidth = width / this.mapSize;
    const zoomToFitHeight = (height - 200) / this.mapSize;
    this.minZoom = Math.min(zoomToFitWidth, zoomToFitHeight);
    this.virtualZoom = this.minZoom; // Start at minimum to show full map
    
    // Center virtual view on map
    this.centerVirtualView();
    
    // Generate 田字 path points
    this.pathPoints = this.generateTianPath();
    this.gridCells = this.generateGridCells();
  }

  generateTianPath() {
    // Map structure: 27x27 grid = 3 (outer) + 9 (quad) + 3 (center) + 9 (quad) + 3 (outer)
    // Path runs through the CENTER of the 3-cell wide path areas
    // Outer border path is at cells 0-2 and 24-26
    // Center cross path is at cells 12-14
    
    const cellSize = this.cellSize;
    const pathCenterOffset = cellSize * 1.5; // Center of 3-cell path
    
    // Key positions (in cell indices)
    // Outer top edge: row 1.5 (center of cells 0,1,2)
    // Q1/Q2 boundary: col 12-14
    // Outer bottom edge: row 25.5 (center of cells 24,25,26)
    
    // Calculate actual positions
    const outerTop = this.mapTop + pathCenterOffset;
    const outerBottom = this.mapTop + this.mapSize - pathCenterOffset;
    const outerLeft = this.mapLeft + pathCenterOffset;
    const outerRight = this.mapLeft + this.mapSize - pathCenterOffset;
    
    const waypoints = [
      // Start at center
      { x: this.centerX, y: this.centerY },
      
      // 1. UP - move to top outer edge (center of outer path)
      { x: this.centerX, y: outerTop },
      
      // 2. RIGHT - move to top-right corner
      { x: outerRight, y: outerTop },
      
      // 3. DOWN - move to right side, horizontal center
      { x: outerRight, y: this.centerY },
      
      // 4. LEFT - move back to center
      { x: this.centerX, y: this.centerY },
      
      // 5. LEFT - move to left side
      { x: outerLeft, y: this.centerY },
      
      // 6. UP - move to top-left corner
      { x: outerLeft, y: outerTop },
      
      // 7. RIGHT - move to top center
      { x: this.centerX, y: outerTop },
      
      // 8. DOWN - move back to center
      { x: this.centerX, y: this.centerY },
      
      // 9. DOWN - move to bottom outer edge
      { x: this.centerX, y: outerBottom },
      
      // 10. LEFT - move to bottom-left corner
      { x: outerLeft, y: outerBottom },
      
      // 11. UP - move to left center
      { x: outerLeft, y: this.centerY },
      
      // 12. RIGHT - move back to center
      { x: this.centerX, y: this.centerY },
      
      // 13. RIGHT - move to right side
      { x: outerRight, y: this.centerY },
      
      // 14. DOWN - move to bottom-right corner
      { x: outerRight, y: outerBottom },
      
      // 15. LEFT - move to bottom center
      { x: this.centerX, y: outerBottom },
      
      // 16. UP - return to center
      { x: this.centerX, y: this.centerY }
    ];
    
    // Smooth interpolation between waypoints
    const smoothPath = [];
    const pointsPerSegment = 20;
    
    for (let i = 0; i < waypoints.length - 1; i++) {
      const start = waypoints[i];
      const end = waypoints[i + 1];
      
      for (let j = 0; j < pointsPerSegment; j++) {
        const t = j / pointsPerSegment;
        smoothPath.push({
          x: start.x + (end.x - start.x) * t,
          y: start.y + (end.y - start.y) * t
        });
      }
    }
    
    smoothPath.push(waypoints[0]);
    return smoothPath;
  }

  generateCircularPath() {
    // Kept for compatibility - redirects to Tian path
    return this.generateTianPath();
  }

  generateGridCells() {
    // Generate placement cells for 4 quadrants (9x9 each = 324 total)
    // Map is 27x27: [0-2:outerPath][3-11:Q1/Q2][12-14:centerPath][15-23:Q3/Q4][24-26:outerPath]
    const cells = [];
    
    // Quadrant positions in cell indices
    // NW: cols 3-11, rows 3-11
    // NE: cols 15-23, rows 3-11
    // SW: cols 3-11, rows 15-23
    // SE: cols 15-23, rows 15-23
    
    const quadrants = [
      { 
        name: 'NW', 
        startCol: this.pathWidth, // col 3
        startRow: this.pathWidth  // row 3
      },
      { 
        name: 'NE', 
        startCol: this.pathWidth + this.quadrantSize + this.pathWidth, // col 15
        startRow: this.pathWidth  // row 3
      },
      { 
        name: 'SW', 
        startCol: this.pathWidth, // col 3
        startRow: this.pathWidth + this.quadrantSize + this.pathWidth  // row 15
      },
      { 
        name: 'SE', 
        startCol: this.pathWidth + this.quadrantSize + this.pathWidth, // col 15
        startRow: this.pathWidth + this.quadrantSize + this.pathWidth  // row 15
      }
    ];
    
    quadrants.forEach(quad => {
      for (let row = 0; row < this.quadrantSize; row++) {
        for (let col = 0; col < this.quadrantSize; col++) {
          const gridCol = quad.startCol + col;
          const gridRow = quad.startRow + row;
          
          // Cell center position
          const cellX = this.mapLeft + (gridCol + 0.5) * this.cellSize;
          const cellY = this.mapTop + (gridRow + 0.5) * this.cellSize;
          
          cells.push({
            x: cellX,
            y: cellY,
            gridCol: gridCol,
            gridRow: gridRow,
            localCol: col,
            localRow: row,
            quadrant: quad.name,
            isPath: false, // Quadrant cells are never paths
            occupied: false
          });
        }
      }
    });
    
    return cells;
  }

  createTianBattlefield(width, height) {
    // Create map container at world origin (0, 0)
    this.mapContainer = this.add.container(0, 0);
    this.mapContainer.worldX = 0;
    this.mapContainer.worldY = 0;
    this.addGameElement(this.mapContainer);
    
    // Background - game world element
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f3460, 0x0f3460, 1);
    bg.fillRect(0, 0, width * 2, height * 2);
    this.mapContainer.add(bg);
    
    const quadGraphics = this.add.graphics();
    this.mapContainer.add(quadGraphics);
    
    // Fill entire 27x27 map area with path color first
    quadGraphics.fillStyle(0x3a2a2a, 1);
    quadGraphics.fillRect(this.mapLeft, this.mapTop, this.mapSize, this.mapSize);
    
    // Draw 4 quadrant backgrounds (placement areas) - on top of path
    // Each quadrant is 9x9 cells
    const quadSize = this.quadrantSize * this.cellSize;
    const pathPixels = this.pathWidth * this.cellSize;
    
    quadGraphics.fillStyle(0x1e3a2e, 1);
    
    // NW quadrant: starts at col 3, row 3
    quadGraphics.fillRect(
      this.mapLeft + pathPixels,
      this.mapTop + pathPixels,
      quadSize,
      quadSize
    );
    
    // NE quadrant: starts at col 15, row 3
    quadGraphics.fillRect(
      this.mapLeft + pathPixels + quadSize + pathPixels,
      this.mapTop + pathPixels,
      quadSize,
      quadSize
    );
    
    // SW quadrant: starts at col 3, row 15
    quadGraphics.fillRect(
      this.mapLeft + pathPixels,
      this.mapTop + pathPixels + quadSize + pathPixels,
      quadSize,
      quadSize
    );
    
    // SE quadrant: starts at col 15, row 15
    quadGraphics.fillRect(
      this.mapLeft + pathPixels + quadSize + pathPixels,
      this.mapTop + pathPixels + quadSize + pathPixels,
      quadSize,
      quadSize
    );
    
    // Draw grid lines for all 27x27 cells
    quadGraphics.lineStyle(1, 0x2a4a3a, 0.3);
    
    for (let i = 0; i <= this.totalCells; i++) {
      // Vertical lines
      const x = this.mapLeft + i * this.cellSize;
      quadGraphics.lineBetween(x, this.mapTop, x, this.mapTop + this.mapSize);
      
      // Horizontal lines
      const y = this.mapTop + i * this.cellSize;
      quadGraphics.lineBetween(this.mapLeft, y, this.mapLeft + this.mapSize, y);
    }
    
    // Center spawn indicator
    this.spawnGlow = this.add.circle(this.centerX, this.centerY, 18, 0xff4444, 0.4);
    this.mapContainer.add(this.spawnGlow);
    this.tweens.add({
      targets: this.spawnGlow,
      alpha: 0.1,
      scale: 1.5,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
    
    this.createPathArrows();
    this.createPlacementArea();
  }

  createCircularBattlefield(width, height) {
    // Compatibility wrapper - redirects to Tian
    return this.createTianBattlefield(width, height);
  }

  createInnerGrid() {
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x3a3a6a, 0.2);
    
    for (let r = 35; r < this.innerRadius; r += 35) {
      gridGraphics.strokeCircle(this.centerX, this.centerY, r);
    }
    
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
      const x1 = this.centerX + Math.cos(angle) * 15;
      const y1 = this.centerY + Math.sin(angle) * 15;
      const x2 = this.centerX + Math.cos(angle) * this.innerRadius;
      const y2 = this.centerY + Math.sin(angle) * this.innerRadius;
      gridGraphics.lineBetween(x1, y1, x2, y2);
    }
  }

  createPathArrows() {
    const arrowPositions = [
      { angle: 0, rotation: -Math.PI / 2 },
      { angle: Math.PI / 2, rotation: 0 },
      { angle: Math.PI, rotation: Math.PI / 2 },
      { angle: -Math.PI / 2, rotation: Math.PI }
    ];
    
    arrowPositions.forEach(pos => {
      const x = this.centerX + Math.cos(pos.angle) * this.pathRadius;
      const y = this.centerY + Math.sin(pos.angle) * this.pathRadius;
      const arrow = this.add.triangle(x, y, 0, -7, -5, 5, 5, 5, 0x4a9eff, 0.5);
      arrow.setRotation(pos.rotation);
    });
  }

  createPlacementArea() {
    const { width, height } = this.cameras.main;
    
    // Create large interactive zone for game world (game element)
    const placementZone = this.add.rectangle(this.centerX, this.centerY, width * 3, height * 3, 0x000000, 0);
    placementZone.setInteractive();
    placementZone.setDepth(1);
    this.addGameElement(placementZone);
    
    placementZone.on('pointerdown', (pointer) => {
      // Convert screen coordinates to world coordinates
      const world = this.screenToWorld(pointer.x, pointer.y);
      
      // Handle move mode first
      if (this.isMoveMode) {
        this.moveTowerTo(world.x, world.y);
      }
      // Then handle card placement
      else if (this.selectedCard !== null) {
        this.placeTowerFromCard(world.x, world.y);
      }
      // Otherwise hide tower info panel if clicking empty area
      else {
        this.hideTowerInfoPanel();
      }
    });
    
    // Grid overlay for placement mode (initially hidden) - game element
    this.gridOverlay = this.add.graphics();
    this.gridOverlay.setDepth(90);
    this.gridOverlay.setVisible(false);
    this.addGameElement(this.gridOverlay);
  }
  
  showGridOverlay() {
    if (!this.gridOverlay) return;
    
    this.gridOverlay.clear();
    this.gridOverlay.setVisible(true);
    
    // Draw all grid cells with color coding using virtual zoom/scroll
    this.gridCells.forEach(cell => {
      // Convert world coordinates to screen coordinates
      const screen = this.worldToScreen(cell.x, cell.y);
      const screenCellSize = this.cellSize * this.virtualZoom;
      
      if (cell.isPath) {
        // Path cells - red
        this.gridOverlay.fillStyle(0xff4444, 0.3);
      } else if (cell.occupied) {
        // Occupied cells - yellow
        this.gridOverlay.fillStyle(0xffeb3b, 0.3);
      } else {
        // Available cells - green
        this.gridOverlay.fillStyle(0x4caf50, 0.2);
      }
      
      this.gridOverlay.fillRect(
        screen.x - screenCellSize / 2,
        screen.y - screenCellSize / 2,
        screenCellSize,
        screenCellSize
      );
      
      // Draw cell border
      this.gridOverlay.lineStyle(1, 0xffffff, 0.5);
      this.gridOverlay.strokeRect(
        screen.x - screenCellSize / 2,
        screen.y - screenCellSize / 2,
        screenCellSize,
        screenCellSize
      );
    });
  }
  
  hideGridOverlay() {
    if (this.gridOverlay) {
      this.gridOverlay.setVisible(false);
    }
  }

  createUI(width, height) {
    // All UI elements are ignored by main camera (only seen by UI camera)
    // UI camera never zooms or scrolls, so UI stays fixed
    
    // ========== TOP BAR (Modern gradient design) ==========
    const topBarBg = this.add.graphics();
    topBarBg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a1a3a, 0x1a1a3a, 0.95);
    topBarBg.fillRect(0, 0, width, 130);
    topBarBg.setDepth(100);
    this.addUIElement(topBarBg);
    
    // Top bar accent line
    const topAccent = this.add.rectangle(width / 2, 130, width, 3, 0x4a9eff, 0.8);
    topAccent.setDepth(100);
    this.addUIElement(topAccent);
    
    // Back button (rounded, modern)
    const backBtn = new Button(this, 55, 45, '←', () => {
      this.showBackConfirmDialog();
    }, { width: 70, height: 55, color: 0x3a3a5a, fontSize: '32px', borderRadius: 12 });
    backBtn.setDepth(101);
    this.addUIElement(backBtn);
    
    // Gold panel (modern card style)
    const goldPanel = this.add.rectangle(width / 2 - 70, 45, 150, 55, 0x1a1a3a, 0.95);
    goldPanel.setStrokeStyle(2, 0xffd700, 0.8);
    goldPanel.setDepth(100);
    this.addUIElement(goldPanel);
    
    const goldIcon = this.add.circle(width / 2 - 135, 45, 18, 0xffd700);
    goldIcon.setDepth(101);
    this.addUIElement(goldIcon);
    
    this.goldText = this.add.text(width / 2 - 108, 45, `${this.battleState.gold}`, {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5).setDepth(101);
    this.addUIElement(this.goldText);
    
    // Score panel (modern card style)
    const scorePanel = this.add.rectangle(width / 2 + 85, 45, 170, 55, 0x1a1a3a, 0.95);
    scorePanel.setStrokeStyle(2, 0x4caf50, 0.8);
    scorePanel.setDepth(100);
    this.addUIElement(scorePanel);
    
    this.scoreText = this.add.text(width / 2 + 15, 45, `${this.battleState.score}`, {
      fontFamily: 'Arial Black',
      fontSize: '26px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5).setDepth(101);
    this.addUIElement(this.scoreText);
    
    // Multiplier
    this.multiplierText = this.add.text(width / 2 + 15, 45, ` (x${this.battleState.scoreMultiplier.toFixed(1)})`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffd700'
    }).setOrigin(0, 0.5).setDepth(101);
    this.addUIElement(this.multiplierText);
    
    // Position multiplier after creating score text
    this.updateScoreDisplay();
    
    // Wave and Timer panel (modern style)
    const timerPanel = this.add.rectangle(width / 2, 100, 300, 50, 0x0a2a4a, 0.95);
    timerPanel.setStrokeStyle(2, 0x4a9eff, 0.8);
    timerPanel.setDepth(100);
    this.addUIElement(timerPanel);
    
    this.waveText = this.add.text(width / 2 - 120, 100, `Wave ${this.battleState.currentWave}`, {
      fontFamily: 'Arial Black',
      fontSize: '22px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5).setDepth(101);
    this.addUIElement(this.waveText);
    
    this.timerText = this.add.text(width / 2 + 90, 100, `${this.battleState.waveTimer}s`, {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: '#4a9eff'
    }).setOrigin(0.5).setDepth(101);
    this.addUIElement(this.timerText);
    
    // Enemy count (prominent, at TOP next to wave info)
    const enemyPanel = this.add.rectangle(width / 2, 145, 220, 36, 0x3a1a1a, 0.95);
    enemyPanel.setStrokeStyle(2, 0xff6b6b, 0.8);
    enemyPanel.setDepth(100);
    this.addUIElement(enemyPanel);
    
    this.enemyCountText = this.add.text(width / 2, 145, `👾 0 / ${this.battleState.maxEnemies}`, {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#ff6b6b'
    }).setOrigin(0.5).setDepth(101);
    this.addUIElement(this.enemyCountText);
    
    // Warning timer panel
    this.warningPanel = this.add.rectangle(width / 2, height / 2 - 100, 360, 70, 0xff0000, 0.9);
    this.warningPanel.setStrokeStyle(4, 0xff4444);
    this.warningPanel.setDepth(200);
    this.warningPanel.setVisible(false);
    this.addUIElement(this.warningPanel);
    
    this.warningText = this.add.text(width / 2, height / 2 - 100, '', {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(201);
    this.warningText.setVisible(false);
    this.addUIElement(this.warningText);
    
    // ========== BOTTOM CONTROL AREA ==========
    this.createControlArea(width, height);
  }

  createControlArea(width, height) {
    // Sleek bottom panel background with gradient (increased height)
    const bottomBg = this.add.graphics();
    bottomBg.fillGradientStyle(0x0d1b2a, 0x0d1b2a, 0x1b263b, 0x1b263b, 0.98);
    bottomBg.fillRect(0, height - 200, width, 200);
    bottomBg.setDepth(100);
    this.addUIElement(bottomBg);
    
    // Top accent line (glowing effect)
    const bottomAccent = this.add.rectangle(width / 2, height - 200, width, 2, 0x00d4ff, 0.9);
    bottomAccent.setDepth(100);
    this.addUIElement(bottomAccent);
    
    // Control buttons row (positioned higher, above cards)
    const buttonY = height - 173;
    
    // Start button at map center bottom (modern neon style)
    const mapBottom = this.centerY + this.mapSize / 2;
    const startButtonScreen = this.worldToScreen(this.centerX, mapBottom);
    this.startButton = new Button(this, startButtonScreen.x, startButtonScreen.y - 30, '▶ START', () => {
      this.startGameWithEffect();
    }, { width: 140, height: 45, color: 0x00c853, fontSize: '18px', borderRadius: 8 });
    this.startButton.setDepth(102);
    this.addUIElement(this.startButton);
    
    // Pulsing animation for start button
    this.tweens.add({
      targets: this.startButton,
      scale: 1.05,
      duration: 600,
      yoyo: true,
      repeat: -1
    });
    
    // Random tower button (center-left)
    this.randomTowerButton = new Button(this, width / 2 - 75, buttonY, '🎲 Tower (20G)', () => {
      this.generateRandomTower();
    }, { width: 145, height: 40, color: 0x7b1fa2, fontSize: '15px', borderRadius: 8 });
    this.randomTowerButton.setDepth(102);
    this.addUIElement(this.randomTowerButton);
    
    // Sell mode button (center-right)
    this.sellModeButton = new Button(this, width / 2 + 75, buttonY, '💰 SELL', () => {
      this.startSellMode();
    }, { width: 110, height: 40, color: 0xe65100, fontSize: '15px', borderRadius: 8 });
    this.sellModeButton.setDepth(102);
    this.addUIElement(this.sellModeButton);
    
    // End sell mode button (hidden initially)
    this.endSellButton = new Button(this, width / 2 + 75, buttonY, '✕ EXIT', () => {
      this.endSellMode();
    }, { width: 110, height: 40, color: 0xc62828, fontSize: '14px', borderRadius: 8 });
    this.endSellButton.setVisible(false);
    this.endSellButton.setDepth(102);
    this.addUIElement(this.endSellButton);
    
    // Skip button (right side, hidden initially)
    this.skipButton = new Button(this, width - 75, buttonY, 'SKIP ⏭', () => {
      this.skipToNextWave();
    }, { width: 120, height: 40, color: 0xf57c00, fontSize: '15px', borderRadius: 8 });
    this.skipButton.setVisible(false);
    this.skipButton.setDepth(102);
    this.addUIElement(this.skipButton);
    
    // Tower card storage area
    this.createCardStorage(width, height);
  }

  createCardStorage(width, height) {
    const storageY = height - 70;
    const arrowWidth = 45;
    const arrowMargin = 8;
    
    // Calculate available space for cards
    const leftArrowEnd = arrowWidth + arrowMargin;
    const rightArrowStart = width - arrowWidth - arrowMargin;
    const availableWidth = rightArrowStart - leftArrowEnd;
    
    // Card slot dimensions (compact but visible)
    const slotWidth = 100;
    const slotSpacing = 112;
    
    // Fixed to 4 cards visible
    this.visibleCards = 4;
    const totalSlotsWidth = this.visibleCards * slotSpacing;
    const startX = leftArrowEnd + (availableWidth - totalSlotsWidth) / 2 + slotSpacing / 2;
    
    // Sleek scroll buttons
    this.scrollLeftBtn = new Button(this, arrowWidth / 2 + 3, storageY, '◀', () => {
      this.scrollCards(-1);
    }, { width: arrowWidth * 1.8, height: 100, color: 0x1b263b, fontSize: '28px', borderRadius: 6 });
    this.scrollLeftBtn.setDepth(103);
    this.addUIElement(this.scrollLeftBtn);
    
    this.scrollRightBtn = new Button(this, width - arrowWidth / 2 - 3, storageY, '▶', () => {
      this.scrollCards(1);
    }, { width: arrowWidth * 1.8, height: 100, color: 0x1b263b, fontSize: '28px', borderRadius: 6 });
    this.scrollRightBtn.setDepth(103);
    this.addUIElement(this.scrollRightBtn);
    
    // Card slots with sleek design
    this.cardSlots = [];
    this.cardVisuals = [];
    this.selectedCard = null;
    this.slotStartX = startX;
    this.slotSpacing = slotSpacing;
    this.storageY = storageY;
    
    for (let i = 0; i < this.visibleCards; i++) {
      const slotX = startX + i * slotSpacing;
      
      const slot = this.add.rectangle(slotX, storageY, slotWidth, 100, 0x0d1b2a, 0.95);
      slot.setStrokeStyle(2, 0x00d4ff, 0.4);
      slot.setDepth(101);
      slot.setInteractive({ useHandCursor: true });
      slot.slotIndex = i;
      this.addUIElement(slot);
      
      slot.on('pointerdown', () => {
        const actualIndex = this.cardScrollOffset + i;
        this.selectCard(actualIndex, i);
      });
      
      this.cardSlots.push(slot);
      this.cardVisuals.push(null);
    }
    
    // Card count indicator (compact, positioned above buttons)
    this.cardCountText = this.add.text(width / 2, storageY - 65, '0/100', {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#00d4ff',
      stroke: '#0d1b2a',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(101);
    this.addUIElement(this.cardCountText);
  }

  scrollCards(direction) {
    const maxOffset = Math.max(0, this.towerCards.length - this.visibleCards);
    this.cardScrollOffset = Phaser.Math.Clamp(this.cardScrollOffset + direction, 0, maxOffset);
    this.updateCardDisplay();
  }

  selectCard(actualIndex, visualIndex) {
    if (!this.towerCards[actualIndex]) return;
    
    // Check if in sell mode
    if (this.isSellMode) {
      this.sellCard(actualIndex);
      return;
    }
    
    // If clicking the same card, deselect it
    if (this.selectedCard === actualIndex) {
      this.deselectCard();
      return;
    }
    
    // Deselect all slots
    this.cardSlots.forEach(slot => {
      slot.setStrokeStyle(2, 0x4a9eff, 0.5);
    });
    
    // Select new card
    this.selectedCard = actualIndex;
    this.isCardSelected = true;
    
    if (visualIndex !== undefined && this.cardSlots[visualIndex]) {
      this.cardSlots[visualIndex].setStrokeStyle(3, 0x4caf50, 1);
    }
    
    // Show grid overlay
    this.showGridOverlay();
    
    // Disable tower interactions
    this.setTowerInteractivity(false);
    
    this.showMessage(`Selected: ${this.towerCards[actualIndex].name} - Tap arena to place`, this.towerCards[actualIndex].color);
  }

  deselectCard() {
    this.selectedCard = null;
    this.isCardSelected = false;
    
    // Hide grid overlay
    this.hideGridOverlay();
    
    // Reset all slot styles
    this.cardSlots.forEach(slot => {
      slot.setStrokeStyle(2, 0x4a9eff, 0.5);
    });
    
    // Re-enable tower interactions
    this.setTowerInteractivity(true);
    
    // Hide tower info panel if visible
    if (this.towerInfoPanel) {
      this.towerInfoPanel.setVisible(false);
    }
    
    this.showMessage('Card deselected', 0x888888);
  }

  setTowerInteractivity(enabled) {
    this.towers.forEach(tower => {
      if (enabled) {
        tower.setInteractive({ useHandCursor: true });
      } else {
        tower.disableInteractive();
        tower.hideRange();
      }
    });
  }

  generateRandomTower() {
    if (this.battleState.gold < 20) {
      this.showMessage('Not enough gold!', 0xff4444);
      return;
    }
    
    if (this.towerCards.length >= this.maxTowerCards) {
      this.showMessage('Card storage full!', 0xff9800);
      return;
    }
    
    this.battleState.gold -= 20;
    this.updateGoldDisplay();
    
    // Use weighted random based on GameConfig RARITY weights
    const totalWeight = Object.values(GameConfig.RARITY).reduce((sum, r) => sum + r.weight, 0);
    const rand = Math.random() * totalWeight;
    
    let cumWeight = 0;
    let selectedRarity = null;
    
    for (const [key, rarityData] of Object.entries(GameConfig.RARITY)) {
      cumWeight += rarityData.weight;
      if (rand <= cumWeight) {
        selectedRarity = rarityData;
        break;
      }
    }
    
    // Fallback to Common if something goes wrong
    if (!selectedRarity) {
      selectedRarity = GameConfig.RARITY.COMMON;
    }
    
    // Get a random card from CardDatabase of this rarity
    const rarityKey = selectedRarity.name.toLowerCase();
    const cardsOfRarity = CardDatabase.allCards[rarityKey];
    
    // If no cards found for this rarity, fallback to common
    if (!cardsOfRarity || cardsOfRarity.length === 0) {
      const commonCards = CardDatabase.allCards['common'];
      const card = Phaser.Utils.Array.GetRandom(commonCards);
      this.towerCards.push({ ...card });
      this.updateCardDisplay();
      this.showMessage(`Drew ${card.name} (Common)!`, 0x9e9e9e);
      return;
    }
    
    // Get random card from this rarity, prefer tower type
    const towerCards = cardsOfRarity.filter(c => c.type === 'tower');
    const card = towerCards.length > 0 
      ? Phaser.Utils.Array.GetRandom(towerCards)
      : Phaser.Utils.Array.GetRandom(cardsOfRarity);
    
    this.towerCards.push({ ...card });
    this.updateCardDisplay();
    this.showMessage(`Drew ${card.name} (${selectedRarity.name})!`, selectedRarity.color);
  }

  updateCardDisplay() {
    // Clear old visuals
    this.cardVisuals.forEach(v => { if (v) v.destroy(); });
    this.cardVisuals = [];
    
    // Create visuals for visible cards only
    for (let i = 0; i < this.visibleCards; i++) {
      const actualIndex = this.cardScrollOffset + i;
      const card = this.towerCards[actualIndex];
      
      if (!card) {
        this.cardVisuals.push(null);
        continue;
      }
      
      const slotX = this.slotStartX + i * this.slotSpacing;
      
      const visual = this.add.container(slotX, this.storageY);
      visual.setDepth(102);
      this.addUIElement(visual); // UI element - main camera ignores
      
      // Card visual (rarity-colored background, 94x94 to fit 100x100 slot)
      const bg = this.add.rectangle(0, 0, 94, 94, card.color, 0.95);
      bg.setStrokeStyle(2, 0xffffff, 0.8);
      visual.add(bg);
      
      // Inner glow effect
      const innerGlow = this.add.rectangle(0, 0, 88, 88, card.color, 0.3);
      visual.add(innerGlow);
      
      // Tower icon (small tower shape)
      const icon = this.add.rectangle(0, -18, 20, 22, 0xffffff, 0.9);
      icon.setStrokeStyle(1, 0x000000, 0.5);
      visual.add(icon);
      
      // Name text (1.8x larger font)
      const nameText = this.add.text(0, 8, card.name.substring(0, 6), {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      visual.add(nameText);
      
      // Damage text (1.8x larger font)
      const dmgText = this.add.text(0, 28, `⚔${card.damage}`, {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: '#ffcc00',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      visual.add(dmgText);
      
      this.cardVisuals.push(visual);
      
      // Highlight if selected
      if (actualIndex === this.selectedCard) {
        this.cardSlots[i].setStrokeStyle(3, 0x00ff88, 1);
      } else {
        this.cardSlots[i].setStrokeStyle(2, 0x00d4ff, 0.4);
      }
    }
    
    // Update card count
    if (this.cardCountText) {
      this.cardCountText.setText(`${this.towerCards.length}/${this.maxTowerCards}`);
    }
  }

  placeTowerFromCard(x, y) {
    if (this.selectedCard === null || !this.towerCards[this.selectedCard]) return;
    
    // Snap to grid system
    const snappedCell = this.getClosestGridCell(x, y);
    
    if (!snappedCell) {
      this.showMessage('Invalid placement area!', 0xff4444);
      return;
    }
    
    if (snappedCell.isPath) {
      this.showMessage('Cannot place on path!', 0xff4444);
      return;
    }
    
    if (snappedCell.occupied) {
      this.showMessage('Cell already occupied!', 0xff9800);
      return;
    }
    
    const cardData = this.towerCards[this.selectedCard];
    const tower = new Tower(this, snappedCell.x, snappedCell.y, cardData);
    tower.worldX = snappedCell.x;
    tower.worldY = snappedCell.y;
    const screen = this.worldToScreen(tower.worldX, tower.worldY);
    tower.x = screen.x;
    tower.y = screen.y;
    tower.setScale(this.virtualZoom); // Set initial scale based on current zoom
    tower.gridCell = snappedCell;
    snappedCell.occupied = true;
    
    // Store original cell for returning if placement fails
    let originalCell = snappedCell;
    
    // Make tower draggable after placement
    tower.setInteractive({ draggable: true, useHandCursor: true });
    
    tower.on('drag', (pointer, dragX, dragY) => {
      // Convert screen to world coordinates
      const world = this.screenToWorld(pointer.x, pointer.y);
      tower.worldX = world.x;
      tower.worldY = world.y;
      const screen = this.worldToScreen(tower.worldX, tower.worldY);
      tower.x = screen.x;
      tower.y = screen.y;
      tower.setAlpha(0.6);
    });
    
    tower.on('dragstart', () => {
      // Save current cell as original
      originalCell = tower.gridCell;
      // Free up current cell
      if (tower.gridCell) {
        tower.gridCell.occupied = false;
      }
      tower.showRange();
      // Keep scale consistent with zoom, just slightly larger
      tower.setScale(this.virtualZoom * 1.1);
    });
    
    tower.on('dragend', (pointer, dragX, dragY) => {
      // Convert screen to world coordinates
      const world = this.screenToWorld(pointer.x, pointer.y);
      // Snap to grid on drop
      const newCell = this.getClosestGridCell(world.x, world.y);
      
      if (newCell && !newCell.isPath && !newCell.occupied) {
        tower.worldX = newCell.x;
        tower.worldY = newCell.y;
        const screen = this.worldToScreen(tower.worldX, tower.worldY);
        tower.x = screen.x;
        tower.y = screen.y;
        tower.gridCell = newCell;
        newCell.occupied = true;
      } else {
        // Return to original position
        tower.worldX = originalCell.x;
        tower.worldY = originalCell.y;
        const screen = this.worldToScreen(tower.worldX, tower.worldY);
        tower.x = screen.x;
        tower.y = screen.y;
        tower.gridCell = originalCell;
        originalCell.occupied = true;
        this.showMessage('Invalid placement!', 0xff4444);
      }
      
      tower.setAlpha(1);
      tower.hideRange();
      tower.setScale(this.virtualZoom);
    });
    
    // Add tower to game elements (not affected by UI camera)
    this.addGameElement(tower);
    this.towers.push(tower);
    
    // Remove card from storage
    this.towerCards.splice(this.selectedCard, 1);
    this.selectedCard = null;
    this.isCardSelected = false;
    
    // Hide grid overlay
    this.hideGridOverlay();
    
    // Re-enable tower interactions
    this.setTowerInteractivity(true);
    
    // Adjust scroll offset if needed
    if (this.cardScrollOffset > 0 && this.towerCards.length <= this.cardScrollOffset) {
      this.cardScrollOffset = Math.max(0, this.towerCards.length - this.visibleCards);
    }
    
    this.updateCardDisplay();
    
    // Animation
    this.tweens.add({
      targets: tower,
      scale: { from: 0, to: 1 },
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    this.showMessage('Tower placed!', 0x4caf50);
  }

  // ========== TOWER INFO PANEL ==========
  showTowerInfoPanel(tower) {
    if (this.isCardSelected || this.isMoveMode) return;
    
    const { width, height } = this.cameras.main;
    
    // Remove existing panel
    if (this.towerInfoPanel) {
      this.towerInfoPanel.destroy();
    }
    
    this.selectedTower = tower;
    
    // Center panel on screen
    const panelX = width / 2;
    const panelY = height / 2;
    const panelWidth = 640; // 2x original size
    const panelHeight = 560; // 2x original size
    
    // Create info panel - UI element with highest depth (above projectiles)
    this.towerInfoPanel = this.add.container(panelX, panelY);
    this.towerInfoPanel.setDepth(250); // Above projectiles (40-50) and game elements
    this.addUIElement(this.towerInfoPanel);
    
    // Background (modern style)
    const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x1a1a3a, 0.98);
    bg.setStrokeStyle(4, tower.bodyColor, 0.9);
    this.towerInfoPanel.add(bg);
    
    // Tower name
    const towerName = tower.cardData.name || 'Tower';
    const nameText = this.add.text(0, -190, towerName, {
      fontFamily: 'Arial Black',
      fontSize: '56px',
      color: `#${tower.bodyColor.toString(16).padStart(6, '0')}`,
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
    this.towerInfoPanel.add(nameText);
    
    // Rarity badge
    const rarityText = this.add.text(0, -120, tower.cardData.rarity || 'Normal', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#aaaaaa',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.towerInfoPanel.add(rarityText);
    
    // Stats (larger font)
    const statsText = this.add.text(0, -20, 
      `Damage: ${tower.getDamage()}\nRange: ${tower.getRange()}\nSpeed: ${(1000/tower.getAttackSpeed()).toFixed(1)}/s\nLevel: ${tower.level}`, {
      fontFamily: 'Arial',
      fontSize: '40px',
      color: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.towerInfoPanel.add(statsText);
    
    // Special ability text
    if (tower.cardData.special) {
      const specialText = this.add.text(0, 100, `Special: ${tower.cardData.special}`, {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
      this.towerInfoPanel.add(specialText);
    }
    
    // Button row
    const buttonY = 150; // Moved up to prevent overflow
    
    // Upgrade button (new) - moved left
    const upgradeBtn = new Button(this, -230, buttonY, '⬆ Upgrade', () => {
      this.showUpgradePanel(tower);
    }, { width: 220, height: 100, color: 0x4caf50, fontSize: '32px' });
    upgradeBtn.setDepth(91);
    this.towerInfoPanel.add(upgradeBtn);
    
    // Move button (larger) - moved right
    const moveBtn = new Button(this, 30, buttonY, '🔄 Move', () => {
      this.startMoveMode(tower);
    }, { width: 220, height: 100, color: 0x2196f3, fontSize: '32px' });
    moveBtn.setDepth(91);
    this.towerInfoPanel.add(moveBtn);
    
    // Close button (larger) - moved right to compensate for button spacing
    const closeBtn = new Button(this, 230, buttonY, '✕', () => {
      this.hideTowerInfoPanel();
    }, { width: 80, height: 50, color: 0x666666, fontSize: '20px' });
    closeBtn.setDepth(251);
    this.towerInfoPanel.add(closeBtn);
    
    // Show tower range
    tower.showRange();
  }

  hideTowerInfoPanel() {
    if (this.towerInfoPanel) {
      this.towerInfoPanel.destroy();
      this.towerInfoPanel = null;
    }
    if (this.selectedTower) {
      this.selectedTower.hideRange();
      this.selectedTower = null;
    }
  }

  // ========== ENEMY INFO ==========
  showEnemyInfo(enemy) {
    // Don't show info for dead/destroyed enemies
    if (!enemy || enemy.isDead || !enemy.active || !enemy.scene) {
      return;
    }
    
    // Hide any existing enemy info
    this.hideEnemyInfo();
    
    // Convert enemy world position to screen position
    const screen = this.worldToScreen(enemy.worldX, enemy.worldY);
    
    // Create info tooltip
    this.enemyInfoTooltip = this.add.container(screen.x, screen.y - 60);
    this.enemyInfoTooltip.setDepth(1000);
    this.addUIElement(this.enemyInfoTooltip);
    
    // Background
    const bg = this.add.rectangle(0, 0, 180, 100, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(3, enemy.bodyColor || 0xf44336);
    this.enemyInfoTooltip.add(bg);
    
    // Enemy name
    const typeName = enemy.enemyType.charAt(0).toUpperCase() + enemy.enemyType.slice(1);
    const nameText = this.add.text(0, -35, typeName, {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    this.enemyInfoTooltip.add(nameText);
    
    // HP info
    const hpText = this.add.text(0, -10, `HP: ${Math.ceil(enemy.health)} / ${enemy.maxHealth}`, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#4caf50',
      align: 'center'
    }).setOrigin(0.5);
    this.enemyInfoTooltip.add(hpText);
    
    // Speed info
    const speedText = this.add.text(0, 10, `Speed: ${enemy.speed.toFixed(1)}`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#00bcd4',
      align: 'center'
    }).setOrigin(0.5);
    this.enemyInfoTooltip.add(speedText);
    
    // Gold reward
    const goldText = this.add.text(0, 30, `💰 ${enemy.goldValue}g`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffd700',
      align: 'center'
    }).setOrigin(0.5);
    this.enemyInfoTooltip.add(goldText);
    
    // Store enemy reference for updates
    this.enemyInfoTarget = enemy;
  }

  hideEnemyInfo() {
    if (this.enemyInfoTooltip) {
      this.enemyInfoTooltip.destroy();
      this.enemyInfoTooltip = null;
      this.enemyInfoTarget = null;
    }
  }

  // ========== UPGRADE SYSTEM ==========
  showUpgradePanel(tower) {
    this.hideTowerInfoPanel();
    
    const { width, height } = this.cameras.main;
    
    // Count same tower cards from storage
    const sameStoredCards = this.towerCards.filter(card => card.id === tower.cardData.id);
    // Count same tower type from placed towers on map
    const sameMapTowers = this.towers.filter(t => t.cardData && t.cardData.id === tower.cardData.id);
    // Total count = stored cards + map towers
    const sameCount = sameStoredCards.length + sameMapTowers.length;
    const canUpgrade = sameCount >= 5;
    
    // Create upgrade panel
    this.upgradePanel = this.add.container(width / 2, height / 2);
    this.upgradePanel.setDepth(300);
    this.addUIElement(this.upgradePanel);
    
    // Background
    const bg = this.add.rectangle(0, 0, 420, 400, 0x1a1a2e, 0.98);
    bg.setStrokeStyle(5, tower.bodyColor, 1);
    this.upgradePanel.add(bg);
    
    // Title
    const titleText = this.add.text(0, -160, `Merge Upgrade System`, {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.upgradePanel.add(titleText);
    
    // Current tower info
    const towerInfo = this.add.text(0, -110, `${tower.cardData.name} (${tower.cardData.rarity})`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: `#${tower.bodyColor.toString(16).padStart(6, '0')}`,
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.upgradePanel.add(towerInfo);
    
    // Card count display (show breakdown)
    const countColor = canUpgrade ? '#4caf50' : '#ff4444';
    const countText = this.add.text(0, -70, `Total: ${sameCount} / 5 (Map: ${sameMapTowers.length}, Cards: ${sameStoredCards.length})`, {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: countColor,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.upgradePanel.add(countText);
    
    // Explanation
    const explainText = this.add.text(0, -30, 
      'Collect 5 identical towers (map + cards)\\nto merge them into one random tower\\nof the next rarity tier!', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#aaaaaa',
      align: 'center'
    }).setOrigin(0.5);
    this.upgradePanel.add(explainText);
    
    // Upgrade/Merge button
    if (canUpgrade) {
      const upgradeBtn = new Button(this, 0, 50, '✨ MERGE UPGRADE ✨\\n(5 Cards → 1 Higher Tier)', () => {
        this.performMergeUpgrade(tower);
      }, { width: 360, height: 80, color: 0x4caf50, fontSize: '18px' });
      upgradeBtn.setDepth(301);
      this.upgradePanel.add(upgradeBtn);
    } else {
      const disabledBtn = this.add.rectangle(0, 50, 360, 80, 0x555555, 0.8);
      disabledBtn.setStrokeStyle(3, 0x333333);
      this.upgradePanel.add(disabledBtn);
      
      const disabledText = this.add.text(0, 50, `Need ${5 - sameCount} more cards`, {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#888888'
      }).setOrigin(0.5);
      this.upgradePanel.add(disabledText);
    }
    
    // Close button
    const closeBtn = new Button(this, 0, 150, '← Back', () => {
      this.hideUpgradePanel();
      this.showTowerInfoPanel(tower);
    }, { width: 200, height: 50, color: 0x666666, fontSize: '18px' });
    closeBtn.setDepth(301);
    this.upgradePanel.add(closeBtn);
  }
  
  performMergeUpgrade(tower) {
    // Find and remove 5 matching items (from both map and storage)
    const targetId = tower.cardData.id;
    let removed = 0;
    
    // First, remove from stored cards
    for (let i = this.towerCards.length - 1; i >= 0 && removed < 5; i--) {
      if (this.towerCards[i].id === targetId) {
        this.towerCards.splice(i, 1);
        removed++;
      }
    }
    
    // Then, remove from map towers if still need more
    for (let i = this.towers.length - 1; i >= 0 && removed < 5; i--) {
      if (this.towers[i].cardData && this.towers[i].cardData.id === targetId) {
        // Don't remove the selected tower being upgraded
        if (this.towers[i] === tower) continue;
        
        // Remove tower from map
        this.towers[i].destroy();
        this.towers.splice(i, 1);
        removed++;
      }
    }
    
    if (removed < 5) {
      this.showMessage('Not enough cards!', 0xff4444);
      return;
    }
    
    // Get next tier rarity
    const currentRarity = tower.cardData.rarity;
    const nextRarity = this.getNextRarity(currentRarity);
    
    if (!nextRarity) {
      this.showMessage('Already max rarity!', 0xffd700);
      // Refund cards
      for (let i = 0; i < 5; i++) {
        this.towerCards.push({ ...tower.cardData });
      }
      return;
    }
    
    // Get random tower card of next rarity
    const nextTierCard = this.getRandomCardByRarity(nextRarity);
    
    if (nextTierCard) {
      this.towerCards.push(nextTierCard);
      this.updateCardDisplay();
      this.showMessage(`Merged! Got ${nextTierCard.name} (${nextRarity})!`, 0x4caf50);
      this.hideUpgradePanel();
    } else {
      this.showMessage('Upgrade failed!', 0xff4444);
    }
  }
  
  getNextRarity(currentRarity) {
    const rarityOrder = ['Common', 'Uncommon', 'Enhanced', 'Rare', 'Superior', 'Epic', 'Mythic', 'Legendary', 'Ancient', 'Divine'];
    const currentIndex = rarityOrder.indexOf(currentRarity);
    if (currentIndex === -1 || currentIndex === rarityOrder.length - 1) return null;
    return rarityOrder[currentIndex + 1];
  }
  
  getRandomCardByRarity(rarity) {
    // Import CardDatabase if needed
    const allCards = CardDatabase.allCards[rarity.toLowerCase()] || CardDatabase.allCards[rarity];
    if (!allCards || allCards.length === 0) return null;
    
    const towerCards = allCards.filter(card => card.type === 'tower');
    if (towerCards.length === 0) return null;
    
    return Phaser.Utils.Array.GetRandom(towerCards);
  }

  hideUpgradePanel() {
    if (this.upgradePanel) {
      this.upgradePanel.destroy();
      this.upgradePanel = null;
    }
  }

  // ========== MOVE MODE ==========
  
  startSellMode() {
    if (this.isSellMode || this.isMoveMode || this.isCardSelected) return;
    
    this.isSellMode = true;
    
    // Hide normal buttons, show end sell button
    this.randomTowerButton.setVisible(false);
    this.sellModeButton.setVisible(false);
    this.endSellButton.setVisible(true);
    
    // Add glow effect to towers
    this.towers.forEach(tower => {
      tower.setTint(0xffff00); // Yellow tint
    });
    
    // Add glow effect to cards
    this.updateCardDisplay();
    
    this.showMessage('Sell Mode: Click towers or cards to sell', 0xffd700);
  }
  
  endSellMode() {
    if (!this.isSellMode) return;
    
    this.isSellMode = false;
    
    // Restore buttons
    this.randomTowerButton.setVisible(true);
    this.sellModeButton.setVisible(true);
    this.endSellButton.setVisible(false);
    
    // Remove tint from towers
    this.towers.forEach(tower => {
      tower.clearTint();
    });
    
    // Refresh card display
    this.updateCardDisplay();
    
    this.showMessage('Sell Mode ended', 0x888888);
  }
  
  sellTower(tower) {
    if (!this.isSellMode) return;
    
    // Calculate sell value (50% of tower's worth)
    const sellValue = Math.floor(50 + tower.level * 25);
    
    // Add gold
    this.battleState.gold += sellValue;
    this.updateGoldDisplay();
    
    // Free up grid cell
    if (tower.gridCell) {
      tower.gridCell.occupied = false;
    }
    
    // Remove tower
    const index = this.towers.indexOf(tower);
    if (index > -1) {
      this.towers.splice(index, 1);
    }
    
    tower.destroy();
    
    this.showMessage(`Sold for ${sellValue} gold!`, 0x4caf50);
  }
  
  sellCard(cardIndex) {
    if (!this.isSellMode) return;
    if (cardIndex < 0 || cardIndex >= this.towerCards.length) return;
    
    const card = this.towerCards[cardIndex];
    
    // Calculate sell value based on rarity
    const rarityValues = {
      'Common': 10,
      'Uncommon': 25,
      'Enhanced': 50,
      'Rare': 100,
      'Superior': 200,
      'Epic': 400,
      'Mythic': 800,
      'Legendary': 1600,
      'Ancient': 3200,
      'Divine': 6400
    };
    
    const sellValue = rarityValues[card.rarity] || 10;
    
    // Add gold
    this.battleState.gold += sellValue;
    this.updateGoldDisplay();
    
    // Remove card
    this.towerCards.splice(cardIndex, 1);
    
    // Adjust scroll if needed
    if (this.cardScrollOffset > 0 && this.towerCards.length <= this.cardScrollOffset) {
      this.cardScrollOffset = Math.max(0, this.towerCards.length - this.visibleCards);
    }
    
    this.updateCardDisplay();
    this.showMessage(`Sold card for ${sellValue} gold!`, 0x4caf50);
  }

  // ========== MOVE MODE ==========
  startMoveMode(tower) {
    this.isMoveMode = true;
    this.movingTower = tower;
    
    this.hideTowerInfoPanel();
    
    // Show grid overlay
    this.showGridOverlay();
    
    // Disable all tower interactions
    this.setTowerInteractivity(false);
    
    // Show the tower's range
    tower.showRange();
    tower.setScale(1.1);
    
    // Create cancel button
    const { width, height } = this.cameras.main;
    this.moveCancelBtn = new Button(this, width / 2, height - 200, '✕ Cancel Move', () => {
      this.cancelMoveMode();
    }, { width: 150, height: 45, color: 0xff4444, fontSize: '16px' });
    this.moveCancelBtn.setDepth(250);
    
    this.showMessage('Tap arena to move tower', 0x2196f3);
  }

  cancelMoveMode() {
    if (!this.isMoveMode) return;
    
    this.isMoveMode = false;
    
    // Hide grid overlay
    this.hideGridOverlay();
    
    if (this.movingTower) {
      this.movingTower.hideRange();
      this.movingTower.setScale(1);
      this.movingTower = null;
    }
    
    if (this.moveCancelBtn) {
      this.moveCancelBtn.destroy();
      this.moveCancelBtn = null;
    }
    
    // Re-enable tower interactions
    this.setTowerInteractivity(true);
    
    this.showMessage('Move cancelled', 0x888888);
  }

  getClosestGridCell(x, y) {
    // Find closest grid cell to given coordinates
    let closest = null;
    let minDist = Infinity;
    
    this.gridCells.forEach(cell => {
      const dist = Phaser.Math.Distance.Between(x, y, cell.x, cell.y);
      if (dist < minDist) {
        minDist = dist;
        closest = cell;
      }
    });
    
    // Only return if within reasonable distance (1.5 cells)
    if (minDist < this.cellSize * 1.5) {
      return closest;
    }
    
    return null;
  }

  moveTowerTo(x, y) {
    if (!this.isMoveMode || !this.movingTower) return false;
    
    // Snap to grid
    const newCell = this.getClosestGridCell(x, y);
    
    if (!newCell) {
      this.showMessage('Invalid placement area!', 0xff4444);
      return false;
    }
    
    if (newCell.isPath) {
      this.showMessage('Cannot place on path!', 0xff4444);
      return false;
    }
    
    if (newCell.occupied && newCell !== this.movingTower.gridCell) {
      this.showMessage('Cell already occupied!', 0xff9800);
      return false;
    }
    
    // Free up old cell
    if (this.movingTower.gridCell) {
      this.movingTower.gridCell.occupied = false;
    }
    
    // Update world position
    this.movingTower.worldX = newCell.x;
    this.movingTower.worldY = newCell.y;
    
    // Convert to screen coordinates for animation
    const targetScreen = this.worldToScreen(newCell.x, newCell.y);
    
    // Move tower with animation
    this.tweens.add({
      targets: this.movingTower,
      x: targetScreen.x,
      y: targetScreen.y,
      duration: 200,
      ease: 'Cubic.easeOut'
    });
    
    // Update grid cell
    this.movingTower.gridCell = newCell;
    newCell.occupied = true;
    
    // End move mode
    this.movingTower.hideRange();
    this.movingTower.setScale(this.virtualZoom); // Restore proper scale
    this.movingTower = null;
    this.isMoveMode = false;
    
    // Hide grid overlay
    this.hideGridOverlay();
    
    if (this.moveCancelBtn) {
      this.moveCancelBtn.destroy();
      this.moveCancelBtn = null;
    }
    
    // Re-enable tower interactions
    this.setTowerInteractivity(true);
    
    this.showMessage('Tower moved!', 0x4caf50);
    return true;
  }

  startGameWithEffect() {
    if (this.battleState.gameStarted) return;
    this.battleState.gameStarted = true;
    
    const { width, height } = this.cameras.main;
    
    // Hide start button
    this.startButton.setVisible(false);
    
    // ===== DRAMATIC START EFFECT =====
    
    // Flash
    this.cameras.main.flash(300, 255, 255, 255);
    
    // Big text
    const startText = this.add.text(width / 2, height / 2, 'WAVE 1', {
      fontFamily: 'Arial Black',
      fontSize: '72px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5).setScale(0).setDepth(200);
    
    // Zoom in text
    this.tweens.add({
      targets: startText,
      scale: 1.2,
      duration: 400,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: startText,
          alpha: 0,
          scale: 2,
          duration: 500,
          onComplete: () => startText.destroy()
        });
      }
    });
    
    // Shockwave effect
    const shockwave = this.add.circle(width / 2, height / 2, 50, 0x4a9eff, 0.5);
    shockwave.setDepth(199);
    
    this.tweens.add({
      targets: shockwave,
      scale: 15,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => shockwave.destroy()
    });
    
    // Camera shake
    this.cameras.main.shake(300, 0.01);
    
    // Start battle after effect
    this.time.delayedCall(600, () => {
      this.startWave();
    });
  }

  startWave() {
    if (this.battleState.timerRunning) return;
    
    this.battleState.timerRunning = true;
    this.skipButton.setVisible(true);
    
    this.spawnWaveEnemies();
    
    this.waveTimerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateWaveTimer,
      callbackScope: this,
      repeat: this.battleState.waveTimer - 1
    });
  }

  updateWaveTimer() {
    this.battleState.waveTimer--;
    this.timerText.setText(`${this.battleState.waveTimer}s`);
    
    // When timer reaches 0, reset multiplier
    if (this.battleState.waveTimer === 0) {
      this.battleState.scoreMultiplier = 1.0;
      this.updateScoreDisplay();
    }
    
    // Flash timer when low
    if (this.battleState.waveTimer <= 5) {
      this.timerText.setColor('#ff4444');
      this.tweens.add({
        targets: this.timerText,
        scale: 1.2,
        duration: 100,
        yoyo: true
      });
    }
    
    if (this.battleState.waveTimer <= 0) {
      this.nextWave();
    }
  }

  skipToNextWave() {
    this.battleState.scoreMultiplier += 0.5;
    this.multiplierText.setText(`x${this.battleState.scoreMultiplier.toFixed(1)}`);
    
    this.tweens.add({
      targets: this.multiplierText,
      scale: 1.4,
      duration: 200,
      yoyo: true
    });
    
    this.showMessage('+0.5x Multiplier!', 0x4caf50);
    
    if (this.waveTimerEvent) this.waveTimerEvent.destroy();
    this.nextWave();
  }

  nextWave() {
    this.battleState.currentWave++;
    this.battleState.waveTimer = 30;
    this.waveText.setText(`Wave ${this.battleState.currentWave}`);
    this.timerText.setText(`${this.battleState.waveTimer}s`);
    this.timerText.setColor('#4a9eff');
    
    // Wave start effect
    const { width, height } = this.cameras.main;
    const waveText = this.add.text(width / 2, height / 2 - 50, `WAVE ${this.battleState.currentWave}`, {
      fontFamily: 'Arial Black',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(200);
    
    // Boss wave announcement
    const isBossWave = this.battleState.currentWave % 10 === 0;
    if (isBossWave) {
      waveText.setText(`⚠ BOSS WAVE ${this.battleState.currentWave} ⚠`);
      waveText.setColor('#ff4444');
      this.cameras.main.shake(300, 0.015);
    }
    
    this.tweens.add({
      targets: waveText,
      alpha: 0,
      y: waveText.y - 80,
      duration: 1000,
      onComplete: () => waveText.destroy()
    });
    
    this.spawnWaveEnemies();
    
    this.waveTimerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateWaveTimer,
      callbackScope: this,
      repeat: this.battleState.waveTimer - 1
    });
  }

  spawnWaveEnemies() {
    const wave = this.battleState.currentWave;
    const isBossWave = wave % 10 === 0;
    
    // Boss waves: spawn only 1 boss
    if (isBossWave) {
      this.spawnBoss();
      return;
    }
    
    // Regular waves: 20 enemies
    const enemyCount = 20;
    const spawnDelay = Math.max(300, 1500 - wave * 50);
    
    let spawned = 0;
    
    this.spawnEvent = this.time.addEvent({
      delay: spawnDelay,
      callback: () => {
        if (spawned < enemyCount && !this.battleState.isGameOver) {
          this.spawnEnemy();
          spawned++;
        }
      },
      repeat: enemyCount - 1
    });
  }

  spawnEnemy() {
    const wave = this.battleState.currentWave;
    let enemyType = 'normal';
    
    if (wave >= 10) {
      enemyType = Phaser.Utils.Array.GetRandom(['normal', 'fast', 'tank', 'flying']);
    } else if (wave >= 5) {
      enemyType = Phaser.Utils.Array.GetRandom(['normal', 'fast', 'tank']);
    } else if (wave >= 3) {
      enemyType = Phaser.Utils.Array.GetRandom(['normal', 'fast']);
    }
    
    // Get base data from EnemyDatabase.enemies
    const baseData = EnemyDatabase.enemies[enemyType] || EnemyDatabase.enemies.normal;
    const enemyData = { ...baseData };
    // Increased scaling: 35% health per wave (was 15%), 20% gold per wave (was 10%)
    enemyData.health = Math.floor(enemyData.health * (1 + wave * 0.35));
    enemyData.goldValue = Math.floor(enemyData.goldValue * (1 + wave * 0.2));
    enemyData.scoreValue = Math.floor(enemyData.scoreValue * (1 + wave * 0.2));
    
    // Create enemy at first path point
    const enemy = new Enemy(this, this.pathPoints, enemyData);
    // Enemy uses worldX/worldY for movement logic, x/y for display
    enemy.worldX = this.pathPoints[0].x;
    enemy.worldY = this.pathPoints[0].y;
    const screen = this.worldToScreen(enemy.worldX, enemy.worldY);
    enemy.x = screen.x;
    enemy.y = screen.y;
    enemy.setScale(this.virtualZoom);
    enemy.isCircularPath = true;
    
    enemy.onDeath = () => {
      this.battleState.gold += enemyData.goldValue;
      this.battleState.score += Math.floor(enemyData.scoreValue * this.battleState.scoreMultiplier);
      this.updateGoldDisplay();
      this.updateScoreDisplay();
    };
    
    // Add enemy to game elements (affected by camera zoom)
    this.addGameElement(enemy);
    this.enemies.push(enemy);
    this.updateEnemyCount();
  }

  spawnBoss() {
    const wave = this.battleState.currentWave;
    
    // Create boss data with increased scaling (200 health per wave instead of 100)
    const bossData = {
      type: 'boss',
      health: 500 + wave * 200,
      speed: 40,
      damage: 0,
      goldValue: 100 + wave * 30,
      scoreValue: 500 + wave * 75
    };
    
    const enemy = new Enemy(this, this.pathPoints, bossData);
    // Boss uses worldX/worldY for movement logic, x/y for display
    enemy.worldX = this.pathPoints[0].x;
    enemy.worldY = this.pathPoints[0].y;
    const screen = this.worldToScreen(enemy.worldX, enemy.worldY);
    enemy.x = screen.x;
    enemy.y = screen.y;
    enemy.setScale(this.virtualZoom);
    enemy.isCircularPath = true;
    
    enemy.onDeath = () => {
      this.battleState.gold += bossData.goldValue;
      this.battleState.score += Math.floor(bossData.scoreValue * this.battleState.scoreMultiplier);
      this.updateGoldDisplay();
      this.updateScoreDisplay();
      this.showMessage('BOSS DEFEATED!', 0xffd700);
    };
    
    // Add boss to game elements (affected by camera zoom)
    this.addGameElement(enemy);
    this.enemies.push(enemy);
    this.updateEnemyCount();
    
    // Boss spawn effect
    const { width, height } = this.cameras.main;
    const bossText = this.add.text(width / 2, height / 2, '💀 BOSS SPAWNED 💀', {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(200);
    this.addUIElement(bossText);
    
    this.tweens.add({
      targets: bossText,
      alpha: 0,
      scale: 1.5,
      duration: 1500,
      onComplete: () => bossText.destroy()
    });
    
    this.cameras.main.shake(500, 0.02);
  }

  updateGoldDisplay() {
    this.goldText.setText(`${this.battleState.gold}`);
  }

  updateScoreDisplay() {
    this.scoreText.setText(`${this.battleState.score}`);
    // Update multiplier text and position it right after score
    this.multiplierText.setText(` (x${this.battleState.scoreMultiplier.toFixed(1)})`);
    this.multiplierText.setPosition(
      this.scoreText.x + this.scoreText.width,
      this.scoreText.y
    );
  }

  updateEnemyCount() {
    const count = this.enemies.filter(e => !e.isDead).length;
    this.enemyCountText.setText(`👾 ${count} / ${this.battleState.maxEnemies}`);
    
    // Color based on count
    if (count >= this.battleState.maxEnemies) {
      this.enemyCountText.setColor('#ff0000');
    } else if (count >= this.battleState.maxEnemies * 0.8) {
      this.enemyCountText.setColor('#ff4444');
    } else if (count >= this.battleState.maxEnemies * 0.5) {
      this.enemyCountText.setColor('#ff9800');
    } else {
      this.enemyCountText.setColor('#ff6b6b');
    }
    
    // Start warning timer when at 200 enemies
    if (count >= this.battleState.maxEnemies && !this.battleState.warningActive) {
      this.startWarningTimer();
    }
    
    // Cancel warning if below 200
    if (count < this.battleState.maxEnemies && this.battleState.warningActive) {
      this.cancelWarningTimer();
    }
  }

  startWarningTimer() {
    this.battleState.warningActive = true;
    this.battleState.warningTimer = 10;
    
    this.warningPanel.setVisible(true);
    this.warningText.setVisible(true);
    this.warningText.setText(`⚠ TOO MANY ENEMIES! ${this.battleState.warningTimer}s ⚠`);
    
    // Flashing effect
    this.tweens.add({
      targets: this.warningPanel,
      alpha: 0.5,
      duration: 300,
      yoyo: true,
      repeat: -1
    });
    
    this.cameras.main.shake(200, 0.01);
    
    this.warningTimerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.battleState.warningTimer--;
        this.warningText.setText(`⚠ TOO MANY ENEMIES! ${this.battleState.warningTimer}s ⚠`);
        
        if (this.battleState.warningTimer <= 0) {
          this.gameOver();
        }
      },
      repeat: 9
    });
  }

  cancelWarningTimer() {
    this.battleState.warningActive = false;
    
    this.warningPanel.setVisible(false);
    this.warningText.setVisible(false);
    
    if (this.warningTimerEvent) {
      this.warningTimerEvent.destroy();
    }
    
    this.tweens.killTweensOf(this.warningPanel);
    this.warningPanel.setAlpha(1);
    
    this.showMessage('Danger averted!', 0x4caf50);
  }

  showMessage(text, color = 0xffffff) {
    const { width, height } = this.cameras.main;
    
    const message = this.add.text(width / 2, height / 2 - 120, text, {
      fontFamily: 'Arial Black',
      fontSize: '26px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(150);
    this.addUIElement(message); // UI element
    
    this.tweens.add({
      targets: message,
      y: message.y - 40,
      alpha: 0,
      duration: 1200,
      onComplete: () => message.destroy()
    });
  }
  
  showBackConfirmDialog() {
    const { width, height } = this.cameras.main;
    
    // Dim background
    const dimBg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    dimBg.setDepth(300);
    dimBg.setInteractive();
    this.addUIElement(dimBg);
    
    // Dialog box (modern style)
    const dialogBg = this.add.rectangle(width / 2, height / 2, 360, 220, 0x1a1a3a, 1);
    dialogBg.setStrokeStyle(3, 0x4a9eff, 0.8);
    dialogBg.setDepth(301);
    this.addUIElement(dialogBg);
    
    // Title
    const title = this.add.text(width / 2, height / 2 - 70, 'Exit Game', {
      fontFamily: 'Arial Black',
      fontSize: '26px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(302);
    this.addUIElement(title);
    
    // Message
    const msg = this.add.text(width / 2, height / 2 - 10, 'Progress will be saved up to\nthe last completed wave.', {
      fontFamily: 'Arial',
      fontSize: '17px',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5).setDepth(302);
    this.addUIElement(msg);
    
    // Confirm button
    const confirmBtn = new Button(this, width / 2 - 85, height / 2 + 70, 'Confirm', () => {
      this.scene.start('SaveDataScene');
    }, { width: 130, height: 55, color: 0x2e7d32, fontSize: '20px', borderRadius: 10 });
    confirmBtn.setDepth(303);
    this.addUIElement(confirmBtn);
    
    // Cancel button
    const cancelBtn = new Button(this, width / 2 + 85, height / 2 + 70, 'Cancel', () => {
      dimBg.destroy();
      dialogBg.destroy();
      title.destroy();
      msg.destroy();
      confirmBtn.destroy();
      cancelBtn.destroy();
    }, { width: 130, height: 55, color: 0x424242, fontSize: '20px', borderRadius: 10 });
    cancelBtn.setDepth(303);
    this.addUIElement(cancelBtn);
  }

  update(time, delta) {
    if (this.battleState.isPaused || this.battleState.isGameOver) return;
    
    const { width, height } = this.cameras.main;
    
    // Update tower positions and logic
    this.towers.forEach(tower => {
      tower.update(time, delta, this.enemies);
      
      // Update screen position from world position
      if (tower.worldX !== undefined && tower.worldY !== undefined) {
        const screen = this.worldToScreen(tower.worldX, tower.worldY);
        tower.x = screen.x;
        tower.y = screen.y;
        tower.setScale(this.virtualZoom); // Always sync scale with zoom
        
        // Hide tower if it would overlap bottom UI (y > height - 200)
        tower.setVisible(screen.y < height - 200);
      }
      
      // Set depth based on Y position (10-90 range for towers)
      tower.setDepth(10 + Math.floor(tower.y / 10));
    });
    
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.isDead) {
        this.enemies.splice(i, 1);
        this.updateEnemyCount();
        continue;
      }
      
      // Store original screen position before update
      const oldScreenX = enemy.x;
      const oldScreenY = enemy.y;
      
      // Temporarily set enemy position to world coordinates for movement logic
      enemy.x = enemy.worldX;
      enemy.y = enemy.worldY;
      
      // Update enemy (moves in world space)
      enemy.update(time, delta);
      
      // Save updated world position
      enemy.worldX = enemy.x;
      enemy.worldY = enemy.y;
      
      // Convert world position to screen position for display
      const screen = this.worldToScreen(enemy.worldX, enemy.worldY);
      enemy.x = screen.x;
      enemy.y = screen.y;
      enemy.setScale(this.virtualZoom);
      
      // Hide enemy if it would overlap bottom UI (y > height - 200)
      enemy.setVisible(screen.y < height - 200);
      
      // Enemies also sorted by Y
      enemy.setDepth(10 + Math.floor(enemy.y / 10));
    }
    
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      if (!projectile || !projectile.scene || !projectile.active) {
        this.projectiles.splice(i, 1);
        continue;
      }
      projectile.update(time, delta);
      
      // Update projectile screen position from world position
      if (projectile.worldX !== undefined && projectile.worldY !== undefined) {
        const screen = this.worldToScreen(projectile.worldX, projectile.worldY);
        projectile.x = screen.x;
        projectile.y = screen.y;
        projectile.setScale(this.virtualZoom); // Scale projectile with zoom
      }
      
      // Projectiles always on top of game objects
      projectile.setDepth(95);
      if (projectile.shouldDestroy) {
        projectile.destroy();
        this.projectiles.splice(i, 1);
      }
    }
  }

  gameOver() {
    this.battleState.isGameOver = true;
    
    this.enemies.forEach(e => { if (e) e.isDead = true; });
    
    if (this.spawnEvent) this.spawnEvent.destroy();
    if (this.waveTimerEvent) this.waveTimerEvent.destroy();
    if (this.warningTimerEvent) this.warningTimerEvent.destroy();
    
    this.cameras.main.shake(500, 0.02);
    this.cameras.main.flash(500, 255, 0, 0);
    
    this.showMessage('TOO MANY ENEMIES!', 0xff4444);
    
    this.time.delayedCall(2000, () => {
      this.scene.start('GameOverScene', {
        score: this.battleState.score,
        wave: this.battleState.currentWave
      });
    });
  }

  addProjectile(projectile) {
    this.projectiles.push(projectile);
  }
}
