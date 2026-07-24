import { Resend } from 'resend';

// Initialize SDK
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // 1. ALWAYS set CORS headers first, no matter what happens
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 2. Handle preflight OPTIONS check immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Reject non-POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    
    // Format HTML body safely
    const formFieldsHtml = Object.entries(body)
      .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
      .join('');

    // 4. Trigger Resend
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'YOUR-EXACT-RESEND-EMAIL@gmail.com', // 👈 Put your real Resend login email here
      subject: body.Subject || 'New Form Submission',
      html: `<h2>Form Details</h2><ul>${formFieldsHtml}</ul>`
    });

    // 5. Explicit Resend Error Handling
    if (error) {
      console.error('Resend API Error:', error);
      return res.status(400).json({ success: false, resendError: error });
    }

    return res.status(200).json({ success: true, resendData: data });

  } catch (error) {
    // Catch-all for server runtime errors while keeping CORS intact
    console.error('Server Crash:', error);
    return res.status(500).json({ error: error.message });
  }
}
