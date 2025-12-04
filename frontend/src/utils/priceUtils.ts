interface Product {
  price: number;
  discount?: number;
}

export const getItemPrice = (product: Product): number => {
  return product.discount && product.discount > 0
    ? product.price * (1 - product.discount)
    : product.price;
};
