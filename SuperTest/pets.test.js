require("dotenv").config();
const request = require("supertest");

const baseURL = process.env.API_BASE_URL;
const authToken = { Authorization: `Bearer ${process.env.TEST_TOKEN}` };

describe("E2E Pets & Medical Histories API", () => {
  let createdMedicalHistories = [];
  let createdDiagnostics = [];
  let createdTreatments = [];
  let createdSurgicalInterventions = [];

  // -----------------------------
  // 1. POSTS
  // -----------------------------
  describe("POST endpoints", () => {
    it("should create 3 medical histories for pet 17", async () => {
      const payloads = [
        {
          isHaveAllVaccine: true,
          isReproduced: true,
          descendants: "Linea A",
          room: "Habitacion A",
          diasesEvaluation: "Sano",
          observation: "Sin complicaciones",
          food: { quantity: "200g", type: "Croquetas" },
          physicalExam: {
            weight: 5,
            palpitations: "Normales",
            temperature: 37,
            respiratoryRate: 20,
            cardiacRate: 70,
            laboratoryExam: "Normal",
            pulse: "Regular",
            mucous: "Rosadas",
          },
          otherPet: { isLiveOtherPets: true, whichPets: "Perro" },
          diagnostic: {
            description: "Chequeo general",
            treatments: [
              {
                name: "Vitaminas",
                days: 5,
                frequency: "cada 12 horas",
                quantity: "1 tableta",
              },
            ],
            surgicalIntervations: [
              {
                name: "Esterilizacion",
                description: "Preventiva",
                intervationDate: "01/01/2024",
              },
            ],
          },
        },
        {
          isHaveAllVaccine: false,
          isReproduced: false,
          descendants: "Ninguno",
          room: "Habitacion B",
          diasesEvaluation: "Leve resfriado",
          observation: "Estornudos frecuentes",
          food: { quantity: "150g", type: "Balanceado" },
          physicalExam: {
            weight: 3,
            palpitations: "Normales",
            temperature: 38,
            respiratoryRate: 25,
            cardiacRate: 90,
            laboratoryExam: "Pendiente",
            pulse: "Fuerte",
            mucous: "Pálidas",
          },
          otherPet: { isLiveOtherPets: false, whichPets: "" },
          diagnostic: {
            description: "Resfriado común",
            treatments: [
              {
                name: "Antibiótico",
                days: 7,
                frequency: "cada 8 horas",
                quantity: "1/2 tableta",
              },
            ],
            surgicalIntervations: [],
          },
        },
        {
          isHaveAllVaccine: true,
          isReproduced: false,
          descendants: "Ninguno",
          room: "Habitacion C",
          diasesEvaluation: "Herida en pata",
          observation: "Requiere limpieza",
          food: { quantity: "100g", type: "Húmedo" },
          physicalExam: {
            weight: 4,
            palpitations: "Normales",
            temperature: 37.5,
            respiratoryRate: 22,
            cardiacRate: 80,
            laboratoryExam: "Normal",
            pulse: "Regular",
            mucous: "Normales",
          },
          otherPet: { isLiveOtherPets: true, whichPets: "Gato" },
          diagnostic: {
            description: "Herida superficial",
            treatments: [
              {
                name: "Cicatrizante",
                days: 3,
                frequency: "cada 24 horas",
                quantity: "Aplicar tópico",
              },
            ],
            surgicalIntervations: [],
          },
        },
      ];

      for (const payload of payloads) {
        const res = await request(baseURL)
          .post("/pets/17/medical-histories")
          .set(authToken)
          .send(payload);

        expect(res.statusCode).toBe(201);
        createdMedicalHistories.push(res.body.id);
      }
    });

    it("should create 3 treatments under diagnostics/2", async () => {
      const treatments = [
        {
          name: "Vitaminas",
          days: 5,
          frequency: "cada 12 horas",
          quantity: "1 tableta",
        },
        {
          name: "Antibiótico",
          days: 7,
          frequency: "cada 8 horas",
          quantity: "1/2 tableta",
        },
        {
          name: "Desparasitante",
          days: 3,
          frequency: "cada 24 horas",
          quantity: "1 tableta",
        },
      ];

      for (const tr of treatments) {
        const res = await request(baseURL)
          .post("/pets/medical-histories/diagnostics/2/treatments")
          .set(authToken)
          .send(tr);

        expect(res.statusCode).toBe(201);
        createdTreatments.push(res.body.id);
      }
    });

    it("should create 3 surgical interventions under diagnostics/2", async () => {
      const interventions = [
        {
          name: "Cirugía ocular",
          description: "Extracción de catarata",
          intervationDate: "02/02/2024",
        },
        {
          name: "Limpieza dental",
          description: "Profilaxis",
          intervationDate: "03/03/2024",
        },
        {
          name: "Cirugía ortopédica",
          description: "Rodilla",
          intervationDate: "04/04/2024",
        },
      ];

      for (const interv of interventions) {
        const res = await request(baseURL)
          .post("/pets/medical-histories/diagnostics/2/surgical-interventions")
          .set(authToken)
          .send(interv);

        expect(res.statusCode).toBe(201);
        createdSurgicalInterventions.push(res.body.id);
      }
    });
  });

  // -----------------------------
  // 2. PATCH
  // -----------------------------
  describe("PATCH endpoints", () => {
    it("should update pet 10", async () => {
      const res = await request(baseURL).patch("/pets/10").set(authToken).send({
        name: "Firulais",
        gender: "macho",
        raza: "Pastor Alemán",
        color: "Negro",
        isHaveTatto: true,
        pedigree: true,
        birthday: "19/12/2015",
        specieId: 1,
      });

      expect(res.statusCode).toBe(200);
    });

    it("should update medical history 2", async () => {
      const res = await request(baseURL)
        .patch("/pets/medical-histories/2")
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

      expect(res.statusCode).toBe(200);
    });
  });

  // -----------------------------
  // 3. GET
  // -----------------------------
  describe("GET endpoints", () => {
    it("should get pets list", async () => {
      const res = await request(baseURL)
        .get("/pets?page=1&limit=10")
        .set(authToken);

      expect(res.statusCode).toBe(200);
    });

    it("should get pet 10 by id", async () => {
      const res = await request(baseURL).get("/pets/10").set(authToken);

      expect(res.statusCode).toBe(200);
    });

    it("should get medical history 2", async () => {
      const res = await request(baseURL)
        .get("/pets/medical-histories/2")
        .set(authToken);

      expect(res.statusCode).toBe(200);
    });

    it("should get medical histories for pet 17", async () => {
      const res = await request(baseURL)
        .get("/pets/17/medical-histories")
        .set(authToken);

      expect(res.statusCode).toBe(200);
    });
  });

  // -----------------------------
  // 4. DELETE
  // -----------------------------
  describe("DELETE endpoints", () => {
    it("should delete pet 9", async () => {
      const res = await request(baseURL).delete("/pets/9").set(authToken);
      expect([200, 204, 404]).toContain(res.statusCode);
    });

    it("should delete created treatments", async () => {
      for (const id of createdTreatments) {
        const res = await request(baseURL)
          .delete(`/pets/medical-histories/diagnostics/treatments/${id}`)
          .set(authToken);
        expect([200, 204]).toContain(res.statusCode);
      }
    });

    it("should delete created surgical interventions", async () => {
      for (const id of createdSurgicalInterventions) {
        const res = await request(baseURL)
          .delete(
            `/pets/medical-histories/diagnostics/surgical-interventions/${id}`
          )
          .set(authToken);
        expect([200, 204]).toContain(res.statusCode);
      }
    });
  });
});
