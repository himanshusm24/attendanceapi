const bcrypt = require('bcrypt');

const decPassword = async (plainPassword, encPassword) => {

    try {

        const result = await bcrypt.compare(plainPassword, encPassword);

        return result;

    } catch (error) {

        console.error(error);

        throw error;

    }
};

module.exports = decPassword;