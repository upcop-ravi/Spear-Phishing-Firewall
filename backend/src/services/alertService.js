const nodemailer = require('nodemailer');

// Mock email configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: process.env.EMAIL_USER || 'mock-user@ethereal.email',
        pass: process.env.EMAIL_PASS || 'mock-password'
    }
});

// Mock Twilio configuration
const sendWhatsAppMock = async (to, message) => {
    console.log(`[Twilio Mock] WhatsApp message sent to ${to}: ${message}`);
    return { status: 'delivered', sid: 'mock-sid-12345' };
};

const sendThreatAlerts = async (hotel, fakeUrl, thanaEmail) => {
    try {
        const cyberCellEmail = process.env.CYBER_CELL_EMAIL || 'cybercell@upcop.gov.in';
        const emailSubject = `URGENT: Phishing Threat Detected for ${hotel.hotel_name}`;
        const emailBody = `
            <h2>Phishing Alert</h2>
            <p>A suspicious website mimicking <strong>${hotel.hotel_name}</strong> has been detected.</p>
            <p><strong>Fake URL:</strong> ${fakeUrl}</p>
            <p><strong>Official URL:</strong> ${hotel.official_url}</p>
            <br/>
            <p>Please initiate takedown procedures immediately.</p>
        `;

        // 1. Alert Cyber Cell
        await transporter.sendMail({
            from: '"SafeStay Alerts" <alerts@safestay.upcop.gov.in>',
            to: cyberCellEmail,
            subject: emailSubject,
            html: emailBody
        });
        console.log(`[AlertService] Email sent to Cyber Cell: ${cyberCellEmail}`);

        // 2. Alert Thana NIC Email
        if (thanaEmail) {
            await transporter.sendMail({
                from: '"SafeStay Alerts" <alerts@safestay.upcop.gov.in>',
                to: thanaEmail,
                subject: emailSubject,
                html: emailBody
            });
            console.log(`[AlertService] Email sent to Thana: ${thanaEmail}`);
        }

        // 3. Alert Hotel WhatsApp/Email
        if (hotel.whatsapp_number) {
            await sendWhatsAppMock(hotel.whatsapp_number, `ALERT: SafeStay detected a phishing site (${fakeUrl}) mimicking your hotel. Please warn your customers and await police action.`);
        }
        if (hotel.email) {
            await transporter.sendMail({
                from: '"SafeStay Alerts" <alerts@safestay.upcop.gov.in>',
                to: hotel.email,
                subject: 'Security Alert: Phishing Site Detected',
                html: `Dear ${hotel.hotel_name},<br/><br/>We have detected a fake website (${fakeUrl}) pretending to be your official portal. The Cyber Cell has been notified.`
            });
            console.log(`[AlertService] Email sent to Hotel: ${hotel.email}`);
        }

        return true;
    } catch (error) {
        console.error('[AlertService] Error sending alerts:', error);
        return false;
    }
};

module.exports = {
    sendThreatAlerts
};
