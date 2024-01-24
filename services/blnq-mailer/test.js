const bootstrapMail = require('./index');
async function test() {
    const send = await bootstrapMail;
    const mail = await send({
        to: ['lewis@blnq.co.uk'],
        subject: 'Testing changes.',
        text: 'test mail body text'
    });
    return mail;
}

test()
    .then(r => {
        console.log('mail sent', r);
        process.exit();
    })
    .catch(err => {
        console.log('mail send failed', err);
    });
