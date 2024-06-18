const moment = require('moment');
const Cart = require('../lib/cart');
const Product = require('../models/Product');
const formatCurrency = require('../lib/formatCurrency');
const Seller = require('../models/Seller');

class CartController {
  async index(req, res) {
    const filters = {};
    const { change } = req.body;
    const variedProduct = await Product.findOne({
      name: 'PRODUTOS VARIADOS',
    });

    const sellers = await Seller.find();

    if (req.body.nome) {
      filters.nome = new RegExp(req.body.nome, 'i');

      let products = await Product.find({
        name: new RegExp(req.body.nome, 'i'),
      });

      const getProductsPromise = products.map(async (product) => {
        product.formattedExpirationDate = moment(
          product.expirationDate
        ).format('DD-MM-YYYY');

        return product;
      });

      products = await Promise.all(getProductsPromise);

      let { cart } = req.session;
      cart = Cart.init(cart);

      cart.productsVariedValues.map((item) => {
        item.formattedValue = formatCurrency.brl(item.value);
      });

      cart.totalproductsVariedFormated = formatCurrency.brl(
        cart.totalProdutsVaried
      );

      return res.render('cart/list', {
        cart,
        products,
        idVariedProduct: variedProduct ? variedProduct._id : null,
        sellers,
      });
    }

    if (req.body.searchBarcode) {
      let products = await Product.find({
        barcode: req.body.searchBarcode,
      });

      const getProductsPromise = products.map(async (product) => {
        product.formattedExpirationDate = moment(
          product.expirationDate
        ).format('DD-MM-YYYY');

        product.formattedSalePrice = formatCurrency.brl(product.salePrice);

        return product;
      });

      products = await Promise.all(getProductsPromise);

      let { cart } = req.session;
      cart = Cart.init(cart);

      cart.productsVariedValues.map((item) => {
        item.formattedValue = formatCurrency.brl(item.value);
      });

      cart.totalproductsVariedFormated = formatCurrency.brl(
        cart.totalProdutsVaried
      );

      return res.render('cart/list', {
        cart,
        products,
        idVariedProduct: variedProduct ? variedProduct._id : null,
        sellers,
      });
    }

    let { cart } = req.session;
    cart = Cart.init(cart);

    cart.items.map((item) => {
      item.formattedPrice = formatCurrency.brl(item.price);
    });

    cart.total.formattedPrice = formatCurrency.brl(cart.total.price);

    cart.productsVariedValues.map((item) => {
      item.formattedValue = formatCurrency.brl(item.value);
    });

    cart.totalproductsVariedFormated = formatCurrency.brl(
      cart.totalProdutsVaried
    );

    let changeFormate = 0;

    if (change) {
      changeFormate = formatCurrency.brl(change - cart.total.price);
    } else {
      changeFormate = formatCurrency.brl(0);
    }

    console.log(cart);

    return res.render('cart/list', {
      cart,
      changeFormate,
      change,
      idVariedProduct: variedProduct ? variedProduct._id : null,
      sellers,
    });
  }

  async addOne(req, res) {
    let { searchBarcode, addValue, quantity } = req.body;
    const { id } = req.params;
    const variedProduct = await Product.findOne({
      name: 'PRODUTOS VARIADOS',
    });

    let idVariedProduct = '';

    if (variedProduct) {
      idVariedProduct = variedProduct._id;
    }

    if (!addValue) {
      addValue = 0;
    }

    let product;

    if (searchBarcode) {
      product = await Product.findOne({ barcode: searchBarcode });
    }

    if (id) {
      product = await Product.findById(req.params.id);
    }

    if (!product) {
      return res.redirect('/cart');
    }

    product.teste = 100; // Adicionando a propriedade 'teste' ao produto

    let { cart } = req.session;
    cart = Cart.init(cart);

    if (!quantity) {
      quantity = 1;
    }

    cart = cart.addOne({
      product,
      quantity,
      addValue,
      idVariedProduct,
    });

    req.session.cart = cart;

    return res.redirect('/cart');
  }

  async removeOne(req, res) {
    let { id } = req.params;

    let { cart } = req.session;

    if (!cart) return res.redirect('/cart');

    cart = Cart.init(cart).removeOne(id);

    req.session.cart = cart;

    return res.redirect('/cart');
  }

  async delete(req, res) {
    let { id } = req.params;

    let { cart } = req.session;

    const variedProduct = await Product.findOne({
      name: 'PRODUTOS VARIADOS',
    });

    if (!cart) return res.redirect('/cart');

    cart = Cart.init(cart).delete({
      id,
      variedProductID: variedProduct ? variedProduct._id : null,
    });

    req.session.cart = cart;

    return res.redirect('/cart');
  }
}

module.exports = new CartController();
