export function initSignupForm(formId = 'signupForm', messageId = 'message') {
  const form = document.getElementById(formId);
  const messageEl = document.getElementById(messageId);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = form.querySelector('#username').value;
    const password = form.querySelector('#password').value;

    try {
      const response = await fetch('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const text = await response.text();
      let result;
      try { result = JSON.parse(text); } catch { result = {}; }

      if (response.ok) {
        messageEl.style.color = 'green';
        messageEl.textContent = result.message || 'Account created successfully!';
        localStorage.setItem('token', result.token);
        form.reset();
        window.location.href = '/';
      } else {
        messageEl.style.color = 'red';
        messageEl.textContent = result.message || text || 'Error creating account';
      }
    } catch (error) {
      console.error('Signup error:', error);
      messageEl.style.color = 'red';
      messageEl.textContent = 'Network error: ' + error.message;
    }
  });
}

export function initLoginForm(formId = 'loginForm', messageId = 'message') {
  const form = document.getElementById(formId);
  const messageEl = document.getElementById(messageId);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = form.querySelector('#username').value;
    const password = form.querySelector('#password').value;

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const text = await response.text();
      let result;
      try { result = JSON.parse(text); } catch { result = {}; }

      if (response.ok) {
        messageEl.style.color = 'green';
        messageEl.textContent = result.message || 'Login successful!';
        localStorage.setItem('token', result.token);
        form.reset();
        setTimeout(() => { window.location.href = '/'; }, 100);
      } else {
        messageEl.style.color = 'red';
        messageEl.textContent = result.message || text || 'Login failed';
      }
    } catch (error) {
      console.error('Login error:', error);
      messageEl.style.color = 'red';
      messageEl.textContent = 'Network error: ' + error.message;
    }
  });
}
