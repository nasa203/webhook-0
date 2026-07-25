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
        // Parse standard URL-encoded form data (key1=val1&key2=val2)
        const params = new URLSearchParams(bodyData);
        bodyData = Object.fromEntries(params.entries());
      }
    }

    bodyData = bodyData || {};

    const formFieldsHtml = Object.entries(bodyData)
      .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
      .join('');

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'homesolutions.obsidian@gmail.com',
      subject: bodyData.Subject || 'New Webstudio Form Submission',
      html: `<h2>Form Details</h2><ul>${formFieldsHtml}</ul>`
    });

    if (error) {
      console.error('Resend Error:', error);
      // Return 400 so Webstudio automatically triggers the FAIL state
      return res.status(400).json({ success: false, error });
    }

    // Return 200 so Webstudio automatically triggers the SUCCESS state
    return res.status(200).json({ success: true, data });

  } catch (error) {
    console.error('Server Crash:', error);
    return res.status(500).json({ error: error.message });
  }
}
