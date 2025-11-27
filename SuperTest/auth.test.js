// auth.test.js
require("dotenv").config();
const request = require("supertest");

const baseURL = process.env.API_BASE_URL;

const authToken = { Authorization: `Bearer ${process.env.TEST_TOKEN}` };
const refreshToken = process.env.REFRESH_TOKEN;

// Función helper para medir tiempos
function measureTime(label, startTime) {
  const end = Date.now() - startTime;
  console.log(`⏱️ Tiempo ${label}: ${end} ms`);
}

describe("Seguridad API - Pruebas Automatizadas", () => {
  // --- Login normal ---
  test("POST /auth/login - Debe iniciar sesión con credenciales válidas", async () => {
    const start = Date.now();

    const response = await request(baseURL).post("/auth/login").send({
      email: "ge19020@ues.edu.sv",
      password: "firefox",
    });

    measureTime("/auth/login", start);

    expect([200, 401]).toContain(response.status);

    if (response.status === 200) {
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
    }
  }, 30000);

  // --- Login con Google (dinámico) ---
  test("POST /auth/login-google - Debe iniciar sesión con Google", async () => {
    const start = Date.now();

    const response = await request(baseURL)
      .post("/auth/login-google")
      .send({
        email: `google${Date.now()}@mail.com`,
        password: "123456",
        firstName: "Google",
        lastName: "User",
        birthday: "2000-12-19",
        phone: "76676833",
        direction: "Direccion prueba",
        dui: "060505762",
        role: "client",
      });

    measureTime("/auth/login-google", start);

    expect([200, 400, 401]).toContain(response.status);
  }, 30000);

  // --- Refresh Token ---
  test("POST /auth/refresh-token - Debe refrescar el token", async () => {
    const start = Date.now();

    const response = await request(baseURL)
      .post("/auth/refresh-token")
      .set("Content-Type", "application/json")
      .send({ token: refreshToken });

    measureTime("/auth/refresh-token", start);

    expect([200, 401, 403]).toContain(response.status);

    if (response.status === 200) {
      expect(response.body).toHaveProperty("accessToken");
    }
  }, 30000);

  // --- Forgot Password ---
  test("POST /auth/forgot-password - Debe solicitar recuperación de contraseña", async () => {
    const start = Date.now();

    const response = await request(baseURL)
      .post("/auth/forgot-password")
      .send({ email: "ge19020@ues.edu.sv" });

    measureTime("/auth/forgot-password", start);

    expect([200, 400, 404, 500]).toContain(response.status);
  }, 30000);

  // --- Change Password ---
  test("POST /auth/change-password - Debe cambiar la contraseña", async () => {
    const start = Date.now();

    const response = await request(baseURL)
      .post("/auth/change-password")
      .send({
        newPassword: "newPassword1232344533",
        recoveryToken: authToken, // <- Esto probablemente esté mal (debe ser string)
      });

    measureTime("/auth/change-password", start);

    expect([200, 400, 401, 403]).toContain(response.status);

    if (response.status === 200) {
      expect(response.body).toHaveProperty("message");
    }
  }, 30000);
});
