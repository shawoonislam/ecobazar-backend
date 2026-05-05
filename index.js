require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const dbConfig = require("./config/dbConfig")
const {registrationController,loginController,forgotPasswordController,resetPasswordController,resendVerificationEmailController} = require('./controllers/authenticationController')



// Middleware
app.use(express.json())
app.use(cors())

// Database config
dbConfig()


app.post('/registration', registrationController)
app.post('/login', loginController)
app.post('/forgotpassword', forgotPasswordController)
app.post('/resetpassword/:token', resetPasswordController)
app.post('/resendverificationemail', resendVerificationEmailController)


let port = process.env.PORT || 5000

app.listen(port,()=>{
    console.log(`Server running on port ${port}`)
})