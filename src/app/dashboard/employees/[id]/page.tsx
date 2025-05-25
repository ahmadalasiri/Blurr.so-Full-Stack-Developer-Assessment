import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Edit,
  Mail,
  Calendar,
  DollarSign,
  Building,
  Briefcase,
  Users,
  FileText,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { getEmployee } from "@/lib/employee-actions";

interface EmployeeDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployeeDetailsPage({ params }: EmployeeDetailsPageProps) {
  const { id } = await params;
  const result = await getEmployee(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const employee = result.data;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="container p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/employees">
          <Button
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{employee.name}</h1>
          <p className="text-muted-foreground">Employee Details</p>
        </div>
        <Link href={`/dashboard/employees/${employee.id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Employee
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">{getInitials(employee.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{employee.name}</h3>
                  <p className="text-muted-foreground font-mono">{employee.employeeId}</p>
                  <Badge
                    variant={employee.isActive ? "default" : "secondary"}
                    className="mt-2"
                  >
                    {employee.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employee.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{employee.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {format(new Date(employee.joiningDate), "MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>${employee.basicSalary.toLocaleString()} / month</span>
                </div>
                {employee.department && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{employee.department}</span>
                  </div>
                )}
                {employee.position && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{employee.position}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          {employee.assignedTasks && employee.assignedTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>Latest assigned tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employee.assignedTasks.map((task: any) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-xs">{task.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{task.project.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{task.status.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(task.createdAt), "MMM d")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Salary History */}
          {employee.salaryRecords && employee.salaryRecords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Salary History</CardTitle>
                <CardDescription>Recent salary records</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Basic Salary</TableHead>
                      <TableHead>Bonus</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employee.salaryRecords.map((record: any) => (
                      <TableRow key={record.id}>
                        <TableCell>{format(new Date(record.year, record.month - 1), "MMM yyyy")}</TableCell>
                        <TableCell>${record.basicSalary.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600">
                          {record.bonus > 0 ? `+$${record.bonus.toLocaleString()}` : "-"}
                        </TableCell>
                        <TableCell className="text-red-600">
                          {record.deductions > 0 ? `-$${record.deductions.toLocaleString()}` : "-"}
                        </TableCell>
                        <TableCell className="font-medium">${record.totalSalary.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.status.replace("_", " ")}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Tasks</span>
                <span className="font-medium">{employee._count.assignedTasks}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Salary Records</span>
                <span className="font-medium">{employee._count.salaryRecords}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Years with Company</span>
                <span className="font-medium">
                  {Math.floor((Date.now() - new Date(employee.joiningDate).getTime()) / (1000 * 60 * 60 * 24 * 365))}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href={`/dashboard/employees/${employee.id}/edit`}
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Employee
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Performance Review
              </Button>
            </CardContent>
          </Card>

          {/* Employee Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <div className="font-medium">Employee Created</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(employee.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <div className="font-medium">Joined Company</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(employee.joiningDate), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
                {employee.updatedAt !== employee.createdAt && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                    <div>
                      <div className="font-medium">Last Updated</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(employee.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
