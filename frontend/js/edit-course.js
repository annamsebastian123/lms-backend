const params = new URLSearchParams(window.location.search);
let courseId = params.get("id");

if (!courseId) {
    courseId = localStorage.getItem("selectedCourseId");
}

console.log("COURSE ID:", courseId);

const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const saveBtn = document.getElementById("saveBtn");
const submitReviewBtn = document.getElementById("submitReviewBtn");
const modulesContainer = document.getElementById("modulesContainer");

async function loadCourse() {
    try {
        const course = await apiRequest(`/courses/${courseId}`);
        titleInput.value = course.title || "";
        descriptionInput.value = course.description || "";

        const alertContainer = document.getElementById("feedbackAlert");
        const alertText = document.getElementById("feedbackText");

        if (course.adminComment && alertContainer && alertText) {
            alertText.textContent = course.adminComment;
            alertContainer.style.display = "block";
        } else if (alertContainer) {
            alertContainer.style.display = "none";
        }
    } catch (error) {
        console.error("Failed to load course details", error);
    }
}

async function updateCourse() {
    try {
        await apiRequest(`/courses/${courseId}`, {
            method: "PUT",
            body: {
                title: titleInput.value,
                description: descriptionInput.value
            }
        });
        alert("Course updated successfully");
        await loadCourse();
    } catch (error) {
        alert(error.message || "Update failed");
    }
}

async function loadModules() {
    try {
        const modules = await apiRequest(`/courses/${courseId}/modules`);
        modulesContainer.innerHTML = "";

        if (!Array.isArray(modules) || modules.length === 0) {
            modulesContainer.innerHTML = "<p>No modules found for this course.</p>";
            return;
        }

        modules.forEach(module => {
            modulesContainer.innerHTML += `
                <div class="card" style="margin-top:15px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h3>${module.title}</h3>

                        <div>
                            <button class="action-btn" onclick="editModule(${module.id}, '${module.title.replace(/'/g, "\\'")}')">
                                Edit
                            </button>

                            <button class="delete-btn" onclick="deleteModule(${module.id})">
                                Delete
                            </button>
                        </div>
                    </div>

                    <h4>Lessons</h4>

                    <div id="lessons-${module.id}">
                        <p>Loading lessons...</p>
                    </div>
                </div>
            `;
        });

        modules.forEach(module => {
            loadLessons(module.id);
        });
    } catch (error) {
        console.error("Failed to load modules", error);
    }
}

async function loadLessons(moduleId) {
    try {
        const lessons = await apiRequest(`/courses/modules/${moduleId}/lessons`);
        const lessonDiv = document.getElementById(`lessons-${moduleId}`);

        if (!Array.isArray(lessons) || lessons.length === 0) {
            lessonDiv.innerHTML = "<p>No lessons found in this module.</p>";
            return;
        }

        lessonDiv.innerHTML = "";

        lessons.forEach(lesson => {
            lessonDiv.innerHTML += `
                <div class="card" style="margin-top:10px; padding:15px;">
                    <strong>${lesson.title}</strong>
                    <p>${lesson.content || ""}</p>

                    <button class="action-btn" onclick="editLesson(${lesson.id}, '${lesson.title.replace(/'/g, "\\'")}', '${(lesson.content || "").replace(/'/g, "\\'")}')">
                        Edit
                    </button>

                    <button class="delete-btn" onclick="deleteLesson(${lesson.id})">
                        Delete
                    </button>
                </div>
            `;
        });
    } catch (error) {
        console.error(`Failed to load lessons for module ${moduleId}`, error);
    }
}

async function editModule(moduleId, oldTitle) {
    const newTitle = prompt("Edit module title:", oldTitle);

    if (!newTitle || newTitle.trim() === "") {
        return;
    }

    try {
        await apiRequest(`/courses/modules/${moduleId}`, {
            method: "PUT",
            body: {
                title: newTitle.trim()
            }
        });
        alert("Module updated successfully");
        loadModules();
    } catch (error) {
        alert(error.message || "Failed to update module");
    }
}

async function deleteModule(moduleId) {
    if (!confirm("Are you sure you want to delete this module and its lessons?")) {
        return;
    }

    try {
        await apiRequest(`/courses/modules/${moduleId}`, {
            method: "DELETE"
        });
        alert("Module deleted successfully");
        loadModules();
    } catch (error) {
        alert(error.message || "Failed to delete module");
    }
}

async function editLesson(lessonId, oldTitle, oldContent) {
    const newTitle = prompt("Edit lesson title:", oldTitle);
    if (!newTitle || newTitle.trim() === "") {
        return;
    }

    const newContent = prompt("Edit lesson content:", oldContent || "");

    try {
        await apiRequest(`/courses/lessons/${lessonId}`, {
            method: "PUT",
            body: {
                title: newTitle.trim(),
                content: newContent || ""
            }
        });
        alert("Lesson updated successfully");
        loadModules();
    } catch (error) {
        alert(error.message || "Failed to update lesson");
    }
}

async function deleteLesson(lessonId) {
    if (!confirm("Are you sure you want to delete this lesson?")) {
        return;
    }

    try {
        await apiRequest(`/courses/lessons/${lessonId}`, {
            method: "DELETE"
        });
        alert("Lesson deleted successfully");
        loadModules();
    } catch (error) {
        alert(error.message || "Failed to delete lesson");
    }
}

async function submitCourseForReview() {
    try {
        // First save any changes to title/description
        await apiRequest(`/courses/${courseId}`, {
            method: "PUT",
            body: {
                title: titleInput.value,
                description: descriptionInput.value
            }
        });

        // Now submit for review
        await apiRequest(`/courses/${courseId}/submit-review`, {
            method: "POST"
        });

        alert("Course submitted for admin approval successfully!");
        window.location.href = "my-courses.html";
    } catch (error) {
        alert(error.message || "Failed to submit course for review");
    }
}

saveBtn.addEventListener("click", updateCourse);
if (submitReviewBtn) {
    submitReviewBtn.addEventListener("click", submitCourseForReview);
}

loadCourse();
loadModules();