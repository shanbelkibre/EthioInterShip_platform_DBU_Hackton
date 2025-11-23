document.addEventListener("DOMContentLoaded", () => {
  const internshipList = document.getElementById("internshipList");
  const searchInput = document.getElementById("searchInput");
  const typeFilter = document.getElementById("typeFilter");
  const durationFilter = document.getElementById("durationFilter");
  const stipendFilter = document.getElementById("stipendFilter");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Check if user is logged in
  if (!currentUser) {
    window.location.href = "../auth/login.html";
    return;
  }

  // Load internships with simulated delay for better UX
  setTimeout(() => {
    loadInternships();
  }, 800);

  // Load internships with filters
  function loadInternships(filters = {}) {
    let internships = JSON.parse(localStorage.getItem("internships")) || [];

    // Apply filters
    if (filters.search) {
      internships = internships.filter(
        (internship) =>
          internship.title
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          internship.company
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          internship.description
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          internship.skills.some((skill) =>
            skill.toLowerCase().includes(filters.search.toLowerCase())
          )
      );
    }

    if (filters.type) {
      internships = internships.filter(
        (internship) => internship.type === filters.type
      );
    }

    if (filters.duration) {
      const [min, max] = filters.duration.split("-").map(Number);
      if (max) {
        internships = internships.filter(
          (internship) =>
            internship.duration >= min && internship.duration <= max
        );
      } else {
        internships = internships.filter(
          (internship) => internship.duration >= min
        );
      }
    }

    if (filters.stipend === "paid") {
      internships = internships.filter((internship) => internship.stipend > 0);
    } else if (filters.stipend === "unpaid") {
      internships = internships.filter(
        (internship) => internship.stipend === 0
      );
    }

    // Sort by newest first
    internships.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));

    // Clear current list
    internshipList.innerHTML = "";

    // Display internships
    if (internships.length === 0) {
      internshipList.innerHTML = `
                <div class="no-results glassmorphism">
                    <i class="fas fa-search"></i>
                    <h3>No internships found</h3>
                    <p>Try adjusting your search filters</p>
                    ${
                      currentUser.role === "company"
                        ? `<a href="internship-form.html" class="btn-primary">
                            <i class="fas fa-plus"></i> Post New Internship
                        </a>`
                        : ""
                    }
                </div>
            `;
      return;
    }

    internships.forEach((internship) => {
      const postedDate = new Date(internship.postedDate);
      const deadlineDate = new Date(internship.deadline);
      const daysLeft = Math.ceil(
        (deadlineDate - new Date()) / (1000 * 60 * 60 * 24)
      );

      const internshipElement = document.createElement("div");
      internshipElement.className = "internship-card glassmorphism";
      internshipElement.innerHTML = `
                <div class="card-header">
                    <h3>${internship.title}</h3>
                    <span class="badge ${
                      internship.type
                    }">${internship.type.replace("-", " ")}</span>
                </div>
                
                <div class="card-company">
                    <i class="fas fa-building"></i>
                    <span>${internship.company}</span>
                </div>
                
                <div class="card-details">
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${internship.location}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${internship.duration} weeks</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-dollar-sign"></i>
                        <span>${
                          internship.stipend > 0
                            ? `$${internship.stipend}/month`
                            : "Unpaid"
                        }</span>
                    </div>
                </div>
                
                <div class="card-description">
                    <p>${internship.description.substring(0, 150)}${
        internship.description.length > 150 ? "..." : ""
      }</p>
                </div>
                
                <div class="card-skills">
                    ${internship.skills
                      .slice(0, 5)
                      .map(
                        (skill) => `
                        <span class="skill-tag">${skill}</span>
                    `
                      )
                      .join("")}
                    ${
                      internship.skills.length > 5
                        ? `<span class="skill-tag more">+${
                            internship.skills.length - 5
                          } more</span>`
                        : ""
                    }
                </div>
                
                    <div class="actions">
    ${
        currentUser.role === "student"
            ? `<button class="btn-apply ${daysLeft <= 0 ? "disabled" : ""}" 
                data-id="${internship.id}" 
                ${daysLeft <= 0 ? "disabled" : ""}>
                <i class="fas fa-paper-plane"></i> 
                ${
                    internship.applicants.some(
                        (a) => a.studentId === currentUser.id
                    )
                        ? "Applied"
                        : "Apply Now"
                }
                </button>`
            : currentUser.id === internship.companyId
                ? `<button class="btn-view-applicants" data-id="${internship.id}">
                    <i class="fas fa-users"></i> 
                    View Applicants (${internship.applicants.length})
                    </button>`
                : `<button class="btn-apply" data-id="${internship.id}">
                    <i class="fas fa-paper-plane"></i> Apply
                    </button>               
                    ` 
    }
</div>

            `;
            if(!currentUser){
                window.location.href = "../dashboard/info-building.html";
            }
      internshipList.appendChild(internshipElement);
    });

    // Add event listeners to buttons
    document.querySelectorAll(".btn-apply").forEach((button) => {
      button.addEventListener("click", (e) => {
        if (!button.classList.contains("disabled")) {
          applyForInternship(e.target.closest(".btn-apply").dataset.id);
        }
      });
    });

    document.querySelectorAll(".btn-view-applicants").forEach((button) => {
      button.addEventListener("click", (e) => {
        viewApplicants(e.target.closest(".btn-view-applicants").dataset.id);
      });
    });
  }

  // Apply for internship
  function applyForInternship(internshipId) {
    let internships = JSON.parse(localStorage.getItem("internships")) || [];
    const internshipIndex = internships.findIndex((i) => i.id === internshipId);

    if (internshipIndex === -1) return;

    // Check if already applied
    if (
      internships[internshipIndex].applicants.some(
        (a) => a.studentId === currentUser.id
      )
    ) {
      showNotification("You have already applied for this internship.", "info");
      return;
    }

    // Add applicant
    internships[internshipIndex].applicants.push({
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      appliedDate: new Date().toISOString(),
      status: "pending",
    });

    localStorage.setItem("internships", JSON.stringify(internships));
    showNotification("Application submitted successfully!", "success");
    loadInternships(getCurrentFilters());
  }

  // View applicants
  function viewApplicants(internshipId) {
    window.location.href = `../applications/company-applications.html?internship=${encodeURIComponent(
      internshipId
    )}`;
  }

  // Get current filter values
  function getCurrentFilters() {
    return {
      search: searchInput.value,
      type: typeFilter.value,
      duration: durationFilter.value,
      stipend: stipendFilter.value,
    };
  }

  // Filter event listeners
  [searchInput, typeFilter, durationFilter, stipendFilter].forEach(
    (element) => {
      element.addEventListener("input", () => {
        loadInternships(getCurrentFilters());
      });
    }
  );

  // Notification function
  function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
            <i class="fas fa-${
              type === "success"
                ? "check-circle"
                : type === "error"
                ? "exclamation-circle"
                : "info-circle"
            }"></i>
            ${message}
        `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }
});
