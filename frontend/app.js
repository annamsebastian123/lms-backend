
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
  console.log("Login button clicked");
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const message = document.getElementById("loginMessage");

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: {
          email,
          password,
        },
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      message.textContent = "Login successful";

      // Redirect based on user role
      const user = data.user;
const role = user.role ? user.role.toUpperCase() : "LEARNER";

if (role === "ADMIN") {
  window.location.href = "admin-dashboard.html";
} else if (role === "TUTOR") {
  window.location.href = "tutor-dashboard.html";
} else {
  window.location.href = "dashboard.html";
}
    } catch (err) {
      message.textContent = err.message || "Login failed";
      console.error(err);
    }
  });
}

// Courses page renderer: uses global apiRequest from js/api.js
const courseGrid = document.getElementById("courseGrid");
if (courseGrid) {
  async function loadAndRenderCourses() {
    try {
      const data = await apiRequest('/courses');
       const courses = Array.isArray(data) ? data : (data && data.courses) || [];
      renderCourses(courses);
    } catch (err) {
      courseGrid.innerHTML = `<p>No courses available yet.</p>`;
      console.error('Failed to load courses', err);
    }
  }

  function renderCourses(courses) {
    courseGrid.innerHTML = '';
    if (!courses || courses.length === 0) {
      courseGrid.innerHTML = `<p>No courses available yet.</p>`;
      return;
    }

    courses.forEach(course => {
      const card = document.createElement('div');
      card.className = 'course-card';

      const img = document.createElement("img");
img.className = "course-image";
img.alt = course.title || "Course thumbnail";
img.src = course.thumbnailUrl || "https://via.placeholder.com/400x220?text=Course";

      const content = document.createElement('div');
      content.className = 'course-content';

      const title = document.createElement('h3');
      title.textContent = course.title || 'Untitled Course';

      const desc = document.createElement('p');
      desc.textContent = course.description || '';

      const meta = document.createElement('p');
      const parts = [];
      if (course.category) parts.push(course.category);
      if (course.level) parts.push(course.level);
      meta.textContent = parts.join(' • ');

      const link = document.createElement('a');
      link.href = `course-details?id=${course.id}`;
      link.addEventListener("click", () => {
        localStorage.setItem("selectedCourseId", course.id);
      });
      const btn = document.createElement('button');
      btn.className = 'enroll-btn';
      btn.textContent = 'View Details';
      link.appendChild(btn);

      content.appendChild(title);
      if (desc.textContent) content.appendChild(desc);
      if (meta.textContent) content.appendChild(meta);
      content.appendChild(link);

      card.appendChild(img);
      card.appendChild(content);

      courseGrid.appendChild(card);
    });
  }

  loadAndRenderCourses();
}

// Course details page renderer
const detailContainer = document.querySelector('.course-detail-container');
const modulesSection = document.querySelector('.modules-section');
if (detailContainer) {
  const params = new URLSearchParams(window.location.search);
const courseId = params.get('id');

  console.log("Course details page:", window.location.href);
  console.log("Course details search:", window.location.search);
  console.log("Determined courseId:", courseId);

  if (!courseId) {
    detailContainer.innerHTML = '<p>Course not found.</p>';
  } else {
    async function isCourseEnrolled(courseId) {
      const token = localStorage.getItem("token");
      if (!token) return false;

      try {
        const data = await apiRequest("/courses/my-courses");
        const enrollments = Array.isArray(data) ? data : [];
        return enrollments.some(
          (item) => item.course && Number(item.course.id) === Number(courseId)
        );
      } catch (err) {
        return false;
      }
    }

    async function fetchCourseModules(courseId) {
      try {
        const data = await apiRequest(`/courses/${courseId}/modules`);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        return [];
      }
    }

    async function fetchModuleLessons(moduleId) {
      try {
        const data = await apiRequest(`/courses/modules/${moduleId}/lessons`);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        return [];
      }
    }

    async function loadAndRenderCourse() {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const data = await apiRequest(`/courses/${courseId}`);
        console.log("Course API response:", data);
        const course = data && data.course ? data.course : data;
        if (!course) {
          detailContainer.innerHTML = '<p>Course not found.</p>';
          return;
        }

        const enrolled = await isCourseEnrolled(course.id);
        const shouldShowEnrollButton =
          !enrolled && user.role === "LEARNER";

        // Render main course details
        const title = course.title || 'Untitled Course';
        const description = course.description || '';
        const category = course.category || '';
        const level = course.level || '';

        let metaHtml = '';
        const metaParts = [];
        if (category) metaParts.push(`<span><strong>Category:</strong> ${category}</span>`);
        if (level) metaParts.push(`<span><strong>Level:</strong> ${level}</span>`);
        if (metaParts.length) metaHtml = `<div class="course-meta">${metaParts.join('')}</div>`;

        detailContainer.innerHTML = `
  <div class="course-banner">
    ${
      course.thumbnailUrl
        ? `<img
             src="${course.thumbnailUrl}"
             alt="${escapeHtml(title)}"
             class="course-banner-image">`
        : "Course Banner"
    }
  </div>

  <h1>${escapeHtml(title)}</h1>
  ${metaHtml}
  <p class="course-description">${escapeHtml(description)}</p>
  ${
    shouldShowEnrollButton
      ? '<button class="enroll-btn" id="enrollCourseBtn">Enroll Now</button>'
      : ""
  }
`;

        const enrollBtn = document.getElementById("enrollCourseBtn");
        if (enrollBtn) {
          enrollBtn.addEventListener("click", async () => {
            try {
              await apiRequest(`/courses/${courseId}/enroll`, {
                method: "POST"
              });

              alert("Enrolled successfully");
              enrollBtn.remove();
            } catch (error) {
              alert(error.message);
            }
          });
        }

        if (modulesSection) {
          await renderModules(courseId, false);
        }

      } catch (error) {
        detailContainer.innerHTML = `
       <h2>Error Loading Course</h2>
         <pre>${JSON.stringify({
        message: error.message,
       stack: error.stack
         }, null, 2)}</pre>
        `;
      }
    }

    async function renderModules(courseId, isTutorOwner) {
      const modules = await fetchCourseModules(courseId);
      const modulesWithLessons = await Promise.all(
        modules.map(async (module, idx) => ({
          ...module,
          lessons: await fetchModuleLessons(module.id),
          displayTitle: module.title || `Module ${idx + 1}`,
        }))
      );

      let html = '<h2>Course Modules</h2>';
      if (isTutorOwner) {
        html += `
          <div class="form-group">
            <input type="text" id="newModuleTitle" placeholder="New module title">
            <button class="action-btn" id="addModuleBtn">Add Module</button>
          </div>
        `;
      }

      if (!modulesWithLessons.length) {
        html += '<p>No modules available.</p>';
      } else {
        modulesWithLessons.forEach((module) => {
          const lessonsHtml = Array.isArray(module.lessons) && module.lessons.length
            ? `<ul>${module.lessons
               .map((lesson, index) => `
  <div class="lesson-item">
    <a
      class="lesson-link"
      href="lesson-details?id=${lesson.id}">
      Lesson ${index + 1}: ${escapeHtml(lesson.title || 'Lesson')}
    </a>
  </div>
`)
                .join('')}</ul>`
            : '<p>No lessons available yet.</p>';

          html += `
            <div class="module-card">
              <h3>${escapeHtml(module.displayTitle)}</h3>
              ${lessonsHtml}
              ${isTutorOwner ? `
                <div class="form-group">
                  <input type="text" id="lessonTitle-${module.id}" placeholder="Lesson title">
                  <input type="text" id="lessonContent-${module.id}" placeholder="Lesson content">
                  <button class="action-btn addLessonBtn" data-module-id="${module.id}">Add Lesson</button>
                </div>
              ` : ''}
            </div>
          `;
        });
      }

      modulesSection.innerHTML = html;
      if (isTutorOwner) attachModuleFormHandlers(courseId);
    }

    function attachModuleFormHandlers(courseId) {
      const addModuleBtn = document.getElementById("addModuleBtn");
      if (addModuleBtn) {
        addModuleBtn.addEventListener("click", async () => {
          const titleInput = document.getElementById("newModuleTitle");
          const title = titleInput && titleInput.value.trim();
          if (!title) {
            alert("Module title is required");
            return;
          }

          try {
            await apiRequest(`/courses/${courseId}/modules`, {
              method: "POST",
              body: { title },
            });
            if (titleInput) titleInput.value = "";
            await renderModules(courseId, true);
          } catch (err) {
            alert(err.message || "Failed to add module");
          }
        });
      }

      document.querySelectorAll(".addLessonBtn").forEach((button) => {
        button.addEventListener("click", async () => {
          const moduleId = button.dataset.moduleId;
          const titleInput = document.getElementById(`lessonTitle-${moduleId}`);
          const contentInput = document.getElementById(`lessonContent-${moduleId}`);
          const title = titleInput && titleInput.value.trim();
          const content = contentInput && contentInput.value.trim();

          if (!title) {
            alert("Lesson title is required");
            return;
          }

          try {
            await apiRequest(`/courses/modules/${moduleId}/lessons`, {
              method: "POST",
              body: { title, content },
            });
            if (titleInput) titleInput.value = "";
            if (contentInput) contentInput.value = "";
            await renderModules(courseId, true);
          } catch (err) {
            alert(err.message || "Failed to add lesson");
          }
        });
      });
    }

    // Helper to escape HTML
    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    loadAndRenderCourse();
  }
}

