// OAuth-based Authentication System
// Uses LinkedIn and GitHub for user verification

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in via OAuth
    checkOAuthStatus();
});

// Check if user has valid OAuth session
function checkOAuthStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.provider) {
        // User is logged in with OAuth
        console.log('OAuth user logged in:', currentUser.name);
    }
}

// Logout function
function logoutUser() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('oauth_state');
    localStorage.removeItem('oauth_provider');
    localStorage.removeItem('selected_role');
    window.location.href = '../index.html';
}

// Get current user info
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Check if user is authenticated
function isUserAuthenticated() {
    const user = getCurrentUser();
    return user && user.provider !== undefined;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>${message}`;
    document.body.appendChild(notification);
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Export functions
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.isUserAuthenticated = isUserAuthenticated;
window.showNotification = showNotification;

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