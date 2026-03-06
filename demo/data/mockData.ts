import type { GridRowModel } from '../../lib';

export interface Employee extends GridRowModel {
    id: number;
    name: string;
    email: string;
    department: string;
    role: string;
    salary: number;
    joinDate: string;
    path: string[];
}

export const generateEmployees = (count: number): Employee[] => {
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
    const roles = ['Developer', 'Manager', 'Designer', 'Analyst', 'Specialist'];
    const subRoles = ['Senior', 'Junior', 'Lead', 'Associate'];
    let arg = [];
    arg = Array.from({ length: count }, (_, index) => {
        const dept = departments[Math.floor(Math.random() * departments.length)];
        const role = roles[Math.floor(Math.random() * roles.length)];
        const subRole = subRoles[Math.floor(Math.random() * subRoles.length)];

        return {
            id: index + 1,
            name: `Employee ${index + 1}`,
            email: `employee${index + 1}@company.com`,
            department: dept,
            role: role,
            salary: Math.floor(Math.random() * 100000) + 50000,
            joinDate: new Date(2024 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
            path: [dept, role, subRole, `Employee ${index + 1}`]
        } as Employee;
    });
    return arg;
};
