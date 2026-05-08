document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Check if user is logged in via OAuth and is a student
  if (!currentUser || !currentUser.provider || currentUser.role !== "student") {
    window.location.href = "../auth/login.html";
    return;
  }

  // Display student name
  document.getElementById("student-name").textContent = currentUser.name;

  // Load dashboard stats
  loadDashboardStats(currentUser.id);

  // Load recommended internships
  loadRecommendedInternships(currentUser.id);

  // Set up event listeners
  setupEventListeners();
});

function loadDashboardStats(studentId) {
  setTimeout(() => {
    let internships = JSON.parse(localStorage.getItem("internships")) || [];

    // Calculate application stats
    let applicationsSent = 0;
    let acceptedApplications = 0;

    internships.forEach((internship) => {
      const application = internship.applicants.find(
        (app) => app.studentId === studentId,
      );
      if (application) {
        applicationsSent++;
        if (application.status === "accepted") {
          acceptedApplications++;
        }
      }
    });

    // Update UI
    document.getElementById("applications-sent").textContent = applicationsSent;
    document.getElementById("accepted-applications").textContent =
      acceptedApplications;

    // For demo purposes - in a real app, you would get this from chat data
    document.getElementById("unread-messages").textContent = Math.floor(
      Math.random() * 5,
    );
  }, 800);
}

function loadRecommendedInternships(studentId) {
  setTimeout(() => {
    let internships = JSON.parse(localStorage.getItem("internships")) || [];
    const studentProfile = JSON.parse(
      localStorage.getItem("studentProfiles"),
    )?.find((profile) => profile.id === studentId);

    // Filter active internships
    const activeInternships = internships.filter((internship) => {
      const deadline = new Date(internship.deadline);
      return deadline > new Date() && internship.status === "active";
    });

    // Simple recommendation algorithm
    let recommendedInternships = activeInternships;

    if (studentProfile?.skills?.length > 0) {
      recommendedInternships = activeInternships
        .sort((a, b) => {
          const aSkillsMatch = a.skills.filter((skill) =>
            studentProfile.skills.includes(skill),
          ).length;

          const bSkillsMatch = b.skills.filter((skill) =>
            studentProfile.skills.includes(skill),
          ).length;

          return bSkillsMatch - aSkillsMatch;
        })
        .slice(0, 3);
    } else {
      // If no profile, just show newest internships
      recommendedInternships = activeInternships
        .sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate))
        .slice(0, 3);
    }

    const internshipList = document.getElementById("internship-list");

    if (recommendedInternships.length === 0) {
      internshipList.innerHTML = `
                <div class="no-internships glassmorphism">
                    <i class="fas fa-briefcase"></i>
                    <h3>No Internships Available</h3>
                    <p>Check back later for new opportunities</p>
                </div>
            `;
      return;
    }

    internshipList.innerHTML = recommendedInternships
      .map((internship) => {
        const deadline = new Date(internship.deadline);
        const daysLeft = Math.ceil(
          (deadline - new Date()) / (1000 * 60 * 60 * 24),
        );
        const hasApplied = internship.applicants.some(
          (app) => app.studentId === studentId,
        );

        return `
                <div class="internship-card glassmorphism">
                    <div class="card-header">
                        <h3>${internship.title}</h3>
                        <span class="badge ${internship.type}">${internship.type.replace("-", " ")}</span>
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
                    </div>
                    
                    <div class="card-footer">
                        <div class="deadline ${daysLeft <= 7 ? "urgent" : ""}">
                            <i class="fas fa-calendar-times"></i>
                            <span>${daysLeft > 0 ? `${daysLeft} days left` : "Closed"}</span>
                        </div>
                        
                        <a href="../application/index.html?internship=${internship.id}" class="btn-apply ${hasApplied ? "applied" : ""}" 
                            ${hasApplied ? "disabled" : ""}>
                            <i class="fas fa-${hasApplied ? "check" : "paper-plane"}"></i>
                            ${hasApplied ? "Applied" : "Apply Now"}
                        </a>
                    </div>
                </div>
            `;
      })
      .join("");
  }, 1000);
}

function setupEventListeners() {
  // Logout button would be handled by navbar component
}

function showNotification(message, type) {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
        ${message}
    `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}
