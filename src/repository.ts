import type { UUID } from "crypto";
import postgres from "postgres";

export async function recreateTables(db: postgres.Sql, merchant_id: UUID, order_id: UUID) {
  try {
    await Promise.all([
      db`
        CREATE TABLE IF NOT EXISTS merchants (
          id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          external_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
          name        TEXT NOT NULL,
          created_at  TIMESTAMP DEFAULT timezone('UTC', NOW()),
          updated_at  TIMESTAMP DEFAULT timezone('UTC', NOW())
        )
      `,
      db`
        CREATE TABLE IF NOT EXISTS orders (
          id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          external_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
          merchant_id UUID NOT NULL REFERENCES merchants(external_id) ON DELETE CASCADE,
          name        TEXT NOT NULL,
          created_at  TIMESTAMP DEFAULT timezone('UTC', NOW()),
          updated_at  TIMESTAMP DEFAULT timezone('UTC', NOW())
        )
      `,
      db`
        CREATE TABLE IF NOT EXISTS subscriptions (
          id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          external_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
          order_id    BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          created_at  TIMESTAMP DEFAULT timezone('UTC', NOW()),
          updated_at  TIMESTAMP DEFAULT timezone('UTC', NOW())
        )
      `,
    ]);
    console.log("Tables recreated successfully");

    await db`
      INSERT INTO merchants(
        external_id,
        name
      ) VALUES (
        ${merchant_id},
        'Shrian Merchant'
      )
    `;
    console.log("Merchant created with ID:", merchant_id);

    await db`
      INSERT INTO orders(
        external_id,
        merchant_id,
        name
      ) VALUES (
        ${order_id},
        ${merchant_id},
        'Shrian Order'
      )
    `;
    console.log("Order created with ID:", order_id);
  } catch (error) {
    console.error("Error recreating tables:", error);
    return;
  }
}

export async function getOrdersByMerchantId(db: postgres.Sql, merchant_id: UUID) {
  try {
    const result = await db`
      SELECT external_id, name, created_at
      FROM orders
      WHERE merchant_id = ${merchant_id}
      ORDER BY created_at DESC
    `;
    return result;
  } catch (error) {
    console.error("Error getting orders by merchant ID:", error);
    throw error;
  }
}

export async function createOrder(db: postgres.Sql, merchant_id: string, order_external_id: string, orderName: string) {
  try {
    await db`
      INSERT INTO orders(
        external_id,
        merchant_id,
        name
      ) VALUES (
        ${order_external_id},
        ${merchant_id},
        ${orderName}
      )
    `;
    console.log("Order created with external ID:", order_external_id);
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}
