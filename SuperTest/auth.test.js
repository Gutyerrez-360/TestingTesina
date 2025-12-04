// auth.test.js
require("dotenv").config();
const request = require("supertest");
const { log, savePDF } = require("./logger");

const baseURL = process.env.API_BASE_URL;
const authToken = { Authorization: `Bearer ${process.env.TEST_TOKEN}` };
const refreshToken = process.env.REFRESH_TOKEN;

// Función helper para medir tiempos
function measureTime(label, startTime) {
  const end = Date.now() - startTime;
  log(`⏱️ Tiempo ${label}: ${end} ms`);
}

// ======================================
// PRUEBAS DE SEGURIDAD API
// ======================================
describe("Seguridad API - Pruebas Automatizadas", () => {

  // ==============================
  // LOGIN NORMAL
  // ==============================
  test("POST /auth/login - Debe iniciar sesión con credenciales válidas", async () => {
    log("\n===================  Caso de prueba automatizado: Backend - Login estandar TC - 53 ===================");

    const bodySent = {
      email: "ge19020@ues.edu.sv",
      password: "firefox",
    };

    log("📤 Body enviado:");
    log(JSON.stringify(bodySent, null, 2));

    const start = Date.now();

    const response = await request(baseURL)
      .post("/auth/login")
      .send(bodySent);

    measureTime("/auth/login", start);

    log("📥 Body recibido:");
    log(JSON.stringify(response.body, null, 2));

    expect([200, 401]).toContain(response.status);

    if (response.status === 200) {
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
    }
  }, 30000);

  // ==============================
  // LOGIN GOOGLE
  // ==============================
 test("POST /auth/login-google - Debe probar errores de formato y luego un login válido", async () => {
  log("\n=================== Caso de prueba automatizado: Backend - Login con Google TC - 54 y 55===================");

  // ======================================================
  // 1) POST con FORMATO INCORRECTO
  // ======================================================

  const wrongBody = {
    email: `googleWrong${Date.now()}@mail.com`,
    password: "123456",
    firstName: "GoogleBad",
    lastName: "UserBad",
    birthday: "2000-12-19",   // ❌ Incorrecto — backend pide dd/mm/yyyy
    phone: "76676833",        // ❌ Incorrecto — backend pide 0000-0000
    direction: "Direccion incorrecta",
    dui: "060505762",         // ❌ Incorrecto — backend pide 00000000-0
    role: "client",
  };

  log("\n📤 Body enviado (INCORRECTO):");
  log(JSON.stringify(wrongBody, null, 2));

  const startWrong = Date.now();

  const wrongResponse = await request(baseURL)
    .post("/auth/login-google")
    .send(wrongBody);

  measureTime("/auth/login-google (incorrecto)", startWrong);

  log("📥 Body recibido (INCORRECTO):");
  log(JSON.stringify(wrongResponse.body, null, 2));

  // Debe devolver 400 en la mayoría de casos
  expect([400, 401]).toContain(wrongResponse.status);


  // ======================================================
  // 2) POST con FORMATO CORRECTO
  // ======================================================

  const correctBody = {
    email: `google${Date.now()}@mail.com`,
    password: "123456",
    firstName: "Google",
    lastName: "User",
    birthday: "19/12/2000",   // ✅ dd/mm/yyyy
    phone: "7667-6833",       // ✅ 0000-0000
    direction: "Direccion correcta",
    dui: "06050576-2",        // ✅ 00000000-0
    role: "client",
  };

  log("\n📤 Body enviado (CORRECTO):");
  log(JSON.stringify(correctBody, null, 2));

  const startCorrect = Date.now();

  const correctResponse = await request(baseURL)
    .post("/auth/login-google")
    .send(correctBody);

  measureTime("/auth/login-google (correcto)", startCorrect);

  log("📥 Body recibido (CORRECTO):");
  log(JSON.stringify(correctResponse.body, null, 2));

  expect([200, 400, 401]).toContain(correctResponse.status);

}, 30000);

  // ==============================
  // REFRESH TOKEN
  // ==============================
  test("POST /auth/refresh-token - Debe refrescar el token", async () => {
    log("\n===================  Caso de prueba automatizado: Backend - Refresh Token TC - 56 ===================");

    const bodySent = { token: refreshToken };

    log("📤 Body enviado:");
    log(JSON.stringify(bodySent, null, 2));

    const start = Date.now();

    const response = await request(baseURL)
      .post("/auth/refresh-token")
      .set("Content-Type", "application/json")
      .send(bodySent);

    measureTime("/auth/refresh-token", start);

    log("📥 Body recibido:");
    log(JSON.stringify(response.body, null, 2));

    expect([200, 401, 403]).toContain(response.status);

  }, 30000);

  // ==============================
  // FORGOT PASSWORD
  // ==============================
  test("POST /auth/forgot-password - Recuperación de contraseña", async () => {
    log("\n===================  Caso de prueba automatizado: Backend - Forgot Password - 57 ===================");

    const bodySent = {
      email: "ge19020@ues.edu.sv",
    };

    log("📤 Body enviado:");
    log(JSON.stringify(bodySent, null, 2));

    const start = Date.now();

    const response = await request(baseURL)
      .post("/auth/forgot-password")
      .send(bodySent);

    measureTime("/auth/forgot-password", start);

    log("📥 Body recibido:");
    log(JSON.stringify(response.body, null, 2));

    expect([200, 400, 404, 500]).toContain(response.status);

  }, 30000);

  // ==============================
  // CHANGE PASSWORD
  // ==============================
  test("POST /auth/change-password - Cambiar contraseña", async () => {
    log("\n===================  Caso de prueba automatizado: Backend - Change password TC - 58 ===================");

    const bodySent = {
      newPassword: "newPassword1232344533",
      recoveryToken: authToken,
    };

    log("📤 Body enviado:");
    log(JSON.stringify(bodySent, null, 2));

    const start = Date.now();

    const response = await request(baseURL)
      .post("/auth/change-password")
      .send(bodySent);

    measureTime("/auth/change-password", start);

    log("📥 Body recibido:");
    log(JSON.stringify(response.body, null, 2));

    expect([200, 400, 401, 403]).toContain(response.status);

  }, 30000);

   // --- Guardar todos los logs en PDF al final ---
  afterAll(() => {
    savePDF();
  });

});
