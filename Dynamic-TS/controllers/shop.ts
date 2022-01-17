import {Product} from '../models/product';
import {Cart} from '../models/cart';

exports.getProducts = (req: any, res: { render: (arg0: string, arg1: { prods: any; pageTitle: string; path: string; }) => void; }, next: any) => {
  Product.fetchAll((products: any) => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  });
};

exports.getProduct = (req: { params: { productId: any; }; }, res: { render: (arg0: string, arg1: { product: any; pageTitle: any; path: string; }) => void; }, next: any) => {
  const prodId = req.params.productId;
  Product.findById(prodId, (product: { title: any; }) => {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    });
  });
};

exports.getIndex = (req: any, res: { render: (arg0: string, arg1: { prods: any; pageTitle: string; path: string; }) => void; }, next: any) => {
  Product.fetchAll((products: any) => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  });
};

exports.getCart = (req: any, res: { render: (arg0: string, arg1: { path: string; pageTitle: string; products: { productData: any; qty: any; }[]; }) => void; }, next: any) => {
  Cart.getCart((cart: { products: any[]; }) => {
    Product.fetchAll((products: any) => {
      const cartProducts = [];
      for (var product of products) {
        const cartProductData = cart.products.find(
          (          prod: { id: any; }) => prod.id === product.id
        );
        if (cartProductData) {
          cartProducts.push({ productData: product, qty: cartProductData.qty });
        }
      }
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartProducts
      });
    });
  });
};

exports.postCart = (req: { body: { productId: any; }; }, res: { redirect: (arg0: string) => void; }, next: any) => {
  const prodId = req.body.productId;
  Product.findById(prodId, (product: { price: any; }) => {
    Cart.addProduct(prodId, product.price);
  });
  res.redirect('/cart');
};

exports.postCartDeleteProduct = (req: { body: { productId: any; }; }, res: { redirect: (arg0: string) => void; }, next: any) => {
  const prodId = req.body.productId;
  Product.findById(prodId, (product: { price: any; }) => {
    Cart.deleteProduct(prodId, product.price);
    res.redirect('/cart');
  });
};

exports.getOrders = (req: any, res: { render: (arg0: string, arg1: { path: string; pageTitle: string; }) => void; }, next: any) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req: any, res: { render: (arg0: string, arg1: { path: string; pageTitle: string; }) => void; }, next: any) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
