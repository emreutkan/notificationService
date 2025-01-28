// Test script (test-gateway.js)
const GatewayService = require('./services/gateway.service');

async function testGateway() {
    try {
        const gateway = new GatewayService();
        await gateway.getAuthToken();
        const prescriptions = await gateway.getIncompletePrescriptions();
        console.log('Test successful:', prescriptions);
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testGateway();