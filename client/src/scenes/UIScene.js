/**
 * UI Scene - Persistent overlay UI for all scenes
 */

import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    // This scene runs in parallel with other scenes
    // for persistent UI elements like notifications, toasts, etc.
    
    this.toasts = [];
  }

  showToast(message, type = 'info', duration = 2000) {
    const { width, height } = this.cameras.main;
    
    const colors = {
      info: 0x2196f3,
      success: 0x4caf50,
      warning: 0xff9800,
      error: 0xf44336
    };
    
    const y = 100 + this.toasts.length * 60;
    
    // Toast container
    const toast = this.add.container(width / 2, y - 50);
    toast.setAlpha(0);
    
    // Background
    const bg = this.add.rectangle(0, 0, 300, 50, colors[type], 0.95);
    bg.setStrokeStyle(2, 0xffffff, 0.3);
    toast.add(bg);
    
    // Text
    const text = this.add.text(0, 0, message, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);
    toast.add(text);
    
    this.toasts.push(toast);
    
    // Animate in
    this.tweens.add({
      targets: toast,
      alpha: 1,
      y: y,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // Animate out
    this.tweens.add({
      targets: toast,
      alpha: 0,
      y: y - 30,
      duration: 300,
      delay: duration,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        const idx = this.toasts.indexOf(toast);
        if (idx > -1) this.toasts.splice(idx, 1);
        toast.destroy();
      }
    });
  }
}
