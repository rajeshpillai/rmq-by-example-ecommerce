const amqp = require('amqplib');

async function setup() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // Declare exchanges
    await channel.assertExchange('order_exchange', 'direct', { durable: true });
    await channel.assertExchange('dlx_exchange', 'direct', { durable: true });

    // Declare queues
    await channel.assertQueue('order_queue', { durable: true });
    await channel.assertQueue('payment_queue', { durable: true });
    await channel.assertQueue('inventory_queue', { durable: true });
    await channel.assertQueue('notification_queue', { durable: true });

    // Dead Letter Queue (DLQ)
    await channel.assertQueue('dead_letter_queue', { durable: true });

    // Bind queues to exchanges
    await channel.bindQueue('order_queue', 'order_exchange', 'order.created');
    await channel.bindQueue('payment_queue', 'order_exchange', 'order.paid');
    await channel.bindQueue('inventory_queue', 'order_exchange', 'order.inventory');
    await channel.bindQueue('notification_queue', 'order_exchange', 'order.notified');

    // Bind DLQ
    await channel.bindQueue('dead_letter_queue', 'dlx_exchange', 'order.failed');

    console.log("RabbitMQ setup complete.");
    await channel.close();
    await connection.close();
}

setup();
