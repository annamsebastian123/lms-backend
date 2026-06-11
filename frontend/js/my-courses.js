document.addEventListener("DOMContentLoaded", async () => {
  const coursesContainer = document.getElementById("coursesContainer");
  if (!coursesContainer) return;

  const token = localStorage.getItem("token");
  if (!token) {
    coursesContainer.innerHTML = `<p>Please login to view your courses.</p>`;
    return;
  }

  try {
    const courses = await apiRequest("/courses/tutor-courses");
    if (!Array.isArray(courses) || courses.length === 0) {
      coursesContainer.innerHTML = `<p>You have not created any courses yet.</p>`;
      return;
    }

    coursesContainer.innerHTML = "";

    courses.forEach((course) => {
      const card = document.createElement("div");
      card.className = "course-card";

      const content = document.createElement("div");
      content.className = "course-content";

      const title = document.createElement("h3");
      title.textContent = course.title || "Untitled Course";

      // status badge
      if (course.status) {
        const badge = document.createElement('span');
        badge.className = `badge ${course.status === 'DRAFT' ? 'badge-draft' : 'badge-published'}`;
        badge.textContent = course.status === 'DRAFT' ? 'Draft' : 'Published';
        title.appendChild(badge);
      }

      const description = document.createElement("p");
      description.textContent = course.description || "No description available.";

      const actions = document.createElement("div");
      actions.className = "course-actions";

      const viewLink = document.createElement('a');
viewLink.href = `tutor-course-details.html?id=${course.id}`;

viewLink.addEventListener("click", () => {
  localStorage.setItem("selectedCourseId", course.id);
});

viewLink.className = 'action-btn';
viewLink.textContent = 'View Details';
     
actions.appendChild(viewLink);


      // Publish button for draft courses (only for tutors)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (course.status === 'DRAFT' && user && user.role === 'TUTOR') {
        const pubBtn = document.createElement('button');
        pubBtn.className = 'action-btn';
        pubBtn.textContent = 'Publish';
        pubBtn.addEventListener('click', async () => {
          try {
            await apiRequest(`/courses/${course.id}/publish`, { method: 'POST' });
            // update badge
            const b = title.querySelector('.badge');
            if (b) {
              b.className = 'badge badge-published';
              b.textContent = 'Published';
            }
            pubBtn.remove();
          } catch (err) {
            alert(err.message || 'Failed to publish course');
          }
        });
        actions.appendChild(pubBtn);
      }

      content.appendChild(title);
      content.appendChild(description);
      content.appendChild(actions);
      card.appendChild(content);
      coursesContainer.appendChild(card);
    });
  } catch (error) {
    coursesContainer.innerHTML = `<p>Unable to load courses.</p>`;
    console.error("Failed to load tutor courses", error);
  }
});
