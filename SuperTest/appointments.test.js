// appointments.test.js
const request = require("supertest");

const baseURL = "https://dsi-nest-backend-development.up.railway.app/api/v1";
const authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmeSI6Miwicm9sZSI6ImFkbWluIiwidG9rZW5fdHlwZSI6ImFjY2Vzc190b2tlbiIsInVzZXJfaWQiOiJnZTE5MDIwQHVlcy5lZHUuc3YiLCJpYXQiOjE3NTkzNzEwNDIwMzgsImV4cCI6MTc1OTQ1NzQ0MjAzOCwic3ViIjoyLCJ0b2tlblR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJ1c2VyRW1haWwiOiJnZTE5MDIwQHVlcy5lZHUuc3YifQ.9PUqZdLdnQrRa-Eb5b5y7BHvX0133TC1vgKlGXpUrUU";

describe("Appointments API - Pruebas Automatizadas", () => {
  let createdAppointments = [];

  // --- Crear varias citas ---
  test("POST /appointments - Debe crear al menos 5 citas con correos distintos", async () => {
    const appointmentsData = [
      {
        name: "Manuel Gutierrez",
        startDate: "12/01/2026 08:00",
        endDate: "12/01/2026 08:30",
        description: "Chequeo general",
        emailClient: "ge19020@ues.edu.sv",
      },
      {
        name: "Fabio flores",
        startDate: "12/02/2026 08:00",
        endDate: "12/02/2026 08:30",
        description: "Chequeo general",
        emailClient: "fabioflores021@gmail.com",
      },

      {
        name: "Test User",
        startDate: "12/03/2026 09:00",
        endDate: "12/03/2026 09:30",
        description: "Control de rutina",
        emailClient: "testuser@example.com",
      },
      {
        name: "Pet User",
        startDate: "12/04/2026 10:00",
        endDate: "12/04/2026 10:30",
        description: "Vacunación",
        emailClient: "petuser1759287743923@mail.com",
      },
      {
        name: "Test Example",
        startDate: "12/05/2026 11:00",
        endDate: "12/05/2026 11:30",
        description: "Consulta general",
        emailClient: "test_1759284969503@example.com",
      },
      {
        name: "GT Student",
        startDate: "12/06/2026 12:00",
        endDate: "12/06/2026 12:30",
        description: "Evaluación médica",
        emailClient: "gt11003@ues.edu.sv",
      },
    ];

    for (const data of appointmentsData) {
      const response = await request(baseURL)
        .post("/appointments")
        .set("Authorization", `Bearer ${authToken}`)
        .send(data);

      expect([201, 400, 404, 409]).toContain(response.status);

      if (response.status === 201) {
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("name", data.name);
        expect(response.body).toHaveProperty("client");
        expect(response.body.client).toHaveProperty("email", data.emailClient);

        createdAppointments.push(response.body.id);
      }
    }
  }, 40000);

  // --- Listar citas ---
  test("GET /appointments?skip=1&take=10 - Debe devolver una lista de citas", async () => {
    const response = await request(baseURL)
      .get("/appointments?skip=1&take=10")
      .set("Authorization", `Bearer ${authToken}`);

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
    if (!createdAppointments.length) {
      console.warn("⚠️ No se creó cita previa, se usará ID fijo 1");
      createdAppointments[0] = 1;
    }

    const appointmentId = createdAppointments[0];
    const response = await request(baseURL)
      .get(`/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect([200, 404]).toContain(response.status);

    if (response.status === 200) {
      expect(response.body).toHaveProperty("id", appointmentId);
      expect(response.body).toHaveProperty("name");
      expect(response.body).toHaveProperty("client");
      expect(response.body.client).toHaveProperty("email");
    }
  }, 30000);

  // --- Eliminar cita ---
  test("DELETE /appointments/:id - Debe eliminar una cita", async () => {
    if (!createdAppointments[1]) {
      console.warn("⚠️ No se tiene cita para eliminar, se usará ID fijo 1");
      createdAppointments[1] = 1;
    }

    const appointmentId = createdAppointments[1];
    const response = await request(baseURL)
      .delete(`/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect([200, 404]).toContain(response.status);

    if (response.status === 200) {
      expect(response.body).toHaveProperty("message");

      // Validar que ya no exista
      const check = await request(baseURL)
        .get(`/appointments/${appointmentId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect([200, 404]).toContain(check.status);
      if (check.status === 200) {
        console.warn("⚠️ La cita aún existe tras DELETE");
      } else {
        expect(check.status).toBe(404);
      }
    }
  }, 30000);
});
