const API_URL = "https://localhost:7202/api/Auth/register";


document.addEventListener("DOMContentLoaded", function(){
    const form = document.getElementById("register-form");

    if(!form){
        console.error("Registration form not found! Check if the form has the correct ID.");
        return;
    }

    form.addEventListener("submit", async function(event){
        event.preventDefault();

        const userName = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();


        if (!username || !email || !password) {
            alert("All fields are required!");
            return;
        }

        // Prepare request data
        const requestData = {
            Username: userName,
            Email: email,
            Password: password
        };

        try{
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(requestData)
            });

            if(response.ok){
                alert("Registration successful!");
                window.location.href = "/LoginPage/index.html";
            }
            else{
                const errorText = await response.text();
                alert("Error: " + errorText);
            }
        } catch(error){
            console.error("Error:", error);
            alert("Something went wrong. Please try again.");
        }
    })
})