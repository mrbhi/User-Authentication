const express = require('express')
const router = express.Router()
const {body} = require('express-validator')

const {signup, verification, signin, forgotPassword,resetPassword} = require('../controller/auth')

router.post('/signup',
[
    body('email').isEmail().withMessage('Invalid Email'),
    body('email').notEmpty().withMessage('Email is required'),
    body('password').isLength({min:7}).withMessage('Password should be atleast 7 charcaters'),
    body('password').notEmpty().withMessage('Please enter a password'),
    body('name').isLength({min:5}).withMessage('Your name should be atleast 5 character'),
    body('name').notEmpty().withMessage('Enter your name')
]
 ,signup)

router.post('/verification', verification)
router.post('/signin',
[
    body('email').isEmail().withMessage('Invalid Email'),
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Please enter a password')
] 
,signin)

router.put('/forgot-password', forgotPassword)
router.put('/reset-password', 
[
    body('newPass').isLength({min:7}).withMessage('Password should be atleast 7 charcaters'),
    body('newPass').notEmpty().withMessage('Please enter a password')
], resetPassword)

module.exports=router