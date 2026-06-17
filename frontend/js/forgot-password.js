document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("forgotPasswordForm");
    const emailInput = document.getElementById("forgotEmail");
    const message = document.getElementById("forgotMessage");

    function setMessage(text, type = "error") {
        message.textContent = text;
        message.style.color = type === "success" ? "green" : "red";
    }

    function isValidGmail(email) {
        return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim().toLowerCase();

        if (!isValidGmail(email)) {
            setMessage("Please enter a valid Gmail address.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Failed to send OTP.");
                return;
            }

            localStorage.setItem("resetEmail", email);

            setMessage("OTP sent successfully. Redirecting...", "success");

            setTimeout(() => {
                window.location.href = "reset-password.html";
            }, 1000);

        } catch (error) {
            console.error(error);
            setMessage("Something went wrong.");
        }
    });
});