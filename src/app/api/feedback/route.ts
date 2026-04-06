import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, email, feedback, type } = await req.json();

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback message is required' }, { status: 400 });
    }

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
      from: `"NearMe Feedback" <${process.env.SMTP_USER}>`,
      to: 'sahilkumarsml@gmail.com',
      subject: `New Feedback: ${type || 'Suggestion'} from ${name || 'User'}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">New Platform Suggestion</h2>
          <p><strong>From:</strong> ${name || 'Anonymous User'}</p>
          <p><strong>Email/Phone:</strong> ${email || 'Not Provided'}</p>
          <p><strong>Type:</strong> ${type || 'General Suggestion'}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            ${feedback}
          </p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Feedback sent successfully' });
  } catch (error: any) {
    console.error('Feedback Email Error:', error);
    return NextResponse.json(
      { error: 'Failed to send feedback', details: error.message },
      { status: 500 }
    );
  }
}
