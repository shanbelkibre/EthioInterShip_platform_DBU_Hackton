// document.addEventListener('DOMContentLoaded', () => {
//     const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
//     // Check if user is logged in and is a company
//     if (!currentUser || currentUser.role !== 'company') {
//         window.location.href = '../auth/login.html';
//         return;
//     }

//     // Display company name
//     document.getElementById('company-name').textContent = currentUser.companyName || currentUser.name;

//     // Load dashboard stats
//     loadDashboardStats(currentUser.id);

//     // Load recent internships
//     loadRecentInternships(currentUser.id);

//     // Set up event listeners
//     setupEventListeners();
// });

function loadDashboardStats(companyId) {
    // Simulate loading delay for better UX
    setTimeout(() => {
        // Get internships from local storage
        let internships = JSON.parse(localStorage.getItem('internships')) || [];
        
        // Filter internships by this company
        const companyInternships = internships.filter(internship => internship.companyId === companyId);
        
        // Calculate stats
        const activeInternships = companyInternships.filter(internship => {
            const deadline = new Date(internship.deadline);
            return deadline > new Date() && internship.status === 'active';
        }).length;

        const totalApplicants = companyInternships.reduce((total, internship) => {
            return total + internship.applicants.length;
        }, 0);

        // Update UI
        document.getElementById('active-internships').textContent = activeInternships;
        document.getElementById('total-applicants').textContent = totalApplicants;

        // For demo purposes - in a real app, you would get this from chat data
        document.getElementById('unread-messages').textContent = Math.floor(Math.random() * 5);
    }, 800);
}

function loadRecentInternships(companyId) {
    setTimeout(() => {
        let internships = JSON.parse(localStorage.getItem('internships')) || [];
        
        // Filter and sort internships
        const recentInternships = internships
            .filter(internship => internship.companyId === companyId)
            .sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate))
            .slice(0, 3);

        const internshipList = document.getElementById('internship-list');
        
        if (recentInternships.length === 0) {
            internshipList.innerHTML = `
                <div class="no-internships glassmorphism">
                    <i class="fas fa-briefcase"></i>
                    <h3>No Internships Posted</h3>
                    <p>Get started by posting your first internship opportunity</p>
                    <a href="../internships/internship-form.html" class="btn-primary">
                        <i class="fas fa-plus"></i> Post Internship
                    </a>
                </div>
            `;
            return;
        }

        internshipList.innerHTML = recentInternships.map(internship => {
            const deadline = new Date(internship.deadline);
            const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
            
            return `
                <div class="internship-card glassmorphism">
                    <div class="card-header">
                        <h3>${internship.title}</h3>
                        <span class="badge ${internship.type}">${internship.type.replace('-', ' ')}</span>
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
                        <div class="applicants">
                            <i class="fas fa-users"></i>
                            <span>${internship.applicants.length} applicant${internship.applicants.length !== 1 ? 's' : ''}</span>
                        </div>
                        
                        <div class="deadline ${daysLeft <= 7 ? 'urgent' : ''}">
                            <i class="fas fa-calendar-times"></i>
                            <span>${daysLeft > 0 ? `${daysLeft} days left` : 'Closed'}</span>
                        </div>
                    </div>
                    
                    <a href="../internships/internship-view.html?internship=${internship.id}" class="view-btn">
                        View Details <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            `;
        }).join('');
    }, 1000);
}

function setupEventListeners() {
    // Logout button would be handled by navbar component
}

// Helper function to show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    document.body.appendChild(notification);
    
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }