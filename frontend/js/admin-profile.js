const API_BASE_URL = window.location.hostname.includes("app.github.dev")
  ? window.location.origin.replace("-3000.", "-5000.") + "/api"
  : "http://localhost:5000/api";

const API_URL = `${API_BASE_URL}/profile/admin`;

const profileAvatar = document.getElementById("profileAvatar");
const profileName = document.getElementById("profileName");
const profileRole = document.getElementById("profileRole");

const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const department = document.getElementById("department");
const phone = document.getElementById("phone");

const updateProfileBtn = document.getElementById("updateProfileBtn");

function makeAvatar(name) {
    return name
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

async function loadAdminProfile() {
    const response = await fetch(API_URL);
    const profile = await response.json();

    profileAvatar.textContent = profile.avatar || makeAvatar(profile.fullName);
    profileName.textContent = profile.fullName;
    profileRole.textContent = profile.role;

    fullName.value = profile.fullName;
    email.value = profile.email;
    department.value = profile.department;
    phone.value = profile.phone || "";
}

async function updateAdminProfile() {
    const newName = fullName.value.trim();
    const newEmail = email.value.trim();

    if (!newName || !newEmail) {
        alert("Name and email are required");
        return;
    }

    const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fullName: newName,
            email: newEmail
        })
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.message || "Update failed");
        return;
    }

    profileName.textContent = newName;
    profileRole.textContent = "ADMIN";
    profileAvatar.textContent = makeAvatar(newName);

    alert("Profile updated successfully");
}

updateProfileBtn.addEventListener("click", updateAdminProfile);

loadAdminProfile();