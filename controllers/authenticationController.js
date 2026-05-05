const { mailVerification, resetPasswordMail } = require("../utils/email")
const User = require('../models/userModel')

const { emptyFieldValidation } = require("../utils/validation")
const tokenGenerator = require("../utils/tokenGenerator")
const existingData = require("../utils/exixtingData")
const jwt = require('jsonwebtoken')

let registrationController = async (req,res)=>{
    const {email,password,confirmPassword,terms} = req.body
     
    let users = await existingData(res,{email: email})
    if(users){
        return res.send({message: "User exist"})
    }

    if(!terms){
        return res.send({message: "Please Accept Our Terms and Condition"})
    }


    emptyFieldValidation(res,email,password,confirmPassword)

    if(password !== confirmPassword){
        return res.send({message: "password no matched"})
    }

    const hash = bcrypt.hashSync(password, 10);

    let user = new User({
        email: email,
        password: hash,
        terms: terms
    })

    user.save()

   let token = tokenGenerator({
        id: user._id,
        email: user.email
    },process.env.ACCESS_TOKEN_SECRET,"1d")

    mailVerification(token,email)

    res.send({message: "Registration Successfull"})

}

let loginController = async (req,res)=>{
    const {email,password} = req.body
     
    let users = await existingData(res,{email: email})
    if(!users){
        return res.send({message: "User not found"})
    }
    emptyFieldValidation(res,email,password)

    let pass = bcrypt.compareSync(password, users.password);

    if(!pass){
        return res.send({message: "Invalid Credential"})
    }

    res.send({
        message: "Login Successfull"
    })

}

let forgotPasswordController = (req,res)=>{
    let {email} = req.body
    emptyFieldValidation(res,email)
    let users = await existingData(res,{email: email})
    if(!users){
        return res.send({message: "User not found"})
    }

    let token = tokenGenerator({
        id: users._id,
        email: users.email
    },process.env.ACCESS_TOKEN_SECRET,"1d")

    resetPasswordMail(token,email)
    
    res.send({message: "PLease check your email"})
}

let resetPasswordController = (req,res)=>{
    let {newPassword, confirmPassword} = req.body
    let {token} = req.params

    if(newPassword !== confirmPassword) {
        return res.send({message: "Confirm password not matched"})
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded) {
        if(err){
            res.send({message: "Unauthorized"})
        }else{
            const hash = bcrypt.hashSync(newPassword, 10);
            const updateData = User.findByIdAndUpdate({_id: decoded.id},{password:newPassword})
            res.send({message: "Password Updated"})
        }
    });
}

let resendVerificationEmailController = async (req,res)=>{
    let {email} = req.body

    let user = await User.findOne({email:email})

    let token = tokenGenerator({
        id: user._id,
        email: user.email
    },process.env.ACCESS_TOKEN_SECRET,"1d")
    
     mailVerification(token,email)

     res.send({message: "Check your email for verification"})
}




module.exports = {registrationController,loginController,forgotPasswordController,resetPasswordController,resendVerificationEmailController}