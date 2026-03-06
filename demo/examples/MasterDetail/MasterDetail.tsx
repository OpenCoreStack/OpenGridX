
import { DataGrid } from '../../../lib';
import { columnDefinitions, mockRows } from '../../mockData';
import './MasterDetail.css';

export default function MasterDetailExample() {
    return (
        <div className="master-detail-container">
            <div className="master-detail-header">
                <h1>Master-Detail</h1>
                <p>
                    Click the expand icon on any row to see a detailed performance summary and bio.
                </p>
            </div>
            <div className="master-detail-grid-wrapper">
                <DataGrid
                    rows={mockRows}
                    columns={columnDefinitions}
                    getDetailPanelContent={(params) => (
                        <div className="detail-panel-container">
                            <div className="detail-panel-section">
                                <h4>Biometric Data</h4>
                                <div className="detail-panel-grid">
                                    <span><strong>Full Name:</strong> {params.row.firstName} {params.row.lastName}</span>
                                    <span><strong>Registered Email:</strong> {params.row.email}</span>
                                    <span><strong>Contact:</strong> {params.row.phone}</span>
                                    <span><strong>Joining Date:</strong> {params.row.joinedDate}</span>
                                </div>
                            </div>
                            <div className="detail-panel-section">
                                <h4>Performance K-Index</h4>
                                <div className="performance-track">
                                    <div className="performance-bar" style={{ width: `${params.row.performance}%` }} />
                                </div>
                                <p className="performance-desc">
                                    This employee is currently performing at <strong>{params.row.performance}%</strong> of their quarterly target in the <strong>{params.row.department}</strong> department.
                                </p>
                            </div>
                        </div>
                    )}
                    getDetailPanelHeight={() => 180}
                    pagination
                    pageSizeOptions={[10, 25, 50]}
                />
            </div>
        </div>
    );
}
