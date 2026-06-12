

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
        const profile = await apiRequest("/tutor-profile");

        profileAvatar.textContent =
            profile.avatar || makeAvatar(profile.fullName || profile.name);

        profileName.textContent =
            profile.fullName || profile.name;

        profileRole.textContent =
            profile.role || "TUTOR";

        fullName.value =
            profile.fullName || profile.name || "";

        email.value =
            profile.email || "";

        department.value =
            profile.department || "";

        phone.value =
            profile.phone || "";

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
    const data = await apiRequest("/tutor-profile", {
        method: "PUT",
        body: {
            fullName: newName,
            email: newEmail
        }
    });

        

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