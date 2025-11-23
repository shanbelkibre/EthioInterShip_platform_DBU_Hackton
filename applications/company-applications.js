document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const applicantsContainer = document.getElementById('applicantsContainer');
    const internshipFilter = document.getElementById('internshipFilter');
    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('searchInput');
    const modal = document.getElementById('applicantModal');
    const closeModal = document.querySelector('.close-modal');

    // Check if user is logged in and is a company
    if (!currentUser || currentUser.role !== 'company') {
        window.location.href = '../auth/login.html';
        return;
    }

    // Load applicants data
    loadApplicants();

    // Event listeners
    internshipFilter.addEventListener('change', loadApplicants);
    statusFilter.addEventListener('change', loadApplicants);
    searchInput.addEventListener('input', loadApplicants);
    closeModal.addEventListener('click', () => modal.style.display = 'none');

    function loadApplicants() {
        const internships = JSON.parse(localStorage.getItem('internships')) || [];
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Get company's internships
        const companyInternships = internships.filter(i => i.companyId === currentUser.id);
        
        // Populate internship filter
        populateInternshipFilter(companyInternships);

        // Get selected filters
        const selectedInternship = internshipFilter.value;
        const selectedStatus = statusFilter.value;
        const searchQuery = searchInput.value.toLowerCase();

        // Get applicants for these internships
        let applicants = [];
        companyInternships.forEach(internship => {
            if (selectedInternship && internship.id !== selectedInternship) return;
            
            internship.applicants.forEach(applicant => {
                const student = users.find(u => u.id === applicant.studentId);
                if (!student) return;

                // Apply filters
                if (selectedStatus && applicant.status !== selectedStatus) return;
                if (searchQuery && !(
                    student.name.toLowerCase().includes(searchQuery) ||
                    student.email.toLowerCase().includes(searchQuery) ||
                    internship.title.toLowerCase().includes(searchQuery)
                )) return;

                applicants.push({
                    ...applicant,
                    student,
                    internship
                });
            });
        });

        // Render applicants
        renderApplicants(applicants);
    }

    function populateInternshipFilter(internships) {
        if (internshipFilter.options.length > 1) return; // Already populated
        
        internships.forEach(internship => {
            const option = document.createElement('option');
            option.value = internship.id;
            option.textContent = internship.title;
            internshipFilter.appendChild(option);
        });
    }

    function renderApplicants(applicants) {
        if (applicants.length === 0) {
            applicantsContainer.innerHTML = `
                <div class="no-applicants glassmorphism">
                    <i class="fas fa-user-slash"></i>
                    <h3>No Applicants Found</h3>
                    <p>Try adjusting your filters or check back later</p>
                </div>
            `;
            return;
        }

        applicantsContainer.innerHTML = applicants.map(applicant => `
            <div class="applicant-card glassmorphism status-${applicant.status}">
                <div class="applicant-header">
                    <div class="applicant-avatar">
                        <img src="../assets/profile-icon.png" alt="${applicant.student.name}">
                    </div>
                    <div class="applicant-info">
                        <h3>${applicant.student.name}</h3>
                        <p>${applicant.student.email}</p>
                        <div class="applicant-meta">
                            <span class="internship-name">${applicant.internship.title}</span>
                            <span class="application-date">
                                Applied: ${new Date(applicant.appliedDate).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="applicant-skills">
                    ${applicant.student.skills?.slice(0, 5).map(skill => `
                        <span class="skill-tag">${skill}</span>
                    `).join('')}
                    ${applicant.student.skills?.length > 5 ? `
                        <span class="skill-tag more">+${applicant.student.skills.length - 5} more</span>
                    ` : ''}
                </div>
                
                <div class="applicant-actions">
                    <button class="btn-view" onclick="viewApplicantDetails('${applicant.studentId}', '${applicant.internship.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <div class="status-buttons">
                        <button class="btn-accept ${applicant.status === 'accepted' ? 'active' : ''}" 
                            onclick="updateApplicantStatus('${applicant.studentId}', '${applicant.internship.id}', 'accepted')">
                            <i class="fas fa-check"></i> Accept
                        </button>
                        <button class="btn-reject ${applicant.status === 'rejected' ? 'active' : ''}" 
                            onclick="updateApplicantStatus('${applicant.studentId}', '${applicant.internship.id}', 'rejected')">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    window.viewApplicantDetails = (studentId, internshipId) => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const internships = JSON.parse(localStorage.getItem('internships')) || [];
        
        const student = users.find(u => u.id === studentId);
        const internship = internships.find(i => i.id === internshipId);
        const application = internship.applicants.find(a => a.studentId === studentId);

        if (!student || !internship || !application) return;

        document.getElementById('modalContent').innerHTML = `
            <div class="modal-header">
                <h2>${student.name}'s Application</h2>
                <span class="status-badge ${application.status}">${application.status}</span>
            </div>
            
            <div class="modal-body">
                <div class="modal-section">
                    <h3><i class="fas fa-briefcase"></i> Internship Details</h3>
                    <p><strong>Position:</strong> ${internship.title}</p>
                    <p><strong>Company:</strong> ${internship.company}</p>
                    <p><strong>Location:</strong> ${internship.location}</p>
                    <p><strong>Type:</strong> ${internship.type.replace('-', ' ')}</p>
                    <p><strong>Duration:</strong> ${internship.duration} weeks</p>
                    <p><strong>Stipend:</strong> ${internship.stipend > 0 ? `$${internship.stipend}/month` : 'Unpaid'}</p>
                </div>
                
                <div class="modal-section">
                    <h3><i class="fas fa-user-graduate"></i> Student Profile</h3>
                    <p><strong>Name:</strong> ${student.name}</p>
                    <p><strong>Email:</strong> ${student.email}</p>
                    <p><strong>University:</strong> ${student.university || 'Not specified'}</p>
                    <p><strong>Major:</strong> ${student.major || 'Not specified'}</p>
                    <p><strong>Graduation Year:</strong> ${student.graduationYear || 'Not specified'}</p>
                </div>
                
                <div class="modal-section">
                    <h3><i class="fas fa-code"></i> Skills</h3>
                    <div class="skills-container">
                        ${student.skills?.map(skill => `
                            <span class="skill-tag">${skill}</span>
                        `).join('') || 'No skills listed'}
                    </div>
                </div>
                
                <div class="modal-section">
                    <h3><i class="fas fa-calendar-alt"></i> Application Timeline</h3>
                    <p><strong>Applied:</strong> ${new Date(application.appliedDate).toLocaleString()}</p>
                    ${application.status === 'accepted' ? `
                        <p><strong>Accepted:</strong> ${new Date().toLocaleString()}</p>
                    ` : ''}
                    ${application.status === 'rejected' ? `
                        <p><strong>Rejected:</strong> ${new Date().toLocaleString()}</p>
                    ` : ''}
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn-primary" onclick="sendMessage('${studentId}')">
                    <i class="fas fa-envelope"></i> Send Message
                </button>
                <div class="status-actions">
                    <button class="btn-accept ${application.status === 'accepted' ? 'active' : ''}" 
                        onclick="updateApplicantStatus('${studentId}', '${internshipId}', 'accepted')">
                        <i class="fas fa-check"></i> Accept
                    </button>
                    <button class="btn-reject ${application.status === 'rejected' ? 'active' : ''}" 
                        onclick="updateApplicantStatus('${studentId}', '${internshipId}', 'rejected')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            </div>
        `;

        modal.style.display = 'block';
    };

    window.updateApplicantStatus = (studentId, internshipId, newStatus) => {
        let internships = JSON.parse(localStorage.getItem('internships')) || [];
        
        const internshipIndex = internships.findIndex(i => i.id === internshipId);
        if (internshipIndex === -1) return;

        const applicantIndex = internships[internshipIndex].applicants.findIndex(
            a => a.studentId === studentId
        );
        if (applicantIndex === -1) return;

        internships[internshipIndex].applicants[applicantIndex].status = newStatus;
        localStorage.setItem('internships', JSON.stringify(internships));

        // Show notification
        showNotification(`Application ${newStatus} successfully!`, 'success');
        
        // Reload applicants
        loadApplicants();
        
        // Close modal if open
        modal.style.display = 'none';
    };

    window.sendMessage = (studentId) => {
        // In a real app, this would open a chat with the student
        showNotification('Message feature will be implemented in the chat module', 'info');
    };

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            ${message}
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
});