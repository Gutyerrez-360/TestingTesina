# TestingTesina API E2E Tests

End-to-end test suite for the TestingTesina API, built with **Jest** and **SuperTest**.  
The project focuses on high-level API flows such as authentication, pets & medical histories, appointments, users, and bills.

## Prerequisites

- Node.js 18 LTS or newer
- npm 9+ (bundled with Node) or another compatible package manager
- Recommended: Git for version control

## Getting Started

1. **Install dependencies**
   ```bash
   npm install


Create a .env file at the repository root. It is loaded automatically by dotenv.
API_BASE_URL=https://dsi-example-url.up.railway.app/api/v1
TEST_TOKEN=your_token_here


SuperTest
├── appointments.test.js       # Tests for appointments module
├── auth.test.js               # Tests for authentication module
├── bills.test.js              # Tests for billing module
├── pets.test.js               # Tests for pets & medical histories
├── users.test.js              # Tests for users module
├── package.json               # Dependencies
├── jest.config.js             # Jest configuration
├── .env                       # Environment variables (ignored)
└── README.md                  # Project documentation


Run the full test suite:
npx jest --detectOpenHandles

Run a single test file:
npx jest pets.test.js --detectOpenHandles

Run tests with verbose output:
npx jest --verbose
