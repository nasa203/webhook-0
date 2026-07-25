import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let bodyData = req.body;

    // Handle stringified or URL-encoded bodies gracefully
    if (typeof bodyData === 'string') {
      try {
        bodyData = JSON.parse(bodyData);
      } catch {
        const params = new URLSearchParams(bodyData);
        bodyData = Object.fromEntries(params.entries());
      }
    }

    bodyData = bodyData || {};

    const entries = Object.entries(bodyData);
    if (entries.length === 0) {
      console.log('Received empty payload — skipping email dispatch.');
      return res.status(200).json({ success: true, message: 'Ignored empty submission' });
    }

    const formFieldsHtml = entries
      .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
      .join('');

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'your-actual-email@gmail.com', // Your registered Resend email
      subject: bodyData.Subject || 'New Webstudio Form Submission',
      html: `<h2>Form Details</h2><ul>${formFieldsHtml}</ul>`
    });

    if (error) {
      console.error('Resend Error:', error);
      return res.status(400).json({ success: false, error });
    }

    return res.status(200).json({ success: true, data });

  } catch (error) {
    console.error('Server Crash:', error);
    return res.status(500).json({ error: error.message });
  }
}
