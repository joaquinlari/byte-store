import express, { Application } from 'express';
import { config } from './config';
import productRoutes from './product/product.routes';

export class App {
    public readonly app: Application;

    constructor() {
        this.app = express();
        this.app.use(express.json());
        this.app.use('/products', productRoutes);
    }

    public start() {
        this.app.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
        });
    }
}