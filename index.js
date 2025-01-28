const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const GatewayService = require('./services/gateway.service');
const EmailService = require('./services/email.service');
const RabbitMQService = require('./services/rabbitmq.service');
const generateEmailContent = require('./utils/email-template');

const app = express();
const port = process.env.PORT || 3000;

// Swagger definition
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Prescription Notification Service API',
            version: '1.0.0',
            description: 'API for managing prescription notifications and queue processing',
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            }
        },
        servers: [
            {
                url: `https://notificationservice-h8caaaeka7ceh0cx.canadacentral-01.azurewebsites.net`,
                description: 'Development server'
            }
        ]
    },
    apis: ['./index.js'] // files containing annotations
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Initialize services
let rabbitMQ, gateway, emailService;

async function initializeServices() {
    rabbitMQ = new RabbitMQService();
    gateway = new GatewayService();
    emailService = new EmailService();
    await rabbitMQ.initialize();

    await rabbitMQ.consumeNotificationTasks(async (msg) => {
        console.log('Processing notifications for timestamp:', msg.timestamp);
        console.log('Calling getIncompletePrescriptions...');
        const prescriptions = await gateway.getIncompletePrescriptions();
        console.log('Prescriptions fetched:', prescriptions);

        const todaysPrescriptions = prescriptions.filter(prescription => {
            const prescriptionDate = new Date(prescription.createdAt);
            const today = new Date();
            return prescriptionDate.toDateString() === today.toDateString();
        });

        if (todaysPrescriptions.length > 0) {
            const pharmacyEmails = new Set(todaysPrescriptions.map(p => p.IssuerPharmacyEmail));
            const htmlContent = generateEmailContent(todaysPrescriptions);

            for (const email of pharmacyEmails) {
                await emailService.sendEmail(
                    email,
                    "Daily Incomplete Prescriptions Report",
                    htmlContent
                );
            }
        }
    });
}

/**
 * @swagger
 * /api/trigger-prescription-notifications:
 *   post:
 *     summary: Trigger prescription notifications processing
 *     description: Triggers the process to fetch incomplete prescriptions and send notifications
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Notification task published successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notification task published successfully
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: '2025-01-28T11:49:06Z'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to publish notification task
 *                 message:
 *                   type: string
 *                   example: Internal server error message
 */
app.post('/api/trigger-prescription-notifications', async (req, res) => {
    try {
        console.log('Notification trigger received from Azure Logic Apps');
        await rabbitMQ.publishNotificationTask();
        console.log('Notification task published to queue successfully');
        res.status(200).json({
            message: 'Notification task published successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Failed to publish notification task:', error);
        res.status(500).json({
            error: 'Failed to publish notification task',
            message: error.message
        });
    }
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check service health
 *     description: Returns the health status of the service
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: '2025-01-28T11:49:06Z'
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Start the server
async function startServer() {
    try {
        await initializeServices();
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
            console.log(`Swagger documentation available at http://localhost:${port}/swagger`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle shutdown gracefully
process.on('SIGTERM', async () => {
    console.log('Shutting down...');
    await rabbitMQ.close();
    process.exit(0);
});

startServer();