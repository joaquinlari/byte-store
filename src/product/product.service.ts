import { ProductRepositoryInterface } from './product.repository.interface';
import { Product } from './product.entity';

export class ProductService {

    private productRepository: ProductRepositoryInterface;

    constructor(productRepository: ProductRepositoryInterface) {
        this.productRepository = productRepository;
    }

    public async getAll(): Promise<Product[]> {
        return this.productRepository.findAll();
    }

    public async create(data: {
        category_id: number | null;
        brand: string;
        model: string;
        description: string | null;
        price: number;
        stock: number;
        image_url: string | null;
    }): Promise<Product> {
        if (data.price < 0) {
            throw new Error('El precio no puede ser negativo');
        }
        if (data.stock < 0) {
            throw new Error('El stock no puede ser negativo');
        }
        return this.productRepository.insert(data);
    }

    public async delete(id: number): Promise<Product | null> {
        return this.productRepository.deleteById(id);
    }

}