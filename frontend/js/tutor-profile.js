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

function makeAvatar(name = "Tutor") {
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
            profile.avatar || makeAvatar(profile.fullName || profile.name || "Tutor");
    }
}

async function loadTutorProfile() {
    try {
        const profile = await apiRequest("/tutor-profile");

        setAvatar(profile);

        profileName.textContent = profile.fullName || profile.name || "Tutor";
        profileRole.textContent = profile.role || "TUTOR";

        fullName.value = profile.fullName || profile.name || "";
        email.value = profile.email || "";
        section.value = profile.section || "";
        phone.value = profile.phone || "";
        designation.value = profile.designation || "";

    } catch (error) {
        console.error(error);
        alert("Error loading tutor profile");
    }
}

async function updateTutorProfile() {
    const newName = fullName.value.trim();
    const newEmail = email.value.trim();

    if (!newName || !newEmail) {
        alert("Name and email are required");
        return;
    }

    try {
        await apiRequest("/tutor-profile", {
            method: "PUT",
            body: {
                fullName: newName,
                email: newEmail,
                phone: phone.value.trim(),
                section: section.value.trim(),
                designation: designation.value.trim()
            }
        });

        alert("Tutor profile updated successfully");
        loadTutorProfile();

    } catch (error) {
        console.error(error);
        alert("Error updating tutor profile");
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
        loadTutorProfile();

    } catch (error) {
        console.error("Profile image upload failed", error);
        alert("Profile image upload failed");
    }
}

updateProfileBtn.addEventListener("click", updateTutorProfile);

profileImageInput.addEventListener("change", () => {
    const file = profileImageInput.files[0];
    if (!file) return;
    uploadProfileImage(file);
});

loadTutorProfile();