/**
 * Button UI Component - Stylish animated button
 */

import Phaser from 'phaser';

export class Button extends Phaser.GameObjects.Container {
  constructor(scene, x, y, text, callbackOrConfig = {}, config = {}) {
    super(scene, x, y);
    
    this.scene = scene;
    
    // Handle both old style (callback as 4th arg) and new style (config only)
    let onClick = () => {};
    let finalConfig = config;
    
    if (typeof callbackOrConfig === 'function') {
      onClick = callbackOrConfig;
      finalConfig = config;
    } else if (typeof callbackOrConfig === 'object') {
      finalConfig = callbackOrConfig;
      onClick = finalConfig.onClick || (() => {});
    }
    
    this.config = {
      width: finalConfig.width || 200,
      height: finalConfig.height || 60,
      backgroundColor: finalConfig.backgroundColor || finalConfig.color || 0xe94560,
      hoverColor: finalConfig.hoverColor || 0xff6b6b,
      pressedColor: finalConfig.pressedColor || 0xc73e54,
      textColor: finalConfig.textColor || '#ffffff',
      fontSize: finalConfig.fontSize || '24px',
      fontFamily: finalConfig.fontFamily || 'Arial',
      borderRadius: finalConfig.borderRadius || 15,
      borderWidth: finalConfig.borderWidth || 3,
      borderColor: finalConfig.borderColor || 0xffffff,
      disabled: finalConfig.disabled || false,
      onClick: onClick
    };
    
    this.isDisabled = this.config.disabled;
    this.isPressed = false;
    
    this.createButton(text);
    
    // Buttons are always UI elements - don't scroll with camera
    this.setScrollFactor(0);
    
    scene.add.existing(this);
  }

  createButton(text) {
    // Button background
    this.background = this.scene.add.graphics();
    this.drawBackground(this.config.backgroundColor);
    this.add(this.background);
    
    // Button glow (for hover effect)
    this.glow = this.scene.add.graphics();
    this.glow.fillStyle(this.config.backgroundColor, 0.3);
    this.glow.fillRoundedRect(
      -this.config.width / 2 - 5,
      -this.config.height / 2 - 5,
      this.config.width + 10,
      this.config.height + 10,
      this.config.borderRadius + 5
    );
    this.glow.setAlpha(0);
    this.addAt(this.glow, 0);
    
    // Button text
    this.text = this.scene.add.text(0, 0, text, {
      fontFamily: this.config.fontFamily,
      fontSize: this.config.fontSize,
      color: this.config.textColor,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add(this.text);
    
    // Shine effect overlay
    this.shine = this.scene.add.graphics();
    this.shine.fillGradientStyle(
      0xffffff, 0xffffff, 0xffffff, 0xffffff,
      0.3, 0.3, 0, 0
    );
    this.shine.fillRoundedRect(
      -this.config.width / 2 + 5,
      -this.config.height / 2 + 3,
      this.config.width - 10,
      this.config.height / 3,
      { tl: this.config.borderRadius - 2, tr: this.config.borderRadius - 2, bl: 0, br: 0 }
    );
    this.add(this.shine);
    
    // Set up interaction
    this.setSize(this.config.width, this.config.height);
    this.setInteractive({ useHandCursor: true });
    
    this.setupEvents();
    
    // Apply disabled state if needed
    if (this.isDisabled) {
      this.disable();
    }
  }

  drawBackground(color) {
    this.background.clear();
    
    // Main background
    this.background.fillStyle(color);
    this.background.fillRoundedRect(
      -this.config.width / 2,
      -this.config.height / 2,
      this.config.width,
      this.config.height,
      this.config.borderRadius
    );
    
    // Border
    this.background.lineStyle(this.config.borderWidth, this.config.borderColor, 0.5);
    this.background.strokeRoundedRect(
      -this.config.width / 2,
      -this.config.height / 2,
      this.config.width,
      this.config.height,
      this.config.borderRadius
    );
    
    // Bottom shadow
    this.background.fillStyle(0x000000, 0.3);
    this.background.fillRoundedRect(
      -this.config.width / 2 + 3,
      this.config.height / 2 - 8,
      this.config.width - 6,
      5,
      { tl: 0, tr: 0, bl: this.config.borderRadius - 3, br: this.config.borderRadius - 3 }
    );
  }

  setupEvents() {
    this.on('pointerover', () => {
      if (this.isDisabled) return;
      
      this.drawBackground(this.config.hoverColor);
      
      // Glow animation
      this.scene.tweens.add({
        targets: this.glow,
        alpha: 1,
        duration: 200,
        ease: 'Cubic.easeOut'
      });
      
      // Scale up
      this.scene.tweens.add({
        targets: this,
        scale: 1.05,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });
    
    this.on('pointerout', () => {
      if (this.isDisabled) return;
      
      this.drawBackground(this.config.backgroundColor);
      this.isPressed = false;
      
      // Remove glow
      this.scene.tweens.add({
        targets: this.glow,
        alpha: 0,
        duration: 200
      });
      
      // Scale down
      this.scene.tweens.add({
        targets: this,
        scale: 1,
        duration: 150,
        ease: 'Back.easeIn'
      });
    });
    
    this.on('pointerdown', () => {
      if (this.isDisabled) return;
      
      this.isPressed = true;
      this.drawBackground(this.config.pressedColor);
      
      // Press animation
      this.scene.tweens.add({
        targets: this,
        scale: 0.95,
        duration: 50,
        ease: 'Cubic.easeOut'
      });
    });
    
    this.on('pointerup', () => {
      if (this.isDisabled) return;
      
      if (this.isPressed) {
        this.isPressed = false;
        this.drawBackground(this.config.hoverColor);
        
        // Click effect
        this.scene.tweens.add({
          targets: this,
          scale: 1.05,
          duration: 100,
          ease: 'Back.easeOut'
        });
        
        // Execute callback
        this.config.onClick();
        
        // Ripple effect
        this.createRipple();
      }
    });
  }

  createRipple() {
    // Safety check - button might be in a destroyed container
    if (!this.scene || !this.scene.add || !this.scene.tweens) return;
    
    const ripple = this.scene.add.graphics();
    ripple.fillStyle(0xffffff, 0.5);
    ripple.fillCircle(this.x, this.y, 10);
    
    this.scene.tweens.add({
      targets: ripple,
      scaleX: this.config.width / 20,
      scaleY: this.config.height / 20,
      alpha: 0,
      duration: 400,
      ease: 'Cubic.easeOut',
      onComplete: () => ripple.destroy()
    });
  }

  setText(newText) {
    this.text.setText(newText);
  }

  enable() {
    this.isDisabled = false;
    this.setInteractive({ useHandCursor: true });
    this.setAlpha(1);
    this.drawBackground(this.config.backgroundColor);
  }

  disable() {
    this.isDisabled = true;
    this.disableInteractive();
    this.setAlpha(0.5);
    this.drawBackground(0x666666);
  }

  setColor(color) {
    this.config.backgroundColor = color;
    this.drawBackground(color);
  }

  pulse() {
    this.scene.tweens.add({
      targets: this,
      scale: 1.1,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  stopPulse() {
    this.scene.tweens.killTweensOf(this);
    this.setScale(1);
  }
}
