async function loadTutorDashboardStats() {
  try {
    const data = await apiRequest("/courses/tutor-stats");

    const totalCoursesEl = document.getElementById("totalCoursesValue");
    const totalEnrollmentsEl = document.getElementById("totalEnrollmentsValue");

    if (totalCoursesEl && typeof data.totalCourses === "number") {
      totalCoursesEl.textContent = data.totalCourses;
    }

    if (totalEnrollmentsEl && typeof data.totalEnrollments === "number") {
      totalEnrollmentsEl.textContent = data.totalEnrollments;
    }
  } catch (err) {
    console.error("Failed to load tutor dashboard stats", err);
  }
}

document.addEventListener("DOMContentLoaded", loadTutorDashboardStats);
