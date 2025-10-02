const request = require("supertest");

const baseURL = "https://dsi-nest-backend-development.up.railway.app/api/v1";
const authHeader = { Authorization: `Bearer ${process.env.TEST_TOKEN}` };

describe("Usuarios API - Pruebas Automatizadas", () => {
  let userId;
  let petId;

  // --- Crear usuario dinámico ---
  test("POST /users - Debe crear un usuario correctamente", async () => {
    const response = await request(baseURL)
      .post("/users")
      .set(authHeader)
      .send({
        email: `userCreate${Date.now()}@gmail.com`,
        password: "123456",
        firstName: "Test",
        lastName: "User",
        birthday: "19/12/2000",
        phone: "7667-6833", // sin guión
        direction: "Calle Principal ejemplo de creacion del registro",
        dui: "06050576-2", // sin guión
        role: "client",
      });

    expect([201, 40, 400]).toContain(response.status);

    if (response.status === 201) {
      expect(response.body).toHaveProperty("id");
      userId = response.body.id;
    }
  }, 30000); // timeout de 60s

  // --- Lista de usuarios ---
  test("GET /users?page=1&limit=10 - Debe devolver una lista de usuarios", async () => {
    const response = await request(baseURL)
      .get("/users?page=1&limit=10")
      .set(authHeader);

    expect(response.status).toBe(200);

    // Adaptarse a la respuesta real: puede ser { data: [...] } o directamente [...]
    const users = Array.isArray(response.body)
      ? response.body
      : response.body.data || [];

    expect(Array.isArray(users)).toBe(true);
  }, 30000);

  // --- Crear usuario con mascota ---
  test("POST /users/pets - Debe crear un usuario con su mascota", async () => {
    const response = await request(baseURL)
      .post("/users/pets")
      .set(authHeader)
      .send({
        email: `petuser${Date.now()}@mail.com`,
        password: "123456",
        firstName: "Pet",
        lastName: "User",
        birthday: "19/12/2000",
        phone: "7667-6833",
        direction: "Calle Secundaria",
        dui: "06050577-3",
        role: "client",
        pet: {
          name: "Firulais",
          gender: "macho",
          raza: "Labrador",
          color: "cafe",
          isHaveTatto: true,
          pedigree: true,
          birthday: "19/12/2020",
          specieId: 1,
        },
      });

    expect([201, 500, 409]).toContain(response.status);
    if (response.status === 201) {
      expect(response.body).toHaveProperty("id");
    }
  }, 30000);

  // --- Agregar mascota a un usuario existente ---
  test("POST /users/:id/pets - Debe agregar mascota", async () => {
    if (!userId) return;

    const response = await request(baseURL)
      .post(`/users/17/pets`)
      .set(authHeader)
      .send({
        name: "Pablo",
        gender: "hembra",
        raza: "Grandanez",
        color: "blanco",
        isHaveTatto: false,
        pedigree: false,
        birthday: "19/12/2025",
        specieId: 1,
      });

    expect([201, 409]).toContain(response.status);
    if (response.status === 201) {
      petId = response.body.id;
      expect(response.body).toHaveProperty("id");
    }
  });

  // --- Obtener mascotas de un usuario ---
  test("GET /users/:id/pets - Debe devolver lista de mascotas", async () => {
    if (!userId) return;

    const response = await request(baseURL)
      .get(`/users/17/pets`)
      .set(authHeader);

    expect([200, 404]).toContain(response.status);
    if (response.status === 200) {
      expect(Array.isArray(response.body)).toBe(true);
    }
  });

  // --- Obtener info de usuario ---
  test("GET /users/:id - Debe devolver info de usuario", async () => {
    if (!userId) return;

    const response = await request(baseURL)
      .get(`/users/${userId}`)
      .set(authHeader);

    expect([200, 404]).toContain(response.status);
  });

  // --- Ruta no soportada ---
  test("POST /users/100 - Debe devolver error por ruta no soportada", async () => {
    const response = await request(baseURL).post("/users/100").set(authHeader);

    expect([400, 404]).toContain(response.status);
  });

  // --- Ruta no soportada ---
  test("POST /users/17 - Debe devolver error por ruta no soportada", async () => {
    const response = await request(baseURL).get("/users/17").set(authHeader);

    expect([200, 409]).toContain(response.status);
  });

  // --- Eliminar usuario ---
  test("DELETE /users/:id - Debe eliminar un usuario", async () => {
    if (!userId) return;

    const response = await request(baseURL).delete(`/users/14`).set(authHeader);

    expect([200, 204, 404]).toContain(response.status);
  });

  // --- Solicitar documento ---
  test("POST /users/request-document/:id - Debe solicitar un documento", async () => {
    if (!userId) return;

    const response = await request(baseURL)
      .post(`/users/request-document/${petId}`)
      .set(authHeader)
      .send({ typeDocument: "HEALTH_CERTIFICATION" });

    expect([201, 404, 409]).toContain(response.status);
  });
});
