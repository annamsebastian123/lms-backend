const params = new URLSearchParams(window.location.search);
const lessonId = params.get("id");

const titleEl = document.getElementById("lessonTitle");
const videoPane = document.getElementById("lessonVideoPane");
const notesText = document.getElementById("lessonNotesText");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const completionBadge = document.getElementById("completionBadge");
const takeQuizBtn = document.getElementById("takeQuizBtn");
const nextLessonBtn = document.getElementById("nextLessonBtn");
const enrollPromptBtn = document.getElementById("enrollPromptBtn");
const markCompleteBtn = document.getElementById("markCompleteBtn");
const generateCertBtn = document.getElementById("generateCertBtn");
const quizStatusText = document.getElementById("quizStatusText");

let currentLesson = null;
let progressTimer = null;
let isQuizAvailable = false;

const user = JSON.parse(localStorage.getItem("user") || "{}");
const role = user?.role?.toUpperCase();
const isLearner = role === "LEARNER";

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
    console.error("Failed to check course enrollment", err);
    return false;
  }
}

async function isFirstLesson(courseId, lessonId) {
  try {
    const modules = await apiRequest(`/courses/${courseId}/modules`);
    if (!Array.isArray(modules) || modules.length === 0) return false;
    
    // Sort modules by ID (natural order of creation)
    modules.sort((a, b) => a.id - b.id);
    const firstModule = modules[0];
    
    const lessons = await apiRequest(`/courses/modules/${firstModule.id}/lessons`);
    if (!Array.isArray(lessons) || lessons.length === 0) return false;
    
    // Sort lessons by orderIndex
    lessons.sort((a, b) => a.orderIndex - b.orderIndex);
    
    return Number(lessons[0].id) === Number(lessonId);
  } catch (error) {
    console.error("Error checking first lesson", error);
    return false;
  }
}

async function enrollUser(courseId) {
  try {
    await apiRequest(`/courses/${courseId}/enroll`, {
      method: "POST"
    });
    alert("Enrolled in the course successfully!");
    window.location.reload();
  } catch (error) {
    alert(error.message || "Failed to enroll in the course.");
  }
}

function showTrialFinishedPrompt(courseId) {
  if (document.getElementById("trialFinishedOverlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "trialFinishedOverlay";
  overlay.style = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(15, 23, 42, 0.9);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    z-index: 100;
    border-radius: 14px;
    padding: 20px;
    text-align: center;
    box-sizing: border-box;
  `;

  overlay.innerHTML = `
    <span style="font-size: 40px; margin-bottom: 12px;">🌟</span>
    <h3 style="margin: 0 0 8px 0; font-size: 20px; color: white;">Preview Limit Reached</h3>
    <p style="color: #cbd5e1; font-size: 14px; max-width: 320px; margin: 0 0 20px 0;">
      You have watched the 15-second free preview of this course. Enroll now to watch the full lesson and access quizzes!
    </p>
    <button id="trialEnrollBtn" class="action-btn" style="background: #10b981; color: white; padding: 12px 28px; font-weight: 600; border-radius: 8px; border:none; cursor:pointer;">
      Enroll Now
    </button>
  `;

  if (videoPane) {
    videoPane.style.position = "relative";
    videoPane.appendChild(overlay);
  }

  const trialEnrollBtn = document.getElementById("trialEnrollBtn");
  if (trialEnrollBtn) {
    trialEnrollBtn.addEventListener("click", () => enrollUser(courseId));
  }
}

async function saveProgress() {
  const video = document.getElementById("lessonVideo");

  if (!video || !currentLesson) return;
  if (!video.duration || Number.isNaN(video.duration)) return;

  try {
    const progress = await apiRequest(`/progress/${lessonId}`, {
      method: "POST",
      body: {
        currentPosition: Math.floor(video.currentTime),
        totalDuration: Math.floor(
          video.duration || currentLesson.duration || 0
        ),
      },
    });

    updateProgressUI(progress);

  } catch (error) {
    console.error("Failed to save progress:", error);
  }
}

function updateProgressUI(progress) {
  if (!isLearner) return;

  if (!progress) return;

  const percentage =
    progress.totalSeconds > 0
      ? Math.round(
          (progress.watchedSeconds / progress.totalSeconds) * 100
        )
      : 0;

  if (progressBar) progressBar.style.width = `${percentage}%`;
  if (progressText) progressText.textContent = `Progress: ${percentage}%`;

  if (completionBadge) {
    if (progress.isComplete) {
      completionBadge.style.display = "block";
    } else {
      completionBadge.style.display = "none";
    }
  }

  if (markCompleteBtn) {
    if (progress.isComplete) {
      markCompleteBtn.style.display = "block";
      markCompleteBtn.textContent = "✓ Completed";
      markCompleteBtn.disabled = true;
      markCompleteBtn.style.background = "#e2e8f0";
      markCompleteBtn.style.color = "#94a3b8";
      markCompleteBtn.style.cursor = "default";
    } else {
      markCompleteBtn.style.display = "block";
      markCompleteBtn.textContent = "Mark as Complete";
      markCompleteBtn.disabled = false;
      markCompleteBtn.style.background = "#10b981";
      markCompleteBtn.style.color = "white";
      markCompleteBtn.style.cursor = "pointer";
    }
  }
}

async function configureQuizAndNavigation(courseId, lessonId, currentModuleId, quizAvailable) {
  try {
    const modules = await apiRequest(`/courses/${courseId}/modules`);
    if (!Array.isArray(modules) || modules.length === 0) return;

    modules.sort((a, b) => a.id - b.id);

    const modulesWithLessons = await Promise.all(
      modules.map(async (mod) => {
        let lessonsList = [];
        try {
          lessonsList = await apiRequest(`/courses/modules/${mod.id}/lessons`);
          if (Array.isArray(lessonsList)) {
            lessonsList.sort((a, b) => a.orderIndex - b.orderIndex);
          }
        } catch (e) {
          console.error("Failed to load lessons for module:", mod.id, e);
        }
        return {
          ...mod,
          lessons: lessonsList
        };
      })
    );

    const flatLessons = modulesWithLessons.flatMap(m => m.lessons || []);
    const currentIndex = flatLessons.findIndex(l => Number(l.id) === Number(lessonId));

    if (nextLessonBtn) {
      if (currentIndex !== -1 && currentIndex < flatLessons.length - 1) {
        nextLessonBtn.style.display = "inline-block";
        nextLessonBtn.onclick = (e) => {
          e.preventDefault();
          window.location.href = `lesson-details.html?id=${flatLessons[currentIndex + 1].id}`;
        };
      } else {
        nextLessonBtn.style.display = "none";
      }
    }

    const currentModule = modulesWithLessons.find(m => Number(m.id) === Number(currentModuleId));
    if (currentModule && Array.isArray(currentModule.lessons) && currentModule.lessons.length > 0) {
      const lastLessonInModule = currentModule.lessons[currentModule.lessons.length - 1];
      const isLastOfModule = Number(lastLessonInModule.id) === Number(lessonId);

      if (isLastOfModule && quizAvailable) {
        if (takeQuizBtn) takeQuizBtn.style.display = "inline-block";
        if (quizStatusText) quizStatusText.style.display = "none";
        if (generateCertBtn) generateCertBtn.style.display = "none";
      } else {
        if (takeQuizBtn) takeQuizBtn.style.display = "none";
        const isLastModuleInCourse = Number(modules[modules.length - 1].id) === Number(currentModuleId);
        if (isLastOfModule && isLastModuleInCourse && !quizAvailable) {
          if (quizStatusText) quizStatusText.style.display = "block";
          if (generateCertBtn) generateCertBtn.style.display = "inline-block";
        } else {
          if (quizStatusText) quizStatusText.style.display = "none";
          if (generateCertBtn) generateCertBtn.style.display = "none";
        }
      }
    }

  } catch (err) {
    console.error("Failed to configure navigation and quiz buttons", err);
  }
}

async function loadLesson() {
  if (!lessonId) {
    titleEl.textContent = "Lesson not found";
    if (notesText) notesText.innerHTML = "<p>Invalid lesson ID.</p>";
    return;
  }

  try {
    const lesson = await apiRequest(`/courses/lessons/${lessonId}`);
    console.log("LESSON OBJECT:", lesson);

    currentLesson = lesson;

    const courseId = lesson.module ? lesson.module.courseId : null;

    // Dynamically configure Back to Course button
    const backBtn = document.getElementById("backToCourseBtn");
    if (backBtn && courseId) {
      const fallback = (!isLearner && (role === "TUTOR" || role === "ADMIN"))
        ? `tutor-course-details.html?id=${courseId}`
        : `course-details.html?id=${courseId}`;
      
      backBtn.onclick = (e) => {
        e.preventDefault();
        window.location.href = fallback;
      };
    }

    titleEl.textContent = lesson.title || "Untitled Lesson";

    let isEnrolled = true;
    let isFirst = false;

    if (isLearner && courseId) {
      isEnrolled = await isCourseEnrolled(courseId);
      if (!isEnrolled) {
        isFirst = await isFirstLesson(courseId, lessonId);
      }
    }

    // UI visibility logic
    const progressSection = document.getElementById("progressSection");
    if (!isLearner || !isEnrolled) {
      if (progressSection) progressSection.style.display = "none";
      if (completionBadge) completionBadge.style.display = "none";
      if (takeQuizBtn) takeQuizBtn.style.display = "none";
      if (markCompleteBtn) markCompleteBtn.style.display = "none";
      if (quizStatusText) quizStatusText.style.display = "none";
      if (generateCertBtn) generateCertBtn.style.display = "none";
      if (nextLessonBtn) nextLessonBtn.style.display = "none";
    } else {
      if (progressSection) progressSection.style.display = "block";
      
      let quizAvailable = false;
      if (currentLesson?.moduleId) {
        try {
          const questions = await apiRequest(`/quiz/modules/${currentLesson.moduleId}/questions`);
          quizAvailable = Array.isArray(questions) && questions.length > 0;
        } catch (err) {
          console.error("Failed to check quiz availability", err);
        }
      }
      isQuizAvailable = quizAvailable;

      if (courseId) {
        await configureQuizAndNavigation(courseId, lessonId, currentLesson.moduleId, quizAvailable);
      }

      if (progressBar) progressBar.parentElement.style.display = "block";
      if (progressText) progressText.style.display = "block";
      
      if (markCompleteBtn) {
        markCompleteBtn.style.display = "block";
      }

      // Fetch progress on load and update UI
      try {
        const progress = await apiRequest(`/progress/${lessonId}`);
        updateProgressUI(progress);
      } catch (err) {
        console.error("Failed to load initial progress", err);
      }
    }

    // Access lock
    if (isLearner && !isEnrolled && !isFirst) {
      if (notesText) {
        notesText.innerHTML = `
          <p style="color: #94a3b8; font-style: italic; text-align: center; margin-top: 20px;">
            Please enroll in this course to view the lesson notes.
          </p>
        `;
      }

      if (videoPane) {
        videoPane.innerHTML = `
          <div class="card" style="height: 350px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 14px; padding: 30px; text-align: center; box-sizing: border-box;">
            <span style="font-size: 48px; margin-bottom: 15px;">🔒</span>
            <h3 style="margin-top: 0; color: #1e293b;">Lesson Locked</h3>
            <p style="color: #64748b; font-size: 14px; max-width: 320px; margin-bottom: 20px;">
              This lesson is locked. Please enroll in the course to unlock the full course material.
            </p>
            <button id="lockScreenEnrollBtn" class="action-btn" style="background: #10b981; color: white; padding: 12px 28px; font-weight: 600; border-radius: 8px; border:none; cursor:pointer;">
              Enroll Now
            </button>
          </div>
        `;
        const lockEnrollBtn = document.getElementById("lockScreenEnrollBtn");
        if (lockEnrollBtn && courseId) {
          lockEnrollBtn.addEventListener("click", () => enrollUser(courseId));
        }
      }

      if (enrollPromptBtn && courseId) {
        enrollPromptBtn.style.display = "inline-block";
        enrollPromptBtn.addEventListener("click", () => enrollUser(courseId));
      }
      return;
    }

    // Video output preparation
    let videoHtml = "";
    if (lesson.videoSource === "YOUTUBE" && lesson.videoUrl) {
      let embedUrl = lesson.videoUrl;
      if (embedUrl.includes("watch?v=")) {
        embedUrl = embedUrl.replace("watch?v=", "embed/");
      }
      if (embedUrl.includes("youtu.be/")) {
        const videoId = embedUrl.split("youtu.be/")[1].split("?")[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      videoHtml = `
        <iframe
          width="100%"
          height="450"
          src="${embedUrl}"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
          style="border-radius:14px; border:none;">
        </iframe>
      `;
    } else if (lesson.videoSource === "SELF_HOSTED" && lesson.videoUrl) {
      videoHtml = `
        <video id="lessonVideo" width="100%" controls style="border-radius:14px; background:#000;">
          <source src="${lesson.videoUrl}" type="video/mp4">
          Your browser does not support video playback.
        </video>
      `;
    } else {
      videoHtml = `
        <div style="height: 400px; background: #f1f5f9; border-radius: 14px; display: flex; justify-content: center; align-items: center; color: #64748b;">
          No video preview available for this lesson.
        </div>
      `;
    }

    if (videoPane) videoPane.innerHTML = videoHtml;
    if (notesText) notesText.innerHTML = lesson.content || "No lesson content available.";

    // Lock trigger for preview constraints
    if (isLearner && !isEnrolled) {
      if (isFirst) {
        if (enrollPromptBtn && courseId) {
          enrollPromptBtn.style.display = "inline-block";
          enrollPromptBtn.addEventListener("click", () => enrollUser(courseId));
        }

        const video = document.getElementById("lessonVideo");
        if (video) {
          video.addEventListener("timeupdate", () => {
            if (video.currentTime >= 15) {
              video.pause();
              video.currentTime = 15;
              showTrialFinishedPrompt(courseId);
            }
          });
        }
        return;
      } else {
        // Non-first lesson locked completely
        titleEl.textContent = "Preview Locked";
        if (notesText) notesText.innerHTML = "<p>This lesson is locked. Please enroll in the course to access the content.</p>";
        if (videoPane) {
          videoPane.innerHTML = `
            <div style="background: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 12px; padding: 40px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 240px; box-sizing: border-box; width: 100%;">
              <span style="font-size: 40px; margin-bottom: 15px;">🔒</span>
              <h3 style="margin-top: 0; color: #1e293b;">Lesson Locked</h3>
              <p style="color: #64748b; font-size: 14px; max-width: 320px; margin-bottom: 20px;">You must enroll in this course to watch this lesson and complete the course.</p>
            </div>
          `;
        }
        if (enrollPromptBtn && courseId) {
          enrollPromptBtn.style.display = "inline-block";
          enrollPromptBtn.addEventListener("click", () => enrollUser(courseId));
        }
        return;
      }
    }

    // Normal progress recording
    if (isLearner && isEnrolled) {
      const video = document.getElementById("lessonVideo");
      if (video) {
        video.addEventListener("canplay", async () => {
          const progress = await apiRequest(`/progress/${lessonId}`);
          if (progress && progress.lastPosition > 0) {
            video.currentTime = progress.lastPosition;
          }
        }, { once: true });

        video.addEventListener("play", () => {
          if (progressTimer) clearInterval(progressTimer);
          progressTimer = setInterval(() => {
            saveProgress();
          }, 30000);
        });

        video.addEventListener("pause", saveProgress);
        video.addEventListener("ended", saveProgress);
      }
    }

  } catch (error) {
    console.error("Failed to load lesson:", error);
    titleEl.textContent = "Lesson not found";
    if (notesText) notesText.innerHTML = "<p>Unable to load lesson content.</p>";
  }
}

window.addEventListener("beforeunload", () => {
  if (isLearner && currentLesson) {
    saveProgress();
  }
});

if (takeQuizBtn) {
  takeQuizBtn.addEventListener("click", () => {
    window.location.href = `quiz.html?moduleId=${currentLesson.moduleId}`;
  });
}

if (generateCertBtn) {
  generateCertBtn.addEventListener("click", async () => {
    const courseId = currentLesson?.module?.courseId;
    if (!courseId) {
      showAlert("Course ID not found.", "Error");
      return;
    }
    try {
      const res = await apiRequest(`/certificates/generate/${courseId}`, {
        method: "POST"
      });
      await showAlert("Certificate generated successfully!");
      window.location.href = "certificates.html";
    } catch (err) {
      showAlert(err.message || "Failed to generate certificate.", "Error");
    }
  });
}

if (markCompleteBtn) {
  markCompleteBtn.addEventListener("click", async () => {
    try {
      const progress = await apiRequest(`/progress/${lessonId}`, {
        method: "POST",
        body: {
          currentPosition: 100,
          totalDuration: 100,
        },
      });

      await showAlert("Lesson marked as completed successfully!");
      updateProgressUI(progress);
    } catch (error) {
      console.error("Failed to mark lesson complete:", error);
      showAlert(error.message || "Failed to save progress.", "Error");
    }
  });
}

loadLesson();