import { pool } from '../config';
import { Product } from './product.entity';
import { ProductRepositoryInterface } from './product.repository.interface';

export class ProductRepositoryPostgres implements ProductRepositoryInterface {

    public async findAll(): Promise<Product[]> {
        const result = await pool.query<Product>(
            'SELECT * FROM products ORDER BY created_at DESC'
        );
        return result.rows;
    }

    public async insert(data: {
        category_id: number | null;
        brand: string;
        model: string;
        description: string | null;
        price: number;
        stock: number;
        image_url: string | null;
    }): Promise<Product> {
        const result = await pool.query<Product>(
            `INSERT INTO products (category_id, brand, model, description, price, stock, image_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                data.category_id,
                data.brand,
                data.model,
                data.description,
                data.price,
                data.stock,
                data.image_url,
            ]
        );
        return result.rows[0];
    }

    public async deleteById(id: number): Promise<Product | null> {
        const result = await pool.query<Product>(
            'DELETE FROM products WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0] ?? null;
    }

public async updateById(id: number, data: Partial<{
        category_id: number | null;
        brand: string;
        model: string;
        description: string | null;
        price: number;
        stock: number;
        image_url: string | null;
    }>): Promise<Product | null> {
        const fields: string[] = [];
        const values: unknown[] = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        }

        if (fields.length === 0) {
            const result = await pool.query<Product>(
                'SELECT * FROM products WHERE id = $1',
                [id]
            );
            return result.rows[0] ?? null;
        }

        fields.push(`updated_at = NOW()`);
        values.push(id);

        const result = await pool.query<Product>(
            `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );
        return result.rows[0] ?? null;
    }
    
}