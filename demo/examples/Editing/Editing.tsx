
import { DataGrid } from '../../../lib';
import { columnDefinitions, mockRows } from '../../mockData';
import './Editing.css';

export default function EditingExample() {
    const handleProcessRowUpdate = (newRow: any) => {
        console.log('Row updated:', newRow);
        return newRow;
    };

    return (
        <div className="editing-example-container">
            <div className="editing-example-header">
                <h1>Cell Editing</h1>
                <p>
                    Double-click any cell to edit. Try the dropdown in "Role" or numeric inputs in "Salary" and "Age".
                </p>
            </div>
            <div className="editing-example-grid-wrapper">
                <DataGrid
                    rows={mockRows}
                    columns={columnDefinitions}
                    pageSizeOptions={[5, 10, 25, 50]}
                    pagination={true}
                    processRowUpdate={handleProcessRowUpdate}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 15, page: 0 } }
                    }}
                />
            </div>
        </div>
    );
}
