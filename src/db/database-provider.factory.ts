import { Pool } from "pg";
import { UserRepository } from "../users/users.repository.interface";
import { PostgresUserRepository } from "../users/users.repository.postgres";

// Definimos qué debe tener cualquier proveedor de base de datos en tu app
export interface DatabaseProvider {
  userRepository: UserRepository;
  close(): Promise<void>;
}

// Esta es la fábrica que instancia el proveedor correcto usando tu pool de PG
export function createDatabaseProvider(pool: Pool): DatabaseProvider {
  // Instanciamos el repositorio pasándole el pool de conexiones
  const userRepository = new PostgresUserRepository(pool);

  return {
    userRepository,
    close: async () => {
      console.log("Cerrando el pool de conexiones de PostgreSQL...");
      await pool.end();
    },
  };
}
