// Initialize localStorage databases
let internships = JSON.parse(localStorage.getItem("internships")) || [];
let applications = JSON.parse(localStorage.getItem("applications")) || [];
let chatMessages = JSON.parse(localStorage.getItem("chat")) || [];

// OAuth-based Authentication
// Check if user is authenticated via OAuth
function isOAuthAuthenticated() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  return user && user.provider !== undefined;
}

// Get current OAuth user
function getOAuthUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

// Verify user is logged in (OAuth)
function verifyOAuthLogin() {
  if (!isOAuthAuthenticated()) {
    window.location.href = "auth/login.html";
    return false;
  }
  return true;
}

// Logout user
function logoutOAuthUser() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("oauth_state");
  localStorage.removeItem("oauth_provider");
  localStorage.removeItem("selected_role");
  window.location.href = "../index.html";
}

// Enhanced AI Matching Algorithm
function calculateMatchScore(student, internship) {
  // Skill Matching (40%)
  const studentSkills = student.profile.skills || [];
  const requiredSkills = internship.requiredSkills || [];
  const skillMatch = studentSkills.filter((skill) =>
    requiredSkills.includes(skill),
  );
  const skillScore = (skillMatch.length / requiredSkills.length) * 40;

  // Education Matching (25%)
  let educationScore = 0;
  if (internship.requiredEducation && student.profile.education) {
    educationScore = student.profile.education
      .toLowerCase()
      .includes(internship.requiredEducation.toLowerCase())
      ? 25
      : 0;
  }

  // University Preference (20%)
  let universityScore = 0;
  if (internship.preferredUniversities) {
    universityScore = internship.preferredUniversities.includes(
      student.profile.university,
    )
      ? 20
      : 0;
  }

  // Experience Bonus (15%)
  let experienceScore = 0;
  if (student.profile.experience) {
    experienceScore = Math.min(15, student.profile.experience);
  }

  return Math.min(
    100,
    Math.round(skillScore + educationScore + universityScore + experienceScore),
  );
}

// Usage in Applications Page
function displayMatchScores() {
  const applications = JSON.parse(localStorage.getItem("applications")) || [];
  const internships = JSON.parse(localStorage.getItem("internships")) || [];
  const users = JSON.parse(localStorage.getItem("users")) || [];

  applications.forEach((app) => {
    const student = users.find((u) => u.id === app.studentId);
    const internship = internships.find((i) => i.id === app.internshipId);

    if (student && internship) {
      app.matchScore = calculateMatchScore(student, internship);
    }
  });

  localStorage.setItem("applications", JSON.stringify(applications));
}
