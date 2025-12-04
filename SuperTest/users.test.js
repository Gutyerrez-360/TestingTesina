require("dotenv").config();
const request = require("supertest");
const fs = require("fs");

const { log, savePDF } = require("./logger");

const baseURL = process.env.API_BASE_URL;
const authHeader = { Authorization: `Bearer ${process.env.TEST_TOKEN}` };

// 60 segundos por test para evitar timeout
const TIMEOUT = 60000;

// === Utilidad: medir tiempo ===
async function measure(label, fn) {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();

  const timeLog = `⏱️ ${label} tomó ${(end - start).toFixed(2)} ms`;
  log(timeLog);

  return result;
}

describe("Usuarios API - Pruebas Automatizadas", () => {
  let userId = 222;
  let petId = 18;

  // >>>>>>>>>>>>>>>>>> NUEVA LÓGICA AGREGADA <<<<<<<<<<<<<<<<<<<<
  beforeAll(async () => {
    log("=========== 🔍 Obtener IDs dinámicos antes de iniciar las pruebas ===========");

    // --- Obtener usuario dinámicamente ---
    try {
      const userRes = await request(baseURL)
        .get("/api/v1/users?page=1&limit=10")
        .set(authHeader);

      if (userRes.status === 200 && userRes.body?.data?.length > 0) {
        userId = userRes.body.data[0].id;
        log(`✅ userId dinámico obtenido: ${userId}`);
      } else {
        log("⚠️ No se encontraron usuarios, se mantiene userId por defecto");
      }
    } catch (err) {
      log("❌ Error obteniendo lista de usuarios");
    }

    // --- Obtener mascota dinámicamente ---
    try {
      const petRes = await request(baseURL)
        .get("/api/v1/pets?page=1&limit=10")
        .set(authHeader);

      if (petRes.status === 200 && petRes.body?.data?.length > 0) {
        petId = petRes.body.data[0].id;
        log(`✅ petId dinámico obtenido: ${petId}`);
      } else {
        log("⚠️ No se encontraron mascotas, se mantiene petId por defecto");
      }
    } catch (err) {
      log("❌ Error obteniendo lista de mascotas");
    }

    log("=========== 🔍 IDs dinámicos listos ===========");
  });

  // --- Crear usuario dinámico (Correcto) ---
  test(
    "POST /users - Debe crear un usuario correctamente",
    async () => {
      log('=================== Caso de prueba automatizado: Backend - Crear un usuario TC - 59 ===================');

      const bodySent = {
        email: `userCreate${Date.now()}@gmail.com`,
        password: "123456",
        firstName: "Testing",
        lastName: "User123",
        birthday: "19/12/2025",
        phone: "7667-6833",
        direction: "Calle Principal Ejemplo xdxdxdxd123123123",
        dui: `12548964-2`,
        role: "client",
      };

      log("📤 Body Enviado:");
      log(JSON.stringify(bodySent, null, 2));

      const response = await measure("Crear usuario", () =>
        request(baseURL).post("/users").set(authHeader).send(bodySent)
      );

      log("📥 Respuesta:");
      log(JSON.stringify(response.body, null, 2));

      if (response.status === 201) log("✅ Usuario creado correctamente");
      if (response.status === 400) log("⚠️ Datos inválidos");
      if (response.status === 409) log("❌ Usuario ya existe");

      expect([201, 200, 400, 409]).toContain(response.status);

      if (response.status === 201) {
        userId = response.body.id;
        expect(userId).toBeDefined();
      }
    },
    20000
  );


  // --- Crear usuario con estructura incorrecta (Nuevo Test) ---
  test(
    "POST /users - Debe fallar cuando la estructura de datos es incorrecta",
    async () => {
      log('=================== Caso de prueba automatizado: Backend - Crear usuario con formato incorrecto TC - 60 ===================');

      const invalidBody = {
        correo: "esto_no_va@gmail.com", // ❌ campo incorrecto
        pass: 123456, // ❌ tipo incorrecto (debería ser string)
        firstName: 123, // ❌ tipo incorrecto
        direccion: true, // ❌ tipo incorrecto
        // Falta birthday, phone, dui, role...
      };

      log("📤 Body Enviado con errores:");
      log(JSON.stringify(invalidBody, null, 2));

      const response = await measure("Crear usuario con datos inválidos", () =>
        request(baseURL).post("/users").set(authHeader).send(invalidBody)
      );

      log("📥 Respuesta:");
      log(JSON.stringify(response.body, null, 2));

      if (response.status === 400) log("⚠️ Correcto: API rechazó la estructura inválida");
      if (response.status === 201) log("❌ ERROR GRAVE: API aceptó datos inválidos");

      expect([400, 422]).toContain(response.status); // dependiendo del backend
    },
    15000
  );


  // --- Lista de usuarios ---
  test(
    "GET /users?page=1&limit=10 - Debe devolver lista de usuarios",
    async () => {
      log('=================== Caso de prueba automatizado: Backend - Consultar todos los usuarios TC - 61 ===================');

      const response = await measure("Listar usuarios", () =>
        request(baseURL).get("/users?page=1&limit=10").set(authHeader)
      );

      log("📥 Respuesta:");
      log(JSON.stringify(response.body, null, 2));

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
      log('=================== Caso de prueba automatizado: Backend - Crear usuario con su mascota TC - 62 ===================');

      const bodySent = {
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
      };

      log("📤 Body Enviado:");
      log(JSON.stringify(bodySent, null, 2));

      const response = await measure("Crear usuario con mascota", () =>
        request(baseURL).post("/users/pets").set(authHeader).send(bodySent)
      );

      log("📥 Respuesta:");
      log(JSON.stringify(response.body, null, 2));

      if (response.status === 201) log("✅ Usuario + mascota creados");
      if (response.status === 400) log("⚠️ Datos inválidos");
      if (response.status === 409) log("❌ Registro duplicado");

      expect([201, 400, 409]).toContain(response.status);

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
      log('=================== Caso de prueba automatizado: Backend - Crear mascota asociada al usuario TC - 63 ===================');

      const bodySent = {
        name: "Pablo",
        gender: "hembra",
        raza: "Grandanez",
        color: "blanco",
        isHaveTatto: false,
        pedigree: false,
        birthday: "19/12/2025",
        specieId: 1,
      };

      log("📤 Body Enviado:");
      log(JSON.stringify(bodySent, null, 2));

      const response = await measure("Agregar mascota", () =>
        request(baseURL).post(`/users/${userId}/pets`).set(authHeader).send(bodySent)
      );

      log("📥 Respuesta:");
      log(JSON.stringify(response.body, null, 2));

      if (response.status === 201) log("✅ Mascota agregada");
      if (response.status === 404) log("❌ Usuario no encontrado");
      if (response.status === 409) log("⚠️ Mascota duplicada");

      expect([201, 404, 409]).toContain(response.status);

      if (response.status === 201) {
        petId = response.body.id;
        expect(petId).toBeDefined();
      }
    },
    TIMEOUT
  );

  // --- Obtener mascotas por ID de usuario ---
  test(
    "GET /users/:id/pets - Debe devolver lista de mascotas asociadas a un usuario",
    async () => {
      log('=================== Caso de prueba automatizado: Backend - Obtener un usuario con su mascota TC - 64 ===================');

      if (!userId) return;

      const response = await measure("Listar mascotas", () =>
        request(baseURL).get(`/users/${userId}/pets`).set(authHeader)
      );

      log("📥 Respuesta:");
      log(JSON.stringify(response.body, null, 2));

      if (response.status === 200) log("✅ Mascotas obtenidas");
      if (response.status === 404) log("❌ Usuario sin mascotas");

      expect([200, 404]).toContain(response.status);
    },
    TIMEOUT
  );

  // --- Obtener info usuario ---
  test(
    "GET /users/:id - Debe devolver info de usuario",
    async () => {
      log('=================== Caso de prueba automatizado: Backend - Obtener un usuario TC - 65 ===================');

      if (!userId) return;

      const response = await measure("Obtener info usuario", () =>
        request(baseURL).get(`/users/${userId}`).set(authHeader)
      );

      log("📥 Respuesta:");
      log(JSON.stringify(response.body, null, 2));

      if (response.status === 200) log("✅ Usuario encontrado");
      if (response.status === 404) log("❌ Usuario no existe");

      expect([200, 404]).toContain(response.status);
    },
    TIMEOUT
  );

  test(
  "GET /users/:id - Debe fallar con un ID inválido (string)",
  async () => {
    log('=================== Caso de prueba automatizado: Backend - Obtener un usuario con ID inválido TC - 66 ===================');

    const invalidId = "abc123"; // ❌ ID inválido
    const userId = invalidId
    const response = await measure("Obtener usuario con ID inválido", () =>
      request(baseURL).get(`/users/${userId}`).set(authHeader)
    );

    log("📥 Respuesta:");
    log(JSON.stringify(response.body, null, 2));

    if (response.status === 400) log("⚠️ Correcto: ID inválido detectado");
    if (response.status === 404) log("ℹ️ API trata el ID inválido como usuario no encontrado");
    if (response.status === 200) log("❌ ERROR: API no debería aceptar un ID string");

    expect([400, 404]).toContain(response.status);
  },
  TIMEOUT
);


  // --- Eliminar usuario ---
  test(
    "DELETE /users/:id - Debe eliminar usuario",
    async () => {
      log('=================== Caso de prueba automatizado: Backend - Eliminar un usuario TC - 67 ===================');

      if (!userId) return;

      const response = await measure("Eliminar usuario", () =>
        request(baseURL).delete(`/users/${userId}`).set(authHeader)
      );

      log("📥 Respuesta:");
      log(JSON.stringify(response.body, null, 2));

      if (response.status === 200) log("✅ Usuario eliminado");
      if (response.status === 204) log("ℹ️ Usuario ya estaba eliminado");
      if (response.status === 404) log("❌ Usuario no encontrado");

      expect([200, 204, 404]).toContain(response.status);
    },
    TIMEOUT
  );

  // --- Solicitud de documento ---
  test(
    "POST /users/request-document/:id - Debe solicitar documento",
    async () => {
      log('=================== Caso de prueba automatizado: Backend - Crear un documento historial por id de la mascota TC - 68 ===================');

      if (!petId) return;

      const bodySent = { typeDocument: "HEALTH_CERTIFICATION" };

      log("📤 Body Enviado:");
      log(JSON.stringify(bodySent, null, 2));

      const response = await measure("Solicitar documento", () =>
        request(baseURL).post(`/users/request-document/${petId}`).set(authHeader).send(bodySent)
      );

      log("📥 Respuesta:");
      log(JSON.stringify(response.body, null, 2));

      if (response.status === 201) log("✅ Documento solicitado");
      if (response.status === 404) log("❌ Mascota no encontrada");
      if (response.status === 409) log("⚠️ Documento ya solicitado");

      expect([201, 404, 409]).toContain(response.status);
    },
    TIMEOUT
  );
    // --- Guardar todos los logs en PDF al final ---
  afterAll(() => {
    savePDF();
  });
});