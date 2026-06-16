document.addEventListener("DOMContentLoaded", async () => {
    const usersTableBody = document.getElementById("usersTableBody");
    const searchInput = document.getElementById("userSearchInput");
    const roleFilter = document.getElementById("roleFilter");
    const addUserBtn = document.getElementById("addUserBtn");

    let allUsers = [];

    if (!usersTableBody) return;

    function renderUsers(users) {
        if (users.length === 0) {
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="5">No users found.</td>
                </tr>
            `;
            return;
        }

        usersTableBody.innerHTML = "";

        users.forEach((user) => {
            usersTableBody.innerHTML += `
                <tr>
                    <td>${user.name || "N/A"}</td>
                    <td>${user.email || "N/A"}</td>
                    <td>${user.role || "N/A"}</td>
                    <td>
    <span class="status ${user.isActive ? "status-active" : "status-inactive"}">
        ${user.isActive ? "Active" : "Inactive"}
    </span>
</td>
                    <td>
                        <button class="action-btn" onclick="viewUser(${user.id})">
                            View
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    function applyFilters() {
        const searchValue = searchInput.value.trim().toLowerCase();
        const selectedRole = roleFilter.value;

        let filteredUsers = allUsers.filter((user) => {
            const name = (user.name || "").toLowerCase();
            const email = (user.email || "").toLowerCase();
            const role = user.role || "";

            const matchesSearch =
                name.includes(searchValue) ||
                email.includes(searchValue);

            const matchesRole =
                selectedRole === "ALL" || role === selectedRole;

            return matchesSearch && matchesRole;
        });

        renderUsers(filteredUsers);
    }

    try {
        const users = await apiRequest("/users");
        allUsers = Array.isArray(users) ? users : [];

        renderUsers(allUsers);

    } catch (error) {
        console.error("Failed to load users", error);

        usersTableBody.innerHTML = `
            <tr>
                <td colspan="5">Unable to load users.</td>
            </tr>
        `;
    }

    searchInput.addEventListener("input", applyFilters);
    roleFilter.addEventListener("change", applyFilters);

    addUserBtn.addEventListener("click", () => {
    window.location.href = "add-user.html";
});
});

function viewUser(userId) {
    localStorage.setItem("selectedUserId", userId);
    window.location.href = "user-details.html";
}