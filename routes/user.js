var express = require('express');
const session = require('express-session');
const { response, render } = require('../app');
var router = express.Router();
const productHelper=require('../helpers/product-helpers')
const userHelper=require('../helpers/user-helpers')
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    
    next()
  }else{
    res.redirect('/login')
  }
}


router.get('/',async function(req, res, next) {
  let user=req.session.user
  let cartCount=null
  if(req.session.user){
  cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  productHelper.getAllProducts().then((products)=>{
    res.render('user/view-products',{products,users:true,user,title:'home',cartCount})
    
  })
});
router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }else{

    res.render('user/login',({"loginErr":req.session.loginErr,title:'login'}))
    req.session.loginErr=false
  }
})
router.post('/login',(req,res)=>{
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      
      req.session.user=response.user
      req.session.loggedIn=true
      res.redirect('/')
    
    }else{
      req.session.loginErr="Invalid Email or Password "
      res.redirect('/login')
    }
  })
})
router.get('/signup',(req,res)=>{
  res.render('user/signup',({title:'signup'}))
})
router.post('/signup',(req,res)=>{
  userHelper.doSignup(req.body).then(()=>{
    
      res.render('user/login')
 
  })
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  
  res.redirect('/')
})
router.get('/cart',verifyLogin,async(req,res)=>{
  let user=req.session.user
  
  
  
  let product=await userHelper.getCartProduct(req.session.user._id)
  let totalValue=0
  if(product.length>0){
    totalValue=await userHelper.getTotalAmount(req.session.user._id)
  }
  let cartCount=await userHelper.getCartCount(req.session.user._id)
 
  res.render('user/cart',{users:true,user,product,cartCount,totalValue,title:'cart'})
  
})
router.get('/add-to-cart/:id',(req,res)=>{
  userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
  })
})
router.post('/change-product-quantity/',(req,res,next)=>{

  userHelper.changeProductQuantity(req.body).then(async(response)=>{
    
    
    res.json(response)
    
  })
  
})
router.post('/delete-cart-product/',(req,res,next)=>{
  userHelper.deleteFromCart(req.body).then((response)=>{
    
    res.json(response)
    
  })
})
router.get('/place-order',verifyLogin,async(req,res)=>{
  let total=await userHelper.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{total,user:req.session.user,title:'place order'})
})
router.post('/place-order',async(req,res)=>{
  let product=await userHelper.getCartProductList(req.body.userId)
  let totalValue=await userHelper.getTotalAmount(req.body.userId)
  userHelper.placeOrder(req.body,product,totalValue).then((orderId)=>{
    if(req.body['payment-method']==='COD'){
    res.json({codSuccess:true})
    }else{
      userHelper.generateRazorpay(orderId,totalValue).then((response)=>{
        res.json(response)
      })
    }
  })
  
})
router.get('/order-placed',(req,res)=>{
  res.render('user/order-placed',{user:req.session.user,title:'order placed'})
})
router.get('/orders',async(req,res)=>{
  let orders=await userHelper.getUserOrder(req.session.user._id)
  res.render('user/orders',{user:req.session.user,orders,users:true,title:'orders'})
})
router.get('/view-order-products/:id',async(req,res)=>{
  let products=await userHelper.getOrderProducts(req.params.id)
  res.render('user/view-order-products',{user:req.session.user,products,users:true,title:'products'})
})
router.post('/verify-payment',(req,res)=>{
  console.log(req.body);
  userHelper.verifyPayment(req.body).then(()=>{
    userHelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err);
    res.json({status:false,errMsg:'error'})
  })
})
router.get('/profile',verifyLogin,async(req,res)=>{
  
  await userHelper.getProfile(req.session.user._id).then((profile)=>{
    
    res.render('user/profile',{profile,title:'profile'})
  })
 
  
})
router.get('/buy/:id',verifyLogin,async(req,res)=>{
  cartCount=await userHelper.getCartCount(req.session.user._id)
  await userHelper.buyPage(req.params.id).then((product)=>{
   
    
    res.render('user/product',{product,users:true,user:req.session.user,cartCount,title:'product'})
  })
})
router.get('/buy/:id',verifyLogin,async(req,res)=>{
  cartCount=await userHelper.getCartCount(req.session.user._id)
  await userHelper.buyPage(req.params.id).then((product)=>{
   
    
    res.render('user/product',{product,users:true,user:req.session.user,cartCount,title:'product'})
  })
})
module.exports = router;
