const User = require('../models/userModel')

let getAllUsersController = async (req, res) => {

     let userData = await User.find({isDelete: false})
     res.send({
          message: "All user Data",
          userData
     })

}
let getAllDeleteUsersController = async (req, res) => {

     let userData = await User.find({isDelete: true})
     res.send({
          message: "All user Data",
          userData
     })

}

let getSearchData = async (req,res)=>{
     let userData = await User.find({name: req.body.name})
     res.send({
          message: "All user Data",
          userData
     })
}



let singleUserDataController = async (req, res) => {
     let { id } = req.params
     let userData = await User.findById(id).select('-password')
     res.send({
          message: `${userData.email} data`,
          userData
     })
}

let deleteUserController = async (req, res) => {
     let { id } = req.params
     let userData = await User.findByIdAndUpdate({_id: id},{isDelete: true})
     res.send({
          message: `User deleted`,
     })
}

let updateUserController = async (req, res) => {
     const { id } = req.params

     let userData = await User.findByIdAndUpdate({ _id: id }, req.body, { new: true })

     res.send({
          message: `User updated`,
     })
}


module.exports = {getAllUsersController,singleUserDataController,deleteUserController,updateUserController,getAllDeleteUsersController,getSearchData}