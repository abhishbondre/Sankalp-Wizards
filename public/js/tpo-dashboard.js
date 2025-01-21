document.addEventListener('DOMContentLoaded', function() {
    // Navigation handling
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');

    function showSection(sectionId) {
        contentSections.forEach(section => {
            section.style.display = 'none';
        });

        const selectedSection = document.getElementById(sectionId);
        if (selectedSection) {
            selectedSection.style.display = 'block';
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });

    showSection('dashboard');

    // Add event form submission
    const addEventForm = document.getElementById('addEventForm');
    if (addEventForm) {
        addEventForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: this.eventName.value,
                date: this.eventDate.value,
                time: this.eventTime.value,
                description: this.description.value,
                venue: this.venue.value
            };

            const response = await fetch('/add-event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                this.reset();
            }
        });
    }
}); 