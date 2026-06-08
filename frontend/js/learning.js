document.addEventListener("DOMContentLoaded", async () => {
  const courseTitle = document.querySelector(".top-header h1");
  const courseDescription = document.querySelector(".top-header p");
  const lessonSection = document.querySelector(".lesson-section");

  function showNoCoursesMessage() {
    if (!lessonSection) return;

    lessonSection.innerHTML = `
      <h2>My Learning</h2>
      <p>You have not enrolled in any courses yet.</p>
    `;
  }

  function showCourses(courses) {
    if (!lessonSection) return;

    if (courseTitle) {
      courseTitle.textContent = "My Learning";
    }

    if (courseDescription) {
      courseDescription.textContent =
        "View all courses you have enrolled in.";
    }

    let html = `
      <h2>Enrolled Courses</h2>
    `;

    courses.forEach((course) => {
      html += `
        <div class="lesson-card">
          <h3>${course.title || "Untitled Course"}</h3>
          <p>${course.description || "No description available."}</p>

          <a href="course-details.html?id=${course.id}" class="take-quiz-btn">
            Continue Learning
          </a>
        </div>
      `;
    });

    lessonSection.innerHTML = html;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    showNoCoursesMessage();
    return;
  }

  try {
    const data = await apiRequest("/courses/my-courses");

    const enrollments = Array.isArray(data) ? data : [];

    const courses = enrollments
      .map((item) => item.course)
      .filter(Boolean);

    if (!courses.length) {
      showNoCoursesMessage();
      return;
    }

    showCourses(courses);
  } catch (error) {
    console.error("Failed to load enrolled course data", error);
    showNoCoursesMessage();
  }
});