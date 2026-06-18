require('node:dns').setServers(['1.1.1.1', '8.8.8.8']);
require('dotenv').config()
const express = require('express')

const app = express()
const cors = require('cors')
const dbConfig = require("./config/dbConfig")
const { registrationController, loginController, forgotPasswordController, resetPasswordController, resendVerificationEmailController, verifyEmailController } = require('./controllers/authenticationController');
const { getAllUsersController, singleUserDataController, deleteUserController, updateUserController } = require('./controllers/userController');
const { createProductController, getAllProductsController, getSingleProductController, deleteProductController, updateProductController } = require('./controllers/productController');
const multer = require('multer');
const { createCart, increDecre, getCart, proDelete } = require('./controllers/cartController');
const { paymentController } = require('./controllers/paymentController');

// image work
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/products')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage })



// Middleware
app.use(express.json())
app.use(cors())

// Database config
dbConfig()


app.post('/registration', registrationController)
app.post('/login',  loginController)
app.post('/forgotpassword', forgotPasswordController)
app.post('/resetpassword/:token', resetPasswordController)
app.post('/resendverificationemail', resendVerificationEmailController)
app.post('/verifyemail/:token', verifyEmailController)

// Product Create
// app.post('/createproduct', )
app.post('/createproduct', upload.array('images', 5), createProductController);
app.get('/get-all-products', getAllProductsController)
app.get('/get-single-product/:id', getSingleProductController)
app.delete('/delete-product/:id', deleteProductController);
app.put('/update-product/:id', upload.array('images', 5), updateProductController);


// Cart Management
app.post('/cart/create', createCart)
app.post('/cart/update/:id', increDecre)
app.get('/cart/:userId', getCart)
app.delete('/cart/:id',proDelete)


// Order Management
app.post('/payment',paymentController)

// user management
app.get('/allusers', getAllUsersController)
app.get('/singleuser/:id', singleUserDataController)
app.delete('/deleteuser/:id', deleteUserController)
app.post('/update/:id', updateUserController)








let port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})