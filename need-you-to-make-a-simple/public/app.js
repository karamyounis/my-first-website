const state = {
  category: "All",
  query: "",
  courses: [],
  categories: []
};

const courseGrid = document.querySelector("#courseGrid");
const categoryTabs = document.querySelector("#categoryTabs");
const searchInput = document.querySelector("#searchInput");
const serviceStatus = document.querySelector("#serviceStatus");
const learnerBadge = document.querySelector("#learnerBadge");
const courseDialog = document.querySelector("#courseDialog");
const closeDialog = document.querySelector("#closeDialog");
const courseDetail = document.querySelector("#courseDetail");

async function getJson(path, options) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) }
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function loadHealth() {
  const health = await getJson("/api/health");
  serviceStatus.innerHTML = Object.entries(health.services)
    .map(([name, status]) => `<div class="status-pill"><span>${name}</span><strong>${status}</strong></div>`)
    .join("");
}

async function loadCourses() {
  const params = new URLSearchParams();
  if (state.category !== "All") params.set("category", state.category);
  if (state.query) params.set("q", state.query);

  const payload = await getJson(`/api/courses?${params}`);
  state.courses = payload.courses;
  state.categories = payload.categories;
  learnerBadge.textContent = `${payload.learner.name} - ${payload.learner.plan}`;
  renderTabs();
  renderMetrics();
  renderCourses();
}

function renderTabs() {
  categoryTabs.innerHTML = state.categories
    .map((category) => {
      const active = category === state.category ? "active" : "";
      return `<button class="${active}" data-category="${category}">${category}</button>`;
    })
    .join("");
}

function renderMetrics() {
  document.querySelector("#courseCount").textContent = state.courses.length;
  document.querySelector("#studentCount").textContent = state.courses.reduce((total, course) => total + course.students, 0).toLocaleString();
  document.querySelector("#enrolledCount").textContent = state.courses.filter((course) => course.enrolled).length;
}

function renderCourses() {
  courseGrid.innerHTML = state.courses
    .map((course) => {
      const buttonText = course.enrolled ? `Continue ${course.progress}%` : "Enroll";
      const buttonClass = course.enrolled ? "primary-button enrolled" : "primary-button";
      return `
        <article class="course-card">
          <div class="course-art" style="--course-color: ${course.color}">
            <strong>${course.category}</strong>
            <span>${course.level}</span>
          </div>
          <div class="course-body">
            <h2>${course.title}</h2>
            <p>${course.summary}</p>
            <div class="course-meta">
              <span>${course.rating} rating</span>
              <span>${course.duration}</span>
              <span>${course.lessons} lessons</span>
              <span>${course.instructor.name}</span>
            </div>
          </div>
          <div class="course-actions">
            <span class="price">$${course.price}</span>
            <div>
              <button class="ghost-button" data-view="${course.id}">Details</button>
              <button class="${buttonClass}" data-enroll="${course.id}">${buttonText}</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

async function showCourse(courseId) {
  const { course } = await getJson(`/api/courses/${courseId}`);
  courseDetail.innerHTML = `
    <div class="detail-header">
      <div class="avatar">${course.instructor.avatar}</div>
      <div>
        <p class="eyebrow">${course.category} - ${course.level}</p>
        <h1>${course.title}</h1>
        <p>${course.instructor.name}, ${course.instructor.role}</p>
      </div>
    </div>
    <p>${course.summary}</p>
    <div class="course-meta">
      <span>${course.rating} rating</span>
      <span>${course.students.toLocaleString()} students</span>
      <span>${course.duration}</span>
      <span>$${course.price}</span>
    </div>
    <h2>What learners build</h2>
    <ul class="outcomes">
      ${course.outcomes.map((outcome) => `<li>${outcome}</li>`).join("")}
    </ul>
    <button class="primary-button ${course.enrolled ? "enrolled" : ""}" data-enroll="${course.id}">
      ${course.enrolled ? `Continue ${course.progress}%` : "Enroll now"}
    </button>
  `;
  courseDialog.showModal();
}

async function enroll(courseId) {
  await getJson("/api/enroll", {
    method: "POST",
    body: JSON.stringify({ courseId })
  });
  await loadCourses();
  if (courseDialog.open) {
    await showCourse(courseId);
  }
}

categoryTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  loadCourses();
});

searchInput.addEventListener("input", () => {
  state.query = searchInput.value.trim();
  loadCourses();
});

document.addEventListener("click", (event) => {
  const viewButton = event.target.closest("[data-view]");
  const enrollButton = event.target.closest("[data-enroll]");
  if (viewButton) showCourse(viewButton.dataset.view);
  if (enrollButton) enroll(enrollButton.dataset.enroll);
});

closeDialog.addEventListener("click", () => courseDialog.close());

loadHealth();
loadCourses();
