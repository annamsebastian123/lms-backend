const API_URL = "http://localhost:5000/api/profile/learner";

const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const department = document.getElementById("department");
const phone = document.getElementById("phone");

const profileName = document.getElementById("profileName");
const profileRole = document.getElementById("profileRole");
const profileAvatar = document.getElementById("profileAvatar");

const updateProfileBtn = document.getElementById("updateProfileBtn");

async function loadProfile() {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const user = await response.json();

        fullName.value = user.fullName || "";
email.value = user.email || "";
department.value = user.department || "";
phone.value = user.phone || "";

profileName.textContent = user.fullName || "Learner";
profileRole.textContent = user.role || "LEARNER";
profileAvatar.textContent = user.avatar || "L";

        if (user.name) {
            const initials = user.name
                .split(" ")
                .map(word => word[0])
                .join("")
                .toUpperCase();

            profileAvatar.textContent = initials;
        }

    } catch (error) {
        console.error("Failed to load profile", error);
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
    fullName: fullName.value,
    email: email.value
})
        });

        if (!response.ok) {
            throw new Error("Failed to update profile");
        }

        alert("Profile updated successfully");

    } catch (error) {
        console.error(error);
        alert("Failed to update profile");
    }
}

updateProfileBtn.addEventListener("click", updateProfile);

loadProfile();