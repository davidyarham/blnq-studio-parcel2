try {
    require.resolve('../../mailerKey.json');
} catch (e) {
    console.error('mailerKey.json Not present all mail functions stubbed');
    module.exports = {
        sendMail: async function () {
            return;
        },
        sendSharerEmail: async function () {
            return;
        },
        sendPasswordResetMail: async function () {
            return;
        }
    };
    return;
}
const key = require('../../mailerKey.json');

const nodemailer = require('nodemailer');
const EMAIl_ADDRESS = 'noreply@blnq.co.uk';

let send;

async function bootstrap() {
    if (send) {
        return send;
    }
    let transporter;
    try {
        transporter = nodemailer.createTransport({
            pool: true,
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                user: EMAIl_ADDRESS,
                serviceClient: key.client_id,
                privateKey: key.private_key
            }
        });
        const verify = await transporter.verify();
        console.log('nodemailer transporter verified');
    } catch (e) {
        console.error(e);
        //process.exit();
    }

    return (send = async function ({ to, subject, text }) {
        return new Promise(async (resolve, reject) => {
            try {
                const mail = await transporter.sendMail({
                    from: `Blnq Studio <${EMAIl_ADDRESS}>`,
                    to,
                    subject,
                    text
                });
                resolve(mail);
            } catch (err) {
                reject(err);
            }
        });
    });
}

const sendSharerEmail = async ({ to, user, url }) => {
    const mailer = await bootstrap();
    return mailer({
        to: to,
        subject: `${user} just shared their blnq with you`,
        text: `Woo! You've just been added as a collaborator on blnq.\n\n${user} has chosen to share their creation with you.\n\nSo, what are you waiting for...?\n\nGo check it out: ${url}`
    });
};

const sendPasswordResetMail = async ({ to, url }) => {
    const mailer = await bootstrap();
    return mailer({
        to: to,
        subject: `Password reset request for blnq-studio`,
        text: `Need to reset your password?\n\nSimple - Just click or copy this handy link: ${url}`
    });
};

const sendMail = async ({ to, subject, text }) => {
    const mailer = await bootstrap();
    return mailer({
        to,
        subject,
        text
    });
};

(async () => await bootstrap())();

module.exports = {
    sendMail,
    sendSharerEmail,
    sendPasswordResetMail
};
