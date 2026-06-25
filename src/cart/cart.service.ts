import { AddItemDto, UpdateItemDto } from "./cart.dto";
import { Cart } from "./cart.entity";
import { NotFoundError, ValidationError } from "./cart.errors";
import { ICartRepository } from "./cart.repository.interface";

export class CartService {
  constructor(private readonly repo: ICartRepository) {}

  async getCart(userId: number): Promise<Cart> {
    const items = await this.repo.findByUserId(userId);
    return { userId, items };
  }

  async addItem(userId: number, dto: AddItemDto): Promise<Cart> {
    this.validateId(dto.productId, 'productId');
    this.validateQuantity(dto.quantity);
    await this.repo.addItem(userId, dto.productId, dto.quantity);
    return this.getCart(userId);
  }

  async updateItem(userId: number, productId: number, dto: UpdateItemDto): Promise<Cart> {
    this.validateQuantity(dto.quantity);
    const updated = await this.repo.setQuantity(userId, productId, dto.quantity);
    if (!updated) throw new NotFoundError('Item no está en el carrito');
    return this.getCart(userId);
  }

  async removeItem(userId: number, productId: number): Promise<Cart> {
    const ok = await this.repo.removeItem(userId, productId);
    if (!ok) throw new NotFoundError('Item no está en el carrito');
    return this.getCart(userId);
  }

  async clearCart(userId: number): Promise<Cart> {
    await this.repo.clear(userId);
    return this.getCart(userId);
  }

  private validateQuantity(q: unknown): void {
    if (!Number.isInteger(q) || (q as number) < 1) {
      throw new ValidationError('La cantidad debe ser entero >= 1');
    }
  }

  private validateId(id: unknown, name: string): void {
    if (!Number.isInteger(id) || (id as number) < 1) {
      throw new ValidationError(`${name} debe ser entero >= 1`);
    }
  }
}