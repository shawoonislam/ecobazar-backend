const {emptyFieldValidation} = require('../utils/validation')
const Product = require('../models/productModel')
const createProductController = async (req,res)=>{
    const {title,price,category}=req.body
    emptyFieldValidation(res,title,price,category)

    // title exists ase naki

    let sku = `${Date.now()}-${Date.getFullYear()}`

    // sku exists ase naki


    let product = new Product({
        ...req.body,
        sku: sku
    })

    await product.save()

    res.json({
        success: true,
        message: "Product Created"
    })

}

// all product get

// single product get

// product delete

// product update

module.exports = {createProductController}