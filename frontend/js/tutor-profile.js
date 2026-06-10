const API_URL = "http://localhost:5000/api/tutor-profile";

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

async function loadTutorProfile() {
    try {
        const response = await fetch(API_URL);
        const profile = await response.json();

        if (!response.ok) {
            alert(profile.message || "Failed to load tutor profile");
            return;
        }

        profileAvatar.textContent = profile.avatar || makeAvatar(profile.fullName);
        profileName.textContent = profile.fullName;
        profileRole.textContent = profile.role;

        fullName.value = profile.fullName;
        email.value = profile.email;
        department.value = profile.department;
        phone.value = profile.phone || "";

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
        profileRole.textContent = "TUTOR";
        profileAvatar.textContent = makeAvatar(newName);

        alert("Tutor profile updated successfully");

    } catch (error) {
        console.error(error);
        alert("Error updating tutor profile");
    }
}

updateProfileBtn.addEventListener("click", updateTutorProfile);

loadTutorProfile();