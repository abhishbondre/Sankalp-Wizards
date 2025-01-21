// Handle TPO profile photo upload
function handleTPOProfilePhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('tpoProfilePhoto').src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Add new opportunity
function addOpportunity(form) {
    const companyName = form.querySelector('[name="companyName"]').value;
    const position = form.querySelector('[name="position"]').value;
    const description = form.querySelector('[name="description"]').value;

    // Here you would typically send this to a backend
    console.log('New opportunity:', { companyName, position, description });
    alert('Opportunity added successfully!');
    form.reset();
}

// Add new event
function addEvent(form) {
    const eventName = form.querySelector('[name="eventName"]').value;
    const eventDate = form.querySelector('[name="eventDate"]').value;
    const eventDescription = form.querySelector('[name="eventDescription"]').value;

    // Here you would typically send this to a backend
    console.log('New event:', { eventName, eventDate, eventDescription });
    alert('Event added successfully!');
    form.reset();
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize photo upload listener
    const photoInput = document.getElementById('tpoPhotoInput');
    if (photoInput) {
        photoInput.addEventListener('change', function() {
            handleTPOProfilePhoto(this);
        });
    }

    // Initialize profile form submission
    const profileForm = document.querySelector('.profile-info form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Profile updated successfully!');
        });
    }

    // Initialize opportunity form submission
    const opportunityForm = document.querySelector('.add-section form');
    if (opportunityForm) {
        opportunityForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addOpportunity(this);
        });
    }
}); 