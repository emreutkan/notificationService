const axios = require('axios');
const config = require('../config/config');
class GatewayService {
    constructor() {
        console.log('Initializing GatewayService...');
        this.authToken = null;
        this.baseURL = config.gateway.url;
        // Validate configuration
        if (!this.baseURL) {
            throw new Error('Gateway URL is not configured');
        }
        if (!config.gateway.auth.email || !config.gateway.auth.password) {
            throw new Error('Gateway authentication credentials are not configured');
        }
        console.log('GatewayService initialized successfully.');
    }

    async getAuthToken() {
        console.log('Fetching auth token...');
        try {
            const loginUrl = `${this.baseURL}/pharmacy/auth/login`;
            console.log(`Attempting login at: ${loginUrl}`);

            const response = await axios.post(loginUrl, {
                email: config.gateway.auth.email,
                password: config.gateway.auth.password
            });

            if (!response.data?.token) {
                throw new Error('No token received in authentication response');
            }

            this.authToken = response.data.token;
            console.log('Authentication successful');
            return this.authToken;
        } catch (error) {
            console.error('Authentication failed:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
            throw new Error(`Authentication failed: ${error.message}`);
        }
    }

    async getIncompletePrescriptions() {
        try {
            if (!this.authToken) {
                await this.getAuthToken();
            }

            const url = `${this.baseURL}/pharmacy/prescriptions/incomplete`;
            console.log(`Fetching incomplete prescriptions from: ${url}`);

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('Token expired, refreshing...');
                this.authToken = null;
                await this.getAuthToken();
                return this.getIncompletePrescriptions();
            }

            console.error('Failed to fetch prescriptions:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
            throw error;
        }
    }
}
module.exports = GatewayService;
