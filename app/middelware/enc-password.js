const bcrypt = require('bcrypt');

const encPassword = async (password) => {

    try {

        const hash = await bcrypt.hash(password, 10);

        return hash;

    } catch (error) {

        console.error(error);

        throw error;

    }
};

module.exports = encPassword;