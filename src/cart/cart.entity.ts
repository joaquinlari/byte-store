export interface CartItem {
    id: number;
    userId:  number;
    productId: number;
    quantity: number
    createdAt: Date
}

export  interface Cart {
    userId: number;
    items: CartItem[];
    total?: number;
}