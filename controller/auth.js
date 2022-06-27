const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require ('bcryptjs')
const salt = bcrypt.genSaltSync(10)
const {validationResult} = require('express-validator')
const _ = require('lodash')

require('dotenv').config()

const mailgun = require("mailgun-js");
const DOMAIN = 'sandbox0ede0e60451b426ca82ceeb5c224bb96.mailgun.org';
const mg = mailgun({apiKey: process.env.API_KEY, domain: DOMAIN});

exports.signup = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array()[0] });
    }
    const { name, email, password } = req.body
    const user = await User.findOne({email: email})
        if(user){
            return res.status(400).json({msg: 'Email already exist'})
        }

        const token = jwt.sign({name, email, password}, process.env.JWT_SCRETE, {expiresIn: '60m'})


    const data = {
        from: 'adelugba.emma@gmail.com',
        to: email,
        subject: 'Verification Link',
        html: `
            <h2>Please click on the given link to verify your account</h2>
            <p>${process.env.CLIENT_URL}/verification/${token}</p>
        `
    };
    mg.messages().send(data, function (error, body) {
        if(error){
            console.log('Error sending email', err.messages)
        }
            const encryptPassword = bcrypt.hashSync(password, salt)
            let newUser = new User({
                name: name, 
                email: email, 
                password: encryptPassword
            })
            newUser.save((err, success)=>{
                if(err){
                    console.log("Error in signin in: ", err)
                    return res.status(400).json({error: err})
                }
                    console.log('signup successfully, Email sent to verify your account ', success)
                    return res.status(200).json({msg: 'Signup Successfully, Check your mail to verify your account'})
            })
    });
        
}

exports.verification = (req, res) => {
    
    const {token} = req.body
    console.log(token)
    if(token){
        const decode = jwt.verify(token, process.env.JWT_SCRETE,)
        if(!decode){
            console.log('Error Verifying email or invalid token')
            return res.status(400).json({Error: 'Error verifying email or invalid token'})
        }
            return res.status(200).json({msg: 'Email Verified Succesfully', token, decode})         
    }else{
        return res.status(400).json({Error: 'Email Already Verified'}) 
    }
}

exports.signin = async (req, res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array()[0] });
    }
    const {email, password} = req.body
    const user = await User.findOne({email: email})
    const isValid = await bcrypt.compare(password, user.password)
    console.log(isValid)
    if(user && isValid){
        return res.status(200).json({msg: 'User succeefully login'})
    }
        return res.status(401).json({Error: 'Invalid Entering'})
}

exports.forgotPassword = async (req, res) =>{
    const {email} = req.body
    const user = await User.findOne({email: email})
    if(user){
        const token = jwt.sign({_id: user._id}, process.env.JWT_RESET_LINK, {expiresIn: '20m'} )
        const data = {
            from: 'adelugba.emma@gmail.com',
            to: email,
            subject: 'Password ResetLink',
            html: `
                <h2>Please click on the given link to reset your password</h2>
                <p>${process.env.CLIENT_URL}/reset-password/${token}</p>
            `
        }
        
       
        const update = await User.updateOne({email: email},{resetlink: token})
            if(!update) return res.starus(400).json({Error: 'Error in Reseting Password'})
            
            mg.messages().send(data, function (err, body) {
            if(err){
                console.log('Error sending email')
                return res.status(400).json({Error: 'error in sending mail'})
            }
                console.log('Follow the instruction in your mail to reset your account ')
                return res.status(200).json({msg: 'Follow the instruction in your mail to reset your account'})
            })
        
    } else {
        return res.status(401).json({Error: 'Enter a Valid email'})
    }
}

exports.resetPassword = async (req, res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array()[0] });
    }
    const { newPass, resetlink } = req.body
    if(resetlink){
        const decode = jwt.verify(resetlink, process.env.JWT_RESET_LINK)
        if(!decode){
            console.log('Invalid Token')
            return res.status(400).json({Error: 'Invalid token or expired token'})           
        }
            let user = await User.findOne({resetlink})
            if(!user){
                console.log('User with this token does not exist')
                return res.status(400).json({Error:'User with this token does not exist'})
            }
                const obj = {
                    password: newPass,
                    resetlink: ""
                }
                user = _.extend(user, obj)
                user.save((err, success)=>{
                    if(err){
                        console.log('Error updating your record')
                        return res.status(400).json({Error: 'Error updating your record'})
                    }
                        console.log('Passord changed successfully')
                        return res.status(200).json({Msg: 'Passord chnaged successfully'})
                })

    }else{
        return res.status(400).json({Error: 'Error changing your password'})
    }
    
}