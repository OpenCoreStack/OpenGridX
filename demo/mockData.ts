import { GridColDef } from '../lib/types';

export const columnDefinitions: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'firstName', headerName: 'First name', width: 130, editable: true },
  { field: 'lastName', headerName: 'Last name', width: 130, editable: true },
  { field: 'email', headerName: 'Email Address', width: 220, editable: true },
  { field: 'age', headerName: 'Age', type: 'number', width: 90, editable: true },
  { field: 'status', headerName: 'Status', width: 110, editable: true },
  { field: 'role', headerName: 'Role', width: 120, type: 'singleSelect', valueOptions: ['Admin', 'User', 'Moderator', 'Support'] },
  { field: 'salary', headerName: 'Annual Salary', type: 'number', width: 140, aggregable: true },
  { field: 'department', headerName: 'Department', width: 140, groupable: true },
  { field: 'country', headerName: 'Source Region', width: 130 },
  { field: 'performance', headerName: 'Performance (%)', type: 'number', width: 140, aggregable: true },
  { field: 'phone', headerName: 'Contact Number', width: 160 },
  { field: 'lastLogin', headerName: 'Last Login', type: 'date', width: 160 },
  { field: 'joinedDate', headerName: 'Joined Date', type: 'date', width: 160 },
];

export const mockRows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35, email: 'jon.snow@winterfell.com', phone: '+1-555-0101', status: 'Active', role: 'Admin', salary: 125000, department: 'Legal', country: 'North', performance: 95, lastLogin: '2024-03-01T10:00:00', joinedDate: '2020-01-15', onStock: true, type: 'Electronics' },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42, email: 'cersei@kingslanding.me', phone: '+1-555-0102', status: 'Active', role: 'Admin', salary: 450000, department: 'Executives', country: 'West', performance: 88, lastLogin: '2024-02-28T15:30:00', joinedDate: '2019-11-20', onStock: false, type: 'Home' },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45, email: 'jaime@kingslanding.me', phone: '+1-555-0103', status: 'Inactive', role: 'Moderator', salary: 180000, department: 'Security', country: 'West', performance: 72, lastLogin: '2024-01-10T09:15:00', joinedDate: '2020-02-05', onStock: true, type: 'Electronics' },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16, email: 'arya.stark@braavos.org', phone: '+1-555-0104', status: 'Active', role: 'User', salary: 95000, department: 'R&D', country: 'North', performance: 99, lastLogin: '2024-03-03T11:45:00', joinedDate: '2022-05-12', onStock: true, type: 'Garden' },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null, email: 'khaleesi@dragonstone.gov', phone: '+1-555-0105', status: 'Pending', role: 'Moderator', salary: 300000, department: 'Air Force', country: 'East', performance: 85, lastLogin: '2024-03-02T14:20:00', joinedDate: '2021-08-30', onStock: true, type: 'Electronics' },
  { id: 6, lastName: 'Melisandre', firstName: 'TheRed', age: 150, email: 'melly@shadows.com', phone: '+1-555-0106', status: 'Active', role: 'User', salary: 65000, department: 'Consulting', country: 'South', performance: 65, lastLogin: '2024-02-20T22:10:00', joinedDate: '2015-12-01', onStock: false, type: 'Fashion' },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44, email: 'f.clifford@abc.com', phone: '+1-555-0107', status: 'Active', role: 'Support', salary: 55000, department: 'IT', country: 'Global', performance: 91, lastLogin: '2024-03-04T08:00:00', joinedDate: '2023-01-10', onStock: true, type: 'Home' },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36, email: 'rossini@orchestra.it', phone: '+1-555-0108', status: 'Inactive', role: 'Support', salary: 72000, department: 'Music', country: 'South', performance: 80, lastLogin: '2023-12-15T11:22:00', joinedDate: '2022-10-14', onStock: true, type: 'Luxury' },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65, email: 'harvey@suits.co', phone: '+1-555-0109', status: 'Active', role: 'Admin', salary: 150000, department: 'Legal', country: 'Global', performance: 94, lastLogin: '2024-03-04T07:45:00', joinedDate: '2018-04-20', onStock: true, type: 'Services' },
  { id: 10, lastName: 'Wayne', firstName: 'Bruce', age: 38, email: 'bruce@waynecorp.com', phone: '+1-555-0110', status: 'Active', role: 'Admin', salary: 999999, department: 'Executives', country: 'Gotham', performance: 100, lastLogin: '2024-03-04T02:00:00', joinedDate: '2005-06-15', onStock: true, type: 'Technology' },
  { id: 11, lastName: 'Kent', firstName: 'Clark', age: 35, email: 'clark@dailyplanet.com', phone: '+1-555-0111', status: 'Active', role: 'User', salary: 45000, department: 'Journalism', country: 'Metropolis', performance: 98, lastLogin: '2024-03-04T06:30:00', joinedDate: '2013-10-01', onStock: true, type: 'News' },
  { id: 12, lastName: 'Prince', firstName: 'Diana', age: 3000, email: 'diana@themyscira.gov', phone: '+1-555-0112', status: 'Active', role: 'Moderator', salary: 120000, department: 'Diplomacy', country: 'Themyscira', performance: 99, lastLogin: '2024-03-01T12:00:00', joinedDate: '1941-12-01', onStock: true, type: 'Defense' },
  ...Array.from({ length: 100 }, (_, i) => ({
    id: i + 13,
    firstName: `Professional ${i + 13}`,
    lastName: `Global ${i + 13}`,
    age: 22 + (i % 40),
    email: `pro.${i + 13}@opengridx.io`,
    phone: `+1-555-${2000 + i}`,
    status: i % 3 === 0 ? 'Active' : (i % 3 === 1 ? 'Inactive' : 'Pending') as any,
    role: i % 4 === 0 ? 'Admin' : (i % 4 === 1 ? 'User' : (i % 4 === 2 ? 'Moderator' : 'Support')) as any,
    salary: 60000 + (Math.random() * 120000),
    department: ['Engineering', 'Marketing', 'Sales', 'HR', 'Legal', 'Executives'][i % 6],
    country: ['USA', 'UK', 'Germany', 'Japan', 'India', 'Canada'][i % 6],
    performance: 60 + (Math.random() * 40),
    lastLogin: new Date().toISOString(),
    joinedDate: '2023-01-01',
    onStock: i % 2 === 0,
    type: 'General'
  }))
];
