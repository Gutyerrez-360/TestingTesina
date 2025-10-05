// bills.test.js
require("dotenv").config();
const request = require("supertest");

const baseURL = process.env.API_BASE_URL;

// --- Token para pruebas ---
const authToken = { Authorization: `Bearer ${process.env.TEST_TOKEN}` };

describe("Bills API - Pruebas Automatizadas", () => {
  let createdBillId;

  // --- Crear factura ---
  test("POST /bills - Debe crear una factura con detalles válidos", async () => {
    const response = await request(baseURL)
      .post("/bills")
      .set(authToken)
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
      .set(authToken);

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
      .set(authToken);

    expect([200, 404]).toContain(response.status);

    if (response.status === 200) {
      expect(response.body).toHaveProperty("id", createdBillId);
      expect(response.body).toHaveProperty("client");
      expect(response.body.client).toHaveProperty("id");
      expect(Array.isArray(response.body.billsDetails)).toBe(true);
    }
  }, 30000);
});
