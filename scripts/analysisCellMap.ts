export interface AnalysisCellMap {
  version: number;
  positional_cells: {
    A4_kWh: string;
    C9_CurrentMonthBill_INR: string;
    H9_NetPayable_INR: string;
    I9_ActualPaid_INR: string;
    B19_WindRate_RsPerKWh: string;
    A18_Bitlavadia_kWh: string;
    C18_Nanisindhodi_kWh: string;
    C26_NetWindCredit_INR: string;
  };
  derived: Record<string, string>;
  tidy_export: {
    has_header_row: boolean;
    cell_column_header: string;
    value_column_header: string;
    cell_col_letter: string;
    value_col_letter: string;
  };
  mismatches?: { field: string; expected_cell: string; actual_cell: string; fix: string }[];
}

export function validateAnalysisCellMap(data: unknown): data is AnalysisCellMap {
  try {
    const m = data as AnalysisCellMap;
    return m.version === 1 &&
      typeof m.positional_cells?.A4_kWh === 'string' &&
      typeof m.positional_cells?.C9_CurrentMonthBill_INR === 'string' &&
      typeof m.tidy_export?.cell_column_header === 'string' &&
      typeof m.tidy_export?.value_column_header === 'string';
  } catch {
    return false;
  }
}
