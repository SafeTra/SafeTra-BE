const twilio = require('twilio');

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not found. Please check your environment variables.');
  }

const sendOtpViaSms = async (mobile, otp) => {
  try {
    // Send SMS message using Twilio API
    await client.messages.create({
      body: `Your One time password is: ${otp}`,
      from: twilioPhoneNumber,
      to: mobile,
    });
    console.log('OTP sent successfully.');
  } catch (error) {
    console.error('Error sending OTP:', error.message);
  }
};

module.exports = sendOtpViaSms;