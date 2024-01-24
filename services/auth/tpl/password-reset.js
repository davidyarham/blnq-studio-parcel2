const fs = require('fs');
const path = require('path');

const htmlFile = fs.readFileSync(
    path.resolve(process.cwd(), './dist/password-reset.html'),
    'utf8'
);

// Don't judge ;)

module.exports = ({ id, verificationkey, email }) => eval('`' + htmlFile + '`');
