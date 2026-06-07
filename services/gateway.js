import { createServer } from "node:http";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { proxyJson, readJson, sendJson, serveStatic } from "./shared.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "../public");

const services = {
  courses: "http://localhost:3001",
  users: "http://localhost:3002",
  enrollments: "http://localhost:3003"
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname.startsWith("/api/")) {
    try {
      await handleApi(req, res, url);
    } catch (error) {
      sendJson(res, 500, { error: error.message });
    }
    return;
  }

  await serveStatic(req, res, publicDir);
});

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/health") {
    const entries = await Promise.all(
      Object.entries(services).map(async ([name, baseUrl]) => {
        try {
          const health = await proxyJson(baseUrl, "/health");
          return [name, health.status];
        } catch {
          return [name, "down"];
        }
      })
    );
    sendJson(res, 200, { gateway: "ok", services: Object.fromEntries(entries) });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/courses") {
    const qs = url.search;
    const coursePayload = await proxyJson(services.courses, `/courses${qs}`);
    const learnerPayload = await proxyJson(services.users, "/learners/demo-user");
    const enrollmentPayload = await proxyJson(services.enrollments, "/enrollments/demo-user");
    const enrolledCourseIds = new Set(enrollmentPayload.enrollments.map((item) => item.courseId));
    const courses = await Promise.all(
      coursePayload.courses.map(async (course) => {
        const instructorPayload = await proxyJson(services.users, `/instructors/${course.instructorId}`);
        return {
          ...course,
          instructor: instructorPayload.instructor,
          enrolled: enrolledCourseIds.has(course.id),
          progress: enrollmentPayload.enrollments.find((item) => item.courseId === course.id)?.progress ?? 0
        };
      })
    );
    sendJson(res, 200, { courses, categories: coursePayload.categories, learner: learnerPayload.learner });
    return;
  }

  if (req.method === "GET" && url.pathname.match(/^\/api\/courses\/[^/]+$/)) {
    const courseId = url.pathname.split("/").pop();
    const { course } = await proxyJson(services.courses, `/courses/${courseId}`);
    const { instructor } = await proxyJson(services.users, `/instructors/${course.instructorId}`);
    const { enrollments } = await proxyJson(services.enrollments, "/enrollments/demo-user");
    const enrollment = enrollments.find((item) => item.courseId === course.id);
    sendJson(res, 200, { course: { ...course, instructor, enrolled: Boolean(enrollment), progress: enrollment?.progress ?? 0 } });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/enroll") {
    const body = await readJson(req);
    const payload = await proxyJson(services.enrollments, "/enrollments", {
      method: "POST",
      body: JSON.stringify({ learnerId: "demo-user", courseId: body.courseId })
    });
    sendJson(res, 201, payload);
    return;
  }

  sendJson(res, 404, { error: "Gateway route not found" });
}

server.listen(3000, () => {
  console.log("API Gateway listening on http://localhost:3000");
});
