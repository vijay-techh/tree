module.exports = (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

  const { username, password } = req.body || {};
  if (username === "user" && password === "1234") {
    return res.status(200).json({ success: true });
  }

  res.status(401).json({ success: false });
};
