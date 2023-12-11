const User = require('../models/user');

exports.index = async (req, res) => {
    return res.status(200).json({ status: 'success' })
}
