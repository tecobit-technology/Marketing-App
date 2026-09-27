import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendSignupOtpEmail(
  email: string,
  otp: string,
) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Your mySaaS verification code",
    text: `Your mySaaS verification code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto;">
        <h2>Verify your mySaaS account</h2>

        <p>Use the verification code below to complete your signup:</p>

        <div style="
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 8px;
          padding: 20px;
          background: #f5f5f5;
          text-align: center;
          margin: 24px 0;
        ">
          ${otp}
        </div>

        <p>This code expires in <strong>10 minutes</strong>.</p>

        <p>If you did not request this code, you can safely ignore this email.</p>

        <p>— mySaaS</p>
      </div>
    `,
  });
}

export async function sendDemoRequestEmail(data: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  clinicSize?: string;
  preferredDate?: string;
  preferredTime?: string;
}) {
  const {
    name,
    email,
    phone,
    company,
    clinicSize,
    preferredDate,
    preferredTime,
  } = data;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_USER,
    replyTo: email,
    subject: `New Demo Request - ${name}`,
    text: `
New mySaaS Demo Request

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Company/Clinic: ${company || "Not provided"}
Clinic Size: ${clinicSize || "Not provided"}
Preferred Date: ${preferredDate || "Not provided"}
Preferred Time: ${preferredTime || "Not provided"}
    `.trim(),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>New mySaaS Demo Request</h2>

        <p>A new demo request has been submitted.</p>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; font-weight: 600;">Name</td>
            <td style="padding: 10px;">${name}</td>
          </tr>

          <tr>
            <td style="padding: 10px; font-weight: 600;">Email</td>
            <td style="padding: 10px;">${email}</td>
          </tr>

          <tr>
            <td style="padding: 10px; font-weight: 600;">Phone</td>
            <td style="padding: 10px;">${phone || "Not provided"}</td>
          </tr>

          <tr>
            <td style="padding: 10px; font-weight: 600;">Company / Clinic</td>
            <td style="padding: 10px;">${company || "Not provided"}</td>
          </tr>

          <tr>
            <td style="padding: 10px; font-weight: 600;">Clinic Size</td>
            <td style="padding: 10px;">${clinicSize || "Not provided"}</td>
          </tr>

          <tr>
            <td style="padding: 10px; font-weight: 600;">Preferred Date</td>
            <td style="padding: 10px;">${preferredDate || "Not provided"}</td>
          </tr>

          <tr>
            <td style="padding: 10px; font-weight: 600;">Preferred Time</td>
            <td style="padding: 10px;">${preferredTime || "Not provided"}</td>
          </tr>
        </table>

        <p style="margin-top: 24px;">
          — mySaaS
        </p>
      </div>
    `,
  });
}