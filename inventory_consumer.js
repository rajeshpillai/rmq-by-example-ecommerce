const amqp = require('amqplib');

async function processInventory() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue('inventory_queue', { durable: true });

    console.log("Waiting for inventory update messages...");

    channel.consume('inventory_queue', async (msg) => {
        const order = JSON.parse(msg.content.toString());

        console.log(`Updating inventory for Order ${order.orderId}`);

        // Simulated inventory update
        console.log(`Stock deducted for Order ${order.orderId}`);

        channel.ack(msg);
    });
}

processInventory();
