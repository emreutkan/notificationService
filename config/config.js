require('dotenv').config();

const config = {
    rabbitMQ: {
        // Default to localhost if not provided - for local development
        url: process.env.RABBITMQ_URL,
        queueName: 'prescription-notifications'
    },
    azure: {
        // Using your provided Azure email configuration
        connectionString: process.env.COMMUNICATION_SERVICES_CONNECTION_STRING,
        senderAddress: "DoNotReply@f9d17d39-2ab3-4bf4-bbfd-86ea4ffd7f25.azurecomm.net"
    },
    gateway: {
        url: 'https://prescription-gateway-aqgcewarhgbshfev.canadacentral-01.azurewebsites.net',
        auth: {
            email: 'admin@admin.com',
            password: 'admin'
        }
    }
};

module.exports = config;