const pool = require('../db');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('GET /api/leads error', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch leads' });
    }
  }

  if (req.method === 'POST') {
    try {
      const loanId = Date.now().toString();
      const body = req.body || {};

      await pool.query(
        `INSERT INTO leads (loan_id, loan_type, stage, data)
         VALUES ($1, $2, $3, $4)`,
        [
          loanId,
          body.loanType,
          body.loanStage || 'Lead',
          body
        ]
      );

      return res.status(201).json({ success: true, loanId });
    } catch (err) {
      console.error('POST /api/leads error', err);
      return res.status(500).json({ success: false, error: 'Failed to save lead' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end();
};
