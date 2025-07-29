// Test setup file
import dotenv from "dotenv";

// Load test environment variables
dotenv.config({ path: ".env.test" });

// Set test environment variables
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-purposes-only";
process.env.NODE_ENV = "test";
