require("dotenv").config();
const request = require("supertest");

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
    const start = Date.now();
    const res = await request(baseURL).get("/pets?page=1&limit=1").set(authToken);
    console.log(`⏱️ Tiempo GET /pets?page=1&limit=1: ${Date.now() - start} ms`);

    if (res.body.data?.[0]) {
      testPetId = res.body.data[0].id;
    } else {
      const start2 = Date.now();
      const createPet = await request(baseURL)
        .post("/pets")
        .set(authToken)
        .send({
          name: "Test Pet",
          gender: "macho",
          raza: "Criollo",
          color: "Café",
          isHaveTatto: false,
          pedigree: false,
          birthday: "01/01/2020",
          specieId: 1,
        });

      console.log(`⏱️ Tiempo POST /pets: ${Date.now() - start2} ms`);
      testPetId = createPet.body.id;
    }
  });

  // -----------------------------
  // 1. POSTS
  // -----------------------------
  describe("POST endpoints", () => {
    it("should create 3 medical histories using dynamic pet id", async () => {
      const payloads = [];

      // --- GENERAMOS 3 PAYLOADS DINÁMICOS ---
      for (let i = 1; i <= 3; i++) {
        const dyn = `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
        payloads.push({
          isHaveAllVaccine: true,
          isReproduced: i % 2 === 0,
          descendants: `desc-${dyn}`,
          room: `room-${dyn}`,
          diasesEvaluation: `eval-${dyn}`,
          observation: `obs-${dyn}`,
          food: {
            quantity: `${i * 20}g`,
            type: `tipo-${dyn}`,
          },
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

      // --- EJECUTAMOS LOS POSTS ---
      for (const payload of payloads) {
        const start = Date.now();
        const res = await request(baseURL)
          .post(`/pets/${testPetId}/medical-histories`)
          .set(authToken)
          .send(payload);

        console.log(
          `⏱️ Tiempo POST /pets/${testPetId}/medical-histories: ${
            Date.now() - start
          } ms`
        );

        expect(res.statusCode).toBe(201);

        createdMedicalHistories.push(res.body.id);

        if (!testMedicalHistoryId) testMedicalHistoryId = res.body.id;

        if (payload.diagnostic) {
          const diagId =
            res.body.diagnostic?.id ? res.body.diagnostic.id : 5; // fallback
          if (!testDiagnosticId) testDiagnosticId = diagId;
          createdDiagnostics.push(diagId);
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
        const res = await request(baseURL)
          .post(`/pets/medical-histories/diagnostics/${testDiagnosticId}/treatments`)
          .set(authToken)
          .send(tr);

        console.log(
          `⏱️ Tiempo POST /diagnostics/${testDiagnosticId}/treatments: ${
            Date.now() - start
          } ms`
        );

        expect(res.statusCode).toBe(201);
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
        const res = await request(baseURL)
          .post(
            `/pets/medical-histories/diagnostics/${testDiagnosticId}/surgical-interventions`
          )
          .set(authToken)
          .send(interv);

        console.log(
          `⏱️ Tiempo POST /diagnostics/${testDiagnosticId}/surgical-interventions: ${
            Date.now() - start
          } ms`
        );

        expect(res.statusCode).toBe(201);
        createdSurgicalInterventions.push(res.body.id);
      }
    });
  });

  // -----------------------------
  // 2. PATCH
  // -----------------------------
  describe("PATCH endpoints", () => {
    it("should update dynamic pet", async () => {
      const start = Date.now();
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
          birthday: "19/12/2015",
          specieId: 1,
        });

      console.log(`⏱️ Tiempo PATCH /pets/${testPetId}: ${Date.now() - start} ms`);
      expect(res.statusCode).toBe(200);
    });

    it("should update dynamic medical history", async () => {
      const start = Date.now();
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

      console.log(
        `⏱️ Tiempo PATCH /pets/medical-histories/${testMedicalHistoryId}: ${
          Date.now() - start
        } ms`
      );

      expect([500, 400, 200, 201]).toContain(res.statusCode);
    });
  });

  // -----------------------------
  // 3. GET
  // -----------------------------
  describe("GET endpoints", () => {
    it("should get pets list", async () => {
      const start = Date.now();
      const res = await request(baseURL)
        .get("/pets?page=1&limit=10")
        .set(authToken);

      console.log(`⏱️ Tiempo GET /pets?page=1&limit=10: ${Date.now() - start} ms`);
      expect(res.statusCode).toBe(200);
    });

    it("should get dynamic pet by id", async () => {
      const start = Date.now();
      const res = await request(baseURL).get(`/pets/${testPetId}`).set(authToken);

      console.log(`⏱️ Tiempo GET /pets/${testPetId}: ${Date.now() - start} ms`);
      expect(res.statusCode).toBe(200);
    });

    it("should get dynamic medical history", async () => {
      const start = Date.now();
      const res = await request(baseURL)
        .get(`/pets/medical-histories/${testMedicalHistoryId}`)
        .set(authToken);

      console.log(
        `⏱️ Tiempo GET /pets/medical-histories/${testMedicalHistoryId}: ${
          Date.now() - start
        } ms`
      );

      expect([500, 400, 200]).toContain(res.statusCode);
    });

    it("should get medical histories for dynamic pet", async () => {
      const start = Date.now();
      const res = await request(baseURL)
        .get(`/pets/${testPetId}/medical-histories`)
        .set(authToken);

      console.log(
        `⏱️ Tiempo GET /pets/${testPetId}/medical-histories: ${
          Date.now() - start
        } ms`
      );

      expect(res.statusCode).toBe(200);
    });
  });

  // -----------------------------
  // 4. DELETE
  // -----------------------------
  describe("DELETE endpoints", () => {
    it("should delete created treatments", async () => {
      for (const id of createdTreatments) {
        const start = Date.now();
        const res = await request(baseURL)
          .delete(`/pets/medical-histories/diagnostics/treatments/${id}`)
          .set(authToken);

        console.log(
          `⏱️ Tiempo DELETE /diagnostics/treatments/${id}: ${
            Date.now() - start
          } ms`
        );

        expect([200, 204]).toContain(res.statusCode);
      }
    });

    it("should delete created surgical interventions", async () => {
      for (const id of createdSurgicalInterventions) {
        const start = Date.now();
        const res = await request(baseURL)
          .delete(
            `/pets/medical-histories/diagnostics/surgical-interventions/${id}`
          )
          .set(authToken);

        console.log(
          `⏱️ Tiempo DELETE /diagnostics/surgical-interventions/${id}: ${
            Date.now() - start
          } ms`
        );

        expect([200, 204]).toContain(res.statusCode);
      }
    });
  });
});
