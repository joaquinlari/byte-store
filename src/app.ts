import express, { Application } from "express";
import { Pool } from "pg";
import { config } from "./config";
import productRoutes from "./product/product.routes";
import userRoutes from "./users/users.routes";
import { buildCartRouter } from "./cart/cart.routes";

export class App {
  public readonly app: Application;

  constructor(pool: Pool) {
    this.app = express();
    this.app.use(express.json());
    this.app.use("/products", productRoutes);
    this.app.use("/users", userRoutes);
    this.app.use("/api/carts", buildCartRouter(pool));
  }

  public start() {
    this.app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  }
}
