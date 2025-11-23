document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const applicationsContainer = document.getElementById('applicationsContainer');
    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('searchInput');

    // Check if user is logged in and is a student
    // if (!currentUser || currentUser.role !== 'student') {
    //     window.location.href = '../auth/login.html';
    //     return;
    // }

    // Load applications data
    loadApplications();

    // Event listeners
    statusFilter.addEventListener('change', loadApplications);
    searchInput.addEventListener('input', loadApplications);

    function loadApplications() {
        const internships = JSON.parse(localStorage.getItem('internships')) || [];
        
        // Get selected filters
        const selectedStatus = statusFilter.value;
        const searchQuery = searchInput.value.toLowerCase();

        // Get student's applications
        let applications = [];
        internships.forEach(internship => {
            const application = internship.applicants.find(a => a.studentId === currentUser.id);
            if (!application) return;

            // Apply filters
            if (selectedStatus && application.status !== selectedStatus) return;
            if (searchQuery && !(
                internship.title.toLowerCase().includes(searchQuery) ||
                internship.company.toLowerCase().includes(searchQuery)
            )) return;

            applications.push({
                ...application,
                internship
            });
        });

        // Sort by application date (newest first)
        applications.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));

        // Render applications
        renderApplications(applications);
    }

    function renderApplications(applications) {
        if (applications.length === 0) {
            applicationsContainer.innerHTML = `
                <div class="no-applications">
                    <i class="fas fa-file-alt"></i>
                    <h3>No Applications Found</h3>
                    <p>You haven't applied to any internships yet</p>
                    <a href="../internships/internship-view.html" class="btn-view">
                        <i class="fas fa-search"></i> Browse Internships
                    </a>
                </div>
            `;
            return;
        }

        applicationsContainer.innerHTML = applications.map(application => `
            <div class="application-card status-${application.status}">
                <div class="application-header">
                    <h3>${application.internship.title}</h3>
                    <span class="company-name">${application.internship.company}</span>
                </div>
                
                <div class="application-details">
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${application.internship.location}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${application.internship.duration} weeks</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-dollar-sign"></i>
                        <span>${application.internship.stipend > 0 ? `$${application.internship.stipend}/month` : 'Unpaid'}</span>
                    </div>
                </div>
                
                <div class="application-status">
                    <div class="status-info">
                        <span class="status-badge ${application.status}">${application.status}</span>
                        <span class="application-date">
                            Applied: ${new Date(application.appliedDate).toLocaleDateString()}
                        </span>
                    </div>
                    
                    <div class="application-actions">
                        <a href="../internships/internship-view.html?internship=${application.internship.id}" class="btn-view">
                            <i class="fas fa-eye"></i> View Internship
                        </a>
                        <a href="../internships/internship-form.html?internship=${application.internship.id}" class="btn-view">
                            <i class="fas fa-eye"></i> Apply Again
                        </a>
                        ${application.status === 'accepted' ? `
                            <button class="btn-message" onclick="sendMessage('${application.internship.companyId}')">
                                <i class="fas fa-envelope"></i> Message Company
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    window.sendMessage = (companyId) => {
        // In a real app, this would open a chat with the company
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