import { getOrders } from '../lib/orders';
import { OrdersGrid } from './OrdersGrid';

// A Server Component: fetches the rows and passes them (serialisable data only) to the client grid.
export default async function Page() {
    const rows = await getOrders();
    return (
        <main>
            <h1>Orders</h1>
            <OrdersGrid rows={rows} />
        </main>
    );
}
