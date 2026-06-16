const params = new URLSearchParams(window.location.search);
const moduleId = params.get("moduleId");

const questionsContainer =
  document.getElementById("questionsContainer");

const submitBtn =
  document.getElementById("submitQuizBtn");

let questions = [];

async function loadQuiz() {
  try {
    questions = await apiRequest(
      `/quiz/modules/${moduleId}/questions`
    );
     document.getElementById("questionCount").textContent =
      `${questions.length} Questions • Pass mark: 70%`;

    if (!questions.length) {
      questionsContainer.innerHTML =
        "<p>No questions available.</p>";
      return;
    }

    questionsContainer.innerHTML =
      questions.map((question, index) => `
        <div class="question-card">
          <h2>
            ${index + 1}. ${question.text}
          </h2>

          ${question.options.map(option => `
           <label class="option" style="display:block; cursor:pointer;">
  <input
    type="radio"
    name="question_${question.id}"
    value="${option.id}"
  >
  ${option.text}
</label>
          `).join("")}
        </div>
      `).join("");

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

async function submitQuiz() {
  try {
    const answers = [];

    questions.forEach(question => {
      const selected = document.querySelector(
        `input[name="question_${question.id}"]:checked`
      );

      if (selected) {
        answers.push({
  questionId: question.id,
  selectedOptionId: Number(selected.value),
});
      }
    });


    if (answers.length !== questions.length) {
  alert("Please answer all questions before submitting.");
  return;
}
   const result = await apiRequest(
  "/quiz/submit",
  {
    method: "POST",
    body: {
      moduleId: Number(moduleId),
      answers,
    },
  }
);

console.log("QUIZ RESULT:", result);

    localStorage.setItem(
      "quizResult",
      JSON.stringify(result)
    );

    window.location.href = "quiz-result.html";

  }catch (err) {
  console.error("SUBMIT ERROR:", err);
  alert(err.message);
}
}

if (submitBtn) {
  submitBtn.addEventListener(
    "click",
    submitQuiz
  );
}

loadQuiz();