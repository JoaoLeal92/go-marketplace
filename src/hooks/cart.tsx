import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const cart = await AsyncStorage.getItem('@GoMarketplace:cart');

      console.log('Cart: ', cart);

      if (cart) {
        const cartProducts = await JSON.parse(cart);

        setProducts([...cartProducts]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      // TODO ADD A NEW ITEM TO THE CART
      const findProduct = products.findIndex(
        cartProduct => cartProduct.id === product.id,
      );

      if (findProduct !== -1) {
        const updatedProduct = products[findProduct];

        updatedProduct.quantity += 1;

        products.splice(findProduct, 1, updatedProduct);

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(products),
        );

        return;
      }

      const newProduct = { ...product, quantity: 1 };

      setProducts([...products, newProduct]);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const updatedProducts = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product,
      );

      setProducts(updatedProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(updatedProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndex = products.findIndex(
        cartProduct => cartProduct.id === id,
      );

      if (productIndex >= 0) {
        const product = products[productIndex];

        if (product.quantity === 1) {
          const updatedProducts = products.filter(
            cartProduct => cartProduct.id !== id,
          );

          setProducts(updatedProducts);
        } else {
          const updatedProducts = products.map(cartProduct =>
            cartProduct.id === id
              ? { ...cartProduct, quantity: cartProduct.quantity - 1 }
              : cartProduct,
          );

          setProducts(updatedProducts);
        }

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
