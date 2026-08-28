const params = new URLSearchParams(window.location.search);
const courseId = params.get('id') || localStorage.getItem("selectedCourseId");

const courseTitleInput = document.getElementById("courseTitle");
const courseCategoryInput = document.getElementById("courseCategory");
const targetRoleSelect = document.getElementById("targetRole");
const isContinuingSelect = document.getElementById("isContinuing");
const courseDescriptionInput = document.getElementById("courseDescription");
const courseThumbnailInput = document.getElementById("courseThumbnail");
const thumbnailPreview = document.getElementById("thumbnailPreview");
const saveCourseBtn = document.getElementById("saveCourseBtn");
const submitReviewBtn = document.getElementById("submitReviewBtn");
const courseStatusLabel = document.getElementById("courseStatusLabel");
const revisionSection = document.getElementById("revisionSection");
const revisionComment = document.getElementById("revisionComment");
const modulesSection = document.querySelector('.modules-section');

let currentCourse = null;

if (!courseId) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const fallback = user.role === "ADMIN" ? "admin-courses.html" : "my-courses.html";
  showAlert("No course ID provided.", "Error").then(() => {
    window.location.href = fallback;
  });
} else {
  // Load and render course details on page load
  async function loadCourseDetails() {
    try {
      const data = await apiRequest(`/courses/${courseId}`);
      console.log("Course details data:", data);

      const course = data && data.course ? data.course : data;
      currentCourse = course;

      if (!course) {
        await showAlert("Course not found.", "Error");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const fallback = user.role === "ADMIN" ? "admin-courses.html" : "my-courses.html";
        window.location.href = fallback;
        return;
      }

      // Populate input values
      courseTitleInput.value = course.title || "";
      await loadCategoriesIntoSelect(courseCategoryInput, course.category || "");
      targetRoleSelect.value = course.targetRole || "ALL";
      isContinuingSelect.value = String(course.isContinuing);
      courseDescriptionInput.value = course.description || "";
      courseStatusLabel.textContent = `Status: ${course.status}`;

      // Populate thumbnail preview
      if (course.thumbnailUrl) {
        thumbnailPreview.innerHTML = `<img src="${course.thumbnailUrl}" style="max-width:100%; max-height:100%; object-fit:cover;">`;
      } else {
        thumbnailPreview.innerHTML = "No image selected";
      }

      // Handle Rejection Feedback Comment Box
      if (course.status === "DRAFT" && course.adminComment) {
        revisionSection.style.display = "block";
        revisionComment.textContent = course.adminComment;
      } else {
        revisionSection.style.display = "none";
      }

      // Render modules list
      await renderModules(courseId);

      // Apply view/edit permissions lock state
      applyStatePermissions(course);

    } catch (error) {
      console.error("Error loading course details:", error);
      showAlert("Failed to load course details.", "Error");
    }
  }

  // Lock edit controls if course is published and NOT continuing
  function applyStatePermissions(course) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isLocked = course.status === "PUBLISHED" && !course.isContinuing;

    // Form inputs disable state
    courseTitleInput.disabled = isLocked;
    courseCategoryInput.disabled = isLocked;
    targetRoleSelect.disabled = isLocked;
    isContinuingSelect.disabled = isLocked;
    courseDescriptionInput.disabled = isLocked;
    courseThumbnailInput.disabled = isLocked;

    if (isLocked) {
      if (saveCourseBtn) saveCourseBtn.style.display = "none";
      if (submitReviewBtn) submitReviewBtn.style.display = "none";
      courseStatusLabel.textContent = "Status: PUBLISHED (Structure Locked)";
    } else {
      if (saveCourseBtn) saveCourseBtn.style.display = "block";
      
      if (user.role === "ADMIN") {
        if (submitReviewBtn) submitReviewBtn.style.display = "none";
        courseStatusLabel.textContent = `Status: ${course.status} (Admin Editing Enabled)`;
      } else {
        if (course.status === "DRAFT") {
          if (submitReviewBtn) {
            submitReviewBtn.style.display = "block";
            submitReviewBtn.textContent = "Submit for Review";
            submitReviewBtn.disabled = false;
          }
        } else if (course.status === "PENDING_REVIEW") {
          if (submitReviewBtn) {
            submitReviewBtn.style.display = "block";
            submitReviewBtn.textContent = "Under Review";
            submitReviewBtn.disabled = true;
            submitReviewBtn.style.background = "#94a3b8";
          }
        } else {
          // Published but is continuing
          if (submitReviewBtn) submitReviewBtn.style.display = "none";
          courseStatusLabel.textContent = "Status: PUBLISHED (Continuing course - updates allowed)";
        }
      }
    }

    // Dynamic Admin Review Panel
    const adminReviewSection = document.getElementById("adminReviewSection");
    if (adminReviewSection) {
      if (user.role === "ADMIN" && course.status !== "PUBLISHED") {
        adminReviewSection.innerHTML = `
          <div class="card" style="margin-top: 30px; border: 1.5px solid #cbd5e1; padding: 25px; border-radius: 12px; background: #fafafa; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 24px;">
            <h3 style="margin-top: 0; color: #1e293b; font-size: 16px; font-weight: 600;">Admin Review Panel</h3>
            <p style="color: #64748b; font-size: 14px; margin-bottom: 15px;">
              As an Administrator, you can approve this course to make it live, or reject it with comments to send it back to the tutor.
            </p>
            
            <div class="form-group" style="margin-bottom: 15px;">
              <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #475569; font-size: 13px;">Review Feedback / Comment</label>
              <textarea id="adminReviewComment" rows="4" style="width: 100%; box-sizing: border-box; padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 14px; font-family: inherit; margin-top:4px;" placeholder="Provide comments when rejecting or sending back the course..."></textarea>
            </div>
            
            <div style="display: flex; gap: 10px;">
              <button id="adminApproveBtn" class="publish-btn" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size:13px; transition: background 0.2s; margin:0;">
                Approve & Publish
              </button>
              <button id="adminRejectBtn" class="publish-btn" style="background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size:13px; transition: background 0.2s; margin:0;">
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
            await apiRequest(`/courses/${course.id}/publish`, {
              method: "POST"
            });
            await showAlert("Course approved and published successfully!");
            window.location.href = "admin-courses.html";
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
            await apiRequest(`/courses/${course.id}/reject`, {
              method: "POST",
              body: { comment }
            });
            await showAlert("Course sent back to tutor successfully.");
            window.location.href = "admin-courses.html";
          } catch (error) {
            showAlert(error.message || "Failed to reject course", "Error");
          }
        });
      } else if (user.role === "ADMIN" && course.status === "PUBLISHED") {
        adminReviewSection.innerHTML = `
          <div class="card" style="margin-top: 30px; border: 1.5px solid #ef4444; padding: 25px; border-radius: 12px; background: #fef2f2; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 24px;">
            <h3 style="margin-top: 0; color: #991b1b; font-size: 16px; font-weight: 600;">Admin Revision Panel (Published Course)</h3>
            <p style="color: #b91c1c; font-size: 14px; margin-bottom: 15px;">
              This course is currently Live (Published). If you need to make changes or request the tutor to revise it, you can revert it back to Draft status.
            </p>
            
            <div class="form-group" style="margin-bottom: 15px;">
              <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #991b1b; font-size: 13px;">Revision Feedback / Comment (Optional)</label>
              <textarea id="adminRevertComment" rows="4" style="width: 100%; box-sizing: border-box; padding: 12px; border: 1.5px solid #fca5a5; border-radius: 8px; font-size: 14px; font-family: inherit; margin-top:4px;" placeholder="Provide revision notes explaining why the course is being reverted..."></textarea>
            </div>
            
            <button id="adminRevertBtn" class="publish-btn" style="background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size:13px; transition: background 0.2s; margin:0;">
              Revert to Draft & Request Revision
            </button>
          </div>
        `;

        const revertBtn = document.getElementById("adminRevertBtn");
        const commentInput = document.getElementById("adminRevertComment");

        revertBtn.addEventListener("click", async () => {
          const comment = commentInput.value.trim();
          const confirmed = await showConfirm("Are you sure you want to revert this published course back to draft status?");
          if (!confirmed) return;
          try {
            await apiRequest(`/courses/${course.id}/revert-draft`, {
              method: "POST",
              body: { comment }
            });
            await showAlert("Course has been reverted to draft successfully.");
            window.location.href = "admin-courses.html";
          } catch (error) {
            showAlert(error.message || "Failed to revert course to draft", "Error");
          }
        });
      } else {
        adminReviewSection.innerHTML = "";
      }
    }
  }

  // Upload Thumbnail Handler
  async function uploadThumbnailIfSelected() {
    const file = courseThumbnailInput?.files?.[0];
    if (!file) return currentCourse?.thumbnailUrl || null;

    const formData = new FormData();
    formData.append("thumbnail", file);

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/upload/course-thumbnail`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Thumbnail upload failed");
    }

    return result.thumbnailKey;
  }

  // Save Course Button Click
  if (saveCourseBtn) {
    saveCourseBtn.addEventListener("click", async () => {
      const title = courseTitleInput.value.trim();
      const description = courseDescriptionInput.value.trim();
      const category = courseCategoryInput.value.trim();
      const targetRole = targetRoleSelect.value;
      const isContinuing = isContinuingSelect.value === "true";

      if (!title) {
        showAlert("Course title is required", "Validation Error");
        return;
      }

      try {
        const thumbnailUrl = await uploadThumbnailIfSelected();

        await apiRequest(`/courses/${courseId}`, {
          method: "PUT",
          body: {
            title,
            description,
            category,
            targetRole,
            isContinuing,
            thumbnailUrl,
          },
        });

        showAlert("Course details updated successfully.");
        await loadCourseDetails();
      } catch (err) {
        showAlert(`Error saving course: ${err.message}`, "Error");
      }
    });
  }

  // Submit for Review Button Click
  if (submitReviewBtn) {
    submitReviewBtn.addEventListener("click", async () => {
      const confirmed = await showConfirm("Are you sure you want to submit this course for review?");
      if (!confirmed) return;

      try {
        await apiRequest(`/courses/${courseId}/submit-review`, {
          method: "POST"
        });
        await showAlert("Course submitted for admin review successfully.");
        await loadCourseDetails();
      } catch (err) {
        showAlert(err.message || "Failed to submit course for review.", "Error");
      }
    });
  }

  // Fetch module list
  async function fetchCourseModules(courseId) {
    try {
      const data = await apiRequest(`/courses/${courseId}/modules`);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  }

  // Fetch lessons inside a module
  async function fetchModuleLessons(moduleId) {
    try {
      const data = await apiRequest(`/courses/modules/${moduleId}/lessons`);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  }

  // Fetch quiz questions inside a module
  async function fetchModuleQuestions(moduleId) {
    try {
      const data = await apiRequest(`/quiz/modules/${moduleId}/questions`);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  // Render modules and lessons list
  async function renderModules(courseId) {
    const modules = await fetchCourseModules(courseId);
    const modulesWithLessons = await Promise.all(
      modules.map(async (module, idx) => ({
        ...module,
        lessons: await fetchModuleLessons(module.id),
        displayTitle: module.title || `Module ${idx + 1}`,
      }))
    );

    const isLocked = currentCourse?.status === "PUBLISHED" && !currentCourse?.isContinuing;

    let html = '<h2 style="font-size: 20px; color:#1e293b; margin-bottom: 16px; font-weight:600;">Course Modules</h2>';

    // Show add module controls if course is not locked
    if (!isLocked) {
      html += `
        <div class="form-group" style="display:flex; gap: 12px; margin-bottom: 20px; background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <input type="text" id="newModuleTitle" placeholder="Enter new module title" style="flex: 1; padding: 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size:14px; margin-bottom:0;">
          <button class="action-btn" id="addModuleBtn" style="background:#4f46e5; color:white; border:none; padding:10px 20px; border-radius: 6px; font-weight:600; cursor:pointer; margin:0;">Add Module</button>
        </div>
      `;
    }

    if (!modulesWithLessons.length) {
      html += '<p style="color:#64748b; font-style:italic;">No modules created yet.</p>';
    } else {
      modulesWithLessons.forEach((module) => {
        const lessonsHtml = Array.isArray(module.lessons) && module.lessons.length
          ? `<ul style="list-style:none; padding: 0; margin: 12px 0 0 0;">${module.lessons
              .map((lesson, index) => `
                <li class="lesson-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px; margin-bottom: 8px;">
                  <span style="font-weight: 500; color: #475569; font-size:13px;">
                    Lesson ${index + 1}: ${escapeHtml(lesson.title || 'Lesson')} (${lesson.duration} mins)
                  </span>
                </li>
              `).join('')}</ul>`
          : '<p style="color: #94a3b8; font-style: italic; margin-top: 10px; font-size: 13px;">No lessons created in this module.</p>';

        html += `
          <div class="module-card" style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 600;">
                <a href="tutor-module-details.html?id=${module.id}&courseId=${courseId}" style="text-decoration: none; color: #1e293b; transition: color 0.2s;" onmouseover="this.style.color='#4f46e5'" onmouseout="this.style.color='#1e293b'">
                  ${escapeHtml(module.displayTitle)}
                </a>
              </h3>
              ${!isLocked ? `
                <button class="deleteModuleBtn" data-module-id="${module.id}" style="padding: 6px 12px; font-size: 12px; background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; border-radius: 6px; cursor: pointer; font-weight:600;">
                  Delete Module
                </button>
              ` : ''}
            </div>

            ${lessonsHtml}

            <div style="display:flex; justify-content: space-between; align-items: center; margin-top:20px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
              <a href="tutor-module-details.html?id=${module.id}&courseId=${courseId}" style="font-size: 13px; font-weight:600; color:#4f46e5; text-decoration:none; display:inline-flex; align-items:center; gap:4px; transition: color 0.2s;" onmouseover="this.style.color='#4338ca'" onmouseout="this.style.color='#4f46e5'">
                Manage Lessons & Quizzes &rarr;
              </a>
            </div>
          </div>
        `;
      });
    }

    modulesSection.innerHTML = html;

    // Attach event triggers
    attachDynamicModuleActions(courseId);
  }

  // Attach dynamic event listeners
  function attachDynamicModuleActions(courseId) {
    // Add Module Action
    const addModuleBtn = document.getElementById('addModuleBtn');
    if (addModuleBtn) {
      addModuleBtn.addEventListener('click', async () => {
        const titleInput = document.getElementById('newModuleTitle');
        const title = titleInput && titleInput.value.trim();
        if (!title) {
          showAlert('Module title is required', 'Validation Error');
          return;
        }

        try {
          await apiRequest(`/courses/${courseId}/modules`, {
            method: 'POST',
            body: { title },
          });
          if (titleInput) titleInput.value = '';
          await renderModules(courseId);
        } catch (err) {
          showAlert(err.message || 'Failed to add module', 'Error');
        }
      });
    }

    // Delete Module Action
    document.querySelectorAll(".deleteModuleBtn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const mId = btn.dataset.moduleId;
        const confirmed = await showConfirm("Are you sure you want to delete this module? This will delete all its lessons and quizzes!");
        if (!confirmed) return;

        try {
          await apiRequest(`/courses/modules/${mId}`, {
            method: "DELETE"
          });
          showAlert("Module deleted successfully.");
          await renderModules(courseId);
        } catch (err) {
          showAlert(err.message || "Failed to delete module.", "Error");
        }
      });
    });
  }

  // HTML character escapes
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Initialize Customizer loading
  loadCourseDetails();
}
