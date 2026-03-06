
import { DataGrid } from '../../../lib';
import { columnDefinitions, mockRows } from '../../mockData';
import './Grouping.css';

export default function GroupingExample() {
    return (
        <div className="grouping-example-container">
            <div className="grouping-example-header">
                <h1>Row Grouping</h1>
                <p>
                    Data is grouped by <strong>Department</strong> and then by <strong>Source Region</strong>.
                </p>
            </div>
            <div className="grouping-example-grid-wrapper">
                <DataGrid
                    rows={mockRows}
                    columns={columnDefinitions}
                    rowGroupingModel={['department', 'country']}
                    pagination={true}
                    pageSizeOptions={[10, 25, 50]}
                />
            </div>
        </div>
    );
}
