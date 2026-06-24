const params = new URLSearchParams(window.location.search);

const moduleId =
  params.get("moduleId") ||
  localStorage.getItem("selectedModuleId");

console.log("moduleId:", moduleId);

const questionsContainer =
  document.getElementById("questionsContainer");

if (!moduleId) {
  questionsContainer.innerHTML =
    "<p>Module not found.</p>";
} else {
  loadQuizPreview();
}
async function loadQuizPreview() {
  try {
    const questions = await apiRequest(
      `/quiz/modules/${moduleId}/questions`
    );

    if (!questions.length) {
      questionsContainer.innerHTML =
        "<p>No questions available.</p>";
      return;
    }

    questionsContainer.innerHTML =
  questions.map((question, index) => `
    <div class="question-card">

      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2>
          ${index + 1}. ${question.text}
        </h2>

        <button
          class="action-btn deleteQuestionBtn"
          data-question-id="${question.id}">
          Delete
        </button>
      </div>

      ${question.options.map(option => `
        <label
          class="option"
          style="display:block; margin-bottom:8px;">

          ${
            option.id === question.correctOptionId
              ? "✅ "
              : ""
          }

          ${option.text}

        </label>
      `).join("")}

    </div>
  `).join("");

  document.querySelectorAll(".deleteQuestionBtn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const questionId = btn.dataset.questionId;

    if (!confirm("Delete this question?")) {
      return;
    }

    try {
      await apiRequest(
        `/quiz/questions/${questionId}`,
        {
          method: "DELETE",
        }
      );

      alert("Question deleted");

      loadQuizPreview();
    } catch (err) {
      alert(err.message);
    }
  });
});
  } catch (err) {
    console.error(err);

    questionsContainer.innerHTML =
      "<p>Failed to load quiz.</p>";
  }
}
