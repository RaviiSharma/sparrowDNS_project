// Dummy alert service - replace with email client (e.g. nodemailer, sendgrid)
export const sendExpiryAlert = async (user, order) => {
  try {
    // For simplicity, console log for now
    console.log(`Alert: User ${user.email} plan ${order.plan} expires on ${order.expiryDate.toDateString()}`);
    // Implement real email sending logic here
  } catch (error) {
    console.error('Failed to send alert:', error);
  }
};
