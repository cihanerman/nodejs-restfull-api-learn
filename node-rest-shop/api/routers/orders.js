const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");

router.get("/", (req, res, next) => {
    Order.find()
        .select("product quantity _id")
        .populate("product", "name")
        .exec()
        .then(responce => {
            res.status(200).json({
                count: responce.length,
                order: responce.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: "GET",
                            url: "http://localhost:1919/orders/" + doc._id
                        }
                    }
                })
            });
        })
        .catch(err => {
            console.log(err);
            res.status({
                error: err
            })
        });
}),

router.post("/", (req, res, next) => {
    Product.findById(req.body.productId)
        .then(product => {
            if (!product) {
                return res.status(500).json({
                    message: "Ürün bulunamadı"
                });
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
        
            return order.save()
        })
        .then(result => {
            res.status(201).json({
                message: "sepete eklendi",
                createdOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity
                },
                request: {
                    type: "POST",
                    url: "http://localhost:1919/orders" + result._id
                }
            });
        })
        .catch(err => {
            console.log(err),
            res.status(500).json({
                error: err
            });
        });
        
});

router.get("/:orderId", (req, res, next) => {
    Order.findById(req.params.orderId)
        .populate("product")
        .exec()
        .then(order => {
            if (!order) {
                return res.status(500).json({
                    message: "sipariş bulunamadı"
                });
            }
            res.status(200).json({
                order: order,
                request: {
                    type: "GET",
                    url: "http://localhost:1919/orders"
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

router.delete("/:orderId", (req, res, next) => {
    Order.remove({_id: req.params.orderId})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "sipariş silindi",
                request: {
                    type: "POST",
                    url: "http://localhost:1919/orders",
                    body: { productId: "ID", quantity: "Number" }
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
});

module.exports = router;