const API_URL = "https://localhost:7202/api/Auth/login";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("login-form");

    if (!form) {
        console.error("Login form not found! Check if the form has the correct ID.");
        return;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Get user input values
        const email = document.getElementById("email").value.trim();  // Fixed capitalization
        const password = document.getElementById("password").value.trim();  // Fixed capitalization

        const requestData = {
            UsernameOrEmail: email,
            Password: password
        };

        try {
            // Make API request
            const response = await fetch(API_URL, {
                method: "POST",  // Fixed capitalization
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.token); // Store token
                localStorage.setItem("username", data.username); // Store username

                // After successful login
                localStorage.setItem("isLoggedIn", "true");

                window.location.href = "/DashboardPage/dashboard.html";
            } else {
                alert("Login failed. Check your credentials.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong. Please try again.");
        }
    });
});
