document.addEventListener("DOMContentLoaded", async () => {
    const totalUsersValue = document.getElementById("totalUsersValue");
    const activeCoursesValue = document.getElementById("activeCoursesValue");
    const enrollmentsValue = document.getElementById("enrollmentsValue");
    const certificatesValue = document.getElementById("certificatesValue");

    const table = document.querySelector(".dashboard-section table");

    try {
        const stats = await apiRequest("/users/admin-dashboard-stats");

        totalUsersValue.textContent = stats.totalUsers || 0;
        activeCoursesValue.textContent = stats.activeCourses || 0;
        enrollmentsValue.textContent = stats.totalEnrollments || 0;
        certificatesValue.textContent = stats.certificatesIssued || 0;

        let activitiesHTML = `
            <tr>
                <th>User</th>
                <th>Activity</th>
                <th>Date</th>
            </tr>
        `;

        if (
            !stats.recentActivities ||
            stats.recentActivities.length === 0
        ) {
            activitiesHTML += `
                <tr>
                    <td colspan="3">
                        No recent activities found.
                    </td>
                </tr>
            `;
        } else {
            stats.recentActivities.forEach(activity => {
                activitiesHTML += `
                    <tr>
                        <td>${activity.user}</td>
                        <td>${activity.activity}</td>
                        <td>
                            ${new Date(activity.date).toLocaleDateString()}
                        </td>
                    </tr>
                `;
            });
        }

        table.innerHTML = activitiesHTML;

    } catch (error) {
        console.error(
            "Failed to load admin dashboard stats",
            error
        );
    }
});