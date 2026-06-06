
const API_URL =
  "https://refactored-space-telegram-g4964j7p9prghp747-5000.app.github.dev";

const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const message = document.getElementById("loginMessage");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        message.textContent = data.message || "Login failed";
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      message.textContent = "Login successful";

      window.location.href = "dashboard.html";
    } catch (err) {
      message.textContent = "Something went wrong";
      console.error(err);
    }
  });
}

// Courses page renderer: uses global apiRequest from js/api.js
const courseGrid = document.querySelector('.course-grid');
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

      const img = document.createElement('div');
      img.className = 'course-image';

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
      link.href = `course-details.html?id=${course.id}`;
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

  if (!courseId) {
    detailContainer.innerHTML = '<p>Course not found.</p>';
  } else {
    async function loadAndRenderCourse() {
      try {
        const data = await apiRequest(`/courses/${courseId}`);
        const course = data && data.course ? data.course : data;
        if (!course) {
          detailContainer.innerHTML = '<p>Course not found.</p>';
          return;
        }

        // Render main course details
        const title = course.title || 'Untitled Course';
        const description = course.description || '';
        const category = course.category || '';
        const level = course.level || '';
        const modules = Array.isArray(course.modules) ? course.modules : [];

        let metaHtml = '';
        const metaParts = [];
        if (category) metaParts.push(`<span><strong>Category:</strong> ${category}</span>`);
        if (level) metaParts.push(`<span><strong>Level:</strong> ${level}</span>`);
        if (metaParts.length) metaHtml = `<div class="course-meta">${metaParts.join('')}</div>`;

        detailContainer.innerHTML = `
          <div class="course-banner"></div>
          <h1>${escapeHtml(title)}</h1>
          ${metaHtml}
          <p class="course-description">${escapeHtml(description)}</p>
          <button class="enroll-btn" id="enrollCourseBtn">Enroll Now</button>
        `;

        const enrollBtn = document.getElementById("enrollCourseBtn");
        if (enrollBtn) {
          enrollBtn.addEventListener("click", async () => {
            try {
              await apiRequest(`/courses/${courseId}/enroll`, {
                method: "POST"
              });

              alert("Enrolled successfully");
            } catch (error) {
              alert(error.message);
            }
          });
        }

        // Render modules and lessons
        if (modulesSection) {
          if (!modules.length) {
            modulesSection.innerHTML = '<h2>Course Modules</h2><p>No modules available.</p>';
          } else {
            const modulesHtml = modules.map((m, idx) => {
              const lessons = (m.lessons || []).map(lesson => {
                const lessonTitle = lesson.title || lesson.name || 'Lesson';
                return `<li>${escapeHtml(lessonTitle)}</li>`;
              }).join('');

              const moduleTitle = m.title || m.name || `Module ${idx + 1}`;
              return `
                <div class="module-card">
                  <h3>${escapeHtml(moduleTitle)}</h3>
                  ${lessons ? `<ul>${lessons}</ul>` : ''}
                </div>
              `;
            }).join('');

            modulesSection.innerHTML = `<h2>Course Modules</h2>${modulesHtml}`;
          }
        }

      } catch (error) {
        detailContainer.innerHTML = '<p>Course not found.</p>';
        console.error('Failed to load course details', error);
      }
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