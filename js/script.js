const baseUrl = "https://dennismoore.onrender.com";

// Check if user is logged in
function checkLoginStatus() {
    return localStorage.getItem('adminLoggedIn') === 'true';
}

// Update UI based on login status
function updateUIForLoginStatus() {
    const isLoggedIn = checkLoginStatus();
    document.getElementById('admin-login-btn').style.display = isLoggedIn ? 'none' : 'block';
    document.getElementById('signup-btn').style.display = isLoggedIn ? 'none' : 'block';
    document.getElementById('logout-btn').style.display = isLoggedIn ? 'block' : 'none';

    if (isLoggedIn) {
        document.getElementById('admin-panel').style.display = 'block';
        // Scroll to admin panel after login
        document.getElementById('admin-panel').scrollIntoView({ behavior: 'smooth' });
        // Load admin adverts
        loadAdminAdverts();
    } else {
        document.getElementById('admin-panel').style.display = 'none';
    }
}

// Show login form
function showLoginForm() {
    document.getElementById('login-modal').style.display = 'flex';
}

// Hide login form
function hideLoginForm() {
    document.getElementById('login-modal').style.display = 'none';
}

// Login function
async function login(email, password) {
    try {
        const res = await fetch(`${baseUrl}/api/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) throw new Error("Invalid credentials");

        const data = await res.json();

        // Save admin session
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("ADMIN_KEY", data.adminKey);

        hideLoginForm();
        updateUIForLoginStatus();
        return true;
    } catch (err) {
        alert("❌ Login failed. Check email/password.");
        console.error("Login error:", err);
        return false;
    }
}


// Logout function
async function logout() {
    try {
        await fetch(`${baseUrl}/api/admin/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-admin-key": localStorage.getItem("ADMIN_KEY") || ""
            }
        });
    } catch (err) {
        console.error("Logout request failed:", err);
    }

    // Clear session on frontend
    localStorage.setItem("adminLoggedIn", "false");
    localStorage.removeItem("ADMIN_KEY");

    updateUIForLoginStatus();
    alert("You have been logged out successfully.");
}


// Function to scroll to registration form
function showRegistration() {
    document.getElementById('registration').scrollIntoView({ behavior: 'smooth' });
}

// Function to show results section
function showResultsSection() {
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
    // Fetch results when the section is shown
    setTimeout(fetchAblefastResults, 500);
}

// Function to show advert section
function showAdvertSection() {
    document.getElementById('advert-preview').scrollIntoView({ behavior: 'smooth' });
    // loadAdverts();
}

// Function to show specific advert detail
function showAdvertDetail(advertId) {
    // Hide all main sections
    document.getElementById('home').style.display = 'none';
    document.getElementById('advert-preview').style.display = 'none';
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('features-section').style.display = 'none';
    document.getElementById('registration').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'none';

    // Show advert detail section
    document.getElementById('advert-detail').style.display = 'block';
    // Scroll to the top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
    console.log(advertId);
    // Fetch the advert details from the API
    fetch(`${baseUrl}/api/adverts/${advertId}`)
        .then(response => {
            if (!response.ok) throw new Error('Advert not found');
            return response.json();
        })
        .then(advert => {
            document.getElementById('advert-detail-title').textContent = advert.title;
            document.getElementById('advert-detail-date').textContent = new Date(advert.created_at).toLocaleDateString();
            document.getElementById('advert-detail-content').innerHTML = `<p>${advert.content}</p>`;

            // Set up WhatsApp link
            const whatsappBtn = document.getElementById('whatsapp-btn');
            const message = `I'm interested in your advert: ${advert.title}`;
            whatsappBtn.href = `https://wa.me/2347058969648?text=${encodeURIComponent(message)}`;
        })
        .catch(error => {
            console.error('Error fetching advert:', error);
            document.getElementById('advert-detail-content').innerHTML = `<p>Error loading advert content. Please try again later.</p>`;
        });
}

// Function to go back to advert list
function backToAdvertList() {
    // Show all main sections
    document.getElementById('home').style.display = 'block';
    document.getElementById('advert-preview').style.display = 'block';
    document.getElementById('results-section').style.display = 'block';
    document.getElementById('features-section').style.display = 'block';
    document.getElementById('registration').style.display = 'block';

    // Hide advert detail section
    document.getElementById('advert-detail').style.display = 'none';


    // Check if admin panel should be shown
    updateUIForLoginStatus();
    // Scroll to advert section
    showAdvertSection();
}

// Load adverts from API and display them
async function loadAdverts() {
    const advertGrid = document.getElementById('advert-grid');
    advertGrid.innerHTML = '<p class="loading">Loading adverts...</p>';

    try {
        const response = await fetch(`${baseUrl}/api/adverts`);
        if (!response.ok) throw new Error('Failed to fetch adverts');

        const adverts = await response.json();
        advertGrid.innerHTML = '';

        if (adverts.length === 0) {
            advertGrid.innerHTML = '<p class="no-adverts">No adverts available yet. Check back later!</p>';
            return;
        }

        // Sort adverts by date (newest first)
        const sortedAdverts = [...adverts].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedAdverts.forEach(advert => {
            const advertCard = document.createElement('div');
            advertCard.className = 'advert-card';
            advertCard.innerHTML = `
                <div class="advert-img">
                    <i class="fas fa-bullhorn"></i>
                </div>
                <div class="advert-content">
                    <h3>${advert.title}</h3>
                    <div class="advert-meta">
                        <span><i class="far fa-calendar"></i> ${new Date(advert.created_at).toLocaleDateString()}</span>
                    </div>
                    <p class="advert-excerpt">${advert.excerpt}</p>
                    <button class="btn btn-primary" onclick="showAdvertDetail('${advert.id}')">Read More</button>
                </div>
            `;
            advertGrid.appendChild(advertCard);
        });
    } catch (error) {
        console.error('Error loading adverts:', error);
        advertGrid.innerHTML = '<p class="error">Failed to load adverts. Please try again later.</p>';
    }
}

// Load adverts for admin management
async function loadAdminAdverts() {
    const adminAdvertList = document.getElementById('admin-advert-list');
    adminAdvertList.innerHTML = '<p class="loading">Loading adverts...</p>';

    try {
        const response = await fetch(`${baseUrl}/api/adverts`);
        if (!response.ok) throw new Error('Failed to fetch adverts');

        const adverts = await response.json();
        adminAdvertList.innerHTML = '';

        if (adverts.length === 0) {
            adminAdvertList.innerHTML = '<p>No adverts created yet.</p>';
            return;
        }

        // Sort adverts by date (newest first)
        const sortedAdverts = [...adverts].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedAdverts.forEach(advert => {
            const advertItem = document.createElement('div');
            advertItem.className = 'user-item';
            advertItem.innerHTML = `
                <div>
                    <h4>${advert.title}</h4>
                    <p>Published on: ${new Date(advert.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                    <button class="btn btn-outline edit-btn" onclick="editAdvert('${advert.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteAdvert('${advert.id}')">Delete</button>
                </div>
            `;
            adminAdvertList.appendChild(advertItem);
        });
    } catch (error) {
        console.error('Error loading admin adverts:', error);
        adminAdvertList.innerHTML = '<p class="error">Failed to load adverts. Please try again later.</p>';
    }
}

// Create a new advert
async function createAdvert(event) {
    event.preventDefault();

    const title = document.getElementById('advert-title').value;
    const content = document.getElementById('advert-content').value;
    const excerpt = document.getElementById('advert-excerpt').value;

    if (!title || !content || !excerpt) {
        alert('Please fill in all fields');
        return;
    }

    const newAdvert = {
        title,
        content,
        excerpt,
        date: new Date().toISOString()
    };

    try {
        const response = await fetch(`${baseUrl}/api/adverts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-key': localStorage.getItem('ADMIN_KEY') || ""
            },
            body: JSON.stringify(newAdvert)
        });

        if (!response.ok) throw new Error('Failed to create advert');
        console.log(response)
        // Reset form
        document.getElementById('advert-form').reset();

        // Reload adverts
        loadAdverts();
        loadAdminAdverts();

        alert('Advert created successfully!');

        // Scroll to advert section to show the new advert
        showAdvertSection();
    } catch (error) {
        console.error('Error creating advert:', error);
        alert('Failed to create advert. Please try again.');
    }
}

// Edit an advert
async function editAdvert(advertId) {
    // Fetch the advert details
    try {
        const response = await fetch(`${baseUrl}/api/adverts/${advertId}`);
        if (!response.ok) throw new Error('Failed to fetch advert');

        const advert = await response.json();

        // Populate the form with advert data
        document.getElementById('advert-title').value = advert.title;
        document.getElementById('advert-content').value = advert.content;
        document.getElementById('advert-excerpt').value = advert.excerpt;

        // Change the form to update mode
        const form = document.getElementById('advert-form');
        form.dataset.editId = advertId;
        form.querySelector('button[type="submit"]').textContent = 'Update Advert';

        // Scroll to the form
        document.getElementById('advert-form').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error fetching advert for edit:', error);
        alert('Failed to load advert for editing. Please try again.');
    }
}

// Delete an advert
async function deleteAdvert(advertId) {
    if (!confirm('Are you sure you want to delete this advert?')) return;

    try {
        const response = await fetch(`${baseUrl}/api/adverts/${advertId}`, {
            method: 'DELETE',
            headers: {
                'x-admin-key': localStorage.getItem('ADMIN_KEY') || ""
            }
        });

        if (!response.ok) throw new Error('Failed to delete advert');

        // Reload adverts
        loadAdverts();
        loadAdminAdverts();
        showAdvertSection();


        alert('Advert deleted successfully!');
    } catch (error) {
        console.error('Error deleting advert:', error);
        alert('Failed to delete advert. Please try again.');
    }
}

// Function to show different admin tabs
function showAdminTab(tabName) {
    // Hide all tabs
    document.getElementById('adverts-tab').style.display = 'none';

    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Show selected tab and set active class
    document.getElementById(`${tabName}-tab`).style.display = 'grid';
    event.target.classList.add('active');

    // Load adverts if advert tab is selected
    if (tabName === 'adverts') {
        loadAdminAdverts();
    }
}

// Redirect to WhatsApp with user details
function redirectToWhatsApp(userData) {
    const whatsappNumber = "2347058969648";
    const message = `New Registration:%0A%0AName: ${userData.name}%0APhone: ${userData.phone}%0AFavorite Sport: ${userData.sport}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
}

// API functions for results
document.getElementById("but").addEventListener("click", fetchAblefastResultsByDate);
async function fetchAblefastResultsByDate() {
    const select = document.getElementById("date-select");
    const btn = document.getElementById("but");
    const date = select.value.split("/").pop();

    let url = `${baseUrl}/api/fixtures`;
    if (date !== "latest") {
        url = `${baseUrl}/api/fixtures/${date}`;
    }
    btn.textContent = "Loading..."

    try {
        const res = await fetch(url);
        const data = await res.json();
        btn.textContent = "Load Result"
        renderResults(data);
    } catch (err) {
        btn.textContent = "Load Result"
        console.error("❌ Failed to fetch results:", err);
        document.getElementById("results-body").innerHTML = `<tr><td colspan="5">Error fetching results.</td></tr>`;
    }
}

function renderResults(data) {
    const resultsBody = document.getElementById("results-body");

    if (!data.fixtures || data.fixtures.length === 0) {
        resultsBody.innerHTML = `<tr><td colspan="5">No results found for ${data.week}</td></tr>`;
        return;
    }

    resultsBody.innerHTML = data.fixtures
        .map((f, i) => {
            const isDraw = f.result && f.result.toLowerCase().includes("draw");
            return `<tr>
                <td>${i + 1}</td>
                <td>${f.home}</td>
                <td>${f.away}</td>
                <td class="${isDraw ? "draw-result" : ""}">${f.result || "Pending"}</td> 
                <td>${f.status || "—"}</td>
            </tr>`;
        })
        .join("");
}

async function fetchAblefastResults() {
    const resultsBody = document.getElementById("results-body");
    resultsBody.innerHTML = '<tr><td colspan="5" class="loading">Loading results...</td></tr>';

    try {
        const response = await fetch(`${baseUrl}/api/fixtures`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        console.log("Fixtures API response:", data); // 👈 always check here

        if (!data || !Array.isArray(data.fixtures.fixtures)) {
            throw new Error("Invalid fixtures format");
        }

        const fixtures = data.fixtures.fixtures;
        resultsBody.innerHTML = "";

        if (fixtures.length === 0) {
            resultsBody.innerHTML = '<tr><td colspan="5" class="loading">No results available</td></tr>';
            return;
        }

        fixtures.forEach((fixture) => {
            const isDraw = fixture.result && fixture.result.toLowerCase().includes("draw");
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${fixture.number}</td>
                <td>${fixture.home}</td>
                <td>${fixture.away}</td>
                <td class="${isDraw ? "draw-result" : ""}">${fixture.result || "-"}</td>
                <td>${fixture.status || "Pending"}</td>
            `;
            resultsBody.appendChild(row);
        });
    } catch (error) {
        console.error("❌ fetchAblefastResults error:", error);
        resultsBody.innerHTML = `<tr><td colspan="5" class="error">Error: ${error.message}</td></tr>`;
    }
}



async function loadWeeks() {
    try {
        const res = await fetch(`${baseUrl}/api/weeks`);
        if (!res.ok) throw new Error(`Failed to fetch weeks: ${res.status}`);

        const weeks = await res.json();

        if (!Array.isArray(weeks)) {
            console.error("❌ Invalid weeks response:", weeks);
            return; // prevent crashing
        }

        const select = document.getElementById("date-select");
        select.innerHTML = '<option value="latest">Latest Week</option>';

        weeks.forEach(week => {
            const option = document.createElement("option");
            option.value = week.date;
            option.textContent = week.label;
            select.appendChild(option);
        });
    } catch (err) {
        console.error("Failed to load weeks:", err);
        const select = document.getElementById("date-select");
        select.innerHTML = '<option value="error">Error loading weeks</option>';
    }
}


// Initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
    // Check login status and update UI
    updateUIForLoginStatus();

    // Load adverts
    loadAdverts();

    // Load weeks for results
    loadWeeks();

    // Fetch initial results
    fetchAblefastResults();

    // Form submission handler
    document.getElementById('registration-form').addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form data
        const userData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            sport: document.getElementById('sport').value
        };

        // Redirect to WhatsApp with user details
        redirectToWhatsApp(userData);

        // Show success message
        alert('Thank you for registering! You will be redirected to WhatsApp to complete your registration.');
        this.reset();
    });

    // Login form handler
    document.getElementById('login-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (login(email, password)) {
            // Login successful
        } else {
            alert('Invalid email or password. Please try again.');
        }
    });

    // Advert form handler
    document.getElementById('advert-form').addEventListener('submit', function (e) {
        // Check if we're in edit mode
        if (this.dataset.editId) {
            updateAdvert(e, this.dataset.editId);
        } else {
            createAdvert(e);
        }
    });

    // Initialize admin panel tabs
    document.getElementById('adverts-tab').style.display = 'grid';

    // Ensure advert detail section is hidden on initial load
    document.getElementById('advert-detail').style.display = 'none';
});

// Update an existing advert
async function updateAdvert(event, advertId) {
    event.preventDefault();

    const title = document.getElementById('advert-title').value;
    const content = document.getElementById('advert-content').value;
    const excerpt = document.getElementById('advert-excerpt').value;

    if (!title || !content || !excerpt) {
        alert('Please fill in all fields');
        return;
    }

    const updatedAdvert = {
        title,
        content,
        excerpt
    };

    try {
        const response = await fetch(`${baseUrl}/api/adverts/${advertId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-key': localStorage.getItem('ADMIN_KEY') || "" // ✅ include admin key
            },
            body: JSON.stringify(updatedAdvert)
        });

        if (!response.ok) throw new Error('Failed to update advert');

        // Reset form and remove edit mode
        const form = document.getElementById('advert-form');
        form.reset();
        delete form.dataset.editId;
        form.querySelector('button[type="submit"]').textContent = 'Create Advert';

        // Reload adverts
        loadAdverts();
        loadAdminAdverts();

        showAdvertSection();


        alert('Advert updated successfully!');
    } catch (error) {
        console.error('Error updating advert:', error);
        alert('Failed to update advert. Please try again.');
    }
}
