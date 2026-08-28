document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  const nameInput = document.getElementById("register-name");
  const emailInput = document.getElementById("register-email");
  const phoneInput = document.getElementById("register-phone");
  const sectionInput = document.getElementById("register-section");
  const designationInput = document.getElementById("register-designation");
 
  const passwordInput = document.getElementById("register-password");
  const confirmInput = document.getElementById("register-confirm-password");
  const messageEl = document.getElementById("register-message");

  function setMessage(text, type = "error") {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.style.color = type === "success" ? "green" : "red";
  }

  async function handleRegister(event) {
    event.preventDefault();
    setMessage("");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const phone = phoneInput.value.trim();
    const section = sectionInput.value.trim();
    const designation = designationInput.value.trim();
    

    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

  if (!name || !email || !phone || !section || !designation || !password || !confirmPassword){
      setMessage("Please fill in all required fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }
if (!/^\d{10}$/.test(phone)) {
  setMessage("Phone number must contain exactly 10 digits.");
  return;
}
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      await apiRequest("/auth/register", {
        method: "POST",
       body: {
  name,
  email,
  phone,
  section,
  designation,
  role: "LEARNER",
  password
}
      });

      setMessage("Registration successful! Redirecting to login...", "success");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);

    } catch (error) {
      setMessage(error?.message || "An error occurred during registration.");
    }
  }

  form.addEventListener("submit", handleRegister);
});