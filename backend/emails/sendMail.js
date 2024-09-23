import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

export const sendMail = async (email, url, type) => {
  let subject, textBody, htmlBody;

  if (type === "activation") {
    subject = "Activate Your Account";
    textBody = `Hello,

Thank you for signing up! To activate your account, please click the following link:

${url}

This link will expire in 15 minutes for security reasons.

If you didn't create an account with us, please ignore this email.

Best regards,
Your App Team`;

    htmlBody = `<p>Hello,</p>
<p>Thank you for signing up! To activate your account, please click the following link:</p>
<div style="text-align: center; margin: 30px 0;">
  <a href="${url}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Activate Account</a>
</div>
<p>This link will expire in 15 minutes for security reasons.</p>
<p>If you didn't create an account with us, please ignore this email.</p>
<p>Best regards,<br>Your App Team</p>`;
  } else if (type === "reset-password") {
    subject = "Reset Your Password";
    textBody = `Hello,

We received a request to reset your password. If you didn't make this request, please ignore this email.

To reset your password, please click the following link:

${url}

This link will expire in 1 hour for security reasons.

Best regards,
Your App Team`;

    htmlBody = `<p>Hello,</p>
<p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
<p>To reset your password, please click the following link:</p>
<div style="text-align: center; margin: 30px 0;">
  <a href="${url}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
</div>
<p>This link will expire in 1 hour for security reasons.</p>
<p>Best regards,<br>Your App Team</p>`;
  } else {
    throw new Error("Invalid email type specified.");
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject,
      text: textBody,
      html: htmlBody,
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Failed to send email.");
  }
};
