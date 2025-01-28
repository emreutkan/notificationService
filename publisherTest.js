// publisherTest.js
require('dotenv').config();
const amqp = require('amqplib');

// The same queue name
const QUEUE_NAME = 'prescription-notifications';

async function testPublish() {
    try {
        console.log('Publisher connecting...');
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();

        // Make sure the queue exists
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        const messagePayload = {
            timestamp: new Date().toISOString(),
            data: 'Test message from publisherTest.js',
        };

        // Publish the message
        console.log('Publishing a test message:', messagePayload);
        channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(messagePayload)), {
            persistent: true,
        });

        console.log('Message published. Closing publisher connection...');
        await channel.close();
        await connection.close();
        console.log('Publisher finished.');
    } catch (err) {
        console.error('Error in publisher:', err);
    }
}

testPublish();
