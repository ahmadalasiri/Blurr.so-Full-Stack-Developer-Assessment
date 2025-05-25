// Salary calculation utilities

export interface SalaryCalculation {
  basicSalary: number;
  bonus: number;
  deductions: number;
  allowances: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimePay: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
}

export function calculateSalary(
  basicSalary: number,
  bonus: number = 0,
  deductions: number = 0,
  allowances: number = 0,
  overtimeHours: number = 0,
  overtimeRate: number = 0,
): SalaryCalculation {
  const overtimePay = overtimeHours * overtimeRate;
  const grossSalary = basicSalary + bonus + allowances + overtimePay;
  const totalDeductions = deductions;
  const netSalary = grossSalary - totalDeductions;

  return {
    basicSalary,
    bonus,
    deductions,
    allowances,
    overtimeHours,
    overtimeRate,
    overtimePay,
    grossSalary,
    totalDeductions,
    netSalary,
  };
}
