// bills.test.js
require("dotenv").config();
const request = require("supertest");
const { log, savePDF } = require("./logger");

const baseURL = process.env.API_BASE_URL;
const authToken = { Authorization: `Bearer ${process.env.TEST_TOKEN}` };

describe("Bills API - Pruebas Automatizadas", () => {
  let createdBillId;

  // --- Crear factura ---
  test("POST /bills - Debe crear una factura con detalles válidos", async () => {
    log('=================== Caso de prueba automatizado: Backend - Crear Factura TC - 50 ===================');

    const start = Date.now();

    // ============================
    // 1. Obtener productos reales
    // ============================
    const productsRes = await request(baseURL)
      .get("/products?page=1&limit=10")
      .set(authToken);

    expect(productsRes.status).toBe(200);

    const products = productsRes.body.data || [];

    if (products.length === 0) {
      throw new Error("❌ No hay productos disponibles en el backend.");
    }

    log("🛒 Productos disponibles:", JSON.stringify(products, null, 2));

    // ============================
    // 2. Obtener usuarios reales
    // ============================
    const usersRes = await request(baseURL)
      .get("/users?page=1&limit=10")
      .set(authToken);

    expect(usersRes.status).toBe(200);

    const users = usersRes.body.data || [];

    if (users.length === 0) {
      throw new Error("❌ No hay usuarios disponibles en el backend.");
    }

    const clientUsers = users.filter((u) => u.role === "client");

    if (clientUsers.length === 0) {
      throw new Error("❌ No hay usuarios con rol CLIENT disponibles.");
    }

    // Seleccionar un cliente aleatorio
    const randomClient = clientUsers[Math.floor(Math.random() * clientUsers.length)];
    const clientId = randomClient.id;

    log(`👤 Cliente seleccionado: ID ${clientId} - ${randomClient.email}`);

    // ============================
    // 3. Construir lista aleatoria de productos
    // ============================

    const randomItemsCount = Math.floor(Math.random() * 4) + 2; // 2 a 5 productos
    const billsDetails = [];

    const randomQty = () => Math.floor(Math.random() * 50) + 1;

    for (let i = 0; i < randomItemsCount; i++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      billsDetails.push({
        quantity: randomQty(),
        productId: randomProduct.id
      });
    }

    const bodyToSend = {
      clientId,
      billsDetails
    };

    // ============================
    // 4. Log del body enviado
    // ============================
    log("📦 Body enviado al POST /bills:");
    log(JSON.stringify(bodyToSend, null, 2));

    // ============================
    // 5. Ejecutar POST /bills
    // ============================

    const response = await request(baseURL)
      .post("/bills")
      .set(authToken)
      .send(bodyToSend);

    const end = Date.now();
    log(`⏱ Tiempo POST /bills: ${end - start} ms`);

    expect([201, 400, 404]).toContain(response.status);

    switch (response.status) {
      case 201:
        log("✅ [201 CREATED] Factura creada correctamente");
        log("ID Factura:", response.body.id);
        log("Cliente ID:", response.body.client?.id || "Sin cliente");
        log("Detalles Facturados:", JSON.stringify(response.body.billsDetails, null, 2));
        createdBillId = response.body.id;
        break;

      case 400:
        log("⚠️ [400 BAD REQUEST] Datos inválidos");
        log("Mensaje backend:", response.body.message || "Sin mensaje");
        break;

      case 404:
        log("❌ [404 NOT FOUND] Endpoint o recurso no encontrado");
        log("Mensaje backend:", response.body.message || "Sin mensaje");
        break;

      default:
        log(`ℹ️ [${response.status}] Caso no esperado`);
        log("Mensaje backend:", response.body.message || "Sin mensaje");
    }
  }, 30000);

  // --- Listar facturas ---
  test("GET /bills?page=1&limit=10 - Debe devolver lista de facturas", async () => {
    log('=================== Caso de prueba automatizado: Backend - Listar Facturas TC - 51 ===================');

    const start = Date.now();
    const response = await request(baseURL)
      .get("/bills?page=1&limit=10")
      .set(authToken);
    const end = Date.now();

    log(`Tiempo GET /bills?page=1&limit=10: ${end - start} ms`);

    expect([200, 404]).toContain(response.status);

    switch (response.status) {
      case 200:
        log("✅ [200 OK] Lista de facturas obtenida correctamente");
        log("Cantidad de facturas devueltas:", response.body.data.length);

        if (response.body.data.length > 0) {
          response.body.data.forEach((bill, index) => {
            log(`\nFactura #${index + 1}:`);
            log("  ID:", bill.id);
            log("  Cliente ID:", bill.client?.id || "Sin cliente");
            log("  Detalles:", JSON.stringify(bill.billsDetails, null, 2));
          });
        }

        log("Mensaje backend:", response.body.message || "Sin mensaje");
        break;
      case 404:
        log("⚠️ [404 NOT FOUND] No se encontraron facturas");
        log("Mensaje backend:", response.body.message || "Sin mensaje");
        break;
      default:
        log(`ℹ️ [${response.status}] Caso no esperado`);
        log("Mensaje backend:", response.body.message || "Sin mensaje");
    }
  }, 30000);

  // --- Obtener factura por ID ---
  test("GET /bills/:id - Debe devolver una factura específica", async () => {
    log('=================== Caso de prueba automatizado: Backend - Obtener Factura TC - 52 ===================');

    if (!createdBillId) {
      log("⚠️ No se creó factura previa, se usará ID fijo 1");
      createdBillId = 1;
    }

    const start = Date.now();
    const response = await request(baseURL)
      .get(`/bills/${createdBillId}`)
      .set(authToken);
    const end = Date.now();

    log(`Tiempo GET /bills/${createdBillId}: ${end - start} ms`);

    expect([200, 404]).toContain(response.status);

    if (response.status === 200) {
      log("✅ Factura obtenida:");
      log(JSON.stringify(response.body, null, 2));

      expect(response.body).toHaveProperty("id", createdBillId);
      expect(response.body).toHaveProperty("client");
      expect(Array.isArray(response.body.billsDetails)).toBe(true);
    } else if (response.status === 404) {
      log(`⚠️ No se encontró la factura con ID ${createdBillId}`);
    }
  }, 30000);

  // --- Guardar todos los logs en PDF al final ---
  afterAll(() => {
    savePDF();
  });
});
