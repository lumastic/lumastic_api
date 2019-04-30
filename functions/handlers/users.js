const {admin, db} = require('../util/admin');
const config = require('../util/config')
const firebase = require('firebase');
firebase.initializeApp(config);

const { validateSignup, validateLogin, reduceUserDetails } = require('../util/validationHelper');

exports.signup = (req, resp) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    };

    const { valid, errors } = validateSignup(newUser);

    if(!valid) return resp.status(400).json(errors);

    const defaultPic = 'default-profile-pic.png';

    let token, userId;
    firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
        .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then(idToken => {
            token = idToken;
            const userCredentials = {
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                profilePic: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${defaultPic}?alt=media`,
                createdAt: new Date().toISOString()
            };
            db.collection('users').doc(userId).set(userCredentials);
        })
        .then(() => {
            return resp.status(201).json({ token })
        })
        .catch(err => {
            console.error(err);
            if(err.code === 'auth/email-already-in-use') {
                return(resp.status(400).json({email: "That email is already registered."}))
            } else {
                return(resp.status(500).json({general: "Yikes! Something went wrong, please try again!"}));
            }
        })
};
exports.login = (req, resp) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    const { valid, errors } = validateLogin(user);

    if(!valid) return resp.status(400).json(errors);

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken()
        })
        .then(token => {
            return resp.json({token});
        })
        .catch(err => {
            console.error(err);
            return(resp.status(403).json({general: "Wrong credentials, please try again."}))
        });

};

exports.uploadImage = (req, resp) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new BusBoy({ headers: req.headers });

    let imageFilename;
    let imageToBeUploaded = {};

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if(mimetype !== 'image/jpeg' &&  mimetype !== 'image/png') {
            return resp.status(400).json({error: "Pictures must be JPEG or PNG files"});
        }
        const imageExtention = filename.split('.')[filename.split('.').length-1];
        imageFilename = `${Math.round(Math.random() * 1000000000000000)}.${imageExtention}`;
        const filepath = path.join(os.tmpdir(), imageFilename);

        imageToBeUploaded = {filepath, mimetype};

        file.pipe(fs.createWriteStream(filepath));
    });
    busboy.on('finish', () => {
       admin.storage().bucket().upload(imageToBeUploaded.filepath, {
           resumable: false,
           metadata: {
               contentType: imageToBeUploaded.mimetype
           }
       })
           .then(() => {
               const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFilename}?alt=media`;
               return db.collection('users').doc(req.user.uid).update({profilePic: imageUrl})
           })
           .then(() => {
               return resp.json({message: "Image uploaded successfully"})
           })
           .catch(error => {
               console.error(error);
               return resp.status(500).json({ error: error.code });
           });
    });
    busboy.end(req.rawBody);
};
exports.changeUserDetails = (req, resp) => {
  let userDetails = reduceUserDetails(req.body);
  db.collection('users').doc(req.user.uid).update(userDetails)
      .then(() => {
          return resp.json({message: "Details added successfully!"})
      })
      .catch(err => {
          return resp.status(500).json({error: err.code})
      });
};

exports.getUserDetails = (req, resp) => {
    let userDetails = {};
    db.collection('users').doc(req.user.uid).get()
        .then((doc) => {
            if(doc.exists){
                userDetails = doc.data();
            }
            return resp.json({message: "I got the details!", credentials: userDetails})
        })
        .catch(err => {
            return resp.status(500).json({error: err.code})
        });
};