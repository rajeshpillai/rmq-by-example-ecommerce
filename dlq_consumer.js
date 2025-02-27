const amqp = require('amqplib');

async function processFailedPayments() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue('dead_letter_queue', { durable: true });

    console.log("Waiting for dead letter messages...");

    channel.consume('dead_letter_queue', (msg) => {
        const order = JSON.parse(msg.content.toString());
        console.log(`Handling failed payment for Order ${order.orderId} (Sending email notification)`);
        channel.ack(msg);
    });
}

processFailedPayments();
