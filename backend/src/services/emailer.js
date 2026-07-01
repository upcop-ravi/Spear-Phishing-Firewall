const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    // Configure your email service provider here
    // Example for Gmail (use App Passwords)
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your_email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your_app_password'
    }
});

const sendAlertEmail = async ({ fakeUrl, targetHotelName, hotelEmail, cyberCellEmail, thanaEmail }) => {
    
    // We send to 3 recipients as requested: Cyber Cell, Thana, Hotel
    const recipients = [cyberCellEmail, thanaEmail, hotelEmail].filter(Boolean).join(',');

    if (!recipients) {
        console.warn('No recipients found for email alert');
        return;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER || 'safestay-noreply@ayodhya.gov.in',
        to: recipients,
        subject: `🚨 URGENT: Phishing Threat Detected targeting ${targetHotelName}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; max-width: 600px; margin: auto;">
                <h2 style="color: #d9534f;">Phishing Threat Alert</h2>
                <p>A new suspicious link mimicking <strong>${targetHotelName}</strong> has been detected.</p>
                
                <div style="background-color: #f9f2f4; padding: 15px; margin: 20px 0; border-left: 5px solid #d9534f;">
                    <strong>Suspicious URL:</strong> <br/>
                    <a href="#" style="color: #d9534f; word-break: break-all;">${fakeUrl}</a>
                </div>

                <p><strong>Action Required:</strong></p>
                <ul>
                    <li><strong>Cyber Cell / Thana:</strong> Please initiate takedown procedures.</li>
                    <li><strong>Hotel Management:</strong> Be aware and alert your customers.</li>
                </ul>

                <br/>
                <p style="font-size: 12px; color: #777;">
                    This is an automated message from Ayodhya SafeStay Intelligence Dashboard.
                </p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Alert email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending alert email:', error);
        return false;
    }
};

module.exports = { sendAlertEmail };
