import assert from "node:assert";
import {
  getExpectedFlagCode,
  getExpectedAdminCode,
  verifyFlagCode,
  verifyAdminCode,
} from "../src/lib/authStore";

console.log("Starting authStore security verification tests...");

// Test case 1: Environment variables missing / empty
delete process.env.NEXT_PUBLIC_FLAG_ACCESS_CODE;
delete process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE;

assert.strictEqual(getExpectedFlagCode(), "", "Expected flag code should be empty string when env var is missing");
assert.strictEqual(getExpectedAdminCode(), "", "Expected admin code should be empty string when env var is missing");

// Test case 2: Verification must fail (not fallback to old defaults enade-docente/enade-admin) when env var is missing
assert.strictEqual(verifyFlagCode("enade-docente"), false, "verifyFlagCode must reject old default code when env var missing");
assert.strictEqual(verifyAdminCode("enade-admin"), false, "verifyAdminCode must reject old default code when env var missing");
assert.strictEqual(verifyFlagCode("anything"), false, "verifyFlagCode must reject any code when env var missing");
assert.strictEqual(verifyAdminCode("anything"), false, "verifyAdminCode must reject any code when env var missing");

// Test case 3: Environment variables set
process.env.NEXT_PUBLIC_FLAG_ACCESS_CODE = " secret-flag-123 ";
process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE = " secret-admin-456 ";

assert.strictEqual(getExpectedFlagCode(), "secret-flag-123", "getExpectedFlagCode should trim env var");
assert.strictEqual(getExpectedAdminCode(), "secret-admin-456", "getExpectedAdminCode should trim env var");

assert.strictEqual(verifyFlagCode("secret-flag-123"), true, "verifyFlagCode should accept valid code");
assert.strictEqual(verifyFlagCode("SECRET-FLAG-123"), true, "verifyFlagCode should be case insensitive");
assert.strictEqual(verifyFlagCode("wrong-code"), false, "verifyFlagCode should reject invalid code");

assert.strictEqual(verifyAdminCode("secret-admin-456"), true, "verifyAdminCode should accept valid code");
assert.strictEqual(verifyAdminCode("wrong-code"), false, "verifyAdminCode should reject invalid code");

console.log("✅ All authStore security verification tests passed successfully!");
