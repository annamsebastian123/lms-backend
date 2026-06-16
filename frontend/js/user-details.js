document.addEventListener("DOMContentLoaded", async () => {
    const selectedUserId = localStorage.getItem("selectedUserId");

    const userAvatar = document.getElementById("userAvatar");
    const userName = document.getElementById("userName");
    const userRole = document.getElementById("userRole");

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const roleSelect = document.getElementById("role");
    const updateRoleBtn = document.getElementById("updateRoleBtn");
    const deactivateUserBtn = document.getElementById("deactivateUserBtn");

    if (!selectedUserId) {
        alert("No user selected");
        window.location.href = "users.html";
        return;
    }

    async function loadUserDetails() {
        const users = await apiRequest("/users");
        const usersList = Array.isArray(users) ? users : [];

        const user = usersList.find(
            item => String(item.id) === String(selectedUserId)
        );

        if (!user) {
            alert("User not found");
            window.location.href = "users.html";
            return;
        }

        const name = user.name || "N/A";
        const email = user.email || "N/A";
        const role = user.role || "LEARNER";

        nameInput.value = name;
        emailInput.value = email;
        roleSelect.value = role;
        deactivateUserBtn.dataset.active = user.isActive ? "true" : "false";

if (user.isActive) {
    deactivateUserBtn.textContent = "Deactivate User";
    deactivateUserBtn.classList.remove("activate-btn");
    deactivateUserBtn.classList.add("delete-btn");
} else {
    deactivateUserBtn.textContent = "Activate User";
    deactivateUserBtn.classList.remove("delete-btn");
    deactivateUserBtn.classList.add("activate-btn");
}

        userName.textContent = name;
        userRole.textContent = role;

        userAvatar.textContent = name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    }

    updateRoleBtn.addEventListener("click", async () => {
    try {
        const newRole = roleSelect.value;
        const token = localStorage.getItem("token");

        const response = await fetch(
            `http://localhost:5000/api/users/${selectedUserId}/role`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    role: newRole
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to update role");
            return;
        }

        alert("User role updated successfully");
        await loadUserDetails();

    } catch (error) {
        console.error("Failed to update role", error);
        alert("Failed to update role");
    }
});
deactivateUserBtn.addEventListener("click", async () => {
    const isActive = deactivateUserBtn.dataset.active === "true";

    const confirmMessage = isActive
        ? "Are you sure you want to deactivate this user?"
        : "Are you sure you want to activate this user?";

    const confirmAction = confirm(confirmMessage);

    if (!confirmAction) return;

    try {
        const token = localStorage.getItem("token");

        const endpoint = isActive
            ? `http://localhost:5000/api/users/${selectedUserId}/deactivate`
            : `http://localhost:5000/api/users/${selectedUserId}/activate`;

        const response = await fetch(endpoint, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to update user status");
            return;
        }

        alert(data.message || "User status updated successfully");
        await loadUserDetails();

    } catch (error) {
        console.error("Failed to update user status", error);
        alert("Failed to update user status");
    }
});
 try {
        await loadUserDetails();
    } catch (error) {
        console.error("Failed to load user details", error);
        alert("Failed to load user details");
    }
});
   