import { createJsonService, readJson } from "./shared.js";

const enrollments = [
  { learnerId: "demo-user", courseId: "web-react", progress: 22 },
  { learnerId: "demo-user", courseId: "ux-systems", progress: 61 }
];

createJsonService({
  name: "Enrollment Service",
  port: 3003,
  routes: [
    {
      method: "GET",
      pattern: /^\/health$/,
      handler: () => ({ status: "ok", service: "enrollments" })
    },
    {
      method: "GET",
      pattern: /^\/enrollments\/([^/]+)$/,
      handler: ({ match }) => ({
        enrollments: enrollments.filter((item) => item.learnerId === match[1])
      })
    },
    {
      method: "POST",
      pattern: /^\/enrollments$/,
      handler: async ({ req }) => {
        const body = await readJson(req);
        if (!body.learnerId || !body.courseId) {
          return { status: 400, body: { error: "learnerId and courseId are required" } };
        }

        let enrollment = enrollments.find((item) => item.learnerId === body.learnerId && item.courseId === body.courseId);
        if (!enrollment) {
          enrollment = { learnerId: body.learnerId, courseId: body.courseId, progress: 0 };
          enrollments.push(enrollment);
        }

        return { status: 201, body: { enrollment, enrollments } };
      }
    }
  ]
});
