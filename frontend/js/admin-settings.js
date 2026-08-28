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

    // Category Management
    const adminCategoryList = document.getElementById("adminCategoryList");
    const newCategoryInput = document.getElementById("newCategoryName");
    const addCategoryBtn = document.getElementById("addCategoryBtn");

    async function loadCategories() {
        if (!adminCategoryList) return;
        try {
            const categories = await apiRequest("/categories");
            adminCategoryList.innerHTML = "";
            if (!categories || categories.length === 0) {
                adminCategoryList.innerHTML = "<p style='color: #64748b; font-size: 13px; margin: 0;'>No categories configured.</p>";
                return;
            }

            categories.forEach(cat => {
                const badge = document.createElement("span");
                badge.style.cssText = "display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: white; border: 1px solid #cbd5e1; border-radius: 20px; font-size: 13px; font-weight: 500; color: #334155;";
                badge.textContent = cat.name;

                const deleteBtn = document.createElement("button");
                deleteBtn.style.cssText = "border: none; background: none; color: #ef4444; cursor: pointer; padding: 0; font-weight: bold; font-size: 14px; margin-left: 4px; display: inline-flex; align-items: center;";
                deleteBtn.innerHTML = "&times;";
                deleteBtn.title = "Delete Category";
                deleteBtn.addEventListener("click", async () => {
                    if (confirm(`Are you sure you want to delete the category "${cat.name}"?`)) {
                        try {
                            await apiRequest(`/categories/${cat.id}`, { method: "DELETE" });
                            alert("Category deleted successfully.");
                            loadCategories();
                        } catch (err) {
                            alert(err.message || "Failed to delete category.");
                        }
                    }
                });

                badge.appendChild(deleteBtn);
                adminCategoryList.appendChild(badge);
            });
        } catch (err) {
            console.error("Failed to load admin categories:", err);
            adminCategoryList.innerHTML = "<p style='color: #ef4444; font-size: 13px; margin: 0;'>Failed to load categories.</p>";
        }
    }

    if (addCategoryBtn) {
        addCategoryBtn.addEventListener("click", async () => {
            const name = newCategoryInput.value.trim();
            if (!name) {
                alert("Please enter a category name.");
                return;
            }
            try {
                await apiRequest("/categories", {
                    method: "POST",
                    body: { name }
                });
                newCategoryInput.value = "";
                alert("Category added successfully!");
                loadCategories();
            } catch (err) {
                alert(err.message || "Failed to add category.");
            }
        });
    }

    loadCategories();
});