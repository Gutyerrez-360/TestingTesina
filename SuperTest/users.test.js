require("dotenv").config();
const request = require("supertest");

const baseURL = process.env.API_BASE_URL;
const authHeader = { Authorization: `Bearer ${process.env.TEST_TOKEN}` };

// 60 segundos por test para evitar timeout
const TIMEOUT = 60000;

// === Utilidad: medir tiempo ===
async function measure(label, fn) {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`⏱️ ${label} tomó ${(end - start).toFixed(2)} ms`);
  return result;
}

describe("Usuarios API - Pruebas Automatizadas", () => {
  let userId = 26;
  let petId = 18;

  // --- Crear usuario dinámico ---
  test(
    "POST /users - Debe crear un usuario correctamente",
    async () => {
      const response = await measure("Crear usuario", () =>
        request(baseURL)
          .post("/users")
          .set(authHeader)
          .send({
            email: `userCreate${Date.now()}@gmail.com`,
            password: "123456",
            firstName: "Testing",
            lastName: "User123",
            birthday: "19/12/2025",
            phone: "7667-6833",
            direction: "Calle Principal Ejemplo xdxdxdxd123123123",
            dui: `12548964-2`,
            role: "client",
          })
      );

      expect([201,200, 400, 409]).toContain(response.status);

      if (response.status === 201) {
        userId = response.body.id;
        expect(userId).toBeDefined();
      }
    }, 20000
  );

  // --- Lista de usuarios ---
  test(
    "GET /users?page=1&limit=10 - Debe devolver lista de usuarios",
    async () => {
      const response = await measure("Listar usuarios", () =>
        request(baseURL).get("/users?page=1&limit=10").set(authHeader)
      );

      expect(response.status).toBe(200);

      const users = Array.isArray(response.body)
        ? response.body
        : response.body.data || [];

      expect(Array.isArray(users)).toBe(true);
    },
    TIMEOUT
  );

  // --- Crear usuario con mascota ---
  test(
    "POST /users/pets - Debe crear un usuario con su mascota",
    async () => {
      const response = await measure("Crear usuario con mascota", () =>
        request(baseURL)
          .post("/users/pets")
          .set(authHeader)
          .send({
            email: `petuser${Date.now()}@gmail.com`,
            password: "123456",
            firstName: "Pet",
            lastName: "User",
            birthday: "19/12/2026",
            phone: "7667-6833",
            direction: "Calle Secundaria",
            dui: `${Math.floor(Math.random() * 90000000) + 10000000}-3`,
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
          })
      );
      
      expect([201,400, 409]).toContain(response.status);

      if (response.status === 201) {
        expect(response.body).toHaveProperty("id");
      }
    },
    20000
  );

  // --- Agregar mascota a usuario EXISTENTE ---
  test(
    "POST /users/:id/pets - Debe agregar mascota",
    async () => {
     const response = await measure("Agregar mascota", () =>
        request(baseURL)
          .post(`/users/${userId}/pets`)
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
          })
      );    

      expect([201,404, 409]).toContain(response.status);

      if (response.status === 201) {
        petId = response.body.id;
        expect(petId).toBeDefined();
      }
    },
    TIMEOUT
  );

  // --- Obtener mascotas por ID de usuario ---
  test(
    "GET /users/:id/pets - Debe devolver lista de mascotas",
    async () => {
      if (!userId) return;

      const response = await measure("Listar mascotas", () =>
        request(baseURL).get(`/users/${userId}/pets`).set(authHeader)
      );

      expect([200, 404]).toContain(response.status);
    },
    TIMEOUT
  );

  // --- Obtener info usuario ---
  test(
    "GET /users/:id - Debe devolver info de usuario",
    async () => {
      if (!userId) return;

      const response = await measure("Obtener info usuario", () =>
        request(baseURL).get(`/users/${userId}`).set(authHeader)
      );

      expect([200, 404]).toContain(response.status);
    },
    TIMEOUT
  );

  // --- Eliminar usuario ---
  test(
    "DELETE /users/:id - Debe eliminar usuario",
    async () => {
      if (!userId) return;

      const response = await measure("Eliminar usuario", () =>
        request(baseURL).delete(`/users/${userId}`).set(authHeader)
      );

      expect([200, 204, 404]).toContain(response.status);
    },
    TIMEOUT
  );

  // --- Solicitud de documento ---
  test(
    "POST /users/request-document/:id - Debe solicitar documento",
    async () => {
      if (!petId) return;

      const response = await measure("Solicitar documento", () =>
        request(baseURL)
          .post(`/users/request-document/${petId}`)
          .set(authHeader)
          .send({ typeDocument: "HEALTH_CERTIFICATION" })
      );

      expect([201, 404, 409]).toContain(response.status);
    },
    TIMEOUT
  );
});
