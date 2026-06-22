export interface Product {
    id: number;
    category_id: number | null;
    brand: string;
    model: string;
    description: string | null;
    price: number;
    stock: number;
    image_url: string | null;
    created_at: Date;
    updated_at: Date;
}