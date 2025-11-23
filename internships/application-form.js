document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('applicationForm');
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { id: 'defaultStudentId', role: 'student', name: 'Default Student', email: 'default@example.com' };

    // Check if user is logged in and is a student
    if (!currentUser || currentUser.role !== 'student') {
        showNotification('You must be logged in as a student to apply for an internship.', 'error');
        setTimeout(() => {
            window.location.href = '../auth/login.html';
        }, 2000);
        return;
    }

    // Get internship ID from URL (e.g., internship-application.html?internshipId=1)
    const urlParams = new URLSearchParams(window.location.search);
    const internshipId = urlParams.get('internshipId');

    // Validate internship ID
    const internships = JSON.parse(localStorage.getItem('internships')) || [];
    const internship = internships.find(i => i.id === internshipId);
    // if (!internship) {
    //     showNotification('Internship not found.', 'error');
    //     setTimeout(() => {
    //         // window.location.href = 'internship-view.html';
    //     }, 2000);
    //     return;
    // }

    // Check if user has already applied
    if (internship.applicants && internship.applicants.some(app => app.studentId === currentUser.id)) {
        showNotification('You have already applied for this internship.', 'info');
        setTimeout(() => {
            window.location.href = 'internship-view.html';
        }, 2000);
        return;
    }

    // Pre-fill form with user profile data if available
    document.getElementById('fullName').value = currentUser.name || '';
    document.getElementById('email').value = currentUser.email || '';
    document.getElementById('phone').value = currentUser.phone || '';
    document.getElementById('portfolio').value = currentUser.portfolio || '';
    document.getElementById('institution').value = currentUser.university || '';
    document.getElementById('major').value = currentUser.major || '';
    document.getElementById('graduationDate').value = currentUser.graduationDate || '';
    document.getElementById('gpa').value = currentUser.gpa || '';

    // Set minimum dates for availability (start date must be tomorrow or later)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    startDateInput.min = tomorrow.toISOString().split('T')[0];
    startDateInput.value = tomorrow.toISOString().split('T')[0];

    // Ensure end date is after start date
    startDateInput.addEventListener('change', () => {
        const startDate = new Date(startDateInput.value);
        const minEndDate = new Date(startDate);
        minEndDate.setDate(startDate.getDate() + 1);
        endDateInput.min = minEndDate.toISOString().split('T')[0];
        if (endDateInput.value && new Date(endDateInput.value) <= startDate) {
            endDateInput.value = minEndDate.toISOString().split('T')[0];
        }
    });

    // File input handling (display file info only when a file is selected)
    const fileInputs = ['cvFile', 'coverLetterFile', 'transcriptFile'];
    fileInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        const fileInfo = document.getElementById(`${inputId}Info`);
        input.addEventListener('change', () => {
            if (input.files.length > 0) {
                const file = input.files[0];
                fileInfo.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
                fileInfo.classList.add('show');
            } else {
                fileInfo.textContent = '';
                fileInfo.classList.remove('show');
            }
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Custom error checking before submission
        let errorMessage = '';

        // Validate phone number format (basic check for international format)
        const phonePattern = /^\+?[1-9]\d{1,14}$/;
        if (!phonePattern.test(form.phone.value.trim())) {
            errorMessage = 'Please enter a valid phone number (e.g., +251 912 345 678).';
            showNotification(errorMessage, 'error');
            form.phone.focus();
            return;
        }

        // Validate portfolio URL if provided
        if (form.portfolio.value.trim()) {
            const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
            if (!urlPattern.test(form.portfolio.value.trim())) {
                errorMessage = 'Please enter a valid URL for your portfolio (e.g., https://johndoe.com).';
                showNotification(errorMessage, 'error');
                form.portfolio.focus();
                return;
            }
        }

        // Validate GPA if provided
        if (form.gpa.value && (form.gpa.value < 0 || form.gpa.value > 4)) {
            errorMessage = 'GPA must be between 0 and 4.';
            showNotification(errorMessage, 'error');
            form.gpa.focus();
            return;
        }

        // Validate graduation date (must be in the future)
        const gradDate = new Date(form.graduationDate.value);
        if (gradDate <= today) {
            errorMessage = 'Expected graduation date must be in the future.';
            showNotification(errorMessage, 'error');
            form.graduationDate.focus();
            return;
        }

        // Validate file uploads (ensure files are selected and are PDFs)
        const files = ['cvFile', 'coverLetterFile', 'transcriptFile'];
        for (const fileId of files) {
            const fileInput = document.getElementById(fileId);
            if (!fileInput.files.length) {
                errorMessage = `Please upload your ${fileId.replace('File', '').replace(/([A-Z])/g, ' $1').trim()} (PDF required).`;
                showNotification(errorMessage, 'error');
                fileInput.focus();
                return;
            }
            const file = fileInput.files[0];
            if (file.type !== 'application/pdf') {
                errorMessage = `The ${fileId.replace('File', '').replace(/([A-Z])/g, ' $1').trim()} must be a PDF file.`;
                showNotification(errorMessage, 'error');
                fileInput.focus();
                return;
            }
            // Optional: Limit file size (e.g., 5MB)
            if (file.size > 5 * 1024 * 1024) {
                errorMessage = `The ${fileId.replace('File', '').replace(/([A-Z])/g, ' $1').trim()} must be less than 5MB.`;
                showNotification(errorMessage, 'error');
                fileInput.focus();
                return;
            }
        }

        // Validate availability dates and hours
        const startDate = new Date(form.startDate.value);
        const endDate = new Date(form.endDate.value);
        if (endDate <= startDate) {
            errorMessage = 'End date must be after the start date.';
            showNotification(errorMessage, 'error');
            form.endDate.focus();
            return;
        }
        if (form.weeklyHours.value < 1 || form.weeklyHours.value > 40) {
            errorMessage = 'Weekly hours must be between 1 and 40.';
            showNotification(errorMessage, 'error');
            form.weeklyHours.focus();
            return;
        }

        // If no errors, proceed with submission
        // Show loading state
        form.classList.add('loading');

        // Simulate form processing delay for better UX
        setTimeout(() => {
            // Form validation (HTML5)
            if (!form.checkValidity()) {
                form.reportValidity();
                form.classList.remove('loading');
                return;
            }

            // Simulate file upload by capturing file metadata (since localStorage can't store files)
            const cvFile = document.getElementById('cvFile').files[0];
            const coverLetterFile = document.getElementById('coverLetterFile').files[0];
            const transcriptFile = document.getElementById('transcriptFile').files[0];

            const fileMetadata = (file) => file ? ({
                name: file.name,
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString()
            }) : null;

            // Collect form data
            const formData = {
                studentId: currentUser.id,
                studentName: form.fullName.value.trim(),
                studentEmail: form.email.value.trim(),
                appliedDate: new Date().toISOString(),
                status: 'pending',
                personalInfo: {
                    fullName: form.fullName.value.trim(),
                    email: form.email.value.trim(),
                    phone: form.phone.value.trim(),
                    portfolio: form.portfolio.value.trim()
                },
                education: {
                    institution: form.institution.value.trim(),
                    major: form.major.value.trim(),
                    graduationDate: form.graduationDate.value,
                    gpa: form.gpa.value ? parseFloat(form.gpa.value) : null
                },
                documents: {
                    cv: fileMetadata(cvFile),
                    coverLetter: fileMetadata(coverLetterFile),
                    transcript: fileMetadata(transcriptFile)
                },
                availability: {
                    startDate: form.startDate.value,
                    endDate: form.endDate.value,
                    weeklyHours: parseInt(form.weeklyHours.value)
                }
            };

            // Add application to internship's applicants array
            const internshipIndex = internships.findIndex(i => i.id === internshipId);
            if (internshipIndex === -1) {
                showNotification('Internship not found.', 'error');
                form.classList.remove('loading');
                return;
            }

            internships[internshipIndex].applicants = internships[internshipIndex].applicants || [];
            internships[internshipIndex].applicants.push(formData);
            localStorage.setItem('internships', JSON.stringify(internships));

            // Show success notification
            showNotification('Application submitted successfully!', 'success');

            // Redirect to browse internships page after delay
            setTimeout(() => {
                form.classList.remove('loading');
                window.location.href = 'browse-internships.html';
            }, 1500);
        }, 800); // 800ms delay to show loading state
    });

    // Notification function
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                              type === 'error' ? 'exclamation-circle' : 
                              'info-circle'}"></i>
            ${message}
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
});

// Add loading state styling
document.styleSheets[0].insertRule(`
    .application-form.loading .btn-primary {
        opacity: 0.7;
        pointer-events: none;
        background: linear-gradient(135deg, #95a5a6, #7f8c8d);
    }
`, document.styleSheets[0].cssRules.length);