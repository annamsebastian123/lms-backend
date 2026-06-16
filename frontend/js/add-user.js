document.addEventListener("DOMContentLoaded", () => {
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const roleInput = document.getElementById("role");
    const createUserBtn = document.getElementById("createUserBtn");
    const message = document.getElementById("message");

    createUserBtn.addEventListener("click", async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:5000/api/users/admin-create-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: nameInput.value,
                    email: emailInput.value,
                    password: passwordInput.value,
                    role: roleInput.value
                })
            });

            const data = await response.json();

            if (!response.ok) {
                message.textContent = data.message || "Failed to create user";
                message.style.color = "red";
                return;
            }

            message.textContent = "User created successfully";
            message.style.color = "green";

            setTimeout(() => {
                window.location.href = "users.html";
            }, 1000);

        } catch (error) {
            console.error("Failed to create user", error);
            message.textContent = "Failed to create user";
            message.style.color = "red";
        }
    });
});