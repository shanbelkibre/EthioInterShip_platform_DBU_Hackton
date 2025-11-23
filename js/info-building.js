document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('profileForm');
    const inputs = form.querySelectorAll('input, select, textarea');
    const requiredFields = form.querySelectorAll('[required]');

    // Load saved data from localStorage
    const loadSavedData = () => {
        inputs.forEach(input => {
            const savedValue = localStorage.getItem(input.id);
            if (savedValue) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    if (input.value === savedValue) {
                        input.checked = true;
                    }
                } else if (input.type === 'file') {
                    // Handle file inputs by restoring the preview
                    if (input.id === 'profilePicture') {
                        const preview = document.getElementById('profilePicturePreview');
                        preview.innerHTML = '';
                        const img = document.createElement('img');
                        img.src = savedValue || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
                        img.alt = 'Profile Picture Preview';
                        preview.appendChild(img);
                    } else if (input.id === 'portfolioImages') {
                        const preview = document.getElementById('portfolioImagesPreview');
                        preview.innerHTML = '';
                        const savedPortfolioImages = JSON.parse(localStorage.getItem('portfolioImagesData') || '[]');
                        if (savedPortfolioImages.length > 0) {
                            savedPortfolioImages.forEach((src, index) => {
                                const img = document.createElement('img');
                                img.src = src;
                                img.alt = `Portfolio Image ${index + 1}`;
                                preview.appendChild(img);
                            });
                        } else {
                            const defaultImages = [
                                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                                'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
                            ];
                            defaultImages.forEach((src, index) => {
                                const img = document.createElement('img');
                                img.src = src;
                                img.alt = `Portfolio Image ${index + 1}`;
                                preview.appendChild(img);
                            });
                        }
                    }
                } else {
                    input.value = savedValue;
                }
            }
        });
    };

    // Save data to localStorage
    const saveData = (input) => {
        if (input.type === 'file') {
            // Handled separately in the change event listeners
            return;
        }
        const value = input.type === 'checkbox' || input.type === 'radio' ? (input.checked ? input.value : '') : input.value;
        localStorage.setItem(input.id, value);
    };

    // Validate individual field
   /*  const validateField = (field) => {
        const errorElement = document.getElementById(`${field.id}Error`);
        let isValid = true;
        let errorMessage = '';

        if (field.required && !field.value.trim()) {
            isValid = false;
            errorMessage = 'This field is required.';
        } else {
            switch (field.id) {
                case 'fullName':
                    if (!/^[a-zA-Z\s]+$/.test(field.value)) {
                        isValid = false;
                        errorMessage = 'Full name must contain only letters and spaces.';
                    }
                    break;
                case 'dateOfBirth':
                    const today = new Date();
                    const dob = new Date(field.value);
                    const age = today.getFullYear() - dob.getFullYear();
                    if (age < 16) {
                        isValid = false;
                        errorMessage = 'You must be at least 16 years old.';
                    }
                    break;
                case 'phone':
                    if (!/^\+251\d{9}$/.test(field.value)) {
                        isValid = false;
                        errorMessage = 'Phone number must start with +251 and be followed by 9 digits.';
                    }
                    break;
                case 'email':
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address.';
                    }
                    break;
                case 'linkedin':
                case 'github':
                    if (field.value && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(field.value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid URL.';
                    }
                    break;
                case 'gpa':
                    if (field.value && (field.value < 0 || field.value > 4.0)) {
                        isValid = false;
                        errorMessage = 'GPA must be between 0 and 4.0.';
                    }
                    break;
                case 'availability':
                    if (!/^\d{4}-\d{2}-\d{2}\s+to\s+\d{4}-\d{2}-\d{2}$/.test(field.value)) {
                        isValid = false;
                        errorMessage = 'Please use format: YYYY-MM-DD to YYYY-MM-DD';
                    }
                    break;
            }
        }

        errorElement.textContent = errorMessage;
        errorElement.style.display = errorMessage ? 'block' : 'none';
        return isValid;
    }; */

    // Validate radio groups
    const validateRadioGroup = (name) => {
        const radios = form.querySelectorAll(`input[name="${name}"]`);
        const errorElement = document.getElementById(`${name}Error`);
        const isChecked = Array.from(radios).some(radio => radio.checked);
        errorElement.textContent = isChecked ? '' : 'Please select an option.';
        errorElement.style.display = isChecked ? 'none' : 'block';
        return isChecked;
    };

    // Real-time validation on input
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            validateField(input);
            saveData(input);
        });

        input.addEventListener('change', () => {
            if (input.type === 'radio') {
                validateRadioGroup(input.name);
            }
            saveData(input);
        });
    });

    // Handle profile picture storage
    document.getElementById('profilePicture').addEventListener('change', function(e) {
        const preview = document.getElementById('profilePicturePreview');
        preview.innerHTML = '';
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = 'Profile Picture Preview';
                preview.appendChild(img);
                localStorage.setItem('profilePicture', e.target.result); // Save data URL
            };
            reader.readAsDataURL(file);
        } else {
            const img = document.createElement('img');
            img.src = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
            img.alt = 'Default Profile Picture';
            preview.appendChild(img);
            localStorage.setItem('profilePicture', '');
        }
    });

    // Handle portfolio images storage
    document.getElementById('portfolioImages').addEventListener('change', function(e) {
        const preview = document.getElementById('portfolioImagesPreview');
        preview.innerHTML = '';
        const files = e.target.files;
        const portfolioImagesData = [];
        if (files.length > 0) {
            const maxImages = Math.min(files.length, 3);
            let loadedImages = 0;
            for (let i = 0; i < maxImages; i++) {
                const file = files[i];
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = `Portfolio Image ${i + 1}`;
                    preview.appendChild(img);
                    portfolioImagesData[i] = e.target.result;
                    loadedImages++;
                    if (loadedImages === maxImages) {
                        localStorage.setItem('portfolioImagesData', JSON.stringify(portfolioImagesData));
                    }
                };
                reader.readAsDataURL(file);
            }
        } else {
            const defaultImages = [
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
            ];
            defaultImages.forEach((src, index) => {
                const img = document.createElement('img');
                img.src = src;
                img.alt = `Portfolio Image ${index + 1}`;
                preview.appendChild(img);
            });
            localStorage.setItem('portfolioImagesData', JSON.stringify([]));
        }
    });

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isFormValid = true;

        // Validate all required fields
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isFormValid = false;
            }
        });

        // Validate radio groups
        ['gender', 'type', 'relocate'].forEach(name => {
            if (!validateRadioGroup(name)) {
                isFormValid = false;
            }
        });

        if (isFormValid) {
            alert('Profile submitted successfully!');
            form.reset();
            localStorage.clear();
            // Reset image previews
            document.getElementById('profilePicturePreview').innerHTML = '<img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Default Profile Picture">';
            document.getElementById('portfolioImagesPreview').innerHTML = `
                <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Portfolio Image 1">
                <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Portfolio Image 2">
                <img src="https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Portfolio Image 3">
            `;
        } else {
            alert('Please fix the errors in the form before submitting.');
        }
    });

    // Load saved data on page load
    loadSavedData();
});