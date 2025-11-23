document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('internshipForm');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Check if user is logged in and is a company
    if (!currentUser || currentUser.role !== 'company') {
        window.location.href = '../auth/login.html';
        return;
    }

    // Set company name from current user
    document.getElementById('company').value = currentUser.companyName || currentUser.name;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Form validation
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = {
            id: generateId(),
            title: form.title.value,
            company: form.company.value,
            companyId: currentUser.id,
            location: form.location.value,
            type: form.type.value,
            duration: parseInt(form.duration.value),
            stipend: form.stipend.value ? parseInt(form.stipend.value) : 0,
            description: form.description.value,
            skills: form.skills.value.split(',').map(skill => skill.trim()).filter(skill => skill),
            deadline: form.deadline.value,
            postedDate: new Date().toISOString(),
            applicants: [],
            status: 'active'
        };

        // Save to local storage
        let internships = JSON.parse(localStorage.getItem('internships')) || [];
        internships.push(formData);
        localStorage.setItem('internships', JSON.stringify(internships));

        // Show success notification
        showNotification('Internship posted successfully!', 'success');
        
        // Redirect to view page after delay
        setTimeout(() => {
            window.location.href = 'internship-view.html';
        }, 1500);
    });

    // Set minimum date for deadline (today)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('deadline').min = tomorrow.toISOString().split('T')[0];
    document.getElementById('deadline').value = tomorrow.toISOString().split('T')[0];

    // Helper function to generate unique ID
    function generateId() {
        return 'internship-' + Math.random().toString(36).substr(2, 9);
    }

    // Notification function
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
});