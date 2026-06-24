import { Pool } from "pg";
import { User } from "./users.entity";
import { UserRepository } from "./users.repository.interface";

export class PostgresUserRepository implements UserRepository {
  private client: Pool;

  constructor(client: Pool) {
    this.client = client;
  }

  // Traduce los datos de la BD al formato de tu Entidad TypeScript
  private toUser(row: any): User {
    // Forzamos a que el mapa devuelva únicamente los valores válidos de tu tipo Role
    const roleMap: Record<string, "user" | "admin"> = {
      CLIENTE: "user",
      ADMIN: "admin",
    };

    return {
      id: Number(row.id),
      name: row.name || row.name, // Mapea full_name de la BD a 'name' de tu negocio
      email: row.email,
      role: roleMap[row.role] || "user", // Ahora TS sabe con certeza que esto es "user" | "admin"
    };
  }

  async findAll(): Promise<User[]> {
    // Usamos ALIAS (AS) para mantener la compatibilidad con tu código externo
    const result = await this.client.query(
      "SELECT id, full_name AS name, email, role FROM users",
    );
    return result.rows.map((row) => this.toUser(row));
  }

  async findUserById(id: string): Promise<User | null> {
    const result = await this.client.query(
      "SELECT id, full_name AS name, email, role FROM users WHERE id = $1",
      [id],
    );
    if (result.rows.length > 0) {
      return this.toUser(result.rows[0]);
    }
    return null;
  }

  async createUser(
    user: Omit<User, "id" | "create_time"> & { password?: string },
  ): Promise<User> {
    const query = `
      INSERT INTO users (full_name, email, password_hash, role) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, full_name AS name, email, role
    `;

    // Mapeamos el rol de TS ('user'/'admin') al formato CHECK de Postgres ('CLIENTE'/'ADMIN')
    const dbRole = user.role === "admin" ? "ADMIN" : "CLIENTE";

    const values = [
      user.name,
      user.email,
      user.password, // El servicio envía 'password'
      dbRole,
    ];

    const result = await this.client.query(query, values);
    return this.toUser(result.rows[0]);
  }

  async updateUser(
    id: string,
    user: Partial<Omit<User, "id" | "create_time">> & { password?: string },
  ): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Diccionario de traducción de propiedades TS -> Columnas SQL
    const fieldMapping: Record<string, string> = {
      name: "full_name",
      email: "email",
      password: "password_hash",
      role: "role",
    };

    Object.entries(user).forEach(([key, value]) => {
      if (value !== undefined && fieldMapping[key]) {
        fields.push(`${fieldMapping[key]} = $${paramCount}`);

        // Traducción especial de valores para el campo de Rol
        if (key === "role") {
          values.push(value === "admin" ? "ADMIN" : "CLIENTE");
        } else {
          values.push(value);
        }

        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findUserById(id);
    }

    values.push(id);

    const query = `
      UPDATE users 
      SET ${fields.join(", ")} 
      WHERE id = $${paramCount} 
      RETURNING id, full_name AS name, email, role
    `;

    const result = await this.client.query(query, values);

    if (result.rows.length > 0) {
      return this.toUser(result.rows[0]);
    }
    return null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.client.query("DELETE FROM users WHERE id = $1", [
      id,
    ]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
