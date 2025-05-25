"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import {
  employeeFormSchema,
  type EmployeeFormInput,
  DEPARTMENTS,
  POSITIONS,
  type Employee,
} from "@/lib/employee-validation";
import { createEmployee, updateEmployee } from "@/lib/employee-actions";

interface EmployeeFormProps {
  employee?: Employee;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EmployeeForm({ employee, onSuccess, onCancel }: EmployeeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const isEditing = !!employee;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError: setFieldError,
    clearErrors,
  } = useForm<EmployeeFormInput>({
    resolver: zodResolver(employeeFormSchema) as any,
    defaultValues: employee
      ? {
          employeeId: employee.employeeId,
          name: employee.name,
          email: employee.email || "",
          joiningDate: new Date(employee.joiningDate).toISOString().split("T")[0],
          basicSalary: employee.basicSalary.toString(),
          department: employee.department || "none",
          position: employee.position || "none",
          isActive: employee.isActive,
        }
      : {
          employeeId: "",
          name: "",
          email: "",
          joiningDate: "",
          basicSalary: "",
          department: "none",
          position: "none",
          isActive: true,
        },
  });

  const joiningDate = watch("joiningDate");

  const onSubmit: SubmitHandler<EmployeeFormInput> = async (data) => {
    setIsLoading(true);
    setError("");
    clearErrors();

    try {
      // Convert form data to the expected format
      const formattedData = {
        employeeId: data.employeeId.toUpperCase(),
        name: data.name.trim(),
        email: data.email?.trim() || undefined,
        joiningDate: new Date(data.joiningDate),
        basicSalary: parseFloat(data.basicSalary),
        department: data.department && data.department !== "none" ? data.department : undefined,
        position: data.position && data.position !== "none" ? data.position : undefined,
        isActive: data.isActive,
      };

      let result;
      if (isEditing) {
        result = await updateEmployee({
          id: employee.id,
          ...formattedData,
        });
      } else {
        result = await createEmployee(formattedData);
      }

      if (result.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard/employees");
        }
      } else {
        if (result.errors) {
          // Set field-specific errors
          Object.entries(result.errors).forEach(([field, message]) => {
            setFieldError(field as keyof EmployeeFormInput, { message });
          });
        } else {
          setError(result.error || "An unexpected error occurred");
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setValue("joiningDate", date.toISOString().split("T")[0]);
      setCalendarOpen(false);
    }
  };
  return (
    <Card
      className="w-full max-w-2xl mx-auto"
      suppressHydrationWarning
    >
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Employee" : "Add New Employee"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update employee information below"
            : "Fill in the details to add a new employee to your organization"}
        </CardDescription>
      </CardHeader>
      <CardContent suppressHydrationWarning>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          suppressHydrationWarning
        >
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            suppressHydrationWarning
          >
            {" "}
            {/* Employee ID */}
            <div
              className="space-y-2"
              suppressHydrationWarning
            >
              <Label htmlFor="employeeId">Employee ID *</Label>
              <div suppressHydrationWarning>
                <Input
                  id="employeeId"
                  {...register("employeeId")}
                  placeholder="EMP001"
                  className={errors.employeeId ? "border-red-500" : ""}
                  disabled={isLoading}
                  suppressHydrationWarning
                />
              </div>
              {errors.employeeId && <p className="text-sm text-red-500">{errors.employeeId.message}</p>}
            </div>{" "}
            {/* Name */}
            <div
              className="space-y-2"
              suppressHydrationWarning
            >
              <Label htmlFor="name">Full Name *</Label>
              <div suppressHydrationWarning>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="John Doe"
                  className={errors.name ? "border-red-500" : ""}
                  disabled={isLoading}
                  suppressHydrationWarning
                />
              </div>
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>{" "}
            {/* Email */}
            <div
              className="space-y-2"
              suppressHydrationWarning
            >
              <Label htmlFor="email">Email</Label>
              <div suppressHydrationWarning>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="john.doe@example.com"
                  className={errors.email ? "border-red-500" : ""}
                  disabled={isLoading}
                  suppressHydrationWarning
                />
              </div>
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>{" "}
            {/* Joining Date */}
            <div
              className="space-y-2"
              suppressHydrationWarning
            >
              <Label>Joining Date *</Label>
              <div suppressHydrationWarning>
                <Popover
                  open={calendarOpen}
                  onOpenChange={setCalendarOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !joiningDate && "text-muted-foreground",
                        errors.joiningDate && "border-red-500",
                      )}
                      disabled={isLoading}
                      suppressHydrationWarning
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {joiningDate ? format(new Date(joiningDate), "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={joiningDate ? new Date(joiningDate) : undefined}
                      onSelect={handleDateSelect}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {errors.joiningDate && <p className="text-sm text-red-500">{errors.joiningDate.message}</p>}
            </div>{" "}
            {/* Basic Salary */}
            <div
              className="space-y-2"
              suppressHydrationWarning
            >
              <Label htmlFor="basicSalary">Basic Salary *</Label>
              <div suppressHydrationWarning>
                <Input
                  id="basicSalary"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("basicSalary")}
                  placeholder="50000"
                  className={errors.basicSalary ? "border-red-500" : ""}
                  disabled={isLoading}
                  suppressHydrationWarning
                />
              </div>
              {errors.basicSalary && <p className="text-sm text-red-500">{errors.basicSalary.message}</p>}
            </div>{" "}
            {/* Department */}
            <div
              className="space-y-2"
              suppressHydrationWarning
            >
              <Label htmlFor="department">Department</Label>
              <div suppressHydrationWarning>
                <Select
                  value={watch("department")}
                  onValueChange={(value) => setValue("department", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>{" "}
                  <SelectContent>
                    <SelectItem value="none">No Department</SelectItem>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem
                        key={dept}
                        value={dept}
                      >
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.department && <p className="text-sm text-red-500">{errors.department.message}</p>}
            </div>{" "}
            {/* Position */}
            <div
              className="space-y-2"
              suppressHydrationWarning
            >
              <Label htmlFor="position">Position</Label>
              <div suppressHydrationWarning>
                <Select
                  value={watch("position")}
                  onValueChange={(value) => setValue("position", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.position ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>{" "}
                  <SelectContent>
                    <SelectItem value="none">No Position</SelectItem>
                    {POSITIONS.map((pos) => (
                      <SelectItem
                        key={pos}
                        value={pos}
                      >
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.position && <p className="text-sm text-red-500">{errors.position.message}</p>}
            </div>
            {/* Active Status */}
            {isEditing && (
              <div className="flex items-center space-x-2 md:col-span-2">
                <Switch
                  id="isActive"
                  checked={watch("isActive")}
                  onCheckedChange={(checked) => setValue("isActive", checked)}
                  disabled={isLoading}
                />
                <Label htmlFor="isActive">Active Employee</Label>
              </div>
            )}
          </div>{" "}
          {/* Action Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-3 pt-4"
            suppressHydrationWarning
          >
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
              suppressHydrationWarning
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Employee" : "Add Employee"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel || (() => router.push("/dashboard/employees"))}
              disabled={isLoading}
              className="flex-1"
              suppressHydrationWarning
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
