console.log("View lead JS loaded");

const index = localStorage.getItem("selectedLeadIndex");

if (index === null) {
  alert("No lead selected");
  window.location.href = "/view-cases.html";
}

async function loadLead() {
  const res = await fetch(`/api/leads/${index}`);
  const lead = await res.json();

  document.getElementById("loanId").value = lead.loanId;
  document.getElementById("name").value = lead.name || "";
  document.getElementById("mobile").value = lead.mobile || "";
  document.getElementById("loanAmount").value = lead.loanAmount || "";
}

document.getElementById("editForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const updatedLead = {
    name: document.getElementById("name").value,
    mobile: document.getElementById("mobile").value,
    loanAmount: document.getElementById("loanAmount").value
  };

  await fetch(`/api/leads/${index}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedLead)
  });

  alert("Lead updated");
  window.location.href = "/view-cases.html";
});

loadLead();
