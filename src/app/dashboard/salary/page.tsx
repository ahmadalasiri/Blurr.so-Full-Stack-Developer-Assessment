"use client";

import { useState, useEffect } from "react";
import { SalaryTable } from "@/components/salary/salary-table";
import { SalaryRecordForm } from "@/components/salary/salary-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, DollarSign, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import {
  deleteSalaryRecord,
  getSalaryDashboardStats,
  type SalaryRecordWithEmployee,
  type SalaryDashboardStats,
} from "@/lib/salary-actions";
import { formatCurrency } from "@/lib/utils";

export default function SalaryDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SalaryRecordWithEmployee | null>(null);
  const [viewingRecord, setViewingRecord] = useState<SalaryRecordWithEmployee | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState<SalaryDashboardStats>({
    totalRecords: 0,
    totalPayroll: 0,
    pendingApprovals: 0,
    activeEmployees: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Load dashboard statistics
  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const dashboardStats = await getSalaryDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [refreshKey]); // Reload stats when data changes

  const handleAdd = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  const handleEdit = (record: SalaryRecordWithEmployee) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleView = (record: SalaryRecordWithEmployee) => {
    setViewingRecord(record);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      const result = await deleteSalaryRecord(deletingId);

      if (result.success) {
        toast.success("Salary record deleted successfully");
        setRefreshKey((prev) => prev + 1); // Trigger table refresh
      } else {
        toast.error(result.error || "Failed to delete salary record");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingRecord(null);
    setRefreshKey((prev) => prev + 1); // Trigger table refresh
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingRecord(null);
  };

  const formatMonthYear = (month: number, year: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${months[month - 1]} ${year}`;
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

  return (
    <div
      className="space-y-6 p-6"
      suppressHydrationWarning
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Salary Management</h1>
          <p className="text-gray-600">Manage employee salary records and calculations</p>
        </div>
      </div>{" "}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? "..." : stats.totalRecords}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? "..." : formatCurrency(stats.totalPayroll)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? "..." : stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? "..." : stats.activeEmployees}</div>
            <p className="text-xs text-muted-foreground">With salary records</p>
          </CardContent>
        </Card>
      </div>
      {/* Salary Table */}
      <SalaryTable
        key={refreshKey}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />
      {/* Form Dialog */}
      <Dialog
        open={showForm}
        onOpenChange={setShowForm}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit Salary Record" : "Add Salary Record"}</DialogTitle>
          </DialogHeader>
          <SalaryRecordForm
            salaryRecord={editingRecord || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
      {/* View Dialog */}
      <Dialog
        open={!!viewingRecord}
        onOpenChange={() => setViewingRecord(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Salary Record Details</DialogTitle>
          </DialogHeader>
          {viewingRecord && (
            <div className="space-y-6">
              {/* Employee Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Employee Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <div className="text-base">{viewingRecord.employee.name}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Employee ID</label>
                    <div className="text-base">{viewingRecord.employee.employeeId}</div>
                  </div>
                  {viewingRecord.employee.department && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Department</label>
                      <div className="text-base">{viewingRecord.employee.department}</div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="text-base">{getStatusBadge(viewingRecord.status)}</div>
                  </div>
                </div>
              </div>

              {/* Period Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Period</h3>
                <div className="text-base">{formatMonthYear(viewingRecord.month, viewingRecord.year)}</div>
              </div>

              {/* Salary Breakdown */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Salary Breakdown</h3>{" "}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  {" "}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Basic Salary:</span>
                      <span>{formatCurrency(viewingRecord.basicSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Bonus:</span>
                      <span>{formatCurrency(viewingRecord.bonus)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Gross Salary:</span>
                      <span>{formatCurrency(viewingRecord.grossSalary || 0)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Deductions:</span>
                      <span>{formatCurrency(viewingRecord.deductions)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total Deductions:</span>
                      <span>{formatCurrency(viewingRecord.totalDeductions || 0)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Net Salary:</span>
                        <span className="text-green-600">{formatCurrency(viewingRecord.netSalary || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Notes */}
                {viewingRecord.notes && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Notes</h4>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm">{viewingRecord.notes}</div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setViewingRecord(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={() => setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the salary record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
