const express = require("express");
const path = require("path");
const cors = require("cors");
require('dotenv').config();

const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const FRONTEND_PATH = path.join(__dirname, "../frontend");
app.use(express.static(FRONTEND_PATH));

/* LOGIN (TEMP) */
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "user" && password === "1234") {
    return res.json({ success: true });
  }
  res.status(401).json({ success: false });
});

let lastLoanNumber = 0;
let lastYearMonth = "";

// function generateLoanId() {
//   const now = new Date();
//   const yearMonth =
//     now.getFullYear().toString() +
//     String(now.getMonth() + 1).padStart(2, "0");

//   if (lastYearMonth !== yearMonth) {
//     lastLoanNumber = 0;
//     lastYearMonth = yearMonth;
//   }

//   lastLoanNumber += 1;

//   return `${yearMonth}${String(lastLoanNumber).padStart(2, "0")}`;
// }
app.get("/api/next-loan-id", (req, res) => {
  res.json({ loanId: generateLoanId() });
});
function generateLoanId() {
  return Date.now().toString(); // temporary, always unique
}

/* CREATE LEAD (ALL LOANS) */
app.post("/api/leads", async (req, res) => {
  try {
const loanId = generateLoanId();

    console.log("INSERT DATA:", loanId, req.body.loanType);

    await pool.query(
      `INSERT INTO leads (loan_id, loan_type, stage, data)
       VALUES ($1, $2, $3, $4)`,
      [
        loanId,
        req.body.loanType,
        req.body.loanStage || "Lead",
        req.body
      ]
    );

    return res.status(201).json({
      success: true,
      loanId
    });

  } catch (err) {
    console.error("INSERT ERROR:", err);

    return res.status(500).json({
      success: false,
      error: "Failed to save lead"
    });
  }
});

// today 11:36 am
app.get("/api/leads/:loanId", async (req, res) => {
  const { loanId } = req.params;

  const result = await pool.query(
    "SELECT * FROM leads WHERE loan_id = $1",
    [loanId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false });
  }

  res.json(result.rows[0]);
});

app.put("/api/leads/:loanId", async (req, res) => {
  const { loanId } = req.params;

  await pool.query(
    `UPDATE leads
     SET stage = $1,
         data = $2
     WHERE loan_id = $3`,
    [
      req.body.loanStage || "Lead",
      req.body,
      loanId
    ]
  );

  res.json({ success: true });
});



/* GET ALL */
app.get("/api/leads", async (_, res) => {
  const result = await pool.query(
    "SELECT * FROM leads ORDER BY created_at DESC"
  );
  res.json(result.rows);
});

app.listen(3000, () =>
  console.log("🚀 WheelsWeb running at http://localhost:3000")
);
console.log("DB URL:", process.env.DATABASE_URL);
pool.query('select 1')
  .then(() => console.log('✅ DB connected'))
  .catch(err => console.error('❌ DB error', err));
