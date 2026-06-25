import { CartItem } from './cart.entity';

export interface ICartRepository {
  findByUserId(userId: number): Promise<CartItem[]>;
  addItem(userId: number, productId: number, quantity: number): Promise<CartItem>;
  setQuantity(userId: number, productId: number, quantity: number): Promise<CartItem | null>;
  removeItem(userId: number, productId: number): Promise<boolean>;
  clear(userId: number): Promise<void>;
}