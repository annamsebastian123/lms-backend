const analyticsGrid = document.getElementById("analyticsGrid");
const courseAnalyticsTable = document.getElementById("courseAnalyticsTable");

async function loadTutorAnalytics() {
    try {
        const data = await apiRequest("/courses/tutor-stats");

        const completionRate = data.completionRate ?? 0;
        const averageQuizScore = data.averageQuizScore ?? 0;
        const courseAnalytics = data.courseAnalytics || data.courses || [];

        analyticsGrid.innerHTML = `
            <div class="card admin-card">
                <h3>Total Courses</h3>
                <h1>${data.totalCourses ?? 0}</h1>
                <p>Courses created by you</p>
            </div>

            <div class="card admin-card">
                <h3>Total Enrollments</h3>
                <h1>${data.totalEnrollments ?? 0}</h1>
                <p>Learners enrolled in your courses</p>
            </div>

            <div class="card admin-card">
                <h3>Completion Rate</h3>
                <h1>${completionRate}%</h1>
                <p>Based on issued certificates</p>
            </div>

            <div class="card admin-card">
                <h3>Average Quiz Score</h3>
                <h1>${averageQuizScore}%</h1>
                <p>Average score across course quizzes</p>
            </div>
        `;

        if (courseAnalytics.length === 0) {
            courseAnalyticsTable.innerHTML = `
                <tr>
                    <td colspan="6">No course analytics available.</td>
                </tr>
            `;
            return;
        }

        courseAnalyticsTable.innerHTML = courseAnalytics.map(course => `
            <tr>
                <td>${course.title || "Untitled Course"}</td>
                <td>
                    <span class="badge badge-${String(course.status || "draft").toLowerCase()}">
                        ${course.status || "DRAFT"}
                    </span>
                </td>
                <td>${course.enrollments ?? 0}</td>
                <td>${course.completed ?? 0}</td>
                <td>${course.completionRate ?? 0}%</td>
                <td>${course.averageQuizScore ?? 0}%</td>
            </tr>
        `).join("");

    } catch (error) {
        console.error(error);
        analyticsGrid.innerHTML = "<p>Failed to load analytics.</p>";
    }
}

loadTutorAnalytics();