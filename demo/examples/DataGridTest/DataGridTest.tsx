

import { useState, useMemo } from 'react';
import { DataGrid } from '@opencorestack/opengridx';
import { QuickFilter } from '../../../lib/components/QuickFilter/QuickFilter';
import { ColumnVisibilityPanel } from '../../../lib/components/ColumnVisibilityPanel/ColumnVisibilityPanel';
import type { GridColDef, GridRowModel, GridFilterModel, GridColumnPinning, GridRowPinning, GridRowId, GridRowGroupingModel, GridAggregationModel } from '@opencorestack/opengridx';
import '../../../lib/components/QuickFilter/QuickFilter.css';
import '../../../lib/components/ColumnVisibilityPanel/ColumnVisibilityPanel.css';
import './DataGridTest.css';

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
        valueFormatter: (params) => `$${params.value.toLocaleString()}`
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
        <div className="datagrid-test">
            <div className="datagrid-test__header">
                <h1>OpenGridX Test</h1>
                <p>Zero-dependency DataGrid built from scratch</p>
            </div>

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
                        className={`datagrid-test__toolbar-button ${pinCheckboxColumn ? 'datagrid-test__toolbar-button--primary' : 'datagrid-test__toolbar-button--secondary'}`}
                        onClick={() => setPinCheckboxColumn(!pinCheckboxColumn)}
                    >
                        {pinCheckboxColumn ? '🔓 Unpin Checkbox' : '🔒 Pin Checkbox'}
                    </button>
                    <button
                        className={`datagrid-test__toolbar-button ${pinExpandColumn ? 'datagrid-test__toolbar-button--primary' : 'datagrid-test__toolbar-button--secondary'}`}
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
                        className={`datagrid-test__toolbar-button ${rowGroupingModel.length > 0 ? 'datagrid-test__toolbar-button--primary' : 'datagrid-test__toolbar-button--secondary'}`}
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
                        className={`datagrid-test__toolbar-button ${treeData ? 'datagrid-test__toolbar-button--primary' : 'datagrid-test__toolbar-button--secondary'}`}
                        onClick={() => {
                            setTreeData(!treeData);

                            if (!treeData) setRowGroupingModel([]);
                        }}
                    >
                        {treeData ? '🌳 Disable Tree Data' : '🌳 Enable Tree Data'}
                    </button>
                    <div className="datagrid-test__toolbar-divider"></div>
                    <button
                        className={`datagrid-test__toolbar-button ${rowReordering ? 'datagrid-test__toolbar-button--primary' : 'datagrid-test__toolbar-button--secondary'}`}
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
                        className={`datagrid-test__toolbar-button ${detailPanelEnabled ? 'datagrid-test__toolbar-button--primary' : 'datagrid-test__toolbar-button--secondary'}`}
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
                                <div><strong>Salary:</strong> ${params.row.salary.toLocaleString()}</div>
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

        </div>
    );
}

export default DataGridTest;
