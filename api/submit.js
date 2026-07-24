import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Convert all key-value pairs in req.body into HTML list items
  const formFieldsHtml = Object.entries(req.body)
    .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
    .join('');
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'homesolutions.obsidian@gmail.com', 
      subject: 'New Form Submission',
      html: `
        <h2>Form Details</h2>
        <ul>
          ${formFieldsHtml}
        </ul>
      `
    });

    return res.status(200).json({ success: true, message: 'Sent!' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}