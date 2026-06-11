const API_URL = "http://localhost:5000/api/courses";

const params = new URLSearchParams(window.location.search);
let courseId = params.get("id");

if (!courseId) {
    courseId = localStorage.getItem("selectedCourseId");
}

console.log("COURSE ID:", courseId);

const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const saveBtn = document.getElementById("saveBtn");
const modulesContainer = document.getElementById("modulesContainer");

async function loadCourse() {
    const response = await fetch(`${API_URL}/${courseId}`);
    const course = await response.json();

    titleInput.value = course.title || "";
    descriptionInput.value = course.description || "";
}

async function updateCourse() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/${courseId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            title: titleInput.value,
            description: descriptionInput.value
        })
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.message || data.error || "Update failed");
        return;
    }

    alert("Course updated successfully");
    await loadCourse();
}

async function loadModules() {
    const token = localStorage.getItem("token");
    console.log("TOKEN:", token);



    const response = await fetch(`${API_URL}/${courseId}/modules`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const modules = await response.json();

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
}

async function loadLessons(moduleId) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/modules/${moduleId}/lessons`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const lessons = await response.json();
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
}

/* These buttons are ready, but backend routes still need to be added */
async function editModule(moduleId, oldTitle) {
    const token = localStorage.getItem("token");
    const newTitle = prompt("Edit module title:", oldTitle);

    if (!newTitle || newTitle.trim() === "") {
        return;
    }

    const response = await fetch(`${API_URL}/modules/${moduleId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            title: newTitle.trim()
        })
    });

    if (!response.ok) {
        alert("Failed to update module");
        return;
    }

    alert("Module updated successfully");
    loadModules();
}

async function deleteModule(moduleId) {
    const token = localStorage.getItem("token");

    if (!confirm("Are you sure you want to delete this module and its lessons?")) {
        return;
    }

    const response = await fetch(`${API_URL}/modules/${moduleId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        alert("Failed to delete module");
        return;
    }

    alert("Module deleted successfully");
    loadModules();
}

async function editLesson(lessonId, oldTitle, oldContent) {
    const token = localStorage.getItem("token");

    const newTitle = prompt("Edit lesson title:", oldTitle);
    if (!newTitle || newTitle.trim() === "") {
        return;
    }

    const newContent = prompt("Edit lesson content:", oldContent || "");

    const response = await fetch(`${API_URL}/lessons/${lessonId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            title: newTitle.trim(),
            content: newContent || ""
        })
    });

    if (!response.ok) {
        alert("Failed to update lesson");
        return;
    }

    alert("Lesson updated successfully");
    loadModules();
}

async function deleteLesson(lessonId) {
    const token = localStorage.getItem("token");

    if (!confirm("Are you sure you want to delete this lesson?")) {
        return;
    }

    const response = await fetch(`${API_URL}/lessons/${lessonId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        alert("Failed to delete lesson");
        return;
    }

    alert("Lesson deleted successfully");
    loadModules();
}
saveBtn.addEventListener("click", updateCourse);

loadCourse();
loadModules();