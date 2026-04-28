const User = require('../models/userModel')

let existingData = async (res,findData)=>{
    let existingUser = await User.findOne(findData)

    if(existingUser){
        res.send({message: "User already exists"})
        return true
    }

  
}

module.exports = existingData