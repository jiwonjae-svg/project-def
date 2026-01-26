# Project-D: Deck Building Roguelike Defense

<p align="center">
  <img src="docs/banner.png" alt="Project-D Banner" width="600">
</p>

<p align="center">
  <strong>An addictive deck-building roguelike tower defense mobile game built with Phaser.js</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#game-mechanics">Game Mechanics</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#license">License</a>
</p>

---

## 🎮 Features

### Core Gameplay
- **Deck Building System** - Collect and upgrade cards to build powerful tower defense strategies
- **Roguelike Progression** - Each run is unique with procedurally generated maps and encounters
- **Strategic Tower Defense** - Place towers on a grid to defend against waves of enemies
- **Card Synergies** - Combine cards for devastating combo effects

### Card Types
| Type | Description |
|------|-------------|
| 🗼 **Tower Cards** | Place defensive structures on the battlefield |
| ✨ **Spell Cards** | Cast powerful one-time effects |
| 🛡️ **Buff Cards** | Enhance your existing towers |
| 🎁 **Item Cards** | Permanent upgrades for your run |

### Progression Features
- **5 Rarity Tiers** - Common, Uncommon, Rare, Epic, Legendary
- **60+ Unique Cards** - Each with distinct abilities and upgrade paths
- **Multiple Bosses** - Epic encounters with unique mechanics
- **Daily Rewards** - Login bonuses with streak multipliers
- **Leaderboards** - Compete with players worldwide

### Visual Excellence
- **Dynamic Animations** - Smooth, polished UI transitions
- **Particle Effects** - Stunning visual feedback for actions
- **Procedural Graphics** - All assets generated at runtime
- **Mobile-Optimized** - Designed for 720x1280 portrait gameplay

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| [Phaser.js](https://phaser.io/) | 3.70.0 | Game engine |
| [Webpack](https://webpack.js.org/) | 5.89.0 | Module bundling |
| [Babel](https://babeljs.io/) | 7.x | ES6+ transpilation |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| [Express](https://expressjs.com/) | 4.18.2 | REST API server |
| [Socket.io](https://socket.io/) | 4.7.2 | Real-time communication |
| [Firebase Admin](https://firebase.google.com/) | 11.11.1 | Database & authentication |

### Mobile
| Technology | Purpose |
|------------|---------|
| [Apache Cordova](https://cordova.apache.org/) | Native mobile packaging |
| Android SDK | Android app build |
| Xcode | iOS app build |

### Deployment
| Platform | Purpose |
|----------|---------|
| [Render](https://render.com/) | Cloud hosting |
| Firebase Firestore | NoSQL database |

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- (Optional) Android Studio for Android builds
- (Optional) Xcode for iOS builds

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/project-d.git
cd project-d
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your Firebase credentials
```

4. **Start development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:8080
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production bundle |
| `npm run server` | Start backend server |
| `npm run server:dev` | Start backend with nodemon |
| `npm run cordova:add:android` | Add Android platform |
| `npm run cordova:add:ios` | Add iOS platform |
| `npm run cordova:build:android` | Build Android APK |
| `npm run cordova:build:ios` | Build iOS app |
| `npm run cordova:run:android` | Run on Android device/emulator |
| `npm run cordova:run:ios` | Run on iOS simulator |

---

## 🎲 Game Mechanics

### Run Structure

```
┌─────────────────────────────────────────────┐
│                   MAP                        │
│  [Start] → [Battle] → [Shop] → [Elite]      │
│              ↓           ↓        ↓          │
│          [Event] → [Rest] → [Battle]        │
│              ↓           ↓        ↓          │
│          [Treasure] → [Battle] → [BOSS]     │
└─────────────────────────────────────────────┘
```

### Node Types
- **⚔️ Battle** - Standard enemy waves
- **💀 Elite** - Challenging mini-bosses with better rewards
- **👹 Boss** - Epic encounters that end each act
- **🛒 Shop** - Spend gold on cards and items
- **❓ Event** - Random encounters with choices
- **💤 Rest** - Heal HP or upgrade a card
- **💎 Treasure** - Free rewards

### Card Economy

| Rarity | Drop Rate | Gold Cost | Energy |
|--------|-----------|-----------|--------|
| Common | 50% | 25-50 | 1-2 |
| Uncommon | 30% | 50-100 | 2-3 |
| Rare | 15% | 100-200 | 3-4 |
| Epic | 4% | 200-400 | 4-5 |
| Legendary | 1% | 500+ | 5+ |

### Tower Types

| Tower | Range | Damage | Special |
|-------|-------|--------|---------|
| Arrow | Medium | Low | Fast attack |
| Cannon | Short | High | Splash damage |
| Ice | Medium | Low | Slows enemies |
| Fire | Short | High | Burn DOT |
| Lightning | Long | Medium | Chain attacks |
| Poison | Medium | Low | Stacking poison |
| Sniper | Very Long | Very High | Slow attack |
| Laser | Long | Medium | Continuous beam |

### Enemy Types

| Enemy | HP | Speed | Ability |
|-------|-----|-------|---------|
| Grunt | Low | Normal | None |
| Runner | Very Low | Fast | None |
| Tank | Very High | Slow | None |
| Healer | Medium | Normal | Heals nearby |
| Shielder | Medium | Normal | Blocks projectiles |
| Splitter | Medium | Normal | Splits on death |

---

## 🌐 Deployment

### Render Deployment

1. **Create a new Web Service on Render**

2. **Configure build settings**
```
Build Command: npm install && npm run build
Start Command: npm run server
```

3. **Set environment variables**
```
NODE_ENV=production
PORT=3001
FIREBASE_SERVICE_ACCOUNT=<your-firebase-json>
FIREBASE_DATABASE_URL=<your-database-url>
```

4. **Deploy!**

### Firebase Setup

1. Create a new Firebase project
2. Enable Firestore Database
3. Generate a service account key
4. Add the JSON to your `.env` file

### Mobile Build

#### Android
```bash
npm run cordova:add:android
npm run cordova:build:android
# APK will be in platforms/android/app/build/outputs/apk/
```

#### iOS
```bash
npm run cordova:add:ios
npm run cordova:build:ios
# Open in Xcode: platforms/ios/Project-D.xcworkspace
```

---

## 📁 Project Structure

```
project-d/
├── client/
│   ├── public/
│   │   └── index.html          # HTML template
│   └── src/
│       ├── index.js            # Game entry point
│       ├── config/
│       │   └── GameConfig.js   # Game constants
│       ├── scenes/
│       │   ├── BootScene.js    # Initial setup
│       │   ├── PreloadScene.js # Asset loading
│       │   ├── MainMenuScene.js
│       │   ├── MapScene.js     # Roguelike map
│       │   ├── BattleScene.js  # Core gameplay
│       │   ├── ShopScene.js
│       │   ├── CardRewardScene.js
│       │   ├── DeckViewScene.js
│       │   ├── SettingsScene.js
│       │   ├── GameOverScene.js
│       │   ├── VictoryScene.js
│       │   └── UIScene.js      # Toast system
│       ├── entities/
│       │   ├── Card.js
│       │   ├── Tower.js
│       │   └── Enemy.js
│       ├── data/
│       │   ├── CardDatabase.js
│       │   └── EnemyDatabase.js
│       ├── ui/
│       │   └── Button.js
│       ├── effects/
│       │   └── ParticleEffects.js
│       └── styles/
│           └── main.css
├── server/
│   └── index.js                # Express + Socket.io server
├── res/                        # Cordova resources
│   ├── icon/
│   └── splash/
├── config.xml                  # Cordova configuration
├── webpack.config.js
├── package.json
├── .env.example
└── README.md
```

---

## 💰 Monetization Model

### In-App Purchases
- **Gem Packs** - Premium currency for cosmetics
- **Starter Pack** - One-time value bundle
- **Ad Removal** - Remove all ads permanently

### Ad Integration (Optional)
- Rewarded ads for extra lives
- Interstitial ads between runs (can be removed)

### Free-to-Play Balance
- All gameplay content accessible for free
- No pay-to-win mechanics
- Premium purchases are cosmetic or convenience only

---

## 🔮 Future Roadmap

- [ ] **Multiplayer Co-op** - Team up with friends
- [ ] **PvP Arena** - Compete against other players
- [ ] **Seasonal Events** - Limited-time content
- [ ] **Card Skins** - Cosmetic customization
- [ ] **Guild System** - Social features
- [ ] **Achievement System** - Track accomplishments
- [ ] **More Cards & Enemies** - Expanded content

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Contact

- **Email**: dev@projectd.com
- **Twitter**: [@ProjectDGame](https://twitter.com/ProjectDGame)
- **Discord**: [Join our server](https://discord.gg/projectd)

---

<p align="center">
  Made with ❤️ and lots of ☕
</p>

<p align="center">
  <sub>© 2024 Project-D Team. All rights reserved.</sub>
</p>
