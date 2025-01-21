document.addEventListener("DOMContentLoaded", function () {
  // Navigation handling
  const navLinks = document.querySelectorAll(".nav-link");
  const contentSections = document.querySelectorAll(".content-section");

  function showSection(sectionId) {
    // Hide all sections
    contentSections.forEach((section) => {
      section.style.display = "none";
    });

    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
      selectedSection.style.display = "block";
    }

    // Update active nav link
    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${sectionId}`) {
        link.classList.add("active");
      }
    });
  }

  // Add click handlers to nav links
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const sectionId = this.getAttribute("href").substring(1);
      showSection(sectionId);
    });
  });

  // Show profile section by default
  showSection("profile");
});

// Profile photo preview
function handleProfilePhoto(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("profilePhoto").src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// Add social link fields
function addSocialLink() {
  const socialLinks = document.getElementById("socialLinks");
  if (!socialLinks) return;

  const newLink = document.createElement("div");
  newLink.className = "social-link-item mb-2";
  newLink.innerHTML = `
        <div class="d-flex gap-2">
            <input type="text" class="form-control" placeholder="Platform">
            <input type="url" class="form-control" placeholder="Link">
            <button type="button" class="btn btn-danger" onclick="this.parentElement.parentElement.remove()">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
  socialLinks.appendChild(newLink);
}

// Initialize event listeners for dynamic elements
function initializeEventListeners() {
  // Profile photo handling
  const photoInput = document.getElementById("photoInput");
  if (photoInput) {
    photoInput.addEventListener("change", function () {
      handleProfilePhoto(this);
    });
  }

  // Form submission handling
  const profileForm = document.querySelector(".profile-info form");
  if (profileForm) {
    profileForm.addEventListener("submit", function (e) {
      e.preventDefault();
      alert("Profile saved successfully!");
    });
  }
}

// Call initialization when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeEventListeners);

document
  .getElementById("socialLinkForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/student/social-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        alert(result.message);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add social link");
    }
  });

async function removeSocialLink(id) {
  if (!confirm("Are you sure you want to remove this social link?")) return;

  try {
    const response = await fetch(`/student/social-link/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();
    if (result.success) {
      alert(result.message);
      window.location.reload();
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to remove social link");
  }
}
