document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            tabContents.forEach(content => content.style.display = 'none');
            document.getElementById(tab.dataset.tab + '-tab').style.display = 'block';
        });
    });

    // Role Fields Toggle
    const roleSelect = document.getElementById('signup-role');
    const studentField = document.getElementById('student-field');
    const companyField = document.getElementById('company-field');
    roleSelect.addEventListener('change', () => {
        studentField.style.display = roleSelect.value === 'student' ? 'block' : 'none';
        companyField.style.display = roleSelect.value === 'company' ? 'block' : 'none';
    });

    // Validate Email
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Show Notification
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>${message}`;
        document.body.appendChild(notification);
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        users = JSON.parse(localStorage.getItem('users')) || [];
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!validateEmail(email)) {
            showNotification('Invalid email format.', 'error');
            return;
        }

        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            showNotification('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = user.role === 'student' ? '../dashboard/student.html' : '../dashboard/company.html';
            }, 1000);
        } else {
            showNotification('Invalid email or password.', 'error');
        }
    });

    // Signup
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        users = JSON.parse(localStorage.getItem('users')) || [];
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const role = document.getElementById('signup-role').value;
        const university = document.getElementById('signup-university').value.trim();
        const company = document.getElementById('signup-company').value.trim();

        if (!validateEmail(email)) {
            showNotification('Invalid email format.', 'error');
            return;
        }

        if (users.some(u => u.email === email)) {
            showNotification('Email already registered.', 'error');
            return;
        }

        if ((role === 'student' && !university) || (role === 'company' && !company)) {
            showNotification('Please fill the role-specific field.', 'error');
            return;
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            role,
            ...(role === 'student' && { university }),
            ...(role === 'company' && { company })
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        showNotification('Signup successful! Please login.', 'success');
        setTimeout(() => {
            tabs[0].click();
            signupForm.reset();
            studentField.style.display = 'none';
            companyField.style.display = 'none';
        }, 1000);
    });
});