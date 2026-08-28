document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const moduleId = params.get("id");
  const courseId = params.get("courseId");

  if (!moduleId || !courseId) {
    showAlert("Invalid Module or Course ID.", "Error").then(() => {
      window.location.href = "my-courses.html";
    });
    return;
  }

  // Navigation Back Button
  const backToCourseBtn = document.getElementById("backToCourseBtn");
  backToCourseBtn.href = `tutor-course-details.html?id=${courseId}`;

  // DOM Elements
  const moduleTitleInput = document.getElementById("moduleTitleInput");
  const saveModuleTitleBtn = document.getElementById("saveModuleTitleBtn");
  const courseContextLabel = document.getElementById("courseContextLabel");
  
  // Lesson Fields
  const newLessonTitle = document.getElementById("newLessonTitle");
  const newLessonDuration = document.getElementById("newLessonDuration");
  const newLessonVideoSource = document.getElementById("newLessonVideoSource");
  const newLessonVideoUrl = document.getElementById("newLessonVideoUrl");
  const newLessonFile = document.getElementById("newLessonFile");
  const newLessonContent = document.getElementById("newLessonContent");
  const saveLessonBtn = document.getElementById("saveLessonBtn");
  const youtubeUrlGroup = document.getElementById("youtubeUrlGroup");
  const selfHostedGroup = document.getElementById("selfHostedGroup");
  const lessonsListContainer = document.getElementById("lessonsListContainer");
  const addLessonPanel = document.getElementById("addLessonPanel");

  // Quiz Fields
  const newQuestionText = document.getElementById("newQuestionText");
  const newOption1 = document.getElementById("newOption1");
  const newOption2 = document.getElementById("newOption2");
  const newOption3 = document.getElementById("newOption3");
  const newOption4 = document.getElementById("newOption4");
  const newQuestionCorrect = document.getElementById("newQuestionCorrect");
  const saveQuestionBtn = document.getElementById("saveQuestionBtn");
  const questionsListContainer = document.getElementById("questionsListContainer");
  const addQuestionPanel = document.getElementById("addQuestionPanel");

  let currentModule = null;
  let currentCourse = null;
  let isLocked = false;

  // Toggle Video Input fields based on Source Selection
  if (newLessonVideoSource) {
    newLessonVideoSource.addEventListener("change", () => {
      if (newLessonVideoSource.value === "YOUTUBE") {
        youtubeUrlGroup.style.display = "block";
        selfHostedGroup.style.display = "none";
      } else {
        youtubeUrlGroup.style.display = "none";
        selfHostedGroup.style.display = "block";
      }
    });
  }

  // Helper to Upload Video File to MinIO
  async function uploadVideoIfSelected() {
    const file = newLessonFile?.files?.[0];
    if (!file) return null;

    const formData = new FormData();
    formData.append("video", file);

    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/upload/video`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Video upload failed");
    }
    return result.videoKey;
  }

  // Fetch Module Details, Lessons and Quizzes
  async function fetchModuleWorkspace() {
    try {
      const moduleData = await apiRequest(`/courses/modules/${moduleId}`);
      currentModule = moduleData;
      currentCourse = moduleData.course;

      // Update Header Details
      moduleTitleInput.value = moduleData.title || "";
      courseContextLabel.textContent = `Course: ${moduleData.course?.title || "Untitled"} • Status: ${moduleData.course?.status}`;

      // Check Permissions Lock
      isLocked = moduleData.course?.status === "PUBLISHED" && !moduleData.course?.isContinuing;
      
      if (isLocked) {
        moduleTitleInput.disabled = true;
        saveModuleTitleBtn.style.display = "none";
        if (addLessonPanel) addLessonPanel.style.display = "none";
        if (addQuestionPanel) addQuestionPanel.style.display = "none";
      }

      // Render Lessons
      renderLessons(moduleData.lessons || []);

      // Render Quizzes
      await fetchAndRenderQuizzes();

    } catch (err) {
      console.error(err);
      showAlert("Failed to load module details.", "Error").then(() => {
        window.location.href = `tutor-course-details.html?id=${courseId}`;
      });
    }
  }

  // Render Lessons List
  function renderLessons(lessons) {
    lessonsListContainer.innerHTML = "";
    if (lessons.length === 0) {
      lessonsListContainer.innerHTML = `<p style="color: #64748b; font-size: 14px; font-style: italic;">No lessons created in this module.</p>`;
      return;
    }

    lessons.forEach(lesson => {
      const card = document.createElement("div");
      card.className = "lesson-card";
      card.style.cssText = "background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);";

      const header = document.createElement("div");
      header.style.cssText = "display: flex; justify-content: space-between; align-items: flex-start;";

      const info = document.createElement("div");
      const title = document.createElement("h4");
      title.style.cssText = "font-size: 15px; font-weight: 600; color: #1e293b; margin: 0;";
      title.textContent = lesson.title;
      info.appendChild(title);

      const sub = document.createElement("span");
      sub.style.cssText = "font-size: 12px; color: #64748b;";
      sub.textContent = `${lesson.duration} mins • ${lesson.videoSource}`;
      info.appendChild(sub);

      header.appendChild(info);

      if (!isLocked) {
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.style.cssText = "padding: 6px 12px; font-size: 12px; margin: 0; background: #fee2e2; color: #ef4444; border: 1px solid #fecaca; border-radius: 6px; cursor: pointer; transition: all 0.2s;";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", async () => {
          const confirmed = await showConfirm(`Are you sure you want to delete the lesson "${lesson.title}"?`);
          if (confirmed) {
            try {
              await apiRequest(`/courses/lessons/${lesson.id}`, { method: "DELETE" });
              showToast("Lesson deleted successfully!");
              fetchModuleWorkspace();
            } catch (err) {
              showAlert(err.message || "Failed to delete lesson.", "Error");
            }
          }
        });
        header.appendChild(deleteBtn);
      }

      card.appendChild(header);

      if (lesson.videoUrl) {
        const link = document.createElement("a");
        link.href = `lesson-details.html?id=${lesson.id}`;
        link.target = "_blank";
        link.style.cssText = "font-size: 13px; color: #4f46e5; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;";
        link.textContent = `📺 Preview Lesson (Learner View)`;
        card.appendChild(link);
      }

      if (lesson.content) {
        const notes = document.createElement("p");
        notes.style.cssText = "font-size: 13px; color: #475569; margin: 5px 0 0 0; line-height: 1.4; background: #f8fafc; padding: 10px; border-radius: 6px; max-height: 100px; overflow-y: auto;";
        notes.textContent = lesson.content;
        card.appendChild(notes);
      }

      lessonsListContainer.appendChild(card);
    });
  }

  // Fetch and Render Quizzes
  async function fetchAndRenderQuizzes() {
    try {
      const questions = await apiRequest(`/quiz/modules/${moduleId}/questions`);
      questionsListContainer.innerHTML = "";

      if (questions.length === 0) {
        questionsListContainer.innerHTML = `<p style="color: #64748b; font-size: 14px; font-style: italic;">No quiz questions added to this module.</p>`;
        return;
      }

      questions.forEach((q, idx) => {
        const card = document.createElement("div");
        card.style.cssText = "background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);";

        const header = document.createElement("div");
        header.style.cssText = "display: flex; justify-content: space-between; align-items: flex-start;";

        const title = document.createElement("h4");
        title.style.cssText = "font-size: 14px; font-weight: 600; color: #1e293b; margin: 0; flex: 1; padding-right: 15px;";
        title.textContent = `${idx + 1}. ${q.text}`;
        header.appendChild(title);

        if (!isLocked) {
          const deleteBtn = document.createElement("button");
          deleteBtn.style.cssText = "padding: 4px 8px; font-size: 12px; background: #fee2e2; color: #ef4444; border: 1px solid #fecaca; border-radius: 6px; cursor: pointer;";
          deleteBtn.textContent = "Delete";
          deleteBtn.addEventListener("click", async () => {
            const confirmed = await showConfirm("Are you sure you want to delete this quiz question?");
            if (confirmed) {
              try {
                await apiRequest(`/quiz/questions/${q.id}`, { method: "DELETE" });
                showToast("Question deleted successfully!");
                fetchAndRenderQuizzes();
              } catch (err) {
                showAlert(err.message || "Failed to delete quiz question.", "Error");
              }
            }
          });
          header.appendChild(deleteBtn);
        }

        card.appendChild(header);

        // Render Options Grid
        const grid = document.createElement("div");
        grid.style.cssText = "display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 5px;";
        
        q.options.forEach((opt, optIdx) => {
          const isCorrect = opt.id === q.correctOptionId;
          const optDiv = document.createElement("div");
          optDiv.style.cssText = `font-size: 12px; padding: 8px 10px; border-radius: 6px; border: 1px solid ${isCorrect ? '#10b981' : '#e2e8f0'}; background: ${isCorrect ? '#ecfdf5' : '#f8fafc'}; color: ${isCorrect ? '#065f46' : '#475569'}; font-weight: ${isCorrect ? '600' : 'normal'};`;
          optDiv.textContent = `${String.fromCharCode(65 + optIdx)}. ${opt.text}`;
          grid.appendChild(optDiv);
        });

        card.appendChild(grid);
        questionsListContainer.appendChild(card);
      });

    } catch (err) {
      console.error(err);
      questionsListContainer.innerHTML = `<p style="color: #ef4444; font-size: 13px;">Failed to load quiz questions.</p>`;
    }
  }

  // Handle Save Module Title Click
  saveModuleTitleBtn.addEventListener("click", async () => {
    const title = moduleTitleInput.value.trim();
    if (!title) {
      showAlert("Module title cannot be empty.", "Validation Error");
      return;
    }
    try {
      await apiRequest(`/courses/modules/${moduleId}`, {
        method: "PUT",
        body: { title }
      });
      showToast("Module title updated successfully!");
      fetchModuleWorkspace();
    } catch (err) {
      showAlert(err.message || "Failed to update module title.", "Error");
    }
  });

  // Handle Add Lesson Click
  saveLessonBtn.addEventListener("click", async () => {
    const title = newLessonTitle.value.trim();
    const duration = parseInt(newLessonDuration.value);
    const videoSource = newLessonVideoSource.value;
    const content = newLessonContent.value.trim();

    if (!title) {
      showAlert("Please enter a lesson title.", "Validation Error");
      return;
    }

    if (isNaN(duration) || duration <= 0) {
      showAlert("Please enter a valid lesson duration in minutes.", "Validation Error");
      return;
    }

    try {
      saveLessonBtn.disabled = true;
      saveLessonBtn.textContent = "Saving...";

      let videoUrl = "";

      if (videoSource === "YOUTUBE") {
        videoUrl = newLessonVideoUrl.value.trim();
        if (!videoUrl) {
          showAlert("Please enter a YouTube video URL.", "Validation Error");
          saveLessonBtn.disabled = false;
          saveLessonBtn.textContent = "Add Lesson";
          return;
        }
      } else {
        const fileUploaded = await uploadVideoIfSelected();
        if (!fileUploaded) {
          showAlert("Please upload an MP4 video file.", "Validation Error");
          saveLessonBtn.disabled = false;
          saveLessonBtn.textContent = "Add Lesson";
          return;
        }
        videoUrl = fileUploaded;
      }

      await apiRequest(`/courses/modules/${moduleId}/lessons`, {
        method: "POST",
        body: {
          title,
          content,
          duration,
          videoSource,
          videoUrl,
        }
      });

      showToast("Lesson added successfully!");

      // Clear input fields
      newLessonTitle.value = "";
      newLessonDuration.value = "";
      newLessonVideoUrl.value = "";
      newLessonFile.value = "";
      newLessonContent.value = "";

      fetchModuleWorkspace();

    } catch (err) {
      showAlert(err.message || "Failed to create lesson.", "Error");
    } finally {
      saveLessonBtn.disabled = false;
      saveLessonBtn.textContent = "Add Lesson";
    }
  });

  // Handle Add Quiz Question Click
  saveQuestionBtn.addEventListener("click", async () => {
    const text = newQuestionText.value.trim();
    const o1 = newOption1.value.trim();
    const o2 = newOption2.value.trim();
    const o3 = newOption3.value.trim();
    const o4 = newOption4.value.trim();
    const correctOption = parseInt(newQuestionCorrect.value);

    if (!text || !o1 || !o2 || !o3 || !o4) {
      showAlert("Please fill in the question text and all four options.", "Validation Error");
      return;
    }

    try {
      await apiRequest(`/quiz/modules/${moduleId}/questions`, {
        method: "POST",
        body: {
          text,
          options: [o1, o2, o3, o4],
          correctOptionIndex: correctOption - 1,
        }
      });

      showToast("Quiz question added successfully!");

      // Clear input fields
      newQuestionText.value = "";
      newOption1.value = "";
      newOption2.value = "";
      newOption3.value = "";
      newOption4.value = "";

      fetchAndRenderQuizzes();

    } catch (err) {
      showAlert(err.message || "Failed to add quiz question.", "Error");
    }
  });

  // Init
  await fetchModuleWorkspace();
});
