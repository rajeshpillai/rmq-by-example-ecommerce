const amqp = require('amqplib');

async function setup() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // Declare exchanges
    await channel.assertExchange('order_exchange', 'direct', { durable: true });
    await channel.assertExchange('dlx_exchange', 'direct', { durable: true });
    await channel.assertExchange('retry_exchange', 'direct', { durable: true });

    // Declare queues
    await channel.assertQueue('order_queue', { durable: true });
    await channel.assertQueue('payment_queue', { durable: true });

    // Retry Queues with TTL
    await channel.assertQueue('payment_retry_1', { 
        durable: true, 
        arguments: { 
            "x-dead-letter-exchange": "order_exchange", 
            "x-dead-letter-routing-key": "order.paid",
            "x-message-ttl": 5000 // 5 seconds
        }
    });

    await channel.assertQueue('payment_retry_2', { 
        durable: true, 
        arguments: { 
            "x-dead-letter-exchange": "order_exchange", 
            "x-dead-letter-routing-key": "order.paid",
            "x-message-ttl": 15000 // 15 seconds
        }
    });

    await channel.assertQueue('payment_retry_3', { 
        durable: true, 
        arguments: { 
            "x-dead-letter-exchange": "order_exchange", 
            "x-dead-letter-routing-key": "order.paid",
            "x-message-ttl": 30000 // 30 seconds
        }
    });

    // Dead Letter Queue (DLQ)
    await channel.assertQueue('dead_letter_queue', { durable: true });

    // Bind queues to exchanges
    await channel.bindQueue('order_queue', 'order_exchange', 'order.created');
    await channel.bindQueue('payment_queue', 'order_exchange', 'order.paid');

    // Bind DLQ
    await channel.bindQueue('dead_letter_queue', 'dlx_exchange', 'order.failed');

    console.log("RabbitMQ setup complete.");
    await channel.close();
    await connection.close();
}

setup();
