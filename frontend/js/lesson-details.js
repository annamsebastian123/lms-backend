const params = new URLSearchParams(window.location.search);
const lessonId = params.get("id");

const titleEl = document.getElementById("lessonTitle");
const contentEl = document.getElementById("lessonContent");
const completeBtn = document.getElementById("markCompleteBtn");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const completionBadge = document.getElementById("completionBadge");

let currentLesson = null;
let progressTimer = null;

async function saveProgress() {
  const video = document.getElementById("lessonVideo");

  if (!video || !currentLesson) return;
  if (!video.duration || Number.isNaN(video.duration)) return;

  try {
    const progress = await apiRequest(`/progress/${lessonId}`, {
      method: "POST",
      body: JSON.stringify({
        currentPosition: Math.floor(video.currentTime),
        totalDuration: Math.floor(
          video.duration || currentLesson.duration || 0
        ),
      }),
    });

    updateProgressUI(progress);

  } catch (error) {
    console.error("Failed to save progress:", error);
  }
} 

async function loadProgress(video) {
  try {
    const progress = await apiRequest(`/progress/${lessonId}`);

    if (progress) {
  updateProgressUI(progress);

  if (progress.lastPosition > 0) {
    video.currentTime = progress.lastPosition;
  }
}
  } catch (error) {
    console.error("Failed to load progress:", error);
  }
}
function updateProgressUI(progress) {
  if (!progress) return;

  const percentage =
    progress.totalSeconds > 0
      ? Math.round(
          (progress.watchedSeconds / progress.totalSeconds) * 100
        )
      : 0;

  progressBar.style.width = `${percentage}%`;

  progressText.textContent =
    `Progress: ${percentage}%`;

  

  if (progress.isComplete) {
    completionBadge.style.display = "block";
  } else {
    completionBadge.style.display = "none";
  }
}
async function loadLesson() {
  if (!lessonId) {
    titleEl.textContent = "Lesson not found";
    contentEl.innerHTML = "<p>Invalid lesson ID.</p>";
    return;
  }

  try {
    const lesson = await apiRequest(`/courses/lessons/${lessonId}`);
    currentLesson = lesson;

    titleEl.textContent = lesson.title || "Untitled Lesson";

    let videoHtml = "";

    if (lesson.videoSource === "YOUTUBE" && lesson.videoUrl) {
      let embedUrl = lesson.videoUrl;

      if (embedUrl.includes("watch?v=")) {
        embedUrl = embedUrl.replace("watch?v=", "embed/");
      }

      videoHtml = `
        <iframe
          width="100%"
          height="450"
          src="${embedUrl}"
          frameborder="0"
          allowfullscreen>
        </iframe>
        <p style="margin-top:10px;color:#666;">
          YouTube progress tracking will be added separately.
        </p>
      `;
    }

    if (lesson.videoSource === "SELF_HOSTED" && lesson.videoUrl) {
      videoHtml = `
        <video id="lessonVideo" width="100%" controls>
          <source src="${lesson.videoUrl}" type="video/mp4">
          Your browser does not support video playback.
        </video>
      `;
    }

    contentEl.innerHTML = `
      <div class="lesson-body">
        ${videoHtml}

        <div style="margin-top:20px;">
          <p>${lesson.content || "No lesson content available."}</p>
        </div>
      </div>
    `;

    const video = document.getElementById("lessonVideo");

    if (video) {
      video.addEventListener("canplay", async () => {
  const progress = await apiRequest(`/progress/${lessonId}`);

  console.log("Progress response:", progress);

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
  } catch (error) {
    console.error("Failed to load lesson:", error);

    titleEl.textContent = "Lesson not found";
    contentEl.innerHTML = "<p>Unable to load lesson content.</p>";
  }
}

if (completeBtn) {
  completeBtn.addEventListener("click", async () => {
    await saveProgress();
    alert("Progress saved.");
  });
}

window.addEventListener("beforeunload", () => {
  saveProgress();
});

loadLesson();