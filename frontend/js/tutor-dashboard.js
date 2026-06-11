const COURSES_API_URL = "http://localhost:5000/api/courses";

const totalCoursesValue = document.getElementById("totalCoursesValue");
const publishedCoursesValue = document.getElementById("publishedCoursesValue");
const draftCoursesValue = document.getElementById("draftCoursesValue");
const totalEnrollmentsValue = document.getElementById("totalEnrollmentsValue");
const recentCoursesBody = document.getElementById("recentCoursesBody");

async function loadTutorDashboard() {
    try {
        const response = await fetch(COURSES_API_URL);
        const courses = await response.json();

        if (!response.ok) {
            throw new Error("Failed to load courses");
        }

        totalCoursesValue.textContent = courses.length;

        publishedCoursesValue.textContent =
            courses.filter(course => course.status === "PUBLISHED").length;

        draftCoursesValue.textContent =
            courses.filter(course => course.status === "DRAFT").length;

        totalEnrollmentsValue.textContent = "0";

        recentCoursesBody.innerHTML = "";

        if (courses.length === 0) {
            recentCoursesBody.innerHTML = `
                <tr>
                    <td colspan="4">No courses found.</td>
                </tr>
            `;
            return;
        }

        courses.forEach(course => {
            recentCoursesBody.innerHTML += `
                <tr>
                    <td>${course.title}</td>
                    <td>${course.status}</td>
                    <td>0</td>
                    <td>
                        <button
                            class="action-btn"
                            onclick="openEditCourse(${course.id})">
                            Edit
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error(error);

        recentCoursesBody.innerHTML = `
            <tr>
                <td colspan="4">Failed to load courses.</td>
            </tr>
        `;
    }
}

function openEditCourse(courseId) {
    localStorage.setItem("selectedCourseId", courseId);

    window.location.href =
        `edit-course.html?id=${courseId}`;
}

loadTutorDashboard();