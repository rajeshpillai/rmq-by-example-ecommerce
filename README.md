# RabbitMQ E-Commerce Example (Node.js)

## Overview
This project demonstrates how to use **RabbitMQ** in an **e-commerce** scenario using **Node.js**. It simulates:
- **Order Processing**
- **Payment Handling**
- **Inventory Management**
- **Notifications**
- **Dead Letter Queue (DLQ) for failed payments**
- **Message Retries using Exponential Backoff**

This implementation uses **Direct Exchanges**, **Queues**, and **Routing Keys** for message passing.

---

## **Features & Functionality**
- **Asynchronous Order Processing**
- **Payment Handling with Automatic Retries**
- **Inventory Management System**
- **Notification System**
- **Dead Letter Queue (DLQ) for failed messages**
- **Message Retries (Exponential Backoff)**
- **RabbitMQ Dashboard for Monitoring**

---

## **Branches**
- `feat-simple` → **Basic implementation** (order, payment, inventory, notifications, DLQ)
- `feat-retries` → **Message retries** (retries failed payments before sending to DLQ)

---


## Setup & Installation

1. Install RabbitMQ (Using Docker)

```docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
```

RabbitMQ Management UI:
👉 http://localhost:15672Username: guestPassword: guest

2. Install Dependencies


```npm install```

How to Run

Step 1: Setup RabbitMQ Queues & Exchanges

```node setup.js```

Step 2: Start the Order Producer

```node order_producer.js```

Step 3: Start the Payment Consumer

```node payment_consumer.js```

Step 4: Start the Dead Letter Queue (DLQ) Consumer

```node dlq_consumer.js```

If using the feat-retries branch, messages failing payment will retry up to 3 times before moving to DLQ.

## Implementation Details

Exchanges Used

- order_exchange → Handles order processing.
- dlx_exchange → Dead Letter Exchange for failed payments.

- retry_exchange → Handles message retries before DLQ.

Queues Used

Queue                          Purpose

order_queue                    Receives new orders

payment_queue                  Handles payment processing

inventory_queue                Manages stock updates

notification_queue             Sends email/SMS notifications

dead_letter_queue              Stores failed payment messages

payment_retry_1                5s delay before first retry

payment_retry_2                15s delay before second retry

payment_retry_3                30s delay before final retry


Routing Keys

Routing Key                    Action

order.created                  New order is placed

order.paid                     Payment is processed

order.inventory                Inventory update after payment

order.failed                   Payment failed, sent to DLQ


## Retry Mechanism (Branch: feat-retries)

- If payment fails, message is sent to payment_retry_1 (5s delay).
- If it fails again, it's sent to payment_retry_2 (15s delay).
- A third failure moves it to payment_retry_3 (30s delay).

If it still fails, it goes to the Dead Letter Queue (DLQ).

## Monitoring in RabbitMQ UI

Open http://localhost:15672.

Go to Queues tab → Monitor order_queue, payment_queue, dead_letter_queue.

Check Exchanges to see message routing.

## Troubleshooting

Check if RabbitMQ is Running

docker ps

If it's not running, start it:

docker start rabbitmq

View Logs

docker logs rabbitmq

