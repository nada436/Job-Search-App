import cron from 'node-cron';
import { user_model } from '../../database/models/user.model.js';


cron.schedule('0 */6 * * *', async () => {
    console.log(' Running CRON job to clean expired OTPs...');

    const now = new Date();

    await user_model.updateMany(
        {}, 
        { $pull: { OTP: { expiresIn: { $lt: now } } } }
    );

    console.log(' Expired OTPs deleted successfully.');
});
