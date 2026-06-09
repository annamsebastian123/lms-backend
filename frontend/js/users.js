document.addEventListener("DOMContentLoaded", async () => {
    const usersTableBody = document.getElementById("usersTableBody");

    if (!usersTableBody) return;

    try {
        const users = await apiRequest("/users");
        const usersList = Array.isArray(users) ? users : [];

        if (usersList.length === 0) {
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="5">No users found.</td>
                </tr>
            `;
            return;
        }

        usersTableBody.innerHTML = "";

        usersList.forEach((user) => {
            usersTableBody.innerHTML += `
                <tr>
                    <td>${user.name || "N/A"}</td>
                    <td>${user.email || "N/A"}</td>
                    <td>${user.role || "N/A"}</td>
                    <td>
                        <span class="status status-active">
                            Active
                        </span>
                    </td>
                    <td>
                        <button class="action-btn">
                            View
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Failed to load users", error);

        usersTableBody.innerHTML = `
            <tr>
                <td colspan="5">Unable to load users.</td>
            </tr>
        `;
    }
});