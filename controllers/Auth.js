const { validateRegisterUser, User, validateLoginrUser } = require("../models/user");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
require('dotenv').config();
const nodemailer = require('nodemailer')
const { v4: uuid } = require('uuid');
const userVerification = require("../models/userVerification");


// transport configuration
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass : process.env.AUTH_PASS 
    },
    tls :{
        rejectUnauthorized:false
    }
});

// send verification email 
const sendVerificationEmail = async ({_id, email}, res) => {
    try {
        const currenUrl = `http://localhost:${process.env.PORT}/`;
        const uniqueString = uuid() + _id.toString(); // Assurez-vous que _id est également une chaîne

        // mail options
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Verify your email",
            html: `<p>verify your email address to complete the signup and login into your account.</p>
            <p>this link expires in 6 hours.</p> 
            <p>Press <a href=${currenUrl + "auth/verify/" + _id + "/" + uniqueString} >here</a></p>`
        }

        const salt = await bcrypt.genSalt(10);
        const hashedUniqueString = await bcrypt.hash(uniqueString, salt);

        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 6);

        const newVerification = new userVerification({
            userId: _id,
            uniqueString: hashedUniqueString,
            createdAt: new Date(),
            expiresAt: expirationDate
        });

        await newVerification.save();
        await transporter.sendMail(mailOptions);
        
        res.status(200).json({msg: "Email of verification is sent"});
    } catch (error) {
        console.error(error);
        res.status(500).json({msg: "Can't send verification mail"});
    }
}

// verify Function
const verifyEmail = async (req, res) => {
    try {
        const { userId, uniqueString } = req.params;

        const userVerificationRecord = await userVerification.findOne({ userId });

        if (!userVerificationRecord) {
            return res.status(400).json({ success: false, message: "Account record doesn't exist or has been verified already. Please sign up or log in." });
        }

        const { expiresAt, uniqueString: hashedUniqueString } = userVerificationRecord;

        const currentDate = new Date();

        if (expiresAt < currentDate) {
            await Promise.all([
                userVerification.deleteOne({ userId }),
                User.deleteOne({ _id: userId })
            ]);

            return res.status(400).json({ success: false, message: "Link Has Expired. Please sign up again." });
        }

        const isUniqueStringValid = await bcrypt.compare(uniqueString, hashedUniqueString);

        if (isUniqueStringValid) {
            await Promise.all([
                User.updateOne({ _id: userId }, { verified: true }),
                userVerification.deleteOne({ userId })
            ]);

            return res.status(200).json({ success: true, message: "The verification is successful" });
        } else {
            return res.status(400).json({ success: false, message: "Invalid verification passed. Check your inbox." });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "An error occurred during email verification" });
    }
};

// fonction de registration 
const registerUser = async (req, res) => {
        const { error } = validateRegisterUser(req.body);
        // verifier les champs (s'il y a des champs vide)
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        // verifier est ce que le compte existe deja
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ message: "This user already registered" });
        }
        // hasher le password
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password , salt) 
        // creer le nouveau compte s'il n y a pas d'erreur
        user = new User(req.body);
        await user.save();
        // ne pas afficher le password pour l'utilisateur
        const token = null;
        const {password , ...other} = user._doc;
        // res.status(201).json({...other, token});

        sendVerificationEmail(user, res);
};

// fonction de login
const loginUser = async (req, res) => {
    const { error } = validateLoginrUser(req.body);
    // verifier les champs (s'il y a des champs vide)
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    // verifier est ce que le compte existe deja
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
    }
    // comparer le password du client avec la base de données
    const isMatchPassword = await bcrypt.compare(req.body.password, user.password);
    if (!isMatchPassword) {
        return res.status(400).json({ message: "Invalid email or password" });
    }
    // L'email n'est pas vérifié
    if (!user.verified) {
        return res.status(401).json({ message: "Account not verified. Please check your email for verification." });
    }
    // creation du token 
    const token = jwt.sign({id: user._id, role : user.role}, process.env.SECRET_KEY);
    // ne pas afficher le password pour l'utilisateur
    const {password , ...other} = user._doc;
    res.status(200).json({...other, token});
};


module.exports = {
    registerUser,
    loginUser,
    verifyEmail,
    sendVerificationEmail
}