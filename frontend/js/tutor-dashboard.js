async function loadTutorDashboardStats() {
  try {
    const data = await apiRequest("/courses/tutor-stats");

    const totalCoursesEl = document.getElementById("totalCoursesValue");
    const totalEnrollmentsEl = document.getElementById("totalEnrollmentsValue");
    const draftEl = document.getElementById("draftCoursesValue");
    const publishedEl = document.getElementById("publishedCoursesValue");

    if (totalCoursesEl && typeof data.totalCourses === "number") {
      totalCoursesEl.textContent = data.totalCourses;
    }

    if (totalEnrollmentsEl && typeof data.totalEnrollments === "number") {
      totalEnrollmentsEl.textContent = data.totalEnrollments;
    }

    if (draftEl && typeof data.totalDrafts === 'number') {
      draftEl.textContent = data.totalDrafts;
    }

    if (publishedEl && typeof data.totalPublished === 'number') {
      publishedEl.textContent = data.totalPublished;
    }
  } catch (err) {
    console.error("Failed to load tutor dashboard stats", err);
  }
}

document.addEventListener("DOMContentLoaded", loadTutorDashboardStats);
