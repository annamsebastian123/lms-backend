document.addEventListener("DOMContentLoaded", async () => {
    const dashboardCourses = document.getElementById("dashboardCourses");

    if (!dashboardCourses) return;

    const token = localStorage.getItem("token");

    if (!token) {
        dashboardCourses.innerHTML = `
            <tr>
                <td colspan="3">Please login to view your enrolled courses.</td>
            </tr>
        `;
        return;
    }

    try {
        const data = await apiRequest("/courses/my-courses");
        const enrollments = Array.isArray(data) ? data : [];

        if (enrollments.length === 0) {
            dashboardCourses.innerHTML = `
                <tr>
                    <td colspan="3">You have not enrolled in any courses yet.</td>
                </tr>
            `;
            return;
        }

        const enrolledCoursesValue = document.getElementById("enrolledCoursesValue");
        const completedCoursesValue = document.getElementById("completedCoursesValue");
        const certificatesValue = document.getElementById("certificatesValue");

        const certificates = await apiRequest(
  "/certificates/my-certificates"
);

const enrolledCount = enrollments.length;
const certificatesCount = certificates.length;
const completedCount = certificates.length;

        if (enrolledCoursesValue) {
            enrolledCoursesValue.textContent = enrolledCount;
        }

        if (completedCoursesValue) {
            completedCoursesValue.textContent = completedCount;
        }

        if (certificatesValue) {
            certificatesValue.textContent = certificatesCount;
        }

        dashboardCourses.innerHTML = "";

        enrollments.forEach((item) => {
    const course = item.course;
    if (!course) return;

    const isCompleted = certificates.some(
        cert => cert.courseId === course.id
    );

    dashboardCourses.innerHTML += `
        <tr>
            <td>${course.title}</td>
            <td>${isCompleted ? "Completed" : "In Progress"}</td>
            <td>
                <a
                    href="course-details?id=${course.id}"
                    class="action-btn">
                    Continue
                </a>
            </td>
        </tr>
    `;
});

    } catch (error) {
        console.error("Failed to load dashboard courses", error);

        dashboardCourses.innerHTML = `
            <tr>
                <td colspan="3">Unable to load enrolled courses.</td>
            </tr>
        `;
    }
});