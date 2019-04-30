const {admin} = require('./admin');

module.exports = (req, resp, next) => {
    let idToken;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        console.error('No token found');
        return resp.status(403).json({error: 'Unauthorized request'});
    }
    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            req.user = decodedToken;
            return req.user;
        })
        .then(data => {
            return next();
        })
        .catch(err => {
            console.error('Error while verifying request', err);
            return resp.status(403).json({message: "Did I get here?"});
        });
};