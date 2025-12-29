const fetch = global.fetch || require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { pincode, district } = req.body || {};
  if (!pincode) return res.status(400).json({ error: 'Pincode required' });

  try {
    const r = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const d = await r.json();

    if (!d || d[0].Status !== 'Success') {
      return res.status(400).json({ error: 'Invalid pincode' });
    }

    const apiDistrict = d[0].PostOffice[0].District;
    if (district && apiDistrict.toLowerCase() !== district.toLowerCase()) {
      return res.status(400).json({ error: 'PIN–District mismatch' });
    }

    res.json({ ok: true, district: apiDistrict });
  } catch (err) {
    console.error('Pincode validation error', err);
    res.status(500).json({ error: 'Pincode validation failed' });
  }
};
