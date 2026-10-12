import { describe, it, expect, vi } from 'vitest';
import { exportToExcelAdvanced } from './exportToExcelAdvanced';

// An app that does not install the optional peer: the import() rejects.
vi.mock('exceljs', () => {
    throw new Error("Cannot find module 'exceljs'");
});

describe('exportToExcelAdvanced without exceljs installed', () => {
    it('rejects with an install hint', async () => {
        await expect(exportToExcelAdvanced([{ id: 1 }], [{ field: 'id' }])).rejects.toThrow(
            "exportToExcelAdvanced requires 'exceljs'. Run: npm install exceljs",
        );
    });
});
