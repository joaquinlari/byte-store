import { Router } from "express";
import { Pool } from "pg";
import { PostgresCartRepository } from "./cart.repository.postgres";
import { CartService } from "./cart.service";
import { CartController } from "./cart.controller";

export function buildCartRouter(pool: Pool): Router {
  const repo = new PostgresCartRepository(pool);
  const service = new CartService(repo);
  const controller = new CartController(service);

  const router = Router();
  router.get('/:userId', controller.getCart);
  router.post('/:userId/items', controller.addItem);
  router.patch('/:userId/items/:productId', controller.updateItem);
  router.delete('/:userId/items/:productId', controller.removeItem);
  router.delete('/:userId/items', controller.clearCart);
  return router;
}