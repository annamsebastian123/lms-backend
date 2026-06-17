document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const nameInput = document.getElementById("register-name");
  const emailInput = document.getElementById("register-email");
  const passwordInput = document.getElementById("register-password");
  const confirmInput = document.getElementById("register-confirm-password");
  const messageEl = document.getElementById("register-message");

  function setMessage(text, type = "error") {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.style.color = type === "success" ? "green" : "red";
  }

  function isValidGmail(email) {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  }

  async function handleRegister(event) {
    event.preventDefault();
    setMessage("");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

    if (!name || !email || !password || !confirmPassword) {
      setMessage("Please fill in all required fields.");
      return;
    }

    if (!isValidGmail(email)) {
      setMessage("Please enter a valid Gmail address, like example@gmail.com.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: { name, email, password },
      });

      setMessage(
        "Registration successful. Please login.",
        "success"
      );

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);

    } catch (error) {
      setMessage(error?.message || "An error occurred during registration.");
    }
  }

  form.addEventListener("submit", handleRegister);
});