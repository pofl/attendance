import postgres from "postgres";
export async function getOrdersByMerchantId(db, merchant_id) {
    try {
        const result = await db `
      SELECT external_id, name, created_at
      FROM orders
      WHERE merchant_id = ${merchant_id}
      ORDER BY created_at DESC
    `;
        return result;
    }
    catch (error) {
        console.error("Error getting orders by merchant ID:", error);
        throw error;
    }
}
export async function createOrder(db, merchant_id, order_external_id, orderName) {
    try {
        await db `
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
    }
    catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
}
function parseAttendeeRecord(row) {
    return {
        id: row.id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        name: row.name,
        locale: row.locale,
        arrival_date: row.arrival_date,
        arrival_flight: row.arrival_flight,
        departure_date: row.departure_date,
        departure_flight: row.departure_flight,
        passport_status: row.passport_status,
        visa_status: row.visa_status,
        dietary_requirements: row.dietary_requirements,
    };
}
export async function getAttendeeByName(db, name) {
    try {
        const result = await db `
      SELECT *
      FROM attendees
      WHERE name = ${name}
    `;
        if (result.length === 0) {
            return null;
        }
        return parseAttendeeRecord(result[0]);
    }
    catch (error) {
        console.error("Error getting attendee by name:", error);
        throw error;
    }
}
export async function upsertAttendee(db, attendee) {
    try {
        // Note: Since there is no unique constraint on 'name' in the schema,
        // we use a transaction to check for existence before inserting or updating.
        await db.begin(async (sql) => {
            const existing = await sql `
        SELECT id FROM attendees WHERE name = ${attendee.name}
      `;
            if (existing.length > 0) {
                await sql `
          UPDATE attendees SET
            locale = ${attendee.locale},
            arrival_date = ${attendee.arrival_date},
            arrival_flight = ${attendee.arrival_flight},
            departure_date = ${attendee.departure_date},
            departure_flight = ${attendee.departure_flight},
            passport_status = ${attendee.passport_status},
            visa_status = ${attendee.visa_status},
            dietary_requirements = ${attendee.dietary_requirements},
            updated_at = NOW()
          WHERE name = ${attendee.name}
        `;
            }
            else {
                await sql `
          INSERT INTO attendees (
            name,
            locale,
            arrival_date,
            arrival_flight,
            departure_date,
            departure_flight,
            passport_status,
            visa_status,
            dietary_requirements
          ) VALUES (
            ${attendee.name},
            ${attendee.locale},
            ${attendee.arrival_date},
            ${attendee.arrival_flight},
            ${attendee.departure_date},
            ${attendee.departure_flight},
            ${attendee.passport_status},
            ${attendee.visa_status},
            ${attendee.dietary_requirements}
          )
        `;
            }
        });
        console.log("Attendee upserted:", attendee.name);
    }
    catch (error) {
        console.error("Error upserting attendee:", error);
        throw error;
    }
}
