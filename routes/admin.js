var express = require('express');
const {render, response} = require('../app')
var router = express.Router();
var productHelper=require('../helpers/product-helpers');
const userHelper = require('../helpers/user-helpers');
const verifyadminLogin=(req,res,next)=>{
  if(req.session.admin){
    
    next()
  }else{
    res.redirect('/admin/login')
  }
}

router.get('/login',(req,res)=>{
  if(req.session.admin){
    res.redirect('/admin')
  }else{

    res.render('admin/admin-login',({"loginErr":req.session.adminLoginErr,title:'login'}))
    req.session.adminLoginErr=false
  }
})
router.post('/login',(req,res)=>{
  userHelper.doAdminLogin(req.body).then((response)=>{
    if(response.status){
      
      req.session.admin=response.admin
      req.session.LoggedIn=true
      res.redirect('/admin')
    
    }else{
      req.session.adminLoginErr="Invalid Email or Password "
      res.redirect('/admin/login')
    }
  })
})

router.get('/', verifyadminLogin,function(req, res, next) {
  productHelper.getAllProducts().then((products)=>{
    res.render('admin/view-products',{admin:true,products,title:'admin'})
  })
});
router.get('/add-product',verifyadminLogin,function(req,res){
  res.render('admin/add-product',{admin:true,title:'addproduct-admin'})
})
router.post('/add-product',(req,res)=>{

  productHelper.addProduct(req.body,(insertedId)=>{
    let image=req.files.Image
    image.mv('./public/product-images/'+insertedId+'.jpg',(err)=>{
      if(!err){
        res.render("admin/add-product",{admin:true,title:'add product'})
      }else{
        console.log(err);
      }
    })
    
  })
})
router.get('/delete-product/:id',verifyadminLogin,(req,res)=>{
  let proId=req.params.id
  productHelper.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/')
  })
})
router.get('/edit-product/:id',verifyadminLogin,async (req,res)=>{
  let product=await productHelper.getProductDetails(req.params.id)
  console.log(product);
  res.render('admin/edit-product',{product,admin:true,title:'edit product'})
})
router.post('/edit-product/:id',verifyadminLogin,(req,res)=>{
  let id=req.params.id
  productHelper.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    if(req?.files?.Image){
      let image=req.files.Image
      image.mv('./public/product-images/'+id+'.jpg')
      }
  })
})
router.get('/all-orders',verifyadminLogin,async(req,res)=>{
  const status='placed'
  let orders= await userHelper.getAllOrders(status)
  
  
    res.render('admin/view-orders',{orders,admin:true,title:'all orders'})
  
     
 })
 router.get('/view-user',verifyadminLogin,async(req,res)=>{
  let user=await userHelper.getAllUser()
  res.render('admin/view-user',{user,admin:true,title:'all users'})
 })
 router.post('/ship-product/:id',(req,res,next)=>{
  userHelper.shipProduct(req.params.id).then((response)=>{
    
    res.json(response)
    
  })
})
router.get('/view-shipped-orders',verifyadminLogin,async(req,res)=>{
  const status='shipped'
  let orders= await userHelper.getAllOrders(status)
  
  
    res.render('admin/shipped-orders',{orders,admin:true,title:'shipped products'})
  
     
 })

module.exports = router;
