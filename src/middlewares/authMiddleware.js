const jwt = require('jsonwebtoken');

const protect = (req,res,next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {   
        try {
            //generate token
            token = req.headers.authorization.split(' ')[1];
            //verify token
            const decoded = jwt.verify(token,process.env.JWT_SECRET);
            //pass payload details to merchant
            req.merchant = decoded;
            next();

        }catch(err) {
            console.error(err);
            res.status(401).json({message: 'Not authorized,token failed'});
        }
    };
    if(!token) {
        res.status(401).json({message: 'Not authorized,no token'});
    }
};
module.exports = {protect};