


const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "ru3fj88c8goa",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: 
  "tbXTcsvlrP_oOQGzyF-8aT3GpsH0SHj4rYJ_QEf8qQg"
});
console.log(client)

const cartbtn=document.querySelector(".cart-btn")
const closecartbtn=document.querySelector(".close-cart")
const clearcartbtn=document.querySelector(".clear-cart")
 const cartDOM=document.querySelector(".cart")
 const cartoverlay=document.querySelector(".cart-overlay")
 const cartItems=document.querySelector(".cart-items")
 const cartTotal=document.querySelector(".cart-total")
 const cartcontent=document.querySelector(".cart-content")
 const productsDOM=document.querySelector(".products-center")

 let cart=[]
 let buttonsDOM=[]

 //getting the products
 class Products{
   async getProducts(){
    try{

     let contentful= await client.getEntries({content_type:"comfyHouseProducts"})

    //let result= await fetch("products.json")
    //let data  = await result.json()
    let products=contentful.items
    products=products.map(item=>{
    const {title,price}=item.fields
    const {id}=item.sys
    const image=item.fields.image.fields.file.url
    return {title,price,id,image}
  })
 return products
   }catch (error){
    console.log(error)
    }

   }
 }
//display products
 class UI{
displayProducts(products){
  let result='';
  products.forEach(product=>{
    result +=`
      <article class="product">
      <div class="img-container">
        <img src=${product.image} alt="product" class="product-img">
        <button class="bag-btn" data-id=${product.id}>
          <i class="fas fa-shopping-cart"></i>
          add to bag
        </button>
    </div>
    <h3>${product.title}</h3>
    <h4>$${product.price}</h4>
    </article>`

  })

  productsDOM.innerHTML=result
}
getbagbuttons(){
  const buttons=[...document.querySelectorAll(".bag-btn")]
  buttonsDOM=buttons
  buttons.forEach(button=>{
    let id=button.dataset.id;
    let inCart=cart.find(item=>item.id===id);
    if (inCart){
      button.innerText="IN Cart"
      button.disabled=true
    }
      button.addEventListener("click",event=>{
        event.target.innerText="In Cart"
        event.target.disabled=true
        //get products
        let cartItem={...Storage.getProduct(id), amount:1}
        cart=[...cart,cartItem]
        Storage.saveCart(cart)
        this.setCartValues(cart)
        this.addCartItem(cartItem)
        this.showCart()

      })

  })
}
setCartValues(cart){
  let temptotal=0;
  let itemstotal=0;
  cart.map(item=>{
    temptotal+=item.price*item.amount
    itemstotal+=item.amount
  })
  cartTotal.innerText=parseFloat(temptotal.toFixed(2))
  cartItems.innerText=itemstotal
}
addCartItem(item){
  const div=document.createElement('div')
  div.classList.add('cart-item')
  div.innerHTML=  `<img src=${item.image} alt="product"/>
                      <div>
                      <h4>${item.title}</h4>
                      <h5>$${item.price}</h5>
                     <span class="remove-item" data-id=${item.id}>remove</span>
                     </div>
                        <div>
                  <i class="fas fa-chevron-up" data-id=${item.id}></i>
                  <p class="item-amount">${item.amount}</p>
                  <i class="fas fa-chevron-down" data-id=${item.id}></i>
                  <div/>`

                  cartcontent.appendChild(div)


}
showCart(){
  cartoverlay.classList.add("transparentBcg")
  cartDOM.classList.add("showCart")

}
setupAPP(){
  cart=Storage.getCart()
  this.setCartValues(cart)
  this.populateCart(cart)
  cartbtn.addEventListener('click',this.showCart)
  closecartbtn.addEventListener('click', this.hideCart)
}
populateCart(cart){
  cart.forEach(item=>this.addCartItem(item))
}
hideCart(){
  cartoverlay.classList.remove("transparentBcg")
  cartDOM.classList.remove("showCart")
}
cartlogic(){
  clearcartbtn.addEventListener('click',()=>{this.clearcart()})
  cartcontent.addEventListener('click',event=>{
    if (event.target.classList.contains("remove-item")){
      let removeItem=event.target
      let id=removeItem.dataset.id
      cartcontent.removeChild(removeItem.parentElement.parentElement)
      this.removeItem(id)
    }
    else if(event.target.classList.contains("fa-chevron-up")){
      let addAmount=event.target
      let id= addAmount.dataset.id
      let tempItem=cart.find(item=>item.id===id)
      tempItem.amount=tempItem.amount+1
      Storage.saveCart(cart)
      this.setCartValues(cart)
      addAmount.nextElementSibling.innerText=tempItem.amount
    }
    else if (event.target.classList.contains("fa-chevron-down")){
      let lowerAmount=event.target
      let id=lowerAmount.dataset.id
      let  tempItem=cart.find(item=>item.id===id)
      tempItem.amount=tempItem.amount-1
      if (tempItem.amount>0){
        Storage.saveCart(cart)
        this.setCartValues(cart)
        lowerAmount.previousElementSibling.innerText=tempItem.amount
      }
      else{
        cartcontent.removeChild(lowerAmount.parentElement.parentElement)
        this.removeItem(id)

      }


    }
  })
}
 clearcart(){
   let cartItems=cart.map(item=>item.id)
   cartItems.forEach(id=>this.removeItem(id))
    while(cartcontent.children.length>0){
     cartcontent.removeChild(cartcontent.children[0])
   }
    this.hideCart()
  }
 removeItem(id){
   cart=cart.filter(item=>item.id !==id)
   this.setCartValues(cart)
   Storage.saveCart(cart)
   let button=this.getSingleButton(id)
   button.disabled=false
   button.innerHTML=`<i class="fas fa-shopping-cart"></i>add to cart`
 }
 getSingleButton(id){
   return buttonsDOM.find(button=>button.dataset.id===id)
 }
}

 class Storage{
  static saveProducts(products){
  localStorage.setItem("products",JSON.stringify(products))
}
static getProduct(id){
  let products=JSON.parse(localStorage.getItem('products'))
  return products.find(product=>product.id===id)
}
static saveCart(cart){
  localStorage.setItem("cart",JSON.stringify(cart))
}
static getCart(){
  return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
}
 }
 document.addEventListener("DOMContentLoaded",()=>{
  const ui=new UI()
  const products=new Products()
  //setup app////////////
  ui.setupAPP()
  products.getProducts().then(products=> {
    ui.displayProducts(products)
  Storage.saveProducts(products)
}).then(()=>{
  ui.getbagbuttons()
  ui.cartlogic()
})
})
