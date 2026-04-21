import cron from 'node-cron';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import { sendExpiryAlert } from '../services/alertService.js';

export const startExpiryAlertJob = () => {
  cron.schedule('0 0 * * *', async () => { // Run every day at 00:00
    try {
      const alertDate = new Date();
      alertDate.setDate(alertDate.getDate() + 3);

      // Find orders expiring exactly in 3 days where alert not sent
      const ordersToAlert = await Order.find({
        expiryDate: {
          $gte: new Date(alertDate.setHours(0, 0, 0, 0)),
          $lt: new Date(alertDate.setHours(23, 59, 59, 999))
        },
        isAlertSent: false,
      }).populate('userId');

      for (const order of ordersToAlert) {
        await sendExpiryAlert(order.userId, order);
        order.isAlertSent = true;
        await order.save();
      }

      console.log('Expiry alert job completed');
    } catch (error) {
      console.error('Error in expiry alert job:', error);
    }
  });
};
