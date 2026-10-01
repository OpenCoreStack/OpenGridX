import{r as o,j as e}from"./vendor-react-f02LKZLu.js";import{Q as W,C as Y,D as Z}from"./opengridx-CjgOoF_H.js";import{D as ee}from"./DocsLayout-CwTr2FWN.js";const ae=`

import { useState, useMemo } from 'react';
import { DataGrid } from '@opencorestack/opengridx';
import { QuickFilter } from '../../../lib/components/QuickFilter/QuickFilter';
import { ColumnVisibilityPanel } from '../../../lib/components/ColumnVisibilityPanel/ColumnVisibilityPanel';
import type { GridColDef, GridRowModel, GridFilterModel, GridColumnPinning, GridRowPinning, GridRowId, GridRowGroupingModel, GridAggregationModel } from '@opencorestack/opengridx';
import '../../../lib/components/QuickFilter/QuickFilter.css';
import '../../../lib/components/ColumnVisibilityPanel/ColumnVisibilityPanel.css';
import './DataGridTest.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './DataGridTest.tsx?raw';

interface Employee extends GridRowModel {
    id: number;
    name: string;
    email: string;
    department: string;
    role: string;
    salary: number;
    joinDate: string;
    path: string[];
}

const data = [
    {
        "id": 1,
        "name": "Employee 1",
        "email": "employee1@company.com",
        "department": "Finance",
        "role": "Designer",
        "salary": 148417,
        "joinDate": "2028-06-08",
        "path": [
            "Finance",
            "Designer",
            "Lead",
            "Employee 1"
        ]
    },
    {
        "id": 2,
        "name": "Employee 2",
        "email": "employee2@company.com",
        "department": "Engineering",
        "role": "Analyst",
        "salary": 121903,
        "joinDate": "2025-06-02",
        "path": [
            "Engineering",
            "Analyst",
            "Lead",
            "Employee 2"
        ]
    },
    {
        "id": 3,
        "name": "Employee 3",
        "email": "employee3@company.com",
        "department": "Engineering",
        "role": "Designer",
        "salary": 88214,
        "joinDate": "2028-03-11",
        "path": [
            "Engineering",
            "Designer",
            "Associate",
            "Employee 3"
        ]
    },
    {
        "id": 4,
        "name": "Employee 4",
        "email": "employee4@company.com",
        "department": "Finance",
        "role": "Developer",
        "salary": 74691,
        "joinDate": "2026-08-18",
        "path": [
            "Finance",
            "Developer",
            "Junior",
            "Employee 4"
        ]
    },
    {
        "id": 5,
        "name": "Employee 5",
        "email": "employee5@company.com",
        "department": "Sales",
        "role": "Manager",
        "salary": 86243,
        "joinDate": "2025-07-08",
        "path": [
            "Sales",
            "Manager",
            "Associate",
            "Employee 5"
        ]
    },
    {
        "id": 6,
        "name": "Employee 6",
        "email": "employee6@company.com",
        "department": "Finance",
        "role": "Analyst",
        "salary": 68299,
        "joinDate": "2024-08-31",
        "path": [
            "Finance",
            "Analyst",
            "Associate",
            "Employee 6"
        ]
    },
    {
        "id": 7,
        "name": "Employee 7",
        "email": "employee7@company.com",
        "department": "Engineering",
        "role": "Developer",
        "salary": 105841,
        "joinDate": "2024-10-04",
        "path": [
            "Engineering",
            "Developer",
            "Associate",
            "Employee 7"
        ]
    },
    {
        "id": 8,
        "name": "Employee 8",
        "email": "employee8@company.com",
        "department": "Sales",
        "role": "Developer",
        "salary": 120908,
        "joinDate": "2027-12-02",
        "path": [
            "Sales",
            "Developer",
            "Senior",
            "Employee 8"
        ]
    },
    {
        "id": 9,
        "name": "Employee 9",
        "email": "employee9@company.com",
        "department": "Sales",
        "role": "Designer",
        "salary": 139259,
        "joinDate": "2024-05-25",
        "path": [
            "Sales",
            "Designer",
            "Junior",
            "Employee 9"
        ]
    },
    {
        "id": 10,
        "name": "Employee 10",
        "email": "employee10@company.com",
        "department": "Finance",
        "role": "Analyst",
        "salary": 136236,
        "joinDate": "2024-02-23",
        "path": [
            "Finance",
            "Analyst",
            "Senior",
            "Employee 10"
        ]
    },
    {
        "id": 11,
        "name": "Employee 11",
        "email": "employee11@company.com",
        "department": "Finance",
        "role": "Developer",
        "salary": 141366,
        "joinDate": "2026-10-03",
        "path": [
            "Finance",
            "Developer",
            "Lead",
            "Employee 11"
        ]
    },
    {
        "id": 12,
        "name": "Employee 12",
        "email": "employee12@company.com",
        "department": "HR",
        "role": "Manager",
        "salary": 145726,
        "joinDate": "2025-11-22",
        "path": [
            "HR",
            "Manager",
            "Senior",
            "Employee 12"
        ]
    },
    {
        "id": 13,
        "name": "Employee 13",
        "email": "employee13@company.com",
        "department": "Finance",
        "role": "Developer",
        "salary": 56614,
        "joinDate": "2024-08-14",
        "path": [
            "Finance",
            "Developer",
            "Associate",
            "Employee 13"
        ]
    },
    {
        "id": 14,
        "name": "Employee 14",
        "email": "employee14@company.com",
        "department": "HR",
        "role": "Designer",
        "salary": 149692,
        "joinDate": "2026-09-19",
        "path": [
            "HR",
            "Designer",
            "Lead",
            "Employee 14"
        ]
    },
    {
        "id": 15,
        "name": "Employee 15",
        "email": "employee15@company.com",
        "department": "Sales",
        "role": "Developer",
        "salary": 75405,
        "joinDate": "2025-06-02",
        "path": [
            "Sales",
            "Developer",
            "Junior",
            "Employee 15"
        ]
    },
    {
        "id": 16,
        "name": "Employee 16",
        "email": "employee16@company.com",
        "department": "Engineering",
        "role": "Designer",
        "salary": 142167,
        "joinDate": "2028-02-08",
        "path": [
            "Engineering",
            "Designer",
            "Junior",
            "Employee 16"
        ]
    },
    {
        "id": 17,
        "name": "Employee 17",
        "email": "employee17@company.com",
        "department": "HR",
        "role": "Manager",
        "salary": 147691,
        "joinDate": "2024-02-20",
        "path": [
            "HR",
            "Manager",
            "Junior",
            "Employee 17"
        ]
    },
    {
        "id": 18,
        "name": "Employee 18",
        "email": "employee18@company.com",
        "department": "Marketing",
        "role": "Manager",
        "salary": 108042,
        "joinDate": "2028-05-14",
        "path": [
            "Marketing",
            "Manager",
            "Associate",
            "Employee 18"
        ]
    },
    {
        "id": 19,
        "name": "Employee 19",
        "email": "employee19@company.com",
        "department": "Finance",
        "role": "Manager",
        "salary": 116548,
        "joinDate": "2027-05-22",
        "path": [
            "Finance",
            "Manager",
            "Senior",
            "Employee 19"
        ]
    },
    {
        "id": 20,
        "name": "Employee 20",
        "email": "employee20@company.com",
        "department": "Engineering",
        "role": "Designer",
        "salary": 143791,
        "joinDate": "2028-08-06",
        "path": [
            "Engineering",
            "Designer",
            "Associate",
            "Employee 20"
        ]
    },
    {
        "id": 21,
        "name": "Employee 21",
        "email": "employee21@company.com",
        "department": "HR",
        "role": "Specialist",
        "salary": 148217,
        "joinDate": "2027-04-30",
        "path": [
            "HR",
            "Specialist",
            "Associate",
            "Employee 21"
        ]
    },
    {
        "id": 22,
        "name": "Employee 22",
        "email": "employee22@company.com",
        "department": "Marketing",
        "role": "Developer",
        "salary": 101639,
        "joinDate": "2025-10-08",
        "path": [
            "Marketing",
            "Developer",
            "Associate",
            "Employee 22"
        ]
    },
    {
        "id": 23,
        "name": "Employee 23",
        "email": "employee23@company.com",
        "department": "Finance",
        "role": "Developer",
        "salary": 146111,
        "joinDate": "2027-03-13",
        "path": [
            "Finance",
            "Developer",
            "Associate",
            "Employee 23"
        ]
    },
    {
        "id": 24,
        "name": "Employee 24",
        "email": "employee24@company.com",
        "department": "Marketing",
        "role": "Developer",
        "salary": 74704,
        "joinDate": "2025-04-03",
        "path": [
            "Marketing",
            "Developer",
            "Senior",
            "Employee 24"
        ]
    },
    {
        "id": 25,
        "name": "Employee 25",
        "email": "employee25@company.com",
        "department": "Sales",
        "role": "Manager",
        "salary": 77189,
        "joinDate": "2028-03-04",
        "path": [
            "Sales",
            "Manager",
            "Associate",
            "Employee 25"
        ]
    },
    {
        "id": 26,
        "name": "Employee 26",
        "email": "employee26@company.com",
        "department": "Engineering",
        "role": "Manager",
        "salary": 113149,
        "joinDate": "2026-10-08",
        "path": [
            "Engineering",
            "Manager",
            "Lead",
            "Employee 26"
        ]
    },
    {
        "id": 27,
        "name": "Employee 27",
        "email": "employee27@company.com",
        "department": "Finance",
        "role": "Designer",
        "salary": 91266,
        "joinDate": "2026-02-10",
        "path": [
            "Finance",
            "Designer",
            "Junior",
            "Employee 27"
        ]
    },
    {
        "id": 28,
        "name": "Employee 28",
        "email": "employee28@company.com",
        "department": "HR",
        "role": "Manager",
        "salary": 94478,
        "joinDate": "2027-03-16",
        "path": [
            "HR",
            "Manager",
            "Associate",
            "Employee 28"
        ]
    },
    {
        "id": 29,
        "name": "Employee 29",
        "email": "employee29@company.com",
        "department": "HR",
        "role": "Designer",
        "salary": 92084,
        "joinDate": "2025-12-27",
        "path": [
            "HR",
            "Designer",
            "Senior",
            "Employee 29"
        ]
    },
    {
        "id": 30,
        "name": "Employee 30",
        "email": "employee30@company.com",
        "department": "Sales",
        "role": "Designer",
        "salary": 50449,
        "joinDate": "2026-02-10",
        "path": [
            "Sales",
            "Designer",
            "Lead",
            "Employee 30"
        ]
    },
    {
        "id": 31,
        "name": "Employee 31",
        "email": "employee31@company.com",
        "department": "Finance",
        "role": "Specialist",
        "salary": 90065,
        "joinDate": "2025-09-24",
        "path": [
            "Finance",
            "Specialist",
            "Lead",
            "Employee 31"
        ]
    },
    {
        "id": 32,
        "name": "Employee 32",
        "email": "employee32@company.com",
        "department": "Marketing",
        "role": "Analyst",
        "salary": 91046,
        "joinDate": "2024-12-11",
        "path": [
            "Marketing",
            "Analyst",
            "Lead",
            "Employee 32"
        ]
    },
    {
        "id": 33,
        "name": "Employee 33",
        "email": "employee33@company.com",
        "department": "Finance",
        "role": "Designer",
        "salary": 108182,
        "joinDate": "2024-04-02",
        "path": [
            "Finance",
            "Designer",
            "Junior",
            "Employee 33"
        ]
    },
    {
        "id": 34,
        "name": "Employee 34",
        "email": "employee34@company.com",
        "department": "Finance",
        "role": "Analyst",
        "salary": 81580,
        "joinDate": "2027-08-06",
        "path": [
            "Finance",
            "Analyst",
            "Senior",
            "Employee 34"
        ]
    },
    {
        "id": 35,
        "name": "Employee 35",
        "email": "employee35@company.com",
        "department": "Sales",
        "role": "Specialist",
        "salary": 123659,
        "joinDate": "2025-09-14",
        "path": [
            "Sales",
            "Specialist",
            "Lead",
            "Employee 35"
        ]
    },
    {
        "id": 36,
        "name": "Employee 36",
        "email": "employee36@company.com",
        "department": "HR",
        "role": "Specialist",
        "salary": 149410,
        "joinDate": "2028-03-06",
        "path": [
            "HR",
            "Specialist",
            "Associate",
            "Employee 36"
        ]
    },
    {
        "id": 37,
        "name": "Employee 37",
        "email": "employee37@company.com",
        "department": "Engineering",
        "role": "Analyst",
        "salary": 58984,
        "joinDate": "2024-03-03",
        "path": [
            "Engineering",
            "Analyst",
            "Associate",
            "Employee 37"
        ]
    },
    {
        "id": 38,
        "name": "Employee 38",
        "email": "employee38@company.com",
        "department": "Engineering",
        "role": "Designer",
        "salary": 67732,
        "joinDate": "2027-05-12",
        "path": [
            "Engineering",
            "Designer",
            "Associate",
            "Employee 38"
        ]
    },
    {
        "id": 39,
        "name": "Employee 39",
        "email": "employee39@company.com",
        "department": "Finance",
        "role": "Analyst",
        "salary": 63705,
        "joinDate": "2028-01-27",
        "path": [
            "Finance",
            "Analyst",
            "Associate",
            "Employee 39"
        ]
    },
    {
        "id": 40,
        "name": "Employee 40",
        "email": "employee40@company.com",
        "department": "Marketing",
        "role": "Manager",
        "salary": 98048,
        "joinDate": "2026-11-27",
        "path": [
            "Marketing",
            "Manager",
            "Junior",
            "Employee 40"
        ]
    },
    {
        "id": 41,
        "name": "Employee 41",
        "email": "employee41@company.com",
        "department": "Finance",
        "role": "Specialist",
        "salary": 96306,
        "joinDate": "2025-07-18",
        "path": [
            "Finance",
            "Specialist",
            "Junior",
            "Employee 41"
        ]
    },
    {
        "id": 42,
        "name": "Employee 42",
        "email": "employee42@company.com",
        "department": "Engineering",
        "role": "Developer",
        "salary": 142370,
        "joinDate": "2027-08-04",
        "path": [
            "Engineering",
            "Developer",
            "Associate",
            "Employee 42"
        ]
    },
    {
        "id": 43,
        "name": "Employee 43",
        "email": "employee43@company.com",
        "department": "Sales",
        "role": "Manager",
        "salary": 134447,
        "joinDate": "2025-04-18",
        "path": [
            "Sales",
            "Manager",
            "Senior",
            "Employee 43"
        ]
    },
    {
        "id": 44,
        "name": "Employee 44",
        "email": "employee44@company.com",
        "department": "Marketing",
        "role": "Developer",
        "salary": 89800,
        "joinDate": "2026-04-27",
        "path": [
            "Marketing",
            "Developer",
            "Lead",
            "Employee 44"
        ]
    },
    {
        "id": 45,
        "name": "Employee 45",
        "email": "employee45@company.com",
        "department": "Marketing",
        "role": "Designer",
        "salary": 96086,
        "joinDate": "2024-05-13",
        "path": [
            "Marketing",
            "Designer",
            "Junior",
            "Employee 45"
        ]
    },
    {
        "id": 46,
        "name": "Employee 46",
        "email": "employee46@company.com",
        "department": "Sales",
        "role": "Manager",
        "salary": 115561,
        "joinDate": "2025-07-05",
        "path": [
            "Sales",
            "Manager",
            "Associate",
            "Employee 46"
        ]
    },
    {
        "id": 47,
        "name": "Employee 47",
        "email": "employee47@company.com",
        "department": "Marketing",
        "role": "Analyst",
        "salary": 77414,
        "joinDate": "2026-02-15",
        "path": [
            "Marketing",
            "Analyst",
            "Associate",
            "Employee 47"
        ]
    },
    {
        "id": 48,
        "name": "Employee 48",
        "email": "employee48@company.com",
        "department": "Finance",
        "role": "Analyst",
        "salary": 50545,
        "joinDate": "2026-12-24",
        "path": [
            "Finance",
            "Analyst",
            "Associate",
            "Employee 48"
        ]
    },
    {
        "id": 49,
        "name": "Employee 49",
        "email": "employee49@company.com",
        "department": "Marketing",
        "role": "Manager",
        "salary": 61267,
        "joinDate": "2028-04-01",
        "path": [
            "Marketing",
            "Manager",
            "Associate",
            "Employee 49"
        ]
    },
    {
        "id": 50,
        "name": "Employee 50",
        "email": "employee50@company.com",
        "department": "HR",
        "role": "Designer",
        "salary": 130775,
        "joinDate": "2025-05-20",
        "path": [
            "HR",
            "Designer",
            "Junior",
            "Employee 50"
        ]
    },
    {
        "id": 51,
        "name": "Employee 51",
        "email": "employee51@company.com",
        "department": "Finance",
        "role": "Analyst",
        "salary": 61291,
        "joinDate": "2026-10-06",
        "path": [
            "Finance",
            "Analyst",
            "Lead",
            "Employee 51"
        ]
    },
    {
        "id": 52,
        "name": "Employee 52",
        "email": "employee52@company.com",
        "department": "Finance",
        "role": "Developer",
        "salary": 121744,
        "joinDate": "2024-07-12",
        "path": [
            "Finance",
            "Developer",
            "Lead",
            "Employee 52"
        ]
    },
    {
        "id": 53,
        "name": "Employee 53",
        "email": "employee53@company.com",
        "department": "Engineering",
        "role": "Analyst",
        "salary": 108492,
        "joinDate": "2025-05-04",
        "path": [
            "Engineering",
            "Analyst",
            "Associate",
            "Employee 53"
        ]
    },
    {
        "id": 54,
        "name": "Employee 54",
        "email": "employee54@company.com",
        "department": "Engineering",
        "role": "Analyst",
        "salary": 72189,
        "joinDate": "2028-10-06",
        "path": [
            "Engineering",
            "Analyst",
            "Lead",
            "Employee 54"
        ]
    },
    {
        "id": 55,
        "name": "Employee 55",
        "email": "employee55@company.com",
        "department": "Sales",
        "role": "Designer",
        "salary": 105328,
        "joinDate": "2027-05-07",
        "path": [
            "Sales",
            "Designer",
            "Senior",
            "Employee 55"
        ]
    },
    {
        "id": 56,
        "name": "Employee 56",
        "email": "employee56@company.com",
        "department": "HR",
        "role": "Designer",
        "salary": 102771,
        "joinDate": "2027-05-20",
        "path": [
            "HR",
            "Designer",
            "Senior",
            "Employee 56"
        ]
    },
    {
        "id": 57,
        "name": "Employee 57",
        "email": "employee57@company.com",
        "department": "HR",
        "role": "Developer",
        "salary": 140085,
        "joinDate": "2028-07-05",
        "path": [
            "HR",
            "Developer",
            "Junior",
            "Employee 57"
        ]
    },
    {
        "id": 58,
        "name": "Employee 58",
        "email": "employee58@company.com",
        "department": "Finance",
        "role": "Specialist",
        "salary": 79502,
        "joinDate": "2024-01-08",
        "path": [
            "Finance",
            "Specialist",
            "Junior",
            "Employee 58"
        ]
    },
    {
        "id": 59,
        "name": "Employee 59",
        "email": "employee59@company.com",
        "department": "Finance",
        "role": "Analyst",
        "salary": 110624,
        "joinDate": "2024-01-31",
        "path": [
            "Finance",
            "Analyst",
            "Associate",
            "Employee 59"
        ]
    },
    {
        "id": 60,
        "name": "Employee 60",
        "email": "employee60@company.com",
        "department": "Finance",
        "role": "Designer",
        "salary": 113318,
        "joinDate": "2024-08-25",
        "path": [
            "Finance",
            "Designer",
            "Associate",
            "Employee 60"
        ]
    },
    {
        "id": 61,
        "name": "Employee 61",
        "email": "employee61@company.com",
        "department": "Sales",
        "role": "Specialist",
        "salary": 134162,
        "joinDate": "2026-11-18",
        "path": [
            "Sales",
            "Specialist",
            "Junior",
            "Employee 61"
        ]
    },
    {
        "id": 62,
        "name": "Employee 62",
        "email": "employee62@company.com",
        "department": "Marketing",
        "role": "Developer",
        "salary": 67134,
        "joinDate": "2027-11-24",
        "path": [
            "Marketing",
            "Developer",
            "Associate",
            "Employee 62"
        ]
    },
    {
        "id": 63,
        "name": "Employee 63",
        "email": "employee63@company.com",
        "department": "HR",
        "role": "Designer",
        "salary": 90005,
        "joinDate": "2025-06-04",
        "path": [
            "HR",
            "Designer",
            "Senior",
            "Employee 63"
        ]
    },
    {
        "id": 64,
        "name": "Employee 64",
        "email": "employee64@company.com",
        "department": "Finance",
        "role": "Analyst",
        "salary": 77806,
        "joinDate": "2027-07-27",
        "path": [
            "Finance",
            "Analyst",
            "Lead",
            "Employee 64"
        ]
    },
    {
        "id": 65,
        "name": "Employee 65",
        "email": "employee65@company.com",
        "department": "Sales",
        "role": "Analyst",
        "salary": 51753,
        "joinDate": "2028-09-21",
        "path": [
            "Sales",
            "Analyst",
            "Lead",
            "Employee 65"
        ]
    },
    {
        "id": 66,
        "name": "Employee 66",
        "email": "employee66@company.com",
        "department": "Marketing",
        "role": "Specialist",
        "salary": 144569,
        "joinDate": "2028-01-19",
        "path": [
            "Marketing",
            "Specialist",
            "Junior",
            "Employee 66"
        ]
    },
    {
        "id": 67,
        "name": "Employee 67",
        "email": "employee67@company.com",
        "department": "Engineering",
        "role": "Manager",
        "salary": 64548,
        "joinDate": "2027-03-14",
        "path": [
            "Engineering",
            "Manager",
            "Associate",
            "Employee 67"
        ]
    },
    {
        "id": 68,
        "name": "Employee 68",
        "email": "employee68@company.com",
        "department": "Marketing",
        "role": "Specialist",
        "salary": 86659,
        "joinDate": "2027-11-27",
        "path": [
            "Marketing",
            "Specialist",
            "Associate",
            "Employee 68"
        ]
    },
    {
        "id": 69,
        "name": "Employee 69",
        "email": "employee69@company.com",
        "department": "HR",
        "role": "Specialist",
        "salary": 85680,
        "joinDate": "2027-06-23",
        "path": [
            "HR",
            "Specialist",
            "Junior",
            "Employee 69"
        ]
    },
    {
        "id": 70,
        "name": "Employee 70",
        "email": "employee70@company.com",
        "department": "HR",
        "role": "Analyst",
        "salary": 139233,
        "joinDate": "2027-07-17",
        "path": [
            "HR",
            "Analyst",
            "Associate",
            "Employee 70"
        ]
    },
    {
        "id": 71,
        "name": "Employee 71",
        "email": "employee71@company.com",
        "department": "HR",
        "role": "Manager",
        "salary": 80112,
        "joinDate": "2026-12-06",
        "path": [
            "HR",
            "Manager",
            "Associate",
            "Employee 71"
        ]
    },
    {
        "id": 72,
        "name": "Employee 72",
        "email": "employee72@company.com",
        "department": "Sales",
        "role": "Specialist",
        "salary": 54732,
        "joinDate": "2024-08-23",
        "path": [
            "Sales",
            "Specialist",
            "Senior",
            "Employee 72"
        ]
    },
    {
        "id": 73,
        "name": "Employee 73",
        "email": "employee73@company.com",
        "department": "HR",
        "role": "Analyst",
        "salary": 125127,
        "joinDate": "2028-01-08",
        "path": [
            "HR",
            "Analyst",
            "Senior",
            "Employee 73"
        ]
    },
    {
        "id": 74,
        "name": "Employee 74",
        "email": "employee74@company.com",
        "department": "Sales",
        "role": "Analyst",
        "salary": 120322,
        "joinDate": "2028-06-19",
        "path": [
            "Sales",
            "Analyst",
            "Lead",
            "Employee 74"
        ]
    },
    {
        "id": 75,
        "name": "Employee 75",
        "email": "employee75@company.com",
        "department": "Marketing",
        "role": "Manager",
        "salary": 95789,
        "joinDate": "2027-10-23",
        "path": [
            "Marketing",
            "Manager",
            "Associate",
            "Employee 75"
        ]
    },
    {
        "id": 76,
        "name": "Employee 76",
        "email": "employee76@company.com",
        "department": "Finance",
        "role": "Manager",
        "salary": 121808,
        "joinDate": "2027-10-27",
        "path": [
            "Finance",
            "Manager",
            "Junior",
            "Employee 76"
        ]
    },
    {
        "id": 77,
        "name": "Employee 77",
        "email": "employee77@company.com",
        "department": "Sales",
        "role": "Specialist",
        "salary": 108933,
        "joinDate": "2025-02-05",
        "path": [
            "Sales",
            "Specialist",
            "Senior",
            "Employee 77"
        ]
    },
    {
        "id": 78,
        "name": "Employee 78",
        "email": "employee78@company.com",
        "department": "Finance",
        "role": "Manager",
        "salary": 50946,
        "joinDate": "2026-11-20",
        "path": [
            "Finance",
            "Manager",
            "Senior",
            "Employee 78"
        ]
    },
    {
        "id": 79,
        "name": "Employee 79",
        "email": "employee79@company.com",
        "department": "Marketing",
        "role": "Manager",
        "salary": 100965,
        "joinDate": "2024-04-21",
        "path": [
            "Marketing",
            "Manager",
            "Lead",
            "Employee 79"
        ]
    },
    {
        "id": 80,
        "name": "Employee 80",
        "email": "employee80@company.com",
        "department": "Marketing",
        "role": "Analyst",
        "salary": 54548,
        "joinDate": "2026-04-05",
        "path": [
            "Marketing",
            "Analyst",
            "Junior",
            "Employee 80"
        ]
    },
    {
        "id": 81,
        "name": "Employee 81",
        "email": "employee81@company.com",
        "department": "Marketing",
        "role": "Analyst",
        "salary": 135883,
        "joinDate": "2027-08-17",
        "path": [
            "Marketing",
            "Analyst",
            "Senior",
            "Employee 81"
        ]
    },
    {
        "id": 82,
        "name": "Employee 82",
        "email": "employee82@company.com",
        "department": "Sales",
        "role": "Developer",
        "salary": 52216,
        "joinDate": "2024-04-23",
        "path": [
            "Sales",
            "Developer",
            "Junior",
            "Employee 82"
        ]
    },
    {
        "id": 83,
        "name": "Employee 83",
        "email": "employee83@company.com",
        "department": "Engineering",
        "role": "Developer",
        "salary": 110290,
        "joinDate": "2025-11-14",
        "path": [
            "Engineering",
            "Developer",
            "Junior",
            "Employee 83"
        ]
    },
    {
        "id": 84,
        "name": "Employee 84",
        "email": "employee84@company.com",
        "department": "Sales",
        "role": "Developer",
        "salary": 140522,
        "joinDate": "2024-09-11",
        "path": [
            "Sales",
            "Developer",
            "Junior",
            "Employee 84"
        ]
    },
    {
        "id": 85,
        "name": "Employee 85",
        "email": "employee85@company.com",
        "department": "Engineering",
        "role": "Specialist",
        "salary": 84485,
        "joinDate": "2026-09-23",
        "path": [
            "Engineering",
            "Specialist",
            "Junior",
            "Employee 85"
        ]
    },
    {
        "id": 86,
        "name": "Employee 86",
        "email": "employee86@company.com",
        "department": "Finance",
        "role": "Designer",
        "salary": 133032,
        "joinDate": "2024-03-27",
        "path": [
            "Finance",
            "Designer",
            "Associate",
            "Employee 86"
        ]
    },
    {
        "id": 87,
        "name": "Employee 87",
        "email": "employee87@company.com",
        "department": "Engineering",
        "role": "Analyst",
        "salary": 148861,
        "joinDate": "2024-11-21",
        "path": [
            "Engineering",
            "Analyst",
            "Senior",
            "Employee 87"
        ]
    },
    {
        "id": 88,
        "name": "Employee 88",
        "email": "employee88@company.com",
        "department": "Marketing",
        "role": "Analyst",
        "salary": 55613,
        "joinDate": "2028-11-20",
        "path": [
            "Marketing",
            "Analyst",
            "Associate",
            "Employee 88"
        ]
    },
    {
        "id": 89,
        "name": "Employee 89",
        "email": "employee89@company.com",
        "department": "Engineering",
        "role": "Specialist",
        "salary": 61081,
        "joinDate": "2024-11-25",
        "path": [
            "Engineering",
            "Specialist",
            "Associate",
            "Employee 89"
        ]
    },
    {
        "id": 90,
        "name": "Employee 90",
        "email": "employee90@company.com",
        "department": "Marketing",
        "role": "Developer",
        "salary": 135328,
        "joinDate": "2024-02-08",
        "path": [
            "Marketing",
            "Developer",
            "Senior",
            "Employee 90"
        ]
    },
    {
        "id": 91,
        "name": "Employee 91",
        "email": "employee91@company.com",
        "department": "HR",
        "role": "Designer",
        "salary": 145196,
        "joinDate": "2025-08-27",
        "path": [
            "HR",
            "Designer",
            "Junior",
            "Employee 91"
        ]
    },
    {
        "id": 92,
        "name": "Employee 92",
        "email": "employee92@company.com",
        "department": "HR",
        "role": "Analyst",
        "salary": 149874,
        "joinDate": "2028-08-04",
        "path": [
            "HR",
            "Analyst",
            "Lead",
            "Employee 92"
        ]
    },
    {
        "id": 93,
        "name": "Employee 93",
        "email": "employee93@company.com",
        "department": "HR",
        "role": "Designer",
        "salary": 51149,
        "joinDate": "2026-12-08",
        "path": [
            "HR",
            "Designer",
            "Junior",
            "Employee 93"
        ]
    },
    {
        "id": 94,
        "name": "Employee 94",
        "email": "employee94@company.com",
        "department": "Marketing",
        "role": "Analyst",
        "salary": 129366,
        "joinDate": "2025-07-26",
        "path": [
            "Marketing",
            "Analyst",
            "Lead",
            "Employee 94"
        ]
    },
    {
        "id": 95,
        "name": "Employee 95",
        "email": "employee95@company.com",
        "department": "Finance",
        "role": "Analyst",
        "salary": 132589,
        "joinDate": "2025-10-08",
        "path": [
            "Finance",
            "Analyst",
            "Lead",
            "Employee 95"
        ]
    },
    {
        "id": 96,
        "name": "Employee 96",
        "email": "employee96@company.com",
        "department": "Sales",
        "role": "Developer",
        "salary": 57917,
        "joinDate": "2025-05-31",
        "path": [
            "Sales",
            "Developer",
            "Senior",
            "Employee 96"
        ]
    },
    {
        "id": 97,
        "name": "Employee 97",
        "email": "employee97@company.com",
        "department": "Finance",
        "role": "Manager",
        "salary": 107883,
        "joinDate": "2026-12-02",
        "path": [
            "Finance",
            "Manager",
            "Associate",
            "Employee 97"
        ]
    },
    {
        "id": 98,
        "name": "Employee 98",
        "email": "employee98@company.com",
        "department": "Engineering",
        "role": "Specialist",
        "salary": 99037,
        "joinDate": "2028-03-08",
        "path": [
            "Engineering",
            "Specialist",
            "Lead",
            "Employee 98"
        ]
    },
    {
        "id": 99,
        "name": "Employee 99",
        "email": "employee99@company.com",
        "department": "HR",
        "role": "Developer",
        "salary": 69238,
        "joinDate": "2024-01-18",
        "path": [
            "HR",
            "Developer",
            "Junior",
            "Employee 99"
        ]
    },
    {
        "id": 100,
        "name": "Employee 100",
        "email": "employee100@company.com",
        "department": "Sales",
        "role": "Analyst",
        "salary": 75590,
        "joinDate": "2025-05-22",
        "path": [
            "Sales",
            "Analyst",
            "Junior",
            "Employee 100"
        ]
    }
]

const allColumns: GridColDef<Employee>[] = [
    {
        field: 'id',
        headerName: 'ID',
        width: 270,
        align: 'center',
        headerAlign: 'center',
        hideable: false
    },
    {
        field: 'name',
        headerName: 'Name',
        width: 180,
        sortable: true,
        editable: true
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
        valueFormatter: (params) => \`$\${Number(params.value).toLocaleString()}\`
    },
    {
        field: 'joinDate',
        headerName: 'Join Date',
        width: 130,
        sortable: true
    }
];

export function DataGridTest() {
    const [rows, setRows] = useState<Employee[]>(data);
    const [selectionModel, setSelectionModel] = useState<Array<string | number>>([]);
    const [sortModel, setSortModel] = useState<Array<{ field: string; sort: 'asc' | 'desc' }>>([]);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
    const [quickFilterValue, setQuickFilterValue] = useState('');
    const [showColumnPanel, setShowColumnPanel] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
        () => new Set(allColumns.map(col => col.field))
    );
    const [pinnedColumns, setPinnedColumns] = useState<GridColumnPinning>({
        left: ['id', 'name'],
        right: []
    });
    const [pinnedRows, setPinnedRows] = useState<GridRowPinning>({
        top: [1, 2],
        bottom: []
    });
    const [expandedDetailPanelRowIds, setExpandedDetailPanelRowIds] = useState<Set<GridRowId>>(new Set());
    const [columnOrder, setColumnOrder] = useState<string[]>(() => allColumns.map(col => col.field));
    const [pinCheckboxColumn, setPinCheckboxColumn] = useState(true);
    const [pinExpandColumn, setPinExpandColumn] = useState(true);
    const [rowReordering, setRowReordering] = useState(false);
    const [treeData, setTreeData] = useState(false);
    const [rowGroupingModel, setRowGroupingModel] = useState<GridRowGroupingModel>([]);
    const [aggregationModel, setAggregationModel] = useState<GridAggregationModel>({});
    const [detailPanelEnabled, setDetailPanelEnabled] = useState(true);

    const columns = useMemo(() => {
        return allColumns.filter(col => visibleColumns.has(col.field));
    }, [visibleColumns]);

    const filterModel: GridFilterModel = useMemo(() => {
        if (!quickFilterValue) {
            return { items: [] };
        }
        return {
            items: [],
            quickFilterValues: [quickFilterValue]
        };
    }, [quickFilterValue]);

    const filteredRowCount = useMemo(() => {
        if (!quickFilterValue) return rows.length;

        return rows.filter(row => {
            const searchTerm = quickFilterValue.toLowerCase();
            return Object.values(row).some(value => {
                if (value == null) return false;
                return String(value).toLowerCase().includes(searchTerm);
            });
        }).length;
    }, [rows, quickFilterValue]);

    const handleVisibilityChange = (field: string, isVisible: boolean) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (isVisible) {
                next.add(field);
            } else {
                next.delete(field);
            }
            return next;
        });
    };

    const handleShowAll = () => {
        setVisibleColumns(new Set(allColumns.map(col => col.field)));
    };

    const handleHideAll = () => {

        setVisibleColumns(new Set(allColumns.filter(col => col.hideable === false).map(col => col.field)));
    };

    return (
        <DocsLayout
            title="Full Feature Test"
            description="A comprehensive feature test page exercising every major OpenGridX capability in a single grid — virtualization, pinning, grouping, editing, export, and more."
            sourceCode={sourceCode}
        >
            <div className="datagrid-test__info">
                <div className="datagrid-test__stat">
                    <strong>Total Rows:</strong> {rows.length}
                </div>
                <div className="datagrid-test__stat">
                    <strong>Filtered:</strong> {filteredRowCount}
                </div>
                <div className="datagrid-test__stat">
                    <strong>Selected:</strong> {selectionModel.length}
                </div>
                <div className="datagrid-test__stat">
                    <strong>Visible Columns:</strong> {visibleColumns.size}/{allColumns.length}
                </div>
                <div className="datagrid-test__stat">
                    <strong>Page:</strong> {paginationModel.page + 1} of {Math.ceil(filteredRowCount / paginationModel.pageSize)}
                </div>
            </div>

            { }
            <div className="datagrid-test__toolbar">
                <div className="datagrid-test__toolbar-left">
                    <button
                        className="datagrid-test__toolbar-button"
                        onClick={() => setShowColumnPanel(!showColumnPanel)}
                    >
                        {showColumnPanel ? 'Hide' : 'Show'} Columns
                    </button>
                    <button
                        className="datagrid-test__toolbar-button datagrid-test__toolbar-button--secondary"
                        onClick={() => setPinnedColumns({ left: ['id', 'name'], right: [] })}
                    >
                        📌 Pin ID & Name
                    </button>
                    <button
                        className="datagrid-test__toolbar-button datagrid-test__toolbar-button--secondary"
                        onClick={() => setPinnedColumns({ left: [], right: ['salary', 'joinDate'] })}
                    >
                        📌 Pin Salary & Date
                    </button>
                    <button
                        className="datagrid-test__toolbar-button datagrid-test__toolbar-button--secondary"
                        onClick={() => setPinnedColumns({ left: [], right: [] })}
                    >
                        ❌ Unpin All Columns
                    </button>
                    <div className="datagrid-test__toolbar-divider"></div>
                    <button
                        className="datagrid-test__toolbar-button datagrid-test__toolbar-button--secondary"
                        onClick={() => setColumnOrder(allColumns.map(col => col.field))}
                    >
                        🔄 Reset Column Order
                    </button>
                    <button
                        className={\`datagrid-test__toolbar-button \${pinCheckboxColumn ? 'datagrid-test__toolbar-button--primary' : 'datagrid-test__toolbar-button--secondary'}\`}
                        onClick={() => setPinCheckboxColumn(!pinCheckboxColumn)}
                    >
                        {pinCheckboxColumn ? '🔓 Unpin Checkbox' : '🔒 Pin Checkbox'}
                    </button>
                    <button
                        className={\`datagrid-test__toolbar-button \${pinExpandColumn ? 'datagrid-test__toolbar-button--primary' : 'datagrid-test__toolbar-button--secondary'}\`}
                        onClick={() => setPinExpandColumn(!pinExpandColumn)}
                    >
                        {pinExpandColumn ? '🔓 Unpin Expand' : '🔒 Pin Expand'}
                    </button>
                    <button
                        className="datagrid-test__toolbar-button datagrid-test__toolbar-button--secondary"
                        onClick={() => setPinnedRows({ top: [1, 2], bottom: [] })}
                    >
                        📌 Pin First 2 Rows (Top)
                    </button>
                    <button
                        className="datagrid-test__toolbar-button datagrid-test__toolbar-button--secondary"
                        onClick={() => setPinnedRows({ top: [], bottom: [99, 100] })}
                    >
                        📌 Pin Last 2 Rows (Bottom)
                    </button>
                    <button
                        className="datagrid-test__toolbar-button datagrid-test__toolbar-button--secondary"
                        onClick={() => setPinnedRows({ top: [], bottom: [] })}
                    >
                        ❌ Unpin All Rows
                    </button>
                    <div className="datagrid-test__toolbar-divider"></div>
                    <button
                        className={\`datagrid-test__toolbar-button \${rowGroupingModel.length > 0 ? 'datagrid-test__toolbar-button--primary' : 'datagrid-test__toolbar-button--secondary'}\`}
                        onClick={() => {
                            if (rowGroupingModel.length > 0) {
                                setRowGroupingModel([]);
                                setAggregationModel({});
                            } else {
                                setRowGroupingModel(['department', 'role']);
                                setAggregationModel({ salary: 'sum', id: 'count' });
                            }

                            if (treeData) setTreeData(false);
                        }}
                    >
                        {rowGroupingModel.length > 0 ? '🚫 Disable Grouping' : '📑 Group by Dept > Role'}
                    </button>
                    <button
                        className={\`datagrid-test__toolbar-button \${treeData ? 'datagrid-test__toolbar-button--primary' : 'datagrid-test__toolbar-button--secondary'}\`}
                        onClick={() => {
                            setTreeData(!treeData);

                            if (!treeData) setRowGroupingModel([]);
                        }}
                    >
                        {treeData ? '🌳 Disable Tree Data' : '🌳 Enable Tree Data'}
                    </button>
                    <div className="datagrid-test__toolbar-divider"></div>
                    <button
                        className={\`datagrid-test__toolbar-button \${rowReordering ? 'datagrid-test__toolbar-button--primary' : 'datagrid-test__toolbar-button--secondary'}\`}
                        onClick={() => {
                            if (!rowReordering) {

                                setSortModel([]);
                                setPinnedRows({ top: [], bottom: [] });
                            }
                            setRowReordering(!rowReordering);
                        }}
                    >
                        {rowReordering ? '🛑 Disable Row Reorder' : '↕️ Enable Row Reorder'}
                    </button>
                    <div className="datagrid-test__toolbar-divider"></div>
                    <button
                        className={\`datagrid-test__toolbar-button \${detailPanelEnabled ? 'datagrid-test__toolbar-button--primary' : 'datagrid-test__toolbar-button--secondary'}\`}
                        onClick={() => {
                            setDetailPanelEnabled(!detailPanelEnabled);

                            if (detailPanelEnabled) {
                                setExpandedDetailPanelRowIds(new Set());
                            }
                        }}
                    >
                        {detailPanelEnabled ? '📋 Disable Detail Panel' : '📋 Enable Detail Panel'}
                    </button>
                </div>
                <QuickFilter
                    value={quickFilterValue}
                    onChange={setQuickFilterValue}
                    placeholder="Search across all columns..."
                />
            </div>

            { }
            {showColumnPanel && (
                <div className="datagrid-test__column-panel">
                    <ColumnVisibilityPanel
                        columns={allColumns}
                        visibleColumns={visibleColumns}
                        onVisibilityChange={handleVisibilityChange}
                        onShowAll={handleShowAll}
                        onHideAll={handleHideAll}
                    />
                </div>
            )}

            <div className="datagrid-test__grid">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    height={600}
                    checkboxSelection
                    rowSelectionModel={selectionModel}
                    onRowSelectionModelChange={setSelectionModel}
                    sortModel={sortModel}
                    onSortModelChange={setSortModel}
                    filterModel={filterModel}
                    pagination
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 25, 50, 100]}
                    pinnedColumns={pinnedColumns}
                    onPinnedColumnsChange={setPinnedColumns}
                    pinnedRows={pinnedRows}
                    onRowClick={(params) => console.log('Row clicked:', params.row)}
                    onCellClick={(params) => console.log('Cell clicked:', params.row, params.field)}
                    processRowUpdate={(newRow) => {
                        console.log('Row Updated:', newRow);

                        setRows(prev => prev.map(r => r.id === newRow.id ? (newRow as Employee) : r));
                        return newRow;
                    }}
                    onProcessRowUpdateError={(error) => console.error('Row Update Error:', error)}

                    getDetailPanelContent={detailPanelEnabled ? (params) => (
                        <div style={{ padding: '16px', background: '#f5f5f5' }}>
                            <h4 style={{ margin: '0 0 12px 0' }}>Employee Details: {params.row.name}</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div><strong>ID:</strong> {params.row.id}</div>
                                <div><strong>Email:</strong> {params.row.email}</div>
                                <div><strong>Department:</strong> {params.row.department}</div>
                                <div><strong>Role:</strong> {params.row.role}</div>
                                <div><strong>Salary:</strong> \${params.row.salary.toLocaleString()}</div>
                                <div><strong>Join Date:</strong> {params.row.joinDate}</div>
                            </div>
                        </div>
                    ) : undefined}
                    getDetailPanelHeight={detailPanelEnabled ? () => 150 : undefined}
                    detailPanelExpandedRowIds={detailPanelEnabled ? expandedDetailPanelRowIds : undefined}
                    onDetailPanelExpandedRowIdsChange={detailPanelEnabled ? setExpandedDetailPanelRowIds : undefined}
                    pinCheckboxColumn={pinCheckboxColumn}
                    pinExpandColumn={pinExpandColumn}
                    columnOrder={columnOrder}
                    onColumnOrderModelChange={setColumnOrder}
                    onColumnOrderChange={(params) => {
                        console.log('Column reordered:', params);
                    }}

                    rowGroupingModel={rowGroupingModel}
                    aggregationModel={aggregationModel}
                    onAggregationModelChange={setAggregationModel}

                    rowReordering={rowReordering}
                    onRowOrderChange={(params) => {
                        // oldIndex / targetIndex are positions in \`rows\`, whatever the page, sort or filter.
                        const { oldIndex, targetIndex } = params;
                        console.log('Row reordered:', params);
                        setRows(prev => {
                            const newRows = [...prev];
                            const [moved] = newRows.splice(oldIndex, 1);
                            newRows.splice(targetIndex, 0, moved);
                            return newRows;
                        });
                    }}
                />
            </div>

        </DocsLayout>
    );
}

export default DataGridTest;
`,oe=[{id:1,name:"Employee 1",email:"employee1@company.com",department:"Finance",role:"Designer",salary:148417,joinDate:"2028-06-08",path:["Finance","Designer","Lead","Employee 1"]},{id:2,name:"Employee 2",email:"employee2@company.com",department:"Engineering",role:"Analyst",salary:121903,joinDate:"2025-06-02",path:["Engineering","Analyst","Lead","Employee 2"]},{id:3,name:"Employee 3",email:"employee3@company.com",department:"Engineering",role:"Designer",salary:88214,joinDate:"2028-03-11",path:["Engineering","Designer","Associate","Employee 3"]},{id:4,name:"Employee 4",email:"employee4@company.com",department:"Finance",role:"Developer",salary:74691,joinDate:"2026-08-18",path:["Finance","Developer","Junior","Employee 4"]},{id:5,name:"Employee 5",email:"employee5@company.com",department:"Sales",role:"Manager",salary:86243,joinDate:"2025-07-08",path:["Sales","Manager","Associate","Employee 5"]},{id:6,name:"Employee 6",email:"employee6@company.com",department:"Finance",role:"Analyst",salary:68299,joinDate:"2024-08-31",path:["Finance","Analyst","Associate","Employee 6"]},{id:7,name:"Employee 7",email:"employee7@company.com",department:"Engineering",role:"Developer",salary:105841,joinDate:"2024-10-04",path:["Engineering","Developer","Associate","Employee 7"]},{id:8,name:"Employee 8",email:"employee8@company.com",department:"Sales",role:"Developer",salary:120908,joinDate:"2027-12-02",path:["Sales","Developer","Senior","Employee 8"]},{id:9,name:"Employee 9",email:"employee9@company.com",department:"Sales",role:"Designer",salary:139259,joinDate:"2024-05-25",path:["Sales","Designer","Junior","Employee 9"]},{id:10,name:"Employee 10",email:"employee10@company.com",department:"Finance",role:"Analyst",salary:136236,joinDate:"2024-02-23",path:["Finance","Analyst","Senior","Employee 10"]},{id:11,name:"Employee 11",email:"employee11@company.com",department:"Finance",role:"Developer",salary:141366,joinDate:"2026-10-03",path:["Finance","Developer","Lead","Employee 11"]},{id:12,name:"Employee 12",email:"employee12@company.com",department:"HR",role:"Manager",salary:145726,joinDate:"2025-11-22",path:["HR","Manager","Senior","Employee 12"]},{id:13,name:"Employee 13",email:"employee13@company.com",department:"Finance",role:"Developer",salary:56614,joinDate:"2024-08-14",path:["Finance","Developer","Associate","Employee 13"]},{id:14,name:"Employee 14",email:"employee14@company.com",department:"HR",role:"Designer",salary:149692,joinDate:"2026-09-19",path:["HR","Designer","Lead","Employee 14"]},{id:15,name:"Employee 15",email:"employee15@company.com",department:"Sales",role:"Developer",salary:75405,joinDate:"2025-06-02",path:["Sales","Developer","Junior","Employee 15"]},{id:16,name:"Employee 16",email:"employee16@company.com",department:"Engineering",role:"Designer",salary:142167,joinDate:"2028-02-08",path:["Engineering","Designer","Junior","Employee 16"]},{id:17,name:"Employee 17",email:"employee17@company.com",department:"HR",role:"Manager",salary:147691,joinDate:"2024-02-20",path:["HR","Manager","Junior","Employee 17"]},{id:18,name:"Employee 18",email:"employee18@company.com",department:"Marketing",role:"Manager",salary:108042,joinDate:"2028-05-14",path:["Marketing","Manager","Associate","Employee 18"]},{id:19,name:"Employee 19",email:"employee19@company.com",department:"Finance",role:"Manager",salary:116548,joinDate:"2027-05-22",path:["Finance","Manager","Senior","Employee 19"]},{id:20,name:"Employee 20",email:"employee20@company.com",department:"Engineering",role:"Designer",salary:143791,joinDate:"2028-08-06",path:["Engineering","Designer","Associate","Employee 20"]},{id:21,name:"Employee 21",email:"employee21@company.com",department:"HR",role:"Specialist",salary:148217,joinDate:"2027-04-30",path:["HR","Specialist","Associate","Employee 21"]},{id:22,name:"Employee 22",email:"employee22@company.com",department:"Marketing",role:"Developer",salary:101639,joinDate:"2025-10-08",path:["Marketing","Developer","Associate","Employee 22"]},{id:23,name:"Employee 23",email:"employee23@company.com",department:"Finance",role:"Developer",salary:146111,joinDate:"2027-03-13",path:["Finance","Developer","Associate","Employee 23"]},{id:24,name:"Employee 24",email:"employee24@company.com",department:"Marketing",role:"Developer",salary:74704,joinDate:"2025-04-03",path:["Marketing","Developer","Senior","Employee 24"]},{id:25,name:"Employee 25",email:"employee25@company.com",department:"Sales",role:"Manager",salary:77189,joinDate:"2028-03-04",path:["Sales","Manager","Associate","Employee 25"]},{id:26,name:"Employee 26",email:"employee26@company.com",department:"Engineering",role:"Manager",salary:113149,joinDate:"2026-10-08",path:["Engineering","Manager","Lead","Employee 26"]},{id:27,name:"Employee 27",email:"employee27@company.com",department:"Finance",role:"Designer",salary:91266,joinDate:"2026-02-10",path:["Finance","Designer","Junior","Employee 27"]},{id:28,name:"Employee 28",email:"employee28@company.com",department:"HR",role:"Manager",salary:94478,joinDate:"2027-03-16",path:["HR","Manager","Associate","Employee 28"]},{id:29,name:"Employee 29",email:"employee29@company.com",department:"HR",role:"Designer",salary:92084,joinDate:"2025-12-27",path:["HR","Designer","Senior","Employee 29"]},{id:30,name:"Employee 30",email:"employee30@company.com",department:"Sales",role:"Designer",salary:50449,joinDate:"2026-02-10",path:["Sales","Designer","Lead","Employee 30"]},{id:31,name:"Employee 31",email:"employee31@company.com",department:"Finance",role:"Specialist",salary:90065,joinDate:"2025-09-24",path:["Finance","Specialist","Lead","Employee 31"]},{id:32,name:"Employee 32",email:"employee32@company.com",department:"Marketing",role:"Analyst",salary:91046,joinDate:"2024-12-11",path:["Marketing","Analyst","Lead","Employee 32"]},{id:33,name:"Employee 33",email:"employee33@company.com",department:"Finance",role:"Designer",salary:108182,joinDate:"2024-04-02",path:["Finance","Designer","Junior","Employee 33"]},{id:34,name:"Employee 34",email:"employee34@company.com",department:"Finance",role:"Analyst",salary:81580,joinDate:"2027-08-06",path:["Finance","Analyst","Senior","Employee 34"]},{id:35,name:"Employee 35",email:"employee35@company.com",department:"Sales",role:"Specialist",salary:123659,joinDate:"2025-09-14",path:["Sales","Specialist","Lead","Employee 35"]},{id:36,name:"Employee 36",email:"employee36@company.com",department:"HR",role:"Specialist",salary:149410,joinDate:"2028-03-06",path:["HR","Specialist","Associate","Employee 36"]},{id:37,name:"Employee 37",email:"employee37@company.com",department:"Engineering",role:"Analyst",salary:58984,joinDate:"2024-03-03",path:["Engineering","Analyst","Associate","Employee 37"]},{id:38,name:"Employee 38",email:"employee38@company.com",department:"Engineering",role:"Designer",salary:67732,joinDate:"2027-05-12",path:["Engineering","Designer","Associate","Employee 38"]},{id:39,name:"Employee 39",email:"employee39@company.com",department:"Finance",role:"Analyst",salary:63705,joinDate:"2028-01-27",path:["Finance","Analyst","Associate","Employee 39"]},{id:40,name:"Employee 40",email:"employee40@company.com",department:"Marketing",role:"Manager",salary:98048,joinDate:"2026-11-27",path:["Marketing","Manager","Junior","Employee 40"]},{id:41,name:"Employee 41",email:"employee41@company.com",department:"Finance",role:"Specialist",salary:96306,joinDate:"2025-07-18",path:["Finance","Specialist","Junior","Employee 41"]},{id:42,name:"Employee 42",email:"employee42@company.com",department:"Engineering",role:"Developer",salary:142370,joinDate:"2027-08-04",path:["Engineering","Developer","Associate","Employee 42"]},{id:43,name:"Employee 43",email:"employee43@company.com",department:"Sales",role:"Manager",salary:134447,joinDate:"2025-04-18",path:["Sales","Manager","Senior","Employee 43"]},{id:44,name:"Employee 44",email:"employee44@company.com",department:"Marketing",role:"Developer",salary:89800,joinDate:"2026-04-27",path:["Marketing","Developer","Lead","Employee 44"]},{id:45,name:"Employee 45",email:"employee45@company.com",department:"Marketing",role:"Designer",salary:96086,joinDate:"2024-05-13",path:["Marketing","Designer","Junior","Employee 45"]},{id:46,name:"Employee 46",email:"employee46@company.com",department:"Sales",role:"Manager",salary:115561,joinDate:"2025-07-05",path:["Sales","Manager","Associate","Employee 46"]},{id:47,name:"Employee 47",email:"employee47@company.com",department:"Marketing",role:"Analyst",salary:77414,joinDate:"2026-02-15",path:["Marketing","Analyst","Associate","Employee 47"]},{id:48,name:"Employee 48",email:"employee48@company.com",department:"Finance",role:"Analyst",salary:50545,joinDate:"2026-12-24",path:["Finance","Analyst","Associate","Employee 48"]},{id:49,name:"Employee 49",email:"employee49@company.com",department:"Marketing",role:"Manager",salary:61267,joinDate:"2028-04-01",path:["Marketing","Manager","Associate","Employee 49"]},{id:50,name:"Employee 50",email:"employee50@company.com",department:"HR",role:"Designer",salary:130775,joinDate:"2025-05-20",path:["HR","Designer","Junior","Employee 50"]},{id:51,name:"Employee 51",email:"employee51@company.com",department:"Finance",role:"Analyst",salary:61291,joinDate:"2026-10-06",path:["Finance","Analyst","Lead","Employee 51"]},{id:52,name:"Employee 52",email:"employee52@company.com",department:"Finance",role:"Developer",salary:121744,joinDate:"2024-07-12",path:["Finance","Developer","Lead","Employee 52"]},{id:53,name:"Employee 53",email:"employee53@company.com",department:"Engineering",role:"Analyst",salary:108492,joinDate:"2025-05-04",path:["Engineering","Analyst","Associate","Employee 53"]},{id:54,name:"Employee 54",email:"employee54@company.com",department:"Engineering",role:"Analyst",salary:72189,joinDate:"2028-10-06",path:["Engineering","Analyst","Lead","Employee 54"]},{id:55,name:"Employee 55",email:"employee55@company.com",department:"Sales",role:"Designer",salary:105328,joinDate:"2027-05-07",path:["Sales","Designer","Senior","Employee 55"]},{id:56,name:"Employee 56",email:"employee56@company.com",department:"HR",role:"Designer",salary:102771,joinDate:"2027-05-20",path:["HR","Designer","Senior","Employee 56"]},{id:57,name:"Employee 57",email:"employee57@company.com",department:"HR",role:"Developer",salary:140085,joinDate:"2028-07-05",path:["HR","Developer","Junior","Employee 57"]},{id:58,name:"Employee 58",email:"employee58@company.com",department:"Finance",role:"Specialist",salary:79502,joinDate:"2024-01-08",path:["Finance","Specialist","Junior","Employee 58"]},{id:59,name:"Employee 59",email:"employee59@company.com",department:"Finance",role:"Analyst",salary:110624,joinDate:"2024-01-31",path:["Finance","Analyst","Associate","Employee 59"]},{id:60,name:"Employee 60",email:"employee60@company.com",department:"Finance",role:"Designer",salary:113318,joinDate:"2024-08-25",path:["Finance","Designer","Associate","Employee 60"]},{id:61,name:"Employee 61",email:"employee61@company.com",department:"Sales",role:"Specialist",salary:134162,joinDate:"2026-11-18",path:["Sales","Specialist","Junior","Employee 61"]},{id:62,name:"Employee 62",email:"employee62@company.com",department:"Marketing",role:"Developer",salary:67134,joinDate:"2027-11-24",path:["Marketing","Developer","Associate","Employee 62"]},{id:63,name:"Employee 63",email:"employee63@company.com",department:"HR",role:"Designer",salary:90005,joinDate:"2025-06-04",path:["HR","Designer","Senior","Employee 63"]},{id:64,name:"Employee 64",email:"employee64@company.com",department:"Finance",role:"Analyst",salary:77806,joinDate:"2027-07-27",path:["Finance","Analyst","Lead","Employee 64"]},{id:65,name:"Employee 65",email:"employee65@company.com",department:"Sales",role:"Analyst",salary:51753,joinDate:"2028-09-21",path:["Sales","Analyst","Lead","Employee 65"]},{id:66,name:"Employee 66",email:"employee66@company.com",department:"Marketing",role:"Specialist",salary:144569,joinDate:"2028-01-19",path:["Marketing","Specialist","Junior","Employee 66"]},{id:67,name:"Employee 67",email:"employee67@company.com",department:"Engineering",role:"Manager",salary:64548,joinDate:"2027-03-14",path:["Engineering","Manager","Associate","Employee 67"]},{id:68,name:"Employee 68",email:"employee68@company.com",department:"Marketing",role:"Specialist",salary:86659,joinDate:"2027-11-27",path:["Marketing","Specialist","Associate","Employee 68"]},{id:69,name:"Employee 69",email:"employee69@company.com",department:"HR",role:"Specialist",salary:85680,joinDate:"2027-06-23",path:["HR","Specialist","Junior","Employee 69"]},{id:70,name:"Employee 70",email:"employee70@company.com",department:"HR",role:"Analyst",salary:139233,joinDate:"2027-07-17",path:["HR","Analyst","Associate","Employee 70"]},{id:71,name:"Employee 71",email:"employee71@company.com",department:"HR",role:"Manager",salary:80112,joinDate:"2026-12-06",path:["HR","Manager","Associate","Employee 71"]},{id:72,name:"Employee 72",email:"employee72@company.com",department:"Sales",role:"Specialist",salary:54732,joinDate:"2024-08-23",path:["Sales","Specialist","Senior","Employee 72"]},{id:73,name:"Employee 73",email:"employee73@company.com",department:"HR",role:"Analyst",salary:125127,joinDate:"2028-01-08",path:["HR","Analyst","Senior","Employee 73"]},{id:74,name:"Employee 74",email:"employee74@company.com",department:"Sales",role:"Analyst",salary:120322,joinDate:"2028-06-19",path:["Sales","Analyst","Lead","Employee 74"]},{id:75,name:"Employee 75",email:"employee75@company.com",department:"Marketing",role:"Manager",salary:95789,joinDate:"2027-10-23",path:["Marketing","Manager","Associate","Employee 75"]},{id:76,name:"Employee 76",email:"employee76@company.com",department:"Finance",role:"Manager",salary:121808,joinDate:"2027-10-27",path:["Finance","Manager","Junior","Employee 76"]},{id:77,name:"Employee 77",email:"employee77@company.com",department:"Sales",role:"Specialist",salary:108933,joinDate:"2025-02-05",path:["Sales","Specialist","Senior","Employee 77"]},{id:78,name:"Employee 78",email:"employee78@company.com",department:"Finance",role:"Manager",salary:50946,joinDate:"2026-11-20",path:["Finance","Manager","Senior","Employee 78"]},{id:79,name:"Employee 79",email:"employee79@company.com",department:"Marketing",role:"Manager",salary:100965,joinDate:"2024-04-21",path:["Marketing","Manager","Lead","Employee 79"]},{id:80,name:"Employee 80",email:"employee80@company.com",department:"Marketing",role:"Analyst",salary:54548,joinDate:"2026-04-05",path:["Marketing","Analyst","Junior","Employee 80"]},{id:81,name:"Employee 81",email:"employee81@company.com",department:"Marketing",role:"Analyst",salary:135883,joinDate:"2027-08-17",path:["Marketing","Analyst","Senior","Employee 81"]},{id:82,name:"Employee 82",email:"employee82@company.com",department:"Sales",role:"Developer",salary:52216,joinDate:"2024-04-23",path:["Sales","Developer","Junior","Employee 82"]},{id:83,name:"Employee 83",email:"employee83@company.com",department:"Engineering",role:"Developer",salary:110290,joinDate:"2025-11-14",path:["Engineering","Developer","Junior","Employee 83"]},{id:84,name:"Employee 84",email:"employee84@company.com",department:"Sales",role:"Developer",salary:140522,joinDate:"2024-09-11",path:["Sales","Developer","Junior","Employee 84"]},{id:85,name:"Employee 85",email:"employee85@company.com",department:"Engineering",role:"Specialist",salary:84485,joinDate:"2026-09-23",path:["Engineering","Specialist","Junior","Employee 85"]},{id:86,name:"Employee 86",email:"employee86@company.com",department:"Finance",role:"Designer",salary:133032,joinDate:"2024-03-27",path:["Finance","Designer","Associate","Employee 86"]},{id:87,name:"Employee 87",email:"employee87@company.com",department:"Engineering",role:"Analyst",salary:148861,joinDate:"2024-11-21",path:["Engineering","Analyst","Senior","Employee 87"]},{id:88,name:"Employee 88",email:"employee88@company.com",department:"Marketing",role:"Analyst",salary:55613,joinDate:"2028-11-20",path:["Marketing","Analyst","Associate","Employee 88"]},{id:89,name:"Employee 89",email:"employee89@company.com",department:"Engineering",role:"Specialist",salary:61081,joinDate:"2024-11-25",path:["Engineering","Specialist","Associate","Employee 89"]},{id:90,name:"Employee 90",email:"employee90@company.com",department:"Marketing",role:"Developer",salary:135328,joinDate:"2024-02-08",path:["Marketing","Developer","Senior","Employee 90"]},{id:91,name:"Employee 91",email:"employee91@company.com",department:"HR",role:"Designer",salary:145196,joinDate:"2025-08-27",path:["HR","Designer","Junior","Employee 91"]},{id:92,name:"Employee 92",email:"employee92@company.com",department:"HR",role:"Analyst",salary:149874,joinDate:"2028-08-04",path:["HR","Analyst","Lead","Employee 92"]},{id:93,name:"Employee 93",email:"employee93@company.com",department:"HR",role:"Designer",salary:51149,joinDate:"2026-12-08",path:["HR","Designer","Junior","Employee 93"]},{id:94,name:"Employee 94",email:"employee94@company.com",department:"Marketing",role:"Analyst",salary:129366,joinDate:"2025-07-26",path:["Marketing","Analyst","Lead","Employee 94"]},{id:95,name:"Employee 95",email:"employee95@company.com",department:"Finance",role:"Analyst",salary:132589,joinDate:"2025-10-08",path:["Finance","Analyst","Lead","Employee 95"]},{id:96,name:"Employee 96",email:"employee96@company.com",department:"Sales",role:"Developer",salary:57917,joinDate:"2025-05-31",path:["Sales","Developer","Senior","Employee 96"]},{id:97,name:"Employee 97",email:"employee97@company.com",department:"Finance",role:"Manager",salary:107883,joinDate:"2026-12-02",path:["Finance","Manager","Associate","Employee 97"]},{id:98,name:"Employee 98",email:"employee98@company.com",department:"Engineering",role:"Specialist",salary:99037,joinDate:"2028-03-08",path:["Engineering","Specialist","Lead","Employee 98"]},{id:99,name:"Employee 99",email:"employee99@company.com",department:"HR",role:"Developer",salary:69238,joinDate:"2024-01-18",path:["HR","Developer","Junior","Employee 99"]},{id:100,name:"Employee 100",email:"employee100@company.com",department:"Sales",role:"Analyst",salary:75590,joinDate:"2025-05-22",path:["Sales","Analyst","Junior","Employee 100"]}],l=[{field:"id",headerName:"ID",width:270,align:"center",headerAlign:"center",hideable:!1},{field:"name",headerName:"Name",width:180,sortable:!0,editable:!0},{field:"email",headerName:"Email",width:250,sortable:!0,editable:!0},{field:"department",headerName:"Department",width:150,sortable:!0},{field:"role",headerName:"Role",width:150,sortable:!0},{field:"salary",headerName:"Salary",width:130,type:"number",align:"right",headerAlign:"right",sortable:!0,editable:!0,valueFormatter:i=>`$${Number(i.value).toLocaleString()}`},{field:"joinDate",headerName:"Join Date",width:130,sortable:!0}];function ie(){const[i,v]=o.useState(oe),[_,x]=o.useState([]),[f,C]=o.useState([]),[h,P]=o.useState({page:0,pageSize:25}),[r,H]=o.useState(""),[b,N]=o.useState(!1),[y,S]=o.useState(()=>new Set(l.map(a=>a.field))),[L,c]=o.useState({left:["id","name"],right:[]}),[J,g]=o.useState({top:[1,2],bottom:[]}),[G,w]=o.useState(new Set),[V,R]=o.useState(()=>l.map(a=>a.field)),[E,I]=o.useState(!0),[u,T]=o.useState(!0),[p,O]=o.useState(!1),[s,k]=o.useState(!1),[D,j]=o.useState([]),[$,M]=o.useState({}),[t,U]=o.useState(!0),q=o.useMemo(()=>l.filter(a=>y.has(a.field)),[y]),Q=o.useMemo(()=>r?{items:[],quickFilterValues:[r]}:{items:[]},[r]),F=o.useMemo(()=>r?i.filter(a=>{const m=r.toLowerCase();return Object.values(a).some(n=>n==null?!1:String(n).toLowerCase().includes(m))}).length:i.length,[i,r]),z=(a,m)=>{S(n=>{const d=new Set(n);return m?d.add(a):d.delete(a),d})},B=()=>{S(new Set(l.map(a=>a.field)))},X=()=>{S(new Set(l.filter(a=>a.hideable===!1).map(a=>a.field)))};return e.jsxs(ee,{title:"Full Feature Test",description:"A comprehensive feature test page exercising every major OpenGridX capability in a single grid — virtualization, pinning, grouping, editing, export, and more.",sourceCode:ae,children:[e.jsxs("div",{className:"datagrid-test__info",children:[e.jsxs("div",{className:"datagrid-test__stat",children:[e.jsx("strong",{children:"Total Rows:"})," ",i.length]}),e.jsxs("div",{className:"datagrid-test__stat",children:[e.jsx("strong",{children:"Filtered:"})," ",F]}),e.jsxs("div",{className:"datagrid-test__stat",children:[e.jsx("strong",{children:"Selected:"})," ",_.length]}),e.jsxs("div",{className:"datagrid-test__stat",children:[e.jsx("strong",{children:"Visible Columns:"})," ",y.size,"/",l.length]}),e.jsxs("div",{className:"datagrid-test__stat",children:[e.jsx("strong",{children:"Page:"})," ",h.page+1," of ",Math.ceil(F/h.pageSize)]})]}),e.jsxs("div",{className:"datagrid-test__toolbar",children:[e.jsxs("div",{className:"datagrid-test__toolbar-left",children:[e.jsxs("button",{className:"datagrid-test__toolbar-button",onClick:()=>N(!b),children:[b?"Hide":"Show"," Columns"]}),e.jsx("button",{className:"datagrid-test__toolbar-button datagrid-test__toolbar-button--secondary",onClick:()=>c({left:["id","name"],right:[]}),children:"📌 Pin ID & Name"}),e.jsx("button",{className:"datagrid-test__toolbar-button datagrid-test__toolbar-button--secondary",onClick:()=>c({left:[],right:["salary","joinDate"]}),children:"📌 Pin Salary & Date"}),e.jsx("button",{className:"datagrid-test__toolbar-button datagrid-test__toolbar-button--secondary",onClick:()=>c({left:[],right:[]}),children:"❌ Unpin All Columns"}),e.jsx("div",{className:"datagrid-test__toolbar-divider"}),e.jsx("button",{className:"datagrid-test__toolbar-button datagrid-test__toolbar-button--secondary",onClick:()=>R(l.map(a=>a.field)),children:"🔄 Reset Column Order"}),e.jsx("button",{className:`datagrid-test__toolbar-button ${E?"datagrid-test__toolbar-button--primary":"datagrid-test__toolbar-button--secondary"}`,onClick:()=>I(!E),children:E?"🔓 Unpin Checkbox":"🔒 Pin Checkbox"}),e.jsx("button",{className:`datagrid-test__toolbar-button ${u?"datagrid-test__toolbar-button--primary":"datagrid-test__toolbar-button--secondary"}`,onClick:()=>T(!u),children:u?"🔓 Unpin Expand":"🔒 Pin Expand"}),e.jsx("button",{className:"datagrid-test__toolbar-button datagrid-test__toolbar-button--secondary",onClick:()=>g({top:[1,2],bottom:[]}),children:"📌 Pin First 2 Rows (Top)"}),e.jsx("button",{className:"datagrid-test__toolbar-button datagrid-test__toolbar-button--secondary",onClick:()=>g({top:[],bottom:[99,100]}),children:"📌 Pin Last 2 Rows (Bottom)"}),e.jsx("button",{className:"datagrid-test__toolbar-button datagrid-test__toolbar-button--secondary",onClick:()=>g({top:[],bottom:[]}),children:"❌ Unpin All Rows"}),e.jsx("div",{className:"datagrid-test__toolbar-divider"}),e.jsx("button",{className:`datagrid-test__toolbar-button ${D.length>0?"datagrid-test__toolbar-button--primary":"datagrid-test__toolbar-button--secondary"}`,onClick:()=>{D.length>0?(j([]),M({})):(j(["department","role"]),M({salary:"sum",id:"count"})),s&&k(!1)},children:D.length>0?"🚫 Disable Grouping":"📑 Group by Dept > Role"}),e.jsx("button",{className:`datagrid-test__toolbar-button ${s?"datagrid-test__toolbar-button--primary":"datagrid-test__toolbar-button--secondary"}`,onClick:()=>{k(!s),s||j([])},children:s?"🌳 Disable Tree Data":"🌳 Enable Tree Data"}),e.jsx("div",{className:"datagrid-test__toolbar-divider"}),e.jsx("button",{className:`datagrid-test__toolbar-button ${p?"datagrid-test__toolbar-button--primary":"datagrid-test__toolbar-button--secondary"}`,onClick:()=>{p||(C([]),g({top:[],bottom:[]})),O(!p)},children:p?"🛑 Disable Row Reorder":"↕️ Enable Row Reorder"}),e.jsx("div",{className:"datagrid-test__toolbar-divider"}),e.jsx("button",{className:`datagrid-test__toolbar-button ${t?"datagrid-test__toolbar-button--primary":"datagrid-test__toolbar-button--secondary"}`,onClick:()=>{U(!t),t&&w(new Set)},children:t?"📋 Disable Detail Panel":"📋 Enable Detail Panel"})]}),e.jsx(W,{value:r,onChange:H,placeholder:"Search across all columns..."})]}),b&&e.jsx("div",{className:"datagrid-test__column-panel",children:e.jsx(Y,{columns:l,visibleColumns:y,onVisibilityChange:z,onShowAll:B,onHideAll:X})}),e.jsx("div",{className:"datagrid-test__grid",children:e.jsx(Z,{rows:i,columns:q,height:600,checkboxSelection:!0,rowSelectionModel:_,onRowSelectionModelChange:x,sortModel:f,onSortModelChange:C,filterModel:Q,pagination:!0,paginationModel:h,onPaginationModelChange:P,pageSizeOptions:[10,25,50,100],pinnedColumns:L,onPinnedColumnsChange:c,pinnedRows:J,onRowClick:a=>console.log("Row clicked:",a.row),onCellClick:a=>console.log("Cell clicked:",a.row,a.field),processRowUpdate:a=>(console.log("Row Updated:",a),v(m=>m.map(n=>n.id===a.id?a:n)),a),onProcessRowUpdateError:a=>console.error("Row Update Error:",a),getDetailPanelContent:t?a=>e.jsxs("div",{style:{padding:"16px",background:"#f5f5f5"},children:[e.jsxs("h4",{style:{margin:"0 0 12px 0"},children:["Employee Details: ",a.row.name]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"},children:[e.jsxs("div",{children:[e.jsx("strong",{children:"ID:"})," ",a.row.id]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Email:"})," ",a.row.email]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Department:"})," ",a.row.department]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Role:"})," ",a.row.role]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Salary:"})," $",a.row.salary.toLocaleString()]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Join Date:"})," ",a.row.joinDate]})]})]}):void 0,getDetailPanelHeight:t?()=>150:void 0,detailPanelExpandedRowIds:t?G:void 0,onDetailPanelExpandedRowIdsChange:t?w:void 0,pinCheckboxColumn:E,pinExpandColumn:u,columnOrder:V,onColumnOrderModelChange:R,onColumnOrderChange:a=>{console.log("Column reordered:",a)},rowGroupingModel:D,aggregationModel:$,onAggregationModelChange:M,rowReordering:p,onRowOrderChange:a=>{const{oldIndex:m,targetIndex:n}=a;console.log("Row reordered:",a),v(d=>{const A=[...d],[K]=A.splice(m,1);return A.splice(n,0,K),A})}})})]})}export{ie as DataGridTest,ie as default};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0YUdyaWRUZXN0LUJXbURvQzFJLmpzIiwic291cmNlcyI6WyIuLi8uLi9leGFtcGxlcy9EYXRhR3JpZFRlc3QvRGF0YUdyaWRUZXN0LnRzeD9yYXciLCIuLi8uLi9leGFtcGxlcy9EYXRhR3JpZFRlc3QvRGF0YUdyaWRUZXN0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBcIlxcblxcbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xcbmltcG9ydCB7IERhdGFHcmlkIH0gZnJvbSAnQG9wZW5jb3Jlc3RhY2svb3BlbmdyaWR4JztcXG5pbXBvcnQgeyBRdWlja0ZpbHRlciB9IGZyb20gJy4uLy4uLy4uL2xpYi9jb21wb25lbnRzL1F1aWNrRmlsdGVyL1F1aWNrRmlsdGVyJztcXG5pbXBvcnQgeyBDb2x1bW5WaXNpYmlsaXR5UGFuZWwgfSBmcm9tICcuLi8uLi8uLi9saWIvY29tcG9uZW50cy9Db2x1bW5WaXNpYmlsaXR5UGFuZWwvQ29sdW1uVmlzaWJpbGl0eVBhbmVsJztcXG5pbXBvcnQgdHlwZSB7IEdyaWRDb2xEZWYsIEdyaWRSb3dNb2RlbCwgR3JpZEZpbHRlck1vZGVsLCBHcmlkQ29sdW1uUGlubmluZywgR3JpZFJvd1Bpbm5pbmcsIEdyaWRSb3dJZCwgR3JpZFJvd0dyb3VwaW5nTW9kZWwsIEdyaWRBZ2dyZWdhdGlvbk1vZGVsIH0gZnJvbSAnQG9wZW5jb3Jlc3RhY2svb3BlbmdyaWR4JztcXG5pbXBvcnQgJy4uLy4uLy4uL2xpYi9jb21wb25lbnRzL1F1aWNrRmlsdGVyL1F1aWNrRmlsdGVyLmNzcyc7XFxuaW1wb3J0ICcuLi8uLi8uLi9saWIvY29tcG9uZW50cy9Db2x1bW5WaXNpYmlsaXR5UGFuZWwvQ29sdW1uVmlzaWJpbGl0eVBhbmVsLmNzcyc7XFxuaW1wb3J0ICcuL0RhdGFHcmlkVGVzdC5jc3MnO1xcbmltcG9ydCB7IERvY3NMYXlvdXQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL0RvY3NMYXlvdXQnO1xcbmltcG9ydCBzb3VyY2VDb2RlIGZyb20gJy4vRGF0YUdyaWRUZXN0LnRzeD9yYXcnO1xcblxcbmludGVyZmFjZSBFbXBsb3llZSBleHRlbmRzIEdyaWRSb3dNb2RlbCB7XFxuICAgIGlkOiBudW1iZXI7XFxuICAgIG5hbWU6IHN0cmluZztcXG4gICAgZW1haWw6IHN0cmluZztcXG4gICAgZGVwYXJ0bWVudDogc3RyaW5nO1xcbiAgICByb2xlOiBzdHJpbmc7XFxuICAgIHNhbGFyeTogbnVtYmVyO1xcbiAgICBqb2luRGF0ZTogc3RyaW5nO1xcbiAgICBwYXRoOiBzdHJpbmdbXTtcXG59XFxuXFxuY29uc3QgZGF0YSA9IFtcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogMSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDFcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMUBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRlc2lnbmVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxNDg0MTcsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyOC0wNi0wOFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkRlc2lnbmVyXFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDFcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDIsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSAyXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTJAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRW5naW5lZXJpbmdcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTIxOTAzLFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjUtMDYtMDJcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICAgICAgXFxcIkxlYWRcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSAyXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiAzLFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgM1xcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUzQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRlc2lnbmVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiA4ODIxNCxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI4LTAzLTExXFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJFbmdpbmVlcmluZ1xcXCIsXFxuICAgICAgICAgICAgXFxcIkRlc2lnbmVyXFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgM1xcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNCxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDRcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNEBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNzQ2OTEsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNi0wOC0xOFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICAgICAgXFxcIkp1bmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDRcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDUsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA1XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTVAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiTWFuYWdlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogODYyNDMsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNS0wNy0wOFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNVxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNixcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDZcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNkBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDY4Mjk5LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjQtMDgtMzFcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNlxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNyxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDdcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlN0Bjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJFbmdpbmVlcmluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDEwNTg0MSxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI0LTEwLTA0XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJFbmdpbmVlcmluZ1xcXCIsXFxuICAgICAgICAgICAgXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDdcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDgsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA4XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZThAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiRGV2ZWxvcGVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMjA5MDgsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0xMi0wMlxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTZW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA4XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA5LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgOVxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU5QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIlNhbGVzXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRlc2lnbmVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMzkyNTksXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNC0wNS0yNVxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICAgICAgXFxcIkp1bmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDlcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDEwLFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMTBcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMTBAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMzYyMzYsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNC0wMi0yM1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTZW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSAxMFxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogMTEsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSAxMVxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUxMUBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTQxMzY2LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjYtMTAtMDNcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJMZWFkXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMTFcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDEyLFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMTJcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMTJAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiSFJcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiTWFuYWdlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTQ1NzI2LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjUtMTEtMjJcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkhSXFxcIixcXG4gICAgICAgICAgICBcXFwiTWFuYWdlclxcXCIsXFxuICAgICAgICAgICAgXFxcIlNlbmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDEyXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiAxMyxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDEzXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTEzQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiRGV2ZWxvcGVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiA1NjYxNCxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI0LTA4LTE0XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgICAgICBcXFwiRGV2ZWxvcGVyXFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMTNcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDE0LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMTRcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMTRAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiSFJcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDE0OTY5MixcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI2LTA5LTE5XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJIUlxcXCIsXFxuICAgICAgICAgICAgXFxcIkRlc2lnbmVyXFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDE0XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiAxNSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDE1XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTE1QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIlNhbGVzXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNzU0MDUsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNS0wNi0wMlxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJKdW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSAxNVxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogMTYsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSAxNlxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUxNkBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJFbmdpbmVlcmluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTQyMTY3LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjgtMDItMDhcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJKdW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSAxNlxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogMTcsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSAxN1xcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUxN0Bjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJIUlxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxNDc2OTEsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNC0wMi0yMFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiSFJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgICAgICBcXFwiSnVuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMTdcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDE4LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMThcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMThAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDEwODA0MixcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI4LTA1LTE0XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJNYXJrZXRpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMThcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDE5LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMTlcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMTlAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMTY1NDgsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0wNS0yMlxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICAgICAgXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTZW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSAxOVxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogMjAsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSAyMFxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUyMEBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJFbmdpbmVlcmluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTQzNzkxLFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjgtMDgtMDZcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBc3NvY2lhdGVcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSAyMFxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogMjEsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSAyMVxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUyMUBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJIUlxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxNDgyMTcsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0wNC0zMFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiSFJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMjFcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDIyLFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMjJcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMjJAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTAxNjM5LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjUtMTAtMDhcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICAgICAgXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDIyXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiAyMyxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDIzXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTIzQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiRGV2ZWxvcGVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxNDYxMTEsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0wMy0xM1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDIzXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiAyNCxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDI0XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTI0QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDc0NzA0LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjUtMDQtMDNcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICAgICAgXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICAgICAgXFxcIlNlbmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDI0XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiAyNSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDI1XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTI1QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIlNhbGVzXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDc3MTg5LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjgtMDMtMDRcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIlNhbGVzXFxcIixcXG4gICAgICAgICAgICBcXFwiTWFuYWdlclxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDI1XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiAyNixcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDI2XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTI2QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDExMzE0OSxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI2LTEwLTA4XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJFbmdpbmVlcmluZ1xcXCIsXFxuICAgICAgICAgICAgXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJMZWFkXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMjZcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDI3LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMjdcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMjdAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogOTEyNjYsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNi0wMi0xMFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkRlc2lnbmVyXFxcIixcXG4gICAgICAgICAgICBcXFwiSnVuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMjdcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDI4LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMjhcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMjhAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiSFJcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiTWFuYWdlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogOTQ0NzgsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0wMy0xNlxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiSFJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMjhcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDI5LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMjlcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMjlAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiSFJcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDkyMDg0LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjUtMTItMjdcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkhSXFxcIixcXG4gICAgICAgICAgICBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTZW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSAyOVxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogMzAsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSAzMFxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUzMEBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJTYWxlc1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNTA0NDksXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNi0wMi0xMFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICAgICAgXFxcIkxlYWRcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSAzMFxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogMzEsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSAzMVxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUzMUBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIlNwZWNpYWxpc3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDkwMDY1LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjUtMDktMjRcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDMxXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiAzMixcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDMyXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTMyQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiA5MTA0NixcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI0LTEyLTExXFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJNYXJrZXRpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDMyXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiAzMyxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDMzXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTMzQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDEwODE4MixcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI0LTA0LTAyXFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgICAgICBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJKdW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSAzM1xcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogMzQsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSAzNFxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUzNEBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDgxNTgwLFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjctMDgtMDZcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiU2VuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMzRcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDM1LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMzVcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMzVAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiU3BlY2lhbGlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTIzNjU5LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjUtMDktMTRcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIlNhbGVzXFxcIixcXG4gICAgICAgICAgICBcXFwiU3BlY2lhbGlzdFxcXCIsXFxuICAgICAgICAgICAgXFxcIkxlYWRcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSAzNVxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogMzYsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSAzNlxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUzNkBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJIUlxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxNDk0MTAsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyOC0wMy0wNlxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiSFJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMzZcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDM3LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMzdcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMzdAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRW5naW5lZXJpbmdcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNTg5ODQsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNC0wMy0wM1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRW5naW5lZXJpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMzdcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDM4LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMzhcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMzhAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRW5naW5lZXJpbmdcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDY3NzMyLFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjctMDUtMTJcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBc3NvY2lhdGVcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSAzOFxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogMzksXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSAzOVxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUzOUBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDYzNzA1LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjgtMDEtMjdcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMzlcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDQwLFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNDBcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNDBAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDk4MDQ4LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjYtMTEtMjdcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICAgICAgXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJKdW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA0MFxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNDEsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA0MVxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU0MUBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIlNwZWNpYWxpc3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDk2MzA2LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjUtMDctMThcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiSnVuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNDFcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDQyLFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNDJcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNDJAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRW5naW5lZXJpbmdcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiRGV2ZWxvcGVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxNDIzNzAsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0wOC0wNFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRW5naW5lZXJpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBc3NvY2lhdGVcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA0MlxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNDMsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA0M1xcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU0M0Bjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJTYWxlc1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMzQ0NDcsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNS0wNC0xOFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgICAgICBcXFwiU2VuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNDNcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDQ0LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNDRcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNDRAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogODk4MDAsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNi0wNC0yN1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiRGV2ZWxvcGVyXFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDQ0XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA0NSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDQ1XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTQ1QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogOTYwODYsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNC0wNS0xM1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJKdW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA0NVxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNDYsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA0NlxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU0NkBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJTYWxlc1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMTU1NjEsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNS0wNy0wNVxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNDZcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDQ3LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNDdcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNDdAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDc3NDE0LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjYtMDItMTVcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICAgICAgXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBc3NvY2lhdGVcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA0N1xcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNDgsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA0OFxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU0OEBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDUwNTQ1LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjYtMTItMjRcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNDhcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDQ5LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNDlcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNDlAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDYxMjY3LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjgtMDQtMDFcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICAgICAgXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBc3NvY2lhdGVcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA0OVxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNTAsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA1MFxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU1MEBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJIUlxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTMwNzc1LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjUtMDUtMjBcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkhSXFxcIixcXG4gICAgICAgICAgICBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJKdW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA1MFxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNTEsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA1MVxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU1MUBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDYxMjkxLFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjYtMTAtMDZcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDUxXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA1MixcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDUyXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTUyQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiRGV2ZWxvcGVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMjE3NDQsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNC0wNy0xMlxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICAgICAgXFxcIkxlYWRcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA1MlxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNTMsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA1M1xcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU1M0Bjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJFbmdpbmVlcmluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMDg0OTIsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNS0wNS0wNFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRW5naW5lZXJpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNTNcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDU0LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNTRcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNTRAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRW5naW5lZXJpbmdcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNzIxODksXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyOC0xMC0wNlxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRW5naW5lZXJpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDU0XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA1NSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDU1XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTU1QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIlNhbGVzXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRlc2lnbmVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMDUzMjgsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0wNS0wN1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICAgICAgXFxcIlNlbmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDU1XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA1NixcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDU2XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTU2QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkhSXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRlc2lnbmVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMDI3NzEsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0wNS0yMFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiSFJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICAgICAgXFxcIlNlbmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDU2XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA1NyxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDU3XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTU3QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkhSXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTQwMDg1LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjgtMDctMDVcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkhSXFxcIixcXG4gICAgICAgICAgICBcXFwiRGV2ZWxvcGVyXFxcIixcXG4gICAgICAgICAgICBcXFwiSnVuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNTdcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDU4LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNThcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNThAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiA3OTUwMixcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI0LTAxLTA4XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgICAgICBcXFwiU3BlY2lhbGlzdFxcXCIsXFxuICAgICAgICAgICAgXFxcIkp1bmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDU4XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA1OSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDU5XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTU5QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTEwNjI0LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjQtMDEtMzFcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNTlcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDYwLFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNjBcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNjBAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTEzMzE4LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjQtMDgtMjVcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDYwXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA2MSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDYxXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTYxQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIlNhbGVzXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIlNwZWNpYWxpc3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDEzNDE2MixcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI2LTExLTE4XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJTYWxlc1xcXCIsXFxuICAgICAgICAgICAgXFxcIlNwZWNpYWxpc3RcXFwiLFxcbiAgICAgICAgICAgIFxcXCJKdW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA2MVxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNjIsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA2MlxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU2MkBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJNYXJrZXRpbmdcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiRGV2ZWxvcGVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiA2NzEzNCxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI3LTExLTI0XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJNYXJrZXRpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBc3NvY2lhdGVcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA2MlxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNjMsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA2M1xcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU2M0Bjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJIUlxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogOTAwMDUsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNS0wNi0wNFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiSFJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICAgICAgXFxcIlNlbmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDYzXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA2NCxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDY0XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTY0QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNzc4MDYsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0wNy0yN1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgICAgIFxcXCJMZWFkXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNjRcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDY1LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNjVcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNjVAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNTE3NTMsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyOC0wOS0yMVxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDY1XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA2NixcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDY2XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTY2QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxNDQ1NjksXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyOC0wMS0xOVxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiU3BlY2lhbGlzdFxcXCIsXFxuICAgICAgICAgICAgXFxcIkp1bmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDY2XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA2NyxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDY3XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTY3QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDY0NTQ4LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjctMDMtMTRcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiTWFuYWdlclxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDY3XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA2OCxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDY4XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTY4QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiA4NjY1OSxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI3LTExLTI3XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJNYXJrZXRpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNjhcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDY5LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNjlcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNjlAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiSFJcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiU3BlY2lhbGlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogODU2ODAsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0wNi0yM1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiSFJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiSnVuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNjlcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDcwLFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNzBcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNzBAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiSFJcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTM5MjMzLFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjctMDctMTdcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkhSXFxcIixcXG4gICAgICAgICAgICBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDcwXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA3MSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDcxXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTcxQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkhSXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDgwMTEyLFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjYtMTItMDZcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkhSXFxcIixcXG4gICAgICAgICAgICBcXFwiTWFuYWdlclxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDcxXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA3MixcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDcyXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTcyQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIlNhbGVzXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIlNwZWNpYWxpc3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDU0NzMyLFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjQtMDgtMjNcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIlNhbGVzXFxcIixcXG4gICAgICAgICAgICBcXFwiU3BlY2lhbGlzdFxcXCIsXFxuICAgICAgICAgICAgXFxcIlNlbmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDcyXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA3MyxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDczXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTczQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkhSXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDEyNTEyNyxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI4LTAxLTA4XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJIUlxcXCIsXFxuICAgICAgICAgICAgXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTZW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA3M1xcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNzQsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA3NFxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU3NEBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJTYWxlc1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMjAzMjIsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyOC0wNi0xOVxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDc0XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA3NSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDc1XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTc1QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiA5NTc4OSxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI3LTEwLTIzXFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJNYXJrZXRpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNzVcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDc2LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNzZcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNzZAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMjE4MDgsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0xMC0yN1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICAgICAgXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJKdW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA3NlxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNzcsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA3N1xcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU3N0Bjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJTYWxlc1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMDg5MzMsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNS0wMi0wNVxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiU2VuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNzdcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDc4LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNzhcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNzhAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiA1MDk0NixcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI2LTExLTIwXFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgICAgICBcXFwiTWFuYWdlclxcXCIsXFxuICAgICAgICAgICAgXFxcIlNlbmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDc4XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA3OSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDc5XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTc5QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMDA5NjUsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNC0wNC0yMVxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiTWFuYWdlclxcXCIsXFxuICAgICAgICAgICAgXFxcIkxlYWRcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA3OVxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogODAsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA4MFxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU4MEBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJNYXJrZXRpbmdcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNTQ1NDgsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNi0wNC0wNVxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICAgICAgXFxcIkp1bmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDgwXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA4MSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDgxXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTgxQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMzU4ODMsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0wOC0xN1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICAgICAgXFxcIlNlbmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDgxXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA4MixcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDgyXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTgyQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIlNhbGVzXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNTIyMTYsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNC0wNC0yM1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJKdW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA4MlxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogODMsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA4M1xcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU4M0Bjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJFbmdpbmVlcmluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDExMDI5MCxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI1LTExLTE0XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJFbmdpbmVlcmluZ1xcXCIsXFxuICAgICAgICAgICAgXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICAgICAgXFxcIkp1bmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDgzXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA4NCxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDg0XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTg0QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIlNhbGVzXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTQwNTIyLFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjQtMDktMTFcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIlNhbGVzXFxcIixcXG4gICAgICAgICAgICBcXFwiRGV2ZWxvcGVyXFxcIixcXG4gICAgICAgICAgICBcXFwiSnVuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgODRcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDg1LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgODVcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlODVAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRW5naW5lZXJpbmdcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiU3BlY2lhbGlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogODQ0ODUsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNi0wOS0yM1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRW5naW5lZXJpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiSnVuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgODVcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDg2LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgODZcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlODZAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTMzMDMyLFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjQtMDMtMjdcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDg2XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA4NyxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDg3XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTg3QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDE0ODg2MSxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI0LTExLTIxXFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJFbmdpbmVlcmluZ1xcXCIsXFxuICAgICAgICAgICAgXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTZW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA4N1xcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogODgsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA4OFxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU4OEBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJNYXJrZXRpbmdcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNTU2MTMsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyOC0xMS0yMFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDg4XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA4OSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDg5XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTg5QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIlNwZWNpYWxpc3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDYxMDgxLFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjQtMTEtMjVcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiU3BlY2lhbGlzdFxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDg5XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA5MCxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDkwXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTkwQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDEzNTMyOCxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI0LTAyLTA4XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJNYXJrZXRpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTZW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA5MFxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogOTEsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA5MVxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU5MUBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJIUlxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTQ1MTk2LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjUtMDgtMjdcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkhSXFxcIixcXG4gICAgICAgICAgICBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJKdW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA5MVxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogOTIsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA5MlxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU5MkBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJIUlxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxNDk4NzQsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyOC0wOC0wNFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiSFJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDkyXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA5MyxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDkzXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTkzQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkhSXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRlc2lnbmVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiA1MTE0OSxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI2LTEyLTA4XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJIUlxcXCIsXFxuICAgICAgICAgICAgXFxcIkRlc2lnbmVyXFxcIixcXG4gICAgICAgICAgICBcXFwiSnVuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgOTNcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDk0LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgOTRcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlOTRAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDEyOTM2NixcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI1LTA3LTI2XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJNYXJrZXRpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDk0XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA5NSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDk1XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTk1QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTMyNTg5LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjUtMTAtMDhcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDk1XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA5NixcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDk2XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTk2QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIlNhbGVzXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNTc5MTcsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNS0wNS0zMVxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTZW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA5NlxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogOTcsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA5N1xcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU5N0Bjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDEwNzg4MyxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI2LTEyLTAyXFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgICAgICBcXFwiTWFuYWdlclxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDk3XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA5OCxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDk4XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTk4QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIlNwZWNpYWxpc3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDk5MDM3LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjgtMDMtMDhcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiU3BlY2lhbGlzdFxcXCIsXFxuICAgICAgICAgICAgXFxcIkxlYWRcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA5OFxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogOTksXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA5OVxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU5OUBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJIUlxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDY5MjM4LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjQtMDEtMThcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkhSXFxcIixcXG4gICAgICAgICAgICBcXFwiRGV2ZWxvcGVyXFxcIixcXG4gICAgICAgICAgICBcXFwiSnVuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgOTlcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDEwMCxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDEwMFxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUxMDBAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNzU1OTAsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNS0wNS0yMlxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiSnVuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMTAwXFxcIlxcbiAgICAgICAgXVxcbiAgICB9XFxuXVxcblxcbmNvbnN0IGFsbENvbHVtbnM6IEdyaWRDb2xEZWY8RW1wbG95ZWU+W10gPSBbXFxuICAgIHtcXG4gICAgICAgIGZpZWxkOiAnaWQnLFxcbiAgICAgICAgaGVhZGVyTmFtZTogJ0lEJyxcXG4gICAgICAgIHdpZHRoOiAyNzAsXFxuICAgICAgICBhbGlnbjogJ2NlbnRlcicsXFxuICAgICAgICBoZWFkZXJBbGlnbjogJ2NlbnRlcicsXFxuICAgICAgICBoaWRlYWJsZTogZmFsc2VcXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgZmllbGQ6ICduYW1lJyxcXG4gICAgICAgIGhlYWRlck5hbWU6ICdOYW1lJyxcXG4gICAgICAgIHdpZHRoOiAxODAsXFxuICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcXG4gICAgICAgIGVkaXRhYmxlOiB0cnVlXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIGZpZWxkOiAnZW1haWwnLFxcbiAgICAgICAgaGVhZGVyTmFtZTogJ0VtYWlsJyxcXG4gICAgICAgIHdpZHRoOiAyNTAsXFxuICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcXG4gICAgICAgIGVkaXRhYmxlOiB0cnVlXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIGZpZWxkOiAnZGVwYXJ0bWVudCcsXFxuICAgICAgICBoZWFkZXJOYW1lOiAnRGVwYXJ0bWVudCcsXFxuICAgICAgICB3aWR0aDogMTUwLFxcbiAgICAgICAgc29ydGFibGU6IHRydWVcXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgZmllbGQ6ICdyb2xlJyxcXG4gICAgICAgIGhlYWRlck5hbWU6ICdSb2xlJyxcXG4gICAgICAgIHdpZHRoOiAxNTAsXFxuICAgICAgICBzb3J0YWJsZTogdHJ1ZVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBmaWVsZDogJ3NhbGFyeScsXFxuICAgICAgICBoZWFkZXJOYW1lOiAnU2FsYXJ5JyxcXG4gICAgICAgIHdpZHRoOiAxMzAsXFxuICAgICAgICB0eXBlOiAnbnVtYmVyJyxcXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxcbiAgICAgICAgaGVhZGVyQWxpZ246ICdyaWdodCcsXFxuICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcXG4gICAgICAgIGVkaXRhYmxlOiB0cnVlLFxcbiAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IGAkJHtOdW1iZXIocGFyYW1zLnZhbHVlKS50b0xvY2FsZVN0cmluZygpfWBcXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgZmllbGQ6ICdqb2luRGF0ZScsXFxuICAgICAgICBoZWFkZXJOYW1lOiAnSm9pbiBEYXRlJyxcXG4gICAgICAgIHdpZHRoOiAxMzAsXFxuICAgICAgICBzb3J0YWJsZTogdHJ1ZVxcbiAgICB9XFxuXTtcXG5cXG5leHBvcnQgZnVuY3Rpb24gRGF0YUdyaWRUZXN0KCkge1xcbiAgICBjb25zdCBbcm93cywgc2V0Um93c10gPSB1c2VTdGF0ZTxFbXBsb3llZVtdPihkYXRhKTtcXG4gICAgY29uc3QgW3NlbGVjdGlvbk1vZGVsLCBzZXRTZWxlY3Rpb25Nb2RlbF0gPSB1c2VTdGF0ZTxBcnJheTxzdHJpbmcgfCBudW1iZXI+PihbXSk7XFxuICAgIGNvbnN0IFtzb3J0TW9kZWwsIHNldFNvcnRNb2RlbF0gPSB1c2VTdGF0ZTxBcnJheTx7IGZpZWxkOiBzdHJpbmc7IHNvcnQ6ICdhc2MnIHwgJ2Rlc2MnIH0+PihbXSk7XFxuICAgIGNvbnN0IFtwYWdpbmF0aW9uTW9kZWwsIHNldFBhZ2luYXRpb25Nb2RlbF0gPSB1c2VTdGF0ZSh7IHBhZ2U6IDAsIHBhZ2VTaXplOiAyNSB9KTtcXG4gICAgY29uc3QgW3F1aWNrRmlsdGVyVmFsdWUsIHNldFF1aWNrRmlsdGVyVmFsdWVdID0gdXNlU3RhdGUoJycpO1xcbiAgICBjb25zdCBbc2hvd0NvbHVtblBhbmVsLCBzZXRTaG93Q29sdW1uUGFuZWxdID0gdXNlU3RhdGUoZmFsc2UpO1xcbiAgICBjb25zdCBbdmlzaWJsZUNvbHVtbnMsIHNldFZpc2libGVDb2x1bW5zXSA9IHVzZVN0YXRlPFNldDxzdHJpbmc+PihcXG4gICAgICAgICgpID0+IG5ldyBTZXQoYWxsQ29sdW1ucy5tYXAoY29sID0+IGNvbC5maWVsZCkpXFxuICAgICk7XFxuICAgIGNvbnN0IFtwaW5uZWRDb2x1bW5zLCBzZXRQaW5uZWRDb2x1bW5zXSA9IHVzZVN0YXRlPEdyaWRDb2x1bW5QaW5uaW5nPih7XFxuICAgICAgICBsZWZ0OiBbJ2lkJywgJ25hbWUnXSxcXG4gICAgICAgIHJpZ2h0OiBbXVxcbiAgICB9KTtcXG4gICAgY29uc3QgW3Bpbm5lZFJvd3MsIHNldFBpbm5lZFJvd3NdID0gdXNlU3RhdGU8R3JpZFJvd1Bpbm5pbmc+KHtcXG4gICAgICAgIHRvcDogWzEsIDJdLFxcbiAgICAgICAgYm90dG9tOiBbXVxcbiAgICB9KTtcXG4gICAgY29uc3QgW2V4cGFuZGVkRGV0YWlsUGFuZWxSb3dJZHMsIHNldEV4cGFuZGVkRGV0YWlsUGFuZWxSb3dJZHNdID0gdXNlU3RhdGU8U2V0PEdyaWRSb3dJZD4+KG5ldyBTZXQoKSk7XFxuICAgIGNvbnN0IFtjb2x1bW5PcmRlciwgc2V0Q29sdW1uT3JkZXJdID0gdXNlU3RhdGU8c3RyaW5nW10+KCgpID0+IGFsbENvbHVtbnMubWFwKGNvbCA9PiBjb2wuZmllbGQpKTtcXG4gICAgY29uc3QgW3BpbkNoZWNrYm94Q29sdW1uLCBzZXRQaW5DaGVja2JveENvbHVtbl0gPSB1c2VTdGF0ZSh0cnVlKTtcXG4gICAgY29uc3QgW3BpbkV4cGFuZENvbHVtbiwgc2V0UGluRXhwYW5kQ29sdW1uXSA9IHVzZVN0YXRlKHRydWUpO1xcbiAgICBjb25zdCBbcm93UmVvcmRlcmluZywgc2V0Um93UmVvcmRlcmluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XFxuICAgIGNvbnN0IFt0cmVlRGF0YSwgc2V0VHJlZURhdGFdID0gdXNlU3RhdGUoZmFsc2UpO1xcbiAgICBjb25zdCBbcm93R3JvdXBpbmdNb2RlbCwgc2V0Um93R3JvdXBpbmdNb2RlbF0gPSB1c2VTdGF0ZTxHcmlkUm93R3JvdXBpbmdNb2RlbD4oW10pO1xcbiAgICBjb25zdCBbYWdncmVnYXRpb25Nb2RlbCwgc2V0QWdncmVnYXRpb25Nb2RlbF0gPSB1c2VTdGF0ZTxHcmlkQWdncmVnYXRpb25Nb2RlbD4oe30pO1xcbiAgICBjb25zdCBbZGV0YWlsUGFuZWxFbmFibGVkLCBzZXREZXRhaWxQYW5lbEVuYWJsZWRdID0gdXNlU3RhdGUodHJ1ZSk7XFxuXFxuICAgIGNvbnN0IGNvbHVtbnMgPSB1c2VNZW1vKCgpID0+IHtcXG4gICAgICAgIHJldHVybiBhbGxDb2x1bW5zLmZpbHRlcihjb2wgPT4gdmlzaWJsZUNvbHVtbnMuaGFzKGNvbC5maWVsZCkpO1xcbiAgICB9LCBbdmlzaWJsZUNvbHVtbnNdKTtcXG5cXG4gICAgY29uc3QgZmlsdGVyTW9kZWw6IEdyaWRGaWx0ZXJNb2RlbCA9IHVzZU1lbW8oKCkgPT4ge1xcbiAgICAgICAgaWYgKCFxdWlja0ZpbHRlclZhbHVlKSB7XFxuICAgICAgICAgICAgcmV0dXJuIHsgaXRlbXM6IFtdIH07XFxuICAgICAgICB9XFxuICAgICAgICByZXR1cm4ge1xcbiAgICAgICAgICAgIGl0ZW1zOiBbXSxcXG4gICAgICAgICAgICBxdWlja0ZpbHRlclZhbHVlczogW3F1aWNrRmlsdGVyVmFsdWVdXFxuICAgICAgICB9O1xcbiAgICB9LCBbcXVpY2tGaWx0ZXJWYWx1ZV0pO1xcblxcbiAgICBjb25zdCBmaWx0ZXJlZFJvd0NvdW50ID0gdXNlTWVtbygoKSA9PiB7XFxuICAgICAgICBpZiAoIXF1aWNrRmlsdGVyVmFsdWUpIHJldHVybiByb3dzLmxlbmd0aDtcXG5cXG4gICAgICAgIHJldHVybiByb3dzLmZpbHRlcihyb3cgPT4ge1xcbiAgICAgICAgICAgIGNvbnN0IHNlYXJjaFRlcm0gPSBxdWlja0ZpbHRlclZhbHVlLnRvTG93ZXJDYXNlKCk7XFxuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC52YWx1ZXMocm93KS5zb21lKHZhbHVlID0+IHtcXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBmYWxzZTtcXG4gICAgICAgICAgICAgICAgcmV0dXJuIFN0cmluZyh2YWx1ZSkudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXJtKTtcXG4gICAgICAgICAgICB9KTtcXG4gICAgICAgIH0pLmxlbmd0aDtcXG4gICAgfSwgW3Jvd3MsIHF1aWNrRmlsdGVyVmFsdWVdKTtcXG5cXG4gICAgY29uc3QgaGFuZGxlVmlzaWJpbGl0eUNoYW5nZSA9IChmaWVsZDogc3RyaW5nLCBpc1Zpc2libGU6IGJvb2xlYW4pID0+IHtcXG4gICAgICAgIHNldFZpc2libGVDb2x1bW5zKHByZXYgPT4ge1xcbiAgICAgICAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KHByZXYpO1xcbiAgICAgICAgICAgIGlmIChpc1Zpc2libGUpIHtcXG4gICAgICAgICAgICAgICAgbmV4dC5hZGQoZmllbGQpO1xcbiAgICAgICAgICAgIH0gZWxzZSB7XFxuICAgICAgICAgICAgICAgIG5leHQuZGVsZXRlKGZpZWxkKTtcXG4gICAgICAgICAgICB9XFxuICAgICAgICAgICAgcmV0dXJuIG5leHQ7XFxuICAgICAgICB9KTtcXG4gICAgfTtcXG5cXG4gICAgY29uc3QgaGFuZGxlU2hvd0FsbCA9ICgpID0+IHtcXG4gICAgICAgIHNldFZpc2libGVDb2x1bW5zKG5ldyBTZXQoYWxsQ29sdW1ucy5tYXAoY29sID0+IGNvbC5maWVsZCkpKTtcXG4gICAgfTtcXG5cXG4gICAgY29uc3QgaGFuZGxlSGlkZUFsbCA9ICgpID0+IHtcXG5cXG4gICAgICAgIHNldFZpc2libGVDb2x1bW5zKG5ldyBTZXQoYWxsQ29sdW1ucy5maWx0ZXIoY29sID0+IGNvbC5oaWRlYWJsZSA9PT0gZmFsc2UpLm1hcChjb2wgPT4gY29sLmZpZWxkKSkpO1xcbiAgICB9O1xcblxcbiAgICByZXR1cm4gKFxcbiAgICAgICAgPERvY3NMYXlvdXRcXG4gICAgICAgICAgICB0aXRsZT1cXFwiRnVsbCBGZWF0dXJlIFRlc3RcXFwiXFxuICAgICAgICAgICAgZGVzY3JpcHRpb249XFxcIkEgY29tcHJlaGVuc2l2ZSBmZWF0dXJlIHRlc3QgcGFnZSBleGVyY2lzaW5nIGV2ZXJ5IG1ham9yIE9wZW5HcmlkWCBjYXBhYmlsaXR5IGluIGEgc2luZ2xlIGdyaWQg4oCUIHZpcnR1YWxpemF0aW9uLCBwaW5uaW5nLCBncm91cGluZywgZWRpdGluZywgZXhwb3J0LCBhbmQgbW9yZS5cXFwiXFxuICAgICAgICAgICAgc291cmNlQ29kZT17c291cmNlQ29kZX1cXG4gICAgICAgID5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZGF0YWdyaWQtdGVzdF9faW5mb1xcXCI+XFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJkYXRhZ3JpZC10ZXN0X19zdGF0XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+VG90YWwgUm93czo8L3N0cm9uZz4ge3Jvd3MubGVuZ3RofVxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImRhdGFncmlkLXRlc3RfX3N0YXRcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5GaWx0ZXJlZDo8L3N0cm9uZz4ge2ZpbHRlcmVkUm93Q291bnR9XFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZGF0YWdyaWQtdGVzdF9fc3RhdFxcXCI+XFxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPlNlbGVjdGVkOjwvc3Ryb25nPiB7c2VsZWN0aW9uTW9kZWwubGVuZ3RofVxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImRhdGFncmlkLXRlc3RfX3N0YXRcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5WaXNpYmxlIENvbHVtbnM6PC9zdHJvbmc+IHt2aXNpYmxlQ29sdW1ucy5zaXplfS97YWxsQ29sdW1ucy5sZW5ndGh9XFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZGF0YWdyaWQtdGVzdF9fc3RhdFxcXCI+XFxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPlBhZ2U6PC9zdHJvbmc+IHtwYWdpbmF0aW9uTW9kZWwucGFnZSArIDF9IG9mIHtNYXRoLmNlaWwoZmlsdGVyZWRSb3dDb3VudCAvIHBhZ2luYXRpb25Nb2RlbC5wYWdlU2l6ZSl9XFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgIDwvZGl2PlxcblxcbiAgICAgICAgICAgIHsgfVxcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJkYXRhZ3JpZC10ZXN0X190b29sYmFyXFxcIj5cXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImRhdGFncmlkLXRlc3RfX3Rvb2xiYXItbGVmdFxcXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVxcXCJkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvblxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTaG93Q29sdW1uUGFuZWwoIXNob3dDb2x1bW5QYW5lbCl9XFxuICAgICAgICAgICAgICAgICAgICA+XFxuICAgICAgICAgICAgICAgICAgICAgICAge3Nob3dDb2x1bW5QYW5lbCA/ICdIaWRlJyA6ICdTaG93J30gQ29sdW1uc1xcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVxcXCJkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbiBkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tc2Vjb25kYXJ5XFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFBpbm5lZENvbHVtbnMoeyBsZWZ0OiBbJ2lkJywgJ25hbWUnXSwgcmlnaHQ6IFtdIH0pfVxcbiAgICAgICAgICAgICAgICAgICAgPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIPCfk4wgUGluIElEICYgTmFtZVxcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVxcXCJkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbiBkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tc2Vjb25kYXJ5XFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFBpbm5lZENvbHVtbnMoeyBsZWZ0OiBbXSwgcmlnaHQ6IFsnc2FsYXJ5JywgJ2pvaW5EYXRlJ10gfSl9XFxuICAgICAgICAgICAgICAgICAgICA+XFxuICAgICAgICAgICAgICAgICAgICAgICAg8J+TjCBQaW4gU2FsYXJ5ICYgRGF0ZVxcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVxcXCJkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbiBkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tc2Vjb25kYXJ5XFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFBpbm5lZENvbHVtbnMoeyBsZWZ0OiBbXSwgcmlnaHQ6IFtdIH0pfVxcbiAgICAgICAgICAgICAgICAgICAgPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIOKdjCBVbnBpbiBBbGwgQ29sdW1uc1xcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1kaXZpZGVyXFxcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XFxcImRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uIGRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1zZWNvbmRhcnlcXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0Q29sdW1uT3JkZXIoYWxsQ29sdW1ucy5tYXAoY29sID0+IGNvbC5maWVsZCkpfVxcbiAgICAgICAgICAgICAgICAgICAgPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIPCflIQgUmVzZXQgQ29sdW1uIE9yZGVyXFxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbiAke3BpbkNoZWNrYm94Q29sdW1uID8gJ2RhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1wcmltYXJ5JyA6ICdkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tc2Vjb25kYXJ5J31gfVxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFBpbkNoZWNrYm94Q29sdW1uKCFwaW5DaGVja2JveENvbHVtbil9XFxuICAgICAgICAgICAgICAgICAgICA+XFxuICAgICAgICAgICAgICAgICAgICAgICAge3BpbkNoZWNrYm94Q29sdW1uID8gJ/CflJMgVW5waW4gQ2hlY2tib3gnIDogJ/CflJIgUGluIENoZWNrYm94J31cXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uICR7cGluRXhwYW5kQ29sdW1uID8gJ2RhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1wcmltYXJ5JyA6ICdkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tc2Vjb25kYXJ5J31gfVxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFBpbkV4cGFuZENvbHVtbighcGluRXhwYW5kQ29sdW1uKX1cXG4gICAgICAgICAgICAgICAgICAgID5cXG4gICAgICAgICAgICAgICAgICAgICAgICB7cGluRXhwYW5kQ29sdW1uID8gJ/CflJMgVW5waW4gRXhwYW5kJyA6ICfwn5SSIFBpbiBFeHBhbmQnfVxcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVxcXCJkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbiBkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tc2Vjb25kYXJ5XFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFBpbm5lZFJvd3MoeyB0b3A6IFsxLCAyXSwgYm90dG9tOiBbXSB9KX1cXG4gICAgICAgICAgICAgICAgICAgID5cXG4gICAgICAgICAgICAgICAgICAgICAgICDwn5OMIFBpbiBGaXJzdCAyIFJvd3MgKFRvcClcXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cXFwiZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24gZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXNlY29uZGFyeVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRQaW5uZWRSb3dzKHsgdG9wOiBbXSwgYm90dG9tOiBbOTksIDEwMF0gfSl9XFxuICAgICAgICAgICAgICAgICAgICA+XFxuICAgICAgICAgICAgICAgICAgICAgICAg8J+TjCBQaW4gTGFzdCAyIFJvd3MgKEJvdHRvbSlcXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cXFwiZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24gZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXNlY29uZGFyeVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRQaW5uZWRSb3dzKHsgdG9wOiBbXSwgYm90dG9tOiBbXSB9KX1cXG4gICAgICAgICAgICAgICAgICAgID5cXG4gICAgICAgICAgICAgICAgICAgICAgICDinYwgVW5waW4gQWxsIFJvd3NcXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImRhdGFncmlkLXRlc3RfX3Rvb2xiYXItZGl2aWRlclxcXCI+PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24gJHtyb3dHcm91cGluZ01vZGVsLmxlbmd0aCA+IDAgPyAnZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXByaW1hcnknIDogJ2RhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1zZWNvbmRhcnknfWB9XFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocm93R3JvdXBpbmdNb2RlbC5sZW5ndGggPiAwKSB7XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRSb3dHcm91cGluZ01vZGVsKFtdKTtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEFnZ3JlZ2F0aW9uTW9kZWwoe30pO1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0Um93R3JvdXBpbmdNb2RlbChbJ2RlcGFydG1lbnQnLCAncm9sZSddKTtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEFnZ3JlZ2F0aW9uTW9kZWwoeyBzYWxhcnk6ICdzdW0nLCBpZDogJ2NvdW50JyB9KTtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxcblxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJlZURhdGEpIHNldFRyZWVEYXRhKGZhbHNlKTtcXG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxcbiAgICAgICAgICAgICAgICAgICAgPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtyb3dHcm91cGluZ01vZGVsLmxlbmd0aCA+IDAgPyAn8J+aqyBEaXNhYmxlIEdyb3VwaW5nJyA6ICfwn5ORIEdyb3VwIGJ5IERlcHQgPiBSb2xlJ31cXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uICR7dHJlZURhdGEgPyAnZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXByaW1hcnknIDogJ2RhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1zZWNvbmRhcnknfWB9XFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUcmVlRGF0YSghdHJlZURhdGEpO1xcblxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRyZWVEYXRhKSBzZXRSb3dHcm91cGluZ01vZGVsKFtdKTtcXG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxcbiAgICAgICAgICAgICAgICAgICAgPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIHt0cmVlRGF0YSA/ICfwn4yzIERpc2FibGUgVHJlZSBEYXRhJyA6ICfwn4yzIEVuYWJsZSBUcmVlIERhdGEnfVxcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1kaXZpZGVyXFxcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbiAke3Jvd1Jlb3JkZXJpbmcgPyAnZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXByaW1hcnknIDogJ2RhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1zZWNvbmRhcnknfWB9XFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJvd1Jlb3JkZXJpbmcpIHtcXG5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFNvcnRNb2RlbChbXSk7XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRQaW5uZWRSb3dzKHsgdG9wOiBbXSwgYm90dG9tOiBbXSB9KTtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRSb3dSZW9yZGVyaW5nKCFyb3dSZW9yZGVyaW5nKTtcXG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxcbiAgICAgICAgICAgICAgICAgICAgPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtyb3dSZW9yZGVyaW5nID8gJ/Cfm5EgRGlzYWJsZSBSb3cgUmVvcmRlcicgOiAn4oaV77iPIEVuYWJsZSBSb3cgUmVvcmRlcid9XFxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJkYXRhZ3JpZC10ZXN0X190b29sYmFyLWRpdmlkZXJcXFwiPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uICR7ZGV0YWlsUGFuZWxFbmFibGVkID8gJ2RhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1wcmltYXJ5JyA6ICdkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tc2Vjb25kYXJ5J31gfVxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0RGV0YWlsUGFuZWxFbmFibGVkKCFkZXRhaWxQYW5lbEVuYWJsZWQpO1xcblxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGV0YWlsUGFuZWxFbmFibGVkKSB7XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRFeHBhbmRlZERldGFpbFBhbmVsUm93SWRzKG5ldyBTZXQoKSk7XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cXG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxcbiAgICAgICAgICAgICAgICAgICAgPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtkZXRhaWxQYW5lbEVuYWJsZWQgPyAn8J+TiyBEaXNhYmxlIERldGFpbCBQYW5lbCcgOiAn8J+TiyBFbmFibGUgRGV0YWlsIFBhbmVsJ31cXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgPFF1aWNrRmlsdGVyXFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cXVpY2tGaWx0ZXJWYWx1ZX1cXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRRdWlja0ZpbHRlclZhbHVlfVxcbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XFxcIlNlYXJjaCBhY3Jvc3MgYWxsIGNvbHVtbnMuLi5cXFwiXFxuICAgICAgICAgICAgICAgIC8+XFxuICAgICAgICAgICAgPC9kaXY+XFxuXFxuICAgICAgICAgICAgeyB9XFxuICAgICAgICAgICAge3Nob3dDb2x1bW5QYW5lbCAmJiAoXFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJkYXRhZ3JpZC10ZXN0X19jb2x1bW4tcGFuZWxcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPENvbHVtblZpc2liaWxpdHlQYW5lbFxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbnM9e2FsbENvbHVtbnN9XFxuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZUNvbHVtbnM9e3Zpc2libGVDb2x1bW5zfVxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVmlzaWJpbGl0eUNoYW5nZT17aGFuZGxlVmlzaWJpbGl0eUNoYW5nZX1cXG4gICAgICAgICAgICAgICAgICAgICAgICBvblNob3dBbGw9e2hhbmRsZVNob3dBbGx9XFxuICAgICAgICAgICAgICAgICAgICAgICAgb25IaWRlQWxsPXtoYW5kbGVIaWRlQWxsfVxcbiAgICAgICAgICAgICAgICAgICAgLz5cXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgKX1cXG5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZGF0YWdyaWQtdGVzdF9fZ3JpZFxcXCI+XFxuICAgICAgICAgICAgICAgIDxEYXRhR3JpZFxcbiAgICAgICAgICAgICAgICAgICAgcm93cz17cm93c31cXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbnM9e2NvbHVtbnN9XFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9ezYwMH1cXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrYm94U2VsZWN0aW9uXFxuICAgICAgICAgICAgICAgICAgICByb3dTZWxlY3Rpb25Nb2RlbD17c2VsZWN0aW9uTW9kZWx9XFxuICAgICAgICAgICAgICAgICAgICBvblJvd1NlbGVjdGlvbk1vZGVsQ2hhbmdlPXtzZXRTZWxlY3Rpb25Nb2RlbH1cXG4gICAgICAgICAgICAgICAgICAgIHNvcnRNb2RlbD17c29ydE1vZGVsfVxcbiAgICAgICAgICAgICAgICAgICAgb25Tb3J0TW9kZWxDaGFuZ2U9e3NldFNvcnRNb2RlbH1cXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlck1vZGVsPXtmaWx0ZXJNb2RlbH1cXG4gICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb25cXG4gICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Nb2RlbD17cGFnaW5hdGlvbk1vZGVsfVxcbiAgICAgICAgICAgICAgICAgICAgb25QYWdpbmF0aW9uTW9kZWxDaGFuZ2U9e3NldFBhZ2luYXRpb25Nb2RlbH1cXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VTaXplT3B0aW9ucz17WzEwLCAyNSwgNTAsIDEwMF19XFxuICAgICAgICAgICAgICAgICAgICBwaW5uZWRDb2x1bW5zPXtwaW5uZWRDb2x1bW5zfVxcbiAgICAgICAgICAgICAgICAgICAgb25QaW5uZWRDb2x1bW5zQ2hhbmdlPXtzZXRQaW5uZWRDb2x1bW5zfVxcbiAgICAgICAgICAgICAgICAgICAgcGlubmVkUm93cz17cGlubmVkUm93c31cXG4gICAgICAgICAgICAgICAgICAgIG9uUm93Q2xpY2s9eyhwYXJhbXMpID0+IGNvbnNvbGUubG9nKCdSb3cgY2xpY2tlZDonLCBwYXJhbXMucm93KX1cXG4gICAgICAgICAgICAgICAgICAgIG9uQ2VsbENsaWNrPXsocGFyYW1zKSA9PiBjb25zb2xlLmxvZygnQ2VsbCBjbGlja2VkOicsIHBhcmFtcy5yb3csIHBhcmFtcy5maWVsZCl9XFxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzUm93VXBkYXRlPXsobmV3Um93KSA9PiB7XFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1JvdyBVcGRhdGVkOicsIG5ld1Jvdyk7XFxuXFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0Um93cyhwcmV2ID0+IHByZXYubWFwKHIgPT4gci5pZCA9PT0gbmV3Um93LmlkID8gKG5ld1JvdyBhcyBFbXBsb3llZSkgOiByKSk7XFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ld1JvdztcXG4gICAgICAgICAgICAgICAgICAgIH19XFxuICAgICAgICAgICAgICAgICAgICBvblByb2Nlc3NSb3dVcGRhdGVFcnJvcj17KGVycm9yKSA9PiBjb25zb2xlLmVycm9yKCdSb3cgVXBkYXRlIEVycm9yOicsIGVycm9yKX1cXG5cXG4gICAgICAgICAgICAgICAgICAgIGdldERldGFpbFBhbmVsQ29udGVudD17ZGV0YWlsUGFuZWxFbmFibGVkID8gKHBhcmFtcykgPT4gKFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzE2cHgnLCBiYWNrZ3JvdW5kOiAnI2Y1ZjVmNScgfX0+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoNCBzdHlsZT17eyBtYXJnaW46ICcwIDAgMTJweCAwJyB9fT5FbXBsb3llZSBEZXRhaWxzOiB7cGFyYW1zLnJvdy5uYW1lfTwvaDQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2dyaWQnLCBncmlkVGVtcGxhdGVDb2x1bW5zOiAnMWZyIDFmcicsIGdhcDogJzhweCcgfX0+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PjxzdHJvbmc+SUQ6PC9zdHJvbmc+IHtwYXJhbXMucm93LmlkfTwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj48c3Ryb25nPkVtYWlsOjwvc3Ryb25nPiB7cGFyYW1zLnJvdy5lbWFpbH08L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+PHN0cm9uZz5EZXBhcnRtZW50Ojwvc3Ryb25nPiB7cGFyYW1zLnJvdy5kZXBhcnRtZW50fTwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj48c3Ryb25nPlJvbGU6PC9zdHJvbmc+IHtwYXJhbXMucm93LnJvbGV9PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PjxzdHJvbmc+U2FsYXJ5Ojwvc3Ryb25nPiAke3BhcmFtcy5yb3cuc2FsYXJ5LnRvTG9jYWxlU3RyaW5nKCl9PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PjxzdHJvbmc+Sm9pbiBEYXRlOjwvc3Ryb25nPiB7cGFyYW1zLnJvdy5qb2luRGF0ZX08L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICApIDogdW5kZWZpbmVkfVxcbiAgICAgICAgICAgICAgICAgICAgZ2V0RGV0YWlsUGFuZWxIZWlnaHQ9e2RldGFpbFBhbmVsRW5hYmxlZCA/ICgpID0+IDE1MCA6IHVuZGVmaW5lZH1cXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbFBhbmVsRXhwYW5kZWRSb3dJZHM9e2RldGFpbFBhbmVsRW5hYmxlZCA/IGV4cGFuZGVkRGV0YWlsUGFuZWxSb3dJZHMgOiB1bmRlZmluZWR9XFxuICAgICAgICAgICAgICAgICAgICBvbkRldGFpbFBhbmVsRXhwYW5kZWRSb3dJZHNDaGFuZ2U9e2RldGFpbFBhbmVsRW5hYmxlZCA/IHNldEV4cGFuZGVkRGV0YWlsUGFuZWxSb3dJZHMgOiB1bmRlZmluZWR9XFxuICAgICAgICAgICAgICAgICAgICBwaW5DaGVja2JveENvbHVtbj17cGluQ2hlY2tib3hDb2x1bW59XFxuICAgICAgICAgICAgICAgICAgICBwaW5FeHBhbmRDb2x1bW49e3BpbkV4cGFuZENvbHVtbn1cXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbk9yZGVyPXtjb2x1bW5PcmRlcn1cXG4gICAgICAgICAgICAgICAgICAgIG9uQ29sdW1uT3JkZXJNb2RlbENoYW5nZT17c2V0Q29sdW1uT3JkZXJ9XFxuICAgICAgICAgICAgICAgICAgICBvbkNvbHVtbk9yZGVyQ2hhbmdlPXsocGFyYW1zKSA9PiB7XFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NvbHVtbiByZW9yZGVyZWQ6JywgcGFyYW1zKTtcXG4gICAgICAgICAgICAgICAgICAgIH19XFxuXFxuICAgICAgICAgICAgICAgICAgICByb3dHcm91cGluZ01vZGVsPXtyb3dHcm91cGluZ01vZGVsfVxcbiAgICAgICAgICAgICAgICAgICAgYWdncmVnYXRpb25Nb2RlbD17YWdncmVnYXRpb25Nb2RlbH1cXG4gICAgICAgICAgICAgICAgICAgIG9uQWdncmVnYXRpb25Nb2RlbENoYW5nZT17c2V0QWdncmVnYXRpb25Nb2RlbH1cXG5cXG4gICAgICAgICAgICAgICAgICAgIHJvd1Jlb3JkZXJpbmc9e3Jvd1Jlb3JkZXJpbmd9XFxuICAgICAgICAgICAgICAgICAgICBvblJvd09yZGVyQ2hhbmdlPXsocGFyYW1zKSA9PiB7XFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gb2xkSW5kZXggLyB0YXJnZXRJbmRleCBhcmUgcG9zaXRpb25zIGluIGByb3dzYCwgd2hhdGV2ZXIgdGhlIHBhZ2UsIHNvcnQgb3IgZmlsdGVyLlxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgb2xkSW5kZXgsIHRhcmdldEluZGV4IH0gPSBwYXJhbXM7XFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1JvdyByZW9yZGVyZWQ6JywgcGFyYW1zKTtcXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRSb3dzKHByZXYgPT4ge1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdSb3dzID0gWy4uLnByZXZdO1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBbbW92ZWRdID0gbmV3Um93cy5zcGxpY2Uob2xkSW5kZXgsIDEpO1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdSb3dzLnNwbGljZSh0YXJnZXRJbmRleCwgMCwgbW92ZWQpO1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3Um93cztcXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcXG4gICAgICAgICAgICAgICAgICAgIH19XFxuICAgICAgICAgICAgICAgIC8+XFxuICAgICAgICAgICAgPC9kaXY+XFxuXFxuICAgICAgICA8L0RvY3NMYXlvdXQ+XFxuICAgICk7XFxufVxcblxcbmV4cG9ydCBkZWZhdWx0IERhdGFHcmlkVGVzdDtcXG5cIiIsIlxuXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlTWVtbyB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IERhdGFHcmlkIH0gZnJvbSAnQG9wZW5jb3Jlc3RhY2svb3BlbmdyaWR4JztcbmltcG9ydCB7IFF1aWNrRmlsdGVyIH0gZnJvbSAnLi4vLi4vLi4vbGliL2NvbXBvbmVudHMvUXVpY2tGaWx0ZXIvUXVpY2tGaWx0ZXInO1xuaW1wb3J0IHsgQ29sdW1uVmlzaWJpbGl0eVBhbmVsIH0gZnJvbSAnLi4vLi4vLi4vbGliL2NvbXBvbmVudHMvQ29sdW1uVmlzaWJpbGl0eVBhbmVsL0NvbHVtblZpc2liaWxpdHlQYW5lbCc7XG5pbXBvcnQgdHlwZSB7IEdyaWRDb2xEZWYsIEdyaWRSb3dNb2RlbCwgR3JpZEZpbHRlck1vZGVsLCBHcmlkQ29sdW1uUGlubmluZywgR3JpZFJvd1Bpbm5pbmcsIEdyaWRSb3dJZCwgR3JpZFJvd0dyb3VwaW5nTW9kZWwsIEdyaWRBZ2dyZWdhdGlvbk1vZGVsIH0gZnJvbSAnQG9wZW5jb3Jlc3RhY2svb3BlbmdyaWR4JztcbmltcG9ydCAnLi4vLi4vLi4vbGliL2NvbXBvbmVudHMvUXVpY2tGaWx0ZXIvUXVpY2tGaWx0ZXIuY3NzJztcbmltcG9ydCAnLi4vLi4vLi4vbGliL2NvbXBvbmVudHMvQ29sdW1uVmlzaWJpbGl0eVBhbmVsL0NvbHVtblZpc2liaWxpdHlQYW5lbC5jc3MnO1xuaW1wb3J0ICcuL0RhdGFHcmlkVGVzdC5jc3MnO1xuaW1wb3J0IHsgRG9jc0xheW91dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvRG9jc0xheW91dCc7XG5pbXBvcnQgc291cmNlQ29kZSBmcm9tICcuL0RhdGFHcmlkVGVzdC50c3g/cmF3JztcblxuaW50ZXJmYWNlIEVtcGxveWVlIGV4dGVuZHMgR3JpZFJvd01vZGVsIHtcbiAgICBpZDogbnVtYmVyO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBlbWFpbDogc3RyaW5nO1xuICAgIGRlcGFydG1lbnQ6IHN0cmluZztcbiAgICByb2xlOiBzdHJpbmc7XG4gICAgc2FsYXJ5OiBudW1iZXI7XG4gICAgam9pbkRhdGU6IHN0cmluZztcbiAgICBwYXRoOiBzdHJpbmdbXTtcbn1cblxuY29uc3QgZGF0YSA9IFtcbiAgICB7XG4gICAgICAgIFwiaWRcIjogMSxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMVwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUxQGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkZpbmFuY2VcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGVzaWduZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTQ4NDE3LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyOC0wNi0wOFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJGaW5hbmNlXCIsXG4gICAgICAgICAgICBcIkRlc2lnbmVyXCIsXG4gICAgICAgICAgICBcIkxlYWRcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgMVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAyLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSAyXCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTJAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRW5naW5lZXJpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMjE5MDMsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI1LTA2LTAyXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgICAgICBcIkFuYWx5c3RcIixcbiAgICAgICAgICAgIFwiTGVhZFwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAyXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDMsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDNcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlM0Bjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICBcInJvbGVcIjogXCJEZXNpZ25lclwiLFxuICAgICAgICBcInNhbGFyeVwiOiA4ODIxNCxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjgtMDMtMTFcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRW5naW5lZXJpbmdcIixcbiAgICAgICAgICAgIFwiRGVzaWduZXJcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDNcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNCxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU0QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkZpbmFuY2VcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDc0NjkxLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNi0wOC0xOFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJGaW5hbmNlXCIsXG4gICAgICAgICAgICBcIkRldmVsb3BlclwiLFxuICAgICAgICAgICAgXCJKdW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNFwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA1LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA1XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTVAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiU2FsZXNcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiTWFuYWdlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiA4NjI0MyxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjUtMDctMDhcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiU2FsZXNcIixcbiAgICAgICAgICAgIFwiTWFuYWdlclwiLFxuICAgICAgICAgICAgXCJBc3NvY2lhdGVcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA2LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA2XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTZAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRmluYW5jZVwiLFxuICAgICAgICBcInJvbGVcIjogXCJBbmFseXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDY4Mjk5LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNC0wOC0zMVwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJGaW5hbmNlXCIsXG4gICAgICAgICAgICBcIkFuYWx5c3RcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDZcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNyxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgN1wiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU3QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRldmVsb3BlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMDU4NDEsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI0LTEwLTA0XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgICAgICBcIkRldmVsb3BlclwiLFxuICAgICAgICAgICAgXCJBc3NvY2lhdGVcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgN1wiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA4LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA4XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZThAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiU2FsZXNcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDEyMDkwOCxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjctMTItMDJcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiU2FsZXNcIixcbiAgICAgICAgICAgIFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgICAgICBcIlNlbmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA4XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDksXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDlcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlOUBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJTYWxlc1wiLFxuICAgICAgICBcInJvbGVcIjogXCJEZXNpZ25lclwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMzkyNTksXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI0LTA1LTI1XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIlNhbGVzXCIsXG4gICAgICAgICAgICBcIkRlc2lnbmVyXCIsXG4gICAgICAgICAgICBcIkp1bmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA5XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDEwLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSAxMFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUxMEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJGaW5hbmNlXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkFuYWx5c3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTM2MjM2LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNC0wMi0yM1wiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJGaW5hbmNlXCIsXG4gICAgICAgICAgICBcIkFuYWx5c3RcIixcbiAgICAgICAgICAgIFwiU2VuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDEwXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDExLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSAxMVwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUxMUBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJGaW5hbmNlXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRldmVsb3BlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxNDEzNjYsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI2LTEwLTAzXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkZpbmFuY2VcIixcbiAgICAgICAgICAgIFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgICAgICBcIkxlYWRcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgMTFcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogMTIsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDEyXCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTEyQGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkhSXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIk1hbmFnZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTQ1NzI2LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNS0xMS0yMlwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJIUlwiLFxuICAgICAgICAgICAgXCJNYW5hZ2VyXCIsXG4gICAgICAgICAgICBcIlNlbmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAxMlwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAxMyxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMTNcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlMTNAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRmluYW5jZVwiLFxuICAgICAgICBcInJvbGVcIjogXCJEZXZlbG9wZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogNTY2MTQsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI0LTA4LTE0XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkZpbmFuY2VcIixcbiAgICAgICAgICAgIFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgICAgICBcIkFzc29jaWF0ZVwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAxM1wiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAxNCxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMTRcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlMTRAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiSFJcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGVzaWduZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTQ5NjkyLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNi0wOS0xOVwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJIUlwiLFxuICAgICAgICAgICAgXCJEZXNpZ25lclwiLFxuICAgICAgICAgICAgXCJMZWFkXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDE0XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDE1LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSAxNVwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUxNUBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJTYWxlc1wiLFxuICAgICAgICBcInJvbGVcIjogXCJEZXZlbG9wZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogNzU0MDUsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI1LTA2LTAyXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIlNhbGVzXCIsXG4gICAgICAgICAgICBcIkRldmVsb3BlclwiLFxuICAgICAgICAgICAgXCJKdW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgMTVcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogMTYsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDE2XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTE2QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRlc2lnbmVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDE0MjE2NyxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjgtMDItMDhcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRW5naW5lZXJpbmdcIixcbiAgICAgICAgICAgIFwiRGVzaWduZXJcIixcbiAgICAgICAgICAgIFwiSnVuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDE2XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDE3LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSAxN1wiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUxN0Bjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJIUlwiLFxuICAgICAgICBcInJvbGVcIjogXCJNYW5hZ2VyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDE0NzY5MSxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjQtMDItMjBcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiSFJcIixcbiAgICAgICAgICAgIFwiTWFuYWdlclwiLFxuICAgICAgICAgICAgXCJKdW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgMTdcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogMTgsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDE4XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTE4QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIk1hcmtldGluZ1wiLFxuICAgICAgICBcInJvbGVcIjogXCJNYW5hZ2VyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDEwODA0MixcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjgtMDUtMTRcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiTWFya2V0aW5nXCIsXG4gICAgICAgICAgICBcIk1hbmFnZXJcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDE4XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDE5LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSAxOVwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUxOUBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJGaW5hbmNlXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIk1hbmFnZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTE2NTQ4LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNy0wNS0yMlwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJGaW5hbmNlXCIsXG4gICAgICAgICAgICBcIk1hbmFnZXJcIixcbiAgICAgICAgICAgIFwiU2VuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDE5XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDIwLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSAyMFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUyMEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICBcInJvbGVcIjogXCJEZXNpZ25lclwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxNDM3OTEsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI4LTA4LTA2XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgICAgICBcIkRlc2lnbmVyXCIsXG4gICAgICAgICAgICBcIkFzc29jaWF0ZVwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAyMFwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAyMSxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMjFcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlMjFAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiSFJcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiU3BlY2lhbGlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxNDgyMTcsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI3LTA0LTMwXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkhSXCIsXG4gICAgICAgICAgICBcIlNwZWNpYWxpc3RcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDIxXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDIyLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSAyMlwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUyMkBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJNYXJrZXRpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDEwMTYzOSxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjUtMTAtMDhcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiTWFya2V0aW5nXCIsXG4gICAgICAgICAgICBcIkRldmVsb3BlclwiLFxuICAgICAgICAgICAgXCJBc3NvY2lhdGVcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgMjJcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogMjMsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDIzXCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTIzQGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkZpbmFuY2VcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDE0NjExMSxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjctMDMtMTNcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRmluYW5jZVwiLFxuICAgICAgICAgICAgXCJEZXZlbG9wZXJcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDIzXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDI0LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSAyNFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUyNEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJNYXJrZXRpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDc0NzA0LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNS0wNC0wM1wiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJNYXJrZXRpbmdcIixcbiAgICAgICAgICAgIFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgICAgICBcIlNlbmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAyNFwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAyNSxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMjVcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlMjVAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiU2FsZXNcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiTWFuYWdlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiA3NzE4OSxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjgtMDMtMDRcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiU2FsZXNcIixcbiAgICAgICAgICAgIFwiTWFuYWdlclwiLFxuICAgICAgICAgICAgXCJBc3NvY2lhdGVcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgMjVcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogMjYsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDI2XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTI2QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIk1hbmFnZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTEzMTQ5LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNi0xMC0wOFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICAgICAgXCJNYW5hZ2VyXCIsXG4gICAgICAgICAgICBcIkxlYWRcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgMjZcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogMjcsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDI3XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTI3QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkZpbmFuY2VcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGVzaWduZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogOTEyNjYsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI2LTAyLTEwXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkZpbmFuY2VcIixcbiAgICAgICAgICAgIFwiRGVzaWduZXJcIixcbiAgICAgICAgICAgIFwiSnVuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDI3XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDI4LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSAyOFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUyOEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJIUlwiLFxuICAgICAgICBcInJvbGVcIjogXCJNYW5hZ2VyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDk0NDc4LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNy0wMy0xNlwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJIUlwiLFxuICAgICAgICAgICAgXCJNYW5hZ2VyXCIsXG4gICAgICAgICAgICBcIkFzc29jaWF0ZVwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAyOFwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAyOSxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMjlcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlMjlAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiSFJcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGVzaWduZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogOTIwODQsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI1LTEyLTI3XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkhSXCIsXG4gICAgICAgICAgICBcIkRlc2lnbmVyXCIsXG4gICAgICAgICAgICBcIlNlbmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAyOVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAzMCxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMzBcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlMzBAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiU2FsZXNcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGVzaWduZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogNTA0NDksXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI2LTAyLTEwXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIlNhbGVzXCIsXG4gICAgICAgICAgICBcIkRlc2lnbmVyXCIsXG4gICAgICAgICAgICBcIkxlYWRcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgMzBcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogMzEsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDMxXCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTMxQGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkZpbmFuY2VcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiU3BlY2lhbGlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiA5MDA2NSxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjUtMDktMjRcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRmluYW5jZVwiLFxuICAgICAgICAgICAgXCJTcGVjaWFsaXN0XCIsXG4gICAgICAgICAgICBcIkxlYWRcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgMzFcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogMzIsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDMyXCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTMyQGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIk1hcmtldGluZ1wiLFxuICAgICAgICBcInJvbGVcIjogXCJBbmFseXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDkxMDQ2LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNC0xMi0xMVwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJNYXJrZXRpbmdcIixcbiAgICAgICAgICAgIFwiQW5hbHlzdFwiLFxuICAgICAgICAgICAgXCJMZWFkXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDMyXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDMzLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSAzM1wiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUzM0Bjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJGaW5hbmNlXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRlc2lnbmVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDEwODE4MixcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjQtMDQtMDJcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRmluYW5jZVwiLFxuICAgICAgICAgICAgXCJEZXNpZ25lclwiLFxuICAgICAgICAgICAgXCJKdW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgMzNcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogMzQsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDM0XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTM0QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkZpbmFuY2VcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiA4MTU4MCxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjctMDgtMDZcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRmluYW5jZVwiLFxuICAgICAgICAgICAgXCJBbmFseXN0XCIsXG4gICAgICAgICAgICBcIlNlbmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAzNFwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAzNSxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMzVcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlMzVAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiU2FsZXNcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiU3BlY2lhbGlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMjM2NTksXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI1LTA5LTE0XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIlNhbGVzXCIsXG4gICAgICAgICAgICBcIlNwZWNpYWxpc3RcIixcbiAgICAgICAgICAgIFwiTGVhZFwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAzNVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAzNixcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMzZcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlMzZAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiSFJcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiU3BlY2lhbGlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxNDk0MTAsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI4LTAzLTA2XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkhSXCIsXG4gICAgICAgICAgICBcIlNwZWNpYWxpc3RcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDM2XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDM3LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSAzN1wiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUzN0Bjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICBcInJvbGVcIjogXCJBbmFseXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDU4OTg0LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNC0wMy0wM1wiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICAgICAgXCJBbmFseXN0XCIsXG4gICAgICAgICAgICBcIkFzc29jaWF0ZVwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAzN1wiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAzOCxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMzhcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlMzhAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRW5naW5lZXJpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGVzaWduZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogNjc3MzIsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI3LTA1LTEyXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgICAgICBcIkRlc2lnbmVyXCIsXG4gICAgICAgICAgICBcIkFzc29jaWF0ZVwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAzOFwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAzOSxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMzlcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlMzlAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRmluYW5jZVwiLFxuICAgICAgICBcInJvbGVcIjogXCJBbmFseXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDYzNzA1LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyOC0wMS0yN1wiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJGaW5hbmNlXCIsXG4gICAgICAgICAgICBcIkFuYWx5c3RcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDM5XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDQwLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA0MFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU0MEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJNYXJrZXRpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiTWFuYWdlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiA5ODA0OCxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjYtMTEtMjdcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiTWFya2V0aW5nXCIsXG4gICAgICAgICAgICBcIk1hbmFnZXJcIixcbiAgICAgICAgICAgIFwiSnVuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDQwXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDQxLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA0MVwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU0MUBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJGaW5hbmNlXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIlNwZWNpYWxpc3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogOTYzMDYsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI1LTA3LTE4XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkZpbmFuY2VcIixcbiAgICAgICAgICAgIFwiU3BlY2lhbGlzdFwiLFxuICAgICAgICAgICAgXCJKdW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNDFcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNDIsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDQyXCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTQyQGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRldmVsb3BlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxNDIzNzAsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI3LTA4LTA0XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgICAgICBcIkRldmVsb3BlclwiLFxuICAgICAgICAgICAgXCJBc3NvY2lhdGVcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNDJcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNDMsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDQzXCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTQzQGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIlNhbGVzXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIk1hbmFnZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTM0NDQ3LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNS0wNC0xOFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJTYWxlc1wiLFxuICAgICAgICAgICAgXCJNYW5hZ2VyXCIsXG4gICAgICAgICAgICBcIlNlbmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA0M1wiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA0NCxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNDRcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNDRAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiTWFya2V0aW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRldmVsb3BlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiA4OTgwMCxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjYtMDQtMjdcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiTWFya2V0aW5nXCIsXG4gICAgICAgICAgICBcIkRldmVsb3BlclwiLFxuICAgICAgICAgICAgXCJMZWFkXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDQ0XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDQ1LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA0NVwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU0NUBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJNYXJrZXRpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGVzaWduZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogOTYwODYsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI0LTA1LTEzXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIk1hcmtldGluZ1wiLFxuICAgICAgICAgICAgXCJEZXNpZ25lclwiLFxuICAgICAgICAgICAgXCJKdW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNDVcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNDYsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDQ2XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTQ2QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIlNhbGVzXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIk1hbmFnZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTE1NTYxLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNS0wNy0wNVwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJTYWxlc1wiLFxuICAgICAgICAgICAgXCJNYW5hZ2VyXCIsXG4gICAgICAgICAgICBcIkFzc29jaWF0ZVwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA0NlwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA0NyxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNDdcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNDdAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiTWFya2V0aW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkFuYWx5c3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogNzc0MTQsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI2LTAyLTE1XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIk1hcmtldGluZ1wiLFxuICAgICAgICAgICAgXCJBbmFseXN0XCIsXG4gICAgICAgICAgICBcIkFzc29jaWF0ZVwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA0N1wiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA0OCxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNDhcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNDhAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRmluYW5jZVwiLFxuICAgICAgICBcInJvbGVcIjogXCJBbmFseXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDUwNTQ1LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNi0xMi0yNFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJGaW5hbmNlXCIsXG4gICAgICAgICAgICBcIkFuYWx5c3RcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDQ4XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDQ5LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA0OVwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU0OUBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJNYXJrZXRpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiTWFuYWdlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiA2MTI2NyxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjgtMDQtMDFcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiTWFya2V0aW5nXCIsXG4gICAgICAgICAgICBcIk1hbmFnZXJcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDQ5XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDUwLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA1MFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU1MEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJIUlwiLFxuICAgICAgICBcInJvbGVcIjogXCJEZXNpZ25lclwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMzA3NzUsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI1LTA1LTIwXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkhSXCIsXG4gICAgICAgICAgICBcIkRlc2lnbmVyXCIsXG4gICAgICAgICAgICBcIkp1bmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA1MFwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA1MSxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNTFcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNTFAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRmluYW5jZVwiLFxuICAgICAgICBcInJvbGVcIjogXCJBbmFseXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDYxMjkxLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNi0xMC0wNlwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJGaW5hbmNlXCIsXG4gICAgICAgICAgICBcIkFuYWx5c3RcIixcbiAgICAgICAgICAgIFwiTGVhZFwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA1MVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA1MixcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNTJcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNTJAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRmluYW5jZVwiLFxuICAgICAgICBcInJvbGVcIjogXCJEZXZlbG9wZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTIxNzQ0LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNC0wNy0xMlwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJGaW5hbmNlXCIsXG4gICAgICAgICAgICBcIkRldmVsb3BlclwiLFxuICAgICAgICAgICAgXCJMZWFkXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDUyXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDUzLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA1M1wiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU1M0Bjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICBcInJvbGVcIjogXCJBbmFseXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDEwODQ5MixcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjUtMDUtMDRcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRW5naW5lZXJpbmdcIixcbiAgICAgICAgICAgIFwiQW5hbHlzdFwiLFxuICAgICAgICAgICAgXCJBc3NvY2lhdGVcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNTNcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNTQsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDU0XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTU0QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkFuYWx5c3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogNzIxODksXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI4LTEwLTA2XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgICAgICBcIkFuYWx5c3RcIixcbiAgICAgICAgICAgIFwiTGVhZFwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA1NFwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA1NSxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNTVcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNTVAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiU2FsZXNcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGVzaWduZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTA1MzI4LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNy0wNS0wN1wiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJTYWxlc1wiLFxuICAgICAgICAgICAgXCJEZXNpZ25lclwiLFxuICAgICAgICAgICAgXCJTZW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNTVcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNTYsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDU2XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTU2QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkhSXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRlc2lnbmVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDEwMjc3MSxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjctMDUtMjBcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiSFJcIixcbiAgICAgICAgICAgIFwiRGVzaWduZXJcIixcbiAgICAgICAgICAgIFwiU2VuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDU2XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDU3LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA1N1wiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU1N0Bjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJIUlwiLFxuICAgICAgICBcInJvbGVcIjogXCJEZXZlbG9wZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTQwMDg1LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyOC0wNy0wNVwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJIUlwiLFxuICAgICAgICAgICAgXCJEZXZlbG9wZXJcIixcbiAgICAgICAgICAgIFwiSnVuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDU3XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDU4LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA1OFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU1OEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJGaW5hbmNlXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIlNwZWNpYWxpc3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogNzk1MDIsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI0LTAxLTA4XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkZpbmFuY2VcIixcbiAgICAgICAgICAgIFwiU3BlY2lhbGlzdFwiLFxuICAgICAgICAgICAgXCJKdW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNThcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNTksXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDU5XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTU5QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkZpbmFuY2VcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMTA2MjQsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI0LTAxLTMxXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkZpbmFuY2VcIixcbiAgICAgICAgICAgIFwiQW5hbHlzdFwiLFxuICAgICAgICAgICAgXCJBc3NvY2lhdGVcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNTlcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNjAsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDYwXCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTYwQGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkZpbmFuY2VcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGVzaWduZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTEzMzE4LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNC0wOC0yNVwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJGaW5hbmNlXCIsXG4gICAgICAgICAgICBcIkRlc2lnbmVyXCIsXG4gICAgICAgICAgICBcIkFzc29jaWF0ZVwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA2MFwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA2MSxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNjFcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNjFAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiU2FsZXNcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiU3BlY2lhbGlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMzQxNjIsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI2LTExLTE4XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIlNhbGVzXCIsXG4gICAgICAgICAgICBcIlNwZWNpYWxpc3RcIixcbiAgICAgICAgICAgIFwiSnVuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDYxXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDYyLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA2MlwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU2MkBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJNYXJrZXRpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDY3MTM0LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNy0xMS0yNFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJNYXJrZXRpbmdcIixcbiAgICAgICAgICAgIFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgICAgICBcIkFzc29jaWF0ZVwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA2MlwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA2MyxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNjNcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNjNAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiSFJcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGVzaWduZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogOTAwMDUsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI1LTA2LTA0XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkhSXCIsXG4gICAgICAgICAgICBcIkRlc2lnbmVyXCIsXG4gICAgICAgICAgICBcIlNlbmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA2M1wiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA2NCxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNjRcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNjRAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRmluYW5jZVwiLFxuICAgICAgICBcInJvbGVcIjogXCJBbmFseXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDc3ODA2LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNy0wNy0yN1wiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJGaW5hbmNlXCIsXG4gICAgICAgICAgICBcIkFuYWx5c3RcIixcbiAgICAgICAgICAgIFwiTGVhZFwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA2NFwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA2NSxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNjVcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNjVAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiU2FsZXNcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiA1MTc1MyxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjgtMDktMjFcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiU2FsZXNcIixcbiAgICAgICAgICAgIFwiQW5hbHlzdFwiLFxuICAgICAgICAgICAgXCJMZWFkXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDY1XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDY2LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA2NlwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU2NkBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJNYXJrZXRpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiU3BlY2lhbGlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxNDQ1NjksXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI4LTAxLTE5XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIk1hcmtldGluZ1wiLFxuICAgICAgICAgICAgXCJTcGVjaWFsaXN0XCIsXG4gICAgICAgICAgICBcIkp1bmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA2NlwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA2NyxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNjdcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNjdAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRW5naW5lZXJpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiTWFuYWdlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiA2NDU0OCxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjctMDMtMTRcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRW5naW5lZXJpbmdcIixcbiAgICAgICAgICAgIFwiTWFuYWdlclwiLFxuICAgICAgICAgICAgXCJBc3NvY2lhdGVcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNjdcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNjgsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDY4XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTY4QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIk1hcmtldGluZ1wiLFxuICAgICAgICBcInJvbGVcIjogXCJTcGVjaWFsaXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDg2NjU5LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNy0xMS0yN1wiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJNYXJrZXRpbmdcIixcbiAgICAgICAgICAgIFwiU3BlY2lhbGlzdFwiLFxuICAgICAgICAgICAgXCJBc3NvY2lhdGVcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNjhcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNjksXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDY5XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTY5QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkhSXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIlNwZWNpYWxpc3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogODU2ODAsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI3LTA2LTIzXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkhSXCIsXG4gICAgICAgICAgICBcIlNwZWNpYWxpc3RcIixcbiAgICAgICAgICAgIFwiSnVuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDY5XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDcwLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA3MFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU3MEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJIUlwiLFxuICAgICAgICBcInJvbGVcIjogXCJBbmFseXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDEzOTIzMyxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjctMDctMTdcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiSFJcIixcbiAgICAgICAgICAgIFwiQW5hbHlzdFwiLFxuICAgICAgICAgICAgXCJBc3NvY2lhdGVcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNzBcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNzEsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDcxXCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTcxQGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkhSXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIk1hbmFnZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogODAxMTIsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI2LTEyLTA2XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkhSXCIsXG4gICAgICAgICAgICBcIk1hbmFnZXJcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDcxXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDcyLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA3MlwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU3MkBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJTYWxlc1wiLFxuICAgICAgICBcInJvbGVcIjogXCJTcGVjaWFsaXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDU0NzMyLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNC0wOC0yM1wiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJTYWxlc1wiLFxuICAgICAgICAgICAgXCJTcGVjaWFsaXN0XCIsXG4gICAgICAgICAgICBcIlNlbmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA3MlwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA3MyxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNzNcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNzNAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiSFJcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMjUxMjcsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI4LTAxLTA4XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkhSXCIsXG4gICAgICAgICAgICBcIkFuYWx5c3RcIixcbiAgICAgICAgICAgIFwiU2VuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDczXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDc0LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA3NFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU3NEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJTYWxlc1wiLFxuICAgICAgICBcInJvbGVcIjogXCJBbmFseXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDEyMDMyMixcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjgtMDYtMTlcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiU2FsZXNcIixcbiAgICAgICAgICAgIFwiQW5hbHlzdFwiLFxuICAgICAgICAgICAgXCJMZWFkXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDc0XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDc1LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA3NVwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU3NUBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJNYXJrZXRpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiTWFuYWdlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiA5NTc4OSxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjctMTAtMjNcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiTWFya2V0aW5nXCIsXG4gICAgICAgICAgICBcIk1hbmFnZXJcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDc1XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDc2LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA3NlwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU3NkBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJGaW5hbmNlXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIk1hbmFnZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTIxODA4LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNy0xMC0yN1wiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJGaW5hbmNlXCIsXG4gICAgICAgICAgICBcIk1hbmFnZXJcIixcbiAgICAgICAgICAgIFwiSnVuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDc2XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDc3LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA3N1wiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU3N0Bjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJTYWxlc1wiLFxuICAgICAgICBcInJvbGVcIjogXCJTcGVjaWFsaXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDEwODkzMyxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjUtMDItMDVcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiU2FsZXNcIixcbiAgICAgICAgICAgIFwiU3BlY2lhbGlzdFwiLFxuICAgICAgICAgICAgXCJTZW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNzdcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNzgsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDc4XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTc4QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkZpbmFuY2VcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiTWFuYWdlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiA1MDk0NixcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjYtMTEtMjBcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRmluYW5jZVwiLFxuICAgICAgICAgICAgXCJNYW5hZ2VyXCIsXG4gICAgICAgICAgICBcIlNlbmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA3OFwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA3OSxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNzlcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNzlAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiTWFya2V0aW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIk1hbmFnZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTAwOTY1LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNC0wNC0yMVwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJNYXJrZXRpbmdcIixcbiAgICAgICAgICAgIFwiTWFuYWdlclwiLFxuICAgICAgICAgICAgXCJMZWFkXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDc5XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDgwLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA4MFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU4MEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJNYXJrZXRpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiA1NDU0OCxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjYtMDQtMDVcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiTWFya2V0aW5nXCIsXG4gICAgICAgICAgICBcIkFuYWx5c3RcIixcbiAgICAgICAgICAgIFwiSnVuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDgwXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDgxLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA4MVwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU4MUBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJNYXJrZXRpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMzU4ODMsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI3LTA4LTE3XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIk1hcmtldGluZ1wiLFxuICAgICAgICAgICAgXCJBbmFseXN0XCIsXG4gICAgICAgICAgICBcIlNlbmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA4MVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA4MixcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgODJcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlODJAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiU2FsZXNcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDUyMjE2LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNC0wNC0yM1wiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJTYWxlc1wiLFxuICAgICAgICAgICAgXCJEZXZlbG9wZXJcIixcbiAgICAgICAgICAgIFwiSnVuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDgyXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDgzLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA4M1wiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU4M0Bjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICBcInJvbGVcIjogXCJEZXZlbG9wZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTEwMjkwLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNS0xMS0xNFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICAgICAgXCJEZXZlbG9wZXJcIixcbiAgICAgICAgICAgIFwiSnVuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDgzXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDg0LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA4NFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU4NEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJTYWxlc1wiLFxuICAgICAgICBcInJvbGVcIjogXCJEZXZlbG9wZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTQwNTIyLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNC0wOS0xMVwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJTYWxlc1wiLFxuICAgICAgICAgICAgXCJEZXZlbG9wZXJcIixcbiAgICAgICAgICAgIFwiSnVuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDg0XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDg1LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA4NVwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU4NUBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICBcInJvbGVcIjogXCJTcGVjaWFsaXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDg0NDg1LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNi0wOS0yM1wiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICAgICAgXCJTcGVjaWFsaXN0XCIsXG4gICAgICAgICAgICBcIkp1bmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA4NVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA4NixcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgODZcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlODZAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRmluYW5jZVwiLFxuICAgICAgICBcInJvbGVcIjogXCJEZXNpZ25lclwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMzMwMzIsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI0LTAzLTI3XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkZpbmFuY2VcIixcbiAgICAgICAgICAgIFwiRGVzaWduZXJcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDg2XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDg3LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA4N1wiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU4N0Bjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICBcInJvbGVcIjogXCJBbmFseXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDE0ODg2MSxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjQtMTEtMjFcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRW5naW5lZXJpbmdcIixcbiAgICAgICAgICAgIFwiQW5hbHlzdFwiLFxuICAgICAgICAgICAgXCJTZW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgODdcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogODgsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDg4XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTg4QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIk1hcmtldGluZ1wiLFxuICAgICAgICBcInJvbGVcIjogXCJBbmFseXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDU1NjEzLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyOC0xMS0yMFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJNYXJrZXRpbmdcIixcbiAgICAgICAgICAgIFwiQW5hbHlzdFwiLFxuICAgICAgICAgICAgXCJBc3NvY2lhdGVcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgODhcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogODksXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDg5XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTg5QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIlNwZWNpYWxpc3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogNjEwODEsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI0LTExLTI1XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgICAgICBcIlNwZWNpYWxpc3RcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDg5XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDkwLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA5MFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU5MEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJNYXJrZXRpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDEzNTMyOCxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjQtMDItMDhcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiTWFya2V0aW5nXCIsXG4gICAgICAgICAgICBcIkRldmVsb3BlclwiLFxuICAgICAgICAgICAgXCJTZW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgOTBcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogOTEsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDkxXCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTkxQGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkhSXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRlc2lnbmVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDE0NTE5NixcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjUtMDgtMjdcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiSFJcIixcbiAgICAgICAgICAgIFwiRGVzaWduZXJcIixcbiAgICAgICAgICAgIFwiSnVuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDkxXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDkyLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA5MlwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU5MkBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJIUlwiLFxuICAgICAgICBcInJvbGVcIjogXCJBbmFseXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDE0OTg3NCxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjgtMDgtMDRcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiSFJcIixcbiAgICAgICAgICAgIFwiQW5hbHlzdFwiLFxuICAgICAgICAgICAgXCJMZWFkXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDkyXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDkzLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA5M1wiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU5M0Bjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJIUlwiLFxuICAgICAgICBcInJvbGVcIjogXCJEZXNpZ25lclwiLFxuICAgICAgICBcInNhbGFyeVwiOiA1MTE0OSxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjYtMTItMDhcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiSFJcIixcbiAgICAgICAgICAgIFwiRGVzaWduZXJcIixcbiAgICAgICAgICAgIFwiSnVuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDkzXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDk0LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA5NFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU5NEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJNYXJrZXRpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMjkzNjYsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI1LTA3LTI2XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIk1hcmtldGluZ1wiLFxuICAgICAgICAgICAgXCJBbmFseXN0XCIsXG4gICAgICAgICAgICBcIkxlYWRcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgOTRcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogOTUsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDk1XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTk1QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkZpbmFuY2VcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMzI1ODksXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI1LTEwLTA4XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkZpbmFuY2VcIixcbiAgICAgICAgICAgIFwiQW5hbHlzdFwiLFxuICAgICAgICAgICAgXCJMZWFkXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDk1XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDk2LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA5NlwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU5NkBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJTYWxlc1wiLFxuICAgICAgICBcInJvbGVcIjogXCJEZXZlbG9wZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogNTc5MTcsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI1LTA1LTMxXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIlNhbGVzXCIsXG4gICAgICAgICAgICBcIkRldmVsb3BlclwiLFxuICAgICAgICAgICAgXCJTZW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgOTZcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogOTcsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDk3XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTk3QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkZpbmFuY2VcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiTWFuYWdlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMDc4ODMsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI2LTEyLTAyXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkZpbmFuY2VcIixcbiAgICAgICAgICAgIFwiTWFuYWdlclwiLFxuICAgICAgICAgICAgXCJBc3NvY2lhdGVcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgOTdcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogOTgsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDk4XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTk4QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIlNwZWNpYWxpc3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogOTkwMzcsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI4LTAzLTA4XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgICAgICBcIlNwZWNpYWxpc3RcIixcbiAgICAgICAgICAgIFwiTGVhZFwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA5OFwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA5OSxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgOTlcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlOTlAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiSFJcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDY5MjM4LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNC0wMS0xOFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJIUlwiLFxuICAgICAgICAgICAgXCJEZXZlbG9wZXJcIixcbiAgICAgICAgICAgIFwiSnVuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDk5XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDEwMCxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMTAwXCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTEwMEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJTYWxlc1wiLFxuICAgICAgICBcInJvbGVcIjogXCJBbmFseXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDc1NTkwLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNS0wNS0yMlwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJTYWxlc1wiLFxuICAgICAgICAgICAgXCJBbmFseXN0XCIsXG4gICAgICAgICAgICBcIkp1bmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAxMDBcIlxuICAgICAgICBdXG4gICAgfVxuXVxuXG5jb25zdCBhbGxDb2x1bW5zOiBHcmlkQ29sRGVmPEVtcGxveWVlPltdID0gW1xuICAgIHtcbiAgICAgICAgZmllbGQ6ICdpZCcsXG4gICAgICAgIGhlYWRlck5hbWU6ICdJRCcsXG4gICAgICAgIHdpZHRoOiAyNzAsXG4gICAgICAgIGFsaWduOiAnY2VudGVyJyxcbiAgICAgICAgaGVhZGVyQWxpZ246ICdjZW50ZXInLFxuICAgICAgICBoaWRlYWJsZTogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgICAgZmllbGQ6ICduYW1lJyxcbiAgICAgICAgaGVhZGVyTmFtZTogJ05hbWUnLFxuICAgICAgICB3aWR0aDogMTgwLFxuICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgZWRpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIHtcbiAgICAgICAgZmllbGQ6ICdlbWFpbCcsXG4gICAgICAgIGhlYWRlck5hbWU6ICdFbWFpbCcsXG4gICAgICAgIHdpZHRoOiAyNTAsXG4gICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICBlZGl0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgICBmaWVsZDogJ2RlcGFydG1lbnQnLFxuICAgICAgICBoZWFkZXJOYW1lOiAnRGVwYXJ0bWVudCcsXG4gICAgICAgIHdpZHRoOiAxNTAsXG4gICAgICAgIHNvcnRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGZpZWxkOiAncm9sZScsXG4gICAgICAgIGhlYWRlck5hbWU6ICdSb2xlJyxcbiAgICAgICAgd2lkdGg6IDE1MCxcbiAgICAgICAgc29ydGFibGU6IHRydWVcbiAgICB9LFxuICAgIHtcbiAgICAgICAgZmllbGQ6ICdzYWxhcnknLFxuICAgICAgICBoZWFkZXJOYW1lOiAnU2FsYXJ5JyxcbiAgICAgICAgd2lkdGg6IDEzMCxcbiAgICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICBoZWFkZXJBbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgIGVkaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gYCQke051bWJlcihwYXJhbXMudmFsdWUpLnRvTG9jYWxlU3RyaW5nKCl9YFxuICAgIH0sXG4gICAge1xuICAgICAgICBmaWVsZDogJ2pvaW5EYXRlJyxcbiAgICAgICAgaGVhZGVyTmFtZTogJ0pvaW4gRGF0ZScsXG4gICAgICAgIHdpZHRoOiAxMzAsXG4gICAgICAgIHNvcnRhYmxlOiB0cnVlXG4gICAgfVxuXTtcblxuZXhwb3J0IGZ1bmN0aW9uIERhdGFHcmlkVGVzdCgpIHtcbiAgICBjb25zdCBbcm93cywgc2V0Um93c10gPSB1c2VTdGF0ZTxFbXBsb3llZVtdPihkYXRhKTtcbiAgICBjb25zdCBbc2VsZWN0aW9uTW9kZWwsIHNldFNlbGVjdGlvbk1vZGVsXSA9IHVzZVN0YXRlPEFycmF5PHN0cmluZyB8IG51bWJlcj4+KFtdKTtcbiAgICBjb25zdCBbc29ydE1vZGVsLCBzZXRTb3J0TW9kZWxdID0gdXNlU3RhdGU8QXJyYXk8eyBmaWVsZDogc3RyaW5nOyBzb3J0OiAnYXNjJyB8ICdkZXNjJyB9Pj4oW10pO1xuICAgIGNvbnN0IFtwYWdpbmF0aW9uTW9kZWwsIHNldFBhZ2luYXRpb25Nb2RlbF0gPSB1c2VTdGF0ZSh7IHBhZ2U6IDAsIHBhZ2VTaXplOiAyNSB9KTtcbiAgICBjb25zdCBbcXVpY2tGaWx0ZXJWYWx1ZSwgc2V0UXVpY2tGaWx0ZXJWYWx1ZV0gPSB1c2VTdGF0ZSgnJyk7XG4gICAgY29uc3QgW3Nob3dDb2x1bW5QYW5lbCwgc2V0U2hvd0NvbHVtblBhbmVsXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbdmlzaWJsZUNvbHVtbnMsIHNldFZpc2libGVDb2x1bW5zXSA9IHVzZVN0YXRlPFNldDxzdHJpbmc+PihcbiAgICAgICAgKCkgPT4gbmV3IFNldChhbGxDb2x1bW5zLm1hcChjb2wgPT4gY29sLmZpZWxkKSlcbiAgICApO1xuICAgIGNvbnN0IFtwaW5uZWRDb2x1bW5zLCBzZXRQaW5uZWRDb2x1bW5zXSA9IHVzZVN0YXRlPEdyaWRDb2x1bW5QaW5uaW5nPih7XG4gICAgICAgIGxlZnQ6IFsnaWQnLCAnbmFtZSddLFxuICAgICAgICByaWdodDogW11cbiAgICB9KTtcbiAgICBjb25zdCBbcGlubmVkUm93cywgc2V0UGlubmVkUm93c10gPSB1c2VTdGF0ZTxHcmlkUm93UGlubmluZz4oe1xuICAgICAgICB0b3A6IFsxLCAyXSxcbiAgICAgICAgYm90dG9tOiBbXVxuICAgIH0pO1xuICAgIGNvbnN0IFtleHBhbmRlZERldGFpbFBhbmVsUm93SWRzLCBzZXRFeHBhbmRlZERldGFpbFBhbmVsUm93SWRzXSA9IHVzZVN0YXRlPFNldDxHcmlkUm93SWQ+PihuZXcgU2V0KCkpO1xuICAgIGNvbnN0IFtjb2x1bW5PcmRlciwgc2V0Q29sdW1uT3JkZXJdID0gdXNlU3RhdGU8c3RyaW5nW10+KCgpID0+IGFsbENvbHVtbnMubWFwKGNvbCA9PiBjb2wuZmllbGQpKTtcbiAgICBjb25zdCBbcGluQ2hlY2tib3hDb2x1bW4sIHNldFBpbkNoZWNrYm94Q29sdW1uXSA9IHVzZVN0YXRlKHRydWUpO1xuICAgIGNvbnN0IFtwaW5FeHBhbmRDb2x1bW4sIHNldFBpbkV4cGFuZENvbHVtbl0gPSB1c2VTdGF0ZSh0cnVlKTtcbiAgICBjb25zdCBbcm93UmVvcmRlcmluZywgc2V0Um93UmVvcmRlcmluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW3RyZWVEYXRhLCBzZXRUcmVlRGF0YV0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW3Jvd0dyb3VwaW5nTW9kZWwsIHNldFJvd0dyb3VwaW5nTW9kZWxdID0gdXNlU3RhdGU8R3JpZFJvd0dyb3VwaW5nTW9kZWw+KFtdKTtcbiAgICBjb25zdCBbYWdncmVnYXRpb25Nb2RlbCwgc2V0QWdncmVnYXRpb25Nb2RlbF0gPSB1c2VTdGF0ZTxHcmlkQWdncmVnYXRpb25Nb2RlbD4oe30pO1xuICAgIGNvbnN0IFtkZXRhaWxQYW5lbEVuYWJsZWQsIHNldERldGFpbFBhbmVsRW5hYmxlZF0gPSB1c2VTdGF0ZSh0cnVlKTtcblxuICAgIGNvbnN0IGNvbHVtbnMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGFsbENvbHVtbnMuZmlsdGVyKGNvbCA9PiB2aXNpYmxlQ29sdW1ucy5oYXMoY29sLmZpZWxkKSk7XG4gICAgfSwgW3Zpc2libGVDb2x1bW5zXSk7XG5cbiAgICBjb25zdCBmaWx0ZXJNb2RlbDogR3JpZEZpbHRlck1vZGVsID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghcXVpY2tGaWx0ZXJWYWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgaXRlbXM6IFtdIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGl0ZW1zOiBbXSxcbiAgICAgICAgICAgIHF1aWNrRmlsdGVyVmFsdWVzOiBbcXVpY2tGaWx0ZXJWYWx1ZV1cbiAgICAgICAgfTtcbiAgICB9LCBbcXVpY2tGaWx0ZXJWYWx1ZV0pO1xuXG4gICAgY29uc3QgZmlsdGVyZWRSb3dDb3VudCA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXF1aWNrRmlsdGVyVmFsdWUpIHJldHVybiByb3dzLmxlbmd0aDtcblxuICAgICAgICByZXR1cm4gcm93cy5maWx0ZXIocm93ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNlYXJjaFRlcm0gPSBxdWlja0ZpbHRlclZhbHVlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyhyb3cpLnNvbWUodmFsdWUgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFN0cmluZyh2YWx1ZSkudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXJtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5sZW5ndGg7XG4gICAgfSwgW3Jvd3MsIHF1aWNrRmlsdGVyVmFsdWVdKTtcblxuICAgIGNvbnN0IGhhbmRsZVZpc2liaWxpdHlDaGFuZ2UgPSAoZmllbGQ6IHN0cmluZywgaXNWaXNpYmxlOiBib29sZWFuKSA9PiB7XG4gICAgICAgIHNldFZpc2libGVDb2x1bW5zKHByZXYgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV4dCA9IG5ldyBTZXQocHJldik7XG4gICAgICAgICAgICBpZiAoaXNWaXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgbmV4dC5hZGQoZmllbGQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXh0LmRlbGV0ZShmaWVsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGNvbnN0IGhhbmRsZVNob3dBbGwgPSAoKSA9PiB7XG4gICAgICAgIHNldFZpc2libGVDb2x1bW5zKG5ldyBTZXQoYWxsQ29sdW1ucy5tYXAoY29sID0+IGNvbC5maWVsZCkpKTtcbiAgICB9O1xuXG4gICAgY29uc3QgaGFuZGxlSGlkZUFsbCA9ICgpID0+IHtcblxuICAgICAgICBzZXRWaXNpYmxlQ29sdW1ucyhuZXcgU2V0KGFsbENvbHVtbnMuZmlsdGVyKGNvbCA9PiBjb2wuaGlkZWFibGUgPT09IGZhbHNlKS5tYXAoY29sID0+IGNvbC5maWVsZCkpKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPERvY3NMYXlvdXRcbiAgICAgICAgICAgIHRpdGxlPVwiRnVsbCBGZWF0dXJlIFRlc3RcIlxuICAgICAgICAgICAgZGVzY3JpcHRpb249XCJBIGNvbXByZWhlbnNpdmUgZmVhdHVyZSB0ZXN0IHBhZ2UgZXhlcmNpc2luZyBldmVyeSBtYWpvciBPcGVuR3JpZFggY2FwYWJpbGl0eSBpbiBhIHNpbmdsZSBncmlkIOKAlCB2aXJ0dWFsaXphdGlvbiwgcGlubmluZywgZ3JvdXBpbmcsIGVkaXRpbmcsIGV4cG9ydCwgYW5kIG1vcmUuXCJcbiAgICAgICAgICAgIHNvdXJjZUNvZGU9e3NvdXJjZUNvZGV9XG4gICAgICAgID5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGF0YWdyaWQtdGVzdF9faW5mb1wiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGF0YWdyaWQtdGVzdF9fc3RhdFwiPlxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPlRvdGFsIFJvd3M6PC9zdHJvbmc+IHtyb3dzLmxlbmd0aH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRhdGFncmlkLXRlc3RfX3N0YXRcIj5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5GaWx0ZXJlZDo8L3N0cm9uZz4ge2ZpbHRlcmVkUm93Q291bnR9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkYXRhZ3JpZC10ZXN0X19zdGF0XCI+XG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+U2VsZWN0ZWQ6PC9zdHJvbmc+IHtzZWxlY3Rpb25Nb2RlbC5sZW5ndGh9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkYXRhZ3JpZC10ZXN0X19zdGF0XCI+XG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+VmlzaWJsZSBDb2x1bW5zOjwvc3Ryb25nPiB7dmlzaWJsZUNvbHVtbnMuc2l6ZX0ve2FsbENvbHVtbnMubGVuZ3RofVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGF0YWdyaWQtdGVzdF9fc3RhdFwiPlxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPlBhZ2U6PC9zdHJvbmc+IHtwYWdpbmF0aW9uTW9kZWwucGFnZSArIDF9IG9mIHtNYXRoLmNlaWwoZmlsdGVyZWRSb3dDb3VudCAvIHBhZ2luYXRpb25Nb2RlbC5wYWdlU2l6ZSl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgeyB9XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRhdGFncmlkLXRlc3RfX3Rvb2xiYXJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRhdGFncmlkLXRlc3RfX3Rvb2xiYXItbGVmdFwiPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTaG93Q29sdW1uUGFuZWwoIXNob3dDb2x1bW5QYW5lbCl9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzaG93Q29sdW1uUGFuZWwgPyAnSGlkZScgOiAnU2hvdyd9IENvbHVtbnNcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uIGRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1zZWNvbmRhcnlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0UGlubmVkQ29sdW1ucyh7IGxlZnQ6IFsnaWQnLCAnbmFtZSddLCByaWdodDogW10gfSl9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIPCfk4wgUGluIElEICYgTmFtZVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24gZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXNlY29uZGFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRQaW5uZWRDb2x1bW5zKHsgbGVmdDogW10sIHJpZ2h0OiBbJ3NhbGFyeScsICdqb2luRGF0ZSddIH0pfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICDwn5OMIFBpbiBTYWxhcnkgJiBEYXRlXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbiBkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tc2Vjb25kYXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFBpbm5lZENvbHVtbnMoeyBsZWZ0OiBbXSwgcmlnaHQ6IFtdIH0pfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICDinYwgVW5waW4gQWxsIENvbHVtbnNcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1kaXZpZGVyXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uIGRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1zZWNvbmRhcnlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0Q29sdW1uT3JkZXIoYWxsQ29sdW1ucy5tYXAoY29sID0+IGNvbC5maWVsZCkpfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICDwn5SEIFJlc2V0IENvbHVtbiBPcmRlclxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24gJHtwaW5DaGVja2JveENvbHVtbiA/ICdkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tcHJpbWFyeScgOiAnZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXNlY29uZGFyeSd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFBpbkNoZWNrYm94Q29sdW1uKCFwaW5DaGVja2JveENvbHVtbil9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwaW5DaGVja2JveENvbHVtbiA/ICfwn5STIFVucGluIENoZWNrYm94JyA6ICfwn5SSIFBpbiBDaGVja2JveCd9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbiAke3BpbkV4cGFuZENvbHVtbiA/ICdkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tcHJpbWFyeScgOiAnZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXNlY29uZGFyeSd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFBpbkV4cGFuZENvbHVtbighcGluRXhwYW5kQ29sdW1uKX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge3BpbkV4cGFuZENvbHVtbiA/ICfwn5STIFVucGluIEV4cGFuZCcgOiAn8J+UkiBQaW4gRXhwYW5kJ31cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uIGRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1zZWNvbmRhcnlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0UGlubmVkUm93cyh7IHRvcDogWzEsIDJdLCBib3R0b206IFtdIH0pfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICDwn5OMIFBpbiBGaXJzdCAyIFJvd3MgKFRvcClcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uIGRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1zZWNvbmRhcnlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0UGlubmVkUm93cyh7IHRvcDogW10sIGJvdHRvbTogWzk5LCAxMDBdIH0pfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICDwn5OMIFBpbiBMYXN0IDIgUm93cyAoQm90dG9tKVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24gZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXNlY29uZGFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRQaW5uZWRSb3dzKHsgdG9wOiBbXSwgYm90dG9tOiBbXSB9KX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAg4p2MIFVucGluIEFsbCBSb3dzXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRhdGFncmlkLXRlc3RfX3Rvb2xiYXItZGl2aWRlclwiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbiAke3Jvd0dyb3VwaW5nTW9kZWwubGVuZ3RoID4gMCA/ICdkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tcHJpbWFyeScgOiAnZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXNlY29uZGFyeSd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocm93R3JvdXBpbmdNb2RlbC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFJvd0dyb3VwaW5nTW9kZWwoW10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRBZ2dyZWdhdGlvbk1vZGVsKHt9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRSb3dHcm91cGluZ01vZGVsKFsnZGVwYXJ0bWVudCcsICdyb2xlJ10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRBZ2dyZWdhdGlvbk1vZGVsKHsgc2FsYXJ5OiAnc3VtJywgaWQ6ICdjb3VudCcgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRyZWVEYXRhKSBzZXRUcmVlRGF0YShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7cm93R3JvdXBpbmdNb2RlbC5sZW5ndGggPiAwID8gJ/CfmqsgRGlzYWJsZSBHcm91cGluZycgOiAn8J+TkSBHcm91cCBieSBEZXB0ID4gUm9sZSd9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbiAke3RyZWVEYXRhID8gJ2RhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1wcmltYXJ5JyA6ICdkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tc2Vjb25kYXJ5J31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRyZWVEYXRhKCF0cmVlRGF0YSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRyZWVEYXRhKSBzZXRSb3dHcm91cGluZ01vZGVsKFtdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0cmVlRGF0YSA/ICfwn4yzIERpc2FibGUgVHJlZSBEYXRhJyA6ICfwn4yzIEVuYWJsZSBUcmVlIERhdGEnfVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkYXRhZ3JpZC10ZXN0X190b29sYmFyLWRpdmlkZXJcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24gJHtyb3dSZW9yZGVyaW5nID8gJ2RhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1wcmltYXJ5JyA6ICdkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tc2Vjb25kYXJ5J31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcm93UmVvcmRlcmluZykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFNvcnRNb2RlbChbXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFBpbm5lZFJvd3MoeyB0b3A6IFtdLCBib3R0b206IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRSb3dSZW9yZGVyaW5nKCFyb3dSZW9yZGVyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtyb3dSZW9yZGVyaW5nID8gJ/Cfm5EgRGlzYWJsZSBSb3cgUmVvcmRlcicgOiAn4oaV77iPIEVuYWJsZSBSb3cgUmVvcmRlcid9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRhdGFncmlkLXRlc3RfX3Rvb2xiYXItZGl2aWRlclwiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbiAke2RldGFpbFBhbmVsRW5hYmxlZCA/ICdkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tcHJpbWFyeScgOiAnZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXNlY29uZGFyeSd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXREZXRhaWxQYW5lbEVuYWJsZWQoIWRldGFpbFBhbmVsRW5hYmxlZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGV0YWlsUGFuZWxFbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEV4cGFuZGVkRGV0YWlsUGFuZWxSb3dJZHMobmV3IFNldCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7ZGV0YWlsUGFuZWxFbmFibGVkID8gJ/Cfk4sgRGlzYWJsZSBEZXRhaWwgUGFuZWwnIDogJ/Cfk4sgRW5hYmxlIERldGFpbCBQYW5lbCd9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxRdWlja0ZpbHRlclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cXVpY2tGaWx0ZXJWYWx1ZX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3NldFF1aWNrRmlsdGVyVmFsdWV9XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU2VhcmNoIGFjcm9zcyBhbGwgY29sdW1ucy4uLlwiXG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICB7IH1cbiAgICAgICAgICAgIHtzaG93Q29sdW1uUGFuZWwgJiYgKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGF0YWdyaWQtdGVzdF9fY29sdW1uLXBhbmVsXCI+XG4gICAgICAgICAgICAgICAgICAgIDxDb2x1bW5WaXNpYmlsaXR5UGFuZWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbnM9e2FsbENvbHVtbnN9XG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlQ29sdW1ucz17dmlzaWJsZUNvbHVtbnN9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblZpc2liaWxpdHlDaGFuZ2U9e2hhbmRsZVZpc2liaWxpdHlDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblNob3dBbGw9e2hhbmRsZVNob3dBbGx9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkhpZGVBbGw9e2hhbmRsZUhpZGVBbGx9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApfVxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRhdGFncmlkLXRlc3RfX2dyaWRcIj5cbiAgICAgICAgICAgICAgICA8RGF0YUdyaWRcbiAgICAgICAgICAgICAgICAgICAgcm93cz17cm93c31cbiAgICAgICAgICAgICAgICAgICAgY29sdW1ucz17Y29sdW1uc31cbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PXs2MDB9XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrYm94U2VsZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIHJvd1NlbGVjdGlvbk1vZGVsPXtzZWxlY3Rpb25Nb2RlbH1cbiAgICAgICAgICAgICAgICAgICAgb25Sb3dTZWxlY3Rpb25Nb2RlbENoYW5nZT17c2V0U2VsZWN0aW9uTW9kZWx9XG4gICAgICAgICAgICAgICAgICAgIHNvcnRNb2RlbD17c29ydE1vZGVsfVxuICAgICAgICAgICAgICAgICAgICBvblNvcnRNb2RlbENoYW5nZT17c2V0U29ydE1vZGVsfVxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJNb2RlbD17ZmlsdGVyTW9kZWx9XG4gICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb25cbiAgICAgICAgICAgICAgICAgICAgcGFnaW5hdGlvbk1vZGVsPXtwYWdpbmF0aW9uTW9kZWx9XG4gICAgICAgICAgICAgICAgICAgIG9uUGFnaW5hdGlvbk1vZGVsQ2hhbmdlPXtzZXRQYWdpbmF0aW9uTW9kZWx9XG4gICAgICAgICAgICAgICAgICAgIHBhZ2VTaXplT3B0aW9ucz17WzEwLCAyNSwgNTAsIDEwMF19XG4gICAgICAgICAgICAgICAgICAgIHBpbm5lZENvbHVtbnM9e3Bpbm5lZENvbHVtbnN9XG4gICAgICAgICAgICAgICAgICAgIG9uUGlubmVkQ29sdW1uc0NoYW5nZT17c2V0UGlubmVkQ29sdW1uc31cbiAgICAgICAgICAgICAgICAgICAgcGlubmVkUm93cz17cGlubmVkUm93c31cbiAgICAgICAgICAgICAgICAgICAgb25Sb3dDbGljaz17KHBhcmFtcykgPT4gY29uc29sZS5sb2coJ1JvdyBjbGlja2VkOicsIHBhcmFtcy5yb3cpfVxuICAgICAgICAgICAgICAgICAgICBvbkNlbGxDbGljaz17KHBhcmFtcykgPT4gY29uc29sZS5sb2coJ0NlbGwgY2xpY2tlZDonLCBwYXJhbXMucm93LCBwYXJhbXMuZmllbGQpfVxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzUm93VXBkYXRlPXsobmV3Um93KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUm93IFVwZGF0ZWQ6JywgbmV3Um93KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0Um93cyhwcmV2ID0+IHByZXYubWFwKHIgPT4gci5pZCA9PT0gbmV3Um93LmlkID8gKG5ld1JvdyBhcyBFbXBsb3llZSkgOiByKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3Um93O1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICBvblByb2Nlc3NSb3dVcGRhdGVFcnJvcj17KGVycm9yKSA9PiBjb25zb2xlLmVycm9yKCdSb3cgVXBkYXRlIEVycm9yOicsIGVycm9yKX1cblxuICAgICAgICAgICAgICAgICAgICBnZXREZXRhaWxQYW5lbENvbnRlbnQ9e2RldGFpbFBhbmVsRW5hYmxlZCA/IChwYXJhbXMpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzE2cHgnLCBiYWNrZ3JvdW5kOiAnI2Y1ZjVmNScgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGg0IHN0eWxlPXt7IG1hcmdpbjogJzAgMCAxMnB4IDAnIH19PkVtcGxveWVlIERldGFpbHM6IHtwYXJhbXMucm93Lm5hbWV9PC9oND5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ3JpZFRlbXBsYXRlQ29sdW1uczogJzFmciAxZnInLCBnYXA6ICc4cHgnIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PjxzdHJvbmc+SUQ6PC9zdHJvbmc+IHtwYXJhbXMucm93LmlkfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PjxzdHJvbmc+RW1haWw6PC9zdHJvbmc+IHtwYXJhbXMucm93LmVtYWlsfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PjxzdHJvbmc+RGVwYXJ0bWVudDo8L3N0cm9uZz4ge3BhcmFtcy5yb3cuZGVwYXJ0bWVudH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj48c3Ryb25nPlJvbGU6PC9zdHJvbmc+IHtwYXJhbXMucm93LnJvbGV9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+PHN0cm9uZz5TYWxhcnk6PC9zdHJvbmc+ICR7cGFyYW1zLnJvdy5zYWxhcnkudG9Mb2NhbGVTdHJpbmcoKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj48c3Ryb25nPkpvaW4gRGF0ZTo8L3N0cm9uZz4ge3BhcmFtcy5yb3cuam9pbkRhdGV9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgZ2V0RGV0YWlsUGFuZWxIZWlnaHQ9e2RldGFpbFBhbmVsRW5hYmxlZCA/ICgpID0+IDE1MCA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsUGFuZWxFeHBhbmRlZFJvd0lkcz17ZGV0YWlsUGFuZWxFbmFibGVkID8gZXhwYW5kZWREZXRhaWxQYW5lbFJvd0lkcyA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgb25EZXRhaWxQYW5lbEV4cGFuZGVkUm93SWRzQ2hhbmdlPXtkZXRhaWxQYW5lbEVuYWJsZWQgPyBzZXRFeHBhbmRlZERldGFpbFBhbmVsUm93SWRzIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgICAgICBwaW5DaGVja2JveENvbHVtbj17cGluQ2hlY2tib3hDb2x1bW59XG4gICAgICAgICAgICAgICAgICAgIHBpbkV4cGFuZENvbHVtbj17cGluRXhwYW5kQ29sdW1ufVxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5PcmRlcj17Y29sdW1uT3JkZXJ9XG4gICAgICAgICAgICAgICAgICAgIG9uQ29sdW1uT3JkZXJNb2RlbENoYW5nZT17c2V0Q29sdW1uT3JkZXJ9XG4gICAgICAgICAgICAgICAgICAgIG9uQ29sdW1uT3JkZXJDaGFuZ2U9eyhwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb2x1bW4gcmVvcmRlcmVkOicsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgICAgIH19XG5cbiAgICAgICAgICAgICAgICAgICAgcm93R3JvdXBpbmdNb2RlbD17cm93R3JvdXBpbmdNb2RlbH1cbiAgICAgICAgICAgICAgICAgICAgYWdncmVnYXRpb25Nb2RlbD17YWdncmVnYXRpb25Nb2RlbH1cbiAgICAgICAgICAgICAgICAgICAgb25BZ2dyZWdhdGlvbk1vZGVsQ2hhbmdlPXtzZXRBZ2dyZWdhdGlvbk1vZGVsfVxuXG4gICAgICAgICAgICAgICAgICAgIHJvd1Jlb3JkZXJpbmc9e3Jvd1Jlb3JkZXJpbmd9XG4gICAgICAgICAgICAgICAgICAgIG9uUm93T3JkZXJDaGFuZ2U9eyhwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9sZEluZGV4IC8gdGFyZ2V0SW5kZXggYXJlIHBvc2l0aW9ucyBpbiBgcm93c2AsIHdoYXRldmVyIHRoZSBwYWdlLCBzb3J0IG9yIGZpbHRlci5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgb2xkSW5kZXgsIHRhcmdldEluZGV4IH0gPSBwYXJhbXM7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUm93IHJlb3JkZXJlZDonLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0Um93cyhwcmV2ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdSb3dzID0gWy4uLnByZXZdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IFttb3ZlZF0gPSBuZXdSb3dzLnNwbGljZShvbGRJbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Um93cy5zcGxpY2UodGFyZ2V0SW5kZXgsIDAsIG1vdmVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3Um93cztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8L0RvY3NMYXlvdXQ+XG4gICAgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgRGF0YUdyaWRUZXN0O1xuIl0sIm5hbWVzIjpbInNvdXJjZUNvZGUiLCJkYXRhIiwiYWxsQ29sdW1ucyIsInBhcmFtcyIsIkRhdGFHcmlkVGVzdCIsInJvd3MiLCJzZXRSb3dzIiwidXNlU3RhdGUiLCJzZWxlY3Rpb25Nb2RlbCIsInNldFNlbGVjdGlvbk1vZGVsIiwic29ydE1vZGVsIiwic2V0U29ydE1vZGVsIiwicGFnaW5hdGlvbk1vZGVsIiwic2V0UGFnaW5hdGlvbk1vZGVsIiwicXVpY2tGaWx0ZXJWYWx1ZSIsInNldFF1aWNrRmlsdGVyVmFsdWUiLCJzaG93Q29sdW1uUGFuZWwiLCJzZXRTaG93Q29sdW1uUGFuZWwiLCJ2aXNpYmxlQ29sdW1ucyIsInNldFZpc2libGVDb2x1bW5zIiwiY29sIiwicGlubmVkQ29sdW1ucyIsInNldFBpbm5lZENvbHVtbnMiLCJwaW5uZWRSb3dzIiwic2V0UGlubmVkUm93cyIsImV4cGFuZGVkRGV0YWlsUGFuZWxSb3dJZHMiLCJzZXRFeHBhbmRlZERldGFpbFBhbmVsUm93SWRzIiwiY29sdW1uT3JkZXIiLCJzZXRDb2x1bW5PcmRlciIsInBpbkNoZWNrYm94Q29sdW1uIiwic2V0UGluQ2hlY2tib3hDb2x1bW4iLCJwaW5FeHBhbmRDb2x1bW4iLCJzZXRQaW5FeHBhbmRDb2x1bW4iLCJyb3dSZW9yZGVyaW5nIiwic2V0Um93UmVvcmRlcmluZyIsInRyZWVEYXRhIiwic2V0VHJlZURhdGEiLCJyb3dHcm91cGluZ01vZGVsIiwic2V0Um93R3JvdXBpbmdNb2RlbCIsImFnZ3JlZ2F0aW9uTW9kZWwiLCJzZXRBZ2dyZWdhdGlvbk1vZGVsIiwiZGV0YWlsUGFuZWxFbmFibGVkIiwic2V0RGV0YWlsUGFuZWxFbmFibGVkIiwiY29sdW1ucyIsInVzZU1lbW8iLCJmaWx0ZXJNb2RlbCIsImZpbHRlcmVkUm93Q291bnQiLCJyb3ciLCJzZWFyY2hUZXJtIiwidmFsdWUiLCJoYW5kbGVWaXNpYmlsaXR5Q2hhbmdlIiwiZmllbGQiLCJpc1Zpc2libGUiLCJwcmV2IiwibmV4dCIsImhhbmRsZVNob3dBbGwiLCJoYW5kbGVIaWRlQWxsIiwianN4cyIsIkRvY3NMYXlvdXQiLCJqc3giLCJRdWlja0ZpbHRlciIsIkNvbHVtblZpc2liaWxpdHlQYW5lbCIsIkRhdGFHcmlkIiwibmV3Um93IiwiciIsImVycm9yIiwib2xkSW5kZXgiLCJ0YXJnZXRJbmRleCIsIm5ld1Jvd3MiLCJtb3ZlZCJdLCJtYXBwaW5ncyI6IjhKQUFBLE1BQUFBLEdBQWU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFB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
