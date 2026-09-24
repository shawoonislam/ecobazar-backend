const { emptyFieldValidation } = require("../utils/validation");
const Product = require("../models/productModel");
let Cat = require("../models/categoryModel");
const { readSheet } = require("read-excel-file/node");
const { unlink } = require("node:fs/promises");
// const readExcelFile = require("read-excel-file/node");

const schema = {
  title: {
    column: "title",
    type: String,
  },
  description: {
    column: "description",
    type: String,
  },
  additionalInfo: {
    column: "additionalInfo",
    type: String,
  },
  price: {
    column: "price",
    type: Number,
  },
  discountType: {
    column: "discountType",
    type: String,
  },
  discount: {
    column: "discount",
    type: Number,
  },
  discountStartDate: {
    column: "discountStartDate",
    type: Date,
  },
  discountEndDate: {
    column: "discountEndDate",
    type: Date,
  },
  sku: {
    column: "sku",
    type: String,
  },
  stock: {
    column: "stock",
    type: Number,
  },
  brand: {
    column: "brand",
    type: String,
  },
  shortDescription: {
    column: "shortDescription",
    type: String,
  },
  category: {
    column: "category",
    type: String,
  },
  tag: {
    column: "tag",
    type: String,
  },
  status: {
    column: "status",
    type: String,
  },
  images: {
    column: "images",
    type: String,
  },
};

const createProductController = async (req, res) => {
  const {
    title,
    price,
    category,
    tag,
    stock,
    discountType,
    discount,
    discountStartDate,
    discountEndDate,
    isMain,
  } = req.body;

  console.log("asd", isMain);

  let images = [];
  req.files?.map((item, index) => {
    images.push({
      url: item.path,
      isMain: isMain == index,
    });
  });

  let sku = `Eco-${Date.now()}-${new Date().getFullYear()}`;
  let slug = title.toLowerCase().toString().trim().split(" ").join('-')

  const startDate = new Date(discountStartDate);
  const endDate = new Date(discountEndDate);
  if (new Date().setHours(0, 0, 0, 0) > startDate.setHours(0, 0, 0, 0)) {
    return res.json({
      success: false,
      message: "start date current theke choto hobe na",
    });
  }

  if (new Date().setHours(0, 0, 0, 0) > endDate.setHours(0, 0, 0, 0)) {
    return res.json({
      success: false,
      message: "end date current theke choto hobe na",
    });
  }

  if (!stock || stock < 1) {
    return res.json({
      success: false,
      message: "Stock must be greater then 0",
    });
  }

  if (discountType == "flat") {
    if (price <= discount && discount < 0) {
      return res.json({
        success: false,
        message: "Osomvob",
      });
    }
  }

  if (discountType == "percentage") {
    if (discount <= "100") {
      return res.json({
        success: false,
        message: "Osomvob",
      });
    }
  }

  let product = new Product({
    ...req.body,
    images: images,
    tag: tag.split(","),
    sku: sku,
    slug: slug
  });

  await product.save();

  res.json({
    success: true,
    message: "Product Created",
    product: product,
  });
};

const bulkCreateProductController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required",
      });
    }

    const { objects, errors } = await readSheet(`./${req.file.path}`, {
      schema,
    });

    if (errors?.length) {
      return res.status(400).json({
        success: false,
        message: "Excel data validation failed",
        errors,
      });
    }
    console.log(objects);

    const products = objects.map((item) => ({
      ...item,

      tag: item.tag ? item.tag.split(",").map((tag) => tag.trim()) : [],

      images: item.images
        ? item.images.split(",").map((image) => {
            const [url, isMain] = image.split("|");

            return {
              url: url.trim(),
              isMain: isMain?.trim().toLowerCase() === "true",
            };
          })
        : [],
    }));

    const product = await Product.insertMany(products);

    return res.status(201).json({
      success: true,
      message: `${product.length} products created successfully`,
      data: product,
    });
  } catch (error) {
    console.error("Bulk product create error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create products",
      error: error.message,
    });
  }
};

// const bulkCreateProductController = async (req, res) => {
//   console.log(req.file);
//   // const data = await readSheet(`./${req.file.path}`);
//   // console.log(data);

//   const { objects, errors } = await readSheet(`./${req.file.path}`, { schema });

//   const products = await Product.insertMany(objects)
// };

// all product get
const getAllProductsController = async (req, res) => {

  try {
    let params = req.query.section

    const product = await Product.find(params?{section: params}: {});
    return res.status(200).json({
      success: true,
      message: "All products...",
      product: product,
    });
  } catch (error) {
    console.log(error, "Get All Products related error...");
    return res.status(500).json({ success: false, message: "Server error..." });
  }
};

// single product get
const getSingleProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found..." });
    }

    let isMain = 0;

    product.images.map((item, index) => {
      if (item.isMain) {
        isMain = index;
      }
    });

    return res.status(200).json({
      success: true,
      message: `Product details: ${product.title}, ${product.sku}`,
      product: product,
      isMain: isMain,
    });
  } catch (error) {
    console.log(error, "Get single Product related error...");
    return res.status(500).json({ success: false, message: "Server error..." });
  }
};

// product delete
const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found..." });
    }
    return res.status(200).json({
      success: true,
      message: "Product Deleted successfully...",
    });
  } catch (error) {
    console.log(error, "Delete Product related error...");
    return res.status(500).json({ success: false, message: "Server error..." });
  }
};

async function deleteFile(filePath) {
  try {
    await unlink(filePath);
    console.log(`Successfully deleted ${filePath}`);
  } catch (error) {
    console.error(`Error deleting file: ${error.message}`);
  }
}

// product update
const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;



    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });

   

    product.images = [...product.images];
    req.files?.map((item, index) => {
      product.images.push({
        url: item.path,
        isMain: req.body.isMain == index,
      });
    });

    product.images.map((item, index) => {
      if(item.isMain){
        if (item.isMain == true) {
        item.isMain = false;
      }
      }
    });

    if(req.body.isMain){

      product.images[req.body.isMain].isMain = true;
    }
    // console.log("asda",req.body.deleteImage);
     if (req.body?.deleteImage.length > 0) {
      req.body?.deleteImage?.split(",").map((item) => {
        deleteFile(product.images[item].url);
      });
      let deleteArr = [];
      product.images.map((item, i) => {
        if (!req.body?.deleteImage.includes(i)) {
          deleteArr.push(item);
        }
      });

      product.images = deleteArr;
    }
    if(product.images.length == 1){

      product.images[0].isMain = true;
    }


    const productsingle = await Product.findByIdAndUpdate(id, product, {
      new: true,
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found..." });
    }
    return res.status(200).json({
      success: true,
      message: "Product updated successfully...",
      // product: productsingle,
    });
  } catch (error) {
    console.log(error, "Update Product related error...");
    return res.status(500).json({ success: false, message: "Server error..." });
  }
};

let createCategory = (req, res) => {
  let { name } = req.body;
  if (!name) {
    return res.json({
      success: false,
      message: "Name is required",
    });
  }

  let category = new Cat({
    name: name,
  });

  category.save();

  res.json({
    success: true,
    message: "Category Created",
    category: category,
  });
};

let getCategory = async (req, res) => {
  try {
    let category = await Cat.find({});
    res.json({
      success: true,
      message: "Categories retrieved",
      categories: category,
    });
  } catch (error) {
    console.log(error, "Get Categories related error...");
    res.status(500).json({ success: false, message: "Server error..." });
  }
};

module.exports = {
  createProductController,
  getAllProductsController,
  getSingleProductController,
  updateProductController,
  deleteProductController,
  createCategory,
  getCategory,
  bulkCreateProductController,
};
