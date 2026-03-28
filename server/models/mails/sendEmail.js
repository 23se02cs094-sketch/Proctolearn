const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// Load email template
const loadTemplate = (templateName, data) => {
    const templatesDir = path.join(__dirname, 'templates');
    const templatePath = path.join(templatesDir, `${templateName}.html`);

    try {
        let template = fs.readFileSync(templatePath, 'utf8');

        // Replace placeholders with actual data
        Object.keys(data).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            template = template.replace(regex, data[key]);
        });

        return template;
    } catch (error) {
        console.error(`Template ${templateName} not found, using plain text`);
        return null;
    }
};

// Send email function
const sendEmail = async (options) => {
    const transporter = createTransporter();

    let htmlContent = null;
    if (options.template) {
        const templateData = {
            frontendUrl: process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173',
            ...(options.data || {})
        };
        htmlContent = loadTemplate(options.template, templateData);
    }

    const mailOptions = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message || '',
        html: htmlContent || options.html || ''
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email sending failed: ', error.message);
        throw error;
    }
};

module.exports = sendEmail;
