document.addEventListener("DOMContentLoaded", async () => {
    const totalUsersValue = document.getElementById("totalUsersValue");
    const activeCoursesValue = document.getElementById("activeCoursesValue");
    const enrollmentsValue = document.getElementById("enrollmentsValue");
    const certificatesValue = document.getElementById("certificatesValue");

    try {
        const users = await apiRequest("/users");
        const courses = await apiRequest("/courses");

        const usersList = Array.isArray(users) ? users : [];
        const coursesList = Array.isArray(courses) ? courses : [];

        if (totalUsersValue) {
            totalUsersValue.textContent = usersList.length;
        }

        if (activeCoursesValue) {
            activeCoursesValue.textContent = coursesList.length;
        }

        if (enrollmentsValue) {
            enrollmentsValue.textContent = "—";
        }

        if (certificatesValue) {
            certificatesValue.textContent = "—";
        }

    } catch (error) {
        console.error("Failed to load admin dashboard stats", error);
    }
});