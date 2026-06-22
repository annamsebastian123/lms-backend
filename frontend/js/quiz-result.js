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
     const answerReview =
  document.getElementById("answerReview");

if (answerReview && result.answers) {
  answerReview.innerHTML =
    "<h2>Answer Review</h2>";

  result.answers.forEach((answer, index) => {
    const question = answer.question;

    const selectedOption =
      question.options.find(
        option =>
          option.id === answer.selectedOptionId
      );

    const correctOption =
      question.options.find(
        option =>
          option.id === question.correctOptionId
      );

    answerReview.innerHTML += `
      <div class="result-card" style="margin-top:15px;">
        <h3>
          ${index + 1}. ${question.text}
        </h3>

        <p>
          Your Answer:
          ${selectedOption?.text || "Not Answered"}
        </p>

        <p>
          ${answer.isCorrect
            ? "✓ Correct"
            : "✗ Incorrect"}
        </p>

        ${
          !answer.isCorrect
            ? `<p><strong>Correct Answer:</strong> ${correctOption?.text}</p>`
            : ""
        }
      </div>
    `;
  });
}
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