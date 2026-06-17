document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("resetPasswordForm");
    const otpInput = document.getElementById("otp");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const message = document.getElementById("resetMessage");

    function setMessage(text, type = "error") {
        message.textContent = text;
        message.style.color = type === "success" ? "green" : "red";
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = localStorage.getItem("resetEmail");
        const otp = otpInput.value.trim();
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!email) {
            setMessage("Email not found. Please request OTP again.");
            return;
        }

        if (!otp || otp.length !== 6) {
            setMessage("Please enter a valid 6-digit OTP.");
            return;
        }

        if (newPassword.length < 6) {
            setMessage("Password must contain at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    otp,
                    newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Password reset failed.");
                return;
            }

            localStorage.removeItem("resetEmail");

            setMessage("Password reset successful. Redirecting...", "success");

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);

        } catch (error) {
            console.error(error);
            setMessage("Something went wrong.");
        }
    });
});