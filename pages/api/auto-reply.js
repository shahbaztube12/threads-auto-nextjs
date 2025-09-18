export default function handler(req, res) {
  if (req.method === 'POST') {
    const { keyword, reply } = req.body;
    // For now, just return success without saving
    return res.status(200).json({ success: true });
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
