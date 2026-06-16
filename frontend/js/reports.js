document.addEventListener("DOMContentLoaded", async () => {
    const totalLearnersValue = document.getElementById("totalLearnersValue");
    const courseCompletionsValue = document.getElementById("courseCompletionsValue");
    const certificatesIssuedValue = document.getElementById("certificatesIssuedValue");

    const summaryUsers = document.getElementById("summaryUsers");
    const summaryCourses = document.getElementById("summaryCourses");
    const summaryEnrollments = document.getElementById("summaryEnrollments");
    const summaryCertificates = document.getElementById("summaryCertificates");

    try {
        const users = await apiRequest("/users");
        const stats = await apiRequest("/users/admin-dashboard-stats");

        const usersList = Array.isArray(users) ? users : [];
        const learners = usersList.filter(user => user.role === "LEARNER");

        totalLearnersValue.textContent = learners.length;
        courseCompletionsValue.textContent = stats.certificatesIssued || 0;
        certificatesIssuedValue.textContent = stats.certificatesIssued || 0;

        summaryUsers.textContent = stats.totalUsers || 0;
        summaryCourses.textContent = stats.activeCourses || 0;
        summaryEnrollments.textContent = stats.totalEnrollments || 0;
        summaryCertificates.textContent = stats.certificatesIssued || 0;

    } catch (error) {
        console.error("Failed to load reports", error);
    }
});