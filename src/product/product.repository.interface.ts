import { Product } from './product.entity';

export interface ProductRepositoryInterface {

    findAll(): Promise<Product[]>;

    insert(data: {
        category_id: number | null;
        brand: string;
        model: string;
        description: string | null;
        price: number;
        stock: number;
        image_url: string | null;
    }): Promise<Product>;

    deleteById(id: number): Promise<Product | null>;

    updateById(id: number, data: Partial<{
        category_id: number | null;
        brand: string;
        model: string;
        description: string | null;
        price: number;
        stock: number;
        image_url: string | null;
    }>): Promise<Product | null>;

}