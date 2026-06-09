document.addEventListener("DOMContentLoaded", async () => {
    const totalLearnersValue = document.getElementById("totalLearnersValue");
    const courseCompletionsValue = document.getElementById("courseCompletionsValue");
    const certificatesIssuedValue = document.getElementById("certificatesIssuedValue");

    try {
        const users = await apiRequest("/users");
        const usersList = Array.isArray(users) ? users : [];

        const learners = usersList.filter((user) => user.role === "LEARNER");

        if (totalLearnersValue) {
            totalLearnersValue.textContent = learners.length;
        }

        if (courseCompletionsValue) {
            courseCompletionsValue.textContent = "—";
        }

        if (certificatesIssuedValue) {
            certificatesIssuedValue.textContent = "—";
        }

    } catch (error) {
        console.error("Failed to load reports data", error);
    }
});