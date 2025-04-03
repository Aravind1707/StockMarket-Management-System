document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Send login data to backend
    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        if (result.success) {
            alert('Login successful!');
            window.location.href = 'home.html';  // Redirect to home page
        } else {
            alert('Invalid username or password.');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        alert('Something went wrong. Please try again.');
    }
});
