const amqp = require('amqplib');

async function processPayment() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue('payment_queue', { durable: true });

    console.log("Waiting for payment messages...");

    channel.consume('payment_queue', async (msg) => {
        const order = JSON.parse(msg.content.toString());
        console.log(`Processing payment for Order ${order.orderId}`);

        // Simulate payment success/failure
        if (Math.random() > 0.8) {
            console.log(`Payment failed for Order ${order.orderId}`);
            channel.publish('dlx_exchange', 'order.failed', msg.content, { persistent: true });
        } else {
            console.log(`Payment successful for Order ${order.orderId}`);
            channel.publish('order_exchange', 'order.inventory', msg.content, { persistent: true });
        }

        channel.ack(msg);
    });
}

processPayment();
