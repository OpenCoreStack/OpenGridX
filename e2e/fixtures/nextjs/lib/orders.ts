export interface Order {
    id: number;
    customer: string;
    amount: number;
    shipped: boolean;
}

const CUSTOMERS = ['Anna', 'Bob', 'Chen', 'Dara', 'Eli'];

// Stands in for a database query run on the server.
export async function getOrders(): Promise<Order[]> {
    return Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        customer: CUSTOMERS[i % CUSTOMERS.length],
        amount: ((i * 37) % 1000) + 10,
        shipped: i % 3 === 0,
    }));
}
