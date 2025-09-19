// Dummy endpoint for Threads webhook
export default function handler(req, res) {
  if (req.method === 'POST') {
    // Process webhook data here (dummy)
    console.log('Webhook received:', req.body);
    return res.status(200).json({ success: true });
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
