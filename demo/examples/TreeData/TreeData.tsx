
import { useState } from 'react';
import { DataGrid, GridPaginationModel, GridRowId } from '../../../lib';
import { generateEmployees, Employee } from '../../data/mockData';
import { allColumns } from '../../data/columns';
import './TreeData.css';

export default function TreeDataExample() {

    const [rows] = useState(() => generateEmployees(100));
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 25
    });
    const [selectedRows, setSelectedRows] = useState<GridRowId[]>([]);

    return (
        <div className="tree-data-container">
            <div className="tree-data-header">
                <h2>Tree Data Example</h2>
                <p>
                    Tree structure is generated based on the "path" property of each row (Department {'->'} Role {'->'} SubRole {'->'} Employee).
                </p>
            </div>
            <div className="tree-data-grid-wrapper">
                <DataGrid
                    rows={rows}
                    columns={allColumns}
                    autoHeight
                    treeData
                    getTreeDataPath={(row: Employee) => row.path}
                    checkboxSelection
                    rowSelectionModel={selectedRows}
                    onRowSelectionModelChange={setSelectedRows}
                    pagination
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                />
            </div>
        </div>
    );
}
