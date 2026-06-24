import express, { Application } from "express";
import { config } from "./config";
import { pool } from "./database"; // Se usa si tu factory requiere el pool por parámetro
import { UserService } from "./users/users.service";
import { UserController } from "./users/users.controller";
import { UserRoutes } from "./users/users.routes";
import {
  createDatabaseProvider,
  DatabaseProvider,
} from "./db/database-provider.factory";

export class App {
  public readonly app: Application;
  private readonly database: DatabaseProvider;

  constructor() {
    this.app = express();
    this.app.use(express.json());

    // CORRECCIÓN 1: Inicializar el proveedor de la base de datos ANTES de los módulos.
    // (Si tu función 'createDatabaseProvider' no necesita el pool, quítalo de los paréntesis).
    this.database = createDatabaseProvider(pool);

    this.initializeModules();
  }

  private initializeModules() {
    // CORRECCIÓN 2: Eliminamos la línea suelta de PostgresUserRepository.
    // Usamos directamente el repositorio que expone tu DatabaseProvider.
    const userService = new UserService(this.database.userRepository);
    const userController = new UserController(userService);

    // Instanciamos tus rutas orientadas a objetos
    const userRoutes = new UserRoutes(userController);
    this.app.use("/users", userRoutes.router);
  }

  public start() {
    this.app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  }

  public shutdown() {
    console.log("Shutting down app...");
    this.close().then(() => {
      process.exit(0);
    });
  }

  public async close() {
    await this.database.close();
  }
}
