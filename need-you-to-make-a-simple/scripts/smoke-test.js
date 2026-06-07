const baseUrl = "http://localhost:3000";

async function assertOk(path) {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
  return response.json();
}

const health = await assertOk("/api/health");
const catalog = await assertOk("/api/courses");
const detail = await assertOk(`/api/courses/${catalog.courses[0].id}`);

if (health.gateway !== "ok") throw new Error("Gateway is not healthy");
if (catalog.courses.length < 4) throw new Error("Catalog did not return expected demo courses");
if (!detail.course.instructor) throw new Error("Course details did not include instructor data");

console.log("Smoke test passed: gateway, catalog, and course details are working.");
