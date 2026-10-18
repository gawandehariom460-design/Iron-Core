/* ==========================================================================
   IronCore Fitness - script.js
   All the interactive behaviour of the landing page lives here:
     1. Mobile hamburger menu (open / close)
     2. Smooth scrolling for navigation links
     3. Navbar shadow + active link highlighting while scrolling
     4. Program & membership buttons pre-fill the contact form
     5. Client-side validation of the contact form
     6. Sending the form to the Flask server (fetch) + success/error feedback
   ========================================================================== */

// ---------------------------------------------------------------------------
// Wait until the whole page has loaded before touching the DOM.
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {

  // Grab the elements we need (names match the IDs in index.html).
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const navbar = document.getElementById("navbar");
  const navLinks = document.querySelectorAll(".nav-link");
  const contactForm = document.getElementById("contactForm");
  const formMessage = document.getElementById("formMessage");
  const submitButton = document.getElementById("submitButton");

  // =========================================================================
  // 1. MOBILE HAMBURGER MENU
  // =========================================================================
  // Toggle the menu open/closed when the hamburger button is clicked.
  navToggle.addEventListener("click", function () {
    const isOpen = navMenu.classList.toggle("open");   // add/remove .open
    navToggle.classList.toggle("open", isOpen);        // animate bars to an X
    // Update aria-expanded so screen readers know the menu state.
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  });

  // Close the mobile menu when any link inside it is clicked.
  navMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navMenu.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  // Close the menu if the user clicks anywhere outside of it.
  document.addEventListener("click", function (event) {
    if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
      navMenu.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  // =========================================================================
  // 2. SMOOTH SCROLLING FOR NAVIGATION LINKS
  // =========================================================================
  // Every anchor link whose href starts with '#' scrolls smoothly to its
  // section. We offset by the navbar height so headings are not hidden.
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (event) {
      const targetId = anchor.getAttribute("href");

      // Ignore empty links like href="#"
      if (targetId.length <= 1) return;

      const targetSection = document.querySelector(targetId);
      if (!targetSection) return;

      event.preventDefault();                       // stop the default jump
      const navHeight = navbar.offsetHeight;        // ~72px
      const sectionTop = targetSection.getBoundingClientRect().top + window.scrollY - navHeight + 2;

      window.scrollTo({
        top: sectionTop,
        behavior: "smooth",
      });

      // Put the new address in the URL bar without reloading the page.
      history.replaceState(null, "", targetId);
    });
  });

  // =========================================================================
  // 3. NAVBAR SHADOW + ACTIVE LINK HIGHLIGHTING
  // =========================================================================
  // Add a shadow class to the navbar once the user scrolls a little.
  window.addEventListener("scroll", function () {
    navbar.classList.toggle("scrolled", window.scrollY > 30);
  });

  // Highlight the nav link of the section currently visible on screen.
  const sections = document.querySelectorAll("section[id]");
  const observerOptions = {
    root: null,                  // viewport is the observation root
    rootMargin: "-40% 0px -55% 0px",  // consider a section "active" near the middle
    threshold: 0,
  };

  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const currentId = entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle("active", link.getAttribute("href") === "#" + currentId);
        });
      }
    });
  }, observerOptions);

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  // =========================================================================
  // 4. PROGRAM & MEMBERSHIP BUTTONS PRE-FILL THE CONTACT FORM
  // =========================================================================
  // Program cards carry data-program="Strength Training" etc.
  document.querySelectorAll("[data-program]").forEach(function (button) {
    button.addEventListener("click", function () {
      const programSelect = document.getElementById("program");
      programSelect.value = button.getAttribute("data-program");
      // Small highlight so the user notices the field was filled in.
      flashField(programSelect);
    });
  });

  // Membership "Choose Plan" buttons carry data-plan="Basic" etc.
  document.querySelectorAll("[data-plan]").forEach(function (button) {
    button.addEventListener("click", function () {
      const planName = button.getAttribute("data-plan");
      const messageBox = document.getElementById("message");
      // Pre-fill the message with a helpful template the user can edit.
      messageBox.value = "Hello! I am interested in the " + planName +
        " membership plan. Please share more details and next steps.";
      flashField(messageBox);
    });
  });

  // Briefly highlight a form field with an orange glow.
  function flashField(field) {
    field.style.transition = "box-shadow 0.3s ease";
    field.style.boxShadow = "0 0 0 3px rgba(255, 77, 45, 0.35)";
    setTimeout(function () {
      field.style.boxShadow = "";
    }, 900);
  }

  // =========================================================================
  // 5. CLIENT-SIDE FORM VALIDATION
  // =========================================================================
  // Rules for each field. Keep them in sync with app.py on the server.
  const validators = {
    full_name: function (value) {
      if (value === "") return "Please enter your full name.";
      if (value.length < 3) return "Full name must be at least 3 characters long.";
      if (value.length > 80) return "Full name must be less than 80 characters.";
      return "";
    },
    email: function (value) {
      if (value === "") return "Please enter your email address.";
      // Very simple pattern: something@something.something
      const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailPattern.test(value)) return "Please enter a valid email address (e.g. name@example.com).";
      return "";
    },
    phone: function (value) {
      if (value === "") return "Please enter your phone number.";
      const phonePattern = /^[0-9+\-\s()]{7,15}$/;
      if (!phonePattern.test(value)) return "Phone may only contain digits, spaces, +, - and ().";
      return "";
    },
    program: function (value) {
      if (value === "") return "Please choose a fitness program.";
      return "";
    },
    message: function (value) {
      if (value === "") return "Please write a short message.";
      if (value.length < 10) return "Message must be at least 10 characters long.";
      if (value.length > 1000) return "Message must be less than 1000 characters.";
      return "";
    },
  };

  // Validate one field and show/hide its error message.
  function validateField(fieldName) {
    const field = document.getElementById(fieldName);
    const errorBox = document.getElementById("error-" + fieldName);
    const errorMessage = validators[fieldName](field.value.trim());

    errorBox.textContent = errorMessage;
    field.classList.toggle("invalid", errorMessage !== "");
    return errorMessage === "";              // true = field is valid
  }

  // Validate every field. Returns true only when all fields are valid.
  function validateForm() {
    let isFormValid = true;
    Object.keys(validators).forEach(function (fieldName) {
      const fieldValid = validateField(fieldName);
      if (!fieldValid) isFormValid = false;
    });
    return isFormValid;
  }

  // Re-validate a field as soon as the user fixes it (nice live feedback).
  Object.keys(validators).forEach(function (fieldName) {
    const field = document.getElementById(fieldName);
    field.addEventListener("input", function () {
      // Only show errors after the user has already seen one.
      if (field.classList.contains("invalid")) {
        validateField(fieldName);
      }
    });
  });

  // =========================================================================
  // 6. SUBMIT THE FORM TO THE FLASK SERVER
  // =========================================================================
  contactForm.addEventListener("submit", async function (event) {
    event.preventDefault();                     // stop the page from reloading

    // (a) Run all client-side checks first.
    if (!validateForm()) {
      showMessage("error-banner", "Please fix the highlighted errors before submitting.");
      return;
    }

    // (b) Collect the (already trimmed) values.
    const formData = {
      full_name: document.getElementById("full_name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      program: document.getElementById("program").value,
      message: document.getElementById("message").value.trim(),
    };

    // (c) Show a loading state on the button.
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

    try {
      // (d) Send the data as JSON to our Flask API endpoint.
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // (e) Success: show a green message and clear the form.
        showMessage("success", result.message);
        contactForm.reset();
        // Remove any leftover error styling.
        document.querySelectorAll(".form-group .error").forEach(function (box) {
          box.textContent = "";
        });
        document.querySelectorAll(".form-group .invalid").forEach(function (field) {
          field.classList.remove("invalid");
        });
      } else {
        // (f) The server found problems - display them field by field.
        if (result.errors) {
          Object.keys(result.errors).forEach(function (fieldName) {
            const errorBox = document.getElementById("error-" + fieldName);
            const field = document.getElementById(fieldName);
            if (errorBox) errorBox.textContent = result.errors[fieldName];
            if (field) field.classList.add("invalid");
          });
        }
        showMessage("error-banner", result.message || "Something went wrong. Please try again.");
      }
    } catch (networkError) {
      // (g) The server could not be reached at all.
      console.error("Network error:", networkError);
      showMessage("error-banner", "Could not reach the server. Please make sure the Flask app is running.");
    } finally {
      // (h) Restore the button either way.
      submitButton.disabled = false;
      submitButton.innerHTML = 'Submit Enquiry <i class="fa-solid fa-paper-plane"></i>';
    }
  });

  // Show a success or error banner above the form.
  function showMessage(type, text) {
    formMessage.className = "form-message " + type;   // .success or .error-banner
    formMessage.textContent = text;
    // Scroll the message into view so the user always sees it.
    formMessage.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // =========================================================================
  // BONUS: show the current year in the footer copyright text.
  // =========================================================================
  const yearSpan = document.getElementById("currentYear");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

});
