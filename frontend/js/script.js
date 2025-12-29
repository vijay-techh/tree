async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const error = document.getElementById("error");

  const response = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();

  if (data.success) {
    localStorage.setItem("token", data.token);
    window.location.href = "dashboard.html";
  } else {
    error.textContent = "Invalid username or password";
  }
}
