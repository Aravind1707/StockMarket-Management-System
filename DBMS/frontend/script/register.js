document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const pan = document.getElementById('pan').value;
    const aadhar = document.getElementById('aadhar').value;

    // Client-side validation for PAN and Aadhar
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const aadharRegex = /^\d{12}$/;

    if (!panRegex.test(pan)) {
        alert('Invalid PAN number. It should be in the format XXXXX1234X');
        return;
    }
    if (!aadharRegex.test(aadhar)) {
        alert('Invalid Aadhar number. It should be exactly 12 digits long.');
        return;
    }

    // Send registration data to backend
    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, pan, aadhar })
        });

        const result = await response.json();
        if (result.success) {
            alert('Registration successful!');
            window.location.href = 'login.html';
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error registering:', error);
        alert('Something went wrong. Please try again.');
    }
});
