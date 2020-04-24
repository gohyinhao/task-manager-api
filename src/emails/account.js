const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'andrew@mead.io',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
    });
};

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'andrew@mead.io',
        subject: 'We are sad to see you leave.',
        text: `We are sad to see you leave our site, ${name}. If there is anything that we can improve on, do let us know.`,
    });
};

module.exports = {
    sendCancellationEmail,
    sendWelcomeEmail,
};
