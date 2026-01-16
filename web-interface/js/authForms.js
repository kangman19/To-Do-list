export async function initLoginForm() {
  const form = document.getElementById('loginForm');
  const messageEl = document.getElementById('message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        window.location.href = '/';
      } else {
        const error = await response.json();
        messageEl.textContent = error.message || 'Login failed';
        messageEl.style.color = 'red';
      }
    } catch (error) {
      messageEl.textContent = 'Network error: ' + error.message;
      messageEl.style.color = 'red';
    }
  });
}

export async function initSignupForm() {
  const form = document.getElementById('signupForm');
  const messageEl = document.getElementById('message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        messageEl.textContent = 'Account created! Redirecting to login...';
        messageEl.style.color = 'green';
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 2000);
      } else {
        const error = await response.json();
        messageEl.textContent = error.message || 'Signup failed';
        messageEl.style.color = 'red';
      }
    } catch (error) {
      messageEl.textContent = 'Network error: ' + error.message;
      messageEl.style.color = 'red';
    }
  });
}
