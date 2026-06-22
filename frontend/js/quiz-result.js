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
  ? "Congratulations! You passed this module quiz."
    : "You did not reach the passing score.";

const certificateBtn =
  document.getElementById("certificateBtn");

if (certificateBtn) {
  certificateBtn.style.display = "none";
}
if (certificateBtn) {
  certificateBtn.addEventListener("click", () => {
    window.location.href = "certificates.html";
  });
}