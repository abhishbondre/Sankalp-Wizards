document.addEventListener('DOMContentLoaded', function() {
    // Handle profile photo
    const photoInput = document.getElementById('photoInput');
    if (photoInput) {
        photoInput.addEventListener('change', handleProfilePhoto);
    }

    // Handle certificate uploads
    const certificateInput = document.getElementById('certificateInput');
    if (certificateInput) {
        certificateInput.addEventListener('change', handleCertificates);
    }

    // Handle form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }
});

// Store certificate files
const certificateFiles = new Map();

function handleProfilePhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profilePhoto').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function addSocialLink() {
    const socialLinks = document.getElementById('socialLinks');
    const linkItem = document.createElement('div');
    linkItem.className = 'social-link-item mb-2';
    linkItem.innerHTML = `
        <div class="d-flex gap-2">
            <input type="text" class="form-control" placeholder="Platform">
            <input type="url" class="form-control" placeholder="Link">
            <button type="button" class="btn btn-danger" onclick="removeSocialLink(this)">
                <i class="bi bi-x"></i>
            </button>
        </div>
    `;
    socialLinks.appendChild(linkItem);
}

function removeSocialLink(button) {
    button.closest('.social-link-item').remove();
}

function handleCertificates(event) {
    const files = event.target.files;
    const certificateList = document.getElementById('certificateList');
    
    Array.from(files).forEach(file => {
        const certId = 'cert_' + Date.now() + Math.random().toString(36).substr(2, 9);
        
        const certItem = document.createElement('div');
        certItem.className = 'certificate-item mb-2';
        certItem.dataset.fileId = certId;
        certItem.innerHTML = `
            <div class="d-flex gap-2 align-items-center">
                <input type="text" class="form-control" placeholder="Certificate Name">
                <span class="badge bg-primary">${file.name}</span>
                <button type="button" class="btn btn-sm btn-info" onclick="previewFile('${certId}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button type="button" class="btn btn-sm btn-danger" onclick="removeCertificate(this)">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `;
        
        certificateFiles.set(certId, file);
        certificateList.appendChild(certItem);
    });
}

function removeCertificate(button) {
    const certItem = button.closest('.certificate-item');
    const certId = certItem.dataset.fileId;
    certificateFiles.delete(certId);
    certItem.remove();
}

function previewFile(certId) {
    const file = certificateFiles.get(certId);
    if (file) {
        const fileUrl = URL.createObjectURL(file);
        window.open(fileUrl, '_blank');
    }
}

function previewProfile() {
    const previewContent = document.getElementById('previewContent');
    const formData = new FormData(document.getElementById('profileForm'));
    
    const preview = `
        <div class="card">
            <div class="card-body">
                <div class="text-center mb-4">
                    <img src="${document.getElementById('profilePhoto').src}" 
                         alt="Profile Photo" 
                         class="rounded-circle" 
                         style="width: 150px; height: 150px; object-fit: cover;">
                    <h3 class="mt-3">${formData.get('name')}</h3>
                    <p class="text-muted">Year ${formData.get('year')}</p>
                </div>
                
                <div class="row g-4">
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h5 class="mb-0">Academic Details</h5>
                            </div>
                            <div class="card-body">
                                <h6>CGPA by Year:</h6>
                                <div class="table-responsive">
                                    <table class="table table-sm">
                                        <tbody>
                                            ${formData.get('cgpa1') ? `<tr><td>1st Year</td><td>${formData.get('cgpa1')}</td></tr>` : ''}
                                            ${formData.get('cgpa2') ? `<tr><td>2nd Year</td><td>${formData.get('cgpa2')}</td></tr>` : ''}
                                            ${formData.get('cgpa3') ? `<tr><td>3rd Year</td><td>${formData.get('cgpa3')}</td></tr>` : ''}
                                            ${formData.get('cgpa4') ? `<tr><td>4th Year</td><td>${formData.get('cgpa4')}</td></tr>` : ''}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h5 class="mb-0">Social Links</h5>
                            </div>
                            <div class="card-body">
                                <div class="list-group list-group-flush">
                                    ${Array.from(document.querySelectorAll('.social-link-item')).map(item => {
                                        const inputs = item.querySelectorAll('input');
                                        return inputs[0].value && inputs[1].value ? `
                                            <a href="${inputs[1].value}" 
                                               target="_blank" 
                                               class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                                ${inputs[0].value}
                                                <i class="bi bi-box-arrow-up-right"></i>
                                            </a>
                                        ` : '';
                                    }).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Certificates</h5>
                            </div>
                            <div class="card-body">
                                <div class="row g-3">
                                    ${Array.from(document.querySelectorAll('.certificate-item')).map(item => {
                                        const certName = item.querySelector('input').value;
                                        const certId = item.dataset.fileId;
                                        return certName ? `
                                            <div class="col-md-6">
                                                <div class="p-3 border rounded d-flex justify-content-between align-items-center">
                                                    <span>${certName}</span>
                                                    <button class="btn btn-sm btn-primary" onclick="previewFile('${certId}')">
                                                        View
                                                    </button>
                                                </div>
                                            </div>
                                        ` : '';
                                    }).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    previewContent.innerHTML = preview;
    const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
    previewModal.show();
}

function shareProfile() {
    const response = fetch(`/share-profile/${currentUser.id}`);
    const data = response.json();
    
    if (data.shareUrl) {
        const shareModal = new bootstrap.Modal(document.getElementById('shareModal'));
        document.getElementById('shareUrl').value = data.shareUrl;
        shareModal.show();
    }
}

function copyShareUrl() {
    const shareUrl = document.getElementById('shareUrl');
    shareUrl.select();
    document.execCommand('copy');
    
    const copyBtn = document.getElementById('copyBtn');
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = 'Copied!';
    setTimeout(() => {
        copyBtn.innerHTML = originalText;
    }, 2000);
} 