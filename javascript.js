$(document).ready(function(){  

var products = [
	{
		name: "shirt",
		image: "images/shirt.jpg",
		price: 10
	},
	{
		name: "pants",
		image: "images/pants.jpg",
		price: 9
	},
	{
		name: "long socks",
		image: "images/long-socks.jpg",
		price: 8.99
	},
	{
		name: "short socks",
		image: "images/short-socks.jpg",
		price: 7
	},
	{
		name: "hat",
		image: "images/hat.jpg",
		price: 6
	},
	{
		name: "bra",
		image: "images/bra.jpg",
		price: 44
	},
	{
		name: "belt",
		image: "images/belt.jpg",
		price: 5
	},
	{
		name: "shoes",
		image: "images/shoes.jpg",
		price: 55.50
	}
];

 $(".products").shopcart(".cart",{
     products_load_json: JSON.stringify(products),
     products_load_url: "https://wpwith.us/experis/cart-products-ajax.php",
     add_to_cart_image_url: "https://www.paypalobjects.com/webstatic/en_US/i/btn/png/btn_addtocart_120x26.png",
	paypal: {
		lc: 'he_IL',
		business: "ronny@hoojima.com",
		image_url: 'http://www.experis-software.co.il/wp-content/uploads/2015/01/logo.jpg',
		return: 'http://www.experis-software.co.il/management/%D7%A8%D7%95%D7%A0%D7%99-%D7%A9%D7%A8%D7%A8/',
		cancel_return: 'http://www.experis-software.co.il/'
		}
 });

}); 
