let allCourses = [];

document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("adminCoursesTableBody");
    const searchInput = document.getElementById("adminCourseSearch");

    if (!tableBody) return;

    function renderCourses(coursesList) {
        if (!coursesList || coursesList.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">No courses found.</td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = "";

        coursesList.forEach((course) => {
            let approveButton = "";

if (course.status === "PENDING_REVIEW") {
    approveButton = `
        <button
            class="action-btn"
            onclick="approveCourse(${course.id})">
            Approve
        </button>
    `;
}
            tableBody.innerHTML += `
                <tr>
                    <td>${course.title || "Untitled Course"}</td>
                    <td>${course.description || "No description"}</td>
                    <td>${course.user?.name || course.user?.email || "N/A"}</td>
<td>${course.status || "DRAFT"}</td>
<td>${(course.targetRole || "ALL").replaceAll("_", " ")}</td>
<td>
    <div class="action-buttons">

    <button
      class="action-btn"
      onclick="window.location.href='course-details?id=${course.id}'">
      View
    </button>

    ${approveButton}

    <button
      class="action-btn delete-btn"
      onclick="deleteCourse(${course.id})">
      Delete
    </button>

</div>
</td>
                </tr>
            `;
        });
    }

    try {
        const courses = await apiRequest("/courses/admin/all");
        allCourses = Array.isArray(courses) ? courses : [];

        renderCourses(allCourses);

        if (searchInput) {
            searchInput.addEventListener("input", () => {
                const keyword = searchInput.value.toLowerCase();

                const filteredCourses = allCourses.filter((course) => {
                    const title = course.title?.toLowerCase() || "";
                    const tutor =
                        course.user?.name?.toLowerCase() ||
                        course.user?.email?.toLowerCase() ||
                        "";

                    return title.includes(keyword) || tutor.includes(keyword);
                });

                renderCourses(filteredCourses);
            });
        }

    } catch (error) {
        console.error("Failed to load admin courses", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">Unable to load courses.</td>
            </tr>
        `;
    }
});

async function deleteCourse(courseId) {
    const confirmDelete = confirm("Are you sure you want to delete this course?");

    if (!confirmDelete) return;

    try {
        await apiRequest(`/courses/${courseId}`, {
            method: "DELETE"
        });

        alert("Course deleted successfully");
        window.location.reload();
    } catch (error) {
        alert(error.message || "Failed to delete course");
        console.error(error);
    }
}

async function approveCourse(courseId) {
    try {
        await apiRequest(`/courses/${courseId}/publish`, {
            method: "POST"
        });

        alert("Course approved successfully");
        window.location.reload();
    } catch (error) {
        alert(error.message || "Failed to approve course");
    }
}


