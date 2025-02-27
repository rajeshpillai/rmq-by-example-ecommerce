const amqp = require('amqplib');

async function sendOrder(orderId) {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const exchange = 'order_exchange';
    const routingKey = 'order.paid';  // Ensure it matches payment consumer expectations

    const order = {
        orderId,
        user: "user@example.com",
        totalAmount: Math.floor(Math.random() * 100) + 1
    };

    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(order)), { persistent: true });

    console.log(`Order ${orderId} sent.`);
    await channel.close();
    await connection.close();
}

setInterval(() => sendOrder(`ORD-${Date.now()}`), 3000);
