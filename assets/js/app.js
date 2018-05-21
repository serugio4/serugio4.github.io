$( document ).ready(function() {   
    //Se inicializar el Slider para busqueda por precios 
    mySlider=$("#priceInterval").slider({}); 
    //Se inicializa la variable donde se van a contener los productos
    products ={};
    //Se inicializa la variable donde se van a contener las categorias
    categories={};
    //Se inicializa la variable donde se van a contener las items del carrito de compra
    shoppingCart = [];
    //Se inicializa la variable del total del carrito de compra
    totalShop = 0.0;
    //Se lee la información del archivo JSON
    readData();  
    //Cuando se despliego el carrito de compras se enfoca en el
    $('#myModal').on('shown.bs.modal', function () {
        $('#myInput').focus()
    });
    //Se Agrega un item al carrito de compras
    $('body').on('click', '.addCart_btn', function(){   
        var addProduct =$(this).attr('data-addProduct');    
        addtoCart(addProduct);          
    });
    //Se Elimina un item del carrito de compras
    $('body').on('click', '.itemCartDelete_btn', function(){   
        var removeProduct =$(this).attr('data-removeProduct');     
        var removeProductPos =$(this).attr('data-removeProductPos');  
        $(this).closest( ".itemCart" ).remove(); 
        removetoCart(removeProduct,removeProductPos);                    
    });
    //Se Ejecuto la compra total del carrito de compras
    $('body').on('click', '#acceptShop_btn', function(){   
        $( ".itemCart" ).remove(); 
            shoppingCart=[];  
            totalShop=0.0;
             $( "#totalPriceCart" ).html("Total: $"+totalShop.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') );             
    });
    //Se muestran todos los productos
    $('body').on('click', '.allFilter_btn', function(){       
          showProducts(products);
    });
    //Se Filtra por categoria seleccionada
    $('body').on('click', '.categoryFilter_btn', function(){       
        var categoryId =$(this).attr('data-categoryId');
        filterCategory(categoryId);
    });
    //Se Filtra por estado del item(Disponible,No Disponible,Mas Vendido)
    $('body').on('click', '.availableFilter_btn', function(){       
        var availableState =$(this).attr('date-available');
        availableState = (availableState === 'true');
        var bestSellerState =$(this).attr('date-bestSeller');
        bestSellerState = (bestSellerState === 'true');
        filterAvailable(availableState,bestSellerState);
    });
    //Se Filtra por precio
    $('body').on('change', '#priceInterval', function(){       
        var priceMin = mySlider.slider('getValue')[0];
        var priceMax = mySlider.slider('getValue')[1];        
        filterPrice(priceMin,priceMax);    
    });
    //Se ordena por nombre alfabetico 
    $('body').on('click', '.nameFilter_btn', function(){  
        var nameState =$(this).attr('date-nameOrder');
        nameState = (nameState === 'true');     
        products.sort(sort_by('name', nameState, function(a){return a.toUpperCase()}));         
        showProducts(products);    
    });
    //Se ordena por orden precio
    $('body').on('click', '.priceFilter_btn', function(){  
        var priceState =$(this).attr('date-priceOrder');
        priceState = (priceState === 'true');     
        products.sort(sort_by('price', priceState, function(a){ return parseFloat(a.replace(".", ""))} ));       
        showProducts(products);    
    });
    //Se realiza busqueda
    $('body').on('keyup', '#searchFilter', function(){       
        var toSearch = $(this).val();             
        searchFilter(toSearch);    
    });    
});

//Funcion que obtiene los productos del JSON
function readData(){
    $.getJSON( "data/dataPruebaRappi.json", function( data ) {       
        products = data.products;
        categories = data.categories;
        showProducts(products);
        showCategories(categories);
    });  
}
//Funcion para mostrar los items agregados al carro en el Modal
function addtoCart(productId){ 
    $.each(products, function( indexProduct, product ) {
         if(productId == product.id ){                        
            shoppingCart.push(product);
             var htmlItem = "";
                        htmlItem += '<tr class="itemCart">';            
                        htmlItem += '<td>'+product.name+'</td>';
                        htmlItem += '<td>'+product.description+'</td>';
                        htmlItem += '<td>$'+product.price+'</td>';
                        htmlItem += '<td><button class="btn btn-danger itemCartDelete_btn"  data-title="Delete" data-removeProduct="'+product.id+'" data-removeProductPos="'+(shoppingCart.length-1)+'" data-toggle="modal" data-target="#delete" ><span class="glyphicon glyphicon-trash"></span></button></td>';
                        htmlItem += '</tr>';  
                         $( ".shoppingCartList" ).append(htmlItem );

                           totalShop += parseFloat(product.price.replace(".", ""));
                           $( "#totalPriceCart" ).html("Total: $"+totalShop.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') );
        } 
    });
}

//Funcion para remover los items que ya no se van comprar del carrito de compras
function removetoCart(productId,productPos){
    shoppingCart.splice(productPos, 1);
    $.each(products, function( indexProduct, product ) {
         if(productId == product.id ){
            totalShop -= parseFloat(product.price.replace(".", ""));
            $( "#totalPriceCart" ).html("Total: $"+totalShop.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') );
        } 
    });
}

//Se buscan los productos que pertenencen a una categoria y se muestra
function filterCategory(categoryId){
    var listProducts = [];
    $.each(products, function( indexProduct, product ) {
         $.each( product.categories, function(posProductCategory, productCategory  ) {              
                    if(categoryId == productCategory ){                        
                        listProducts.push(product);
                    }                 
            });
    });
    showProducts(listProducts);
}
//Se buscan los productos que tengan alguno de los siguientes estados Disponible No Disponible Más Vendidos
function filterAvailable(availableState,bestSellerState){
    var listProducts = [];
    if(bestSellerState){
         $.each(products, function( indexProduct, product ) {
        
            if(bestSellerState === product.best_seller ){                        
                listProducts.push(product);
            }     
        });
    }else{
        $.each(products, function( indexProduct, product ) {
            if(availableState === product.available ){                        
                listProducts.push(product);
            }     
        });
    }        
    showProducts(listProducts);
}
//Se busca los item que esten dentro del rango de precios seleccionados
function filterPrice(priceMin,priceMax){
    var listProducts = [];
    $.each(products, function( indexProduct, product ) {
        if( parseFloat(product.price.replace(".", ""))  >= priceMin  &&  parseFloat(product.price.replace(".", "")) <= priceMax  ){                        
            listProducts.push(product);
        }     
    });   
    showProducts(listProducts);
}
//Se realiza la bsuqeda de la caja de texto
function searchFilter(toSearch) {
  var listProducts = [];
  toSearch = trimString(toSearch).toLowerCase();
  for(var i=0; i<products.length; i++) {   
      if(products[i]['name'].toLowerCase().indexOf(toSearch)!=-1){
        if(!itemExists(listProducts, products[i])) listProducts.push(products[i]);
      }   
  }
  showProducts(listProducts);
} 
// Se muestran los productos en forma de malla ya sean filtrados o no
function showProducts(showList){
    $('.item').remove();
    $.each(showList, function( indexProduct, product ) {
        var htmlItem = "";
        htmlItem += '<div class="item  col-xs-12 col-sm-6 col-md-4 col-lg-4">';            
        htmlItem += '<div class="thumbnail item">';
        if(product.best_seller){
            htmlItem += '<span class="notify-badge availableFilter_btn" date-available="false" date-bestSeller="true">Más Vendido</span>';               
        }
        htmlItem += '<img class="group list-group-image" src='+product.img+' alt="" />';
        htmlItem += '<div class="caption">';
        htmlItem += '<h4 class="group inner list-group-item-heading">';
        htmlItem += product.name+'</h4>';
        htmlItem += '<p class="group inner list-group-item-text">';
        htmlItem += product.description+'</p>';
        if(product.available){
            htmlItem += '<p class="group inner list-group-item-text alert alert-success availableFilter_btn" date-available="true" date-bestSeller="false">Disponible</p>';               
        }else{
            htmlItem += '<p class="group inner list-group-item-text alert alert-danger availableFilter_btn" date-available="false" date-bestSeller="false">No Disponible</p>';
        }
        htmlItem += '<div class="row">';
        htmlItem += '<div class="col-xs-12 col-md-6">';
        htmlItem += '<p class="lead">';
        htmlItem += '$'+product.price+'</p>';
        htmlItem += '</div>';
        htmlItem += '<div class="col-xs-12 col-md-6">';
        if(product.available){
        htmlItem += '<a class="btn btn-success addCart_btn" data-addProduct="'+product.id+'" href="#">Agregar</a>';
        }else{
            htmlItem += '<a class="addCart_btn btn btn-success" href="#" disabled>Agregar</a>';  
        }
        htmlItem += '</div>';     
        htmlItem += '</div>';
        htmlItem += '<div class="btn-group btn-group-justified" role="group" aria-label="...">';  

        $.each( product.categories, function(posProductCategory, productCategory  ) {
            
            $.each( categories, function(posCategory, category  ) {
                if(category.categori_id == productCategory ){                        
                    htmlItem += '<div class="btn-group" role="group">';    
                    htmlItem += '<button type="button" class="btn btn-default categoryFilter_btn " data-categoryId="'+category.categori_id+'">'+category.name+'</button>';    
                    htmlItem += '</div>';
                } 
            });
        });

        htmlItem += '</div>';   
        htmlItem += '</div>';
        htmlItem += '</div>';
        htmlItem += '</div>';
        $( "#products" ).append(htmlItem );          
    });
}
//Se agregan los botones de las categorias para filtrar
function showCategories(showList){    
      $.each(showList, function( indexCategory, category ) {          
           var htmlItem = "";
           htmlItem += "<li>";
           htmlItem += " <a class='categoryFilter_btn' data-categoryId='"+category.categori_id+"' href='#'>"+category.name+"</a>";
           htmlItem += " </li>";          
           $( ".filterCategory" ).append(htmlItem );  
      });
}
//Funcion para ordenar por campo ascendente o descendentemente
var sort_by = function(field, reverse, primer){
   var key = function (x) {return primer ? primer(x[field]) : x[field]};
   return function (a,b) {
	  var A = key(a), B = key(b);
	  return ( (A < B) ? -1 : ((A > B) ? 1 : 0) ) * [-1,1][+!!reverse];                  
   }
}
//Se eliminan los espacios cuando se busca un item
function trimString(s) {
  var l=0, r=s.length -1;
  while(l < s.length && s[l] == ' ') l++;
  while(r > l && s[r] == ' ') r-=1;
  return s.substring(l, r+1);
}
//Se verifica si un item esta ordenado o no
function compareObjects(o1, o2) {
  var k = '';
  for(k in o1) if(o1[k] != o2[k]) return false;
  for(k in o2) if(o1[k] != o2[k]) return false;
  return true;
}
//Se verifica si un item ya se encuentra filtrado en la busqueda por nombre
function itemExists(haystack, needle) {
  for(var i=0; i<haystack.length; i++) if(compareObjects(haystack[i], needle)) return true;
  return false;
}


