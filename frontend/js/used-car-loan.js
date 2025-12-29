console.log("Used Car Loan JS loaded");

// Auto values
document.getElementById("dateTime").value = new Date().toLocaleString();

// MFG dropdowns
const mfgMonth = document.getElementById("mfgMonth");
const mfgYear = document.getElementById("mfgYear");
const vehicleAgeInput = document.getElementById("vehicleAge");

if (mfgMonth) {
  const monthNames = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  monthNames.forEach((name, index) => {
    const opt = document.createElement("option");
    const monthNumber = String(index + 1).padStart(2, "0");
    opt.value = monthNumber;
    opt.textContent = `${monthNumber} - ${name}`;
    mfgMonth.appendChild(opt);
  });
}

if (mfgYear) {
  for (let y = 2010; y <= 2030; y++) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    mfgYear.appendChild(opt);
  }
}

function updateVehicleAge() {
  if (!mfgMonth || !mfgYear || !vehicleAgeInput) return;
  const monthVal = Number(mfgMonth.value);
  const yearVal = Number(mfgYear.value);

  if (!monthVal || !yearVal) {
    vehicleAgeInput.value = "";
    return;
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  let monthsDiff = (currentYear - yearVal) * 12 + (currentMonth - monthVal);

  if (monthsDiff < 0) {
    vehicleAgeInput.value = "Invalid";
    return;
  }

  const years = Math.floor(monthsDiff / 12);
  const months = monthsDiff % 12;
  const parts = [];
  if (years > 0) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} mo${months > 1 ? "s" : ""}`);
  vehicleAgeInput.value = parts.length ? parts.join(" ") : "Current Month";
}

function updateInsuranceValidity() {
  if (!motorInsuranceExpiry || !motorInsuranceValidity) return;
  const expiryValue = motorInsuranceExpiry.value;
  if (!expiryValue) {
    motorInsuranceValidity.value = "";
    return;
  }

  const expiryDate = new Date(expiryValue);
  const today = new Date();
  expiryDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffMs = expiryDate - today;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (Number.isNaN(diffDays)) {
    motorInsuranceValidity.value = "";
    return;
  }

  motorInsuranceValidity.value = `${diffDays} day${Math.abs(diffDays) === 1 ? "" : "s"}`;
}

if (motorInsuranceExpiry) {
  motorInsuranceExpiry.addEventListener("change", updateInsuranceValidity);
  updateInsuranceValidity();
}

if (mfgMonth && mfgYear) {
  mfgMonth.addEventListener("change", updateVehicleAge);
  mfgYear.addEventListener("change", updateVehicleAge);
}

// Loan tenure dropdown (01 to 96 months)
const loanTenure = document.getElementById("loanTenure");
const emiPaid = document.getElementById("emiPaid");
for (let t = 1; t <= 96; t++) {
  const padded = String(t).padStart(2, "0");
  if (loanTenure) {
    const opt = document.createElement("option");
    opt.value = padded;
    opt.textContent = padded;
    loanTenure.appendChild(opt);
  }
  if (emiPaid) {
    const opt2 = document.createElement("option");
    opt2.value = padded;
    opt2.textContent = padded;
    emiPaid.appendChild(opt2);
  }
}

// Show BT-specific fields when type is BT Topup or Int BT
const loanTypeSelect = document.getElementById("loanType");
const btFields = document.getElementById("btFields");
const btInputs = document.querySelectorAll("[data-bt-required='true']");
const dsaSelect = document.getElementById("loanDsa");
const dsaCodeField = document.getElementById("dsaCodeField");
const dsaCodeInput = document.getElementById("loanDsaCode");
const maritalStatus = document.getElementById("MaritalStatus");
const spouseNameField = document.getElementById("spouseNameField");
const spouseNameInput = document.getElementById("spouseName");
const addAltNoBtn = document.getElementById("addAltNoBtn");
const extraAltMobile = document.getElementById("extraAltMobile");
const cibilDisplay = document.getElementById("cibilDisplay");
const cibilPromptBtn = document.getElementById("cibilPromptBtn");
const cibilScoreInput = document.getElementById("cibilScore");
const cibilIndicatorInput = document.getElementById("cibilIndicator");
const cibilColorButtons = document.querySelectorAll(".cibil-color-btn");
const cibilToggleBtn = document.getElementById("cibilToggleBtn");
const cibilDetailsSection = document.getElementById("cibilDetails");
const motorInsuranceFields = document.getElementById("motorInsuranceFields");
const addAdditionalApplicantBtn = document.getElementById("addAdditionalApplicantBtn");
const additionalApplicantsContainer = document.getElementById("additionalApplicantsContainer");
let additionalApplicantCount = 0;
const MAX_ADDITIONAL_APPLICANTS = 2;

function updateCibilDisplay(score) {
  if (!cibilDisplay) return;
  if (score) {
    cibilDisplay.textContent = `Score: ${score}`;
  } else {
    cibilDisplay.textContent = "Not Entered";
  }
}

function setCibilIndicator(color) {
  if (!cibilDisplay || !cibilIndicatorInput) return;
  cibilDisplay.classList.remove("red", "yellow", "green");
  cibilColorButtons.forEach((btn) => btn.classList.remove("active"));
  if (color) {
    cibilDisplay.classList.add(color);
    cibilIndicatorInput.value = color;
    const activeBtn = Array.from(cibilColorButtons).find(
      (btn) => btn.dataset.color === color
    );
    if (activeBtn) activeBtn.classList.add("active");
  } else {
    cibilIndicatorInput.value = "";
  }
}

if (cibilPromptBtn && cibilScoreInput) {
  cibilPromptBtn.addEventListener("click", () => {
    const current = cibilScoreInput.value || "";
    const value = prompt("Enter CIBIL Score", current);
    if (value === null) return;
    const trimmed = value.trim();
    cibilScoreInput.value = trimmed;
    updateCibilDisplay(trimmed);
  });
  updateCibilDisplay(cibilScoreInput.value);
}

if (cibilColorButtons.length) {
  cibilColorButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const color = btn.dataset.color;
      setCibilIndicator(color);
    });
  });
  setCibilIndicator(cibilIndicatorInput?.value || "");
}

if (cibilToggleBtn && cibilDetailsSection) {
  const updateToggleUi = () => {
    const isOpen = !cibilDetailsSection.classList.contains("hidden");
    cibilToggleBtn.setAttribute("aria-expanded", isOpen);
    cibilToggleBtn.textContent = isOpen ? "−" : "+";
    cibilToggleBtn.classList.toggle("plus-state", !isOpen);
    cibilToggleBtn.classList.toggle("minus-state", isOpen);
  };

  cibilToggleBtn.addEventListener("click", () => {
    cibilDetailsSection.classList.toggle("hidden");
    updateToggleUi();
  });

  updateToggleUi();
}

function toggleBtFields() {
  const isBt =
    loanTypeSelect &&
    (loanTypeSelect.value === "BT Topup" || loanTypeSelect.value === "Int BT");
  if (btFields) {
    btFields.classList.toggle("hidden", !isBt);
  }
  btInputs.forEach((input) => {
    input.required = !!isBt;
    if (!isBt) input.value = "";
  });
}

if (loanTypeSelect) {
  loanTypeSelect.addEventListener("change", toggleBtFields);
  toggleBtFields();
}

function toggleDsaCode() {
  const showCode = dsaSelect && dsaSelect.value === "Others";
  if (dsaCodeField) {
    dsaCodeField.classList.toggle("hidden", !showCode);
  }
  if (dsaCodeInput) {
    dsaCodeInput.required = !!showCode;
    if (!showCode) dsaCodeInput.value = "";
  }
}

if (dsaSelect) {
  dsaSelect.addEventListener("change", toggleDsaCode);
  toggleDsaCode();
}

function toggleSpouseField() {
  const needsSpouse = maritalStatus && maritalStatus.value === "Married";
  if (spouseNameField) {
    spouseNameField.classList.toggle("hidden", !needsSpouse);
  }
  if (spouseNameInput) {
    spouseNameInput.required = !!needsSpouse;
    if (!needsSpouse) spouseNameInput.value = "";
  }
}

if (maritalStatus) {
  maritalStatus.addEventListener("change", toggleSpouseField);
  toggleSpouseField();
}

if (addAltNoBtn && extraAltMobile) {
  addAltNoBtn.addEventListener("click", () => {
    const isHidden = extraAltMobile.classList.contains("hidden");
    extraAltMobile.classList.toggle("hidden", !isHidden);
    const nowHidden = extraAltMobile.classList.contains("hidden");
    addAltNoBtn.textContent = nowHidden ? "+" : "−";
    addAltNoBtn.classList.toggle("plus-state", nowHidden);
    addAltNoBtn.classList.toggle("minus-state", !nowHidden);
    addAltNoBtn.setAttribute(
      "aria-label",
      nowHidden ? "Add alternate number" : "Remove alternate number"
    );
    if (isHidden) {
      extraAltMobile.focus();
    } else {
      extraAltMobile.value = "";
    }
  });
}

function createAdditionalApplicantBlock(index) {
  const block = document.createElement("div");
  block.className = "additional-applicant-block";
  block.id = `additionalApplicant${index}`;
  block.innerHTML = `
    <div class="additional-applicant-header">
      <h4>Applicant ${index}</h4>
      <button type="button" class="icon-btn minus-state compact remove-additional-applicant" data-target="${index}" aria-label="Remove applicant ${index}">− Remove</button>
    </div>
    <div class="sub-section">
      <h5>Applicant Profile</h5>
      <div class="grid">
        <select id="additionalApplicant${index}Type">
          <option value="">APPLICANT TYPE *</option>
          ${index === 3 ? '<option value="Guarantor">Guarantor</option>' : '<option value="Co-Applicant">Co-Applicant</option><option value="Guarantor">Guarantor</option>'}
        </select>
        <select id="additionalApplicant${index}Relation">
          <option value="">APPLICANT RELATION</option>
          <option>Spouse</option>
          <option>Father</option>
          <option>Mother</option>
          <option>Brother</option>
          <option>Sister</option>
          <option>Son</option>
          <option>Daughter</option>
          <option>Grand Father</option>
          <option>Grand Mother</option>
          <option>Friend</option>
          <option>Relative</option>
        </select>
        <input id="additionalApplicant${index}Name" placeholder="NAME *" data-uppercase />
        <select id="additionalApplicant${index}Gender">
          <option value="">GENDER *</option>
          <option>Male</option>
          <option>Female</option>
          <option>Rather Not To Say</option>
        </select>
        <input id="additionalApplicant${index}Pan" placeholder="PAN NO" />
        <input id="additionalApplicant${index}Mobile" placeholder="MOBILE NO" />
        <input id="additionalApplicant${index}Email" type="email" placeholder="EMAIL ID" />
        <select id="additionalApplicant${index}MaritalStatus">
          <option value="">MARITAL STATUS</option>
          <option>Single</option>
          <option>Married</option>
          <option>Divorced</option>
        </select>
        <input id="additionalApplicant${index}FatherName" placeholder="FATHER NAME" data-uppercase />
        <input id="additionalApplicant${index}MotherName" placeholder="MOTHER NAME" data-uppercase />
      </div>
    </div>
    <div class="sub-section">
      <h5>Current Address</h5>
      <div class="grid">
        <select id="additionalApplicant${index}CurrentProof">
          <option value="">ADDRESS PROOF *</option>
          <option>Aadhaar</option>
          <option>Voter ID</option>
          <option>Gas Bill</option>
          <option>EB Bill</option>
          <option>Tax Paid Receipt</option>
          <option>Rent Agreements</option>
        </select>
        <input id="additionalApplicant${index}CurrentLandmark" placeholder="LAND MARK" />
        <input id="additionalApplicant${index}CurrentPincode" placeholder="PIN CODE" />
        <input id="additionalApplicant${index}CurrentDistrict" placeholder="DISTRICT" />
            <select
      id="additionalApplicant${index}CurrentPinDropdown"
      class="hidden"
      style="grid-column: span 2;"
    >
      <option value="">Select PIN</option>
    </select>
        <select id="additionalApplicant${index}CurrentRelation">
          <option value="">OHP OWNER RELATION *</option>
          <option>SPOUSE</option>
          <option>SELF-OWNED</option>
          <option>PARANTEL</option>
          <option>RENTED</option>
        </select>
      </div>
    </div>
    <div class="sub-section">
  <h5>Permanent Address</h5>
  <div class="grid">
    <select id="additionalApplicant${index}PermanentProof">
      <option value="">ADDRESS PROOF *</option>
      <option>Aadhaar</option>
      <option>Voter ID</option>
      <option>Gas Bill</option>
      <option>EB Bill</option>
      <option>Tax Paid Receipt</option>
      <option>Rent Agreements</option>
    </select>

    <input
      id="additionalApplicant${index}PermanentLandmark"
      placeholder="LAND MARK"
    />

    <input
      id="additionalApplicant${index}PermanentPincode"
      placeholder="PIN CODE"
    />

    <input
      id="additionalApplicant${index}PermanentDistrict"
      placeholder="DISTRICT"
    />

    <select
      id="additionalApplicant${index}PermanentPinDropdown"
      class="hidden"
      style="grid-column: span 2;"
    >
      <option value="">Select PIN</option>
    </select>

    <select id="additionalApplicant${index}PermanentRelation">
      <option value="">OHP OWNER RELATION *</option>
      <option>SPOUSE</option>
      <option>SELF-OWNED</option>
      <option>PARANTEL</option>
      <option>RENTED</option>
    </select>
  </div>
</div>

    <div class="sub-section">
      <h5>Employment & Office</h5>
      <div class="grid">
        <select id="additionalApplicant${index}EmploymentProfile">
          <option value="">CUSTOMER PROFILE *</option>
          <option>Self-Employed</option>
          <option>Salaried</option>
          <option>ITR</option>
          <option>Agriculture</option>
          <option>Pension</option>
        </select>
        <input id="additionalApplicant${index}BusinessName" placeholder="BUSINESS / OFFICE / DESIGNATION NAME" />
        <input id="additionalApplicant${index}MonthlyIncome" type="number" placeholder="MONTHLY INCOME" />
        <select id="additionalApplicant${index}BusinessProof">
          <option value="">BUSINESS PROOF *</option>
          <option>NIP</option>
          <option>Pay slips</option>
          <option>RTC</option>
          <option>GST</option>
          <option>ITR</option>
          <option>License</option>
          <option>Pension Statements</option>
        </select>
        <textarea id="additionalApplicant${index}OfficeAddress" placeholder="FULL ADDRESS" style="grid-column: span 3;"></textarea>
      </div>
    </div>
    <div class="sub-section">
      <h5>Ref Contact</h5>
      <div class="grid" style="grid-template-columns: repeat(2, 1fr);">
        <input id="additionalApplicant${index}RefMob1" placeholder="MOBILE NO" />
        <input id="additionalApplicant${index}RefName1" placeholder="NAME" data-uppercase />
        <input id="additionalApplicant${index}RefMob2" placeholder="MOBILE NO" />
        <input id="additionalApplicant${index}RefName2" placeholder="NAME" data-uppercase />
      </div>
    </div>
  `;
  return block;
}

function initializeAdditionalApplicants() {
  if (!addAdditionalApplicantBtn || !additionalApplicantsContainer) return;

  addAdditionalApplicantBtn.addEventListener("click", () => {
    if (!additionalApplicantsContainer) return;
    const existingCount = additionalApplicantsContainer.querySelectorAll('.additional-applicant-block').length;
    if (existingCount >= MAX_ADDITIONAL_APPLICANTS) return;

    // Visible applicant numbers should be 2 and 3 (primary applicant is 1)
    const visibleIndex = existingCount + 2;
    const block = createAdditionalApplicantBlock(visibleIndex);
    additionalApplicantsContainer.appendChild(block);
    initAdditionalApplicantPin(visibleIndex);

    const nameInput = block.querySelector("[id$='Name']");
if (nameInput) nameInput.required = false;

    block.scrollIntoView({ behavior: "smooth", block: "center" });

    // Disable add button when max reached
    const newCount = additionalApplicantsContainer.querySelectorAll('.additional-applicant-block').length;
    if (newCount >= MAX_ADDITIONAL_APPLICANTS) {
      addAdditionalApplicantBtn.disabled = true;
      addAdditionalApplicantBtn.style.opacity = '0.5';
      addAdditionalApplicantBtn.style.cursor = 'not-allowed';
    }
  });

  additionalApplicantsContainer.addEventListener("click", (event) => {
    const removeBtn = event.target.closest(".remove-additional-applicant");
    if (!removeBtn) return;
    const block = removeBtn.closest(".additional-applicant-block");
    if (block) {
      block.remove();

      // Re-enable add button if below max
      const newCount = additionalApplicantsContainer.querySelectorAll('.additional-applicant-block').length;
      if (newCount < MAX_ADDITIONAL_APPLICANTS) {
        addAdditionalApplicantBtn.disabled = false;
        addAdditionalApplicantBtn.style.opacity = '1';
        addAdditionalApplicantBtn.style.cursor = 'pointer';
      }
    }
  });
}

initializeAdditionalApplicants();

// Copy Permanent = Current
const copyPermanentCheckbox = document.getElementById("copyPermanentFromCurrent");
const currentAddressFields = {
  proof: document.getElementById("currentAddressProof"),
  landmark: document.getElementById("currentLandmark"),
  pincode: document.getElementById("currentPincode"),
  district: document.getElementById("currentDistrict"),
  relation: document.getElementById("currentOhpRelation")
};
const permanentAddressFields = {
  proof: document.getElementById("permanentAddressProof"),
  landmark: document.getElementById("permanentLandmark"),
  pincode: document.getElementById("permanentPincode"),
  district: document.getElementById("permanentDistrict"),
  relation: document.getElementById("permanentOhpRelation")
};

let savedPermanentValues = null;

function copyFromCurrent() {
  permanentAddressFields.proof.value = currentAddressFields.proof.value;
  permanentAddressFields.landmark.value = currentAddressFields.landmark.value;
  permanentAddressFields.pincode.value = currentAddressFields.pincode.value;
  if (permanentAddressFields.district && currentAddressFields.district) {
    permanentAddressFields.district.value = currentAddressFields.district.value;
  }
  permanentAddressFields.relation.value = currentAddressFields.relation.value;
}

function clearPermanent() {
  permanentAddressFields.proof.value = "";
  permanentAddressFields.landmark.value = "";
  permanentAddressFields.pincode.value = "";
  if (permanentAddressFields.district) permanentAddressFields.district.value = "";
  permanentAddressFields.relation.value = "";
}

if (copyPermanentCheckbox) {
  copyPermanentCheckbox.addEventListener("change", (e) => {
    if (e.target.checked) {
      savedPermanentValues = {
        proof: permanentAddressFields.proof.value,
        landmark: permanentAddressFields.landmark.value,
        pincode: permanentAddressFields.pincode.value,
        district: permanentAddressFields.district?.value,
        relation: permanentAddressFields.relation.value
      };
      copyFromCurrent();
    } else {
      if (savedPermanentValues) {
        permanentAddressFields.proof.value = savedPermanentValues.proof;
        permanentAddressFields.landmark.value = savedPermanentValues.landmark;
        permanentAddressFields.pincode.value = savedPermanentValues.pincode;
        if (permanentAddressFields.district) permanentAddressFields.district.value = savedPermanentValues.district || "";
        permanentAddressFields.relation.value = savedPermanentValues.relation;
      } else {
        clearPermanent();
      }
      savedPermanentValues = null;
    }
  });
}

// Disbursed Logic
const loanStage = document.getElementById("loanStage");
const disbursedFields = document.getElementById("disbursedFields");
const disbursedTenure = document.getElementById("disbursedTenure");
const disbursedEmiDate = document.getElementById("disbursedEmiDate");

// Populate Disbursed Tenure (1-96)
if (disbursedTenure) {
  for (let i = 1; i <= 96; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = i;
    disbursedTenure.appendChild(opt);
  }
}

// Populate Disbursed EMI Date (1-31)
if (disbursedEmiDate) {
  for (let i = 1; i <= 31; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = i;
    disbursedEmiDate.appendChild(opt);
  }
}

// Toggle Disbursed Fields
const utrFields = document.getElementById("utrFields");
const addPaymentBtn = document.getElementById("addPaymentBtn");
const removePaymentBtn = document.getElementById("removePaymentBtn");
const paymentContainer = document.getElementById("paymentContainer");
let paymentCount = 0;
const MAX_PAYMENTS = 5;

function toggleDisbursedFields() {
  if (loanStage && disbursedFields) {
    const isDisbursed = loanStage.value === "Disbursed";
    disbursedFields.classList.toggle("hidden", !isDisbursed);
    
    // Toggle UTR fields
    if (utrFields) {
      utrFields.classList.toggle("hidden", !isDisbursed);
      
      // Auto-fill UTR Date if Disbursed and empty
      const utrDateInput = document.getElementById("utrDate1");
      if (isDisbursed && utrDateInput && !utrDateInput.value) {
         const today = new Date().toISOString().split('T')[0];
         utrDateInput.value = today;
      }
    }

    if (motorInsuranceFields) {
      motorInsuranceFields.classList.toggle("hidden", !isDisbursed);
    }

    // Toggle required for disbursed fields if necessary
    const requiredInputs = disbursedFields.querySelectorAll("input:not([readonly]), select");
    requiredInputs.forEach(input => {
      input.required = isDisbursed;
    });

    // Auto-fill Date if Disbursed and empty
    const disbursedDateInput = document.getElementById("disbursedDate");
    if (isDisbursed && disbursedDateInput && !disbursedDateInput.value) {
      const today = new Date().toISOString().split('T')[0];
      disbursedDateInput.value = today;
    }
  }
}

// Payment Add/Remove Logic
if (addPaymentBtn && removePaymentBtn && paymentContainer) {
  addPaymentBtn.addEventListener("click", () => {
    if (paymentCount >= MAX_PAYMENTS) return;
    
    paymentCount++;
    const newBlock = createPaymentBlock(paymentCount);
    paymentContainer.appendChild(newBlock);
    updatePaymentButtons();
  });
  
  removePaymentBtn.addEventListener("click", () => {
    if (paymentCount <= 0) return;
    
    const blockToRemove = document.getElementById(`paymentBlock${paymentCount}`);
    if (blockToRemove) {
      blockToRemove.remove();
      paymentCount--;
    }
    
    updatePaymentButtons();
  });
}

function createPaymentBlock(index) {
  const block = document.createElement("div");
  block.className = "payment-block";
  block.id = `paymentBlock${index}`;
  block.style.marginTop = index === 1 ? "0" : "20px";
  block.style.borderTop = index === 1 ? "none" : "1px solid #eee";
  block.style.paddingTop = index === 1 ? "0" : "15px";
  block.innerHTML = `
      <h4 style="margin-bottom: 10px; color: #555;">Payment ${index}</h4>
      <div class="grid">
        <input id="utrDate${index}" type="date" title="DATE" />
        <input id="utrAmount${index}" type="number" placeholder="AMOUNT" />
        <input id="utrNo${index}" placeholder="UTR NO" data-uppercase />
        <input id="utrAcHolderName${index}" placeholder="AC HOLDER NAME" data-uppercase />
        <input id="utrBankName${index}" placeholder="BANK NAME" data-uppercase />
        <input id="utrAcNo${index}" placeholder="AC NO" />
        <input id="utrIfsc${index}" placeholder="IFSC" data-uppercase />
        <input id="utrRemarks${index}" placeholder="REMARKS" />
      </div>
    `;

  const dateInput = block.querySelector(`#utrDate${index}`);
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }

  return block;
}

function updatePaymentButtons() {
  if (!removePaymentBtn || !addPaymentBtn) return;
  
  // Show remove button if at least 1 payment
  removePaymentBtn.classList.toggle("hidden", paymentCount <= 0);
  
  // Disable/Hide add button if max reached (optional, or just disable)
  if (paymentCount >= MAX_PAYMENTS) {
    addPaymentBtn.disabled = true;
    addPaymentBtn.style.opacity = "0.5";
    addPaymentBtn.style.cursor = "not-allowed";
  } else {
    addPaymentBtn.disabled = false;
    addPaymentBtn.style.opacity = "1";
    addPaymentBtn.style.cursor = "pointer";
  }
}

if (loanStage) {
  loanStage.addEventListener("change", toggleDisbursedFields);
  toggleDisbursedFields(); // Run on load
}

// Auto Calculations
const calcFields = {
  sanction: document.getElementById("disbursedSanctionLoanAmount"),
  loanIns: document.getElementById("disbursedLoanInsuranceCharges"),
  motorIns: document.getElementById("disbursedMotorInsurance"),
  pf: document.getElementById("disbursedPfCharges"),
  doc: document.getElementById("disbursedDocumentationCharges"),
  other: document.getElementById("disbursedOtherCharges"),
  rto: document.getElementById("disbursedRtoCharges"),
  challan: document.getElementById("disbursedChallanFineCharges"),
  total: document.getElementById("disbursedTotalLoanAmount"),
  net: document.getElementById("disbursedNetLoanAmount")
};

function calculateDisbursedAmounts() {
  const getVal = (el) => Number(el?.value) || 0;

  const sanction = getVal(calcFields.sanction);
  const loanIns = getVal(calcFields.loanIns);
  const motorIns = getVal(calcFields.motorIns);
  
  // Total Loan Amount = Sanction + Loan Ins + Motor Ins
  if (calcFields.total) {
    calcFields.total.value = sanction + loanIns + motorIns;
  }

  const pf = getVal(calcFields.pf);
  const doc = getVal(calcFields.doc);
  const other = getVal(calcFields.other);
  const rto = getVal(calcFields.rto);
  const challan = getVal(calcFields.challan);

  // Net Loan Amount = Sanction - PF - Doc - Other - RTO - Challan
  if (calcFields.net) {
    calcFields.net.value = sanction - pf - doc - other - rto - challan;
  }
}

// Attach listeners
Object.values(calcFields).forEach(el => {
  if (el && !el.readOnly) {
    el.addEventListener("input", calculateDisbursedAmounts);
  }
});

// Submit
document.getElementById("leadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
// ####

  if (loanStage && loanStage.value === "Disbursed") {
    toggleDisbursedFields();
  }

  const leadData = {};
  document.querySelectorAll("input, select, textarea").forEach(el => {
    // For the hidden RTO Docs input, we ensure we get the value
    if (el.type !== 'submit' && el.id) {
       leadData[el.id] = el.value;
    }
  });
  // ================================
// ✅ COLLECT UTR PAYMENTS
// ================================
leadData.payments = [];

document.querySelectorAll(".payment-block").forEach(block => {
  const payment = {};

  block.querySelectorAll("input").forEach(input => {
    if (input.id) {
      payment[input.id] = input.value;
    }
  });

  if (Object.values(payment).some(v => v && v.trim() !== "")) {
    leadData.payments.push(payment);
  }
});

// 🔍 Optional but recommended (debug once)

console.log("SUBMIT DATA", leadData);

  leadData.loanType = "Used Car Loan";



  
    // Optional Additional Applicants
leadData.additionalApplicants = [];

document.querySelectorAll(".additional-applicant-block").forEach((block, index) => {
  const applicant = {};
  block.querySelectorAll("input, select, textarea").forEach(el => {
    if (el.id) applicant[el.id] = el.value;
  });

  // only store if user filled something
  if (Object.values(applicant).some(v => v && v.trim() !== "")) {
    leadData.additionalApplicants.push(applicant);
  }
});

// ================================
// ✅ COLLECT UTR PAYMENTS
// ================================
leadData.payments = [];

document.querySelectorAll(".payment-block").forEach(block => {
  const payment = {};

  block.querySelectorAll("input").forEach(input => {
    if (input.id) {
      payment[input.id] = input.value;
    }
  });

  if (Object.values(payment).some(v => v && v.trim() !== "")) {
    leadData.payments.push(payment);
  }
});

// 🔍 Optional but recommended (debug once)
console.log("FINAL SUBMIT DATA", leadData);

  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(leadData)
  });

  if (res.ok) {
    window.location.href = "/view-cases.html";
  } else {
    alert("Failed to save lead");
  }
});

// --- RTO Documents Multi-Select Logic ---
const rtoOptions = [
  "RC CARD",
  "INSURANCE",
  "FORM SET 29/30",
  "FORM 34",
  "EMMISION COPY",
  "CC",
  "FORCLOSURE LETTER",
  "LOAN CLOSURE PROOF",
  "B-EXTRACT",
  "NOC",
  "SELLER KYC",
  "PAYMENT (D/A) KYC"
];

const rtoDisplay = document.getElementById("rtoDocsDisplay");
const rtoDropdown = document.getElementById("rtoDocsDropdown");
const rtoHiddenInput = document.getElementById("disbursedRtoDocs");
let selectedRtoDocs = [];

function renderRtoDropdown() {
  if (!rtoDropdown) return;
  rtoDropdown.innerHTML = "";
  rtoOptions.forEach(opt => {
    const div = document.createElement("div");
    div.className = "multi-select-option";
    if (selectedRtoDocs.includes(opt)) {
      div.classList.add("selected");
    }
    div.textContent = opt;
    div.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent closing dropdown
      toggleRtoOption(opt);
    });
    rtoDropdown.appendChild(div);
  });
}

function updateRtoDisplay() {
  if (!rtoDisplay) return;
  rtoDisplay.innerHTML = "";
  
  if (selectedRtoDocs.length === 0) {
    rtoDisplay.innerHTML = '<span class="multi-select-placeholder">Select RTO Documents...</span>';
  } else {
    selectedRtoDocs.forEach(opt => {
      const tag = document.createElement("span");
      tag.className = "multi-select-tag";
      tag.textContent = opt;
      // Optional: Add a remove 'x'
      const removeBtn = document.createElement("span");
      removeBtn.textContent = "×";
      removeBtn.style.cursor = "pointer";
      removeBtn.style.marginLeft = "4px";
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleRtoOption(opt);
      });
      tag.appendChild(removeBtn);
      rtoDisplay.appendChild(tag);
    });
  }
  
  // Update hidden input
  if (rtoHiddenInput) {
    rtoHiddenInput.value = selectedRtoDocs.join(", ");
  }
}

function toggleRtoOption(opt) {
  if (selectedRtoDocs.includes(opt)) {
    selectedRtoDocs = selectedRtoDocs.filter(item => item !== opt);
  } else {
    selectedRtoDocs.push(opt);
  }
  renderRtoDropdown();
  updateRtoDisplay();
}

// Initialize
if (rtoDisplay && rtoDropdown) {
  renderRtoDropdown();
  
  rtoDisplay.addEventListener("click", (e) => {
    e.stopPropagation();
    rtoDropdown.classList.toggle("active");
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!rtoDisplay.contains(e.target) && !rtoDropdown.contains(e.target)) {
      rtoDropdown.classList.remove("active");
    }
  });
}
// today 11/06
const params = new URLSearchParams(window.location.search);
const loanId = params.get("loanId");

if (loanId) {
  fetch(`/api/leads/${loanId}`)
    .then(res => res.json())
    .then(lead => {
      const data = lead.data;
      // ####
      // =========================
      // ✅ Restore UTR Payments (EDIT)
      // =========================
      if (Array.isArray(data.payments)) {
        data.payments.forEach((payment, index) => {
          const block = createPaymentBlock(index + 1);
          paymentContainer.appendChild(block);

          Object.keys(payment).forEach(key => {
            const el = document.getElementById(key);
            if (el) el.value = payment[key];
          });

          paymentCount = index + 1;
        });

        updatePaymentButtons();
      }

      // =========================
      // 1️⃣ Restore normal fields
      // =========================
      Object.keys(data).forEach(key => {
        const el = document.getElementById(key);
        if (el) el.value = data[key];
      });

      // =========================
      // 2️⃣ Restore CIBIL UI
      // =========================
      updateCibilDisplay(data.cibilScore);
      setCibilIndicator(data.cibilIndicator);
      // =========================
      // 3️⃣ FORCE Disbursed fields to show on edit
      // =========================
      if (loanStage && loanStage.value === "Disbursed") {
        toggleDisbursedFields();
      }

      // =========================
      // 4️⃣ Restore RTO Documents
      // =========================
      if (data.disbursedRtoDocs) {
        selectedRtoDocs = data.disbursedRtoDocs
          .split(",")
          .map(v => v.trim())
          .filter(Boolean);

        renderRtoDropdown();
        updateRtoDisplay();
      }

      // =========================
      // 3️⃣ Restore Additional Applicants
      // =========================
      if (Array.isArray(data.additionalApplicants)) {
        data.additionalApplicants.forEach((applicant, idx) => {
          if (idx >= MAX_ADDITIONAL_APPLICANTS) return;

          const visibleIndex = idx + 2;
          const block = createAdditionalApplicantBlock(visibleIndex);
          additionalApplicantsContainer.appendChild(block);
          initAdditionalApplicantPin(visibleIndex);

          Object.keys(applicant).forEach(key => {
            const el = block.querySelector(`#${key}`);
            if (el) el.value = applicant[key];
          });
        });

        if (data.additionalApplicants.length >= MAX_ADDITIONAL_APPLICANTS) {
          addAdditionalApplicantBtn.disabled = true;
          addAdditionalApplicantBtn.style.opacity = "0.5";
        }
      }
    })
    .catch(err => {
      console.error("Failed to load lead", err);
    });
}


// ####






// ===== PIN ↔ DISTRICT REUSABLE MODULE =====

const PIN_API = "https://api.postalpincode.in";

// simple loader
function setLoading(input, loading) {
  input.style.background = loading ? "#f3f5f8" : "";
}

// debounce helper
function debounce(fn, delay = 500) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function show(el) { el && el.classList.remove("hidden"); }
function hide(el) { el && el.classList.add("hidden"); }

// PIN → District
async function handlePinToDistrict(pinInput, districtInput, dropdown) {
  const pin = pinInput.value.trim();
  if (!/^\d{6}$/.test(pin)) return;

  setLoading(pinInput, true);

  try {
    const res = await fetch(`${PIN_API}/pincode/${pin}`);
    const data = await res.json();

    if (data[0].Status === "Success") {
      districtInput.value = data[0].PostOffice[0].District;
      hide(dropdown);
    } else {
      districtInput.value = "";
      alert("Invalid PIN code");
    }
  } catch (e) {
    console.error("PIN lookup failed", e);
  } finally {
    setLoading(pinInput, false);
  }
}

// District → PIN dropdown
async function handleDistrictToPin(districtInput, pinInput, dropdown) {
  const district = districtInput.value.trim();
  if (!district) return;

  setLoading(districtInput, true);

  try {
    const res = await fetch(`${PIN_API}/postoffice/${district}`);
    const data = await res.json();

    if (data[0].Status !== "Success") {
      hide(dropdown);
      alert("Invalid District");
      return;
    }

    dropdown.innerHTML = `<option value="">Select PIN</option>`;
    data[0].PostOffice.forEach(po => {
      const opt = document.createElement("option");
      opt.value = po.Pincode;
      opt.textContent = `${po.Pincode} – ${po.Name}`;
      dropdown.appendChild(opt);
    });

    show(dropdown);
  } catch (e) {
    console.error("District lookup failed", e);
  } finally {
    setLoading(districtInput, false);
  }
}

// Attach logic to any address block
function initPinDistrict({ pinId, districtId, dropdownId }) {
  const pin = document.getElementById(pinId);
  const district = document.getElementById(districtId);
  const dropdown = document.getElementById(dropdownId);

  if (!pin || !district || !dropdown) return;

  pin.addEventListener(
    "blur",
    debounce(() => handlePinToDistrict(pin, district, dropdown))
  );

  district.addEventListener(
    "blur",
    debounce(() => handleDistrictToPin(district, pin, dropdown))
  );

  dropdown.addEventListener("change", () => {
    if (dropdown.value) {
      pin.value = dropdown.value;
      hide(dropdown);
    }
  });
}

initPinDistrict({
  pinId: "currentPincode",
  districtId: "currentDistrict",
  dropdownId: "currentPinDropdown"
});

initPinDistrict({
  pinId: "permanentPincode",
  districtId: "permanentDistrict",
  dropdownId: "permanentPinDropdown"
});

function initAdditionalApplicantPin(index) {
  initPinDistrict({
    pinId: `additionalApplicant${index}CurrentPincode`,
    districtId: `additionalApplicant${index}CurrentDistrict`,
    dropdownId: `additionalApplicant${index}CurrentPinDropdown`
  });

  initPinDistrict({
    pinId: `additionalApplicant${index}PermanentPincode`,
    districtId: `additionalApplicant${index}PermanentDistrict`,
    dropdownId: `additionalApplicant${index}PermanentPinDropdown`
  });
}
// initAdditionalApplicantPin(visibleIndex);

