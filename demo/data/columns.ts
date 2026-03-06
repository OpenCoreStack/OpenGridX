import type { GridColDef } from '../../lib';
import { Employee } from './mockData';

export const allColumns: GridColDef<Employee>[] = [
    {
        field: 'name',
        headerName: 'Name',
        width: 250, 
        sortable: true,
        editable: true
    },
    {
        field: 'id',
        headerName: 'ID',
        width: 90,
        align: 'center',
        headerAlign: 'center',
        hideable: false 
    },
    {
        field: 'email',
        headerName: 'Email',
        width: 250,
        sortable: true,
        editable: true
    },
    {
        field: 'department',
        headerName: 'Department',
        width: 150,
        sortable: true
    },
    {
        field: 'role',
        headerName: 'Role',
        width: 150,
        sortable: true
    },
    {
        field: 'salary',
        headerName: 'Salary',
        width: 130,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        sortable: true,
        editable: true,
        valueFormatter: (params) => {
            if (params.value === null || params.value === undefined) return '';
            return `$${params.value.toLocaleString()}`;
        }
    },
    {
        field: 'joinDate',
        headerName: 'Join Date',
        width: 150,
        type: 'date',
        align: 'center',
        headerAlign: 'center',
        sortable: true
    }
];
