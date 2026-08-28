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

  function showCourses(courses, certificates) {
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
      const hasCertificate = certificates.some(c => c.courseId === course.id);

      html += `
        <div class="lesson-card">
          <h3>
            ${course.title || "Untitled Course"}
            ${hasCertificate ? '<span style="color: #10b981; margin-left: 8px; font-weight: bold;">✓ Completed</span>' : ''}
          </h3>
          <p>${course.description || "No description available."}</p>

          <div class="course-actions">
    <a href="course-details.html?id=${course.id}" class="take-quiz-btn action-btn">
        Continue Learning
    </a>

    ${hasCertificate
      ? `<a href="certificates.html" class="take-quiz-btn action-btn" style="background:#10b981;">View Certificate</a>`
      : `<button class="take-quiz-btn action-btn"
            onclick="generateCertificate(${course.id})">
        Generate Certificate
    </button>`
    }
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

    let certificates = [];
    try {
      certificates = await apiRequest("/certificates/my-certificates");
    } catch (e) {
      // certificates endpoint may fail, that's ok
    }

    showCourses(courses, certificates);
  } catch (error) {
    console.error("Failed to load enrolled course data", error);
    showNoCoursesMessage();
  }
});

async function generateCertificate(courseId) {
  try {
    const data = await apiRequest(`/certificates/generate/${courseId}`, {
      method: "POST"
    });

    alert("Certificate generated successfully");
    window.location.href = "certificates.html";

  } catch (error) {
    console.error("Certificate generation failed", error);
    alert(error.message || "Certificate generation failed");
  }
}