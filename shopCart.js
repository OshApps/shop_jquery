
(function ( $ ) {
    var defaultOptions={
        add_to_cart_image_url: undefined,
        products_load_json: "",
        products_load_url: undefined,
        url_load_page_count: 4,
        paypal: {
            currency_code: "USD",
            lc: 'en_US',
            business: undefined,
            image_url: '',
            return:'',
            cancel_return:''
            }
        }
    
    $.fn.shopcart = function(cartContainer, options) {  

        options=$.extend(defaultOptions,options);

        if(typeof cartContainer == 'string' || cartContainer instanceof String)
            {
            cartContainer=$(cartContainer);
            }

        var shop={
            currentProductNumber:1,
            isLoadingProducts:false,
            hasMoreProduct:true,
            productsContainer:undefined,
            cartContainer:undefined,
            options:undefined,

            init:function(productsContainer,cartContainer,options){
                this.productsContainer=productsContainer;
                this.cartContainer=cartContainer;
                this.options=options;

                this.loadProducts();

                this.addCart();
                
                var self=this;

                $(window).scroll(function(){
                    self.onScroll();
                    });
                },
                
            loadProducts:function(){
            
                if(this.options.products_load_url)
                    {
                    var self=this;
                    var listener=function(){
                        if(self.productsContainer.height() < $(window).height() )
                            {
                            self.loadProductsFromUrl(listener);
                            }
                        }
                    
                    this.loadProductsFromUrl(listener);

                    $(window).resize(listener);
                    
                    }else
                        {
                        this.loadProductsFromJson();
                        }
                },

            loadProductsFromJson:function(){
                this.addProducts(JSON.parse(this.options.products_load_json));
                },
                
            loadProductsFromUrl:function(onloadfinishedListener){
                
                if(!this.isLoadingProducts && this.hasMoreProduct)
                    {
                    this.isLoadingProducts=true;

                    var self=this;
                   
                    $.post(this.options.products_load_url+"/"+this.currentProductNumber+"/"+(this.currentProductNumber+this.options.url_load_page_count-1),{from:this.currentProductNumber,to:this.currentProductNumber+this.options.url_load_page_count-1},function(data){
                        
                        if(Array.isArray(data))
                            {
                            if(data.length > 0)
                                {
                                self.addProducts(data);
                                self.currentProductNumber=self.currentProductNumber+self.options.url_load_page_count;
                                }else
                                    {
                                    self.hasMoreProduct=false;
                                    }    
                            }  
                         
                        self.isLoadingProducts=false;

                        if(onloadfinishedListener)
                            {
                            onloadfinishedListener();    
                            }
                        });
                    
                    }
                },
            
            onScroll:function(){
                var cartContainerTop=this.cartContainer.offset().top;
                var htmlCartWrapper=this.cartContainer.find(".cart_wrapper");
                
                if($(window).scrollTop() > cartContainerTop)
                    {
                    htmlCartWrapper.attr("class","cart_wrapper cart_wrapper_fixed"); 
                    }else
                        {
                        htmlCartWrapper.attr("class","cart_wrapper"); 
                        }
                    
                var productsContainerBottom=this.productsContainer.offset().top + this.productsContainer.height(); 
 
                if(this.options.products_load_url && ( ($(window).scrollTop() + $(window).height()) > productsContainerBottom - 50 ) )
                    {
                    this.loadProductsFromUrl(); 
                    }  
                },

            addCart:function()
                {
                this.cartContainer.append(this.createCartWrapper());
                },

            createCartWrapper:function()
                {
                var htmlCartWrapper=$("<div>").addClass("cart_wrapper"); 
                
                $("<div>").addClass("cart_header")
                        .text("Cart")
                        .appendTo(htmlCartWrapper);
                
                htmlCartWrapper.append(this.createCartTable());
                
                htmlCartWrapper.append(this.createPaypalButton());

                return  htmlCartWrapper;
                },
            
            createCartTable:function()
                {
                var htmlCartTable=$("<table>").addClass("cart_products"); 
                
                htmlCartTable.append(this.createCartRowTitle());
                htmlCartTable.append(this.createCartRowTotal());
                
                return  htmlCartTable;
                },
            
            createCartRowTitle:function()
                {
                var htmlCartRow=$("<tr>").addClass("cart_row cart_row_title"); 
                
                $("<td>").addClass("cart_title_col_delete")
                        .appendTo(htmlCartRow);

                $("<td>").addClass("cart_title_col_name")
                        .text("Product")
                        .appendTo(htmlCartRow);

                $("<td>").addClass("cart_title_col_qty")
                        .text("Qty")
                        .appendTo(htmlCartRow);

                $("<td>").addClass("cart_title_col_price")
                        .text("Price")
                        .appendTo(htmlCartRow);

                $("<td>").addClass("cart_title_col_total_price")
                        .text("Total")
                        .appendTo(htmlCartRow);
                
                return  htmlCartRow;
                },
            
            createCartRowTotal:function()
                {
                var htmlCartRow=$("<tr>").addClass("cart_row cart_row_total"); 
                
                $("<td>").appendTo(htmlCartRow);

                $("<td>").addClass("cart_total_col_text")
                        .text("Total")
                        .appendTo(htmlCartRow);

                $("<td>").addClass("cart_total_col_qty")
                        .text("0")
                        .appendTo(htmlCartRow);

                $("<td>").appendTo(htmlCartRow);

                $("<td>").addClass("cart_total_col_price price")
                        .text("0")
                        .appendTo(htmlCartRow);
                
                return  htmlCartRow;
                },
            
            createPaypalButton:function()
                {
                var htmlPaypalButtonWrapper=$("<div>").addClass("paypal_button_wrapper"); 
                var self=this;

                $("<input>",{type:"image", src:"images/paypal_button.png"} )
                    .addClass("paypal_button")
                    .appendTo(htmlPaypalButtonWrapper)
                    .click(function(){
                        if(self.options.paypal.business && self.cartContainer.find(".cart_row_product").length > 0)
                            {
                            self.sendPaymentRequest();   
                            }
                        });
                
                return  htmlPaypalButtonWrapper;
                },
            
            sendPaymentRequest:function()
                {
                var paymentForm=$("<form>",{action:"https://www.paypal.com/cgi-bin/webscr", method:"post",target:"_blank"})    

                paymentForm.append(this.createHiddenInput("cmd","_cart"));
                paymentForm.append(this.createHiddenInput("upload","1"));
                paymentForm.append(this.createHiddenInput("business",options.paypal.business));
                paymentForm.append(this.createHiddenInput("currency_code",options.paypal.currency_code));
                paymentForm.append(this.createHiddenInput("lc",options.paypal.lc));
                paymentForm.append(this.createHiddenInput("no_note","0"));
                paymentForm.append(this.createHiddenInput("image_url",options.paypal.image_url));
                paymentForm.append(this.createHiddenInput("no_shipping","0"));
                paymentForm.append(this.createHiddenInput("return",options.paypal.return));
                paymentForm.append(this.createHiddenInput("cancel_return",options.paypal.cancel_return));
                
                this.addItems(paymentForm);
                
                paymentForm.appendTo(this.cartContainer);

                paymentForm.submit();

                paymentForm.remove();
                },
            
            createHiddenInput:function(name,value)
                {
                return $("<input>",{type:"hidden", name:name, value:value});    
                },
            
            addItems:function(paymentForm)
                {
                var itemNumber=1;
                var self=this;

                this.cartContainer.find(".cart_row_product").each(function(){
                    self.addItemInputs(paymentForm,$(this),itemNumber);
                    itemNumber++;
                    });   
                },
            
            addItemInputs:function(paymentForm,htmlCartRowProduct,itemNumber)
                {
                var itemName=htmlCartRowProduct.find(".cart_product_col_name").text();    
                paymentForm.append(this.createHiddenInput("item_name_"+itemNumber, itemName) );

                var itemQty=htmlCartRowProduct.find(".cart_product_qty_input").val();    
                paymentForm.append(this.createHiddenInput("quantity_"+itemNumber, itemQty) ); 

                var itemPrice=htmlCartRowProduct.find(".cart_product_col_price").text();    
                paymentForm.append(this.createHiddenInput("amount_"+itemNumber, itemPrice) );   
                },

            addProducts:function(products)
                {
                var htmlProducts=[];

                for (var i = 0; i < products.length; i++) 
                    {
                    htmlProducts.push(this.createProduct(products[i]));  
                    }
                
                this.productsContainer.append(htmlProducts)
                },

            createProduct:function(product)
                {
                var htmlProduct=$("<div>").addClass("product"); 
                var htmlProductWrapper=$("<div>").addClass("product_wrapper").appendTo(htmlProduct);              

                htmlProductWrapper.append($("<img>" ,{src:product.image}).addClass("product_img"))
                                .append($("<div>" ).addClass("product_name").text(product.name));
                
                $("<div>").addClass("product_info")
                        .append($("<div>" ).addClass("product_price price").text(product.price))
                        .append(this.createProductButton())
                        .appendTo(htmlProductWrapper);

                htmlProduct.data("product",{name:product.name,price:product.price});
                return  htmlProduct;
                },
            
            createProductButton:function()
                {
                var htmlProductButtonWrapper=$("<div>").addClass("product_button_wrapper")
                var attributes;

                if(this.options.add_to_cart_image_url)
                    {
                    attributes={
                        type:"image", 
                        src:this.options.add_to_cart_image_url
                        };
                    }else
                        {
                        attributes={
                            type:"button", 
                            value:"Add to Cart"
                            };
                        }

                $("<input>",attributes )
                    .addClass("product_button")
                    .appendTo(htmlProductButtonWrapper)
                    .click(function(){
                        shop.addToCrat($(this).closest(".product"))
                    });

                return htmlProductButtonWrapper;
                },

            addToCrat:function(htmlProduct)
                {
                var product=htmlProduct.data("product");
                var htmlCartProductColName=undefined;

                this.cartContainer.find(".cart_products  .cart_product_col_name").each(function(){
                    if($(this).text() === product.name )
                        {
                        htmlCartProductColName=$(this); 
                        return false;
                        }
                });

                var htmlCartRow,action;

                if(htmlCartProductColName)
                    {
                    htmlCartRow=htmlCartProductColName.closest(".cart_row");

                    action=function(){
                        shop.addQty(htmlCartRow);
                        }
                    
                    }else
                        {
                        isNewHtmlCartRow=true;
                        htmlCartRow=this.createCartRow(product);

                        this.cartContainer.find(".cart_products .cart_row_total").before(htmlCartRow);

                        action=function(){
                            shop.updateCartRowTotal();
                            }
                        }
                    
                this.animateAddToCart(htmlProduct,htmlCartRow,action)
                },
            
            animateAddToCart:function(htmlProduct,htmlCartRow,action)
                {
                var htmlProductImg=htmlProduct.find(".product_img");
                var isHtmlCartRowStartHidden=false;

                if(!htmlCartRow.is(":visible"))
                    {
                    isHtmlCartRowStartHidden=true;
                    htmlCartRow.show();   
                    }

                var htmlCartRowLeft=htmlCartRow.offset().left;
                var htmlCartRowTop=htmlCartRow.offset().top;

                if(isHtmlCartRowStartHidden)
                    {
                    htmlCartRow.hide();
                    }

                htmlProductImg.clone().css({position:"absolute",left: htmlProductImg.offset().left+"px",top: htmlProductImg.offset().top+"px",width:htmlProductImg.width()+"px", height:htmlProductImg.height()+"px"})
                                    .appendTo("body")
                                    .animate({left: htmlCartRowLeft+"px",top: htmlCartRowTop+"px",width:"30px", height:"30px",opacity:0.3}
                                                , 1000, function() {
                                                        $(this).remove();
                                                        htmlCartRow.show();
                                                        action();
                                                    });
                },
                
            createCartRow:function(product)
                {
                var htmlCartRow=$("<tr>").addClass("cart_row cart_row_product");
                
                $("<td>").append(this.createCartProductColDeleteButton())
                        .addClass("cart_product_col_delete")
                        .appendTo(htmlCartRow);

                htmlCartRow.append($("<td>").addClass("cart_product_col_name").text(product.name));

                $("<td>").append(this.createCartProductQtyInput())
                        .addClass("cart_product_col_qty")
                        .appendTo(htmlCartRow);

                htmlCartRow.append($("<td>").addClass("cart_product_col_price price").text(product.price));
                htmlCartRow.append($("<td>").addClass("cart_product_col_total_price price").text(product.price));
                htmlCartRow.hide();

                return htmlCartRow;
                },
            
            createCartProductColDeleteButton:function()
                {
                return $("<div>").addClass("cart_product_col_delete_button")
                                .text("X")
                                .click(function(){
                                    shop.deleteCartRow($(this));
                                });
                },
            
            deleteCartRow:function(cartProductColDeleteButton)
                {
                cartProductColDeleteButton.closest(".cart_row").fadeOut(300,function(){
                    $(this).remove();
                    shop.updateCartRowTotal();
                    });
                },
            
            createCartProductQtyInput:function()
                {
                return $("<input>").attr('type', 'number')
                                .attr('min', '1')
                                .attr('value', '1')
                                .addClass("cart_product_qty_input")
                                .change(function(){
                                        shop.updateCartProductColTotalPrice($(this).closest(".cart_row"),$(this));
                                    });
                },

            addQty:function(htmlCartRow)
                {
                var htmlCartProductQtyInput=htmlCartRow.find(".cart_product_qty_input");
                var qty=parseInt(htmlCartProductQtyInput.val());

                htmlCartProductQtyInput.val(qty + 1 );

                this.updateCartProductColTotalPrice(htmlCartRow,htmlCartProductQtyInput);
                },
            
            updateCartProductColTotalPrice:function(htmlCartRow,htmlCartProductQtyInput)
                {
                var totalPrice=parseFloat( parseFloat(htmlCartRow.find(".cart_product_col_price").text()) * parseInt(htmlCartProductQtyInput.val())).toFixed(2);
                
                htmlCartRow.find(".cart_product_col_total_price").text(totalPrice) ;

                this.updateCartRowTotal();
                },

            updateCartRowTotal:function()
                {
                var totalQty=0;
                var totalPrice=0;

                this.cartContainer.find(".cart_products .cart_product_qty_input").each(function(){
                    totalQty+=parseInt($(this).val());
                    });
                
                this.cartContainer.find(".cart_products .cart_product_col_total_price").each(function(){
                    totalPrice+=parseFloat($(this).text());
                    });
                
                this.cartContainer.find(".cart_products .cart_row_total .cart_total_col_qty").text(totalQty);
                this.cartContainer.find(".cart_products .cart_row_total .cart_total_col_price").text(totalPrice.toFixed(2));
                }
            };

    shop.init(this,cartContainer,options);

    return this;
    };
})(jQuery);
