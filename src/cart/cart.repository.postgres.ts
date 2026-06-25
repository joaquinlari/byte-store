import { Pool, QueryResultRow } from "pg";
import { ICartRepository } from "./cart.repository.interface";
import { CartItem } from "./cart.entity";
import { NotFoundError } from "./cart.errors";

export class PostgresCartRepository implements ICartRepository {
    constructor(private readonly pool:Pool){}

    private toEntity(row: QueryResultRow): CartItem {
        return {
            id: row.id,
            userId: row.user_id,
            productId: row.product_id,
            quantity: row.quantity,
            createdAt: row.created_at
        }   
    }

    async findByUserId(userId:number): Promise<CartItem[]>{
        const {rows} = await this.pool.query(`SELECT * FROM cart_items WHERE user_id = $1 ORDER BY created_at`, [userId])
        return rows.map((r)=>this.toEntity(r))
    }

   async addItem(userId: number, productId: number, quantity: number): Promise<CartItem> {
    try {
      const { rows } = await this.pool.query(
        `INSERT INTO cart_items (user_id, product_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, product_id)
         DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
         RETURNING *`,
        [userId, productId, quantity],
      );
      return this.toEntity(rows[0]);
    } catch (err: any) {
      if (err?.code === '23503') {
        throw new NotFoundError('User o product no existe');
      }
      throw err;
    }
  }

  async setQuantity(userId: number, productId:number, quantity:number): Promise<CartItem |  null>{
    const {rows} = await this.pool.query(`UPDATE cart_items SET quantity $3
        WHERE user_id = $1 AND product_id = $2
        RETURNING *`, [userId, productId, quantity])
    return rows.length ? this.toEntity(rows[0]) : null
  }

  async removeItem(userId: number, productId: number): Promise<boolean> {
    const {rowCount} = await  this.pool.query(`DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2`,[userId,productId])
    return (rowCount ?? 0) > 0
  }

  async clear(userId:number): Promise<void>{
    await this.pool.query(`DELETE FROM cart_items WHERE user_id=$1`,[userId])
  }
}