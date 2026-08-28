
document.addEventListener("DOMContentLoaded", () => {
  setupSidebar();
});

function setupSidebar() {
  const sidebarContainer = document.querySelector(".sidebar");
  if (!sidebarContainer) return;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role ? user.role.toUpperCase() : "LEARNER";

  let sidebarHtml = "";

  if (role === "ADMIN") {
    sidebarHtml = `
      <div class="sidebar-logo-container" style="padding: 10px 0 25px 0; display: flex; justify-content: flex-start; align-items: center;">
        <img src="assets/logo.svg" alt="High Court LMS Logo" style="height: 75px; width: auto; max-width: 220px; object-fit: contain; display: block;">
      </div>
      <ul>
        <li><a href="admin-dashboard.html">Dashboard</a></li>
        <li><a href="users.html">Users</a></li>
        <li><a href="admin-courses.html" class="active">Courses</a></li>
        <li><a href="reports.html">Reports</a></li>
        <li><a href="admin-certificates.html">Certificates</a></li>
        <li><a href="admin-settings.html">Settings</a></li>
        <li><a href="admin-profile.html">Profile</a></li>
      </ul>
      <div class="sidebar-logout">
        <a href="index.html" onclick="localStorage.clear()">Logout</a>
      </div>
    `;
  } else if (role === "TUTOR") {
    sidebarHtml = `
      <div class="sidebar-logo-container" style="padding: 10px 0 25px 0; display: flex; justify-content: flex-start; align-items: center;">
        <img src="assets/logo.svg" alt="High Court LMS Logo" style="height: 75px; width: auto; max-width: 220px; object-fit: contain; display: block;">
      </div>
      <ul>
        <li><a href="tutor-dashboard.html">Dashboard</a></li>
        <li><a href="my-courses.html" class="active">My Courses</a></li>
        <li><a href="create-course.html">Create Course</a></li>
        <li><a href="analytics.html">Analytics</a></li>
        <li><a href="tutor-profile.html">Profile</a></li>
      </ul>
      <div class="sidebar-logout">
        <a href="index.html" onclick="localStorage.clear()">Logout</a>
      </div>
    `;
  } else {
    // Default to Learner
    sidebarHtml = `
      <div class="sidebar-logo-container" style="padding: 10px 0 25px 0; display: flex; justify-content: flex-start; align-items: center;">
        <img src="assets/logo.svg" alt="High Court LMS Logo" style="height: 75px; width: auto; max-width: 220px; object-fit: contain; display: block;">
      </div>
      <ul>
        <li><a href="dashboard.html">Dashboard</a></li>
        <li><a href="courses.html" class="active">Courses</a></li>
        <li><a href="learning.html">My Learning</a></li>
        <li><a href="certificates.html">Certificates</a></li>
        <li><a href="learner-profile.html">Profile</a></li>
      </ul>
      <div class="sidebar-logout">
        <a href="index.html" onclick="localStorage.clear()">Logout</a>
      </div>
    `;
  }

  sidebarContainer.innerHTML = sidebarHtml;
}

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
  let allCourses = [];

  async function loadAndRenderCourses() {
    try {
      const categorySelect = document.getElementById("categoryFilter");
      if (categorySelect) {
        await loadCategoriesIntoSelect(categorySelect, null, true);
      }
      const data = await apiRequest('/courses');
      allCourses = Array.isArray(data) ? data : (data && data.courses) || [];
      filterAndRender();
    } catch (err) {
      courseGrid.innerHTML = `<p>No courses available yet.</p>`;
      console.error('Failed to load courses', err);
    }
  }

  function filterAndRender() {
    const searchInput = document.querySelector(".course-tools input");
    const categorySelect = document.getElementById("categoryFilter");

    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const category = categorySelect ? categorySelect.value : "ALL";

    const filtered = allCourses.filter(course => {
      const matchesSearch = !query || 
        (course.title && course.title.toLowerCase().includes(query)) ||
        (course.description && course.description.toLowerCase().includes(query));

      const matchesCategory = category === "ALL" || course.category === category;

      return matchesSearch && matchesCategory;
    });

    renderCourses(filtered);
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
      link.href = `course-details.html?id=${course.id}`;
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

  // Bind live search and category select inputs
  const searchInput = document.querySelector(".course-tools input");
  const categorySelect = document.getElementById("categoryFilter");

  if (searchInput) {
    searchInput.addEventListener("input", filterAndRender);
  }
  if (categorySelect) {
    categorySelect.addEventListener("change", filterAndRender);
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

        let hasCertificate = false;
        let certificatePdfUrl = null;
        if (enrolled && user.role === "LEARNER") {
          try {
            const certificates = await apiRequest("/certificates/my-certificates");
            const matchedCert = certificates.find(c => Number(c.courseId) === Number(course.id));
            if (matchedCert) {
              hasCertificate = true;
              certificatePdfUrl = matchedCert.pdfUrl;
            }
          } catch (e) {
            console.error("Failed to load certificates:", e);
          }
        }
        window.currentCourseCertificate = { hasCertificate, certificatePdfUrl };

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
          <div style="display: flex; gap: 30px; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; margin-bottom: 25px;">
            <div style="flex: 1; min-width: 300px;">
              <h1 style="margin-top: 0; font-size: 32px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">${escapeHtml(title)}</h1>
              ${metaHtml}
              <p class="course-description" style="font-size: 15px; color: #475569; line-height: 1.6; margin-top: 15px; margin-bottom: 20px;">${escapeHtml(description)}</p>
              ${
                shouldShowEnrollButton
                  ? '<button class="enroll-btn" id="enrollCourseBtn" style="padding: 12px 24px; font-size: 15px; font-weight: 600; border-radius: 8px; cursor: pointer; background: #4f46e5; color: white; border: none; transition: background 0.2s;">Enroll Now</button>'
                  : ""
              }
            </div>
            ${
              course.thumbnailUrl
                ? `
                  <div style="flex-shrink: 0; width: 280px; height: 160px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); background: #f1f5f9;">
                    <img src="${course.thumbnailUrl}" alt="${escapeHtml(title)}" style="width: 100%; height: 100%; object-fit: cover;">
                  </div>
                `
                : ""
            }
          </div>
        `;

        const enrollBtn = document.getElementById("enrollCourseBtn");
        if (enrollBtn) {
          enrollBtn.addEventListener("click", async () => {
            try {
              await apiRequest(`/courses/${courseId}/enroll`, {
                method: "POST"
              });

              showAlert("Enrolled successfully");
              enrollBtn.remove();
            } catch (error) {
              showAlert(error.message, "Error");
            }
          });
        }

        if (modulesSection) {
          await renderModules(courseId, false);
        }

        // Render Admin Action Panel if user is ADMIN
        const adminActionSection = document.getElementById("adminActionSection");
        if (adminActionSection && user.role === "ADMIN") {
          if (course.status === "PENDING_REVIEW") {
            adminActionSection.innerHTML = `
              <div class="card" style="margin-top: 30px; border: 1px solid #e5e7eb; padding: 25px; border-radius: 12px; background: #fafafa; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <h3 style="margin-top: 0; color: #1f2937;">Admin Review Panel</h3>
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">
                  As an Administrator, you can approve this course to make it live, or reject it with comments to send it back to the tutor.
                </p>
                
                <div class="form-group" style="margin-bottom: 15px;">
                  <label style="display: block; font-weight: 600; margin-bottom: 8px;">Review Feedback / Comment</label>
                  <textarea id="adminReviewComment" rows="4" style="width: 100%; box-sizing: border-box; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; font-family: inherit;" placeholder="Provide comments when rejecting or sending back the course..."></textarea>
                </div>
                
                <div style="display: flex; gap: 10px;">
                  <button id="adminApproveBtn" class="action-btn" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
                    Approve & Publish
                  </button>
                  <button id="adminRejectBtn" class="action-btn" style="background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
                    Send Back (Reject)
                  </button>
                </div>
              </div>
            `;

            const approveBtn = document.getElementById("adminApproveBtn");
            const rejectBtn = document.getElementById("adminRejectBtn");
            const commentInput = document.getElementById("adminReviewComment");

            approveBtn.addEventListener("click", async () => {
              const confirmed = await showConfirm("Are you sure you want to approve and publish this course?");
              if (!confirmed) return;
              try {
                await apiRequest(`/courses/${courseId}/publish`, {
                  method: "POST"
                });
                await showAlert("Course approved and published successfully!");
                window.location.reload();
              } catch (error) {
                showAlert(error.message || "Failed to approve course", "Error");
              }
            });

            rejectBtn.addEventListener("click", async () => {
              const comment = commentInput.value.trim();
              if (!comment) {
                showAlert("Please enter a review comment explaining why the course is being sent back.", "Validation Error");
                return;
              }
              const confirmed = await showConfirm("Are you sure you want to send this course back to the tutor?");
              if (!confirmed) return;
              try {
                await apiRequest(`/courses/${courseId}/reject`, {
                  method: "POST",
                  body: { comment }
                });
                await showAlert("Course sent back to tutor successfully.");
                window.location.href = "admin-courses.html";
              } catch (error) {
                showAlert(error.message || "Failed to reject course", "Error");
              }
            });
          } else if (course.status === "PUBLISHED") {
            adminActionSection.innerHTML = `
              <div class="card" style="margin-top: 30px; border: 1px solid #10b981; padding: 20px; border-radius: 12px; background: #ecfdf5; color: #065f46; font-weight: 600;">
                ✓ Live Status: This course is already approved and published.
              </div>
            `;
          }
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
      // Dynamic styles injection for lesson card rows hover animations
      if (!document.getElementById("dynamic-lesson-row-styles")) {
        const style = document.createElement("style");
        style.id = "dynamic-lesson-row-styles";
        style.innerHTML = `
          .lesson-row:hover {
            border-color: #4f46e5 !important;
            background: #faf5ff !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05) !important;
          }
        `;
        document.head.appendChild(style);
      }

      const modules = await fetchCourseModules(courseId);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const role = user.role ? user.role.toUpperCase() : "LEARNER";

      const modulesWithData = await Promise.all(
        modules.map(async (module, idx) => {
          let questions = [];
          let showQuizToUser = false;

          if (role === "ADMIN" || role === "TUTOR") {
            showQuizToUser = true;
          } else if (localStorage.getItem("token")) {
            // Learner: Check if they completed the quiz
            try {
              const attempt = await apiRequest(`/quiz/modules/${module.id}/my-attempt`);
              if (attempt) {
                showQuizToUser = true;
              }
            } catch (e) {
              console.error("Failed to check quiz completion:", e);
            }
          }

          if (showQuizToUser) {
            try {
              questions = await apiRequest(`/quiz/modules/${module.id}/questions`);
            } catch (e) {
              console.error("Failed to load questions for module:", module.id, e);
            }
          }

          return {
            ...module,
            lessons: await fetchModuleLessons(module.id),
            questions,
            showQuizToUser,
            displayTitle: module.title || `Module ${idx + 1}`,
          };
        })
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

      if (!modulesWithData.length) {
        html += '<p>No modules available.</p>';
      } else {
        modulesWithData.forEach((module) => {
          const lessonsHtml = Array.isArray(module.lessons) && module.lessons.length
            ? `<div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">${module.lessons
                .map((lesson, index) => `
                  <div class="lesson-row" onclick="window.location.href='lesson-details.html?id=${lesson.id}'" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border: 1.5px solid #e2e8f0; background: white; border-radius: 10px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.01);">
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <span style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: #f1f5f9; border-radius: 50%; color: #4f46e5; font-weight: 600; font-size: 13px;">
                        ${index + 1}
                      </span>
                      <span style="font-weight: 600; font-size: 14px; color: #1e293b;">${escapeHtml(lesson.title || 'Lesson')}</span>
                    </div>
                    <span style="font-size: 13px; color: #4f46e5; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                      Start Lesson <span style="font-size: 14px;">➔</span>
                    </span>
                  </div>
                `)
                .join('')}</div>`
            : '<p style="color: #64748b; font-style: italic; font-size: 14px; margin-top: 10px;">No lessons available yet.</p>';

          let quizHtml = '';
          if (module.showQuizToUser) {
            if (module.questions && module.questions.length > 0) {
              quizHtml += `
                <div style="margin-top: 12px;">
                  <button class="action-btn" onclick="toggleQuizAnswers(${module.id})" style="background: #f1f5f9; color: #475569; border: 1.5px solid #cbd5e1; padding: 8px 14px; font-size: 13px; border-radius: 8px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s; outline: none; margin: 0;">
                    <span>📝</span> Completed Quiz (Show Answers)
                  </button>
                  <div id="quiz-answers-${module.id}" style="display: none; margin-top: 14px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 15px;">
                    <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #475569; font-weight: 600;">Module Quiz (${module.questions.length} questions):</h4>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
              `;
              module.questions.forEach((q, qidx) => {
                const optionsHtml = q.options.map((opt) => {
                  const isCorrect = opt.id === q.correctOptionId;
                  return `<li style="font-size: 12px; color: ${isCorrect ? '#16a34a' : '#64748b'}; font-weight: ${isCorrect ? '600' : 'normal'}; list-style-type: disc; margin-bottom: 2px;">
                    ${escapeHtml(opt.text)} ${isCorrect ? '✓' : ''}
                  </li>`;
                }).join('');

                quizHtml += `
                  <div style="background: white; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px;">
                    <div style="font-weight: 600; font-size: 12px; color: #1e293b; margin-bottom: 4px;">
                      Q${qidx + 1}: ${escapeHtml(q.text)}
                    </div>
                    <ul style="margin: 3px 0 0 0; padding-left: 18px;">
                      ${optionsHtml}
                    </ul>
                  </div>
                `;
              });
              quizHtml += `</div></div></div>`;
            } else {
              quizHtml = '<p style="color: #94a3b8; font-style: italic; margin-top: 10px; font-size: 12px;">No quiz questions added to this module.</p>';
            }
          }

          html += `
            <div class="module-card">
              <h3>${escapeHtml(module.displayTitle)}</h3>
              ${lessonsHtml}
              ${quizHtml}
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

      // Render Dynamic Certificate Completed / Claim Alert Banner on Course Landing Page
      const alertSection = document.getElementById("certificateAlertSection");
      if (alertSection && role === "LEARNER" && window.currentCourseCertificate) {
        const { hasCertificate, certificatePdfUrl } = window.currentCourseCertificate;

        if (hasCertificate) {
          alertSection.innerHTML = `
            <div style="background: #ecfdf5; border: 1.5px solid #10b981; border-radius: 12px; padding: 20px; margin-bottom: 25px; display: flex; align-items: center; justify-content: space-between; gap: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); box-sizing: border-box; width: 100%;">
              <div>
                <h3 style="margin: 0 0 4px 0; color: #065f46; font-size: 16px; font-weight: 700;">🎉 Course Completed!</h3>
                <p style="margin: 0; color: #047857; font-size: 14px;">Congratulations! You have completed all lessons and quizzes for this course.</p>
              </div>
              <a href="${certificatePdfUrl || '#'}" target="_blank" class="action-btn" style="background: #10b981; color: white; padding: 10px 18px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin: 0;">
                <span>🎓</span> Download Certificate
              </a>
            </div>
          `;
        } else {
          const allQuizzesPassed = modulesWithData.every(mod => {
            if (!mod.questions || mod.questions.length === 0) return true;
            return mod.showQuizToUser;
          });

          if (allQuizzesPassed && modulesWithData.length > 0) {
            alertSection.innerHTML = `
              <div id="cert-generation-banner" style="background: #fffbeb; border: 1.5px solid #f59e0b; border-radius: 12px; padding: 20px; margin-bottom: 25px; display: flex; align-items: center; justify-content: space-between; gap: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); box-sizing: border-box; width: 100%;">
                <div>
                  <h3 style="margin: 0 0 4px 0; color: #78350f; font-size: 16px; font-weight: 700;">🎓 Certificate Claim Available!</h3>
                  <p style="margin: 0; color: #92400e; font-size: 14px;">You have successfully finished all lessons and quizzes. Click below to claim your certificate.</p>
                </div>
                <button onclick="generateCourseCertificate(${courseId})" class="action-btn" style="background: #f59e0b; color: white; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin: 0;">
                  Claim Certificate
                </button>
              </div>
            `;
          } else {
            alertSection.innerHTML = "";
          }
        }
      }

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

    window.toggleQuizAnswers = function(moduleId) {
      const container = document.getElementById(`quiz-answers-${moduleId}`);
      const btn = event.currentTarget;
      if (container) {
        if (container.style.display === "none") {
          container.style.display = "block";
          btn.innerHTML = "<span>📝</span> Completed Quiz (Hide Answers)";
        } else {
          container.style.display = "none";
          btn.innerHTML = "<span>📝</span> Completed Quiz (Show Answers)";
        }
      }
    };

    window.generateCourseCertificate = async function(courseId) {
      try {
        const btn = event.currentTarget;
        btn.disabled = true;
        btn.textContent = "Generating...";
        
        const res = await apiRequest(`/certificates/generate/${courseId}`, {
          method: "POST"
        });
        await showAlert("Certificate generated successfully!");
        window.location.reload();
      } catch (err) {
        showAlert(err.message || "Failed to generate certificate.", "Error");
        btn.disabled = false;
        btn.textContent = "Claim Certificate";
      }
    };

    loadAndRenderCourse();
  }
}

