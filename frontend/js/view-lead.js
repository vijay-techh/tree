
const user = JSON.parse(localStorage.getItem("user"));

// Read loanId from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const loanId = urlParams.get('loanId');

console.log('View Lead - URL params:', { loanId });

// If no loanId provided, show error and redirect
if (!loanId) {
  alert('Error: No loan ID provided');
  window.location.href = '/view-cases.html';
  throw new Error('No loanId provided');
}

// Fetch lead data
async function fetchLead() {
  try {
    console.log('Fetching lead with loanId:', loanId);
    const response = await fetch(`/api/leads/${loanId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        alert('Lead not found');
        window.location.href = '/view-cases.html';
        return;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const lead = await response.json();
    console.log('Lead data received:', lead);
    
    if (!lead) {
      alert('Lead data is empty');
      window.location.href = '/view-cases.html';
      return;
    }
    
    displayLeadData(lead);
  } catch (error) {
    console.error('Error fetching lead:', error);
    alert('Failed to load lead data: ' + error.message);
    window.location.href = '/view-cases.html';
  }
}

// Display lead data in the page
function displayLeadData(lead) {
  console.log('Displaying lead data:', lead);
  
  // Update page title
  const heading = document.getElementById('pageHeading');
  if (heading) {
    heading.textContent = `Lead Details - ${lead.loan_id}`;
  }
  
  // Hide the table and empty state since we're showing a single lead
  const table = document.getElementById('leadsTable');
  const emptyState = document.getElementById('emptyState');
  const pagination = document.getElementById('pagination');
  const toolbar = document.querySelector('.toolbar');
  
  if (table) table.style.display = 'none';
  if (emptyState) emptyState.style.display = 'none';
  if (pagination) pagination.style.display = 'none';
  if (toolbar) toolbar.style.display = 'none';
  
  // Create lead details container
  const main = document.querySelector('.main');
  
  // Remove existing details if any
  const existingDetails = document.getElementById('leadDetails');
  if (existingDetails) existingDetails.remove();
  
  const detailsContainer = document.createElement('div');
  detailsContainer.id = 'leadDetails';
  detailsContainer.style.cssText = `
    background: #ffffff;
    border-radius: 12px;
    padding: 32px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  `;
  
  // Extract data from lead.data
  const data = lead.data || {};
  
  // Helper function to safely format dates
  function formatDate(dateString) {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Date formatting error:', error, 'for date:', dateString);
      return '-';
    }
  }
  
  detailsContainer.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px;">
      <div>
        <h3 style="color: #1e293b; margin-bottom: 16px; font-size: 1.25rem; font-weight: 600; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">Basic Information</h3>
        <div style="display: grid; gap: 12px;">
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Loan ID:</strong> <span style="color: #1f293b; font-weight: 500;">${lead.loan_id || '-'}</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Name:</strong> <span style="color: #1f293b; font-weight: 500;">${data.name || '-'}</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Mobile:</strong> <span style="color: #1f293b; font-weight: 500;">${data.mobile || '-'}</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Email:</strong> <span style="color: #1f293b; font-weight: 500;">${data.email || '-'}</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">PAN:</strong> <span style="color: #1f293b; font-weight: 500;">${data.pan || '-'}</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Date of Birth:</strong> <span style="color: #1f293b; font-weight: 500;">${data.dob || '-'}</span></div>
        </div>
      </div>
      
      <div>
        <h3 style="color: #1e293b; margin-bottom: 16px; font-size: 1.25rem; font-weight: 600; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">Loan Details</h3>
        <div style="display: grid; gap: 12px;">
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Loan Type:</strong> <span style="color: #1f293b; font-weight: 500;">${lead.loan_type || '-'}</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Loan Amount:</strong> <span style="color: #1f293b; font-weight: 500; color: #059669;">₹${Number(data.loanAmount || 0).toLocaleString('en-IN')}</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Loan Tenure:</strong> <span style="color: #1f293b; font-weight: 500;">${data.loanTenure || '-'} months</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Interest Rate:</strong> <span style="color: #1f293b; font-weight: 500;">${data.interestRate || '-'}%</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">EMI:</strong> <span style="color: #1f293b; font-weight: 500; color: #059669;">₹${Number(data.emi || 0).toLocaleString('en-IN')}</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Stage:</strong> <span style="color: #1f293b; font-weight: 600; color: #3b82f6; background: #eff6ff; padding: 4px 8px; border-radius: 4px;">${lead.stage || data.loanStage || '-'}</span></div>
        </div>
      </div>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px;">
      <div>
        <h3 style="color: #1e293b; margin-bottom: 16px; font-size: 1.25rem; font-weight: 600; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">Address Information</h3>
        <div style="display: grid; gap: 12px;">
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Current Address:</strong> <span style="color: #1f293b; font-weight: 500;">${data.currentAddress || '-'}</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Pincode:</strong> <span style="color: #1f293b; font-weight: 500;">${data.pincode || '-'}</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">District:</strong> <span style="color: #1f293b; font-weight: 500;">${data.district || '-'}</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">State:</strong> <span style="color: #1f293b; font-weight: 500;">${data.state || '-'}</span></div>
        </div>
      </div>
      
      <div>
        <h3 style="color: #1e293b; margin-bottom: 16px; font-size: 1.25rem; font-weight: 600; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">Employment & Income</h3>
        <div style="display: grid; gap: 12px;">
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Employment Type:</strong> <span style="color: #1f293b; font-weight: 500;">${data.employmentType || '-'}</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Company Name:</strong> <span style="color: #1f293b; font-weight: 500;">${data.companyName || '-'}</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Monthly Income:</strong> <span style="color: #1f293b; font-weight: 500; color: #059669;">₹${Number(data.monthlyIncome || 0).toLocaleString('en-IN')}</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Work Experience:</strong> <span style="color: #1f293b; font-weight: 500;">${data.workExperience || '-'} years</span></div>
        </div>
      </div>
    </div>
    
    ${lead.loan_type === 'Car Loan' || lead.loan_type === 'used-car-loan' ? `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px;">
      <div>
        <h3 style="color: #1e293b; margin-bottom: 16px; font-size: 1.25rem; font-weight: 600; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">Vehicle Information</h3>
        <div style="display: grid; gap: 12px;">
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Vehicle Type:</strong> <span style="color: #1f293b; font-weight: 500;">${data.vehicle || '-'}</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">RC Number:</strong> <span style="color: #1f293b; font-weight: 500;">${data.rcNo || '-'}</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Dealer:</strong> <span style="color: #1f293b; font-weight: 500;">${data.caseDealer || '-'}</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Vehicle Value:</strong> <span style="color: #1f293b; font-weight: 500; color: #059669;">₹${Number(data.vehicleValue || 0).toLocaleString('en-IN')}</span></div>
        </div>
      </div>
      
      <div>
        <h3 style="color: #1e293b; margin-bottom: 16px; font-size: 1.25rem; font-weight: 600; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">Bank & DSA</h3>
        <div style="display: grid; gap: 12px;">
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Bank/Finance:</strong> <span style="color: #1f293b; font-weight: 500;">${data.bankFinance || data.loanDsa || '-'}</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">DSA Name:</strong> <span style="color: #1f293b; font-weight: 500;">${data.dsa || '-'}</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Basic Reference:</strong> <span style="color: #1f293b; font-weight: 500;">${data.basicRefNameMobile || '-'}</span></div>
        </div>
      </div>
    </div>
    ` : ''}
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px;">
      <div>
        <h3 style="color: #1e293b; margin-bottom: 16px; font-size: 1.25rem; font-weight: 600; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">System Information</h3>
        <div style="display: grid; gap: 12px;">
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Created:</strong> <span style="color: #1f293b; font-weight: 500;">${formatDate(lead.created_at)}</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Updated:</strong> <span style="color: #1f293b; font-weight: 500;">${formatDate(lead.updated_at)}</span></div>
          <div style="display: flex; justify-content: space-between;"><strong style="color: #374151;">Created By:</strong> <span style="color: #1f293b; font-weight: 500;">User ID ${lead.created_by || '-'}</span></div>
        </div>
      </div>
      
      <div>
        <h3 style="color: #1e293b; margin-bottom: 16px; font-size: 1.25rem; font-weight: 600; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">Actions</h3>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <a href="/used-car-loan.html?loanId=${lead.loan_id}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s ease; border: none; cursor: pointer;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">Edit Lead</a>
          <a href="/view-cases.html" style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s ease; border: none; cursor: pointer;" onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#6b7280'">Back to List</a>
          ${user.role === 'admin' ? `<button onclick="deleteLead('${lead.loan_id}')" style="background: #ef4444; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">Delete Lead</button>` : ''}
        </div>
      </div>
    </div>
  `;
  
  // Insert details after the heading
  if (heading && heading.nextSibling) {
    main.insertBefore(detailsContainer, heading.nextSibling);
  } else {
    main.appendChild(detailsContainer);
  }
}

// Delete lead function (admin only)
async function deleteLead(loanIdToDelete) {
  if (!confirm(`Are you sure you want to delete lead ${loanIdToDelete}?`)) {
    return;
  }
  
  try {
    const response = await fetch(`/api/leads/${loanIdToDelete}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      alert('Lead deleted successfully');
      window.location.href = '/view-cases.html';
    } else {
      alert('Failed to delete lead');
    }
  } catch (error) {
    console.error('Delete error:', error);
    alert('Error deleting lead: ' + error.message);
  }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  console.log('View Lead page loaded, fetching lead data...');
  fetchLead();
});
