const { EmailClient } = require("@azure/communication-email");
const config = require('../config/config');

class EmailService {
    constructor() {
        console.log('Initializing EmailService...');
        if (!config.azure.connectionString) {
            console.error('Azure connection string is missing.');
            throw new Error('Azure Communication Services connection string is required');
        }
        this.emailClient = new EmailClient(config.azure.connectionString);
        console.log('EmailService initialized successfully.');
    }

    async sendEmail(to, subject, htmlContent) {
        console.log(`sendEmail called for recipient: ${to}, subject: ${subject}`);
        const emailMessage = {
            senderAddress: config.azure.senderAddress,
            content: {
                subject: subject,
                html: htmlContent,
                plainText: "Please view this email in an HTML-capable email client."
            },
            recipients: {
                to: [{ address: to }]
            }
        };

        try {
            const poller = await this.emailClient.beginSend(emailMessage);
            await poller.pollUntilDone();
            console.log(`Email sent successfully to ${to}`);
        } catch (error) {
            console.error(`Failed to send email to ${to}:`, error.message);
            throw error;
        }
    }
}

module.exports = EmailService;
