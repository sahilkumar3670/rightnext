import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, email, feedback, type } = await req.json();

    // 1. Basic Type Validation & Sanitization (Prevent XSS injections)
    if (!name || typeof name !== 'string' || name.length > 100) return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    if (!email || typeof email !== 'string' || !email.includes('@')) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    if (!feedback || typeof feedback !== 'string' || feedback.length > 5000) return NextResponse.json({ error: 'Invalid feedback' }, { status: 400 });
    
    // HTML escape to stop XSS in the email client
    const escapeHtml = (unsafe: string) => unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeType = escapeHtml(type || 'General Suggestion');
    const safeFeedback = escapeHtml(feedback);

    // Configure SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: `"RightNext Feedback" <${process.env.SMTP_USER}>`,
      to: 'sahilkumarsml@gmail.com',
      subject: `New Feedback: ${safeType} from ${safeName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">New Platform Suggestion</h2>
          <p><strong>From:</strong> ${safeName}</p>
          <p><strong>Email/Phone:</strong> ${safeEmail}</p>
          <p><strong>Type:</strong> ${safeType}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            ${safeFeedback}
          </p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    // Proper Audit Logging 
    console.info(`[AUDIT] Feedback successfully processed for IP or User. Action: FEEDBACK_SUBMIT`);

    return NextResponse.json({ message: 'Feedback sent successfully' });
  } catch (error: any) {
    // Log the actual error to the internal server console only
    console.error(`[SECURITY ALERT] internal error during feedback processing: ${error.message}`);
    
    // Return generic error to the attacker/user to prevent info leakage
    return NextResponse.json(
      { error: 'An internal server error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
