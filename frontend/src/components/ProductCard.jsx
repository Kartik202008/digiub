import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {

  const { addToCart } = useCart();


  console.log("PRODUCT CARD ID:", product._id);


  const handleAddToCart = (e) => {

    e.preventDefault(); // stop link navigation


    addToCart({

      id: product._id,

      name: product.name,

      price: Number(product.price),

      image: product.images?.[0] || "",

      quantity: 1

    });

  };


  return (

    <Link to={`/product/${product._id}`}>

      <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">


        {/* Product Image */}

        <img

          src={
            product.images && product.images.length > 0
              ? product.images[0]
              : "https://via.placeholder.com/300x300?text=No+Image"
          }

          alt={product.name}

          className="w-full h-48 object-contain rounded"

        />



        {/* Product Name */}

        <h3 className="font-semibold text-gray-800 mt-3 line-clamp-2">

          {product.name}

        </h3>




        {/* Rating */}

        <div className="text-yellow-500 mt-2">

          {"★".repeat(
            Math.round(product.rating || 0)
          )}

          {"☆".repeat(
            5 - Math.round(product.rating || 0)
          )}

        </div>





        {/* Price */}

        <p className="text-blue-600 font-bold text-lg mt-2">

          ₹{product.price}

        </p>





        {/* Original Price */}

        {product.originalPrice && (

          <p className="text-gray-400 line-through">

            ₹{product.originalPrice}

          </p>

        )}






        {/* Discount */}

        {product.discount > 0 && (

          <p className="text-green-600 font-semibold">

            {product.discount}% OFF

          </p>

        )}







        {/* Add To Cart Button */}

        <button

          onClick={handleAddToCart}

          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"

        >

          Add to Cart

        </button>




      </div>


    </Link>

  );

}


export default ProductCard;