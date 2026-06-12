const COURSES_API_URL = "http://localhost:5000/api/courses";

const searchInput = document.getElementById("searchInput");
const exploreBtn = document.getElementById("exploreBtn");
const featuredCoursesGrid = document.getElementById("featuredCoursesGrid");

const learnersCount = document.getElementById("learnersCount");
const coursesCount = document.getElementById("coursesCount");
const completionRate = document.getElementById("completionRate");

let allCourses = [];

async function loadIndexCourses() {
    try {
        const response = await fetch(COURSES_API_URL, {
            cache: "no-store"
        });

        const courses = await response.json();

        allCourses = courses;

        renderCourses(allCourses);
        updateStats();

    } catch (error) {
        console.error(error);
        featuredCoursesGrid.innerHTML = "<p>Failed to load courses.</p>";
    }
}

function renderCourses(courses) {
    featuredCoursesGrid.innerHTML = "";

    if (courses.length === 0) {
        featuredCoursesGrid.innerHTML = "<p>No courses found.</p>";
        return;
    }

    courses.forEach(course => {
        featuredCoursesGrid.innerHTML += `
            <div class="course-card">
                <div class="course-image"></div>

                <div class="course-content">
                    <h3>${course.title}</h3>
                    <p>${course.description || "No description available."}</p>

                    <button type="button" class="enroll-btn" onclick="viewCourse(event)">
    View Details
</button>
                </div>
            </div>
        `;
    });
}

function viewCourse(event) {
    event.preventDefault();
    event.stopPropagation();

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first to view course details.");
        return false;
    }

    window.location.href = "courses.html";
}

async function updateStats() {
    try {
        const response = await fetch("http://localhost:5000/api/courses/public-stats", {
            cache: "no-store"
        });

        const stats = await response.json();

        learnersCount.textContent = stats.totalLearners;
        coursesCount.textContent = stats.totalCourses;
        completionRate.textContent = stats.completionRate + "%";

    } catch (error) {
        console.error("Failed to load stats", error);
    }
}

searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.trim().toLowerCase();

    const filteredCourses = allCourses.filter(course => {
        const title = String(course.title || "").toLowerCase();
        const description = String(course.description || "").toLowerCase();

        return title.includes(keyword) || description.includes(keyword);
    });

    renderCourses(filteredCourses);
});

exploreBtn.addEventListener("click", () => {
    document.getElementById("featuredCourses").scrollIntoView({
        behavior: "smooth"
    });
});

loadIndexCourses();