"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Plus } from "lucide-react";
import { getSalaryRecordsWithFilters, type SalaryRecordWithEmployee } from "@/lib/salary-actions";
import { formatCurrency } from "@/lib/utils";
import { ClientOnly } from "@/components/ui/client-only";

interface SalaryTableProps {
  onEdit?: (salaryRecord: SalaryRecordWithEmployee) => void;
  onView?: (salaryRecord: SalaryRecordWithEmployee) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
}

export function SalaryTable({ onEdit, onView, onDelete, onAdd }: SalaryTableProps) {
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecordWithEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    month: "all",
    year: new Date().getFullYear().toString(),
    department: "",
    employeeId: "",
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
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

  const loadSalaryRecords = async () => {
    setLoading(true);
    try {
      const filterParams = {
        ...(filters.month && filters.month !== "all" && { month: parseInt(filters.month) }),
        ...(filters.year && filters.year !== "all" && { year: parseInt(filters.year) }),
        ...(filters.department && { department: filters.department }),
        ...(filters.employeeId && { employeeId: filters.employeeId }),
      };

      const data = await getSalaryRecordsWithFilters(filterParams);
      setSalaryRecords(data);
    } catch (error) {
      console.error("Failed to load salary records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalaryRecords();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      DRAFT: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      PAID: "bg-blue-100 text-blue-800",
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  const formatMonthYear = (month: number, year: number) => {
    const monthName = months.find((m) => m.value === month.toString())?.label || month.toString();
    return `${monthName} ${year}`;
  };

  return (
    <Card suppressHydrationWarning>
      <CardHeader
        className="space-y-4"
        suppressHydrationWarning
      >
        <div className="flex justify-between items-center">
          <CardTitle>Salary Records</CardTitle>
          {onAdd && (
            <Button
              onClick={onAdd}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Salary Record
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Year</label>
            <ClientOnly>
              <Select
                value={filters.year}
                onValueChange={(value) => handleFilterChange("year", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>{" "}
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Month</label>
            <ClientOnly>
              <Select
                value={filters.month}
                onValueChange={(value) => handleFilterChange("month", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>{" "}
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Department</label>
            <Input
              placeholder="Filter by department"
              value={filters.department}
              onChange={(e) => handleFilterChange("department", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Employee ID</label>
            <Input
              placeholder="Filter by employee ID"
              value={filters.employeeId}
              onChange={(e) => handleFilterChange("employeeId", e.target.value)}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent suppressHydrationWarning>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">Loading salary records...</div>
          </div>
        ) : salaryRecords.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">No salary records found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Bonus</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.employee.name}</div>
                        <div className="text-sm text-gray-500">{record.employee.employeeId}</div>
                        {record.employee.department && (
                          <div className="text-xs text-gray-400">{record.employee.department}</div>
                        )}
                      </div>
                    </TableCell>{" "}
                    <TableCell>{formatMonthYear(record.month, record.year)}</TableCell>
                    <TableCell>{formatCurrency(record.basicSalary)}</TableCell>
                    <TableCell>{formatCurrency(record.bonus)}</TableCell>
                    <TableCell>{formatCurrency(record.deductions)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(record.netSalary || 0)}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(record)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(record)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(record.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
