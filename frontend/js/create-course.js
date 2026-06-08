document.addEventListener("DOMContentLoaded", () => {
  const courseTitle = document.getElementById("courseTitle");
  const courseDescription = document.getElementById("courseDescription");
  const publishBtn = document.getElementById("publishBtn");

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
        },
      });

      alert("Course created successfully");
      window.location.href = "courses.html";
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });
});
