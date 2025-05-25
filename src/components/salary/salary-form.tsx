"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, Save, X } from "lucide-react";
import { toast } from "sonner";
import { salaryRecordFormSchema, type SalaryRecordFormData } from "@/lib/salary-validation";
import { calculateSalary, type SalaryCalculation } from "@/lib/salary-utils";
import {
  createSalaryRecord,
  updateSalaryRecord,
  getAllEmployees,
  type SalaryRecordWithEmployee,
} from "@/lib/salary-actions";
import { formatCurrency } from "@/lib/utils";
import { ClientOnly } from "@/components/ui/client-only";

interface SalaryRecordFormProps {
  salaryRecord?: SalaryRecordWithEmployee;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  basicSalary: number;
  department: string | null;
  position: string | null;
}

export function SalaryRecordForm({ salaryRecord, onSuccess, onCancel }: SalaryRecordFormProps) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [calculation, setCalculation] = useState<SalaryCalculation | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const isEditing = !!salaryRecord;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const form = useForm<SalaryRecordFormData>({
    resolver: zodResolver(salaryRecordFormSchema),
    defaultValues: isEditing
      ? {
          employeeId: salaryRecord.employee.id,
          month: salaryRecord.month.toString(),
          year: salaryRecord.year.toString(),
          bonus: salaryRecord.bonus.toString(),
          deductions: salaryRecord.deductions.toString(),
          notes: salaryRecord.notes || "",
        }
      : {
          employeeId: "",
          month: currentMonth.toString(),
          year: currentYear.toString(),
          bonus: "0",
          deductions: "0",
          notes: "",
        },
  });

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Load employees
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const employeeData = await getAllEmployees();
        setEmployees(employeeData); // Set selected employee if editing
        if (isEditing) {
          const employee = employeeData.find((emp: any) => emp.id === salaryRecord.employee.id);
          setSelectedEmployee(employee || null);
        }
      } catch (error) {
        console.error("Failed to load employees:", error);
        toast.error("Failed to load employees");
      }
    };

    loadEmployees();
  }, [isEditing, salaryRecord]);

  // Watch specific form values for calculation (excluding employeeId to prevent loops)
  const bonus = form.watch("bonus");
  const deductions = form.watch("deductions");

  useEffect(() => {
    if (selectedEmployee) {
      const calc = calculateSalary(selectedEmployee.basicSalary, parseFloat(bonus) || 0, parseFloat(deductions) || 0);
      setCalculation(calc);
    }
  }, [selectedEmployee, bonus, deductions]);
  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    setSelectedEmployee(employee || null);
    // Only update form if value is different to prevent loops
    if (form.getValues("employeeId") !== employeeId) {
      form.setValue("employeeId", employeeId);
    }
  };
  const onSubmit = async (data: SalaryRecordFormData) => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }

    setLoading(true);
    try {
      // Convert string data to proper types
      const salaryData = {
        employeeId: data.employeeId,
        month: parseInt(data.month),
        year: parseInt(data.year),
        bonus: parseFloat(data.bonus) || 0,
        deductions: parseFloat(data.deductions) || 0,
        notes: data.notes || undefined,
      };

      let result;
      if (isEditing) {
        result = await updateSalaryRecord(salaryRecord.id, salaryData);
      } else {
        result = await createSalaryRecord(salaryData);
      }

      if (result.success) {
        toast.success(isEditing ? "Salary record updated successfully" : "Salary record created successfully");
        onSuccess?.();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className="max-w-2xl mx-auto"
      suppressHydrationWarning
    >
      <CardHeader
        className="space-y-4"
        suppressHydrationWarning
      >
        <div className="flex justify-between items-center">
          <CardTitle>{isEditing ? "Edit Salary Record" : "Add Salary Record"}</CardTitle>
          {onCancel && (
            <Button
              variant="ghost"
              onClick={onCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent
        className="space-y-6"
        suppressHydrationWarning
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Employee Selection */}
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <ClientOnly>
                    <Select
                      value={field.value}
                      onValueChange={handleEmployeeChange}
                      disabled={isEditing}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem
                            key={employee.id}
                            value={employee.id}
                          >
                            <div className="flex flex-col">
                              <span>{employee.name}</span>
                              <span className="text-sm text-gray-500">
                                {employee.employeeId} • {formatCurrency(employee.basicSalary)}
                                {employee.department && ` • ${employee.department}`}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </ClientOnly>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Period Selection */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <ClientOnly>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem
                              key={month.value}
                              value={month.value}
                            >
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </ClientOnly>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <ClientOnly>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem
                              key={year}
                              value={year.toString()}
                            >
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </ClientOnly>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Salary Components */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Salary Components</h3>
              {selectedEmployee && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Basic Salary</div>
                  <div className="text-lg font-medium">{formatCurrency(selectedEmployee.basicSalary)}</div>
                </div>
              )}{" "}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bonus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bonus</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deductions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deductions</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Salary Calculation Preview */}
            {calculation && selectedEmployee && (
              <div className="space-y-4">
                <Separator />
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  <h3 className="text-lg font-medium">Salary Calculation</h3>
                </div>{" "}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Basic Salary:</span>
                      <span>{formatCurrency(calculation.basicSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Bonus:</span>
                      <span>{formatCurrency(calculation.bonus)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Gross Salary:</span>
                      <span>{formatCurrency(calculation.grossSalary)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Deductions:</span>
                      <span>{formatCurrency(calculation.deductions)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total Deductions:</span>
                      <span>{formatCurrency(calculation.totalDeductions)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Net Salary:</span>
                      <Badge
                        variant="secondary"
                        className="text-base px-3 py-1"
                      >
                        {formatCurrency(calculation.netSalary)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about this salary record..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : isEditing ? "Update Record" : "Create Record"}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
