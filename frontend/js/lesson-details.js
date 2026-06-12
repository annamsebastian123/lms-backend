const params = new URLSearchParams(window.location.search);
const lessonId = params.get("id");

console.log("URL:", window.location.href);
console.log("Search:", window.location.search);
console.log("Lesson ID:", lessonId);

const titleEl = document.getElementById("lessonTitle");
const contentEl = document.getElementById("lessonContent");
const completeBtn = document.getElementById("markCompleteBtn");


async function loadLesson() {
if (!lessonId) {
titleEl.textContent = "Lesson not found";
contentEl.innerHTML = "<p>Invalid lesson ID.</p>";
return;
}

try {
const lesson = await apiRequest(`/courses/lessons/${lessonId}`);
  console.log("Lesson response:", lesson);
  console.log("Video URL:", lesson.videoUrl);
  console.log("Video Source:", lesson.videoSource);


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
  `;
}

if (lesson.videoSource === "SELF_HOSTED" && lesson.videoUrl) {
  videoHtml = `
    <video width="100%" controls>
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

} catch (error) {
console.error("Failed to load lesson:", error);


titleEl.textContent = "Lesson not found";
contentEl.innerHTML = `
  <p>Unable to load lesson content.</p>
`;


}
}

if (completeBtn) {
completeBtn.addEventListener("click", () => {
alert("Lesson completed! Progress tracking will be added next.");
});
}

loadLesson();
