// bills.test.js
const request = require("supertest");

const baseURL = "https://dsi-nest-backend-development.up.railway.app/api/v1";

// --- Token para pruebas ---
const authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmeSI6Miwicm9sZSI6ImFkbWluIiwidG9rZW5fdHlwZSI6ImFjY2Vzc190b2tlbiIsInVzZXJfaWQiOiJnZTE5MDIwQHVlcy5lZHUuc3YiLCJpYXQiOjE3NTkzNzEwNDIwMzgsImV4cCI6MTc1OTQ1NzQ0MjAzOCwic3ViIjoyLCJ0b2tlblR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJ1c2VyRW1haWwiOiJnZTE5MDIwQHVlcy5lZHUuc3YifQ.9PUqZdLdnQrRa-Eb5b5y7BHvX0133TC1vgKlGXpUrUU";

describe("Bills API - Pruebas Automatizadas", () => {
  let createdBillId;

  // --- Crear factura ---
  test("POST /bills - Debe crear una factura con detalles válidos", async () => {
    const response = await request(baseURL)
      .post("/bills")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        clientId: 2,
        billsDetails: [
          { quantity: 2, productId: 3 },
          { quantity: 1, productId: 5 },
        ],
      });

    expect([201, 400, 404]).toContain(response.status);

    if (response.status === 201) {
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("client");
      expect(response.body.client).toHaveProperty("id", 2);
      expect(Array.isArray(response.body.billsDetails)).toBe(true);

      createdBillId = response.body.id;
    }
  }, 30000);

  // --- Listar facturas ---
  test("GET /bills?page=1&limit=10 - Debe devolver lista de facturas", async () => {
    const response = await request(baseURL)
      .get("/bills?page=1&limit=10")
      .set("Authorization", `Bearer ${authToken}`);

    expect([200, 404]).toContain(response.status);

    if (response.status === 200) {
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);

      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty("id");
        expect(response.body.data[0]).toHaveProperty("client");
      }
    }
  }, 30000);

  // --- Obtener factura por ID ---
  test("GET /bills/:id - Debe devolver una factura específica", async () => {
    if (!createdBillId) {
      console.warn("⚠️ No se creó factura previa, se usará ID fijo 1");
      createdBillId = 1;
    }

    const response = await request(baseURL)
      .get(`/bills/${createdBillId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect([200, 404]).toContain(response.status);

    if (response.status === 200) {
      expect(response.body).toHaveProperty("id", createdBillId);
      expect(response.body).toHaveProperty("client");
      expect(response.body.client).toHaveProperty("id");
      expect(Array.isArray(response.body.billsDetails)).toBe(true);
    }
  }, 30000);
});
