const twilio = require('twilio');

const accountSid = 'AC89ca0e0429128e32c2790df626c1c459'
const authToken = '211d7ae64202b1ee38e1e6a17a9872bb'
const twilioPhoneNumber = '+2349077746616';

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