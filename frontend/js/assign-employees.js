const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "admin") {
  showToast("Admin access only");
  location.href = "/dashboard.html";
}

let managers = [];
let employees = [];
let dealers = [];
let currentAssignments = [];

// Toast notification
function showToast(msg, timeout = 3000) {
  const t = document.getElementById("toast");
  if (!t) return alert(msg);
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), timeout);
}

async function loadUsers() {
  try {
    const admin = JSON.parse(localStorage.getItem("user")) || {};
    const res = await fetch("/api/admin/users", {
      headers: { "x-admin-id": admin.id }
    });
    if (!res.ok) throw new Error("Failed to fetch users");

    const users = await res.json();
    console.log('All users:', users);
    
    managers = users
      .filter(u => u.role === "manager" && u.status === "active")
      .map(u => ({ ...u, id: Number(u.id) }));

    employees = users
      .filter(u => u.role === "employee" && u.status === "active")
      .map(u => ({ ...u, id: Number(u.id) }));

    dealers = users
      .filter(u => u.role === "dealer" && u.status === "active")
      .map(u => ({ ...u, id: Number(u.id) }));
    
    console.log('Managers:', managers);
    console.log('Employees:', employees);
    console.log('Dealers:', dealers);

    populateManagerSelect();
    renderEmployees();
    loadAllAssignments();
  } catch (err) {
    console.error(err);
    showToast("Failed to load users");
  }
}

function populateManagerSelect() {
  const mgrSelect = document.getElementById("managerSelect");
  mgrSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a manager or employee...";
  mgrSelect.appendChild(defaultOption);

  // Add managers to dropdown
  managers.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = `${m.username} (Manager)`;
    mgrSelect.appendChild(opt);
  });

  // Add employees to dropdown (they can be bosses)
  employees.forEach(e => {
    const opt = document.createElement("option");
    opt.value = e.id;
    opt.textContent = `${e.username} (Employee)`;
    mgrSelect.appendChild(opt);
  });

  mgrSelect.addEventListener("change", onManagerChange);

  // Auto-select first available manager
  const availableManagers = [...managers, ...employees];
  if (availableManagers.length > 0) {
    mgrSelect.value = availableManagers[0].id;
    loadCurrentAssignments(availableManagers[0].id);
  }
}


function onManagerChange() {
  const managerId = document.getElementById("managerSelect").value;
  const statusEl = document.getElementById("assignmentStatus");

  currentAssignments = []; // ✅ RESET HERE

  if (managerId) {
    statusEl.textContent = "Loading current assignments...";
    loadCurrentAssignments(managerId);
  } else {
    statusEl.textContent = "Select a manager to view current assignments";
    renderEmployees();
  }
}

async function loadCurrentAssignments(managerId) {
  try {
    console.log("Manager ID (before):", managerId, typeof managerId);

    const res = await fetch(`/api/admin/manager-employees/${managerId}`);
    const data = await res.json();

    console.log("Assignments raw:", data);
    console.log("Assignments types:", data.map(x => typeof x));

currentAssignments = data.map(r => Number(r.employee_id));

    console.log("Assignments normalized:", currentAssignments);

    renderEmployees();
  } catch (err) {
    console.error(err);
    showToast("Failed to load current assignments");
  }
}


function renderEmployees() {
  const div = document.getElementById("employeeList");
  div.innerHTML = "";

  const assignableUsers = [...employees, ...dealers];
  
  if (assignableUsers.length === 0) {
    div.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">👥</div>
        <p>No active employees or dealers available</p>
      </div>
    `;
    updateSelectedCount();
    return;
  }

  assignableUsers.forEach(e => {
    const isAssigned = currentAssignments.some(
      id => Number(id) === Number(e.id)
    );
    const employeeItem = document.createElement("div");
    employeeItem.className = `employee-item ${isAssigned ? 'selected' : ''}`;
    employeeItem.dataset.employeeId = e.id;
    
    employeeItem.innerHTML = `
      <input type="checkbox" class="employee-checkbox" value="${e.id}" ${isAssigned ? 'checked' : ''}>
      <div class="employee-info">
        <div class="employee-name">${e.username}</div>
        <div class="employee-role">${e.role}</div>
      </div>
      <div class="employee-avatar">${e.username.charAt(0).toUpperCase()}</div>
    `;

    employeeItem.addEventListener('click', (e) => {
      if (e.target.type !== 'checkbox') {
        const checkbox = employeeItem.querySelector('.employee-checkbox');
        checkbox.checked = !checkbox.checked;
        updateEmployeeSelection(employeeItem, checkbox.checked);
      }
    });

    const checkbox = employeeItem.querySelector('.employee-checkbox');
    checkbox.addEventListener('change', () => {
      updateEmployeeSelection(employeeItem, checkbox.checked);
    });

    div.appendChild(employeeItem);
  });

  updateSelectedCount();
}

function updateEmployeeSelection(employeeItem, isChecked) {
  if (isChecked) {
    employeeItem.classList.add('selected');
  } else {
    employeeItem.classList.remove('selected');
  }
  updateSelectedCount();
}

function updateSelectedCount() {
  const checked = document.querySelectorAll("#employeeList input:checked");
  const count = checked.length;
  document.getElementById("selectedCount").textContent = count;
  
  const saveBtn = document.getElementById("saveBtn");
  saveBtn.disabled = count === 0;
}

function clearSelection() {
  const checkboxes = document.querySelectorAll("#employeeList input:checked");
  checkboxes.forEach(cb => {
    cb.checked = false;
    const employeeItem = cb.closest('.employee-item');
    if (employeeItem) {
      employeeItem.classList.remove('selected');
    }
  });
  updateSelectedCount();
  showToast("Selection cleared");
}

async function saveAssignments() {
  const managerId = document.getElementById("managerSelect").value;
  if (!managerId) return showToast("Select a manager first");

  const checked = [...document.querySelectorAll("#employeeList input:checked")]
    .map(cb => Number(cb.value));

  // Get the selected boss details
  const selectedBoss = [...managers, ...employees].find(u => u.id === Number(managerId));
  
  // Validate assignment rules
  for (const employeeId of checked) {
    const employee = [...employees, ...dealers].find(u => u.id === employeeId);
    
    if (!employee) continue;
    
    // Rules:
    // Employee → Manager (allowed)
    // Dealer → Manager (allowed) 
    // Dealer → Employee (allowed)
    // Employee → Employee (NOT allowed)
    // Manager → Anyone (NOT allowed)
    // Dealer → Dealer (NOT allowed)
    
    if (employee.role === 'employee' && selectedBoss.role === 'employee') {
      showToast(`❌ Cannot assign Employee "${employee.username}" to Employee "${selectedBoss.username}". Employees can only be assigned to Managers.`);
      return;
    }
    
    if (employee.role === 'manager') {
      showToast(`❌ Cannot assign Manager "${employee.username}" to anyone. Managers cannot be assigned.`);
      return;
    }
    
    if (employee.role === 'dealer' && selectedBoss.role === 'dealer') {
      showToast(`❌ Cannot assign Dealer "${employee.username}" to Dealer "${selectedBoss.username}". Dealers can only be assigned to Managers or Employees.`);
      return;
    }
  }

  const toAdd = checked.filter(id => !currentAssignments.includes(id));
  const toRemove = currentAssignments.filter(id => !checked.includes(id));

try {
  // ADD new assignments
  for (const employeeId of toAdd) {
    await fetch("/api/admin/assign-employee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parentId: Number(managerId),
        childId: Number(employeeId)
      })
    });
  }   // ← THIS BRACE WAS MISSING

  // REMOVE unchecked assignments
  for (const employeeId of toRemove) {
    await fetch("/api/admin/unassign-employee", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parentId: Number(managerId),
        childId: Number(employeeId)
      })
    });
  }

  if (toAdd.length > 0 && toRemove.length > 0) {
    showToast(`Added ${toAdd.length} and removed ${toRemove.length} assignment(s)`);
  } else if (toAdd.length > 0) {
    showToast(`Successfully assigned ${toAdd.length} user(s)`);
  } else if (toRemove.length > 0) {
    showToast(`Successfully unassigned ${toRemove.length} user(s)`);
  } else {
    showToast("No changes made");
  }

  await loadCurrentAssignments(managerId);
  setTimeout(loadAllAssignments, 500);

} catch (err) {
  console.error(err);
  showToast("Failed to save assignments");
}
}

async function loadAllAssignments() {
  try {
    const tbody = document.getElementById("assignmentsTableBody");
    tbody.innerHTML = '<tr><td colspan="4" class="loading-row"><div class="loading"><div class="spinner"></div>Loading assignments...</div></td></tr>';

    const assignments = [];
    
    // Get assignments for each manager
    console.log('Processing managers for assignments table:', managers);
    
    for (const manager of managers) {
      try {
        const res = await fetch(`/api/admin/manager-employees/${manager.id}`);
        if (res.ok) {
          const employeeIds = await res.json();
          console.log(`Manager ${manager.username} assignments:`, employeeIds);
          
          if (employeeIds && employeeIds.length > 0) {
           const assignedEmployees = [...employees, ...dealers].filter(u =>
              employeeIds.some(id => Number(id) === Number(u.id))
            );

            
            if (assignedEmployees.length > 0) {
              assignments.push({
                manager: manager,
                employees: assignedEmployees
              });
            }
          }
        } else {
          console.error(`Failed to load assignments for manager ${manager.username}`);
        }
      } catch (err) {
        console.error(`Error loading assignments for manager ${manager.username}:`, err);
      }
    }

    console.log('Final assignments data:', assignments);
    renderAssignmentsTable(assignments);
  } catch (err) {
    console.error(err);
    const tbody = document.getElementById("assignmentsTableBody");
    tbody.innerHTML = '<tr><td colspan="4" class="no-assignments">Failed to load assignments</td></tr>';
  }
}

function renderAssignmentsTable(assignments) {
  const tbody = document.getElementById("assignmentsTableBody");
  
  if (assignments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="no-assignments">No assignments found</td></tr>';
    return;
  }

  tbody.innerHTML = assignments.map(assignment => {
    const manager = assignment.manager;
    const assignedEmployees = assignment.employees;
    
    const employeeTags = assignedEmployees.map(emp => 
      `<span class="employee-tag">${emp.username}</span>`
    ).join('');

    return `
      <tr>
        <td><strong>${manager.username}</strong></td>
        <td>
          <div class="employee-tags">
            ${employeeTags}
          </div>
        </td>
        <td>
          <span class="employee-count">${assignedEmployees.length}</span>
        </td>
        <td>
          <button class="action-btn unassign" onclick="unassignAllFromManager(${manager.id}, '${manager.username}')">
            Unassign All
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function unassignAllFromManager(managerId, managerName) {
  if (!confirm(`Are you sure you want to unassign all employees from ${managerName}?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/admin/manager-employees/${managerId}`);
    const employeeIds = await res.json();
    
    if (!employeeIds || employeeIds.length === 0) {
      showToast(`No employees assigned to ${managerName}`);
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const employeeId of employeeIds) {
      try {
        console.log(`Attempting to unassign employee ${employeeId} from manager ${managerId}`);
        
       const unassignRes = await fetch("/api/admin/unassign-employee", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: Number(managerId),
          childId: Number(employeeId)
        })
      });

        
        console.log(`Unassign response status:`, unassignRes.status);
        
        if (unassignRes.ok) {
          const result = await unassignRes.json();
          console.log(`Unassign success for employee ${employeeId}:`, result);
          successCount++;
        } else {
          const errorText = await unassignRes.text();
          console.error(`Failed to unassign employee ${employeeId}. Status: ${unassignRes.status}, Error: ${errorText}`);
          errorCount++;
        }
      } catch (err) {
        console.error(`Exception when unassigning employee ${employeeId}:`, err);
        errorCount++;
      }
    }

    if (successCount > 0 && errorCount === 0) {
      showToast(`Successfully unassigned ${successCount} employee(s) from ${managerName}`);
    } else if (successCount > 0) {
      showToast(`Partially successful: unassigned ${successCount} employee(s), ${errorCount} failed`);
    } else {
      showToast(`Failed to unassign any employees from ${managerName}. Check console for details.`);
    }
    
    // Refresh current assignments if this manager is selected
    const currentManagerId = document.getElementById("managerSelect").value;
    if (currentManagerId == managerId) {
      await loadCurrentAssignments(managerId);
    }
    
    // Refresh the table
    await loadAllAssignments();
  } catch (err) {
    console.error(err);
    showToast("Failed to unassign employees");
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadUsers();
});
