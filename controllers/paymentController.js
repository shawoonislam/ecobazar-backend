const axios = require("axios");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const paymentController = async (req, res) => {
  const {
    userId,
    cus_name,
    cus_email,
    cus_add1,
    cus_add2,
    cus_city,
    cus_state,
    cus_postcode,
    cus_phone,
    shipping,
  } = req.body;
  try {
    const cart = await Cart.find({ user: userId }).populate("product");

    let totalPrice = Number(shipping);
    console.log(totalPrice);
    let pro = [];
    cart.map((item) => {
      console.log(item);
      pro.push({
        title: item.product.title,
        price: item.product.price,
        sku: item.product.sku,
        quantity: item.quantity,
      });

      totalPrice += item.product.price * item.quantity;
    });
    let trans = Date.now();
    const payload = {
      store_id: "aamarpaytest",
      tran_id: trans,
      success_url: "http://localhost:5173/order-success",
      fail_url: "http://localhost:5173/order-success",
      cancel_url: "http://localhost:5173/order-success",
      amount: totalPrice,
      currency: "BDT",
      signature_key: "dbb74894e82415a2f7ff0ec3a97e4183",
      desc: "Merchant Registration Payment",
      cus_name: cus_name,
      cus_email: cus_email,
      cus_add1: cus_add1,
      cus_add2: cus_add2,
      cus_city: cus_city,
      cus_state: cus_state,
      cus_postcode: cus_postcode,
      cus_country: "Bangladesh",
      cus_phone: cus_phone,
      type: "json",
    };

    const response = await axios.post(
      "https://sandbox.aamarpay.com/jsonpost.php",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const order = new Order({
      user: userId,
      products: pro,
      totalPrice: totalPrice,
      tranid: trans,
    });

    await order.save();

    res.json(response.data);
  } catch (error) {
    console.error("AamarPay Error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};

const getAllOrdersController = async (req, res) => {
  const { userid } = req.params;

  let data = await Order.find({ user: userid });

  res.send({
    success: true,
    data,
  });
};

module.exports = { paymentController, getAllOrdersController };
