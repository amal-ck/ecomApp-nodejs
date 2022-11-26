const { response } = require("../../app")

function viewImage(event){
    document.getElementById('imgView').src=URL.createObjectURL(event.target.files[0])
}
function addToCart(proId){
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        
        success:(response)=>{
            if(response.status){
                location.reload()
            }
           
        
    }
    })
}
function changeQuantity(cartId,proId,userId,count){
    let quantity=parseInt(document.getElementById(proId).innerHTML)
    count= parseInt(count)
    $.ajax({
        url:'/change-product-quantity/',
        data:{
            
            cart:cartId,
            product:proId,
            count:count,
            quantity:quantity,
            user:userId
        },
        method:'post',
        success:(response)=>{
            if(response.removeProduct){
                alert("Product Removed from the cart")
                location.reload()
            }else{
                document.getElementById(proId).innerHTML=quantity+count
                
                location.reload()
            }
            

        }

        
    })
}
function deleteCartProduct(cartId,proId){
    
    $.ajax({
        url:'/delete-cart-product/',
        data:{
            cart:cartId,
            product:proId
        },
        method:'post',
        success:(response)=>{
            if(response.removeProduct){
                alert("product deleted from cart")
            location.reload()
            }
        }
    })
}
