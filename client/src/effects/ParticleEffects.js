/**
 * Particle Effects Manager - Dynamic visual effects
 */

import Phaser from 'phaser';

export class ParticleEffects {
  constructor(scene) {
    this.scene = scene;
  }

  createExplosion(x, y, color = 0xff5722, count = 20) {
    for (let i = 0; i < count; i++) {
      const particle = this.scene.add.circle(
        x, y,
        Phaser.Math.Between(2, 6),
        color
      );
      
      const angle = (i / count) * Math.PI * 2;
      const speed = Phaser.Math.Between(100, 200);
      const distance = Phaser.Math.Between(50, 120);
      
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance + 30,
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(400, 700),
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy()
      });
    }
  }

  createSparkle(x, y, color = 0xffd700, count = 10) {
    for (let i = 0; i < count; i++) {
      const star = this.scene.add.star(
        x + Phaser.Math.Between(-20, 20),
        y + Phaser.Math.Between(-20, 20),
        4, 2, 5,
        color
      );
      
      this.scene.tweens.add({
        targets: star,
        alpha: 0,
        scale: 0,
        y: star.y - 30,
        rotation: Math.PI,
        duration: Phaser.Math.Between(300, 600),
        delay: i * 50,
        onComplete: () => star.destroy()
      });
    }
  }

  createTrail(x, y, color = 0x00bcd4) {
    const trail = this.scene.add.circle(x, y, 5, color, 0.5);
    
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 0,
      duration: 300,
      onComplete: () => trail.destroy()
    });
    
    return trail;
  }

  createShockwave(x, y, color = 0xffffff) {
    const ring = this.scene.add.circle(x, y, 10, color, 0);
    ring.setStrokeStyle(3, color, 1);
    
    this.scene.tweens.add({
      targets: ring,
      radius: 100,
      strokeAlpha: 0,
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy()
    });
  }

  createFloatingText(x, y, text, config = {}) {
    const floatText = this.scene.add.text(x, y, text, {
      fontFamily: config.fontFamily || 'Arial Black',
      fontSize: config.fontSize || '24px',
      color: config.color || '#ffffff',
      stroke: config.stroke || '#000000',
      strokeThickness: config.strokeThickness || 3
    }).setOrigin(0.5);
    
    if (config.depth) {
      floatText.setDepth(config.depth);
    }
    
    this.scene.tweens.add({
      targets: floatText,
      y: y - (config.distance || 50),
      alpha: 0,
      duration: config.duration || 800,
      ease: 'Cubic.easeOut',
      onComplete: () => floatText.destroy()
    });
    
    return floatText;
  }

  createHealEffect(x, y) {
    // Green plus signs floating up
    for (let i = 0; i < 5; i++) {
      const plus = this.scene.add.text(
        x + Phaser.Math.Between(-30, 30),
        y,
        '+',
        {
          fontFamily: 'Arial Black',
          fontSize: '24px',
          color: '#4caf50'
        }
      ).setOrigin(0.5);
      
      this.scene.tweens.add({
        targets: plus,
        y: y - 60,
        alpha: 0,
        duration: 800,
        delay: i * 100,
        ease: 'Cubic.easeOut',
        onComplete: () => plus.destroy()
      });
    }
  }

  createDamageEffect(x, y) {
    // Red flash
    const flash = this.scene.add.circle(x, y, 30, 0xff0000, 0.5);
    
    this.scene.tweens.add({
      targets: flash,
      radius: 50,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy()
    });
  }

  createCardGlow(card, color = 0xffd700) {
    const glow = this.scene.add.rectangle(
      card.x, card.y,
      card.width + 20, card.height + 20,
      color, 0.3
    );
    glow.setDepth(card.depth - 1);
    
    this.scene.tweens.add({
      targets: glow,
      alpha: 0.1,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    return glow;
  }

  createLevelUp(x, y) {
    // Circle expanding outward
    for (let i = 0; i < 3; i++) {
      const ring = this.scene.add.circle(x, y, 20, 0xffd700, 0);
      ring.setStrokeStyle(3, 0xffd700);
      
      this.scene.tweens.add({
        targets: ring,
        radius: 100 + i * 30,
        strokeAlpha: 0,
        duration: 800,
        delay: i * 200,
        ease: 'Cubic.easeOut',
        onComplete: () => ring.destroy()
      });
    }
    
    // Stars
    this.createSparkle(x, y, 0xffd700, 15);
  }

  createConfetti(width, height, count = 50) {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    
    for (let i = 0; i < count; i++) {
      const color = Phaser.Utils.Array.GetRandom(colors);
      const x = Phaser.Math.Between(0, width);
      const confetti = this.scene.add.rectangle(
        x, -20,
        Phaser.Math.Between(5, 10),
        Phaser.Math.Between(10, 20),
        color
      );
      
      this.scene.tweens.add({
        targets: confetti,
        y: height + 50,
        x: x + Phaser.Math.Between(-100, 100),
        rotation: Phaser.Math.Between(2, 6) * Math.PI,
        duration: Phaser.Math.Between(2000, 4000),
        delay: Phaser.Math.Between(0, 2000),
        ease: 'Linear',
        onComplete: () => confetti.destroy()
      });
    }
  }
}
