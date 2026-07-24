import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Allow requests from any origin (or replace '*' with your specific domain)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle browser OPTIONS preflight check
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const formFieldsHtml = Object.entries(req.body)
    .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
    .join('');

try {
  const response = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'your-exact-signup-email@gmail.com',
    subject: 'New Form Submission',
    html: `<h2>Form Details</h2><ul>${formFieldsHtml}</ul>`
  });

  // 🚨 THIS LOG WILL TELL YOU EXACTLY WHAT FAILS
  console.log("RESEND API RESPONSE:", JSON.stringify(response));

  if (response.error) {
    return res.status(400).json({ success: false, error: response.error });
  }

  return res.status(200).json({ success: true, data: response.data });
} catch (error) {
  console.error("SERVER CATCH ERROR:", error);
  return res.status(500).json({ error: error.message });
}

  if (error) {
    console.error('Resend Error:', error);
    return res.status(400).json({ success: false, error });
  }

  return res.status(200).json({ success: true, data });
} catch (error) {
  return res.status(500).json({ error: error.message });
}
