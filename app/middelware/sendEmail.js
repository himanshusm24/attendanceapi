const axios = require('axios');

const sendEmail = (userEmail, userSubject, userMessage) => {

    const sub = encodeURIComponent(userSubject);

    const to = userEmail;

    const msg = userMessage;

    const url = `https://api.crisil.xyz/mail/mailpost.php?id=35&to=${to}&subject=${sub}`;

    const headers = { 'Content-Type': 'application/json' };

    const data = { msg };

    axios.post(url, data, { headers })
        .then(response => {
            console.log('Email sent successfully');
            console.log(response.data);
            return true;
        })
        .catch(error => {
            console.error('Error sending email:', error.response ? error.response.data : error.message);
            return false;
        });
};

module.exports = sendEmail;