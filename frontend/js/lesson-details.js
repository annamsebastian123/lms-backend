const params = new URLSearchParams(window.location.search);
const lessonId = params.get("id");

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


titleEl.textContent = lesson.title || "Untitled Lesson";

contentEl.innerHTML = `
  <div class="lesson-body">
    <p>${lesson.content || "No lesson content available."}</p>
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
