

const totalCoursesValue = document.getElementById("totalCoursesValue");
const publishedCoursesValue = document.getElementById("publishedCoursesValue");
const draftCoursesValue = document.getElementById("draftCoursesValue");
const totalEnrollmentsValue = document.getElementById("totalEnrollmentsValue");
const recentCoursesBody = document.getElementById("recentCoursesBody");

async function loadTutorDashboard() {
    try {
const stats = await apiRequest("/courses/tutor-stats");
const courses = await apiRequest("/courses/tutor-courses");

        console.log("Tutor stats:", stats);
        console.log("Tutor courses:", courses);

        totalCoursesValue.textContent = stats.totalCourses;
        publishedCoursesValue.textContent = stats.totalPublished;
        draftCoursesValue.textContent = stats.totalDrafts;
        totalEnrollmentsValue.textContent = stats.totalEnrollments;

        recentCoursesBody.innerHTML = "";

        if (!courses.length) {
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
                    <td>${course.enrollments?.length || 0}</td>
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
            <td colspan="4">
                Failed to load courses. Please refresh after a few seconds.
            </td>
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