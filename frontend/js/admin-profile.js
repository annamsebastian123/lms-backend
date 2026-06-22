const API_BASE_URL = window.location.hostname.includes("app.github.dev")
    ? window.location.origin.replace("-3000.", "-5000.") + "/api"
    : "http://localhost:5000/api";

const API_URL = `${API_BASE_URL}/profile/admin`;

const profileAvatar = document.getElementById("profileAvatar");
const profileImage = document.getElementById("profileImage");
const profileImageInput = document.getElementById("profileImageInput");

const profileName = document.getElementById("profileName");
const profileRole = document.getElementById("profileRole");

const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const section = document.getElementById("section");
const phone = document.getElementById("phone");
const designation = document.getElementById("designation");

const updateProfileBtn = document.getElementById("updateProfileBtn");

function makeAvatar(name = "Admin") {
    return name
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function setAvatar(profile) {
    if (profile.profileImage) {
        profileImage.src = `http://localhost:5000${profile.profileImage}`;
        profileImage.style.display = "block";
        profileAvatar.style.display = "none";
    } else {
        profileImage.style.display = "none";
        profileAvatar.style.display = "flex";
        profileAvatar.textContent =
            profile.avatar || makeAvatar(profile.fullName || profile.name || "Admin");
    }
}

async function loadAdminProfile() {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const profile = await response.json();

        if (!response.ok) {
            alert(profile.message || "Error loading admin profile");
            return;
        }

        setAvatar(profile);

        profileName.textContent = profile.fullName || profile.name || "Admin";
        profileRole.textContent = profile.role || "ADMIN";

        fullName.value = profile.fullName || profile.name || "";
        email.value = profile.email || "";
        section.value = profile.section || "";
        phone.value = profile.phone || "";
        designation.value = profile.designation || "";

    } catch (error) {
        console.error("Admin profile load error:", error);
        alert("Error loading admin profile");
    }
}

async function updateAdminProfile() {
    const newName = fullName.value.trim();
    const newEmail = email.value.trim();
    const newPhone = phone.value.trim();

    if (!newName || !newEmail) {
        alert("Name and email are required");
        return;
    }

    if (newPhone && !/^\d{10}$/.test(newPhone)) {
        alert("Phone number must contain exactly 10 digits");
        return;
    }

    try {
        const token = localStorage.getItem("token");

        const response = await fetch(API_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                fullName: newName,
                email: newEmail,
                section: section.value.trim(),
                phone: newPhone,
                designation: designation.value.trim()
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Update failed");
            return;
        }

        alert("Profile updated successfully");
        loadAdminProfile();

    } catch (error) {
        console.error("Admin profile update error:", error);
        alert("Update failed");
    }
}

async function uploadProfileImage(file) {
    try {
        const token = localStorage.getItem("token");

        const formData = new FormData();
        formData.append("profileImage", file);

        const response = await fetch("http://localhost:5000/api/upload/profile-image", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to upload image");
            return;
        }

        alert("Profile photo updated successfully");
        loadAdminProfile();

    } catch (error) {
        console.error("Profile image upload failed", error);
        alert("Profile image upload failed");
    }
}

updateProfileBtn.addEventListener("click", updateAdminProfile);

profileImageInput.addEventListener("change", () => {
    const file = profileImageInput.files[0];
    if (!file) return;
    uploadProfileImage(file);
});

loadAdminProfile();