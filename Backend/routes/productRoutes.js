const express = require("express");
const Product = require("../models/Product");

const router = express.Router();


// GET all products
router.get("/", async (req, res) => {
  try {

    const { category, featured, bestSeller } = req.query;

    let filter = {};

    if (category) filter.category = category;
    if (featured) filter.featured = true;
    if (bestSeller) filter.bestSeller = true;


    const products = await Product.find(filter);

    res.json(products);


  } catch (error) {

    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });

  }
});




// GET single product
router.get("/:id", async (req, res) => {

  try {

    const product = await Product.findById(req.params.id);


    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }


    res.json(product);


  } catch (error) {

    res.status(500).json({
      message: "Error fetching product",
      error: error.message,
    });

  }

});





// CREATE product
router.post("/", async (req, res) => {

  try {

    const newProduct = await Product.create(req.body);

    res.status(201).json(newProduct);


  } catch (error) {

    res.status(500).json({
      message: "Error creating product",
      error: error.message,
    });

  }

});





// UPDATE product
router.put("/:id", async (req, res) => {

  try {


    const updatedProduct =
      await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new:true
        }
      );


    if(!updatedProduct){

      return res.status(404).json({
        message:"Product not found"
      });

    }


    res.json(updatedProduct);



  } catch(error){

    res.status(500).json({
      message:"Error updating product",
      error:error.message
    });

  }

});






// ADD PRODUCT REVIEW
router.post("/:id/review", async (req,res)=>{


  try{


    const {name, rating, comment} = req.body;



    const product =
      await Product.findById(req.params.id);



    if(!product){

      return res.status(404).json({
        message:"Product not found"
      });

    }





    const review = {

      name,

      rating:Number(rating),

      comment

    };




    product.reviews.push(review);



    product.numReviews =
      product.reviews.length;




    product.rating =
      product.reviews.reduce(
        (sum,item)=>sum + item.rating,
        0
      )
      /
      product.reviews.length;




    await product.save();



    res.status(201).json({

      message:"Review added successfully",

      product

    });



  }
  catch(error){


    console.log(error);


    res.status(500).json({

      message:"Error adding review",

      error:error.message

    });


  }


});






// DELETE product
router.delete("/:id", async(req,res)=>{


try{


const deletedProduct =
await Product.findByIdAndDelete(req.params.id);



if(!deletedProduct){

return res.status(404).json({
message:"Product not found"
});

}



res.json({
message:"Product deleted successfully"
});



}
catch(error){


res.status(500).json({

message:"Error deleting product",

error:error.message

});


}


});




module.exports = router;