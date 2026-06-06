document.addEventListener("DOMContentLoaded", async () => {
  const courseTitle = document.querySelector(".top-header h1");
  const courseDescription = document.querySelector(".top-header p");
  const lessonSection = document.querySelector(".lesson-section");
  const lessonCards = Array.from(document.querySelectorAll(".lesson-card"));
  const continueButton = document.querySelector(".take-quiz-btn");

  function showNoCoursesMessage() {
    if (!lessonSection) return;

    lessonSection.innerHTML = `
      <h2>Lessons</h2>
      <p>You have not enrolled in any courses yet.</p>
    `;

    if (continueButton) {
      continueButton.style.display = "none";
    }
  }

  function setCourseHeader(course) {
    if (courseTitle) {
      courseTitle.textContent = course.title || "Registry Procedures";
    }

    if (courseDescription) {
      courseDescription.textContent =
        course.description ||
        "Watch lessons, track progress and complete the final assessment";
    }

    if (continueButton) {
      continueButton.textContent = "Continue Learning";
      continueButton.href = `course-details.html?id=${course.id}`;
      continueButton.addEventListener("click", () => {
        localStorage.setItem("selectedCourseId", course.id);
      });
    }
  }

  function populateLessonCards(modules) {
    if (!lessonCards.length) return;

    if (!modules || modules.length === 0) {
      lessonCards.forEach((card, index) => {
        if (index === 0) {
          card.textContent = "No lessons available for this course.";
          card.classList.remove("completed");
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
      return;
    }

    lessonCards.forEach((card, index) => {
      const module = modules[index];
      if (module) {
        card.textContent = module.title || `Lesson ${index + 1}`;
        card.classList.remove("completed");
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  }

  const token = localStorage.getItem("token");
  if (!token) {
    showNoCoursesMessage();
    return;
  }

  try {
    const data = await apiRequest("/courses/my-courses");
    const enrollments = Array.isArray(data) ? data : [];
    const courses = enrollments.map((item) => item.course).filter(Boolean);

    if (!courses.length) {
      showNoCoursesMessage();
      return;
    }

    const course = courses[0];
    setCourseHeader(course);

    let modules = [];
    try {
      const modulesResponse = await apiRequest(`/courses/${course.id}/modules`);
      modules = Array.isArray(modulesResponse)
        ? modulesResponse
        : modulesResponse?.modules || [];
    } catch (err) {
      modules = [];
    }

    populateLessonCards(modules);
  } catch (error) {
    console.error("Failed to load enrolled course data", error);
    showNoCoursesMessage();
  }
});
