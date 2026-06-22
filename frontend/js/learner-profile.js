const API_URL = "http://localhost:5000/api/profile/learner";

const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const section = document.getElementById("section");
const phone = document.getElementById("phone");
const designation = document.getElementById("designation");

const profileName = document.getElementById("profileName");
const profileRole = document.getElementById("profileRole");
const profileAvatar = document.getElementById("profileAvatar");
const profileImage = document.getElementById("profileImage");
const profileImageInput = document.getElementById("profileImageInput");

const updateProfileBtn = document.getElementById("updateProfileBtn");

function setAvatar(user) {
    if (user.profileImage) {
        profileImage.src = `http://localhost:5000${user.profileImage}`;
        profileImage.style.display = "block";
        profileAvatar.style.display = "none";
    } else {
        profileImage.style.display = "none";
        profileAvatar.style.display = "flex";

        const name = user.fullName || user.name || "Learner";
        const initials = name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

        profileAvatar.textContent = initials || "L";
    }
}

async function loadProfile() {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const user = await response.json();

        if (!response.ok) {
            alert(user.message || "Failed to load profile");
            return;
        }

        fullName.value = user.fullName || user.name || "";
        email.value = user.email || "";
        section.value = user.section || "";
        phone.value = user.phone || "";
        designation.value = user.designation || "";

        profileName.textContent = user.fullName || user.name || "Learner";
        profileRole.textContent = user.role || "LEARNER";

        setAvatar(user);

    } catch (error) {
        console.error("Failed to load profile", error);
        alert("Failed to load profile");
    }
}

async function updateProfile() {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(API_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                fullName: fullName.value.trim(),
                email: email.value.trim(),
                phone: phone.value.trim(),
                section: section.value.trim(),
                designation: designation.value.trim()
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to update profile");
            return;
        }

        alert("Profile updated successfully");
        loadProfile();

    } catch (error) {
        console.error(error);
        alert("Failed to update profile");
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
        loadProfile();

    } catch (error) {
        console.error("Profile image upload failed", error);
        alert("Profile image upload failed");
    }
}

updateProfileBtn.addEventListener("click", updateProfile);

profileImageInput.addEventListener("change", () => {
    const file = profileImageInput.files[0];
    if (!file) return;
    uploadProfileImage(file);
});

loadProfile();