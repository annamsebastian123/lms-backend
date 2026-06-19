document.addEventListener("DOMContentLoaded", () => {
  const courseTitle = document.getElementById("courseTitle");
  const courseDescription = document.getElementById("courseDescription");

  const draftBtn = document.getElementById("draftBtn");
  const publishBtn = document.getElementById("publishBtn");

  draftBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const title = courseTitle.value.trim();
    const description = courseDescription.value.trim();

    if (!title) {
      alert("Course title is required");
      return;
    }

    try {
      await apiRequest("/courses", {
        method: "POST",
        body: {
          title,
          description,
          status: "DRAFT",
        },
      });

      alert("Course saved as draft");
      window.location.href = "courses.html";
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });

  publishBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const title = courseTitle.value.trim();
    const description = courseDescription.value.trim();

    if (!title) {
      alert("Course title is required");
      return;
    }

    if (!description) {
      alert("Course description is required");
      return;
    }

    try {
      const response = await apiRequest("/courses", {
        method: "POST",
        body: {
  title,
  description,
  status: "PENDING_REVIEW",
},
      });

      alert("Course submitted for admin approval");
      window.location.href = "courses.html";
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });
});
