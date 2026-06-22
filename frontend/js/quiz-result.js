const result = JSON.parse(
  localStorage.getItem("quizResult")
);

if (!result) {
  window.location.href = "learning.html";
}

document.getElementById("scoreValue").textContent =
  `${result.score} / ${result.totalQuestions}`;

document.getElementById("percentageValue").textContent =
  `${result.percentage}%`;

document.getElementById("statusValue").textContent =
  result.passed ? "PASS" : "FAIL";

document.getElementById("resultMessage").textContent =
  result.passed
    ? "Congratulations! You passed the quiz and are eligible for certification."
    : "You did not reach the passing score.";

const certificateBtn =
  document.getElementById("certificateBtn");

if (!result.passed && certificateBtn) {
  certificateBtn.style.display = "none";
}    
if (result.passed && result.courseId) {
  const API_URL =
    window.location.origin.replace("-3000.", "-5000.") + "/api";

  const token = localStorage.getItem("token");

  fetch(
    `${API_URL}/certificates/generate/${result.courseId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  ).catch(console.error);
}
if (certificateBtn) {
  certificateBtn.addEventListener("click", () => {
    window.location.href = "certificates.html";
  });
}