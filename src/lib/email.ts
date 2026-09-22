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
    subject: "Your AThor verification code",
    text: `Your AThor verification code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto;">
        <h2>Verify your AThor account</h2>

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

        <p>— AThor</p>
      </div>
    `,
  });
}