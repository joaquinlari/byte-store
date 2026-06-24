import { Request, Response } from 'express';
import { ProductService } from './product.service';
import { ProductRepositoryPostgres } from './product.repository.postgres';

export class ProductController {

    private productService: ProductService;

    constructor() {
        const productRepository = new ProductRepositoryPostgres();
        this.productService = new ProductService(productRepository);
    }

    public getAll = async (req: Request, res: Response): Promise<void> => {
        try {
            const products = await this.productService.getAll();
            res.status(200).json(products);
        } catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).json({ message: 'Error interno al obtener productos' });
        }
    };

    // Este endpoint debe estar protegido por middleware de autenticación JWT + verificación de rol ADMIN.
    // CUALQUIERA puede crear productos. Pendiente hasta que exista el módulo de autenticación.
    public create = async (req: Request, res: Response): Promise<void> => {
        try {
            const { category_id, brand, model, description, price, stock, image_url } = req.body;

            if (!brand || !model || price === undefined || stock === undefined) {
                res.status(400).json({ message: 'Faltan campos obligatorios: brand, model, price, stock' });
                return;
            }

            const newProduct = await this.productService.create({
                category_id: category_id ?? null,
                brand,
                model,
                description: description ?? null,
                price,
                stock,
                image_url: image_url ?? null,
            });

            res.status(201).json(newProduct);
        } catch (error) {
            console.error('Error al crear producto:', error);
            const message = error instanceof Error ? error.message : 'Error interno al crear producto';
            res.status(400).json({ message });
        }
    };

    //Este endpoint debe estar protegido por middleware de autenticación JWT + verificación de rol ADMIN.
    // CUALQUIERA puede eliminar productos. Pendiente hasta que exista el módulo de autenticación.
    public delete = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = Number(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({ message: 'El id debe ser un número' });
                return;
            }

            const deletedProduct = await this.productService.delete(id);

            if (!deletedProduct) {
                res.status(404).json({ message: `No existe un producto con id ${id}` });
                return;
            }

            res.status(200).json({ message: 'Producto eliminado correctamente', product: deletedProduct });
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            res.status(500).json({ message: 'Error interno al eliminar producto' });
        }
    };

}