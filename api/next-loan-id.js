module.exports = (req, res) => {
  res.status(200).json({ loanId: Date.now().toString() });
};
