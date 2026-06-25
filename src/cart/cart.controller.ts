import { Request, Response } from 'express';
import { CartService } from './cart.service';
import { ValidationError } from './cart.errors';

export class CartController {
  constructor(private readonly service: CartService) {}

  getCart = async (req: Request, res: Response) => {
    try {
      const userId = this.parseId(req.params.userId, 'userId');
      res.json(await this.service.getCart(userId));
    } catch (e) { this.handle(e, res); }
  };

  addItem = async (req: Request, res: Response) => {
    try {
      const userId = this.parseId(req.params.userId, 'userId');
      const { productId, quantity } = req.body ?? {};
      res.status(201).json(await this.service.addItem(userId, { productId, quantity }));
    } catch (e) { this.handle(e, res); }
  };

  updateItem = async (req: Request, res: Response) => {
    try {
      const userId = this.parseId(req.params.userId, 'userId');
      const productId = this.parseId(req.params.productId, 'productId');
      const { quantity } = req.body ?? {};
      res.json(await this.service.updateItem(userId, productId, { quantity }));
    } catch (e) { this.handle(e, res); }
  };

  removeItem = async (req: Request, res: Response) => {
    try {
      const userId = this.parseId(req.params.userId, 'userId');
      const productId = this.parseId(req.params.productId, 'productId');
      res.json(await this.service.removeItem(userId, productId));
    } catch (e) { this.handle(e, res); }
  };

  clearCart = async (req: Request, res: Response) => {
    try {
      const userId = this.parseId(req.params.userId, 'userId');
      res.json(await this.service.clearCart(userId));
    } catch (e) { this.handle(e, res); }
  };

  private parseId(raw: string | string[], name: string): number {
    const value = Array.isArray(raw) ? raw[0] : raw;
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1) throw new ValidationError(`${name} inválido`);
    return n;
  }

  private handle(e: unknown, res: Response): void {
    const status = (e as any)?.status ?? 500;
    const message = status === 500 ? 'Error interno' : (e as Error).message;
    if (status === 500) console.error(e);
    res.status(status).json({ error: message });
  }
}