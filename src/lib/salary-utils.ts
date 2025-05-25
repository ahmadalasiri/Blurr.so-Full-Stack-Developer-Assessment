// Salary calculation utilities

export interface SalaryCalculation {
  basicSalary: number;
  bonus: number;
  deductions: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
}

export function calculateSalary(basicSalary: number, bonus: number = 0, deductions: number = 0): SalaryCalculation {
  const grossSalary = basicSalary + bonus;
  const totalDeductions = deductions;
  const netSalary = grossSalary - totalDeductions;

  return {
    basicSalary,
    bonus,
    deductions,
    grossSalary,
    totalDeductions,
    netSalary,
  };
}
