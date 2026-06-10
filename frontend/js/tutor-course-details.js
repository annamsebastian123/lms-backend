const detailContainer = document.querySelector('.course-detail-container');
const modulesSection = document.querySelector('.modules-section');
const params = new URLSearchParams(window.location.search);
const courseId =
  params.get('id') || localStorage.getItem("selectedCourseId");
console.log("Tutor URL:", window.location.href);
console.log("Tutor search:", window.location.search);
console.log("Tutor courseId:", courseId);


if (!detailContainer || !courseId) {
  if (detailContainer) {
    detailContainer.innerHTML = '<p>Course not found.</p>';
  }
} else {
  async function loadAndRenderCourse() {
    try {
      const data = await apiRequest(`/courses/${courseId}`);
      console.log("Tutor API response:", data);

      const course = data && data.course ? data.course : data;
      console.log("Tutor course object:", course);
      if (!course) {
        detailContainer.innerHTML = '<p>Course not found.</p>';
        return;
      }

      console.log("Rendering course details...");
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
        <div class="course-banner"></div>
        <h1>${escapeHtml(title)}</h1>
        ${metaHtml}
        <p class="course-description">${escapeHtml(description)}</p>
      `;

      if (modulesSection) {
        await renderModules(courseId);
      }
    } catch (error) {
      detailContainer.innerHTML = `
        <h2>Error Loading Course</h2>
        <pre>${JSON.stringify({
          message: error.message,
          stack: error.stack,
        }, null, 2)}</pre>
      `;
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

  async function renderModules(courseId) {
    const modules = await fetchCourseModules(courseId);
    const modulesWithLessons = await Promise.all(
      modules.map(async (module, idx) => ({
        ...module,
        lessons: await fetchModuleLessons(module.id),
        displayTitle: module.title || `Module ${idx + 1}`,
      }))
    );

    let html = '<h2>Course Modules</h2>';
    html += `
      <div class="form-group">
        <input type="text" id="newModuleTitle" placeholder="New module title">
        <button class="action-btn" id="addModuleBtn">Add Module</button>
      </div>
    `;

    if (!modulesWithLessons.length) {
      html += '<p>No modules available.</p>';
    } else {
      modulesWithLessons.forEach((module) => {
        const lessonsHtml = Array.isArray(module.lessons) && module.lessons.length
          ? `<ul>${module.lessons
              .map((lesson, index) => `
  <div class="lesson-item">
    <a class="lesson-link"
       href="lesson-details.html?id=${lesson.id}">
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
            <div>
  <button
    class="action-btn showLessonFormBtn"
    data-module-id="${module.id}">
    + Add Lesson
  </button>

  <div
    id="lessonForm-${module.id}"
    style="display:none; margin-top:10px;">

    <input
      type="text"
      id="lessonTitle-${module.id}"
      placeholder="Lesson title">

    <input
      type="text"
      id="lessonContent-${module.id}"
      placeholder="Lesson content">

    <button
      class="action-btn addLessonBtn"
      data-module-id="${module.id}">
      Save Lesson
    </button>
  </div>
</div>
          </div>
        `;
      });
    }

    modulesSection.innerHTML = html;
    attachModuleFormHandlers(courseId);
  }

  function attachModuleFormHandlers(courseId) {
    const addModuleBtn = document.getElementById('addModuleBtn');
    if (addModuleBtn) {
      addModuleBtn.addEventListener('click', async () => {
        const titleInput = document.getElementById('newModuleTitle');
        const title = titleInput && titleInput.value.trim();
        if (!title) {
          alert('Module title is required');
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
          alert(err.message || 'Failed to add module');
        }
      });
    }
    document.querySelectorAll('.showLessonFormBtn').forEach((button) => {
  button.addEventListener('click', () => {
    const moduleId = button.dataset.moduleId;

    document.getElementById(
      `lessonForm-${moduleId}`
    ).style.display = 'block';

    button.style.display = 'none';
  });
});
    document.querySelectorAll('.addLessonBtn').forEach((button) => {
      button.addEventListener('click', async () => {
        const moduleId = button.dataset.moduleId;
        const titleInput = document.getElementById(`lessonTitle-${moduleId}`);
        const contentInput = document.getElementById(`lessonContent-${moduleId}`);
        const title = titleInput && titleInput.value.trim();
        const content = contentInput && contentInput.value.trim();

        if (!title) {
          alert('Lesson title is required');
          return;
        }

        try {
          await apiRequest(`/courses/modules/${moduleId}/lessons`, {
            method: 'POST',
            body: { title, content },
          });
          if (titleInput) titleInput.value = '';
          if (contentInput) contentInput.value = '';
          await renderModules(courseId);
        } catch (err) {
          alert(err.message || 'Failed to add lesson');
        }
      });
    });
  }

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
