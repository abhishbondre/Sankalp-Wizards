// Handle profile photo upload
function handleProfilePhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profilePhoto').src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Add social link fields
function addSocialLink() {
    const socialLinks = document.getElementById('socialLinks');
    const newLink = document.createElement('div');
    newLink.className = 'social-link-item mb-2';
    newLink.innerHTML = `
        <input type="text" class="form-control mb-2" placeholder="Platform">
        <input type="url" class="form-control" placeholder="Link">
        <button type="button" class="btn btn-danger btn-sm mt-1" onclick="this.parentElement.remove()">Remove</button>
    `;
    socialLinks.appendChild(newLink);
}

// Handle certificate uploads
function handleCertificates() {
    const certificateList = document.getElementById('certificateList');
    const files = document.getElementById('certificateInput').files;
    
    for (let file of files) {
        const item = document.createElement('div');
        item.className = 'certificate-item d-flex align-items-center mb-2';
        item.innerHTML = `
            <span class="me-2">${file.name}</span>
            <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">Delete</button>
        `;
        certificateList.appendChild(item);
    }
}

// Share profile functionality
function shareProfile() {
    const dummyLink = `${window.location.origin}/student-profile/${Math.random().toString(36).substr(2, 9)}`;
    navigator.clipboard.writeText(dummyLink)
        .then(() => alert('Profile link copied to clipboard!'));
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize photo upload listener
    const photoInput = document.getElementById('photoInput');
    if (photoInput) {
        photoInput.addEventListener('change', function() {
            handleProfilePhoto(this);
        });
    }

    // Initialize form submission
    const profileForm = document.querySelector('.profile-info form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Profile saved successfully!');
        });
    }
}); 