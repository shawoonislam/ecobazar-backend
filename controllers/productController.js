const {emptyFieldValidation} = require('../utils/validation')
const Product = require('../models/productModel')

const createProductController = async (req, res) => {
    const {title,price,category,tag,stock,discountType,discount,discountStartDate,discountEndDate,isMain}=req.body

    let images = []
    req.files.map((item,index)=>{
        images.push({
            url: item.path,
            isMain: isMain == index
        }
    )
    })

    



    let sku = `Eco-${Date.now()}-${new Date().getFullYear()}`

    const startDate = new Date(discountStartDate);
    const endDate = new Date(discountEndDate);
    if(new Date().setHours(0, 0, 0, 0) > startDate.setHours(0, 0, 0, 0)){
        return res.json({
            success: false,
            message: "start date current theke choto hobe na",
        })
    }

    if(new Date().setHours(0, 0, 0, 0) > endDate.setHours(0, 0, 0, 0)){
        return res.json({
            success: false,
            message: "end date current theke choto hobe na",
        })
    }


    if(!stock || stock < 1){
        return res.json({
            success: false,
            message: "Stock must be greater then 0",
        })
    }

    if(discountType == 'flat'){
        if(price <= discount && discount < 0){
            return res.json({
                success: false,
                message: "Osomvob",
            })
        }
    }

    if(discountType == 'percentage'){
        if(discount <= '100'){
            return res.json({
                success: false,
                message: "Osomvob",
            })
        }
    }


    let product = new Product({
        ...req.body,
        images: images,
        tag:tag.split(','),
        sku: sku
    })

    await product.save()

    res.json({
        success: true,
        message: "Product Created",
        product: product,
    })

}

// all product get
const getAllProductsController = async (req, res) => {
    try {
        const product = await Product.find({})
        return res.status(200).json({
            success: true,
            message: 'All products...',
            product: product
        })

    } catch (error) {
        console.log(error, 'Get All Products related error...');
        return res.status(500).json({ success: false, message: 'Server error...' })
    }
}

// single product get
const getSingleProductController = async (req, res) => {
    try {
        const { id } = req.params
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found...' })
        }
        return res.status(200).json({
            success: true,
            message: `Product details: ${product.title}, ${product.sku}`,
            product: product
        })


    } catch (error) {
        console.log(error, 'Get single Product related error...');
        return res.status(500).json({ success: false, message: 'Server error...' })
    }
}

// product delete
const deleteProductController = async (req, res) => {
    try {
        const { id } = req.params
        const product = await Product.findByIdAndDelete(id)
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found...' })
        }
        return res.status(200).json({
            success: true,
            message: 'Product Deleted successfully...',

        })

    } catch (error) {
        console.log(error, 'Delete Product related error...');
        return res.status(500).json({ success: false, message: 'Server error...' })
    }
}

// product update
const updateProductController = async (req, res) => {
    try {
        const { id } = req.params
        const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found...' })
        }
        return res.status(200).json({
            success: true,
            message: 'Product updated successfully...',
            product: product
        })

    } catch (error) {
        console.log(error, 'Update Product related error...');
        return res.status(500).json({ success: false, message: 'Server error...' })
    }
}

module.exports = {createProductController, getAllProductsController, getSingleProductController, updateProductController, deleteProductController,}