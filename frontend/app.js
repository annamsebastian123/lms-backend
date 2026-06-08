
const API_URL = "http://localhost:5000";

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

      // Redirect based on user role
      const user = data.user;
      if (user.role === "ADMIN") {
        window.location.href = "admin-dashboard.html";
      } else {
        window.location.href = "dashboard.html";
      }
    } catch (err) {
      message.textContent = "Something went wrong";
      console.error(err);
    }
  });
}

const registerBtn = document.getElementById("registerBtn");

if (registerBtn) {
  registerBtn.addEventListener("click", async () => {
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const role = document.getElementById("registerRole")
      ? document.getElementById("registerRole").value
      : "LEARNER";

    const message = document.getElementById("registerMessage");

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        message.textContent = data.message || "Registration failed";
        return;
      }

      message.textContent = "Registration successful. Please login.";

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } catch (err) {
      message.textContent = "Something went wrong";
      console.error(err);
    }
  });
}

// Courses page renderer
const courseGrid = document.querySelector(".course-grid");

if (courseGrid) {
  async function loadAndRenderCourses() {
    try {
      const data = await apiRequest("/courses");

      const courses = Array.isArray(data)
        ? data
        : (data && data.courses) || [];

      renderCourses(courses);
    } catch (err) {
      courseGrid.innerHTML = `<p>No courses available yet.</p>`;
      console.error("Failed to load courses", err);
    }
  }

  function renderCourses(courses) {
    courseGrid.innerHTML = "";

    if (!courses || courses.length === 0) {
      courseGrid.innerHTML = `<p>No courses available yet.</p>`;
      return;
    }

    courses.forEach((course) => {
      const card = document.createElement("div");
      card.className = "course-card";

      const img = document.createElement("div");
      img.className = "course-image";

      const content = document.createElement("div");
      content.className = "course-content";

      const title = document.createElement("h3");
      title.textContent = course.title || "Untitled Course";

      const desc = document.createElement("p");
      desc.textContent = course.description || "";

      const meta = document.createElement("p");

      const parts = [];

      if (course.category) {
        parts.push(course.category);
      }

      if (course.level) {
        parts.push(course.level);
      }

      meta.textContent = parts.join(" • ");

      const link = document.createElement("a");
      link.href = `course-details.html?id=${course.id}`;

      link.addEventListener("click", () => {
        localStorage.setItem("selectedCourseId", course.id);
      });

      const btn = document.createElement("button");
      btn.className = "enroll-btn";
      btn.textContent = "View Details";

      link.appendChild(btn);

      content.appendChild(title);

      if (desc.textContent) {
        content.appendChild(desc);
      }

      if (meta.textContent) {
        content.appendChild(meta);
      }

      content.appendChild(link);

      card.appendChild(img);
      card.appendChild(content);

      courseGrid.appendChild(card);
    });
  }

  loadAndRenderCourses();
}

// Course details page renderer
const detailContainer = document.querySelector(".course-detail-container");
const modulesSection = document.querySelector(".modules-section");

if (detailContainer) {
  const params = new URLSearchParams(window.location.search);

  const courseId =
    params.get("id") || localStorage.getItem("selectedCourseId");

  console.log("Course details page:", window.location.href);
  console.log("Course details search:", window.location.search);
  console.log("Determined courseId:", courseId);

  if (!courseId) {
    detailContainer.innerHTML = "<p>Course not found.</p>";
  } else {
    async function loadAndRenderCourse() {
      try {
        const data = await apiRequest(`/courses/${courseId}`);

        console.log("Course API response:", data);

        const course = data && data.course ? data.course : data;

        if (!course) {
          detailContainer.innerHTML = "<p>Course not found.</p>";
          return;
        }

        const title = course.title || "Untitled Course";
        const description = course.description || "";
        const category = course.category || "";
        const level = course.level || "";
        const modules = Array.isArray(course.modules) ? course.modules : [];

        let metaHtml = "";

        const metaParts = [];

        if (category) {
          metaParts.push(
            `<span><strong>Category:</strong> ${escapeHtml(category)}</span>`
          );
        }

        if (level) {
          metaParts.push(
            `<span><strong>Level:</strong> ${escapeHtml(level)}</span>`
          );
        }

        if (metaParts.length) {
          metaHtml = `<div class="course-meta">${metaParts.join("")}</div>`;
        }

        detailContainer.innerHTML = `
          <div class="course-banner"></div>

          <div class="top-header">
            <div>
              <h1>${escapeHtml(title)}</h1>
              <p>Course overview, modules and learning outcomes</p>
            </div>
          </div>

          ${metaHtml}

          <div class="dashboard-section">
            <h2>Course Information</h2>
            <p class="course-description">${escapeHtml(description)}</p>
          </div>

          <button class="enroll-btn" id="enrollCourseBtn">
            Enroll Now
          </button>
        `;

        const enrollBtn = document.getElementById("enrollCourseBtn");

        if (enrollBtn) {
          enrollBtn.addEventListener("click", async () => {
            try {
              await apiRequest(`/courses/${courseId}/enroll`, {
                method: "POST",
              });

              alert("Enrolled successfully");
              window.location.href = "learning.html";
            } catch (error) {
              alert(error.message);
            }
          });
        }

        if (modulesSection) {
          if (!modules.length) {
            modulesSection.innerHTML = `
              <h2>Course Modules</h2>
              <p>No modules available.</p>
            `;
          } else {
            const modulesHtml = modules
              .map((m, idx) => {
                const lessons = (m.lessons || [])
                  .map((lesson) => {
                    const lessonTitle =
                      lesson.title || lesson.name || "Lesson";

                    return `<li>${escapeHtml(lessonTitle)}</li>`;
                  })
                  .join("");

                const moduleTitle = m.title || m.name || `Module ${idx + 1}`;

                return `
                  <div class="module-card">
                    <h3>${escapeHtml(moduleTitle)}</h3>
                    ${lessons ? `<ul>${lessons}</ul>` : ""}
                  </div>
                `;
              })
              .join("");

            modulesSection.innerHTML = `
              <h2>Course Modules</h2>
              ${modulesHtml}
            `;
          }
        }
      } catch (error) {
        detailContainer.innerHTML = `
          <h2>Error Loading Course</h2>
          <pre>${JSON.stringify(
            {
              message: error.message,
              stack: error.stack,
            },
            null,
            2
          )}</pre>
        `;
      }
    }

    function escapeHtml(str) {
      if (!str) {
        return "";
      }

      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    loadAndRenderCourse();
  }
}