const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const sendOTPEmail = async (toEmail, otp, name) => {
  const mailOptions = {
    from: `"Barber Booking" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Password Reset OTP',
    html: `
      <div style="font-family: Arial; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #c9a84c;">✂ Barber Booking</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Tumhara password reset OTP:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #c9a84c; letter-spacing: 8px; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #888; font-size: 13px;">
          ⚠️ Ye OTP sirf <strong>10 minutes</strong> ke liye valid h.
        </p>
        <p style="color: #888; font-size: 13px;">
          Agar tumne request nahi ki to ignore karo.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };