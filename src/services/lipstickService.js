// src/services/lipstickService.js
class LipstickService {
    constructor() {
        this.baseUrl = 'http://localhost:5001/api';
    }

    async getAllLipsticks() {
        const response = await fetch(`${this.baseUrl}/lipsticks`);
        return response.json();
    }

    async getLipsticksBySeason(season) {
        const allLipsticks = await this.getAllLipsticks();
        return allLipsticks.filter(lipstick => lipstick.season === season);
    }
}

export const lipstickService = new LipstickService();