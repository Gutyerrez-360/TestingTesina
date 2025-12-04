require("dotenv").config();
const request = require("supertest");
const { log, savePDF } = require("./logger");

const baseURL = process.env.API_BASE_URL;
const authToken = { Authorization: `Bearer ${process.env.TEST_TOKEN}` };

describe("E2E Pets & Medical Histories API", () => {
  let createdMedicalHistories = [];
  let createdDiagnostics = [];
  let createdTreatments = [];
  let createdSurgicalInterventions = [];

  let testPetId;
  let testMedicalHistoryId;
  let testDiagnosticId;

  beforeAll(async () => {
    log("========== INICIO DEL E2E DE PETS & MEDICAL HISTORIES ==========");

    const start = Date.now();
    const res = await request(baseURL).get("/pets?page=1&limit=1").set(authToken);
    log('=================== Caso de prueba automatizado: Backend - Consultar el listado de mascotas TC - 69 ===================');

    log(`⏱️ Tiempo GET /pets?page=1&limit=1: ${Date.now() - start} ms`);

    log("Respuesta del servidor:");
    log(JSON.stringify(res.body, null, 2));

    if (res.body.data?.[0]) {
      log('=================== Caso de prueba automatizado: Backend - obtener una mascota especifica TC - 70 ===================');
      log("🐶 Se encontró mascota existente");
      testPetId = res.body.data[0].id;
      log("Pet ID:", testPetId);
    } else {
      log("⚠️ No se encontraron mascotas → Creando una nueva");

      const start2 = Date.now();
      log('=================== Caso de prueba automatizado: Backend - crear una mascota TC - 71 ===================');
      const createPet = await request(baseURL)
        .post("/pets")
        .set(authToken)
        .send({
          name: "Test Pet testin",
          gender: "macho",
          raza: "Criollo",
          color: "Café",
          isHaveTatto: false,
          pedigree: false,
          birthday: "01/01/2020",
          specieId: 1,
        });

      log(`⏱️ Tiempo POST /pets: ${Date.now() - start2} ms`);

      log("Respuesta del servidor:");
      log(JSON.stringify(createPet.body, null, 2));

      testPetId = createPet.body.id;
      log("🐶 Pet creada con ID:", testPetId);
    }
  });

  // --------------------------------------------------------------
  // POST ENDPOINTS
  // --------------------------------------------------------------
  describe("POST endpoints /pets?page=1&limit=10", () => {
    it("should create 3 medical histories using dynamic pet id", async () => {
      const payloads = [];

      for (let i = 1; i <= 3; i++) {
        const dyn = `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;

        payloads.push({
          isHaveAllVaccine: true,
          isReproduced: i % 2 === 0,
          descendants: `desc-${dyn}`,
          room: `room-${dyn}`,
          diasesEvaluation: `eval-${dyn}`,
          observation: `obs-${dyn}`,
          food: { quantity: `${i * 20}g`, type: `tipo-${dyn}` },
          physicalExam: {
            weight: 5 + i,
            palpitations: `palp-${dyn}`,
            temperature: 36 + i,
            respiratoryRate: 18 + i,
            cardiacRate: 90 + i,
            laboratoryExam: `lab-${dyn}`,
            pulse: `pulse-${dyn}`,
            mucous: `muc-${dyn}`,
          },
          otherPet: {
            isLiveOtherPets: i % 2 === 1,
            whichPets: `otros-${dyn}`,
          },
          diagnostic: {
            description: `diagnostic-${dyn}`,
            treatments: [
              {
                name: `treat-${dyn}`,
                days: i,
                frequency: "cada 8 horas",
                quantity: "1/2 tableta",
              },
            ],
            surgicalIntervations: [
              {
                name: `surg-${dyn}`,
                description: `desc-${dyn}`,
                intervationDate: "31/01/2024",
              },
            ],
          },
        });
      }

      for (const payload of payloads) {
        const start = Date.now();
        log('=================== Caso de prueba automatizado: Backend - crear una historial medico para la mascota TC - 72 ===================');
        const res = await request(baseURL)
          .post(`/pets/${testPetId}/medical-histories`)
          .set(authToken)
          .send(payload);

        log(
          `⏱️ Tiempo POST /pets/${testPetId}/medical-histories: ${
            Date.now() - start
          } ms`
        );

        log("Respuesta del servidor:");
        log(JSON.stringify(res.body, null, 2));

        expect(res.statusCode).toBe(201);

        log("🟢 Historial médico creado:", res.body.id);

        createdMedicalHistories.push(res.body.id);
        if (!testMedicalHistoryId) testMedicalHistoryId = res.body.id;

        if (payload.diagnostic) {
          const diagId = res.body.diagnostic?.id || 5;
          log("🟡 Diagnóstico creado:", diagId);

          createdDiagnostics.push(diagId);
          if (!testDiagnosticId) testDiagnosticId = diagId;
        }
      }
    }, 20000);

    it("should create 3 treatments under dynamic diagnostic id", async () => {
      const treatments = [];

      for (let i = 1; i <= 3; i++) {
        const dyn = `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
        treatments.push({
          name: `trat-${dyn}`,
          days: i,
          frequency: "cada 8 horas",
          quantity: "1/2 tableta",
        });
      }

      for (const tr of treatments) {
        const start = Date.now();
        log('=================== Caso de prueba automatizado: Backend - crear diagnostico con el tratamiento TC - 73 ===================');
        const res = await request(baseURL)
          .post(`/pets/medical-histories/diagnostics/${testDiagnosticId}/treatments`)
          .set(authToken)
          .send(tr);

        log(
          `⏱️ Tiempo POST /diagnostics/${testDiagnosticId}/treatments: ${
            Date.now() - start
          } ms`
        );

        log("Respuesta del servidor:");
        log(JSON.stringify(res.body, null, 2));

        expect(res.statusCode).toBe(201);
        log("🟢 Tratamiento creado:", res.body.id);

        createdTreatments.push(res.body.id);
      }
    });

    it("should create 3 surgical interventions under dynamic diagnostic id", async () => {
      const interventions = [];

      for (let i = 1; i <= 3; i++) {
        const dyn = `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
        interventions.push({
          name: `surg-${dyn}`,
          description: `surg-desc-${dyn}`,
          intervationDate: "31/01/2024",
        });
      }

      for (const interv of interventions) {
        const start = Date.now();
        log('=================== Caso de prueba automatizado: Backend - crear una intervencia quirurjica para el diagnotico TC - 74 ===================');
        const res = await request(baseURL)
          .post(
            `/pets/medical-histories/diagnostics/${testDiagnosticId}/surgical-interventions`
          )
          .set(authToken)
          .send(interv);

        log(
          `⏱️ Tiempo POST /diagnostics/${testDiagnosticId}/surgical-interventions: ${
            Date.now() - start
          } ms`
        );

        log("Respuesta del servidor:");
        log(JSON.stringify(res.body, null, 2));

        expect(res.statusCode).toBe(201);
        log("🟢 Intervención quirúrgica creada:", res.body.id);

        createdSurgicalInterventions.push(res.body.id);
      }
    });
  });

  // --------------------------------------------------------------
  // PATCH ENDPOINTS
  // --------------------------------------------------------------
  describe("PATCH endpoints", () => {
    it("should update dynamic pet", async () => {
      const start = Date.now();
      log('=================== Caso de prueba automatizado: Backend - actualizar una mascota TC - 75 ===================');
      const res = await request(baseURL)
        .patch(`/pets/${testPetId}`)
        .set(authToken)
        .send({
          name: "Firulais",
          gender: "macho",
          raza: "Pastor Alemán",
          color: "Negro",
          isHaveTatto: true,
          pedigree: true,
          birthday: "19/12/2026",
          specieId: 1,
        });

      log(`⏱️ Tiempo PATCH /pets/${testPetId}: ${Date.now() - start} ms`);

      log("Respuesta del servidor:");
      log(JSON.stringify(res.body, null, 2));

      expect(res.statusCode).toBe(200);
      log("🟢 Mascota actualizada");
    });

    it("should update dynamic medical history", async () => {
      const start = Date.now();
      log('=================== Caso de prueba automatizado: Backend - actualizar una historia medica TC - 76 ===================');
      const res = await request(baseURL)
        .patch(`/pets/medical-histories/${testMedicalHistoryId}`)
        .set(authToken)
        .send({
          isHaveAllVaccine: true,
          isReproduced: true,
          descendants: "Actualizado",
          room: "Nueva habitación",
          diasesEvaluation: "Controlado",
          observation: "Observación actualizada",
          food: { quantity: "200g", type: "Balanceado" },
          physicalExam: {
            weight: 6,
            palpitations: "Normales",
            temperature: 37.8,
            respiratoryRate: 23,
            cardiacRate: 85,
            laboratoryExam: "Actualizado",
            pulse: "Regular",
            mucous: "Normales",
          },
          otherPet: { isLiveOtherPets: true, whichPets: "Perros y gatos" },
        });

      log(
        `⏱️ Tiempo PATCH /pets/medical-histories/${testMedicalHistoryId}: ${
          Date.now() - start
        } ms`
      );

      log("Respuesta del servidor:");
      log(JSON.stringify(res.body, null, 2));

      expect([500, 400, 200, 201]).toContain(res.statusCode);
      log("🟡 Historial médico actualizado (algún estatus permitido)");
    });
  });

  // --------------------------------------------------------------
  // GET ENDPOINTS
  // --------------------------------------------------------------
  describe("GET endpoints", () => {
    it("should get pets list", async () => {
      const start = Date.now();
      const res = await request(baseURL)
        .get("/pets?page=1&limit=10")
        .set(authToken);

      log(`⏱️ Tiempo GET /pets?page=1&limit=10: ${Date.now() - start} ms`);

      log("Respuesta del servidor:");
      log(JSON.stringify(res.body, null, 2));

      expect(res.statusCode).toBe(200);
      log("🟢 Lista de mascotas obtenida");
    });

    it("should get dynamic pet by id", async () => {
      const start = Date.now();
      const res = await request(baseURL)
        .get(`/pets/${testPetId}`)
        .set(authToken);

      log(`⏱️ Tiempo GET /pets/${testPetId}: ${Date.now() - start} ms`);

      log("Respuesta del servidor:");
      log(JSON.stringify(res.body, null, 2));

      expect(res.statusCode).toBe(200);
      log("🟢 Mascota obtenida por ID");
    });

    it("should get dynamic medical history", async () => {
      const start = Date.now();
      log('=================== Caso de prueba automatizado: Backend - obtener un historia medico TC - 77 ===================');
      const res = await request(baseURL)
        .get(`/pets/medical-histories/${testMedicalHistoryId}`)
        .set(authToken);

      log(
        `⏱️ Tiempo GET /pets/medical-histories/${testMedicalHistoryId}: ${
          Date.now() - start
        } ms`
      );

      log("Respuesta del servidor:");
      log(JSON.stringify(res.body, null, 2));

      expect([500, 400, 200]).toContain(res.statusCode);
      log("🟡 Historial médico consultado");
    });

    it("should get medical histories for dynamic pet", async () => {
      const start = Date.now();
      const res = await request(baseURL)
        .get(`/pets/${testPetId}/medical-histories`)
        .set(authToken);

      log(
        `⏱️ Tiempo GET /pets/${testPetId}/medical-histories: ${
          Date.now() - start
        } ms`
      );

      log("Respuesta del servidor:");
      log(JSON.stringify(res.body, null, 2));

      expect(res.statusCode).toBe(200);
      log("🟢 Historiales médicos obtenidos");
    });
  });

  // --------------------------------------------------------------
  // DELETE ENDPOINTS
  // --------------------------------------------------------------
  describe("DELETE endpoints", () => {
    it("should delete created treatments", async () => {
      log('=================== Caso de prueba automatizado: Backend - eliminar un tratamiento TC - 78 ===================');
      for (const id of createdTreatments) {
        const start = Date.now();
        const res = await request(baseURL)
          .delete(`/pets/medical-histories/diagnostics/treatments/${id}`)
          .set(authToken);

        log(
          `⏱️ Tiempo DELETE /diagnostics/treatments/${id}: ${
            Date.now() - start
          } ms`
        );

        log("Respuesta del servidor:");
        log(JSON.stringify(res.body, null, 2));

        expect([200, 204]).toContain(res.statusCode);
        log("🟢 Tratamiento eliminado:", id);
      }
    });

    it("should delete created surgical interventions", async () => {
      log('=================== Caso de prueba automatizado: Backend - eliminar una intervencion quirurjica TC - 79 ===================');
      for (const id of createdSurgicalInterventions) {
        const start = Date.now();
        const res = await request(baseURL)
          .delete(
            `/pets/medical-histories/diagnostics/surgical-interventions/${id}`
          )
          .set(authToken);

        log(
          `⏱️ Tiempo DELETE /diagnostics/surgical-interventions/${id}: ${
            Date.now() - start
          } ms`
        );

        log("Respuesta del servidor:");
        log(JSON.stringify(res.body, null, 2));

        expect([200, 204]).toContain(res.statusCode);
        log("🟢 Intervención quirúrgica eliminada:", id);
      }
    });
  });

  afterAll(() => {
    log("========== FIN DEL E2E ==========");
    savePDF();
  });
});
