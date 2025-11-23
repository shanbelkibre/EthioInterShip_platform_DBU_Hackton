document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const profileForm = document.getElementById('companyProfileForm');
    const resetBtn = document.getElementById('resetForm');
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    const companyLogoInput = document.getElementById('companyLogo');
    const tagsList = document.getElementById('tagsList');
    const tagInput = document.getElementById('tagInput');

    // Check if user is logged in and is a company
    // if (!currentUser || currentUser.role !== 'company') {
    //     window.location.href = '../auth/login.html';
    //     return;
    // }

    // Load existing profile
    loadProfile();

    // Image upload handling
    imagePreview.addEventListener('click', () => companyLogoInput.click());
    
    companyLogoInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showNotification('Image size should be less than 2MB', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                localStorage.setItem(`companyLogo_${currentUser.id}`, e.target.result);
            }
            reader.readAsDataURL(file);
        }
    });

    // Tags input handling
    tagInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && this.value.trim() !== '') {
            e.preventDefault();
            addTag(this.value.trim());
            this.value = '';
        }
    });

    // Form submission
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const logo = localStorage.getItem(`companyLogo_${currentUser.id}`) || '../assets/profile-icon.png';
        
        const updatedProfile = {
            companyName: document.getElementById('companyName').value,
            industry: document.getElementById('industry').value,
            website: document.getElementById('website').value,
            foundedYear: document.getElementById('foundedYear').value,
            headquarters: document.getElementById('headquarters').value,
            companySize: document.getElementById('companySize').value,
            description: document.getElementById('description').value,
            specializations: Array.from(tagsList.children).map(tag => tag.textContent.replace('×', '').trim()),
            logo: logo,
            lastUpdated: new Date().toISOString()
        };

        const updatedUsers = users.map(user => 
            user.id === currentUser.id ? { ...user, profile: updatedProfile } : user
        );

        localStorage.setItem('users', JSON.stringify(updatedUsers));
        showNotification('Profile updated successfully!', 'success');
     
        // Redirect to company dashboard
        setTimeout(() => {
            window.location.href = '../dashboard/company.html';
        }, 2000);
    });


    // Reset form
    resetBtn.addEventListener('click', loadProfile);

    function loadProfile() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const company = users.find(u => u.id === currentUser.id);

        if (company?.profile) {
            document.getElementById('companyName').value = company.profile.companyName || '';
            document.getElementById('industry').value = company.profile.industry || '';
            document.getElementById('website').value = company.profile.website || '';
            document.getElementById('foundedYear').value = company.profile.foundedYear || '';
            document.getElementById('headquarters').value = company.profile.headquarters || '';
            document.getElementById('companySize').value = company.profile.companySize || '';
            document.getElementById('description').value = company.profile.description || '';

            // Load logo
            if (company.profile.logo) {
                previewImage.src = company.profile.logo;
            }

            // Load tags
            tagsList.innerHTML = '';
            if (company.profile.specializations?.length > 0) {
                company.profile.specializations.forEach(tag => addTag(tag));
            }
        }
    }

    function addTag(tagText) {
        if (Array.from(tagsList.children).some(tag => tag.textContent.replace('×', '').trim() === tagText)) {
            return;
        }

        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = `
            ${tagText}
            <span class="remove-tag">&times;</span>
        `;
        
        tag.querySelector('.remove-tag').addEventListener('click', () => tag.remove());
        tagsList.appendChild(tag);
    }


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