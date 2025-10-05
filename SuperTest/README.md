# 🧪 TestingTesina API E2E Tests

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)
![npm](https://img.shields.io/badge/npm-9+-blue?logo=npm)
![GitHub Actions](https://img.shields.io/github/workflow/status/Gutyerrez-360/TestingTesina/CI?label=CI%20Tests&logo=github)

End-to-end test suite for the **TestingTesina API**, built with **Jest** and **SuperTest**.  
The project focuses on high-level API flows such as **authentication**, **pets & medical histories**, **appointments**, **users**, and **bills**.

---

## ⚡ Prerequisites

- **Node.js** 18 LTS or newer
- **npm** 9+ (bundled with Node) or another compatible package manager
- **Git** (recommended) for version control

---

## 🚀 Getting Started

1. **Install dependencies**
npm install



2. **Create a .env file at the repository root. It is loaded automatically by dotenv.
API_BASE_URL=https://dsi-example-url.up.railway.app/api/v1
TEST_TOKEN=your_token_here

3. **Structure
SuperTest
├── appointments.test.js       # Tests for appointments module
├── auth.test.js               # Tests for authentication module
├── bills.test.js              # Tests for billing module
├── pets.test.js               # Tests for pets & medical histories
├── users.test.js              # Tests for users module
├── package.json               # Project dependencies
├── jest.config.js             # Jest configuration
├── .env                       # Environment variables (ignored)
└── README.md                  # Project documentation

4. **Run the full test suite:
npx jest --detectOpenHandles

5. **Run a single test file:
npx jest pets.test.js --detectOpenHandles

6. **Run tests with verbose output:
npx jest --verbose
