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

          <div class="course-actions">
    <a href="course-details?id=${course.id}" class="take-quiz-btn action-btn">
        Continue Learning
    </a>

    <button class="take-quiz-btn action-btn"
            onclick="generateCertificate(${course.id})">
        Generate Certificate
    </button>
</div>
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

async function generateCertificate(courseId) {
  try {
    const token = localStorage.getItem("token");

    const API_URL =
  window.location.origin.replace("-3000.", "-5000.") + "/api";

const response = await fetch(
  `${API_URL}/certificates/generate/${courseId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to generate certificate");
      return;
    }

    alert("Certificate generated successfully");

    window.location.href = "certificates.html";

  } catch (error) {
    console.error("Certificate generation failed", error);
    alert("Certificate generation failed");
  }
}