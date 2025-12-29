document.getElementById("leadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const loanType = form.dataset.loanType;

  const data = {};
  form.querySelectorAll("input, select, textarea").forEach(el => {
    if (el.id) data[el.id] = el.value;
  });

  data.loanType = loanType;

  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    window.location.href = "/view-cases.html";
  } else {
    alert("Failed to save lead");
  }
});
