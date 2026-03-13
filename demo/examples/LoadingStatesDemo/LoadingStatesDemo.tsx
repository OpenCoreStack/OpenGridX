
import { DataGrid, GridColDef } from '@opencorestack/opengridx';
import { DocsLayout } from '../../components/DocsLayout';
import './LoadingStatesDemo.css';
import sourceCode from './LoadingStatesDemo.tsx?raw';

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'firstName', headerName: 'First Name', width: 130 },
    { field: 'lastName', headerName: 'Last Name', width: 130 },
    { field: 'age', headerName: 'Age', type: 'number', width: 90 },
    { field: 'email', headerName: 'Email', width: 200 },
];

const sampleRows = [
    { id: 1, firstName: 'John', lastName: 'Doe', age: 35, email: 'john.doe@example.com' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', age: 28, email: 'jane.smith@example.com' },
    { id: 3, firstName: 'Sam', lastName: 'Wilson', age: 42, email: 'sam.wilson@example.com' },
];

export default function LoadingStatesDemo() {
    return (
        <DocsLayout
            title="Loading & Empty States"
            description={
                <span>
                    OpenGridX handles various states out-of-the-box including <strong>Skeleton loaders</strong>,
                    <strong>Loading overlays</strong>, and <strong>Empty state placeholders</strong>.
                </span>
            }
            sourceCode={sourceCode}
        >
            <div className="loading-demo-container">

                {/* 1. Skeleton Loading State */}
                <section className="loading-demo-section">
                    <h3>1. Skeleton Loading (No Initial Data)</h3>
                    <p>
                        When <code>loading={`{true}`}</code> and <code>rows</code> is an empty array, the grid automatically renders skeleton placeholders.
                    </p>
                    <div className="loading-grid-frame" style={{ height: 300 }}>
                        <DataGrid
                            rows={[]}
                            columns={columns}
                            loading={true}
                            height={400}
                        />
                    </div>
                </section>

                {/* 2. Loading Overlay State */}
                <section className="loading-demo-section">
                    <h3>2. Loading Overlay (With Existing Data)</h3>
                    <p>
                        When <code>loading={`{true}`}</code> but <code>rows</code> already has data, the grid renders a subtle loading indicator.
                    </p>
                    <div className="loading-grid-frame" style={{ height: 300 }}>
                        <DataGrid
                            rows={sampleRows}
                            columns={columns}
                            loading={true}
                            height={400}
                        />
                    </div>
                </section>

                {/* 3. Empty State */}
                <section className="loading-demo-section">
                    <h3>3. Empty State (No Data)</h3>
                    <p>
                        When <code>rows</code> is empty and <code>loading</code> is false, the <code>noRowsLabel</code> (default: "No Data") is displayed.
                    </p>
                    <div className="loading-grid-wrapper-full">
                        <DataGrid
                            rows={[]}
                            height={400}
                            columns={columns}
                            loading={false}
                            noRowsLabel="No Data Found"
                        />
                    </div>
                </section>

                {/* 4. Error State Showcase */}
                <section className="loading-demo-section">
                    <h3>4. Error State Overlay</h3>
                    <p>
                        The <code>dataSource.error</code> object can be used to trigger a global error overlay with a retry option.
                    </p>
                    <div className="loading-grid-wrapper-full" style={{ position: 'relative' }}>
                        <DataGrid
                            rows={[]}
                            columns={columns}
                            height={400}
                            initialState={{
                                dataSource: {
                                    loading: false,
                                    error: new Error('Failed to fetch data from the server. Please check your network connection.')
                                }
                            } as any}
                        />
                    </div>
                </section>

            </div>
        </DocsLayout>
    );
}
