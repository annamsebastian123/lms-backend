document.addEventListener("DOMContentLoaded", async () => {
    const totalLearnersValue = document.getElementById("totalLearnersValue");
    const courseCompletionsValue = document.getElementById("courseCompletionsValue");
    const certificatesIssuedValue = document.getElementById("certificatesIssuedValue");
    const completionRateValue = document.getElementById("completionRateValue");

    const summaryUsers = document.getElementById("summaryUsers");
    const summaryCourses = document.getElementById("summaryCourses");
    const summaryEnrollments = document.getElementById("summaryEnrollments");
    const summaryCertificates = document.getElementById("summaryCertificates");

    try {
        const users = await apiRequest("/users");
        const stats = await apiRequest("/users/admin-dashboard-stats");

        const usersList = Array.isArray(users) ? users : [];
        const learners = usersList.filter(user => user.role === "LEARNER");

        const totalEnrollments = stats.totalEnrollments || 0;
        const certificatesIssued = stats.certificatesIssued || 0;

        const completionRate =
            totalEnrollments === 0
                ? 0
                : Math.round((certificatesIssued / totalEnrollments) * 100);

        totalLearnersValue.textContent = learners.length;
        courseCompletionsValue.textContent = certificatesIssued;
        certificatesIssuedValue.textContent = certificatesIssued;

        if (completionRateValue) {
            completionRateValue.textContent = `${completionRate}%`;
        }

        summaryUsers.textContent = stats.totalUsers || 0;
        summaryCourses.textContent = stats.activeCourses || 0;
        summaryEnrollments.textContent = totalEnrollments;
        summaryCertificates.textContent = certificatesIssued;

    } catch (error) {
        console.error("Failed to load reports", error);
    }
});