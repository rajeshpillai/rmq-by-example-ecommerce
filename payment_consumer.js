/*
Retry failed messages up to 3 times using the retry queues.
Move messages to DLQ if they fail all retries.
*/

const amqp = require('amqplib');

async function processPayment() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue('payment_queue', { durable: true });

    console.log("Waiting for payment messages...");

    channel.consume('payment_queue', async (msg) => {
        const order = JSON.parse(msg.content.toString());
        const headers = msg.properties.headers || {};
        const retryCount = headers['x-retry-count'] || 0;

        console.log(`Processing payment for Order ${order.orderId} (Retry: ${retryCount})`);

        // Simulate failure with a 40% failure rate
        if (Math.random() > 0.6) {
            console.log(`Payment failed for Order ${order.orderId}`);

            if (retryCount < 3) {
                const nextRetryQueue = `payment_retry_${retryCount + 1}`;
                console.log(`Retrying Order ${order.orderId} in Queue: ${nextRetryQueue}`);

                channel.sendToQueue(nextRetryQueue, msg.content, {
                    persistent: true,
                    headers: { 'x-retry-count': retryCount + 1 }
                });

            } else {
                console.log(`Max retries reached. Moving Order ${order.orderId} to Dead Letter Queue`);
                channel.publish('dlx_exchange', 'order.failed', msg.content, { persistent: true });
            }
        } else {
            console.log(`Payment successful for Order ${order.orderId}`);
        }

        channel.ack(msg);
    });
}

processPayment();
