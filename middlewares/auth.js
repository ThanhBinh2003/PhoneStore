// Kiểm tra token
const checkToken = (req, res, next) => {
    next();
};

const getUser = async (req, res, next) => {
    next();
}

const checkRole = (roles) => {
    return (req, res, next) => {
        next();
    }
}

module.exports = {
    checkToken,
    getUser,
    checkRole
};