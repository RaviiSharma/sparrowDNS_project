
// services/emailService.js
import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});
export async function sendChangeAlert(to, domain, changes) {
  const subject = `Domain Change Alert: ${domain}`;
  const body = `Changes detected for ${domain}:\n\n${JSON.stringify(changes, null, 2)}`;
  try {
    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text: body });
    return true;
  } catch (err) {
    console.error("Email send failed", err);
    return false;
  }
}
