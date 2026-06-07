import { createJsonService } from "./shared.js";

const instructors = {
  maya: { id: "maya", name: "Maya Chen", role: "Frontend architect", learners: 68200, avatar: "MC" },
  omar: { id: "omar", name: "Omar Saleh", role: "Data scientist", learners: 44700, avatar: "OS" },
  lina: { id: "lina", name: "Lina Park", role: "Product designer", learners: 31800, avatar: "LP" },
  noah: { id: "noah", name: "Noah Brooks", role: "Cloud engineer", learners: 52900, avatar: "NB" }
};

const learners = {
  "demo-user": { id: "demo-user", name: "Demo Learner", plan: "Team Trial" }
};

createJsonService({
  name: "User Service",
  port: 3002,
  routes: [
    {
      method: "GET",
      pattern: /^\/health$/,
      handler: () => ({ status: "ok", service: "users" })
    },
    {
      method: "GET",
      pattern: /^\/instructors\/([^/]+)$/,
      handler: ({ match }) => {
        const instructor = instructors[match[1]];
        return instructor ? { instructor } : { status: 404, body: { error: "Instructor not found" } };
      }
    },
    {
      method: "GET",
      pattern: /^\/learners\/([^/]+)$/,
      handler: ({ match }) => {
        const learner = learners[match[1]];
        return learner ? { learner } : { status: 404, body: { error: "Learner not found" } };
      }
    }
  ]
});
