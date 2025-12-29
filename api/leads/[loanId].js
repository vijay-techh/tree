const pool = require('../db');

module.exports = async (req, res) => {
  const { loanId } = req.query || {};

  if (!loanId) return res.status(400).json({ error: 'Missing loanId' });

  if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM leads WHERE loan_id = $1', [loanId]);
      if (result.rows.length === 0) return res.status(404).json({ success: false });
      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('GET /api/leads/:loanId error', err);
      return res.status(500).json({ success: false });
    }
  }

  if (req.method === 'PUT') {
    try {
      const body = req.body || {};
      await pool.query(
        `UPDATE leads SET stage = $1, data = $2 WHERE loan_id = $3`,
        [body.loanStage || 'Lead', body, loanId]
      );
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('PUT /api/leads/:loanId error', err);
      return res.status(500).json({ success: false });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const result = await pool.query('DELETE FROM leads WHERE loan_id = $1', [loanId]);
      if (result.rowCount === 0) return res.status(404).json({ success: false, error: 'Not found' });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('DELETE /api/leads/:loanId error', err);
      return res.status(500).json({ success: false });
    }
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  res.status(405).end();
};
