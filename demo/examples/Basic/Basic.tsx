
import { DataGrid } from '../../../lib';
import { columnDefinitions, mockRows } from '../../mockData';
import './Basic.css';

export default function BasicExample() {
    return (
        <div className="basic-example-container">
            <div className="basic-example-header">
                <h1>Basic Usage</h1>
                <div className="basic-example-badges">
                    <span className="basic-example-badge">
                        {mockRows.length} Rows
                    </span>
                    <span className="basic-example-badge">
                        {columnDefinitions.length} Columns
                    </span>
                </div>
            </div>
            <div className="basic-example-grid-wrapper">
                <DataGrid
                    rows={mockRows}
                    columns={columnDefinitions}
                    pageSizeOptions={[5, 10, 25, 50, 100]}
                    pagination={true}
                    height={500}
                    checkboxSelection
                    initialState={{
                        pagination: { paginationModel: { pageSize: 25, page: 0 } }
                    }}
                />
            </div>
        </div>
    );
}
