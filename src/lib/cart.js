const uuid = require('uuid');

let addValueDelete = 0;

const Cart = {
  init(oldCart) {
    if (oldCart) {
      this.items = oldCart.items || [];
      this.total = oldCart.total || { quantity: 0, price: 0 };
      this.productsVariedValues = oldCart.productsVariedValues || [{}];
      this.totalProdutsVaried = oldCart.totalProdutsVaried || 0;
    } else {
      this.items = [];
      this.productsVariedValues = [{}];
      this.totalProdutsVaried = 0;
      this.total = {
        quantity: 0,
        price: 0,
      };
    }
    return this;
  },

  addOne({ product, quantity = 1, addValue = 0, idVariedProduct }) {
    let inCart = this.items.find(
      (item) => String(item.product._id) === String(product._id)
    );

    if (!inCart) {
      inCart = {
        product: product,
        quantity: 0,
        price: 0,
      };
      this.items.push(inCart);
    }

    if (inCart.quantity >= product.amount) return this;

    if (String(product._id) === String(idVariedProduct)) {
      addValue = Number(addValue);
      this.productsVariedValues.push({ id: uuid.v4(), value: addValue });
      addValueDelete += addValue;
      inCart.price += addValue;
      this.total.price += addValue;
      this.totalProdutsVaried += addValue;
    } else {
      inCart.quantity += quantity;
      inCart.price = inCart.product.salePrice * inCart.quantity;
      this.total.price += inCart.product.salePrice * quantity;
    }

    this.total.quantity += quantity;

    return this;
  },

  removeOne(productId) {
    const inCart = this.items.find(
      (item) => String(item.product._id) === String(productId)
    );

    if (!inCart) return this;

    inCart.quantity--;
    inCart.price = inCart.product.salePrice * inCart.quantity;

    this.total.quantity--;
    this.total.price -= inCart.product.salePrice;

    if (inCart.quantity < 1) {
      const itemIndex = this.items.indexOf(inCart);
      this.items.splice(itemIndex, 1);
    }

    return this;
  },

  delete({ id, variedProductID }) {
    let inCart = this.items.find(
      (item) => String(item.product._id) === String(id)
    );

    if (!inCart) return this;

    this.total.quantity -= inCart.quantity;

    if (String(inCart.product._id) === String(variedProductID)) {
      inCart.price = 0;
      this.total.price -= addValueDelete;
      addValueDelete = 0;
      this.productsVariedValues = [{}];
      this.totalProdutsVaried = 0;
    } else {
      this.total.price -= inCart.product.salePrice * inCart.quantity;
    }

    this.items = this.items.filter(
      (item) => String(item.product._id) !== String(id)
    );

    return this;
  },
};

module.exports = Cart;
