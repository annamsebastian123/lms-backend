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
async function fetchModuleQuestions(moduleId) {
  try {
    const data = await apiRequest(
      `/quiz/modules/${moduleId}/questions`
    );

    return Array.isArray(data) ? data : [];
  } catch {
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

<div
  style="
    display:flex;
    gap:10px;
    margin-top:20px;
    flex-wrap:wrap;
  "
>
  <button
    class="action-btn showLessonFormBtn"
    data-module-id="${module.id}">
    + Add Lesson
  </button>

  <button
    class="action-btn showQuizFormBtn"
    data-module-id="${module.id}">
    + Add Quiz Question
  </button>

  <button
    class="action-btn viewQuizBtn"
    data-module-id="${module.id}">
    View Quiz
  </button>
</div>

<div
  id="quizForm-${module.id}"
  style="display:none; margin-top:10px;">

  <input
    type="text"
    id="quizQuestion-${module.id}"
    placeholder="Question">

  <input
    type="text"
    id="option1-${module.id}"
    placeholder="Option 1">

  <input
    type="text"
    id="option2-${module.id}"
    placeholder="Option 2">

  <input
    type="text"
    id="option3-${module.id}"
    placeholder="Option 3">

  <input
    type="text"
    id="option4-${module.id}"
    placeholder="Option 4">

  <select id="correctOption-${module.id}">
    <option value="0">Correct Answer: Option 1</option>
    <option value="1">Correct Answer: Option 2</option>
    <option value="2">Correct Answer: Option 3</option>
    <option value="3">Correct Answer: Option 4</option>
  </select>

  <button
    class="action-btn saveQuizBtn"
    data-module-id="${module.id}">
    Save Question
  </button>
</div>
  <div
    id="lessonForm-${module.id}"
    style="display:none; margin-top:10px;">

    <input
  type="text"
  id="lessonTitle-${module.id}"
  placeholder="Lesson title">

<select id="videoSource-${module.id}">
  <option value="YOUTUBE">YouTube</option>
  <option value="SELF_HOSTED">Self Hosted</option>
</select>

<input
  type="text"
  id="videoUrl-${module.id}"
  placeholder="Video URL">

<input
  type="file"
  id="videoFile-${module.id}"
  accept="video/*"
  style="display:none;">



<input
  type="number"
  id="orderIndex-${module.id}"
  placeholder="Lesson Order">

<textarea
  id="lessonContent-${module.id}"
  placeholder="Lesson notes/content (optional)">
</textarea>
 <button
  class="action-btn addLessonBtn"
  data-module-id="${module.id}">
  Save Lesson
</button>

</div> <!-- lessonForm -->

</div> <!-- module-card -->
        `;
      });
    }

    modulesSection.innerHTML = html;
    document.querySelectorAll(".viewQuizBtn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const moduleId = btn.dataset.moduleId;

    localStorage.setItem("selectedModuleId", moduleId);

    window.location.href = "tutor-quiz-preview.html";
  });
});
  document.querySelectorAll('select[id^="videoSource-"]').forEach(select => {
  const moduleId = select.id.replace('videoSource-', '');
  const videoUrlInput = document.getElementById(`videoUrl-${moduleId}`);

  const videoFileInput = document.getElementById(`videoFile-${moduleId}`);

  function updateUI() {
  if (select.value === "SELF_HOSTED") {
    videoUrlInput.style.display = "none";
    videoFileInput.style.display = "block";
  } else {
    videoUrlInput.style.display = "block";
    videoFileInput.style.display = "none";
  }
}

  select.addEventListener('change', updateUI);
  updateUI();
});
    attachModuleFormHandlers(courseId);
    document.querySelectorAll(".showQuizFormBtn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const moduleId = btn.dataset.moduleId;
    const form = document.getElementById(`quizForm-${moduleId}`);

    if (form) {
      form.style.display =
        form.style.display === "none" ? "block" : "none";
    }
  });
});

document.querySelectorAll(".saveQuizBtn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const moduleId = btn.dataset.moduleId;

    const question = document
      .getElementById(`quizQuestion-${moduleId}`)
      .value.trim();

    const option1 = document.getElementById(`option1-${moduleId}`).value.trim();
    const option2 = document.getElementById(`option2-${moduleId}`).value.trim();
    const option3 = document.getElementById(`option3-${moduleId}`).value.trim();
    const option4 = document.getElementById(`option4-${moduleId}`).value.trim();

    const correctOptionIndex = Number(
      document.getElementById(`correctOption-${moduleId}`).value
    );

    if (!question || !option1 || !option2 || !option3 || !option4) {
      alert("Please fill the question and all 4 options.");
      return;
    }

    try {
      await apiRequest(`/quiz/modules/${moduleId}/questions`, {
        method: "POST",
        body: {
          text: question,
          options: [option1, option2, option3, option4],
          correctOptionIndex,
        },
      });

      alert("Question created successfully");
      await renderModules(courseId);
    } catch (err) {
      alert(err.message);
    }
  });
});}
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
        const videoSourceInput = document.getElementById(`videoSource-${moduleId}`);
        const videoUrlInput = document.getElementById(`videoUrl-${moduleId}`);
        const videoFileInput = document.getElementById(`videoFile-${moduleId}`);
        const durationInput = document.getElementById(`duration-${moduleId}`);
        const orderIndexInput = document.getElementById(`orderIndex-${moduleId}`);

        const title = titleInput?.value.trim();
        const content = contentInput?.value.trim();

        const videoSource = videoSourceInput?.value;
        let videoUrl = videoUrlInput?.value.trim();

        const duration = Number(durationInput?.value || 0);
        const orderIndex = Number(orderIndexInput?.value || 1);
        if (orderIndex < 1) {
  alert('Order Index must be 1 or greater');
  return;
}

        if (!title) {
          alert('Lesson title is required');
          return;
        }

        try {
          if (videoSource === 'SELF_HOSTED') {
  const file = videoFileInput?.files?.[0];

  if (!file) {
    alert('Please select a video file');
    return;
  }

  const formData = new FormData();
  formData.append('video', file);

  const token = localStorage.getItem('token');

  const response = await fetch(
    `${API_BASE_URL}/upload/video`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const uploadResult = await response.json();

  if (!response.ok) {
    throw new Error(uploadResult.message || 'Video upload failed');
  }

  videoUrl = uploadResult.videoKey;
}
          await apiRequest(`/courses/modules/${moduleId}/lessons`, {
            method: 'POST',
            body: {title,
              content,
              videoSource,
              videoUrl,
              duration,
              orderIndex,
              },
          });
          if (titleInput) titleInput.value = '';
          if (contentInput) contentInput.value = '';
          if (videoUrlInput) videoUrlInput.value = '';
          if (durationInput) durationInput.value = '';
          if (orderIndexInput) orderIndexInput.value = '';
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
