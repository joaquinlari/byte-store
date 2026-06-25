import { Router } from 'express';
import { ProductController } from './product.controller';

const router = Router();
const productController = new ProductController();

router.get('/', productController.getAll);
router.post('/', productController.create);
router.delete('/:id', productController.delete);
router.put('/:id', productController.update);

export default router;