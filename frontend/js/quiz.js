const params = new URLSearchParams(window.location.search);
const moduleId = params.get("moduleId");

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const questionsContainer = document.getElementById("questionsContainer");
const prevBtn = document.getElementById("prevQuestionBtn");
const nextBtn = document.getElementById("nextQuestionBtn");
const submitBtn = document.getElementById("submitQuizBtn");
const questionCountLabel = document.getElementById("questionCount");

let questions = [];
let currentQuestionIndex = 0;
let userAnswers = {}; // Maps question.id -> selectedOptionId

async function loadQuiz() {
  try {
    questions = await apiRequest(`/quiz/modules/${moduleId}/questions`);
    
    if (questionCountLabel) {
      questionCountLabel.textContent = `${questions.length} Questions • Pass mark: 70%`;
    }

    if (!questions.length) {
      questionsContainer.innerHTML = "<p>No questions available.</p>";
      if (nextBtn) nextBtn.style.display = "none";
      return;
    }

    renderCurrentQuestion();

  } catch (err) {
    console.error(err);
    showAlert(err.message || "Failed to load quiz", "Error");
  }
}

function renderCurrentQuestion() {
  if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) return;
  const question = questions[currentQuestionIndex];

  // Render top mini progress bar
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
  const progressHtml = `
    <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; margin-bottom: 20px; overflow: hidden;">
      <div style="width: ${progressPercent}%; height: 100%; background: #4f46e5; transition: width 0.3s ease;"></div>
    </div>
  `;

  // Render option choice cards
  const optionsHtml = question.options.map((option, optIdx) => {
    const isSelected = userAnswers[question.id] === option.id;
    return `
      <div class="quiz-option-card" data-option-id="${option.id}" style="display: flex; align-items: center; padding: 14px 18px; border: 1.5px solid ${isSelected ? '#4f46e5' : '#e2e8f0'}; background: ${isSelected ? '#f5f3ff' : 'white'}; border-radius: 10px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
        <input type="radio" name="quiz_option" value="${option.id}" ${isSelected ? 'checked' : ''} style="margin: 0 12px 0 0; pointer-events: none; width: 18px; height: 18px; cursor: pointer;">
        <span style="font-size: 14px; color: ${isSelected ? '#4338ca' : '#334155'}; font-weight: ${isSelected ? '600' : '500'};">${escapeHtml(option.text)}</span>
      </div>
    `;
  }).join("");

  questionsContainer.innerHTML = `
    ${progressHtml}
    <div class="question-card" style="background: white; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); margin-bottom: 15px;">
      <h3 style="margin-top: 0; margin-bottom: 14px; font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
        Question ${currentQuestionIndex + 1} of ${questions.length}
      </h3>
      <p style="font-size: 16px; color: #0f172a; line-height: 1.5; margin-bottom: 20px; font-weight: 600;">
        ${escapeHtml(question.text)}
      </p>
      <div class="options-list" style="margin-top: 15px;">
        ${optionsHtml}
      </div>
    </div>
  `;

  // Attach option clicks
  const optionCards = questionsContainer.querySelectorAll(".quiz-option-card");
  optionCards.forEach(card => {
    card.addEventListener("click", () => {
      const optionId = Number(card.getAttribute("data-option-id"));
      userAnswers[question.id] = optionId;
      renderCurrentQuestion();
    });
  });

  // Manage Button Visibilities
  if (prevBtn) {
    prevBtn.style.display = currentQuestionIndex > 0 ? "inline-block" : "none";
  }

  if (nextBtn) {
    nextBtn.style.display = currentQuestionIndex < questions.length - 1 ? "inline-block" : "none";
  }

  if (submitBtn) {
    submitBtn.style.display = currentQuestionIndex === questions.length - 1 ? "inline-block" : "none";
  }
}

// Next Button Handler
if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    const question = questions[currentQuestionIndex];
    if (!userAnswers[question.id]) {
      showAlert("Please select an option before proceeding.", "Response Required");
      return;
    }
    currentQuestionIndex++;
    renderCurrentQuestion();
  });
}

// Previous Button Handler
if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      renderCurrentQuestion();
    }
  });
}

// Submit Button Handler
async function submitQuiz() {
  const currentQuestion = questions[currentQuestionIndex];
  if (!userAnswers[currentQuestion.id]) {
    showAlert("Please select an option to answer the final question.", "Response Required");
    return;
  }

  const confirmed = await showConfirm("Are you sure you want to submit your quiz responses now?");
  if (!confirmed) return;

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const formattedAnswers = questions.map(q => ({
      questionId: q.id,
      selectedOptionId: userAnswers[q.id]
    }));

    const result = await apiRequest("/quiz/submit", {
      method: "POST",
      body: {
        moduleId: Number(moduleId),
        answers: formattedAnswers
      }
    });

    console.log("QUIZ RESULT:", result);
    localStorage.setItem("quizResult", JSON.stringify(result));
    window.location.href = "quiz-result.html";

  } catch (err) {
    console.error("SUBMIT ERROR:", err);
    showAlert(err.message || "Failed to submit quiz.", "Error");
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Quiz";
  }
}

if (submitBtn) {
  submitBtn.addEventListener("click", submitQuiz);
}

loadQuiz();