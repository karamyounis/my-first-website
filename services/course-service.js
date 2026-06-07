import { createJsonService } from "./shared.js";

const courses = [
  {
    id: "web-react",
    title: "Modern React From Zero",
    category: "Development",
    level: "Beginner",
    price: 39,
    rating: 4.8,
    students: 18420,
    duration: "18h",
    lessons: 96,
    instructorId: "maya",
    color: "#2f6fed",
    summary: "Build responsive web apps with components, hooks, state, and production-ready structure.",
    outcomes: ["React fundamentals", "Reusable components", "API-driven screens", "Deployable project"]
  },
  {
    id: "data-python",
    title: "Python Data Analysis Lab",
    category: "Data Science",
    level: "Intermediate",
    price: 44,
    rating: 4.7,
    students: 12680,
    duration: "14h",
    lessons: 72,
    instructorId: "omar",
    color: "#168a5b",
    summary: "Analyze real datasets with Python, notebooks, pandas, and clear visual storytelling.",
    outcomes: ["Pandas workflows", "Data cleaning", "Charts and insights", "Portfolio notebook"]
  },
  {
    id: "ux-systems",
    title: "UX Design Systems Bootcamp",
    category: "Design",
    level: "All Levels",
    price: 32,
    rating: 4.6,
    students: 9340,
    duration: "11h",
    lessons: 58,
    instructorId: "lina",
    color: "#b2456e",
    summary: "Create practical design systems with tokens, components, documentation, and handoff habits.",
    outcomes: ["UI audit", "Component library", "Design tokens", "Team documentation"]
  },
  {
    id: "cloud-micro",
    title: "Microservices With Node.js",
    category: "Cloud",
    level: "Intermediate",
    price: 49,
    rating: 4.9,
    students: 15110,
    duration: "20h",
    lessons: 104,
    instructorId: "noah",
    color: "#7b4dd8",
    summary: "Design small services, compose APIs through a gateway, and understand production tradeoffs.",
    outcomes: ["Service boundaries", "API gateway pattern", "Health checks", "Local demo architecture"]
  }
];

createJsonService({
  name: "Course Service",
  port: 3001,
  routes: [
    {
      method: "GET",
      pattern: /^\/health$/,
      handler: () => ({ status: "ok", service: "courses" })
    },
    {
      method: "GET",
      pattern: /^\/courses$/,
      handler: ({ url }) => {
        const category = url.searchParams.get("category");
        const query = url.searchParams.get("q")?.toLowerCase();
        const filtered = courses.filter((course) => {
          const matchesCategory = !category || category === "All" || course.category === category;
          const matchesQuery = !query || `${course.title} ${course.summary} ${course.category}`.toLowerCase().includes(query);
          return matchesCategory && matchesQuery;
        });
        return { courses: filtered, categories: ["All", ...new Set(courses.map((course) => course.category))] };
      }
    },
    {
      method: "GET",
      pattern: /^\/courses\/([^/]+)$/,
      handler: ({ match }) => {
        const course = courses.find((item) => item.id === match[1]);
        return course ? { course } : { status: 404, body: { error: "Course not found" } };
      }
    }
  ]
});
