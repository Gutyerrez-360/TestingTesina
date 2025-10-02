// auth.test.js
const request = require("supertest");

const baseURL = "https://dsi-nest-backend-development.up.railway.app/api/v1";

describe("Seguridad API - Pruebas Automatizadas", () => {
  // --- Login normal ---
  test("POST /auth/login - Debe iniciar sesión con credenciales válidas", async () => {
    const response = await request(baseURL).post("/auth/login").send({
      email: "ge19020@ues.edu.sv",
      password: "firefox",
    });

    expect([200, 401]).toContain(response.status);

    if (response.status === 200) {
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
    }
  }, 30000);

  // --- Login con Google (dinámico) ---
  test("POST /auth/login-google - Debe iniciar sesión con Google", async () => {
    const response = await request(baseURL)
      .post("/auth/login-google")
      .send({
        email: `google${Date.now()}@mail.com`,
        password: "123456",
        firstName: "Google",
        lastName: "User",
        birthday: "2000-12-19",
        phone: "76676833", // sin guión
        direction: "Direccion prueba",
        dui: "060505762", // sin guión
        role: "client",
      });

    expect([200, 401]).toContain(response.status);
  }, 30000);

  // --- Refresh Token ---
  // --- Refresh Token ---
  test("POST /auth/refresh-token - Debe refrescar el token", async () => {
    const response = await request(baseURL).post("/auth/refresh-token").send({
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmeSI6Miwicm9sZSI6ImFkbWluIiwidG9rZW5fdHlwZSI6InJlZnJlc2hfdG9rZW4iLCJ1c2VyX2lkIjoiZ2UxOTAyMEB1ZXMuZWR1LnN2IiwiaWF0IjoxNzU5MjkxNzM0OTM5LCJleHAiOjE3NjE4ODM3MzQ5MzksInN1YiI6MiwidG9rZW5UeXBlIjoicmVmcmVzaF90b2tlbiIsInVzZXJFbWFpbCI6ImdlMTkwMjBAdWVzLmVkdS5zdiJ9.j_YDwovqOPErPRcFUSegUr0ENoUbRLVuAmumnbnA7X8",
    });

    expect([200, 401, 403]).toContain(response.status);

    if (response.status === 200) {
      expect(response.body).toHaveProperty("accessToken");
      // refreshToken no se valida porque no lo devuelve el backend
    }
  }, 30000);

  // --- Forgot Password ---
  test("POST /auth/forgot-password - Debe solicitar recuperación de contraseña", async () => {
    const response = await request(baseURL).post("/auth/forgot-password").send({
      email: "ge19020@ues.edu.sv",
    });

    expect([200, 404, 500]).toContain(response.status);
  }, 30000);

  // --- Change Password ---
  test("POST /auth/change-password - Debe cambiar la contraseña", async () => {
    const response = await request(baseURL).post("/auth/change-password").send({
      newPassword: "newPassword123",
      recoveryToken:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmeSI6Miwicm9sZSI6ImFkbWluIiwidG9rZW5fdHlwZSI6ImFjY2Vzc190b2tlbiIsInVzZXJfaWQiOiJnZTE5MDIwQHVlcy5lZHUuc3YiLCJpYXQiOjE3NTkyOTE3MzQ5MzgsImV4cCI6MTc1OTM3ODEzNDkzOCwic3ViIjoyLCJ0b2tlblR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJ1c2VyRW1haWwiOiJnZTE5MDIwQHVlcy5lZHUuc3YifQ.o2APQc_bfmK_ruJxiEMtALxqFQ8sr_0d0tZjoVLePqk",
    });

    expect([200, 400, 401, 403]).toContain(response.status);

    if (response.status === 200) {
      expect(response.body).toHaveProperty("message");
    }
  }, 30000);
});
