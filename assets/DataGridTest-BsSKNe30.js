import{r as o,j as e}from"./vendor-react-LmGMyLnN.js";import{Q as ee,C as ae,D as oe}from"./opengridx-Br5MWVNc.js";import{D as ne}from"./DocsLayout-BoGj89NG.js";const te=`

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
        valueFormatter: (params) => \`$\${params.value.toLocaleString()}\`
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
                    onPinnedRowsChange={setPinnedRows}
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
                    onColumnOrderChange={(params) => {
                        const { oldIndex, targetIndex } = params;
                        setColumnOrder(prev => {
                            const newOrder = [...prev];
                            const [moved] = newOrder.splice(oldIndex, 1);
                            newOrder.splice(targetIndex, 0, moved);
                            return newOrder;
                        });
                        console.log('Column reordered:', params);
                    }}

                    rowGroupingModel={rowGroupingModel}
                    onRowGroupingModelChange={setRowGroupingModel}
                    aggregationModel={aggregationModel}
                    onAggregationModelChange={setAggregationModel}

                    rowReordering={rowReordering}
                    onRowOrderChange={(params) => {
                        const { oldIndex, targetIndex } = params;
                        console.log('Row reordered:', params);

                        if (sortModel.length > 0 || quickFilterValue) {
                            alert('Please clear sorting and filtering to test row reordering.');
                            return;
                        }

                        const pageOffset = paginationModel.page * paginationModel.pageSize;
                        const realOldIndex = pageOffset + oldIndex;
                        const realTargetIndex = pageOffset + targetIndex;

                        setRows(prev => {
                            const newRows = [...prev];
                            const [moved] = newRows.splice(realOldIndex, 1);
                            newRows.splice(realTargetIndex, 0, moved);
                            return newRows;
                        });
                    }}
                />
            </div>

        </DocsLayout>
    );
}

export default DataGridTest;
`,le=[{id:1,name:"Employee 1",email:"employee1@company.com",department:"Finance",role:"Designer",salary:148417,joinDate:"2028-06-08",path:["Finance","Designer","Lead","Employee 1"]},{id:2,name:"Employee 2",email:"employee2@company.com",department:"Engineering",role:"Analyst",salary:121903,joinDate:"2025-06-02",path:["Engineering","Analyst","Lead","Employee 2"]},{id:3,name:"Employee 3",email:"employee3@company.com",department:"Engineering",role:"Designer",salary:88214,joinDate:"2028-03-11",path:["Engineering","Designer","Associate","Employee 3"]},{id:4,name:"Employee 4",email:"employee4@company.com",department:"Finance",role:"Developer",salary:74691,joinDate:"2026-08-18",path:["Finance","Developer","Junior","Employee 4"]},{id:5,name:"Employee 5",email:"employee5@company.com",department:"Sales",role:"Manager",salary:86243,joinDate:"2025-07-08",path:["Sales","Manager","Associate","Employee 5"]},{id:6,name:"Employee 6",email:"employee6@company.com",department:"Finance",role:"Analyst",salary:68299,joinDate:"2024-08-31",path:["Finance","Analyst","Associate","Employee 6"]},{id:7,name:"Employee 7",email:"employee7@company.com",department:"Engineering",role:"Developer",salary:105841,joinDate:"2024-10-04",path:["Engineering","Developer","Associate","Employee 7"]},{id:8,name:"Employee 8",email:"employee8@company.com",department:"Sales",role:"Developer",salary:120908,joinDate:"2027-12-02",path:["Sales","Developer","Senior","Employee 8"]},{id:9,name:"Employee 9",email:"employee9@company.com",department:"Sales",role:"Designer",salary:139259,joinDate:"2024-05-25",path:["Sales","Designer","Junior","Employee 9"]},{id:10,name:"Employee 10",email:"employee10@company.com",department:"Finance",role:"Analyst",salary:136236,joinDate:"2024-02-23",path:["Finance","Analyst","Senior","Employee 10"]},{id:11,name:"Employee 11",email:"employee11@company.com",department:"Finance",role:"Developer",salary:141366,joinDate:"2026-10-03",path:["Finance","Developer","Lead","Employee 11"]},{id:12,name:"Employee 12",email:"employee12@company.com",department:"HR",role:"Manager",salary:145726,joinDate:"2025-11-22",path:["HR","Manager","Senior","Employee 12"]},{id:13,name:"Employee 13",email:"employee13@company.com",department:"Finance",role:"Developer",salary:56614,joinDate:"2024-08-14",path:["Finance","Developer","Associate","Employee 13"]},{id:14,name:"Employee 14",email:"employee14@company.com",department:"HR",role:"Designer",salary:149692,joinDate:"2026-09-19",path:["HR","Designer","Lead","Employee 14"]},{id:15,name:"Employee 15",email:"employee15@company.com",department:"Sales",role:"Developer",salary:75405,joinDate:"2025-06-02",path:["Sales","Developer","Junior","Employee 15"]},{id:16,name:"Employee 16",email:"employee16@company.com",department:"Engineering",role:"Designer",salary:142167,joinDate:"2028-02-08",path:["Engineering","Designer","Junior","Employee 16"]},{id:17,name:"Employee 17",email:"employee17@company.com",department:"HR",role:"Manager",salary:147691,joinDate:"2024-02-20",path:["HR","Manager","Junior","Employee 17"]},{id:18,name:"Employee 18",email:"employee18@company.com",department:"Marketing",role:"Manager",salary:108042,joinDate:"2028-05-14",path:["Marketing","Manager","Associate","Employee 18"]},{id:19,name:"Employee 19",email:"employee19@company.com",department:"Finance",role:"Manager",salary:116548,joinDate:"2027-05-22",path:["Finance","Manager","Senior","Employee 19"]},{id:20,name:"Employee 20",email:"employee20@company.com",department:"Engineering",role:"Designer",salary:143791,joinDate:"2028-08-06",path:["Engineering","Designer","Associate","Employee 20"]},{id:21,name:"Employee 21",email:"employee21@company.com",department:"HR",role:"Specialist",salary:148217,joinDate:"2027-04-30",path:["HR","Specialist","Associate","Employee 21"]},{id:22,name:"Employee 22",email:"employee22@company.com",department:"Marketing",role:"Developer",salary:101639,joinDate:"2025-10-08",path:["Marketing","Developer","Associate","Employee 22"]},{id:23,name:"Employee 23",email:"employee23@company.com",department:"Finance",role:"Developer",salary:146111,joinDate:"2027-03-13",path:["Finance","Developer","Associate","Employee 23"]},{id:24,name:"Employee 24",email:"employee24@company.com",department:"Marketing",role:"Developer",salary:74704,joinDate:"2025-04-03",path:["Marketing","Developer","Senior","Employee 24"]},{id:25,name:"Employee 25",email:"employee25@company.com",department:"Sales",role:"Manager",salary:77189,joinDate:"2028-03-04",path:["Sales","Manager","Associate","Employee 25"]},{id:26,name:"Employee 26",email:"employee26@company.com",department:"Engineering",role:"Manager",salary:113149,joinDate:"2026-10-08",path:["Engineering","Manager","Lead","Employee 26"]},{id:27,name:"Employee 27",email:"employee27@company.com",department:"Finance",role:"Designer",salary:91266,joinDate:"2026-02-10",path:["Finance","Designer","Junior","Employee 27"]},{id:28,name:"Employee 28",email:"employee28@company.com",department:"HR",role:"Manager",salary:94478,joinDate:"2027-03-16",path:["HR","Manager","Associate","Employee 28"]},{id:29,name:"Employee 29",email:"employee29@company.com",department:"HR",role:"Designer",salary:92084,joinDate:"2025-12-27",path:["HR","Designer","Senior","Employee 29"]},{id:30,name:"Employee 30",email:"employee30@company.com",department:"Sales",role:"Designer",salary:50449,joinDate:"2026-02-10",path:["Sales","Designer","Lead","Employee 30"]},{id:31,name:"Employee 31",email:"employee31@company.com",department:"Finance",role:"Specialist",salary:90065,joinDate:"2025-09-24",path:["Finance","Specialist","Lead","Employee 31"]},{id:32,name:"Employee 32",email:"employee32@company.com",department:"Marketing",role:"Analyst",salary:91046,joinDate:"2024-12-11",path:["Marketing","Analyst","Lead","Employee 32"]},{id:33,name:"Employee 33",email:"employee33@company.com",department:"Finance",role:"Designer",salary:108182,joinDate:"2024-04-02",path:["Finance","Designer","Junior","Employee 33"]},{id:34,name:"Employee 34",email:"employee34@company.com",department:"Finance",role:"Analyst",salary:81580,joinDate:"2027-08-06",path:["Finance","Analyst","Senior","Employee 34"]},{id:35,name:"Employee 35",email:"employee35@company.com",department:"Sales",role:"Specialist",salary:123659,joinDate:"2025-09-14",path:["Sales","Specialist","Lead","Employee 35"]},{id:36,name:"Employee 36",email:"employee36@company.com",department:"HR",role:"Specialist",salary:149410,joinDate:"2028-03-06",path:["HR","Specialist","Associate","Employee 36"]},{id:37,name:"Employee 37",email:"employee37@company.com",department:"Engineering",role:"Analyst",salary:58984,joinDate:"2024-03-03",path:["Engineering","Analyst","Associate","Employee 37"]},{id:38,name:"Employee 38",email:"employee38@company.com",department:"Engineering",role:"Designer",salary:67732,joinDate:"2027-05-12",path:["Engineering","Designer","Associate","Employee 38"]},{id:39,name:"Employee 39",email:"employee39@company.com",department:"Finance",role:"Analyst",salary:63705,joinDate:"2028-01-27",path:["Finance","Analyst","Associate","Employee 39"]},{id:40,name:"Employee 40",email:"employee40@company.com",department:"Marketing",role:"Manager",salary:98048,joinDate:"2026-11-27",path:["Marketing","Manager","Junior","Employee 40"]},{id:41,name:"Employee 41",email:"employee41@company.com",department:"Finance",role:"Specialist",salary:96306,joinDate:"2025-07-18",path:["Finance","Specialist","Junior","Employee 41"]},{id:42,name:"Employee 42",email:"employee42@company.com",department:"Engineering",role:"Developer",salary:142370,joinDate:"2027-08-04",path:["Engineering","Developer","Associate","Employee 42"]},{id:43,name:"Employee 43",email:"employee43@company.com",department:"Sales",role:"Manager",salary:134447,joinDate:"2025-04-18",path:["Sales","Manager","Senior","Employee 43"]},{id:44,name:"Employee 44",email:"employee44@company.com",department:"Marketing",role:"Developer",salary:89800,joinDate:"2026-04-27",path:["Marketing","Developer","Lead","Employee 44"]},{id:45,name:"Employee 45",email:"employee45@company.com",department:"Marketing",role:"Designer",salary:96086,joinDate:"2024-05-13",path:["Marketing","Designer","Junior","Employee 45"]},{id:46,name:"Employee 46",email:"employee46@company.com",department:"Sales",role:"Manager",salary:115561,joinDate:"2025-07-05",path:["Sales","Manager","Associate","Employee 46"]},{id:47,name:"Employee 47",email:"employee47@company.com",department:"Marketing",role:"Analyst",salary:77414,joinDate:"2026-02-15",path:["Marketing","Analyst","Associate","Employee 47"]},{id:48,name:"Employee 48",email:"employee48@company.com",department:"Finance",role:"Analyst",salary:50545,joinDate:"2026-12-24",path:["Finance","Analyst","Associate","Employee 48"]},{id:49,name:"Employee 49",email:"employee49@company.com",department:"Marketing",role:"Manager",salary:61267,joinDate:"2028-04-01",path:["Marketing","Manager","Associate","Employee 49"]},{id:50,name:"Employee 50",email:"employee50@company.com",department:"HR",role:"Designer",salary:130775,joinDate:"2025-05-20",path:["HR","Designer","Junior","Employee 50"]},{id:51,name:"Employee 51",email:"employee51@company.com",department:"Finance",role:"Analyst",salary:61291,joinDate:"2026-10-06",path:["Finance","Analyst","Lead","Employee 51"]},{id:52,name:"Employee 52",email:"employee52@company.com",department:"Finance",role:"Developer",salary:121744,joinDate:"2024-07-12",path:["Finance","Developer","Lead","Employee 52"]},{id:53,name:"Employee 53",email:"employee53@company.com",department:"Engineering",role:"Analyst",salary:108492,joinDate:"2025-05-04",path:["Engineering","Analyst","Associate","Employee 53"]},{id:54,name:"Employee 54",email:"employee54@company.com",department:"Engineering",role:"Analyst",salary:72189,joinDate:"2028-10-06",path:["Engineering","Analyst","Lead","Employee 54"]},{id:55,name:"Employee 55",email:"employee55@company.com",department:"Sales",role:"Designer",salary:105328,joinDate:"2027-05-07",path:["Sales","Designer","Senior","Employee 55"]},{id:56,name:"Employee 56",email:"employee56@company.com",department:"HR",role:"Designer",salary:102771,joinDate:"2027-05-20",path:["HR","Designer","Senior","Employee 56"]},{id:57,name:"Employee 57",email:"employee57@company.com",department:"HR",role:"Developer",salary:140085,joinDate:"2028-07-05",path:["HR","Developer","Junior","Employee 57"]},{id:58,name:"Employee 58",email:"employee58@company.com",department:"Finance",role:"Specialist",salary:79502,joinDate:"2024-01-08",path:["Finance","Specialist","Junior","Employee 58"]},{id:59,name:"Employee 59",email:"employee59@company.com",department:"Finance",role:"Analyst",salary:110624,joinDate:"2024-01-31",path:["Finance","Analyst","Associate","Employee 59"]},{id:60,name:"Employee 60",email:"employee60@company.com",department:"Finance",role:"Designer",salary:113318,joinDate:"2024-08-25",path:["Finance","Designer","Associate","Employee 60"]},{id:61,name:"Employee 61",email:"employee61@company.com",department:"Sales",role:"Specialist",salary:134162,joinDate:"2026-11-18",path:["Sales","Specialist","Junior","Employee 61"]},{id:62,name:"Employee 62",email:"employee62@company.com",department:"Marketing",role:"Developer",salary:67134,joinDate:"2027-11-24",path:["Marketing","Developer","Associate","Employee 62"]},{id:63,name:"Employee 63",email:"employee63@company.com",department:"HR",role:"Designer",salary:90005,joinDate:"2025-06-04",path:["HR","Designer","Senior","Employee 63"]},{id:64,name:"Employee 64",email:"employee64@company.com",department:"Finance",role:"Analyst",salary:77806,joinDate:"2027-07-27",path:["Finance","Analyst","Lead","Employee 64"]},{id:65,name:"Employee 65",email:"employee65@company.com",department:"Sales",role:"Analyst",salary:51753,joinDate:"2028-09-21",path:["Sales","Analyst","Lead","Employee 65"]},{id:66,name:"Employee 66",email:"employee66@company.com",department:"Marketing",role:"Specialist",salary:144569,joinDate:"2028-01-19",path:["Marketing","Specialist","Junior","Employee 66"]},{id:67,name:"Employee 67",email:"employee67@company.com",department:"Engineering",role:"Manager",salary:64548,joinDate:"2027-03-14",path:["Engineering","Manager","Associate","Employee 67"]},{id:68,name:"Employee 68",email:"employee68@company.com",department:"Marketing",role:"Specialist",salary:86659,joinDate:"2027-11-27",path:["Marketing","Specialist","Associate","Employee 68"]},{id:69,name:"Employee 69",email:"employee69@company.com",department:"HR",role:"Specialist",salary:85680,joinDate:"2027-06-23",path:["HR","Specialist","Junior","Employee 69"]},{id:70,name:"Employee 70",email:"employee70@company.com",department:"HR",role:"Analyst",salary:139233,joinDate:"2027-07-17",path:["HR","Analyst","Associate","Employee 70"]},{id:71,name:"Employee 71",email:"employee71@company.com",department:"HR",role:"Manager",salary:80112,joinDate:"2026-12-06",path:["HR","Manager","Associate","Employee 71"]},{id:72,name:"Employee 72",email:"employee72@company.com",department:"Sales",role:"Specialist",salary:54732,joinDate:"2024-08-23",path:["Sales","Specialist","Senior","Employee 72"]},{id:73,name:"Employee 73",email:"employee73@company.com",department:"HR",role:"Analyst",salary:125127,joinDate:"2028-01-08",path:["HR","Analyst","Senior","Employee 73"]},{id:74,name:"Employee 74",email:"employee74@company.com",department:"Sales",role:"Analyst",salary:120322,joinDate:"2028-06-19",path:["Sales","Analyst","Lead","Employee 74"]},{id:75,name:"Employee 75",email:"employee75@company.com",department:"Marketing",role:"Manager",salary:95789,joinDate:"2027-10-23",path:["Marketing","Manager","Associate","Employee 75"]},{id:76,name:"Employee 76",email:"employee76@company.com",department:"Finance",role:"Manager",salary:121808,joinDate:"2027-10-27",path:["Finance","Manager","Junior","Employee 76"]},{id:77,name:"Employee 77",email:"employee77@company.com",department:"Sales",role:"Specialist",salary:108933,joinDate:"2025-02-05",path:["Sales","Specialist","Senior","Employee 77"]},{id:78,name:"Employee 78",email:"employee78@company.com",department:"Finance",role:"Manager",salary:50946,joinDate:"2026-11-20",path:["Finance","Manager","Senior","Employee 78"]},{id:79,name:"Employee 79",email:"employee79@company.com",department:"Marketing",role:"Manager",salary:100965,joinDate:"2024-04-21",path:["Marketing","Manager","Lead","Employee 79"]},{id:80,name:"Employee 80",email:"employee80@company.com",department:"Marketing",role:"Analyst",salary:54548,joinDate:"2026-04-05",path:["Marketing","Analyst","Junior","Employee 80"]},{id:81,name:"Employee 81",email:"employee81@company.com",department:"Marketing",role:"Analyst",salary:135883,joinDate:"2027-08-17",path:["Marketing","Analyst","Senior","Employee 81"]},{id:82,name:"Employee 82",email:"employee82@company.com",department:"Sales",role:"Developer",salary:52216,joinDate:"2024-04-23",path:["Sales","Developer","Junior","Employee 82"]},{id:83,name:"Employee 83",email:"employee83@company.com",department:"Engineering",role:"Developer",salary:110290,joinDate:"2025-11-14",path:["Engineering","Developer","Junior","Employee 83"]},{id:84,name:"Employee 84",email:"employee84@company.com",department:"Sales",role:"Developer",salary:140522,joinDate:"2024-09-11",path:["Sales","Developer","Junior","Employee 84"]},{id:85,name:"Employee 85",email:"employee85@company.com",department:"Engineering",role:"Specialist",salary:84485,joinDate:"2026-09-23",path:["Engineering","Specialist","Junior","Employee 85"]},{id:86,name:"Employee 86",email:"employee86@company.com",department:"Finance",role:"Designer",salary:133032,joinDate:"2024-03-27",path:["Finance","Designer","Associate","Employee 86"]},{id:87,name:"Employee 87",email:"employee87@company.com",department:"Engineering",role:"Analyst",salary:148861,joinDate:"2024-11-21",path:["Engineering","Analyst","Senior","Employee 87"]},{id:88,name:"Employee 88",email:"employee88@company.com",department:"Marketing",role:"Analyst",salary:55613,joinDate:"2028-11-20",path:["Marketing","Analyst","Associate","Employee 88"]},{id:89,name:"Employee 89",email:"employee89@company.com",department:"Engineering",role:"Specialist",salary:61081,joinDate:"2024-11-25",path:["Engineering","Specialist","Associate","Employee 89"]},{id:90,name:"Employee 90",email:"employee90@company.com",department:"Marketing",role:"Developer",salary:135328,joinDate:"2024-02-08",path:["Marketing","Developer","Senior","Employee 90"]},{id:91,name:"Employee 91",email:"employee91@company.com",department:"HR",role:"Designer",salary:145196,joinDate:"2025-08-27",path:["HR","Designer","Junior","Employee 91"]},{id:92,name:"Employee 92",email:"employee92@company.com",department:"HR",role:"Analyst",salary:149874,joinDate:"2028-08-04",path:["HR","Analyst","Lead","Employee 92"]},{id:93,name:"Employee 93",email:"employee93@company.com",department:"HR",role:"Designer",salary:51149,joinDate:"2026-12-08",path:["HR","Designer","Junior","Employee 93"]},{id:94,name:"Employee 94",email:"employee94@company.com",department:"Marketing",role:"Analyst",salary:129366,joinDate:"2025-07-26",path:["Marketing","Analyst","Lead","Employee 94"]},{id:95,name:"Employee 95",email:"employee95@company.com",department:"Finance",role:"Analyst",salary:132589,joinDate:"2025-10-08",path:["Finance","Analyst","Lead","Employee 95"]},{id:96,name:"Employee 96",email:"employee96@company.com",department:"Sales",role:"Developer",salary:57917,joinDate:"2025-05-31",path:["Sales","Developer","Senior","Employee 96"]},{id:97,name:"Employee 97",email:"employee97@company.com",department:"Finance",role:"Manager",salary:107883,joinDate:"2026-12-02",path:["Finance","Manager","Associate","Employee 97"]},{id:98,name:"Employee 98",email:"employee98@company.com",department:"Engineering",role:"Specialist",salary:99037,joinDate:"2028-03-08",path:["Engineering","Specialist","Lead","Employee 98"]},{id:99,name:"Employee 99",email:"employee99@company.com",department:"HR",role:"Developer",salary:69238,joinDate:"2024-01-18",path:["HR","Developer","Junior","Employee 99"]},{id:100,name:"Employee 100",email:"employee100@company.com",department:"Sales",role:"Analyst",salary:75590,joinDate:"2025-05-22",path:["Sales","Analyst","Junior","Employee 100"]}],m=[{field:"id",headerName:"ID",width:270,align:"center",headerAlign:"center",hideable:!1},{field:"name",headerName:"Name",width:180,sortable:!0,editable:!0},{field:"email",headerName:"Email",width:250,sortable:!0,editable:!0},{field:"department",headerName:"Department",width:150,sortable:!0},{field:"role",headerName:"Role",width:150,sortable:!0},{field:"salary",headerName:"Salary",width:130,type:"number",align:"right",headerAlign:"right",sortable:!0,editable:!0,valueFormatter:p=>`$${p.value.toLocaleString()}`},{field:"joinDate",headerName:"Join Date",width:130,sortable:!0}];function pe(){const[p,R]=o.useState(le),[_,H]=o.useState([]),[C,k]=o.useState([]),[s,N]=o.useState({page:0,pageSize:25}),[l,L]=o.useState(""),[j,J]=o.useState(!1),[E,M]=o.useState(()=>new Set(m.map(a=>a.field))),[G,u]=o.useState({left:["id","name"],right:[]}),[I,d]=o.useState({top:[1,2],bottom:[]}),[V,F]=o.useState(new Set),[O,f]=o.useState(()=>m.map(a=>a.field)),[D,T]=o.useState(!0),[h,$]=o.useState(!0),[y,U]=o.useState(!1),[c,x]=o.useState(!1),[b,S]=o.useState([]),[q,A]=o.useState({}),[i,z]=o.useState(!0),Q=o.useMemo(()=>m.filter(a=>E.has(a.field)),[E]),B=o.useMemo(()=>l?{items:[],quickFilterValues:[l]}:{items:[]},[l]),P=o.useMemo(()=>l?p.filter(a=>{const t=l.toLowerCase();return Object.values(a).some(n=>n==null?!1:String(n).toLowerCase().includes(t))}).length:p.length,[p,l]),X=(a,t)=>{M(n=>{const r=new Set(n);return t?r.add(a):r.delete(a),r})},K=()=>{M(new Set(m.map(a=>a.field)))},W=()=>{M(new Set(m.filter(a=>a.hideable===!1).map(a=>a.field)))};return e.jsxs(ne,{title:"Full Feature Test",description:"A comprehensive feature test page exercising every major OpenGridX capability in a single grid — virtualization, pinning, grouping, editing, export, and more.",sourceCode:te,children:[e.jsxs("div",{className:"datagrid-test__info",children:[e.jsxs("div",{className:"datagrid-test__stat",children:[e.jsx("strong",{children:"Total Rows:"})," ",p.length]}),e.jsxs("div",{className:"datagrid-test__stat",children:[e.jsx("strong",{children:"Filtered:"})," ",P]}),e.jsxs("div",{className:"datagrid-test__stat",children:[e.jsx("strong",{children:"Selected:"})," ",_.length]}),e.jsxs("div",{className:"datagrid-test__stat",children:[e.jsx("strong",{children:"Visible Columns:"})," ",E.size,"/",m.length]}),e.jsxs("div",{className:"datagrid-test__stat",children:[e.jsx("strong",{children:"Page:"})," ",s.page+1," of ",Math.ceil(P/s.pageSize)]})]}),e.jsxs("div",{className:"datagrid-test__toolbar",children:[e.jsxs("div",{className:"datagrid-test__toolbar-left",children:[e.jsxs("button",{className:"datagrid-test__toolbar-button",onClick:()=>J(!j),children:[j?"Hide":"Show"," Columns"]}),e.jsx("button",{className:"datagrid-test__toolbar-button datagrid-test__toolbar-button--secondary",onClick:()=>u({left:["id","name"],right:[]}),children:"📌 Pin ID & Name"}),e.jsx("button",{className:"datagrid-test__toolbar-button datagrid-test__toolbar-button--secondary",onClick:()=>u({left:[],right:["salary","joinDate"]}),children:"📌 Pin Salary & Date"}),e.jsx("button",{className:"datagrid-test__toolbar-button datagrid-test__toolbar-button--secondary",onClick:()=>u({left:[],right:[]}),children:"❌ Unpin All Columns"}),e.jsx("div",{className:"datagrid-test__toolbar-divider"}),e.jsx("button",{className:"datagrid-test__toolbar-button datagrid-test__toolbar-button--secondary",onClick:()=>f(m.map(a=>a.field)),children:"🔄 Reset Column Order"}),e.jsx("button",{className:`datagrid-test__toolbar-button ${D?"datagrid-test__toolbar-button--primary":"datagrid-test__toolbar-button--secondary"}`,onClick:()=>T(!D),children:D?"🔓 Unpin Checkbox":"🔒 Pin Checkbox"}),e.jsx("button",{className:`datagrid-test__toolbar-button ${h?"datagrid-test__toolbar-button--primary":"datagrid-test__toolbar-button--secondary"}`,onClick:()=>$(!h),children:h?"🔓 Unpin Expand":"🔒 Pin Expand"}),e.jsx("button",{className:"datagrid-test__toolbar-button datagrid-test__toolbar-button--secondary",onClick:()=>d({top:[1,2],bottom:[]}),children:"📌 Pin First 2 Rows (Top)"}),e.jsx("button",{className:"datagrid-test__toolbar-button datagrid-test__toolbar-button--secondary",onClick:()=>d({top:[],bottom:[99,100]}),children:"📌 Pin Last 2 Rows (Bottom)"}),e.jsx("button",{className:"datagrid-test__toolbar-button datagrid-test__toolbar-button--secondary",onClick:()=>d({top:[],bottom:[]}),children:"❌ Unpin All Rows"}),e.jsx("div",{className:"datagrid-test__toolbar-divider"}),e.jsx("button",{className:`datagrid-test__toolbar-button ${b.length>0?"datagrid-test__toolbar-button--primary":"datagrid-test__toolbar-button--secondary"}`,onClick:()=>{b.length>0?(S([]),A({})):(S(["department","role"]),A({salary:"sum",id:"count"})),c&&x(!1)},children:b.length>0?"🚫 Disable Grouping":"📑 Group by Dept > Role"}),e.jsx("button",{className:`datagrid-test__toolbar-button ${c?"datagrid-test__toolbar-button--primary":"datagrid-test__toolbar-button--secondary"}`,onClick:()=>{x(!c),c||S([])},children:c?"🌳 Disable Tree Data":"🌳 Enable Tree Data"}),e.jsx("div",{className:"datagrid-test__toolbar-divider"}),e.jsx("button",{className:`datagrid-test__toolbar-button ${y?"datagrid-test__toolbar-button--primary":"datagrid-test__toolbar-button--secondary"}`,onClick:()=>{y||(k([]),d({top:[],bottom:[]})),U(!y)},children:y?"🛑 Disable Row Reorder":"↕️ Enable Row Reorder"}),e.jsx("div",{className:"datagrid-test__toolbar-divider"}),e.jsx("button",{className:`datagrid-test__toolbar-button ${i?"datagrid-test__toolbar-button--primary":"datagrid-test__toolbar-button--secondary"}`,onClick:()=>{z(!i),i&&F(new Set)},children:i?"📋 Disable Detail Panel":"📋 Enable Detail Panel"})]}),e.jsx(ee,{value:l,onChange:L,placeholder:"Search across all columns..."})]}),j&&e.jsx("div",{className:"datagrid-test__column-panel",children:e.jsx(ae,{columns:m,visibleColumns:E,onVisibilityChange:X,onShowAll:K,onHideAll:W})}),e.jsx("div",{className:"datagrid-test__grid",children:e.jsx(oe,{rows:p,columns:Q,height:600,checkboxSelection:!0,rowSelectionModel:_,onRowSelectionModelChange:H,sortModel:C,onSortModelChange:k,filterModel:B,pagination:!0,paginationModel:s,onPaginationModelChange:N,pageSizeOptions:[10,25,50,100],pinnedColumns:G,onPinnedColumnsChange:u,pinnedRows:I,onPinnedRowsChange:d,onRowClick:a=>console.log("Row clicked:",a.row),onCellClick:a=>console.log("Cell clicked:",a.row,a.field),processRowUpdate:a=>(console.log("Row Updated:",a),R(t=>t.map(n=>n.id===a.id?a:n)),a),onProcessRowUpdateError:a=>console.error("Row Update Error:",a),getDetailPanelContent:i?a=>e.jsxs("div",{style:{padding:"16px",background:"#f5f5f5"},children:[e.jsxs("h4",{style:{margin:"0 0 12px 0"},children:["Employee Details: ",a.row.name]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"},children:[e.jsxs("div",{children:[e.jsx("strong",{children:"ID:"})," ",a.row.id]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Email:"})," ",a.row.email]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Department:"})," ",a.row.department]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Role:"})," ",a.row.role]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Salary:"})," $",a.row.salary.toLocaleString()]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Join Date:"})," ",a.row.joinDate]})]})]}):void 0,getDetailPanelHeight:i?()=>150:void 0,detailPanelExpandedRowIds:i?V:void 0,onDetailPanelExpandedRowIdsChange:i?F:void 0,pinCheckboxColumn:D,pinExpandColumn:h,columnOrder:O,onColumnOrderChange:a=>{const{oldIndex:t,targetIndex:n}=a;f(r=>{const g=[...r],[v]=g.splice(t,1);return g.splice(n,0,v),g}),console.log("Column reordered:",a)},rowGroupingModel:b,onRowGroupingModelChange:S,aggregationModel:q,onAggregationModelChange:A,rowReordering:y,onRowOrderChange:a=>{const{oldIndex:t,targetIndex:n}=a;if(console.log("Row reordered:",a),C.length>0||l){alert("Please clear sorting and filtering to test row reordering.");return}const r=s.page*s.pageSize,g=r+t,v=r+n;R(Y=>{const w=[...Y],[Z]=w.splice(g,1);return w.splice(v,0,Z),w})}})})]})}export{pe as DataGridTest,pe as default};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0YUdyaWRUZXN0LUJzU0tOZTMwLmpzIiwic291cmNlcyI6WyIuLi8uLi9leGFtcGxlcy9EYXRhR3JpZFRlc3QvRGF0YUdyaWRUZXN0LnRzeD9yYXciLCIuLi8uLi9leGFtcGxlcy9EYXRhR3JpZFRlc3QvRGF0YUdyaWRUZXN0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBcIlxcblxcbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xcbmltcG9ydCB7IERhdGFHcmlkIH0gZnJvbSAnQG9wZW5jb3Jlc3RhY2svb3BlbmdyaWR4JztcXG5pbXBvcnQgeyBRdWlja0ZpbHRlciB9IGZyb20gJy4uLy4uLy4uL2xpYi9jb21wb25lbnRzL1F1aWNrRmlsdGVyL1F1aWNrRmlsdGVyJztcXG5pbXBvcnQgeyBDb2x1bW5WaXNpYmlsaXR5UGFuZWwgfSBmcm9tICcuLi8uLi8uLi9saWIvY29tcG9uZW50cy9Db2x1bW5WaXNpYmlsaXR5UGFuZWwvQ29sdW1uVmlzaWJpbGl0eVBhbmVsJztcXG5pbXBvcnQgdHlwZSB7IEdyaWRDb2xEZWYsIEdyaWRSb3dNb2RlbCwgR3JpZEZpbHRlck1vZGVsLCBHcmlkQ29sdW1uUGlubmluZywgR3JpZFJvd1Bpbm5pbmcsIEdyaWRSb3dJZCwgR3JpZFJvd0dyb3VwaW5nTW9kZWwsIEdyaWRBZ2dyZWdhdGlvbk1vZGVsIH0gZnJvbSAnQG9wZW5jb3Jlc3RhY2svb3BlbmdyaWR4JztcXG5pbXBvcnQgJy4uLy4uLy4uL2xpYi9jb21wb25lbnRzL1F1aWNrRmlsdGVyL1F1aWNrRmlsdGVyLmNzcyc7XFxuaW1wb3J0ICcuLi8uLi8uLi9saWIvY29tcG9uZW50cy9Db2x1bW5WaXNpYmlsaXR5UGFuZWwvQ29sdW1uVmlzaWJpbGl0eVBhbmVsLmNzcyc7XFxuaW1wb3J0ICcuL0RhdGFHcmlkVGVzdC5jc3MnO1xcbmltcG9ydCB7IERvY3NMYXlvdXQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL0RvY3NMYXlvdXQnO1xcbmltcG9ydCBzb3VyY2VDb2RlIGZyb20gJy4vRGF0YUdyaWRUZXN0LnRzeD9yYXcnO1xcblxcbmludGVyZmFjZSBFbXBsb3llZSBleHRlbmRzIEdyaWRSb3dNb2RlbCB7XFxuICAgIGlkOiBudW1iZXI7XFxuICAgIG5hbWU6IHN0cmluZztcXG4gICAgZW1haWw6IHN0cmluZztcXG4gICAgZGVwYXJ0bWVudDogc3RyaW5nO1xcbiAgICByb2xlOiBzdHJpbmc7XFxuICAgIHNhbGFyeTogbnVtYmVyO1xcbiAgICBqb2luRGF0ZTogc3RyaW5nO1xcbiAgICBwYXRoOiBzdHJpbmdbXTtcXG59XFxuXFxuY29uc3QgZGF0YSA9IFtcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogMSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDFcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMUBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRlc2lnbmVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxNDg0MTcsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyOC0wNi0wOFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkRlc2lnbmVyXFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDFcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDIsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSAyXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTJAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRW5naW5lZXJpbmdcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTIxOTAzLFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjUtMDYtMDJcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICAgICAgXFxcIkxlYWRcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSAyXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiAzLFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgM1xcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUzQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRlc2lnbmVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiA4ODIxNCxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI4LTAzLTExXFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJFbmdpbmVlcmluZ1xcXCIsXFxuICAgICAgICAgICAgXFxcIkRlc2lnbmVyXFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgM1xcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNCxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDRcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNEBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNzQ2OTEsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNi0wOC0xOFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICAgICAgXFxcIkp1bmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDRcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDUsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA1XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTVAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiTWFuYWdlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogODYyNDMsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNS0wNy0wOFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNVxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNixcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDZcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNkBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDY4Mjk5LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjQtMDgtMzFcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNlxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNyxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDdcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlN0Bjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJFbmdpbmVlcmluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDEwNTg0MSxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI0LTEwLTA0XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJFbmdpbmVlcmluZ1xcXCIsXFxuICAgICAgICAgICAgXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDdcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDgsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA4XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZThAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiRGV2ZWxvcGVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMjA5MDgsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0xMi0wMlxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTZW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA4XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA5LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgOVxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU5QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIlNhbGVzXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRlc2lnbmVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMzkyNTksXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNC0wNS0yNVxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICAgICAgXFxcIkp1bmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDlcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDEwLFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMTBcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMTBAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMzYyMzYsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNC0wMi0yM1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTZW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSAxMFxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogMTEsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSAxMVxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUxMUBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTQxMzY2LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjYtMTAtMDNcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJMZWFkXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMTFcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDEyLFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMTJcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMTJAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiSFJcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiTWFuYWdlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTQ1NzI2LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjUtMTEtMjJcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkhSXFxcIixcXG4gICAgICAgICAgICBcXFwiTWFuYWdlclxcXCIsXFxuICAgICAgICAgICAgXFxcIlNlbmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDEyXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiAxMyxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDEzXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTEzQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiRGV2ZWxvcGVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiA1NjYxNCxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI0LTA4LTE0XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgICAgICBcXFwiRGV2ZWxvcGVyXFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMTNcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDE0LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMTRcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMTRAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiSFJcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDE0OTY5MixcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI2LTA5LTE5XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJIUlxcXCIsXFxuICAgICAgICAgICAgXFxcIkRlc2lnbmVyXFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDE0XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiAxNSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDE1XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTE1QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIlNhbGVzXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNzU0MDUsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNS0wNi0wMlxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJKdW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSAxNVxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogMTYsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSAxNlxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUxNkBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJFbmdpbmVlcmluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTQyMTY3LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjgtMDItMDhcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJKdW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSAxNlxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogMTcsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSAxN1xcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUxN0Bjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJIUlxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxNDc2OTEsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNC0wMi0yMFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiSFJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgICAgICBcXFwiSnVuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMTdcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDE4LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMThcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMThAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDEwODA0MixcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI4LTA1LTE0XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJNYXJrZXRpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMThcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDE5LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMTlcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMTlAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMTY1NDgsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0wNS0yMlxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICAgICAgXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTZW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSAxOVxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogMjAsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSAyMFxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUyMEBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJFbmdpbmVlcmluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTQzNzkxLFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjgtMDgtMDZcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBc3NvY2lhdGVcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSAyMFxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogMjEsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSAyMVxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUyMUBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJIUlxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxNDgyMTcsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0wNC0zMFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiSFJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMjFcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDIyLFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMjJcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMjJAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTAxNjM5LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjUtMTAtMDhcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICAgICAgXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDIyXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiAyMyxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDIzXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTIzQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiRGV2ZWxvcGVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxNDYxMTEsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0wMy0xM1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDIzXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiAyNCxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDI0XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTI0QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDc0NzA0LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjUtMDQtMDNcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICAgICAgXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICAgICAgXFxcIlNlbmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDI0XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiAyNSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDI1XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTI1QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIlNhbGVzXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDc3MTg5LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjgtMDMtMDRcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIlNhbGVzXFxcIixcXG4gICAgICAgICAgICBcXFwiTWFuYWdlclxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDI1XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiAyNixcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDI2XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTI2QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDExMzE0OSxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI2LTEwLTA4XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJFbmdpbmVlcmluZ1xcXCIsXFxuICAgICAgICAgICAgXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJMZWFkXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMjZcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDI3LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMjdcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMjdAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogOTEyNjYsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNi0wMi0xMFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkRlc2lnbmVyXFxcIixcXG4gICAgICAgICAgICBcXFwiSnVuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMjdcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDI4LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMjhcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMjhAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiSFJcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiTWFuYWdlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogOTQ0NzgsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0wMy0xNlxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiSFJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMjhcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDI5LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMjlcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMjlAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiSFJcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDkyMDg0LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjUtMTItMjdcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkhSXFxcIixcXG4gICAgICAgICAgICBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTZW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSAyOVxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogMzAsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSAzMFxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUzMEBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJTYWxlc1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNTA0NDksXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNi0wMi0xMFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICAgICAgXFxcIkxlYWRcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSAzMFxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogMzEsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSAzMVxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUzMUBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIlNwZWNpYWxpc3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDkwMDY1LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjUtMDktMjRcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDMxXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiAzMixcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDMyXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTMyQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiA5MTA0NixcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI0LTEyLTExXFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJNYXJrZXRpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDMyXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiAzMyxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDMzXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTMzQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDEwODE4MixcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI0LTA0LTAyXFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgICAgICBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJKdW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSAzM1xcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogMzQsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSAzNFxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUzNEBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDgxNTgwLFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjctMDgtMDZcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiU2VuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMzRcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDM1LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMzVcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMzVAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiU3BlY2lhbGlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTIzNjU5LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjUtMDktMTRcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIlNhbGVzXFxcIixcXG4gICAgICAgICAgICBcXFwiU3BlY2lhbGlzdFxcXCIsXFxuICAgICAgICAgICAgXFxcIkxlYWRcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSAzNVxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogMzYsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSAzNlxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUzNkBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJIUlxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxNDk0MTAsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyOC0wMy0wNlxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiSFJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMzZcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDM3LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMzdcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMzdAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRW5naW5lZXJpbmdcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNTg5ODQsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNC0wMy0wM1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRW5naW5lZXJpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMzdcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDM4LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgMzhcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlMzhAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRW5naW5lZXJpbmdcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDY3NzMyLFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjctMDUtMTJcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBc3NvY2lhdGVcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSAzOFxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogMzksXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSAzOVxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUzOUBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDYzNzA1LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjgtMDEtMjdcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMzlcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDQwLFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNDBcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNDBAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDk4MDQ4LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjYtMTEtMjdcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICAgICAgXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJKdW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA0MFxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNDEsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA0MVxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU0MUBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIlNwZWNpYWxpc3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDk2MzA2LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjUtMDctMThcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiSnVuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNDFcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDQyLFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNDJcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNDJAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRW5naW5lZXJpbmdcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiRGV2ZWxvcGVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxNDIzNzAsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0wOC0wNFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRW5naW5lZXJpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBc3NvY2lhdGVcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA0MlxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNDMsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA0M1xcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU0M0Bjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJTYWxlc1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMzQ0NDcsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNS0wNC0xOFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgICAgICBcXFwiU2VuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNDNcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDQ0LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNDRcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNDRAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogODk4MDAsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNi0wNC0yN1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiRGV2ZWxvcGVyXFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDQ0XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA0NSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDQ1XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTQ1QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogOTYwODYsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNC0wNS0xM1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJKdW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA0NVxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNDYsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA0NlxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU0NkBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJTYWxlc1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMTU1NjEsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNS0wNy0wNVxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNDZcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDQ3LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNDdcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNDdAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDc3NDE0LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjYtMDItMTVcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICAgICAgXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBc3NvY2lhdGVcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA0N1xcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNDgsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA0OFxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU0OEBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDUwNTQ1LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjYtMTItMjRcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNDhcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDQ5LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNDlcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNDlAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDYxMjY3LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjgtMDQtMDFcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICAgICAgXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBc3NvY2lhdGVcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA0OVxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNTAsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA1MFxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU1MEBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJIUlxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTMwNzc1LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjUtMDUtMjBcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkhSXFxcIixcXG4gICAgICAgICAgICBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJKdW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA1MFxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNTEsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA1MVxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU1MUBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDYxMjkxLFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjYtMTAtMDZcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDUxXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA1MixcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDUyXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTUyQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiRGV2ZWxvcGVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMjE3NDQsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNC0wNy0xMlxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICAgICAgXFxcIkxlYWRcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA1MlxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNTMsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA1M1xcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU1M0Bjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJFbmdpbmVlcmluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMDg0OTIsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNS0wNS0wNFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRW5naW5lZXJpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNTNcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDU0LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNTRcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNTRAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRW5naW5lZXJpbmdcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNzIxODksXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyOC0xMC0wNlxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRW5naW5lZXJpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDU0XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA1NSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDU1XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTU1QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIlNhbGVzXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRlc2lnbmVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMDUzMjgsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0wNS0wN1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICAgICAgXFxcIlNlbmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDU1XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA1NixcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDU2XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTU2QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkhSXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRlc2lnbmVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMDI3NzEsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0wNS0yMFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiSFJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICAgICAgXFxcIlNlbmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDU2XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA1NyxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDU3XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTU3QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkhSXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTQwMDg1LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjgtMDctMDVcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkhSXFxcIixcXG4gICAgICAgICAgICBcXFwiRGV2ZWxvcGVyXFxcIixcXG4gICAgICAgICAgICBcXFwiSnVuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNTdcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDU4LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNThcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNThAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiA3OTUwMixcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI0LTAxLTA4XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgICAgICBcXFwiU3BlY2lhbGlzdFxcXCIsXFxuICAgICAgICAgICAgXFxcIkp1bmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDU4XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA1OSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDU5XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTU5QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTEwNjI0LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjQtMDEtMzFcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNTlcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDYwLFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNjBcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNjBAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTEzMzE4LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjQtMDgtMjVcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDYwXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA2MSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDYxXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTYxQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIlNhbGVzXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIlNwZWNpYWxpc3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDEzNDE2MixcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI2LTExLTE4XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJTYWxlc1xcXCIsXFxuICAgICAgICAgICAgXFxcIlNwZWNpYWxpc3RcXFwiLFxcbiAgICAgICAgICAgIFxcXCJKdW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA2MVxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNjIsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA2MlxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU2MkBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJNYXJrZXRpbmdcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiRGV2ZWxvcGVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiA2NzEzNCxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI3LTExLTI0XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJNYXJrZXRpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBc3NvY2lhdGVcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA2MlxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNjMsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA2M1xcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU2M0Bjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJIUlxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogOTAwMDUsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNS0wNi0wNFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiSFJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICAgICAgXFxcIlNlbmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDYzXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA2NCxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDY0XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTY0QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNzc4MDYsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0wNy0yN1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgICAgIFxcXCJMZWFkXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNjRcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDY1LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNjVcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNjVAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNTE3NTMsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyOC0wOS0yMVxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDY1XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA2NixcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDY2XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTY2QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxNDQ1NjksXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyOC0wMS0xOVxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiU3BlY2lhbGlzdFxcXCIsXFxuICAgICAgICAgICAgXFxcIkp1bmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDY2XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA2NyxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDY3XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTY3QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDY0NTQ4LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjctMDMtMTRcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiTWFuYWdlclxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDY3XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA2OCxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDY4XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTY4QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiA4NjY1OSxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI3LTExLTI3XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJNYXJrZXRpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNjhcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDY5LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNjlcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNjlAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiSFJcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiU3BlY2lhbGlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogODU2ODAsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0wNi0yM1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiSFJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiSnVuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNjlcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDcwLFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNzBcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNzBAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiSFJcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTM5MjMzLFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjctMDctMTdcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkhSXFxcIixcXG4gICAgICAgICAgICBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDcwXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA3MSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDcxXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTcxQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkhSXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDgwMTEyLFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjYtMTItMDZcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkhSXFxcIixcXG4gICAgICAgICAgICBcXFwiTWFuYWdlclxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDcxXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA3MixcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDcyXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTcyQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIlNhbGVzXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIlNwZWNpYWxpc3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDU0NzMyLFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjQtMDgtMjNcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIlNhbGVzXFxcIixcXG4gICAgICAgICAgICBcXFwiU3BlY2lhbGlzdFxcXCIsXFxuICAgICAgICAgICAgXFxcIlNlbmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDcyXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA3MyxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDczXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTczQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkhSXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDEyNTEyNyxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI4LTAxLTA4XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJIUlxcXCIsXFxuICAgICAgICAgICAgXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTZW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA3M1xcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNzQsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA3NFxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU3NEBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJTYWxlc1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMjAzMjIsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyOC0wNi0xOVxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDc0XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA3NSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDc1XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTc1QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiA5NTc4OSxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI3LTEwLTIzXFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJNYXJrZXRpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgICAgICBcXFwiQXNzb2NpYXRlXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNzVcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDc2LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNzZcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNzZAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMjE4MDgsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0xMC0yN1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICAgICAgXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJKdW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA3NlxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogNzcsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA3N1xcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU3N0Bjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJTYWxlc1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMDg5MzMsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNS0wMi0wNVxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiU2VuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgNzdcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDc4LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgNzhcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlNzhAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiA1MDk0NixcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI2LTExLTIwXFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgICAgICBcXFwiTWFuYWdlclxcXCIsXFxuICAgICAgICAgICAgXFxcIlNlbmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDc4XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA3OSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDc5XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTc5QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJNYW5hZ2VyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMDA5NjUsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNC0wNC0yMVxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiTWFuYWdlclxcXCIsXFxuICAgICAgICAgICAgXFxcIkxlYWRcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA3OVxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogODAsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA4MFxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU4MEBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJNYXJrZXRpbmdcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNTQ1NDgsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNi0wNC0wNVxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICAgICAgXFxcIkp1bmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDgwXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA4MSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDgxXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTgxQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxMzU4ODMsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNy0wOC0xN1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICAgICAgXFxcIlNlbmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDgxXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA4MixcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDgyXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTgyQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIlNhbGVzXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNTIyMTYsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNC0wNC0yM1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJKdW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA4MlxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogODMsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA4M1xcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU4M0Bjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJFbmdpbmVlcmluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDExMDI5MCxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI1LTExLTE0XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJFbmdpbmVlcmluZ1xcXCIsXFxuICAgICAgICAgICAgXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICAgICAgXFxcIkp1bmlvclxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDgzXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA4NCxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDg0XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTg0QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIlNhbGVzXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTQwNTIyLFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjQtMDktMTFcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIlNhbGVzXFxcIixcXG4gICAgICAgICAgICBcXFwiRGV2ZWxvcGVyXFxcIixcXG4gICAgICAgICAgICBcXFwiSnVuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgODRcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDg1LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgODVcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlODVAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRW5naW5lZXJpbmdcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiU3BlY2lhbGlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogODQ0ODUsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNi0wOS0yM1xcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiRW5naW5lZXJpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTcGVjaWFsaXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiSnVuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgODVcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDg2LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgODZcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlODZAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiRmluYW5jZVxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTMzMDMyLFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjQtMDMtMjdcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDg2XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA4NyxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDg3XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTg3QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDE0ODg2MSxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI0LTExLTIxXFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJFbmdpbmVlcmluZ1xcXCIsXFxuICAgICAgICAgICAgXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTZW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA4N1xcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogODgsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA4OFxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU4OEBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJNYXJrZXRpbmdcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNTU2MTMsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyOC0xMS0yMFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDg4XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA4OSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDg5XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTg5QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIlNwZWNpYWxpc3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDYxMDgxLFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjQtMTEtMjVcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiU3BlY2lhbGlzdFxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDg5XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA5MCxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDkwXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTkwQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIk1hcmtldGluZ1xcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDEzNTMyOCxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI0LTAyLTA4XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJNYXJrZXRpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTZW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA5MFxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogOTEsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA5MVxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU5MUBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJIUlxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXNpZ25lclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTQ1MTk2LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjUtMDgtMjdcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkhSXFxcIixcXG4gICAgICAgICAgICBcXFwiRGVzaWduZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJKdW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA5MVxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogOTIsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA5MlxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU5MkBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJIUlxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiAxNDk4NzQsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyOC0wOC0wNFxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiSFJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDkyXFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA5MyxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDkzXFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTkzQGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkhSXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRlc2lnbmVyXFxcIixcXG4gICAgICAgIFxcXCJzYWxhcnlcXFwiOiA1MTE0OSxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI2LTEyLTA4XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJIUlxcXCIsXFxuICAgICAgICAgICAgXFxcIkRlc2lnbmVyXFxcIixcXG4gICAgICAgICAgICBcXFwiSnVuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgOTNcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDk0LFxcbiAgICAgICAgXFxcIm5hbWVcXFwiOiBcXFwiRW1wbG95ZWUgOTRcXFwiLFxcbiAgICAgICAgXFxcImVtYWlsXFxcIjogXFxcImVtcGxveWVlOTRAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiTWFya2V0aW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkFuYWx5c3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDEyOTM2NixcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI1LTA3LTI2XFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJNYXJrZXRpbmdcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDk0XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA5NSxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDk1XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTk1QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogMTMyNTg5LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjUtMTAtMDhcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkZpbmFuY2VcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiTGVhZFxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDk1XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA5NixcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDk2XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTk2QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIlNhbGVzXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIkRldmVsb3BlclxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNTc5MTcsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNS0wNS0zMVxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgICAgIFxcXCJTZW5pb3JcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA5NlxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogOTcsXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA5N1xcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU5N0Bjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIk1hbmFnZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDEwNzg4MyxcXG4gICAgICAgIFxcXCJqb2luRGF0ZVxcXCI6IFxcXCIyMDI2LTEyLTAyXFxcIixcXG4gICAgICAgIFxcXCJwYXRoXFxcIjogW1xcbiAgICAgICAgICAgIFxcXCJGaW5hbmNlXFxcIixcXG4gICAgICAgICAgICBcXFwiTWFuYWdlclxcXCIsXFxuICAgICAgICAgICAgXFxcIkFzc29jaWF0ZVxcXCIsXFxuICAgICAgICAgICAgXFxcIkVtcGxveWVlIDk3XFxcIlxcbiAgICAgICAgXVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBcXFwiaWRcXFwiOiA5OCxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDk4XFxcIixcXG4gICAgICAgIFxcXCJlbWFpbFxcXCI6IFxcXCJlbXBsb3llZTk4QGNvbXBhbnkuY29tXFxcIixcXG4gICAgICAgIFxcXCJkZXBhcnRtZW50XFxcIjogXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgIFxcXCJyb2xlXFxcIjogXFxcIlNwZWNpYWxpc3RcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDk5MDM3LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjgtMDMtMDhcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkVuZ2luZWVyaW5nXFxcIixcXG4gICAgICAgICAgICBcXFwiU3BlY2lhbGlzdFxcXCIsXFxuICAgICAgICAgICAgXFxcIkxlYWRcXFwiLFxcbiAgICAgICAgICAgIFxcXCJFbXBsb3llZSA5OFxcXCJcXG4gICAgICAgIF1cXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgXFxcImlkXFxcIjogOTksXFxuICAgICAgICBcXFwibmFtZVxcXCI6IFxcXCJFbXBsb3llZSA5OVxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWU5OUBjb21wYW55LmNvbVxcXCIsXFxuICAgICAgICBcXFwiZGVwYXJ0bWVudFxcXCI6IFxcXCJIUlxcXCIsXFxuICAgICAgICBcXFwicm9sZVxcXCI6IFxcXCJEZXZlbG9wZXJcXFwiLFxcbiAgICAgICAgXFxcInNhbGFyeVxcXCI6IDY5MjM4LFxcbiAgICAgICAgXFxcImpvaW5EYXRlXFxcIjogXFxcIjIwMjQtMDEtMThcXFwiLFxcbiAgICAgICAgXFxcInBhdGhcXFwiOiBbXFxuICAgICAgICAgICAgXFxcIkhSXFxcIixcXG4gICAgICAgICAgICBcXFwiRGV2ZWxvcGVyXFxcIixcXG4gICAgICAgICAgICBcXFwiSnVuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgOTlcXFwiXFxuICAgICAgICBdXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIFxcXCJpZFxcXCI6IDEwMCxcXG4gICAgICAgIFxcXCJuYW1lXFxcIjogXFxcIkVtcGxveWVlIDEwMFxcXCIsXFxuICAgICAgICBcXFwiZW1haWxcXFwiOiBcXFwiZW1wbG95ZWUxMDBAY29tcGFueS5jb21cXFwiLFxcbiAgICAgICAgXFxcImRlcGFydG1lbnRcXFwiOiBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgXFxcInJvbGVcXFwiOiBcXFwiQW5hbHlzdFxcXCIsXFxuICAgICAgICBcXFwic2FsYXJ5XFxcIjogNzU1OTAsXFxuICAgICAgICBcXFwiam9pbkRhdGVcXFwiOiBcXFwiMjAyNS0wNS0yMlxcXCIsXFxuICAgICAgICBcXFwicGF0aFxcXCI6IFtcXG4gICAgICAgICAgICBcXFwiU2FsZXNcXFwiLFxcbiAgICAgICAgICAgIFxcXCJBbmFseXN0XFxcIixcXG4gICAgICAgICAgICBcXFwiSnVuaW9yXFxcIixcXG4gICAgICAgICAgICBcXFwiRW1wbG95ZWUgMTAwXFxcIlxcbiAgICAgICAgXVxcbiAgICB9XFxuXVxcblxcbmNvbnN0IGFsbENvbHVtbnM6IEdyaWRDb2xEZWY8RW1wbG95ZWU+W10gPSBbXFxuICAgIHtcXG4gICAgICAgIGZpZWxkOiAnaWQnLFxcbiAgICAgICAgaGVhZGVyTmFtZTogJ0lEJyxcXG4gICAgICAgIHdpZHRoOiAyNzAsXFxuICAgICAgICBhbGlnbjogJ2NlbnRlcicsXFxuICAgICAgICBoZWFkZXJBbGlnbjogJ2NlbnRlcicsXFxuICAgICAgICBoaWRlYWJsZTogZmFsc2VcXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgZmllbGQ6ICduYW1lJyxcXG4gICAgICAgIGhlYWRlck5hbWU6ICdOYW1lJyxcXG4gICAgICAgIHdpZHRoOiAxODAsXFxuICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcXG4gICAgICAgIGVkaXRhYmxlOiB0cnVlXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIGZpZWxkOiAnZW1haWwnLFxcbiAgICAgICAgaGVhZGVyTmFtZTogJ0VtYWlsJyxcXG4gICAgICAgIHdpZHRoOiAyNTAsXFxuICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcXG4gICAgICAgIGVkaXRhYmxlOiB0cnVlXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIGZpZWxkOiAnZGVwYXJ0bWVudCcsXFxuICAgICAgICBoZWFkZXJOYW1lOiAnRGVwYXJ0bWVudCcsXFxuICAgICAgICB3aWR0aDogMTUwLFxcbiAgICAgICAgc29ydGFibGU6IHRydWVcXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgZmllbGQ6ICdyb2xlJyxcXG4gICAgICAgIGhlYWRlck5hbWU6ICdSb2xlJyxcXG4gICAgICAgIHdpZHRoOiAxNTAsXFxuICAgICAgICBzb3J0YWJsZTogdHJ1ZVxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBmaWVsZDogJ3NhbGFyeScsXFxuICAgICAgICBoZWFkZXJOYW1lOiAnU2FsYXJ5JyxcXG4gICAgICAgIHdpZHRoOiAxMzAsXFxuICAgICAgICB0eXBlOiAnbnVtYmVyJyxcXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxcbiAgICAgICAgaGVhZGVyQWxpZ246ICdyaWdodCcsXFxuICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcXG4gICAgICAgIGVkaXRhYmxlOiB0cnVlLFxcbiAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IGAkJHtwYXJhbXMudmFsdWUudG9Mb2NhbGVTdHJpbmcoKX1gXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIGZpZWxkOiAnam9pbkRhdGUnLFxcbiAgICAgICAgaGVhZGVyTmFtZTogJ0pvaW4gRGF0ZScsXFxuICAgICAgICB3aWR0aDogMTMwLFxcbiAgICAgICAgc29ydGFibGU6IHRydWVcXG4gICAgfVxcbl07XFxuXFxuZXhwb3J0IGZ1bmN0aW9uIERhdGFHcmlkVGVzdCgpIHtcXG4gICAgY29uc3QgW3Jvd3MsIHNldFJvd3NdID0gdXNlU3RhdGU8RW1wbG95ZWVbXT4oZGF0YSk7XFxuICAgIGNvbnN0IFtzZWxlY3Rpb25Nb2RlbCwgc2V0U2VsZWN0aW9uTW9kZWxdID0gdXNlU3RhdGU8QXJyYXk8c3RyaW5nIHwgbnVtYmVyPj4oW10pO1xcbiAgICBjb25zdCBbc29ydE1vZGVsLCBzZXRTb3J0TW9kZWxdID0gdXNlU3RhdGU8QXJyYXk8eyBmaWVsZDogc3RyaW5nOyBzb3J0OiAnYXNjJyB8ICdkZXNjJyB9Pj4oW10pO1xcbiAgICBjb25zdCBbcGFnaW5hdGlvbk1vZGVsLCBzZXRQYWdpbmF0aW9uTW9kZWxdID0gdXNlU3RhdGUoeyBwYWdlOiAwLCBwYWdlU2l6ZTogMjUgfSk7XFxuICAgIGNvbnN0IFtxdWlja0ZpbHRlclZhbHVlLCBzZXRRdWlja0ZpbHRlclZhbHVlXSA9IHVzZVN0YXRlKCcnKTtcXG4gICAgY29uc3QgW3Nob3dDb2x1bW5QYW5lbCwgc2V0U2hvd0NvbHVtblBhbmVsXSA9IHVzZVN0YXRlKGZhbHNlKTtcXG4gICAgY29uc3QgW3Zpc2libGVDb2x1bW5zLCBzZXRWaXNpYmxlQ29sdW1uc10gPSB1c2VTdGF0ZTxTZXQ8c3RyaW5nPj4oXFxuICAgICAgICAoKSA9PiBuZXcgU2V0KGFsbENvbHVtbnMubWFwKGNvbCA9PiBjb2wuZmllbGQpKVxcbiAgICApO1xcbiAgICBjb25zdCBbcGlubmVkQ29sdW1ucywgc2V0UGlubmVkQ29sdW1uc10gPSB1c2VTdGF0ZTxHcmlkQ29sdW1uUGlubmluZz4oe1xcbiAgICAgICAgbGVmdDogWydpZCcsICduYW1lJ10sXFxuICAgICAgICByaWdodDogW11cXG4gICAgfSk7XFxuICAgIGNvbnN0IFtwaW5uZWRSb3dzLCBzZXRQaW5uZWRSb3dzXSA9IHVzZVN0YXRlPEdyaWRSb3dQaW5uaW5nPih7XFxuICAgICAgICB0b3A6IFsxLCAyXSxcXG4gICAgICAgIGJvdHRvbTogW11cXG4gICAgfSk7XFxuICAgIGNvbnN0IFtleHBhbmRlZERldGFpbFBhbmVsUm93SWRzLCBzZXRFeHBhbmRlZERldGFpbFBhbmVsUm93SWRzXSA9IHVzZVN0YXRlPFNldDxHcmlkUm93SWQ+PihuZXcgU2V0KCkpO1xcbiAgICBjb25zdCBbY29sdW1uT3JkZXIsIHNldENvbHVtbk9yZGVyXSA9IHVzZVN0YXRlPHN0cmluZ1tdPigoKSA9PiBhbGxDb2x1bW5zLm1hcChjb2wgPT4gY29sLmZpZWxkKSk7XFxuICAgIGNvbnN0IFtwaW5DaGVja2JveENvbHVtbiwgc2V0UGluQ2hlY2tib3hDb2x1bW5dID0gdXNlU3RhdGUodHJ1ZSk7XFxuICAgIGNvbnN0IFtwaW5FeHBhbmRDb2x1bW4sIHNldFBpbkV4cGFuZENvbHVtbl0gPSB1c2VTdGF0ZSh0cnVlKTtcXG4gICAgY29uc3QgW3Jvd1Jlb3JkZXJpbmcsIHNldFJvd1Jlb3JkZXJpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xcbiAgICBjb25zdCBbdHJlZURhdGEsIHNldFRyZWVEYXRhXSA9IHVzZVN0YXRlKGZhbHNlKTtcXG4gICAgY29uc3QgW3Jvd0dyb3VwaW5nTW9kZWwsIHNldFJvd0dyb3VwaW5nTW9kZWxdID0gdXNlU3RhdGU8R3JpZFJvd0dyb3VwaW5nTW9kZWw+KFtdKTtcXG4gICAgY29uc3QgW2FnZ3JlZ2F0aW9uTW9kZWwsIHNldEFnZ3JlZ2F0aW9uTW9kZWxdID0gdXNlU3RhdGU8R3JpZEFnZ3JlZ2F0aW9uTW9kZWw+KHt9KTtcXG4gICAgY29uc3QgW2RldGFpbFBhbmVsRW5hYmxlZCwgc2V0RGV0YWlsUGFuZWxFbmFibGVkXSA9IHVzZVN0YXRlKHRydWUpO1xcblxcbiAgICBjb25zdCBjb2x1bW5zID0gdXNlTWVtbygoKSA9PiB7XFxuICAgICAgICByZXR1cm4gYWxsQ29sdW1ucy5maWx0ZXIoY29sID0+IHZpc2libGVDb2x1bW5zLmhhcyhjb2wuZmllbGQpKTtcXG4gICAgfSwgW3Zpc2libGVDb2x1bW5zXSk7XFxuXFxuICAgIGNvbnN0IGZpbHRlck1vZGVsOiBHcmlkRmlsdGVyTW9kZWwgPSB1c2VNZW1vKCgpID0+IHtcXG4gICAgICAgIGlmICghcXVpY2tGaWx0ZXJWYWx1ZSkge1xcbiAgICAgICAgICAgIHJldHVybiB7IGl0ZW1zOiBbXSB9O1xcbiAgICAgICAgfVxcbiAgICAgICAgcmV0dXJuIHtcXG4gICAgICAgICAgICBpdGVtczogW10sXFxuICAgICAgICAgICAgcXVpY2tGaWx0ZXJWYWx1ZXM6IFtxdWlja0ZpbHRlclZhbHVlXVxcbiAgICAgICAgfTtcXG4gICAgfSwgW3F1aWNrRmlsdGVyVmFsdWVdKTtcXG5cXG4gICAgY29uc3QgZmlsdGVyZWRSb3dDb3VudCA9IHVzZU1lbW8oKCkgPT4ge1xcbiAgICAgICAgaWYgKCFxdWlja0ZpbHRlclZhbHVlKSByZXR1cm4gcm93cy5sZW5ndGg7XFxuXFxuICAgICAgICByZXR1cm4gcm93cy5maWx0ZXIocm93ID0+IHtcXG4gICAgICAgICAgICBjb25zdCBzZWFyY2hUZXJtID0gcXVpY2tGaWx0ZXJWYWx1ZS50b0xvd2VyQ2FzZSgpO1xcbiAgICAgICAgICAgIHJldHVybiBPYmplY3QudmFsdWVzKHJvdykuc29tZSh2YWx1ZSA9PiB7XFxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gZmFsc2U7XFxuICAgICAgICAgICAgICAgIHJldHVybiBTdHJpbmcodmFsdWUpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoVGVybSk7XFxuICAgICAgICAgICAgfSk7XFxuICAgICAgICB9KS5sZW5ndGg7XFxuICAgIH0sIFtyb3dzLCBxdWlja0ZpbHRlclZhbHVlXSk7XFxuXFxuICAgIGNvbnN0IGhhbmRsZVZpc2liaWxpdHlDaGFuZ2UgPSAoZmllbGQ6IHN0cmluZywgaXNWaXNpYmxlOiBib29sZWFuKSA9PiB7XFxuICAgICAgICBzZXRWaXNpYmxlQ29sdW1ucyhwcmV2ID0+IHtcXG4gICAgICAgICAgICBjb25zdCBuZXh0ID0gbmV3IFNldChwcmV2KTtcXG4gICAgICAgICAgICBpZiAoaXNWaXNpYmxlKSB7XFxuICAgICAgICAgICAgICAgIG5leHQuYWRkKGZpZWxkKTtcXG4gICAgICAgICAgICB9IGVsc2Uge1xcbiAgICAgICAgICAgICAgICBuZXh0LmRlbGV0ZShmaWVsZCk7XFxuICAgICAgICAgICAgfVxcbiAgICAgICAgICAgIHJldHVybiBuZXh0O1xcbiAgICAgICAgfSk7XFxuICAgIH07XFxuXFxuICAgIGNvbnN0IGhhbmRsZVNob3dBbGwgPSAoKSA9PiB7XFxuICAgICAgICBzZXRWaXNpYmxlQ29sdW1ucyhuZXcgU2V0KGFsbENvbHVtbnMubWFwKGNvbCA9PiBjb2wuZmllbGQpKSk7XFxuICAgIH07XFxuXFxuICAgIGNvbnN0IGhhbmRsZUhpZGVBbGwgPSAoKSA9PiB7XFxuXFxuICAgICAgICBzZXRWaXNpYmxlQ29sdW1ucyhuZXcgU2V0KGFsbENvbHVtbnMuZmlsdGVyKGNvbCA9PiBjb2wuaGlkZWFibGUgPT09IGZhbHNlKS5tYXAoY29sID0+IGNvbC5maWVsZCkpKTtcXG4gICAgfTtcXG5cXG4gICAgcmV0dXJuIChcXG4gICAgICAgIDxEb2NzTGF5b3V0XFxuICAgICAgICAgICAgdGl0bGU9XFxcIkZ1bGwgRmVhdHVyZSBUZXN0XFxcIlxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uPVxcXCJBIGNvbXByZWhlbnNpdmUgZmVhdHVyZSB0ZXN0IHBhZ2UgZXhlcmNpc2luZyBldmVyeSBtYWpvciBPcGVuR3JpZFggY2FwYWJpbGl0eSBpbiBhIHNpbmdsZSBncmlkIOKAlCB2aXJ0dWFsaXphdGlvbiwgcGlubmluZywgZ3JvdXBpbmcsIGVkaXRpbmcsIGV4cG9ydCwgYW5kIG1vcmUuXFxcIlxcbiAgICAgICAgICAgIHNvdXJjZUNvZGU9e3NvdXJjZUNvZGV9XFxuICAgICAgICA+XFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImRhdGFncmlkLXRlc3RfX2luZm9cXFwiPlxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZGF0YWdyaWQtdGVzdF9fc3RhdFxcXCI+XFxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPlRvdGFsIFJvd3M6PC9zdHJvbmc+IHtyb3dzLmxlbmd0aH1cXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJkYXRhZ3JpZC10ZXN0X19zdGF0XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+RmlsdGVyZWQ6PC9zdHJvbmc+IHtmaWx0ZXJlZFJvd0NvdW50fVxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImRhdGFncmlkLXRlc3RfX3N0YXRcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5TZWxlY3RlZDo8L3N0cm9uZz4ge3NlbGVjdGlvbk1vZGVsLmxlbmd0aH1cXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJkYXRhZ3JpZC10ZXN0X19zdGF0XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+VmlzaWJsZSBDb2x1bW5zOjwvc3Ryb25nPiB7dmlzaWJsZUNvbHVtbnMuc2l6ZX0ve2FsbENvbHVtbnMubGVuZ3RofVxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImRhdGFncmlkLXRlc3RfX3N0YXRcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5QYWdlOjwvc3Ryb25nPiB7cGFnaW5hdGlvbk1vZGVsLnBhZ2UgKyAxfSBvZiB7TWF0aC5jZWlsKGZpbHRlcmVkUm93Q291bnQgLyBwYWdpbmF0aW9uTW9kZWwucGFnZVNpemUpfVxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICA8L2Rpdj5cXG5cXG4gICAgICAgICAgICB7IH1cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZGF0YWdyaWQtdGVzdF9fdG9vbGJhclxcXCI+XFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJkYXRhZ3JpZC10ZXN0X190b29sYmFyLWxlZnRcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cXFwiZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b25cXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2hvd0NvbHVtblBhbmVsKCFzaG93Q29sdW1uUGFuZWwpfVxcbiAgICAgICAgICAgICAgICAgICAgPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtzaG93Q29sdW1uUGFuZWwgPyAnSGlkZScgOiAnU2hvdyd9IENvbHVtbnNcXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cXFwiZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24gZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXNlY29uZGFyeVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRQaW5uZWRDb2x1bW5zKHsgbGVmdDogWydpZCcsICduYW1lJ10sIHJpZ2h0OiBbXSB9KX1cXG4gICAgICAgICAgICAgICAgICAgID5cXG4gICAgICAgICAgICAgICAgICAgICAgICDwn5OMIFBpbiBJRCAmIE5hbWVcXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cXFwiZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24gZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXNlY29uZGFyeVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRQaW5uZWRDb2x1bW5zKHsgbGVmdDogW10sIHJpZ2h0OiBbJ3NhbGFyeScsICdqb2luRGF0ZSddIH0pfVxcbiAgICAgICAgICAgICAgICAgICAgPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIPCfk4wgUGluIFNhbGFyeSAmIERhdGVcXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cXFwiZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24gZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXNlY29uZGFyeVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRQaW5uZWRDb2x1bW5zKHsgbGVmdDogW10sIHJpZ2h0OiBbXSB9KX1cXG4gICAgICAgICAgICAgICAgICAgID5cXG4gICAgICAgICAgICAgICAgICAgICAgICDinYwgVW5waW4gQWxsIENvbHVtbnNcXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImRhdGFncmlkLXRlc3RfX3Rvb2xiYXItZGl2aWRlclxcXCI+PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVxcXCJkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbiBkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tc2Vjb25kYXJ5XFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldENvbHVtbk9yZGVyKGFsbENvbHVtbnMubWFwKGNvbCA9PiBjb2wuZmllbGQpKX1cXG4gICAgICAgICAgICAgICAgICAgID5cXG4gICAgICAgICAgICAgICAgICAgICAgICDwn5SEIFJlc2V0IENvbHVtbiBPcmRlclxcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24gJHtwaW5DaGVja2JveENvbHVtbiA/ICdkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tcHJpbWFyeScgOiAnZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXNlY29uZGFyeSd9YH1cXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRQaW5DaGVja2JveENvbHVtbighcGluQ2hlY2tib3hDb2x1bW4pfVxcbiAgICAgICAgICAgICAgICAgICAgPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtwaW5DaGVja2JveENvbHVtbiA/ICfwn5STIFVucGluIENoZWNrYm94JyA6ICfwn5SSIFBpbiBDaGVja2JveCd9XFxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbiAke3BpbkV4cGFuZENvbHVtbiA/ICdkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tcHJpbWFyeScgOiAnZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXNlY29uZGFyeSd9YH1cXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRQaW5FeHBhbmRDb2x1bW4oIXBpbkV4cGFuZENvbHVtbil9XFxuICAgICAgICAgICAgICAgICAgICA+XFxuICAgICAgICAgICAgICAgICAgICAgICAge3BpbkV4cGFuZENvbHVtbiA/ICfwn5STIFVucGluIEV4cGFuZCcgOiAn8J+UkiBQaW4gRXhwYW5kJ31cXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cXFwiZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24gZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXNlY29uZGFyeVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRQaW5uZWRSb3dzKHsgdG9wOiBbMSwgMl0sIGJvdHRvbTogW10gfSl9XFxuICAgICAgICAgICAgICAgICAgICA+XFxuICAgICAgICAgICAgICAgICAgICAgICAg8J+TjCBQaW4gRmlyc3QgMiBSb3dzIChUb3ApXFxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XFxcImRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uIGRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1zZWNvbmRhcnlcXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0UGlubmVkUm93cyh7IHRvcDogW10sIGJvdHRvbTogWzk5LCAxMDBdIH0pfVxcbiAgICAgICAgICAgICAgICAgICAgPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIPCfk4wgUGluIExhc3QgMiBSb3dzIChCb3R0b20pXFxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XFxcImRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uIGRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1zZWNvbmRhcnlcXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0UGlubmVkUm93cyh7IHRvcDogW10sIGJvdHRvbTogW10gfSl9XFxuICAgICAgICAgICAgICAgICAgICA+XFxuICAgICAgICAgICAgICAgICAgICAgICAg4p2MIFVucGluIEFsbCBSb3dzXFxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJkYXRhZ3JpZC10ZXN0X190b29sYmFyLWRpdmlkZXJcXFwiPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uICR7cm93R3JvdXBpbmdNb2RlbC5sZW5ndGggPiAwID8gJ2RhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1wcmltYXJ5JyA6ICdkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tc2Vjb25kYXJ5J31gfVxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvd0dyb3VwaW5nTW9kZWwubGVuZ3RoID4gMCkge1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0Um93R3JvdXBpbmdNb2RlbChbXSk7XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRBZ2dyZWdhdGlvbk1vZGVsKHt9KTtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFJvd0dyb3VwaW5nTW9kZWwoWydkZXBhcnRtZW50JywgJ3JvbGUnXSk7XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRBZ2dyZWdhdGlvbk1vZGVsKHsgc2FsYXJ5OiAnc3VtJywgaWQ6ICdjb3VudCcgfSk7XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cXG5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRyZWVEYXRhKSBzZXRUcmVlRGF0YShmYWxzZSk7XFxuICAgICAgICAgICAgICAgICAgICAgICAgfX1cXG4gICAgICAgICAgICAgICAgICAgID5cXG4gICAgICAgICAgICAgICAgICAgICAgICB7cm93R3JvdXBpbmdNb2RlbC5sZW5ndGggPiAwID8gJ/CfmqsgRGlzYWJsZSBHcm91cGluZycgOiAn8J+TkSBHcm91cCBieSBEZXB0ID4gUm9sZSd9XFxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbiAke3RyZWVEYXRhID8gJ2RhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1wcmltYXJ5JyA6ICdkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tc2Vjb25kYXJ5J31gfVxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VHJlZURhdGEoIXRyZWVEYXRhKTtcXG5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0cmVlRGF0YSkgc2V0Um93R3JvdXBpbmdNb2RlbChbXSk7XFxuICAgICAgICAgICAgICAgICAgICAgICAgfX1cXG4gICAgICAgICAgICAgICAgICAgID5cXG4gICAgICAgICAgICAgICAgICAgICAgICB7dHJlZURhdGEgPyAn8J+MsyBEaXNhYmxlIFRyZWUgRGF0YScgOiAn8J+MsyBFbmFibGUgVHJlZSBEYXRhJ31cXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImRhdGFncmlkLXRlc3RfX3Rvb2xiYXItZGl2aWRlclxcXCI+PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24gJHtyb3dSZW9yZGVyaW5nID8gJ2RhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1wcmltYXJ5JyA6ICdkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tc2Vjb25kYXJ5J31gfVxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyb3dSZW9yZGVyaW5nKSB7XFxuXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRTb3J0TW9kZWwoW10pO1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0UGlubmVkUm93cyh7IHRvcDogW10sIGJvdHRvbTogW10gfSk7XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0Um93UmVvcmRlcmluZyghcm93UmVvcmRlcmluZyk7XFxuICAgICAgICAgICAgICAgICAgICAgICAgfX1cXG4gICAgICAgICAgICAgICAgICAgID5cXG4gICAgICAgICAgICAgICAgICAgICAgICB7cm93UmVvcmRlcmluZyA/ICfwn5uRIERpc2FibGUgUm93IFJlb3JkZXInIDogJ+KGle+4jyBFbmFibGUgUm93IFJlb3JkZXInfVxcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1kaXZpZGVyXFxcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbiAke2RldGFpbFBhbmVsRW5hYmxlZCA/ICdkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tcHJpbWFyeScgOiAnZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXNlY29uZGFyeSd9YH1cXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldERldGFpbFBhbmVsRW5hYmxlZCghZGV0YWlsUGFuZWxFbmFibGVkKTtcXG5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRldGFpbFBhbmVsRW5hYmxlZCkge1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0RXhwYW5kZWREZXRhaWxQYW5lbFJvd0lkcyhuZXcgU2V0KCkpO1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XFxuICAgICAgICAgICAgICAgICAgICAgICAgfX1cXG4gICAgICAgICAgICAgICAgICAgID5cXG4gICAgICAgICAgICAgICAgICAgICAgICB7ZGV0YWlsUGFuZWxFbmFibGVkID8gJ/Cfk4sgRGlzYWJsZSBEZXRhaWwgUGFuZWwnIDogJ/Cfk4sgRW5hYmxlIERldGFpbCBQYW5lbCd9XFxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgIDxRdWlja0ZpbHRlclxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3F1aWNrRmlsdGVyVmFsdWV9XFxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17c2V0UXVpY2tGaWx0ZXJWYWx1ZX1cXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVxcXCJTZWFyY2ggYWNyb3NzIGFsbCBjb2x1bW5zLi4uXFxcIlxcbiAgICAgICAgICAgICAgICAvPlxcbiAgICAgICAgICAgIDwvZGl2PlxcblxcbiAgICAgICAgICAgIHsgfVxcbiAgICAgICAgICAgIHtzaG93Q29sdW1uUGFuZWwgJiYgKFxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZGF0YWdyaWQtdGVzdF9fY29sdW1uLXBhbmVsXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxDb2x1bW5WaXNpYmlsaXR5UGFuZWxcXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5zPXthbGxDb2x1bW5zfVxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGVDb2x1bW5zPXt2aXNpYmxlQ29sdW1uc31cXG4gICAgICAgICAgICAgICAgICAgICAgICBvblZpc2liaWxpdHlDaGFuZ2U9e2hhbmRsZVZpc2liaWxpdHlDaGFuZ2V9XFxuICAgICAgICAgICAgICAgICAgICAgICAgb25TaG93QWxsPXtoYW5kbGVTaG93QWxsfVxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uSGlkZUFsbD17aGFuZGxlSGlkZUFsbH1cXG4gICAgICAgICAgICAgICAgICAgIC8+XFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICl9XFxuXFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImRhdGFncmlkLXRlc3RfX2dyaWRcXFwiPlxcbiAgICAgICAgICAgICAgICA8RGF0YUdyaWRcXG4gICAgICAgICAgICAgICAgICAgIHJvd3M9e3Jvd3N9XFxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zPXtjb2x1bW5zfVxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PXs2MDB9XFxuICAgICAgICAgICAgICAgICAgICBjaGVja2JveFNlbGVjdGlvblxcbiAgICAgICAgICAgICAgICAgICAgcm93U2VsZWN0aW9uTW9kZWw9e3NlbGVjdGlvbk1vZGVsfVxcbiAgICAgICAgICAgICAgICAgICAgb25Sb3dTZWxlY3Rpb25Nb2RlbENoYW5nZT17c2V0U2VsZWN0aW9uTW9kZWx9XFxuICAgICAgICAgICAgICAgICAgICBzb3J0TW9kZWw9e3NvcnRNb2RlbH1cXG4gICAgICAgICAgICAgICAgICAgIG9uU29ydE1vZGVsQ2hhbmdlPXtzZXRTb3J0TW9kZWx9XFxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJNb2RlbD17ZmlsdGVyTW9kZWx9XFxuICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uXFxuICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uTW9kZWw9e3BhZ2luYXRpb25Nb2RlbH1cXG4gICAgICAgICAgICAgICAgICAgIG9uUGFnaW5hdGlvbk1vZGVsQ2hhbmdlPXtzZXRQYWdpbmF0aW9uTW9kZWx9XFxuICAgICAgICAgICAgICAgICAgICBwYWdlU2l6ZU9wdGlvbnM9e1sxMCwgMjUsIDUwLCAxMDBdfVxcbiAgICAgICAgICAgICAgICAgICAgcGlubmVkQ29sdW1ucz17cGlubmVkQ29sdW1uc31cXG4gICAgICAgICAgICAgICAgICAgIG9uUGlubmVkQ29sdW1uc0NoYW5nZT17c2V0UGlubmVkQ29sdW1uc31cXG4gICAgICAgICAgICAgICAgICAgIHBpbm5lZFJvd3M9e3Bpbm5lZFJvd3N9XFxuICAgICAgICAgICAgICAgICAgICBvblBpbm5lZFJvd3NDaGFuZ2U9e3NldFBpbm5lZFJvd3N9XFxuICAgICAgICAgICAgICAgICAgICBvblJvd0NsaWNrPXsocGFyYW1zKSA9PiBjb25zb2xlLmxvZygnUm93IGNsaWNrZWQ6JywgcGFyYW1zLnJvdyl9XFxuICAgICAgICAgICAgICAgICAgICBvbkNlbGxDbGljaz17KHBhcmFtcykgPT4gY29uc29sZS5sb2coJ0NlbGwgY2xpY2tlZDonLCBwYXJhbXMucm93LCBwYXJhbXMuZmllbGQpfVxcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc1Jvd1VwZGF0ZT17KG5ld1JvdykgPT4ge1xcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSb3cgVXBkYXRlZDonLCBuZXdSb3cpO1xcblxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFJvd3MocHJldiA9PiBwcmV2Lm1hcChyID0+IHIuaWQgPT09IG5ld1Jvdy5pZCA/IChuZXdSb3cgYXMgRW1wbG95ZWUpIDogcikpO1xcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdSb3c7XFxuICAgICAgICAgICAgICAgICAgICB9fVxcbiAgICAgICAgICAgICAgICAgICAgb25Qcm9jZXNzUm93VXBkYXRlRXJyb3I9eyhlcnJvcikgPT4gY29uc29sZS5lcnJvcignUm93IFVwZGF0ZSBFcnJvcjonLCBlcnJvcil9XFxuXFxuICAgICAgICAgICAgICAgICAgICBnZXREZXRhaWxQYW5lbENvbnRlbnQ9e2RldGFpbFBhbmVsRW5hYmxlZCA/IChwYXJhbXMpID0+IChcXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4JywgYmFja2dyb3VuZDogJyNmNWY1ZjUnIH19PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDQgc3R5bGU9e3sgbWFyZ2luOiAnMCAwIDEycHggMCcgfX0+RW1wbG95ZWUgRGV0YWlsczoge3BhcmFtcy5yb3cubmFtZX08L2g0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ3JpZFRlbXBsYXRlQ29sdW1uczogJzFmciAxZnInLCBnYXA6ICc4cHgnIH19PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj48c3Ryb25nPklEOjwvc3Ryb25nPiB7cGFyYW1zLnJvdy5pZH08L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+PHN0cm9uZz5FbWFpbDo8L3N0cm9uZz4ge3BhcmFtcy5yb3cuZW1haWx9PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PjxzdHJvbmc+RGVwYXJ0bWVudDo8L3N0cm9uZz4ge3BhcmFtcy5yb3cuZGVwYXJ0bWVudH08L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+PHN0cm9uZz5Sb2xlOjwvc3Ryb25nPiB7cGFyYW1zLnJvdy5yb2xlfTwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj48c3Ryb25nPlNhbGFyeTo8L3N0cm9uZz4gJHtwYXJhbXMucm93LnNhbGFyeS50b0xvY2FsZVN0cmluZygpfTwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj48c3Ryb25nPkpvaW4gRGF0ZTo8L3N0cm9uZz4ge3BhcmFtcy5yb3cuam9pbkRhdGV9PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgKSA6IHVuZGVmaW5lZH1cXG4gICAgICAgICAgICAgICAgICAgIGdldERldGFpbFBhbmVsSGVpZ2h0PXtkZXRhaWxQYW5lbEVuYWJsZWQgPyAoKSA9PiAxNTAgOiB1bmRlZmluZWR9XFxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxQYW5lbEV4cGFuZGVkUm93SWRzPXtkZXRhaWxQYW5lbEVuYWJsZWQgPyBleHBhbmRlZERldGFpbFBhbmVsUm93SWRzIDogdW5kZWZpbmVkfVxcbiAgICAgICAgICAgICAgICAgICAgb25EZXRhaWxQYW5lbEV4cGFuZGVkUm93SWRzQ2hhbmdlPXtkZXRhaWxQYW5lbEVuYWJsZWQgPyBzZXRFeHBhbmRlZERldGFpbFBhbmVsUm93SWRzIDogdW5kZWZpbmVkfVxcbiAgICAgICAgICAgICAgICAgICAgcGluQ2hlY2tib3hDb2x1bW49e3BpbkNoZWNrYm94Q29sdW1ufVxcbiAgICAgICAgICAgICAgICAgICAgcGluRXhwYW5kQ29sdW1uPXtwaW5FeHBhbmRDb2x1bW59XFxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5PcmRlcj17Y29sdW1uT3JkZXJ9XFxuICAgICAgICAgICAgICAgICAgICBvbkNvbHVtbk9yZGVyQ2hhbmdlPXsocGFyYW1zKSA9PiB7XFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBvbGRJbmRleCwgdGFyZ2V0SW5kZXggfSA9IHBhcmFtcztcXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRDb2x1bW5PcmRlcihwcmV2ID0+IHtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3T3JkZXIgPSBbLi4ucHJldl07XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IFttb3ZlZF0gPSBuZXdPcmRlci5zcGxpY2Uob2xkSW5kZXgsIDEpO1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdPcmRlci5zcGxpY2UodGFyZ2V0SW5kZXgsIDAsIG1vdmVkKTtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ld09yZGVyO1xcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb2x1bW4gcmVvcmRlcmVkOicsIHBhcmFtcyk7XFxuICAgICAgICAgICAgICAgICAgICB9fVxcblxcbiAgICAgICAgICAgICAgICAgICAgcm93R3JvdXBpbmdNb2RlbD17cm93R3JvdXBpbmdNb2RlbH1cXG4gICAgICAgICAgICAgICAgICAgIG9uUm93R3JvdXBpbmdNb2RlbENoYW5nZT17c2V0Um93R3JvdXBpbmdNb2RlbH1cXG4gICAgICAgICAgICAgICAgICAgIGFnZ3JlZ2F0aW9uTW9kZWw9e2FnZ3JlZ2F0aW9uTW9kZWx9XFxuICAgICAgICAgICAgICAgICAgICBvbkFnZ3JlZ2F0aW9uTW9kZWxDaGFuZ2U9e3NldEFnZ3JlZ2F0aW9uTW9kZWx9XFxuXFxuICAgICAgICAgICAgICAgICAgICByb3dSZW9yZGVyaW5nPXtyb3dSZW9yZGVyaW5nfVxcbiAgICAgICAgICAgICAgICAgICAgb25Sb3dPcmRlckNoYW5nZT17KHBhcmFtcykgPT4ge1xcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgb2xkSW5kZXgsIHRhcmdldEluZGV4IH0gPSBwYXJhbXM7XFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1JvdyByZW9yZGVyZWQ6JywgcGFyYW1zKTtcXG5cXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc29ydE1vZGVsLmxlbmd0aCA+IDAgfHwgcXVpY2tGaWx0ZXJWYWx1ZSkge1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGVydCgnUGxlYXNlIGNsZWFyIHNvcnRpbmcgYW5kIGZpbHRlcmluZyB0byB0ZXN0IHJvdyByZW9yZGVyaW5nLicpO1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxcblxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhZ2VPZmZzZXQgPSBwYWdpbmF0aW9uTW9kZWwucGFnZSAqIHBhZ2luYXRpb25Nb2RlbC5wYWdlU2l6ZTtcXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZWFsT2xkSW5kZXggPSBwYWdlT2Zmc2V0ICsgb2xkSW5kZXg7XFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVhbFRhcmdldEluZGV4ID0gcGFnZU9mZnNldCArIHRhcmdldEluZGV4O1xcblxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFJvd3MocHJldiA9PiB7XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1Jvd3MgPSBbLi4ucHJldl07XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IFttb3ZlZF0gPSBuZXdSb3dzLnNwbGljZShyZWFsT2xkSW5kZXgsIDEpO1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdSb3dzLnNwbGljZShyZWFsVGFyZ2V0SW5kZXgsIDAsIG1vdmVkKTtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ld1Jvd3M7XFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XFxuICAgICAgICAgICAgICAgICAgICB9fVxcbiAgICAgICAgICAgICAgICAvPlxcbiAgICAgICAgICAgIDwvZGl2PlxcblxcbiAgICAgICAgPC9Eb2NzTGF5b3V0PlxcbiAgICApO1xcbn1cXG5cXG5leHBvcnQgZGVmYXVsdCBEYXRhR3JpZFRlc3Q7XFxuXCIiLCJcblxuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZU1lbW8gfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBEYXRhR3JpZCB9IGZyb20gJ0BvcGVuY29yZXN0YWNrL29wZW5ncmlkeCc7XG5pbXBvcnQgeyBRdWlja0ZpbHRlciB9IGZyb20gJy4uLy4uLy4uL2xpYi9jb21wb25lbnRzL1F1aWNrRmlsdGVyL1F1aWNrRmlsdGVyJztcbmltcG9ydCB7IENvbHVtblZpc2liaWxpdHlQYW5lbCB9IGZyb20gJy4uLy4uLy4uL2xpYi9jb21wb25lbnRzL0NvbHVtblZpc2liaWxpdHlQYW5lbC9Db2x1bW5WaXNpYmlsaXR5UGFuZWwnO1xuaW1wb3J0IHR5cGUgeyBHcmlkQ29sRGVmLCBHcmlkUm93TW9kZWwsIEdyaWRGaWx0ZXJNb2RlbCwgR3JpZENvbHVtblBpbm5pbmcsIEdyaWRSb3dQaW5uaW5nLCBHcmlkUm93SWQsIEdyaWRSb3dHcm91cGluZ01vZGVsLCBHcmlkQWdncmVnYXRpb25Nb2RlbCB9IGZyb20gJ0BvcGVuY29yZXN0YWNrL29wZW5ncmlkeCc7XG5pbXBvcnQgJy4uLy4uLy4uL2xpYi9jb21wb25lbnRzL1F1aWNrRmlsdGVyL1F1aWNrRmlsdGVyLmNzcyc7XG5pbXBvcnQgJy4uLy4uLy4uL2xpYi9jb21wb25lbnRzL0NvbHVtblZpc2liaWxpdHlQYW5lbC9Db2x1bW5WaXNpYmlsaXR5UGFuZWwuY3NzJztcbmltcG9ydCAnLi9EYXRhR3JpZFRlc3QuY3NzJztcbmltcG9ydCB7IERvY3NMYXlvdXQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL0RvY3NMYXlvdXQnO1xuaW1wb3J0IHNvdXJjZUNvZGUgZnJvbSAnLi9EYXRhR3JpZFRlc3QudHN4P3Jhdyc7XG5cbmludGVyZmFjZSBFbXBsb3llZSBleHRlbmRzIEdyaWRSb3dNb2RlbCB7XG4gICAgaWQ6IG51bWJlcjtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgZW1haWw6IHN0cmluZztcbiAgICBkZXBhcnRtZW50OiBzdHJpbmc7XG4gICAgcm9sZTogc3RyaW5nO1xuICAgIHNhbGFyeTogbnVtYmVyO1xuICAgIGpvaW5EYXRlOiBzdHJpbmc7XG4gICAgcGF0aDogc3RyaW5nW107XG59XG5cbmNvbnN0IGRhdGEgPSBbXG4gICAge1xuICAgICAgICBcImlkXCI6IDEsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDFcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlMUBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJGaW5hbmNlXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRlc2lnbmVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDE0ODQxNyxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjgtMDYtMDhcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRmluYW5jZVwiLFxuICAgICAgICAgICAgXCJEZXNpZ25lclwiLFxuICAgICAgICAgICAgXCJMZWFkXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDFcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogMixcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMlwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUyQGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkFuYWx5c3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTIxOTAzLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNS0wNi0wMlwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICAgICAgXCJBbmFseXN0XCIsXG4gICAgICAgICAgICBcIkxlYWRcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgMlwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAzLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSAzXCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTNAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRW5naW5lZXJpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGVzaWduZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogODgyMTQsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI4LTAzLTExXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgICAgICBcIkRlc2lnbmVyXCIsXG4gICAgICAgICAgICBcIkFzc29jaWF0ZVwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAzXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDQsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDRcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJGaW5hbmNlXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRldmVsb3BlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiA3NDY5MSxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjYtMDgtMThcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRmluYW5jZVwiLFxuICAgICAgICAgICAgXCJEZXZlbG9wZXJcIixcbiAgICAgICAgICAgIFwiSnVuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDRcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNSxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNVwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU1QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIlNhbGVzXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIk1hbmFnZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogODYyNDMsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI1LTA3LTA4XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIlNhbGVzXCIsXG4gICAgICAgICAgICBcIk1hbmFnZXJcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDVcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNixcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNlwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU2QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkZpbmFuY2VcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiA2ODI5OSxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjQtMDgtMzFcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRmluYW5jZVwiLFxuICAgICAgICAgICAgXCJBbmFseXN0XCIsXG4gICAgICAgICAgICBcIkFzc29jaWF0ZVwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA2XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDcsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDdcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlN0Bjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICBcInJvbGVcIjogXCJEZXZlbG9wZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTA1ODQxLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNC0xMC0wNFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICAgICAgXCJEZXZlbG9wZXJcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDdcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogOCxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgOFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU4QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIlNhbGVzXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRldmVsb3BlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMjA5MDgsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI3LTEyLTAyXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIlNhbGVzXCIsXG4gICAgICAgICAgICBcIkRldmVsb3BlclwiLFxuICAgICAgICAgICAgXCJTZW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgOFwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA5LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA5XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTlAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiU2FsZXNcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGVzaWduZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTM5MjU5LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNC0wNS0yNVwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJTYWxlc1wiLFxuICAgICAgICAgICAgXCJEZXNpZ25lclwiLFxuICAgICAgICAgICAgXCJKdW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgOVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAxMCxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMTBcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlMTBAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRmluYW5jZVwiLFxuICAgICAgICBcInJvbGVcIjogXCJBbmFseXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDEzNjIzNixcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjQtMDItMjNcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRmluYW5jZVwiLFxuICAgICAgICAgICAgXCJBbmFseXN0XCIsXG4gICAgICAgICAgICBcIlNlbmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAxMFwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAxMSxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMTFcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlMTFAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRmluYW5jZVwiLFxuICAgICAgICBcInJvbGVcIjogXCJEZXZlbG9wZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTQxMzY2LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNi0xMC0wM1wiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJGaW5hbmNlXCIsXG4gICAgICAgICAgICBcIkRldmVsb3BlclwiLFxuICAgICAgICAgICAgXCJMZWFkXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDExXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDEyLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSAxMlwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUxMkBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJIUlwiLFxuICAgICAgICBcInJvbGVcIjogXCJNYW5hZ2VyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDE0NTcyNixcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjUtMTEtMjJcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiSFJcIixcbiAgICAgICAgICAgIFwiTWFuYWdlclwiLFxuICAgICAgICAgICAgXCJTZW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgMTJcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogMTMsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDEzXCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTEzQGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkZpbmFuY2VcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDU2NjE0LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNC0wOC0xNFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJGaW5hbmNlXCIsXG4gICAgICAgICAgICBcIkRldmVsb3BlclwiLFxuICAgICAgICAgICAgXCJBc3NvY2lhdGVcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgMTNcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogMTQsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDE0XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTE0QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkhSXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRlc2lnbmVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDE0OTY5MixcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjYtMDktMTlcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiSFJcIixcbiAgICAgICAgICAgIFwiRGVzaWduZXJcIixcbiAgICAgICAgICAgIFwiTGVhZFwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAxNFwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAxNSxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMTVcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlMTVAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiU2FsZXNcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDc1NDA1LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNS0wNi0wMlwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJTYWxlc1wiLFxuICAgICAgICAgICAgXCJEZXZlbG9wZXJcIixcbiAgICAgICAgICAgIFwiSnVuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDE1XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDE2LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSAxNlwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUxNkBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICBcInJvbGVcIjogXCJEZXNpZ25lclwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxNDIxNjcsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI4LTAyLTA4XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgICAgICBcIkRlc2lnbmVyXCIsXG4gICAgICAgICAgICBcIkp1bmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAxNlwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAxNyxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMTdcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlMTdAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiSFJcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiTWFuYWdlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxNDc2OTEsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI0LTAyLTIwXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkhSXCIsXG4gICAgICAgICAgICBcIk1hbmFnZXJcIixcbiAgICAgICAgICAgIFwiSnVuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDE3XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDE4LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSAxOFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUxOEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJNYXJrZXRpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiTWFuYWdlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMDgwNDIsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI4LTA1LTE0XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIk1hcmtldGluZ1wiLFxuICAgICAgICAgICAgXCJNYW5hZ2VyXCIsXG4gICAgICAgICAgICBcIkFzc29jaWF0ZVwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAxOFwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAxOSxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMTlcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlMTlAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRmluYW5jZVwiLFxuICAgICAgICBcInJvbGVcIjogXCJNYW5hZ2VyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDExNjU0OCxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjctMDUtMjJcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRmluYW5jZVwiLFxuICAgICAgICAgICAgXCJNYW5hZ2VyXCIsXG4gICAgICAgICAgICBcIlNlbmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAxOVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAyMCxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMjBcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlMjBAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRW5naW5lZXJpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGVzaWduZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTQzNzkxLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyOC0wOC0wNlwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICAgICAgXCJEZXNpZ25lclwiLFxuICAgICAgICAgICAgXCJBc3NvY2lhdGVcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgMjBcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogMjEsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDIxXCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTIxQGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkhSXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIlNwZWNpYWxpc3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTQ4MjE3LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNy0wNC0zMFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJIUlwiLFxuICAgICAgICAgICAgXCJTcGVjaWFsaXN0XCIsXG4gICAgICAgICAgICBcIkFzc29jaWF0ZVwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAyMVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAyMixcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMjJcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlMjJAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiTWFya2V0aW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRldmVsb3BlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMDE2MzksXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI1LTEwLTA4XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIk1hcmtldGluZ1wiLFxuICAgICAgICAgICAgXCJEZXZlbG9wZXJcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDIyXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDIzLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSAyM1wiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUyM0Bjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJGaW5hbmNlXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRldmVsb3BlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxNDYxMTEsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI3LTAzLTEzXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkZpbmFuY2VcIixcbiAgICAgICAgICAgIFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgICAgICBcIkFzc29jaWF0ZVwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAyM1wiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAyNCxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMjRcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlMjRAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiTWFya2V0aW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRldmVsb3BlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiA3NDcwNCxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjUtMDQtMDNcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiTWFya2V0aW5nXCIsXG4gICAgICAgICAgICBcIkRldmVsb3BlclwiLFxuICAgICAgICAgICAgXCJTZW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgMjRcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogMjUsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDI1XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTI1QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIlNhbGVzXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIk1hbmFnZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogNzcxODksXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI4LTAzLTA0XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIlNhbGVzXCIsXG4gICAgICAgICAgICBcIk1hbmFnZXJcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDI1XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDI2LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSAyNlwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUyNkBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICBcInJvbGVcIjogXCJNYW5hZ2VyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDExMzE0OSxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjYtMTAtMDhcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRW5naW5lZXJpbmdcIixcbiAgICAgICAgICAgIFwiTWFuYWdlclwiLFxuICAgICAgICAgICAgXCJMZWFkXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDI2XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDI3LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSAyN1wiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUyN0Bjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJGaW5hbmNlXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRlc2lnbmVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDkxMjY2LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNi0wMi0xMFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJGaW5hbmNlXCIsXG4gICAgICAgICAgICBcIkRlc2lnbmVyXCIsXG4gICAgICAgICAgICBcIkp1bmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAyN1wiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAyOCxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMjhcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlMjhAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiSFJcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiTWFuYWdlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiA5NDQ3OCxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjctMDMtMTZcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiSFJcIixcbiAgICAgICAgICAgIFwiTWFuYWdlclwiLFxuICAgICAgICAgICAgXCJBc3NvY2lhdGVcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgMjhcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogMjksXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDI5XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTI5QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkhSXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRlc2lnbmVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDkyMDg0LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNS0xMi0yN1wiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJIUlwiLFxuICAgICAgICAgICAgXCJEZXNpZ25lclwiLFxuICAgICAgICAgICAgXCJTZW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgMjlcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogMzAsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDMwXCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTMwQGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIlNhbGVzXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRlc2lnbmVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDUwNDQ5LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNi0wMi0xMFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJTYWxlc1wiLFxuICAgICAgICAgICAgXCJEZXNpZ25lclwiLFxuICAgICAgICAgICAgXCJMZWFkXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDMwXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDMxLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSAzMVwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUzMUBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJGaW5hbmNlXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIlNwZWNpYWxpc3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogOTAwNjUsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI1LTA5LTI0XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkZpbmFuY2VcIixcbiAgICAgICAgICAgIFwiU3BlY2lhbGlzdFwiLFxuICAgICAgICAgICAgXCJMZWFkXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDMxXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDMyLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSAzMlwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUzMkBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJNYXJrZXRpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiA5MTA0NixcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjQtMTItMTFcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiTWFya2V0aW5nXCIsXG4gICAgICAgICAgICBcIkFuYWx5c3RcIixcbiAgICAgICAgICAgIFwiTGVhZFwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAzMlwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAzMyxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMzNcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlMzNAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRmluYW5jZVwiLFxuICAgICAgICBcInJvbGVcIjogXCJEZXNpZ25lclwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMDgxODIsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI0LTA0LTAyXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkZpbmFuY2VcIixcbiAgICAgICAgICAgIFwiRGVzaWduZXJcIixcbiAgICAgICAgICAgIFwiSnVuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDMzXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDM0LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSAzNFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUzNEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJGaW5hbmNlXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkFuYWx5c3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogODE1ODAsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI3LTA4LTA2XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkZpbmFuY2VcIixcbiAgICAgICAgICAgIFwiQW5hbHlzdFwiLFxuICAgICAgICAgICAgXCJTZW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgMzRcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogMzUsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDM1XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTM1QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIlNhbGVzXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIlNwZWNpYWxpc3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTIzNjU5LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNS0wOS0xNFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJTYWxlc1wiLFxuICAgICAgICAgICAgXCJTcGVjaWFsaXN0XCIsXG4gICAgICAgICAgICBcIkxlYWRcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgMzVcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogMzYsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDM2XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTM2QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkhSXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIlNwZWNpYWxpc3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTQ5NDEwLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyOC0wMy0wNlwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJIUlwiLFxuICAgICAgICAgICAgXCJTcGVjaWFsaXN0XCIsXG4gICAgICAgICAgICBcIkFzc29jaWF0ZVwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAzNlwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAzNyxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgMzdcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlMzdAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRW5naW5lZXJpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiA1ODk4NCxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjQtMDMtMDNcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRW5naW5lZXJpbmdcIixcbiAgICAgICAgICAgIFwiQW5hbHlzdFwiLFxuICAgICAgICAgICAgXCJBc3NvY2lhdGVcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgMzdcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogMzgsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDM4XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTM4QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRlc2lnbmVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDY3NzMyLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNy0wNS0xMlwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICAgICAgXCJEZXNpZ25lclwiLFxuICAgICAgICAgICAgXCJBc3NvY2lhdGVcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgMzhcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogMzksXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDM5XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTM5QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkZpbmFuY2VcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiA2MzcwNSxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjgtMDEtMjdcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRmluYW5jZVwiLFxuICAgICAgICAgICAgXCJBbmFseXN0XCIsXG4gICAgICAgICAgICBcIkFzc29jaWF0ZVwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSAzOVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA0MCxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNDBcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNDBAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiTWFya2V0aW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIk1hbmFnZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogOTgwNDgsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI2LTExLTI3XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIk1hcmtldGluZ1wiLFxuICAgICAgICAgICAgXCJNYW5hZ2VyXCIsXG4gICAgICAgICAgICBcIkp1bmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA0MFwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA0MSxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNDFcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNDFAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRmluYW5jZVwiLFxuICAgICAgICBcInJvbGVcIjogXCJTcGVjaWFsaXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDk2MzA2LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNS0wNy0xOFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJGaW5hbmNlXCIsXG4gICAgICAgICAgICBcIlNwZWNpYWxpc3RcIixcbiAgICAgICAgICAgIFwiSnVuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDQxXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDQyLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA0MlwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU0MkBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICBcInJvbGVcIjogXCJEZXZlbG9wZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTQyMzcwLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNy0wOC0wNFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICAgICAgXCJEZXZlbG9wZXJcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDQyXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDQzLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA0M1wiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU0M0Bjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJTYWxlc1wiLFxuICAgICAgICBcInJvbGVcIjogXCJNYW5hZ2VyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDEzNDQ0NyxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjUtMDQtMThcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiU2FsZXNcIixcbiAgICAgICAgICAgIFwiTWFuYWdlclwiLFxuICAgICAgICAgICAgXCJTZW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNDNcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNDQsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDQ0XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTQ0QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIk1hcmtldGluZ1wiLFxuICAgICAgICBcInJvbGVcIjogXCJEZXZlbG9wZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogODk4MDAsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI2LTA0LTI3XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIk1hcmtldGluZ1wiLFxuICAgICAgICAgICAgXCJEZXZlbG9wZXJcIixcbiAgICAgICAgICAgIFwiTGVhZFwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA0NFwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA0NSxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNDVcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNDVAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiTWFya2V0aW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRlc2lnbmVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDk2MDg2LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNC0wNS0xM1wiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJNYXJrZXRpbmdcIixcbiAgICAgICAgICAgIFwiRGVzaWduZXJcIixcbiAgICAgICAgICAgIFwiSnVuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDQ1XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDQ2LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA0NlwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU0NkBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJTYWxlc1wiLFxuICAgICAgICBcInJvbGVcIjogXCJNYW5hZ2VyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDExNTU2MSxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjUtMDctMDVcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiU2FsZXNcIixcbiAgICAgICAgICAgIFwiTWFuYWdlclwiLFxuICAgICAgICAgICAgXCJBc3NvY2lhdGVcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNDZcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNDcsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDQ3XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTQ3QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIk1hcmtldGluZ1wiLFxuICAgICAgICBcInJvbGVcIjogXCJBbmFseXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDc3NDE0LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNi0wMi0xNVwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJNYXJrZXRpbmdcIixcbiAgICAgICAgICAgIFwiQW5hbHlzdFwiLFxuICAgICAgICAgICAgXCJBc3NvY2lhdGVcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNDdcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNDgsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDQ4XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTQ4QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkZpbmFuY2VcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiA1MDU0NSxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjYtMTItMjRcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRmluYW5jZVwiLFxuICAgICAgICAgICAgXCJBbmFseXN0XCIsXG4gICAgICAgICAgICBcIkFzc29jaWF0ZVwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA0OFwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA0OSxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNDlcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNDlAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiTWFya2V0aW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIk1hbmFnZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogNjEyNjcsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI4LTA0LTAxXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIk1hcmtldGluZ1wiLFxuICAgICAgICAgICAgXCJNYW5hZ2VyXCIsXG4gICAgICAgICAgICBcIkFzc29jaWF0ZVwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA0OVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA1MCxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNTBcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNTBAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiSFJcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGVzaWduZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTMwNzc1LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNS0wNS0yMFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJIUlwiLFxuICAgICAgICAgICAgXCJEZXNpZ25lclwiLFxuICAgICAgICAgICAgXCJKdW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNTBcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNTEsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDUxXCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTUxQGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkZpbmFuY2VcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiA2MTI5MSxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjYtMTAtMDZcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRmluYW5jZVwiLFxuICAgICAgICAgICAgXCJBbmFseXN0XCIsXG4gICAgICAgICAgICBcIkxlYWRcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNTFcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNTIsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDUyXCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTUyQGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkZpbmFuY2VcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDEyMTc0NCxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjQtMDctMTJcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRmluYW5jZVwiLFxuICAgICAgICAgICAgXCJEZXZlbG9wZXJcIixcbiAgICAgICAgICAgIFwiTGVhZFwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA1MlwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA1MyxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNTNcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNTNAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRW5naW5lZXJpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMDg0OTIsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI1LTA1LTA0XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgICAgICBcIkFuYWx5c3RcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDUzXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDU0LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA1NFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU1NEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICBcInJvbGVcIjogXCJBbmFseXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDcyMTg5LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyOC0xMC0wNlwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICAgICAgXCJBbmFseXN0XCIsXG4gICAgICAgICAgICBcIkxlYWRcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNTRcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNTUsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDU1XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTU1QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIlNhbGVzXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRlc2lnbmVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDEwNTMyOCxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjctMDUtMDdcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiU2FsZXNcIixcbiAgICAgICAgICAgIFwiRGVzaWduZXJcIixcbiAgICAgICAgICAgIFwiU2VuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDU1XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDU2LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA1NlwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU1NkBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJIUlwiLFxuICAgICAgICBcInJvbGVcIjogXCJEZXNpZ25lclwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMDI3NzEsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI3LTA1LTIwXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkhSXCIsXG4gICAgICAgICAgICBcIkRlc2lnbmVyXCIsXG4gICAgICAgICAgICBcIlNlbmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA1NlwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA1NyxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNTdcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNTdAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiSFJcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDE0MDA4NSxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjgtMDctMDVcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiSFJcIixcbiAgICAgICAgICAgIFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgICAgICBcIkp1bmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA1N1wiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA1OCxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNThcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNThAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRmluYW5jZVwiLFxuICAgICAgICBcInJvbGVcIjogXCJTcGVjaWFsaXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDc5NTAyLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNC0wMS0wOFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJGaW5hbmNlXCIsXG4gICAgICAgICAgICBcIlNwZWNpYWxpc3RcIixcbiAgICAgICAgICAgIFwiSnVuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDU4XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDU5LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA1OVwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU1OUBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJGaW5hbmNlXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkFuYWx5c3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTEwNjI0LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNC0wMS0zMVwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJGaW5hbmNlXCIsXG4gICAgICAgICAgICBcIkFuYWx5c3RcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDU5XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDYwLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA2MFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU2MEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJGaW5hbmNlXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRlc2lnbmVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDExMzMxOCxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjQtMDgtMjVcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRmluYW5jZVwiLFxuICAgICAgICAgICAgXCJEZXNpZ25lclwiLFxuICAgICAgICAgICAgXCJBc3NvY2lhdGVcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNjBcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNjEsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDYxXCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTYxQGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIlNhbGVzXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIlNwZWNpYWxpc3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTM0MTYyLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNi0xMS0xOFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJTYWxlc1wiLFxuICAgICAgICAgICAgXCJTcGVjaWFsaXN0XCIsXG4gICAgICAgICAgICBcIkp1bmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA2MVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA2MixcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNjJcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNjJAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiTWFya2V0aW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRldmVsb3BlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiA2NzEzNCxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjctMTEtMjRcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiTWFya2V0aW5nXCIsXG4gICAgICAgICAgICBcIkRldmVsb3BlclwiLFxuICAgICAgICAgICAgXCJBc3NvY2lhdGVcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNjJcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNjMsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDYzXCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTYzQGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkhSXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRlc2lnbmVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDkwMDA1LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNS0wNi0wNFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJIUlwiLFxuICAgICAgICAgICAgXCJEZXNpZ25lclwiLFxuICAgICAgICAgICAgXCJTZW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNjNcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNjQsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDY0XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTY0QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkZpbmFuY2VcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiA3NzgwNixcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjctMDctMjdcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRmluYW5jZVwiLFxuICAgICAgICAgICAgXCJBbmFseXN0XCIsXG4gICAgICAgICAgICBcIkxlYWRcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNjRcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNjUsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDY1XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTY1QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIlNhbGVzXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkFuYWx5c3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogNTE3NTMsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI4LTA5LTIxXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIlNhbGVzXCIsXG4gICAgICAgICAgICBcIkFuYWx5c3RcIixcbiAgICAgICAgICAgIFwiTGVhZFwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA2NVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA2NixcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNjZcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNjZAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiTWFya2V0aW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIlNwZWNpYWxpc3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTQ0NTY5LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyOC0wMS0xOVwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJNYXJrZXRpbmdcIixcbiAgICAgICAgICAgIFwiU3BlY2lhbGlzdFwiLFxuICAgICAgICAgICAgXCJKdW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNjZcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNjcsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDY3XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTY3QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIk1hbmFnZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogNjQ1NDgsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI3LTAzLTE0XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgICAgICBcIk1hbmFnZXJcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDY3XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDY4LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA2OFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU2OEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJNYXJrZXRpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiU3BlY2lhbGlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiA4NjY1OSxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjctMTEtMjdcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiTWFya2V0aW5nXCIsXG4gICAgICAgICAgICBcIlNwZWNpYWxpc3RcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDY4XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDY5LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA2OVwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU2OUBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJIUlwiLFxuICAgICAgICBcInJvbGVcIjogXCJTcGVjaWFsaXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDg1NjgwLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNy0wNi0yM1wiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJIUlwiLFxuICAgICAgICAgICAgXCJTcGVjaWFsaXN0XCIsXG4gICAgICAgICAgICBcIkp1bmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA2OVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA3MCxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNzBcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNzBAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiSFJcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMzkyMzMsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI3LTA3LTE3XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkhSXCIsXG4gICAgICAgICAgICBcIkFuYWx5c3RcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDcwXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDcxLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA3MVwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU3MUBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJIUlwiLFxuICAgICAgICBcInJvbGVcIjogXCJNYW5hZ2VyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDgwMTEyLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNi0xMi0wNlwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJIUlwiLFxuICAgICAgICAgICAgXCJNYW5hZ2VyXCIsXG4gICAgICAgICAgICBcIkFzc29jaWF0ZVwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA3MVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA3MixcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNzJcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNzJAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiU2FsZXNcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiU3BlY2lhbGlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiA1NDczMixcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjQtMDgtMjNcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiU2FsZXNcIixcbiAgICAgICAgICAgIFwiU3BlY2lhbGlzdFwiLFxuICAgICAgICAgICAgXCJTZW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNzJcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNzMsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDczXCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTczQGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkhSXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkFuYWx5c3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTI1MTI3LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyOC0wMS0wOFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJIUlwiLFxuICAgICAgICAgICAgXCJBbmFseXN0XCIsXG4gICAgICAgICAgICBcIlNlbmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA3M1wiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA3NCxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNzRcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNzRAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiU2FsZXNcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMjAzMjIsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI4LTA2LTE5XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIlNhbGVzXCIsXG4gICAgICAgICAgICBcIkFuYWx5c3RcIixcbiAgICAgICAgICAgIFwiTGVhZFwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA3NFwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA3NSxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNzVcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNzVAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiTWFya2V0aW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIk1hbmFnZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogOTU3ODksXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI3LTEwLTIzXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIk1hcmtldGluZ1wiLFxuICAgICAgICAgICAgXCJNYW5hZ2VyXCIsXG4gICAgICAgICAgICBcIkFzc29jaWF0ZVwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA3NVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA3NixcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNzZcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNzZAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRmluYW5jZVwiLFxuICAgICAgICBcInJvbGVcIjogXCJNYW5hZ2VyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDEyMTgwOCxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjctMTAtMjdcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRmluYW5jZVwiLFxuICAgICAgICAgICAgXCJNYW5hZ2VyXCIsXG4gICAgICAgICAgICBcIkp1bmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA3NlwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA3NyxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgNzdcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlNzdAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiU2FsZXNcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiU3BlY2lhbGlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMDg5MzMsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI1LTAyLTA1XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIlNhbGVzXCIsXG4gICAgICAgICAgICBcIlNwZWNpYWxpc3RcIixcbiAgICAgICAgICAgIFwiU2VuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDc3XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDc4LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA3OFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU3OEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJGaW5hbmNlXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIk1hbmFnZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogNTA5NDYsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI2LTExLTIwXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkZpbmFuY2VcIixcbiAgICAgICAgICAgIFwiTWFuYWdlclwiLFxuICAgICAgICAgICAgXCJTZW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgNzhcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogNzksXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDc5XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTc5QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIk1hcmtldGluZ1wiLFxuICAgICAgICBcInJvbGVcIjogXCJNYW5hZ2VyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDEwMDk2NSxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjQtMDQtMjFcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiTWFya2V0aW5nXCIsXG4gICAgICAgICAgICBcIk1hbmFnZXJcIixcbiAgICAgICAgICAgIFwiTGVhZFwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA3OVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA4MCxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgODBcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlODBAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiTWFya2V0aW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkFuYWx5c3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogNTQ1NDgsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI2LTA0LTA1XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIk1hcmtldGluZ1wiLFxuICAgICAgICAgICAgXCJBbmFseXN0XCIsXG4gICAgICAgICAgICBcIkp1bmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA4MFwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA4MSxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgODFcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlODFAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiTWFya2V0aW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkFuYWx5c3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTM1ODgzLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNy0wOC0xN1wiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJNYXJrZXRpbmdcIixcbiAgICAgICAgICAgIFwiQW5hbHlzdFwiLFxuICAgICAgICAgICAgXCJTZW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgODFcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogODIsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDgyXCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTgyQGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIlNhbGVzXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRldmVsb3BlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiA1MjIxNixcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjQtMDQtMjNcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiU2FsZXNcIixcbiAgICAgICAgICAgIFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgICAgICBcIkp1bmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA4MlwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA4MyxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgODNcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlODNAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRW5naW5lZXJpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDExMDI5MCxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjUtMTEtMTRcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRW5naW5lZXJpbmdcIixcbiAgICAgICAgICAgIFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgICAgICBcIkp1bmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA4M1wiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA4NCxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgODRcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlODRAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiU2FsZXNcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDE0MDUyMixcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjQtMDktMTFcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiU2FsZXNcIixcbiAgICAgICAgICAgIFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgICAgICBcIkp1bmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA4NFwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA4NSxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgODVcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlODVAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRW5naW5lZXJpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiU3BlY2lhbGlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiA4NDQ4NSxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjYtMDktMjNcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiRW5naW5lZXJpbmdcIixcbiAgICAgICAgICAgIFwiU3BlY2lhbGlzdFwiLFxuICAgICAgICAgICAgXCJKdW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgODVcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogODYsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDg2XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTg2QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkZpbmFuY2VcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGVzaWduZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTMzMDMyLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNC0wMy0yN1wiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJGaW5hbmNlXCIsXG4gICAgICAgICAgICBcIkRlc2lnbmVyXCIsXG4gICAgICAgICAgICBcIkFzc29jaWF0ZVwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA4NlwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA4NyxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgODdcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlODdAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiRW5naW5lZXJpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxNDg4NjEsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI0LTExLTIxXCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkVuZ2luZWVyaW5nXCIsXG4gICAgICAgICAgICBcIkFuYWx5c3RcIixcbiAgICAgICAgICAgIFwiU2VuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDg3XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDg4LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA4OFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU4OEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJNYXJrZXRpbmdcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiA1NTYxMyxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjgtMTEtMjBcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiTWFya2V0aW5nXCIsXG4gICAgICAgICAgICBcIkFuYWx5c3RcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDg4XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDg5LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA4OVwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU4OUBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICBcInJvbGVcIjogXCJTcGVjaWFsaXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDYxMDgxLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNC0xMS0yNVwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICAgICAgXCJTcGVjaWFsaXN0XCIsXG4gICAgICAgICAgICBcIkFzc29jaWF0ZVwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA4OVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA5MCxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgOTBcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlOTBAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiTWFya2V0aW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRldmVsb3BlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxMzUzMjgsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI0LTAyLTA4XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIk1hcmtldGluZ1wiLFxuICAgICAgICAgICAgXCJEZXZlbG9wZXJcIixcbiAgICAgICAgICAgIFwiU2VuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDkwXCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDkxLFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA5MVwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU5MUBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJIUlwiLFxuICAgICAgICBcInJvbGVcIjogXCJEZXNpZ25lclwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxNDUxOTYsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI1LTA4LTI3XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkhSXCIsXG4gICAgICAgICAgICBcIkRlc2lnbmVyXCIsXG4gICAgICAgICAgICBcIkp1bmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA5MVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA5MixcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgOTJcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlOTJAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiSFJcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiAxNDk4NzQsXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI4LTA4LTA0XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkhSXCIsXG4gICAgICAgICAgICBcIkFuYWx5c3RcIixcbiAgICAgICAgICAgIFwiTGVhZFwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA5MlwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA5MyxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgOTNcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlOTNAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiSFJcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGVzaWduZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogNTExNDksXG4gICAgICAgIFwiam9pbkRhdGVcIjogXCIyMDI2LTEyLTA4XCIsXG4gICAgICAgIFwicGF0aFwiOiBbXG4gICAgICAgICAgICBcIkhSXCIsXG4gICAgICAgICAgICBcIkRlc2lnbmVyXCIsXG4gICAgICAgICAgICBcIkp1bmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA5M1wiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA5NCxcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgOTRcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlOTRAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiTWFya2V0aW5nXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkFuYWx5c3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTI5MzY2LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNS0wNy0yNlwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJNYXJrZXRpbmdcIixcbiAgICAgICAgICAgIFwiQW5hbHlzdFwiLFxuICAgICAgICAgICAgXCJMZWFkXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDk0XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDk1LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA5NVwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU5NUBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJGaW5hbmNlXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkFuYWx5c3RcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTMyNTg5LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNS0xMC0wOFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJGaW5hbmNlXCIsXG4gICAgICAgICAgICBcIkFuYWx5c3RcIixcbiAgICAgICAgICAgIFwiTGVhZFwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA5NVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiA5NixcbiAgICAgICAgXCJuYW1lXCI6IFwiRW1wbG95ZWUgOTZcIixcbiAgICAgICAgXCJlbWFpbFwiOiBcImVtcGxveWVlOTZAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiU2FsZXNcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDU3OTE3LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNS0wNS0zMVwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJTYWxlc1wiLFxuICAgICAgICAgICAgXCJEZXZlbG9wZXJcIixcbiAgICAgICAgICAgIFwiU2VuaW9yXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDk2XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDk3LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA5N1wiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU5N0Bjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJGaW5hbmNlXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIk1hbmFnZXJcIixcbiAgICAgICAgXCJzYWxhcnlcIjogMTA3ODgzLFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyNi0xMi0wMlwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJGaW5hbmNlXCIsXG4gICAgICAgICAgICBcIk1hbmFnZXJcIixcbiAgICAgICAgICAgIFwiQXNzb2NpYXRlXCIsXG4gICAgICAgICAgICBcIkVtcGxveWVlIDk3XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgICBcImlkXCI6IDk4LFxuICAgICAgICBcIm5hbWVcIjogXCJFbXBsb3llZSA5OFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWU5OEBjb21wYW55LmNvbVwiLFxuICAgICAgICBcImRlcGFydG1lbnRcIjogXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICBcInJvbGVcIjogXCJTcGVjaWFsaXN0XCIsXG4gICAgICAgIFwic2FsYXJ5XCI6IDk5MDM3LFxuICAgICAgICBcImpvaW5EYXRlXCI6IFwiMjAyOC0wMy0wOFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgICAgXCJFbmdpbmVlcmluZ1wiLFxuICAgICAgICAgICAgXCJTcGVjaWFsaXN0XCIsXG4gICAgICAgICAgICBcIkxlYWRcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgOThcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiaWRcIjogOTksXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDk5XCIsXG4gICAgICAgIFwiZW1haWxcIjogXCJlbXBsb3llZTk5QGNvbXBhbnkuY29tXCIsXG4gICAgICAgIFwiZGVwYXJ0bWVudFwiOiBcIkhSXCIsXG4gICAgICAgIFwicm9sZVwiOiBcIkRldmVsb3BlclwiLFxuICAgICAgICBcInNhbGFyeVwiOiA2OTIzOCxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjQtMDEtMThcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiSFJcIixcbiAgICAgICAgICAgIFwiRGV2ZWxvcGVyXCIsXG4gICAgICAgICAgICBcIkp1bmlvclwiLFxuICAgICAgICAgICAgXCJFbXBsb3llZSA5OVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJpZFwiOiAxMDAsXG4gICAgICAgIFwibmFtZVwiOiBcIkVtcGxveWVlIDEwMFwiLFxuICAgICAgICBcImVtYWlsXCI6IFwiZW1wbG95ZWUxMDBAY29tcGFueS5jb21cIixcbiAgICAgICAgXCJkZXBhcnRtZW50XCI6IFwiU2FsZXNcIixcbiAgICAgICAgXCJyb2xlXCI6IFwiQW5hbHlzdFwiLFxuICAgICAgICBcInNhbGFyeVwiOiA3NTU5MCxcbiAgICAgICAgXCJqb2luRGF0ZVwiOiBcIjIwMjUtMDUtMjJcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICAgIFwiU2FsZXNcIixcbiAgICAgICAgICAgIFwiQW5hbHlzdFwiLFxuICAgICAgICAgICAgXCJKdW5pb3JcIixcbiAgICAgICAgICAgIFwiRW1wbG95ZWUgMTAwXCJcbiAgICAgICAgXVxuICAgIH1cbl1cblxuY29uc3QgYWxsQ29sdW1uczogR3JpZENvbERlZjxFbXBsb3llZT5bXSA9IFtcbiAgICB7XG4gICAgICAgIGZpZWxkOiAnaWQnLFxuICAgICAgICBoZWFkZXJOYW1lOiAnSUQnLFxuICAgICAgICB3aWR0aDogMjcwLFxuICAgICAgICBhbGlnbjogJ2NlbnRlcicsXG4gICAgICAgIGhlYWRlckFsaWduOiAnY2VudGVyJyxcbiAgICAgICAgaGlkZWFibGU6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGZpZWxkOiAnbmFtZScsXG4gICAgICAgIGhlYWRlck5hbWU6ICdOYW1lJyxcbiAgICAgICAgd2lkdGg6IDE4MCxcbiAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgIGVkaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGZpZWxkOiAnZW1haWwnLFxuICAgICAgICBoZWFkZXJOYW1lOiAnRW1haWwnLFxuICAgICAgICB3aWR0aDogMjUwLFxuICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgZWRpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIHtcbiAgICAgICAgZmllbGQ6ICdkZXBhcnRtZW50JyxcbiAgICAgICAgaGVhZGVyTmFtZTogJ0RlcGFydG1lbnQnLFxuICAgICAgICB3aWR0aDogMTUwLFxuICAgICAgICBzb3J0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgICBmaWVsZDogJ3JvbGUnLFxuICAgICAgICBoZWFkZXJOYW1lOiAnUm9sZScsXG4gICAgICAgIHdpZHRoOiAxNTAsXG4gICAgICAgIHNvcnRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGZpZWxkOiAnc2FsYXJ5JyxcbiAgICAgICAgaGVhZGVyTmFtZTogJ1NhbGFyeScsXG4gICAgICAgIHdpZHRoOiAxMzAsXG4gICAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgaGVhZGVyQWxpZ246ICdyaWdodCcsXG4gICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICBlZGl0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IGAkJHtwYXJhbXMudmFsdWUudG9Mb2NhbGVTdHJpbmcoKX1gXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGZpZWxkOiAnam9pbkRhdGUnLFxuICAgICAgICBoZWFkZXJOYW1lOiAnSm9pbiBEYXRlJyxcbiAgICAgICAgd2lkdGg6IDEzMCxcbiAgICAgICAgc29ydGFibGU6IHRydWVcbiAgICB9XG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gRGF0YUdyaWRUZXN0KCkge1xuICAgIGNvbnN0IFtyb3dzLCBzZXRSb3dzXSA9IHVzZVN0YXRlPEVtcGxveWVlW10+KGRhdGEpO1xuICAgIGNvbnN0IFtzZWxlY3Rpb25Nb2RlbCwgc2V0U2VsZWN0aW9uTW9kZWxdID0gdXNlU3RhdGU8QXJyYXk8c3RyaW5nIHwgbnVtYmVyPj4oW10pO1xuICAgIGNvbnN0IFtzb3J0TW9kZWwsIHNldFNvcnRNb2RlbF0gPSB1c2VTdGF0ZTxBcnJheTx7IGZpZWxkOiBzdHJpbmc7IHNvcnQ6ICdhc2MnIHwgJ2Rlc2MnIH0+PihbXSk7XG4gICAgY29uc3QgW3BhZ2luYXRpb25Nb2RlbCwgc2V0UGFnaW5hdGlvbk1vZGVsXSA9IHVzZVN0YXRlKHsgcGFnZTogMCwgcGFnZVNpemU6IDI1IH0pO1xuICAgIGNvbnN0IFtxdWlja0ZpbHRlclZhbHVlLCBzZXRRdWlja0ZpbHRlclZhbHVlXSA9IHVzZVN0YXRlKCcnKTtcbiAgICBjb25zdCBbc2hvd0NvbHVtblBhbmVsLCBzZXRTaG93Q29sdW1uUGFuZWxdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFt2aXNpYmxlQ29sdW1ucywgc2V0VmlzaWJsZUNvbHVtbnNdID0gdXNlU3RhdGU8U2V0PHN0cmluZz4+KFxuICAgICAgICAoKSA9PiBuZXcgU2V0KGFsbENvbHVtbnMubWFwKGNvbCA9PiBjb2wuZmllbGQpKVxuICAgICk7XG4gICAgY29uc3QgW3Bpbm5lZENvbHVtbnMsIHNldFBpbm5lZENvbHVtbnNdID0gdXNlU3RhdGU8R3JpZENvbHVtblBpbm5pbmc+KHtcbiAgICAgICAgbGVmdDogWydpZCcsICduYW1lJ10sXG4gICAgICAgIHJpZ2h0OiBbXVxuICAgIH0pO1xuICAgIGNvbnN0IFtwaW5uZWRSb3dzLCBzZXRQaW5uZWRSb3dzXSA9IHVzZVN0YXRlPEdyaWRSb3dQaW5uaW5nPih7XG4gICAgICAgIHRvcDogWzEsIDJdLFxuICAgICAgICBib3R0b206IFtdXG4gICAgfSk7XG4gICAgY29uc3QgW2V4cGFuZGVkRGV0YWlsUGFuZWxSb3dJZHMsIHNldEV4cGFuZGVkRGV0YWlsUGFuZWxSb3dJZHNdID0gdXNlU3RhdGU8U2V0PEdyaWRSb3dJZD4+KG5ldyBTZXQoKSk7XG4gICAgY29uc3QgW2NvbHVtbk9yZGVyLCBzZXRDb2x1bW5PcmRlcl0gPSB1c2VTdGF0ZTxzdHJpbmdbXT4oKCkgPT4gYWxsQ29sdW1ucy5tYXAoY29sID0+IGNvbC5maWVsZCkpO1xuICAgIGNvbnN0IFtwaW5DaGVja2JveENvbHVtbiwgc2V0UGluQ2hlY2tib3hDb2x1bW5dID0gdXNlU3RhdGUodHJ1ZSk7XG4gICAgY29uc3QgW3BpbkV4cGFuZENvbHVtbiwgc2V0UGluRXhwYW5kQ29sdW1uXSA9IHVzZVN0YXRlKHRydWUpO1xuICAgIGNvbnN0IFtyb3dSZW9yZGVyaW5nLCBzZXRSb3dSZW9yZGVyaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbdHJlZURhdGEsIHNldFRyZWVEYXRhXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbcm93R3JvdXBpbmdNb2RlbCwgc2V0Um93R3JvdXBpbmdNb2RlbF0gPSB1c2VTdGF0ZTxHcmlkUm93R3JvdXBpbmdNb2RlbD4oW10pO1xuICAgIGNvbnN0IFthZ2dyZWdhdGlvbk1vZGVsLCBzZXRBZ2dyZWdhdGlvbk1vZGVsXSA9IHVzZVN0YXRlPEdyaWRBZ2dyZWdhdGlvbk1vZGVsPih7fSk7XG4gICAgY29uc3QgW2RldGFpbFBhbmVsRW5hYmxlZCwgc2V0RGV0YWlsUGFuZWxFbmFibGVkXSA9IHVzZVN0YXRlKHRydWUpO1xuXG4gICAgY29uc3QgY29sdW1ucyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICByZXR1cm4gYWxsQ29sdW1ucy5maWx0ZXIoY29sID0+IHZpc2libGVDb2x1bW5zLmhhcyhjb2wuZmllbGQpKTtcbiAgICB9LCBbdmlzaWJsZUNvbHVtbnNdKTtcblxuICAgIGNvbnN0IGZpbHRlck1vZGVsOiBHcmlkRmlsdGVyTW9kZWwgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFxdWlja0ZpbHRlclZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4geyBpdGVtczogW10gfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaXRlbXM6IFtdLFxuICAgICAgICAgICAgcXVpY2tGaWx0ZXJWYWx1ZXM6IFtxdWlja0ZpbHRlclZhbHVlXVxuICAgICAgICB9O1xuICAgIH0sIFtxdWlja0ZpbHRlclZhbHVlXSk7XG5cbiAgICBjb25zdCBmaWx0ZXJlZFJvd0NvdW50ID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghcXVpY2tGaWx0ZXJWYWx1ZSkgcmV0dXJuIHJvd3MubGVuZ3RoO1xuXG4gICAgICAgIHJldHVybiByb3dzLmZpbHRlcihyb3cgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2VhcmNoVGVybSA9IHF1aWNrRmlsdGVyVmFsdWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3QudmFsdWVzKHJvdykuc29tZSh2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFRlcm0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLmxlbmd0aDtcbiAgICB9LCBbcm93cywgcXVpY2tGaWx0ZXJWYWx1ZV0pO1xuXG4gICAgY29uc3QgaGFuZGxlVmlzaWJpbGl0eUNoYW5nZSA9IChmaWVsZDogc3RyaW5nLCBpc1Zpc2libGU6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgc2V0VmlzaWJsZUNvbHVtbnMocHJldiA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXh0ID0gbmV3IFNldChwcmV2KTtcbiAgICAgICAgICAgIGlmIChpc1Zpc2libGUpIHtcbiAgICAgICAgICAgICAgICBuZXh0LmFkZChmaWVsZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5leHQuZGVsZXRlKGZpZWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29uc3QgaGFuZGxlU2hvd0FsbCA9ICgpID0+IHtcbiAgICAgICAgc2V0VmlzaWJsZUNvbHVtbnMobmV3IFNldChhbGxDb2x1bW5zLm1hcChjb2wgPT4gY29sLmZpZWxkKSkpO1xuICAgIH07XG5cbiAgICBjb25zdCBoYW5kbGVIaWRlQWxsID0gKCkgPT4ge1xuXG4gICAgICAgIHNldFZpc2libGVDb2x1bW5zKG5ldyBTZXQoYWxsQ29sdW1ucy5maWx0ZXIoY29sID0+IGNvbC5oaWRlYWJsZSA9PT0gZmFsc2UpLm1hcChjb2wgPT4gY29sLmZpZWxkKSkpO1xuICAgIH07XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8RG9jc0xheW91dFxuICAgICAgICAgICAgdGl0bGU9XCJGdWxsIEZlYXR1cmUgVGVzdFwiXG4gICAgICAgICAgICBkZXNjcmlwdGlvbj1cIkEgY29tcHJlaGVuc2l2ZSBmZWF0dXJlIHRlc3QgcGFnZSBleGVyY2lzaW5nIGV2ZXJ5IG1ham9yIE9wZW5HcmlkWCBjYXBhYmlsaXR5IGluIGEgc2luZ2xlIGdyaWQg4oCUIHZpcnR1YWxpemF0aW9uLCBwaW5uaW5nLCBncm91cGluZywgZWRpdGluZywgZXhwb3J0LCBhbmQgbW9yZS5cIlxuICAgICAgICAgICAgc291cmNlQ29kZT17c291cmNlQ29kZX1cbiAgICAgICAgPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkYXRhZ3JpZC10ZXN0X19pbmZvXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkYXRhZ3JpZC10ZXN0X19zdGF0XCI+XG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+VG90YWwgUm93czo8L3N0cm9uZz4ge3Jvd3MubGVuZ3RofVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGF0YWdyaWQtdGVzdF9fc3RhdFwiPlxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPkZpbHRlcmVkOjwvc3Ryb25nPiB7ZmlsdGVyZWRSb3dDb3VudH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRhdGFncmlkLXRlc3RfX3N0YXRcIj5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5TZWxlY3RlZDo8L3N0cm9uZz4ge3NlbGVjdGlvbk1vZGVsLmxlbmd0aH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRhdGFncmlkLXRlc3RfX3N0YXRcIj5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5WaXNpYmxlIENvbHVtbnM6PC9zdHJvbmc+IHt2aXNpYmxlQ29sdW1ucy5zaXplfS97YWxsQ29sdW1ucy5sZW5ndGh9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkYXRhZ3JpZC10ZXN0X19zdGF0XCI+XG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+UGFnZTo8L3N0cm9uZz4ge3BhZ2luYXRpb25Nb2RlbC5wYWdlICsgMX0gb2Yge01hdGguY2VpbChmaWx0ZXJlZFJvd0NvdW50IC8gcGFnaW5hdGlvbk1vZGVsLnBhZ2VTaXplKX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICB7IH1cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGF0YWdyaWQtdGVzdF9fdG9vbGJhclwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1sZWZ0XCI+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNob3dDb2x1bW5QYW5lbCghc2hvd0NvbHVtblBhbmVsKX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge3Nob3dDb2x1bW5QYW5lbCA/ICdIaWRlJyA6ICdTaG93J30gQ29sdW1uc1xuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24gZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXNlY29uZGFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRQaW5uZWRDb2x1bW5zKHsgbGVmdDogWydpZCcsICduYW1lJ10sIHJpZ2h0OiBbXSB9KX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAg8J+TjCBQaW4gSUQgJiBOYW1lXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbiBkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tc2Vjb25kYXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFBpbm5lZENvbHVtbnMoeyBsZWZ0OiBbXSwgcmlnaHQ6IFsnc2FsYXJ5JywgJ2pvaW5EYXRlJ10gfSl9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIPCfk4wgUGluIFNhbGFyeSAmIERhdGVcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uIGRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1zZWNvbmRhcnlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0UGlubmVkQ29sdW1ucyh7IGxlZnQ6IFtdLCByaWdodDogW10gfSl9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIOKdjCBVbnBpbiBBbGwgQ29sdW1uc1xuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkYXRhZ3JpZC10ZXN0X190b29sYmFyLWRpdmlkZXJcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24gZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXNlY29uZGFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRDb2x1bW5PcmRlcihhbGxDb2x1bW5zLm1hcChjb2wgPT4gY29sLmZpZWxkKSl9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIPCflIQgUmVzZXQgQ29sdW1uIE9yZGVyXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbiAke3BpbkNoZWNrYm94Q29sdW1uID8gJ2RhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1wcmltYXJ5JyA6ICdkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tc2Vjb25kYXJ5J31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0UGluQ2hlY2tib3hDb2x1bW4oIXBpbkNoZWNrYm94Q29sdW1uKX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge3BpbkNoZWNrYm94Q29sdW1uID8gJ/CflJMgVW5waW4gQ2hlY2tib3gnIDogJ/CflJIgUGluIENoZWNrYm94J31cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uICR7cGluRXhwYW5kQ29sdW1uID8gJ2RhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1wcmltYXJ5JyA6ICdkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tc2Vjb25kYXJ5J31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0UGluRXhwYW5kQ29sdW1uKCFwaW5FeHBhbmRDb2x1bW4pfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7cGluRXhwYW5kQ29sdW1uID8gJ/CflJMgVW5waW4gRXhwYW5kJyA6ICfwn5SSIFBpbiBFeHBhbmQnfVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24gZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXNlY29uZGFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRQaW5uZWRSb3dzKHsgdG9wOiBbMSwgMl0sIGJvdHRvbTogW10gfSl9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIPCfk4wgUGluIEZpcnN0IDIgUm93cyAoVG9wKVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24gZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXNlY29uZGFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRQaW5uZWRSb3dzKHsgdG9wOiBbXSwgYm90dG9tOiBbOTksIDEwMF0gfSl9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIPCfk4wgUGluIExhc3QgMiBSb3dzIChCb3R0b20pXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbiBkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tc2Vjb25kYXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFBpbm5lZFJvd3MoeyB0b3A6IFtdLCBib3R0b206IFtdIH0pfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICDinYwgVW5waW4gQWxsIFJvd3NcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1kaXZpZGVyXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uICR7cm93R3JvdXBpbmdNb2RlbC5sZW5ndGggPiAwID8gJ2RhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1wcmltYXJ5JyA6ICdkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tc2Vjb25kYXJ5J31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyb3dHcm91cGluZ01vZGVsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0Um93R3JvdXBpbmdNb2RlbChbXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEFnZ3JlZ2F0aW9uTW9kZWwoe30pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFJvd0dyb3VwaW5nTW9kZWwoWydkZXBhcnRtZW50JywgJ3JvbGUnXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEFnZ3JlZ2F0aW9uTW9kZWwoeyBzYWxhcnk6ICdzdW0nLCBpZDogJ2NvdW50JyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJlZURhdGEpIHNldFRyZWVEYXRhKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtyb3dHcm91cGluZ01vZGVsLmxlbmd0aCA+IDAgPyAn8J+aqyBEaXNhYmxlIEdyb3VwaW5nJyA6ICfwn5ORIEdyb3VwIGJ5IERlcHQgPiBSb2xlJ31cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uICR7dHJlZURhdGEgPyAnZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXByaW1hcnknIDogJ2RhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1zZWNvbmRhcnknfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VHJlZURhdGEoIXRyZWVEYXRhKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdHJlZURhdGEpIHNldFJvd0dyb3VwaW5nTW9kZWwoW10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge3RyZWVEYXRhID8gJ/CfjLMgRGlzYWJsZSBUcmVlIERhdGEnIDogJ/CfjLMgRW5hYmxlIFRyZWUgRGF0YSd9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRhdGFncmlkLXRlc3RfX3Rvb2xiYXItZGl2aWRlclwiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbiAke3Jvd1Jlb3JkZXJpbmcgPyAnZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1idXR0b24tLXByaW1hcnknIDogJ2RhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1zZWNvbmRhcnknfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyb3dSZW9yZGVyaW5nKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U29ydE1vZGVsKFtdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0UGlubmVkUm93cyh7IHRvcDogW10sIGJvdHRvbTogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFJvd1Jlb3JkZXJpbmcoIXJvd1Jlb3JkZXJpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge3Jvd1Jlb3JkZXJpbmcgPyAn8J+bkSBEaXNhYmxlIFJvdyBSZW9yZGVyJyA6ICfihpXvuI8gRW5hYmxlIFJvdyBSZW9yZGVyJ31cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGF0YWdyaWQtdGVzdF9fdG9vbGJhci1kaXZpZGVyXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uICR7ZGV0YWlsUGFuZWxFbmFibGVkID8gJ2RhdGFncmlkLXRlc3RfX3Rvb2xiYXItYnV0dG9uLS1wcmltYXJ5JyA6ICdkYXRhZ3JpZC10ZXN0X190b29sYmFyLWJ1dHRvbi0tc2Vjb25kYXJ5J31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldERldGFpbFBhbmVsRW5hYmxlZCghZGV0YWlsUGFuZWxFbmFibGVkKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXRhaWxQYW5lbEVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0RXhwYW5kZWREZXRhaWxQYW5lbFJvd0lkcyhuZXcgU2V0KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtkZXRhaWxQYW5lbEVuYWJsZWQgPyAn8J+TiyBEaXNhYmxlIERldGFpbCBQYW5lbCcgOiAn8J+TiyBFbmFibGUgRGV0YWlsIFBhbmVsJ31cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPFF1aWNrRmlsdGVyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXtxdWlja0ZpbHRlclZhbHVlfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17c2V0UXVpY2tGaWx0ZXJWYWx1ZX1cbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWFyY2ggYWNyb3NzIGFsbCBjb2x1bW5zLi4uXCJcbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIHsgfVxuICAgICAgICAgICAge3Nob3dDb2x1bW5QYW5lbCAmJiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkYXRhZ3JpZC10ZXN0X19jb2x1bW4tcGFuZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgPENvbHVtblZpc2liaWxpdHlQYW5lbFxuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1ucz17YWxsQ29sdW1uc31cbiAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGVDb2x1bW5zPXt2aXNpYmxlQ29sdW1uc31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVmlzaWJpbGl0eUNoYW5nZT17aGFuZGxlVmlzaWJpbGl0eUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU2hvd0FsbD17aGFuZGxlU2hvd0FsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uSGlkZUFsbD17aGFuZGxlSGlkZUFsbH1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICl9XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGF0YWdyaWQtdGVzdF9fZ3JpZFwiPlxuICAgICAgICAgICAgICAgIDxEYXRhR3JpZFxuICAgICAgICAgICAgICAgICAgICByb3dzPXtyb3dzfVxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zPXtjb2x1bW5zfVxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9ezYwMH1cbiAgICAgICAgICAgICAgICAgICAgY2hlY2tib3hTZWxlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgcm93U2VsZWN0aW9uTW9kZWw9e3NlbGVjdGlvbk1vZGVsfVxuICAgICAgICAgICAgICAgICAgICBvblJvd1NlbGVjdGlvbk1vZGVsQ2hhbmdlPXtzZXRTZWxlY3Rpb25Nb2RlbH1cbiAgICAgICAgICAgICAgICAgICAgc29ydE1vZGVsPXtzb3J0TW9kZWx9XG4gICAgICAgICAgICAgICAgICAgIG9uU29ydE1vZGVsQ2hhbmdlPXtzZXRTb3J0TW9kZWx9XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlck1vZGVsPXtmaWx0ZXJNb2RlbH1cbiAgICAgICAgICAgICAgICAgICAgcGFnaW5hdGlvblxuICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uTW9kZWw9e3BhZ2luYXRpb25Nb2RlbH1cbiAgICAgICAgICAgICAgICAgICAgb25QYWdpbmF0aW9uTW9kZWxDaGFuZ2U9e3NldFBhZ2luYXRpb25Nb2RlbH1cbiAgICAgICAgICAgICAgICAgICAgcGFnZVNpemVPcHRpb25zPXtbMTAsIDI1LCA1MCwgMTAwXX1cbiAgICAgICAgICAgICAgICAgICAgcGlubmVkQ29sdW1ucz17cGlubmVkQ29sdW1uc31cbiAgICAgICAgICAgICAgICAgICAgb25QaW5uZWRDb2x1bW5zQ2hhbmdlPXtzZXRQaW5uZWRDb2x1bW5zfVxuICAgICAgICAgICAgICAgICAgICBwaW5uZWRSb3dzPXtwaW5uZWRSb3dzfVxuICAgICAgICAgICAgICAgICAgICBvblBpbm5lZFJvd3NDaGFuZ2U9e3NldFBpbm5lZFJvd3N9XG4gICAgICAgICAgICAgICAgICAgIG9uUm93Q2xpY2s9eyhwYXJhbXMpID0+IGNvbnNvbGUubG9nKCdSb3cgY2xpY2tlZDonLCBwYXJhbXMucm93KX1cbiAgICAgICAgICAgICAgICAgICAgb25DZWxsQ2xpY2s9eyhwYXJhbXMpID0+IGNvbnNvbGUubG9nKCdDZWxsIGNsaWNrZWQ6JywgcGFyYW1zLnJvdywgcGFyYW1zLmZpZWxkKX1cbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc1Jvd1VwZGF0ZT17KG5ld1JvdykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1JvdyBVcGRhdGVkOicsIG5ld1Jvdyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFJvd3MocHJldiA9PiBwcmV2Lm1hcChyID0+IHIuaWQgPT09IG5ld1Jvdy5pZCA/IChuZXdSb3cgYXMgRW1wbG95ZWUpIDogcikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ld1JvdztcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgb25Qcm9jZXNzUm93VXBkYXRlRXJyb3I9eyhlcnJvcikgPT4gY29uc29sZS5lcnJvcignUm93IFVwZGF0ZSBFcnJvcjonLCBlcnJvcil9XG5cbiAgICAgICAgICAgICAgICAgICAgZ2V0RGV0YWlsUGFuZWxDb250ZW50PXtkZXRhaWxQYW5lbEVuYWJsZWQgPyAocGFyYW1zKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4JywgYmFja2dyb3VuZDogJyNmNWY1ZjUnIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoNCBzdHlsZT17eyBtYXJnaW46ICcwIDAgMTJweCAwJyB9fT5FbXBsb3llZSBEZXRhaWxzOiB7cGFyYW1zLnJvdy5uYW1lfTwvaDQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZ3JpZCcsIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICcxZnIgMWZyJywgZ2FwOiAnOHB4JyB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj48c3Ryb25nPklEOjwvc3Ryb25nPiB7cGFyYW1zLnJvdy5pZH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj48c3Ryb25nPkVtYWlsOjwvc3Ryb25nPiB7cGFyYW1zLnJvdy5lbWFpbH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj48c3Ryb25nPkRlcGFydG1lbnQ6PC9zdHJvbmc+IHtwYXJhbXMucm93LmRlcGFydG1lbnR9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+PHN0cm9uZz5Sb2xlOjwvc3Ryb25nPiB7cGFyYW1zLnJvdy5yb2xlfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PjxzdHJvbmc+U2FsYXJ5Ojwvc3Ryb25nPiAke3BhcmFtcy5yb3cuc2FsYXJ5LnRvTG9jYWxlU3RyaW5nKCl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+PHN0cm9uZz5Kb2luIERhdGU6PC9zdHJvbmc+IHtwYXJhbXMucm93LmpvaW5EYXRlfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICkgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgIGdldERldGFpbFBhbmVsSGVpZ2h0PXtkZXRhaWxQYW5lbEVuYWJsZWQgPyAoKSA9PiAxNTAgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgIGRldGFpbFBhbmVsRXhwYW5kZWRSb3dJZHM9e2RldGFpbFBhbmVsRW5hYmxlZCA/IGV4cGFuZGVkRGV0YWlsUGFuZWxSb3dJZHMgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgIG9uRGV0YWlsUGFuZWxFeHBhbmRlZFJvd0lkc0NoYW5nZT17ZGV0YWlsUGFuZWxFbmFibGVkID8gc2V0RXhwYW5kZWREZXRhaWxQYW5lbFJvd0lkcyA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgcGluQ2hlY2tib3hDb2x1bW49e3BpbkNoZWNrYm94Q29sdW1ufVxuICAgICAgICAgICAgICAgICAgICBwaW5FeHBhbmRDb2x1bW49e3BpbkV4cGFuZENvbHVtbn1cbiAgICAgICAgICAgICAgICAgICAgY29sdW1uT3JkZXI9e2NvbHVtbk9yZGVyfVxuICAgICAgICAgICAgICAgICAgICBvbkNvbHVtbk9yZGVyQ2hhbmdlPXsocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB7IG9sZEluZGV4LCB0YXJnZXRJbmRleCB9ID0gcGFyYW1zO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q29sdW1uT3JkZXIocHJldiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3T3JkZXIgPSBbLi4ucHJldl07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgW21vdmVkXSA9IG5ld09yZGVyLnNwbGljZShvbGRJbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3T3JkZXIuc3BsaWNlKHRhcmdldEluZGV4LCAwLCBtb3ZlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ld09yZGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ29sdW1uIHJlb3JkZXJlZDonLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgICAgICB9fVxuXG4gICAgICAgICAgICAgICAgICAgIHJvd0dyb3VwaW5nTW9kZWw9e3Jvd0dyb3VwaW5nTW9kZWx9XG4gICAgICAgICAgICAgICAgICAgIG9uUm93R3JvdXBpbmdNb2RlbENoYW5nZT17c2V0Um93R3JvdXBpbmdNb2RlbH1cbiAgICAgICAgICAgICAgICAgICAgYWdncmVnYXRpb25Nb2RlbD17YWdncmVnYXRpb25Nb2RlbH1cbiAgICAgICAgICAgICAgICAgICAgb25BZ2dyZWdhdGlvbk1vZGVsQ2hhbmdlPXtzZXRBZ2dyZWdhdGlvbk1vZGVsfVxuXG4gICAgICAgICAgICAgICAgICAgIHJvd1Jlb3JkZXJpbmc9e3Jvd1Jlb3JkZXJpbmd9XG4gICAgICAgICAgICAgICAgICAgIG9uUm93T3JkZXJDaGFuZ2U9eyhwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgb2xkSW5kZXgsIHRhcmdldEluZGV4IH0gPSBwYXJhbXM7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUm93IHJlb3JkZXJlZDonLCBwYXJhbXMpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc29ydE1vZGVsLmxlbmd0aCA+IDAgfHwgcXVpY2tGaWx0ZXJWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KCdQbGVhc2UgY2xlYXIgc29ydGluZyBhbmQgZmlsdGVyaW5nIHRvIHRlc3Qgcm93IHJlb3JkZXJpbmcuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYWdlT2Zmc2V0ID0gcGFnaW5hdGlvbk1vZGVsLnBhZ2UgKiBwYWdpbmF0aW9uTW9kZWwucGFnZVNpemU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZWFsT2xkSW5kZXggPSBwYWdlT2Zmc2V0ICsgb2xkSW5kZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZWFsVGFyZ2V0SW5kZXggPSBwYWdlT2Zmc2V0ICsgdGFyZ2V0SW5kZXg7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFJvd3MocHJldiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3Um93cyA9IFsuLi5wcmV2XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBbbW92ZWRdID0gbmV3Um93cy5zcGxpY2UocmVhbE9sZEluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdSb3dzLnNwbGljZShyZWFsVGFyZ2V0SW5kZXgsIDAsIG1vdmVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3Um93cztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8L0RvY3NMYXlvdXQ+XG4gICAgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgRGF0YUdyaWRUZXN0O1xuIl0sIm5hbWVzIjpbInNvdXJjZUNvZGUiLCJkYXRhIiwiYWxsQ29sdW1ucyIsInBhcmFtcyIsIkRhdGFHcmlkVGVzdCIsInJvd3MiLCJzZXRSb3dzIiwidXNlU3RhdGUiLCJzZWxlY3Rpb25Nb2RlbCIsInNldFNlbGVjdGlvbk1vZGVsIiwic29ydE1vZGVsIiwic2V0U29ydE1vZGVsIiwicGFnaW5hdGlvbk1vZGVsIiwic2V0UGFnaW5hdGlvbk1vZGVsIiwicXVpY2tGaWx0ZXJWYWx1ZSIsInNldFF1aWNrRmlsdGVyVmFsdWUiLCJzaG93Q29sdW1uUGFuZWwiLCJzZXRTaG93Q29sdW1uUGFuZWwiLCJ2aXNpYmxlQ29sdW1ucyIsInNldFZpc2libGVDb2x1bW5zIiwiY29sIiwicGlubmVkQ29sdW1ucyIsInNldFBpbm5lZENvbHVtbnMiLCJwaW5uZWRSb3dzIiwic2V0UGlubmVkUm93cyIsImV4cGFuZGVkRGV0YWlsUGFuZWxSb3dJZHMiLCJzZXRFeHBhbmRlZERldGFpbFBhbmVsUm93SWRzIiwiY29sdW1uT3JkZXIiLCJzZXRDb2x1bW5PcmRlciIsInBpbkNoZWNrYm94Q29sdW1uIiwic2V0UGluQ2hlY2tib3hDb2x1bW4iLCJwaW5FeHBhbmRDb2x1bW4iLCJzZXRQaW5FeHBhbmRDb2x1bW4iLCJyb3dSZW9yZGVyaW5nIiwic2V0Um93UmVvcmRlcmluZyIsInRyZWVEYXRhIiwic2V0VHJlZURhdGEiLCJyb3dHcm91cGluZ01vZGVsIiwic2V0Um93R3JvdXBpbmdNb2RlbCIsImFnZ3JlZ2F0aW9uTW9kZWwiLCJzZXRBZ2dyZWdhdGlvbk1vZGVsIiwiZGV0YWlsUGFuZWxFbmFibGVkIiwic2V0RGV0YWlsUGFuZWxFbmFibGVkIiwiY29sdW1ucyIsInVzZU1lbW8iLCJmaWx0ZXJNb2RlbCIsImZpbHRlcmVkUm93Q291bnQiLCJyb3ciLCJzZWFyY2hUZXJtIiwidmFsdWUiLCJoYW5kbGVWaXNpYmlsaXR5Q2hhbmdlIiwiZmllbGQiLCJpc1Zpc2libGUiLCJwcmV2IiwibmV4dCIsImhhbmRsZVNob3dBbGwiLCJoYW5kbGVIaWRlQWxsIiwianN4cyIsIkRvY3NMYXlvdXQiLCJqc3giLCJRdWlja0ZpbHRlciIsIkNvbHVtblZpc2liaWxpdHlQYW5lbCIsIkRhdGFHcmlkIiwibmV3Um93IiwiciIsImVycm9yIiwib2xkSW5kZXgiLCJ0YXJnZXRJbmRleCIsIm5ld09yZGVyIiwibW92ZWQiLCJwYWdlT2Zmc2V0IiwicmVhbE9sZEluZGV4IiwicmVhbFRhcmdldEluZGV4IiwibmV3Um93cyJdLCJtYXBwaW5ncyI6ImlLQUFBLE1BQUFBLEdBQWU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FB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
