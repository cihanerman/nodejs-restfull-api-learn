const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../models/product");

router.get("/", (req, res, next) => {
    Product.find()
        .select("name price _id")
        .exec()
        .then(docs => {
            const responce = {
                count:docs.length,
                products:docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        request: {
                            type: "GET",
                            url: "http://localhost:1919/products/" + doc._id
                        }
                    }
                })
            };

            console.log(docs);
            res.status(200).json(responce);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post("/", (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });

    product.save()
        .then(responce => {
            console.log(responce);
            res.status(201).json({
                message: "Handling POST request to /products",
                createdProduct: {
                    name: responce.name,
                    price: responce.price,
                    _id: responce._id,
                    request: {
                        type: "POST",
                        url: "http://localhost:1919/products/" + responce._id
                    }
                }
            });
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            });
        });
});

router.get("/:productId", (req, res, next) => {
    const id = req.params.productId;

    Product.findById(id)
        .select("name price _id")
        .exec()
        .then(doc => {
            console.log("From database",doc);
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: "GET",
                        url: "http://localhost:1919/products/" + doc._id
                    }
                });
            } else {
                res.status(404).json({
                    message: "Bu id'li ürün bulunamadı"
                });     
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                 error : err
                });
        });
});

router.patch("/:productId", (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};

    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }

    Product.update({_id: id}, {  $set: updateOps})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Ürün güncellendi",
                request: {
                    type: "GET",
                    url: "http://localhost:1919/products/" + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error : err
            });
        });
});

router.delete("/:productId", (req, res, next) => {
    const id = req.params.productId;
    Product.remove({_id: id})
        .exec()
        .then(responce => {
            res.status(200).json({
                message: "Ürün silindi",
                request: {
                    type: "POST",
                    url: "http://localhost:1919/products",
                    body: { name: "String", price: "Number"}
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;