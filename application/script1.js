document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const applicationForm = document.getElementById("applicationForm");
  const internshipTitle = document.getElementById("internship-title");

  // Check if user is authenticated via OAuth
  if (!currentUser || !currentUser.provider) {
    window.location.href = "../auth/login.html";
    return;
  }

  // Get internship ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const internshipId = urlParams.get("internship");

  if (!internshipId) {
    window.location.href = "../internships/internship-view.html";
    return;
  }

  // Load internship details
  loadInternshipDetails(internshipId);

  // Pre-fill form with user data
  if (currentUser) {
    document.getElementById("fullName").value = currentUser.name || "";
    document.getElementById("email").value = currentUser.email || "";

    const studentProfile = JSON.parse(
      localStorage.getItem("studentProfiles"),
    )?.find((profile) => profile.id === currentUser.id);

    if (studentProfile) {
      document.getElementById("university").value =
        studentProfile.university || "";
      document.getElementById("major").value = studentProfile.major || "";
      document.getElementById("graduationYear").value =
        studentProfile.graduationYear || "";
    }
  }

  // Form submission
  applicationForm.addEventListener("submit", (e) => {
    e.preventDefault();
    submitApplication(internshipId);
  });

  // Cancel button
  document.querySelector(".btn-cancel").addEventListener("click", () => {
    window.location.href = `../internships/internship-view.html?internship=${internshipId}`;
  });
});

function loadInternshipDetails(internshipId) {
  const internships = JSON.parse(localStorage.getItem("internships")) || [];
  const internship = internships.find((i) => i.id === internshipId);

  if (internship) {
    document.getElementById("internship-title").textContent =
      `Applying for: ${internship.title} at ${internship.company}`;
  } else {
    window.location.href = "../internships/internship-view.html";
  }
}

function submitApplication(internshipId) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    window.location.href = "../auth/login.html";
    return;
  }

  let internships = JSON.parse(localStorage.getItem("internships")) || [];
  const internshipIndex = internships.findIndex((i) => i.id === internshipId);

  if (internshipIndex === -1) return;

  // Get form data
  const formData = {
    fullName: document.getElementById("fullName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    university: document.getElementById("university").value,
    major: document.getElementById("major").value,
    graduationYear: document.getElementById("graduationYear").value,
    coverLetter: document.getElementById("coverLetter").value,
    resume:
      document.getElementById("resume").files[0]?.name || "No file uploaded",
  };

  // Add applicant
  internships[internshipIndex].applicants.push({
    studentId: currentUser.id,
    studentName: formData.fullName,
    studentEmail: formData.email,
    university: formData.university,
    major: formData.major,
    graduationYear: formData.graduationYear,
    phone: formData.phone,
    coverLetter: formData.coverLetter,
    resume: formData.resume,
    appliedDate: new Date().toISOString(),
    status: "pending",
  });

  // Update local storage
  localStorage.setItem("internships", JSON.stringify(internships));

  // Show success message and redirect
  alert("Application submitted successfully!");
  window.location.href = "../applications/student-applications.html";
}
