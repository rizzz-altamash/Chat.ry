// services/smsService.js 

// For MSG91 (India)
const sendSMS = async (phoneNumber, message) => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      // Development mode - just log
      console.log(`📱 SMS to ${phoneNumber}: ${message}`);
      return true;
    }

    // Production mode - actual SMS
    if (process.env.SMS_PROVIDER === 'msg91') {
      const axios = require('axios');
      
      const response = await axios.post('https://api.msg91.com/api/v5/flow/', {
        authkey: process.env.MSG91_AUTH_KEY,
        sender: process.env.MSG91_SENDER_ID,
        mobiles: phoneNumber.replace('+91', ''),
        message: message,
        route: process.env.MSG91_ROUTE
      });
      
      console.log('SMS sent successfully');
      return true;
    }
    
  } catch (error) {
    console.error('SMS Error:', error);
    throw error;
  }
};

module.exports = { sendSMS };














// // services/smsService.js

// const twilio = require('twilio');
// const MSG91 = require('msg91');

// // For production, use environment variables
// const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
// const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
// const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
// const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'CHATRY';

// const sendSMS = async (phoneNumber, message) => {
//   try {
//     if (process.env.SMS_PROVIDER === 'twilio') {
//       const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      
//       await client.messages.create({
//         body: message,
//         from: TWILIO_PHONE_NUMBER,
//         to: phoneNumber
//       });
      
//     } else if (process.env.SMS_PROVIDER === 'msg91') {
//       // MSG91 for India (cheaper)
//       const msg91 = new MSG91(MSG91_AUTH_KEY);
      
//       await msg91.send({
//         sender: MSG91_SENDER_ID,
//         route: '4', // Transactional route
//         country: '91',
//         mobiles: phoneNumber.replace('+91', ''),
//         message: message
//       });
//     }
    
//     console.log(`SMS sent to ${phoneNumber}`);
    
//   } catch (error) {
//     console.error('SMS sending failed:', error);
//     throw error;
//   }
// };

// module.exports = { sendSMS };