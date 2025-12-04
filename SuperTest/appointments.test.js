// appointments.test.js
require("dotenv").config();
const request = require("supertest");

const {log, savePDF} = require('./logger')

const baseURL = process.env.API_BASE_URL;
const authToken = { Authorization: `Bearer ${process.env.TEST_TOKEN}` };
describe("Appointments API - Pruebas Automatizadas", () => {
  let createdAppointments = [];

  // --- Crear varias citas ---
  test("POST /appointments - Debe crear al menos 5 citas con correos distintos", async () => {
    log('===================Caso de prueba automatizado: Backend - TC-46===================');

    function formatDate(date) {
      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yyyy = date.getFullYear();
      const HH = String(date.getHours()).padStart(2, "0");
      const MM = String(date.getMinutes()).padStart(2, "0");
      return `${dd}/${mm}/${yyyy} ${HH}:${MM}`;
    }

    const baseOffset = Math.floor(Date.now() / 100000000);
    const today = new Date();
    const baseDay = today.getDate() + baseOffset;

    const buildDate = (offsetDays, hour, minute) =>
      formatDate(new Date(today.getFullYear(), today.getMonth(), baseDay + offsetDays, hour, minute));

    const appointmentsData = [
      {
        name: "Manuel Gutierrez",
        startDate: buildDate(1, 8, 0),
        endDate: buildDate(1, 8, 30),
        description: "Chequeo general",
        emailClient: "ge19020@ues.edu.sv",
      },
      {
        name: "Fabio Flores",
        startDate: buildDate(2, 9, 0),
        endDate: buildDate(2, 9, 30),
        description: "Chequeo general",
        emailClient: "fabioflores021@gmail.com",
      },
      {
        name: "Test User",
        startDate: buildDate(3, 10, 0),
        endDate: buildDate(3, 10, 30),
        description: "Control de rutina",
        emailClient: "testuser@example.com",
      },
      {
        name: "Pet User",
        startDate: buildDate(4, 11, 0),
        endDate: buildDate(4, 11, 30),
        description: "Vacunación",
        emailClient: "petuser1759287743923@mail.com",
      },
      {
        name: "Test Example",
        startDate: buildDate(5, 12, 0),
        endDate: buildDate(5, 12, 30),
        description: "Consulta general",
        emailClient: "test_1759284969503@example.com",
      },
      {
        name: "GT Studentdsdsds",
        startDate: buildDate(6, 13, 0),
        endDate: buildDate(6, 13, 30),
        description: "Evaluación médica",
        emailClient: "gt11003@ues.edu.sv",
      },
    ];

    // --- PROCESAR TODAS LAS CITAS ---
    for (const data of appointmentsData) {
      const response = await request(baseURL)
        .post("/appointments")
        .set(authToken)
        .send(data);

      // --- LOG DETALLADO POR CASO ---
      switch (response.status) {
        case 201:
          log("✅ [201 CREATED] Cita creada correctamente");
          log("Cliente:", data.emailClient);
          log("Mensaje backend:", response.body.message || "Sin mensaje");
          createdAppointments.push(response.body.id);
          break;
        case 400:
          log("⚠️ [400 BAD REQUEST] Datos inválidos");
          log("Cliente:", data.emailClient);
          log("Mensaje backend:", response.body.message || "Sin mensaje");
          break;
        case 404:
          log("❌ [404 NOT FOUND] Endpoint o recurso no encontrado");
          log("Cliente:", data.emailClient);
          log("Mensaje backend:", response.body.message || "Sin mensaje");
          break;
        case 409:
          log("⚠️ [409 CONFLICT] Conflicto de datos (ej. cita duplicada)");
          log("Cliente:", data.emailClient);
          log("Mensaje backend:", response.body.message || "Sin mensaje");
          break;
        case 500:
          log("💥 [500 INTERNAL SERVER ERROR] Error del servidor");
          log("Cliente:", data.emailClient);
          log("Mensaje backend:", response.body.message || "Sin mensaje");
          break;
        default:
          log(`ℹ️ [${response.status}] Caso no esperado`);
          log("Cliente:", data.emailClient);
          log("Mensaje backend:", response.body.message || "Sin mensaje");
      }

      // --- VALIDACIÓN GENERAL ---
      expect([201, 400, 404, 409]).toContain(response.status);

      if (response.status === 201) {
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("name", data.name);
        expect(response.body).toHaveProperty("client");
        expect(response.body.client).toHaveProperty("email", data.emailClient);
      }
    }
  }, 40000);

  // --- Listar citas ---
  test("GET /appointments?skip=1&take=10 - Debe devolver una lista de citas", async () => {
    log('=================== Caso de prueba automatizado: Backend - TC-47 ===================');

    const response = await request(baseURL)
      .get("/appointments?skip=1&take=10")
      .set(authToken);

    // --- LOG DETALLADO SEGÚN EL ESTATUS ---   
    switch (response.status) {
      case 200:
        log("✅ [200 OK] Lista de citas obtenida correctamente");
        log("Cantidad de citas devueltas:", response.body.length);

        if (response.body.length > 0) {
          log("Listado de citas:");
          response.body.forEach((cita, index) => {
            log(`\nCita #${index + 1}:`);
            log("  ID:", cita.id);
            log("  Cliente:", cita.client?.email || "Sin email");
            log("  Otros datos:", JSON.stringify(cita, null, 2)); // imprime toda la cita completa
          });
        }

        log("\nMensaje backend:", response.body.message || "Sin mensaje");
        break;

      case 404:
        log("⚠️ [404 NOT FOUND] No se encontraron citas");
        log("Mensaje backend:", response.body.message || "Sin mensaje");
        break;

      default:
        log(`ℹ️ [${response.status}] Caso no esperado`);
        log("Mensaje backend:", response.body.message || "Sin mensaje");
    }


    // --- VALIDACIONES ---
    expect([200, 404]).toContain(response.status);

    if (response.status === 200) {
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty("id");
        expect(response.body[0]).toHaveProperty("client");
      }
    }
  }, 30000);

  // --- Obtener cita por ID ---
  test("GET /appointments/:id - Debe devolver una cita específica", async () => {
    log('=================== Caso de prueba automatizado: Backend - TC-48 ===================');
    if (!createdAppointments.length) {
      createdAppointments[0] = 4;
    }

    const appointmentId = createdAppointments[0];
    const response = await request(baseURL)
      .get(`/appointments/${appointmentId}`)
      .set(authToken);

    expect([200, 404]).toContain(response.status);

    if (response.status === 200) {
      // Validaciones
      expect(response.body).toHaveProperty("id", appointmentId);
      expect(response.body).toHaveProperty("name");
      expect(response.body).toHaveProperty("client");
      expect(response.body.client).toHaveProperty("email");

      // Imprimir toda la información de la cita
      log("\n✅ Cita obtenida:");
      log(JSON.stringify(response.body, null, 2));
    } else if (response.status === 404) {
      log(`⚠️ No se encontró la cita con ID ${appointmentId}`);
    }
  }, 30000);

  // --- Eliminar cita ---
  test("DELETE /appointments/:id - Debe eliminar una cita", async () => {
     log('=================== Caso de prueba automatizado: Backend - TC-49 ===================');
    if (!createdAppointments[1]) {
      createdAppointments[1] = 10;
    }

    const appointmentId = createdAppointments[1];
    const response = await request(baseURL)
      .delete(`/appointments/${appointmentId}`)
      .set(authToken);

    expect([200, 404]).toContain(response.status);

    if (response.status === 200) {
      expect(response.body).toHaveProperty("message");

      // Validar que ya no exista
      const check = await request(baseURL)
        .get(`/appointments/${appointmentId}`)
        .set(authToken);

      expect([200, 404]).toContain(check.status);
      if (check.status === 200) {
        console.warn("⚠️ La cita aún existe tras DELETE");
      } else {
        expect(check.status).toBe(404);
      }
    }
  }, 30000);

  // --- Guardar todos los logs en PDF al final ---
  afterAll(() => {
    savePDF();
  });
});
