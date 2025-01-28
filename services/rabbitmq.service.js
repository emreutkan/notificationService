const amqp = require('amqplib');
const config = require('../config/config');

class RabbitMQService {
    constructor() {
        console.log('Initializing RabbitMQService...');
        this.connection = null;
        this.channel = null;
        console.log('RabbitMQService initialized successfully.');
    }

    async initialize() {
        console.log('Connecting to RabbitMQ...');
        try {
            this.connection = await amqp.connect(config.rabbitMQ.url);
            this.channel = await this.connection.createChannel();
            await this.channel.assertQueue(config.rabbitMQ.queueName, { durable: true });
            console.log('RabbitMQ connection established.');
        } catch (error) {
            console.error('Failed to initialize RabbitMQ:', error.message);
            throw error;
        }
    }

    async publishNotificationTask() {
        if (!this.channel) {
            console.error('Attempted to publish without initializing RabbitMQ channel.');
            throw new Error('RabbitMQ channel not initialized');
        }

        console.log('Publishing notification task...');
        try {
            this.channel.sendToQueue(
                config.rabbitMQ.queueName,
                Buffer.from(JSON.stringify({ timestamp: new Date().toISOString() }))
            );
            console.log('Notification task published successfully.');
        } catch (error) {
            console.error('Failed to publish notification task:', error.message);
            throw error;
        }
    }

    async consumeNotificationTasks(callback) {
        if (!this.channel) {
            console.error('Attempted to consume without initializing RabbitMQ channel.');
            throw new Error('RabbitMQ channel not initialized');
        }

        console.log('Starting to consume notification tasks...');
        try {
            await this.channel.consume(config.rabbitMQ.queueName, async (msg) => {
                if (msg) {
                    try {
                        console.log('Message received:', msg.content.toString());
                        await callback(JSON.parse(msg.content.toString()));
                        this.channel.ack(msg);
                        console.log('Message processed successfully.');
                    } catch (error) {
                        console.error('Error processing message:', error.message);
                        this.channel.nack(msg, false, true);
                    }
                }
            });
        } catch (error) {
            console.error('Failed to consume notification tasks:', error.message);
            throw error;
        }
    }

    async close() {
        console.log('Closing RabbitMQ connection...');
        try {
            await this.channel?.close();
            await this.connection?.close();
            console.log('RabbitMQ connection closed.');
        } catch (error) {
            console.error('Error closing RabbitMQ connection:', error.message);
            throw error;
        }
    }
}

module.exports = RabbitMQService;
