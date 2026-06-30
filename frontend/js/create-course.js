document.addEventListener("DOMContentLoaded", () => {
  const courseTitle = document.getElementById("courseTitle");
  const courseDescription = document.getElementById("courseDescription");
  const courseCategory = document.getElementById("courseCategory");
  const courseThumbnail = document.getElementById("courseThumbnail");
  const draftBtn = document.getElementById("draftBtn");
  const publishBtn = document.getElementById("publishBtn");

  async function uploadThumbnailIfSelected() {
    const thumbnail = courseThumbnail?.files?.[0];

    if (!thumbnail) {
      return null;
    }

    const formData = new FormData();
    formData.append("thumbnail", thumbnail);

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/upload/course-thumbnail`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Thumbnail upload failed");
    }

    return result.thumbnailKey;
  }

  async function createCourse(status) {
    const title = courseTitle.value.trim();
    const description = courseDescription.value.trim();
    const category = courseCategory.value.trim();
    const targetRole = document.getElementById("targetRole").value;

    if (!title) {
      alert("Course title is required");
      return;
    }

    if (status === "PENDING_REVIEW" && !description) {
      alert("Course description is required");
      return;
    }

    try {
      const thumbnailUrl = await uploadThumbnailIfSelected();

      await apiRequest("/courses", {
        method: "POST",
        body: {
          title,
          description,
          category,
          thumbnailUrl,
          targetRole,
          status,
        },
      });

      alert(
        status === "DRAFT"
          ? "Course saved as draft"
          : "Course submitted for admin approval"
      );

      window.location.href = "courses.html";
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  draftBtn.addEventListener("click", (e) => {
    e.preventDefault();
    createCourse("DRAFT");
  });

  publishBtn.addEventListener("click", (e) => {
    e.preventDefault();
    createCourse("PENDING_REVIEW");
  });
});