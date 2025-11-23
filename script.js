// Initialize localStorage databases
let users = JSON.parse(localStorage.getItem('users')) || [];
let internships = JSON.parse(localStorage.getItem('internships')) || [];
let applications = JSON.parse(localStorage.getItem('applications')) || [];
let chatMessages = JSON.parse(localStorage.getItem('chat')) || [];

// Auth Functions
function login() {
  const role = document.getElementById('role').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const user = users.find(u => u.email === email && u.password === password && u.role === role);
  
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = `../dashboard/${role.toLowerCase()}.html`;
  } else {
    alert('Invalid credentials!');
  }
}
function register() {
  const role = document.getElementById('role').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const newUser = {
    id: Date.now(),
    role,
    email,
    password,
    profile: {}
  };

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  alert('Registration successful!');
  window.location.href = "login.html";
}



// Enhanced AI Matching Algorithm
function calculateMatchScore(student, internship) {
    // Skill Matching (40%)
    const studentSkills = student.profile.skills || [];
    const requiredSkills = internship.requiredSkills || [];
    const skillMatch = studentSkills.filter(skill => requiredSkills.includes(skill));
    const skillScore = (skillMatch.length / requiredSkills.length) * 40;
  
    // Education Matching (25%)
    let educationScore = 0;
    if (internship.requiredEducation && student.profile.education) {
      educationScore = student.profile.education.toLowerCase().includes(
        internship.requiredEducation.toLowerCase()
      ) ? 25 : 0;
    }
  
    // University Preference (20%)
    let universityScore = 0;
    if (internship.preferredUniversities) {
      universityScore = internship.preferredUniversities.includes(
        student.profile.university
      ) ? 20 : 0;
    }
  
    // Experience Bonus (15%)
    let experienceScore = 0;
    if (student.profile.experience) {
      experienceScore = Math.min(15, student.profile.experience);
    }
  
    return Math.min(100, Math.round(
      skillScore + educationScore + universityScore + experienceScore
    ));
  }
  
  // Usage in Applications Page
  function displayMatchScores() {
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    const internships = JSON.parse(localStorage.getItem('internships')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
  
    applications.forEach(app => {
      const student = users.find(u => u.id === app.studentId);
      const internship = internships.find(i => i.id === app.internshipId);
      
      if (student && internship) {
        app.matchScore = calculateMatchScore(student, internship);
      }
    });
  
    localStorage.setItem('applications', JSON.stringify(applications));
  }




  

  