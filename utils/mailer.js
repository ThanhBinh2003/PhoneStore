const nodeMailer = require('nodemailer');

exports.sendMail = async (to, subject, text) => {
    return new Promise((resolve, reject) => {
        const transport = nodeMailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'maithanhbinh13102003@gmail.com',
                pass: 'pade meun ipee tnwh',
            }
        });

        const mailOptions = {
            from: 'maithanhbinh13102003@gmail.com',
            to: to,
            subject: subject,
            text: text,
        };

        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                reject({
                    status: 'error',
                    message: 'Cannot send email'
                });
            } else {
                resolve({
                    status: 'success',
                    message: 'Email sent: ' + info.response
                });
            }
        });
    });
};