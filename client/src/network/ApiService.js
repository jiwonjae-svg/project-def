/**
 * API Service - REST API client for backend communication
 */

const API_BASE = '/api';

class ApiService {
  constructor() {
    this.userId = null;
  }

  setUserId(userId) {
    this.userId = userId;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error.message);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // User Management
  async createUser(userId, displayName, email = null) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify({ userId, displayName, email })
    });
  }

  async getUser(userId) {
    return this.request(`/users/${userId}`);
  }

  async updateStats(stats) {
    if (!this.userId) throw new Error('User ID not set');
    return this.request(`/users/${this.userId}/stats`, {
      method: 'PUT',
      body: JSON.stringify({ stats })
    });
  }

  // Leaderboard
  async getLeaderboard(type = 'highestStage', limit = 100) {
    return this.request(`/leaderboard?type=${type}&limit=${limit}`);
  }

  // Save/Load
  async saveGame(gameState) {
    if (!this.userId) throw new Error('User ID not set');
    return this.request('/save', {
      method: 'POST',
      body: JSON.stringify({ userId: this.userId, gameState })
    });
  }

  async loadGame() {
    if (!this.userId) throw new Error('User ID not set');
    return this.request(`/save/${this.userId}`);
  }

  // Daily Rewards
  async claimDailyReward() {
    if (!this.userId) throw new Error('User ID not set');
    return this.request(`/daily-reward/${this.userId}`, {
      method: 'POST'
    });
  }

  // Purchases
  async verifyPurchase(productId, receipt) {
    if (!this.userId) throw new Error('User ID not set');
    return this.request('/purchase/verify', {
      method: 'POST',
      body: JSON.stringify({
        userId: this.userId,
        productId,
        receipt
      })
    });
  }
}

// Singleton instance
export const apiService = new ApiService();
export default apiService;
