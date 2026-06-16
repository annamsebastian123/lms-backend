document.addEventListener("DOMContentLoaded", () => {
    const lmsName = document.getElementById("lmsName");
    const sessionTimeout = document.getElementById("sessionTimeout");
    const defaultRole = document.getElementById("defaultRole");
    const certificatePrefix = document.getElementById("certificatePrefix");

    const saveSettingsBtn = document.getElementById("saveSettingsBtn");
    const settingsMessage = document.getElementById("settingsMessage");

    lmsName.value =
        localStorage.getItem("lmsName") ||
        "High Court of Kerala LMS";

    sessionTimeout.value =
        localStorage.getItem("sessionTimeout") ||
        "1 hour";

    defaultRole.value =
        localStorage.getItem("defaultRole") ||
        "LEARNER";

    certificatePrefix.value =
        localStorage.getItem("certificatePrefix") ||
        "HCK-LMS";

    saveSettingsBtn.addEventListener("click", () => {
        localStorage.setItem("lmsName", lmsName.value);
        localStorage.setItem("sessionTimeout", sessionTimeout.value);
        localStorage.setItem("defaultRole", defaultRole.value);
        localStorage.setItem("certificatePrefix", certificatePrefix.value);

        settingsMessage.textContent = "Settings saved successfully";
        settingsMessage.style.color = "green";
    });
});