import { notFound } from "next/navigation";
import { EmployeeForm } from "@/components/employees/employee-form";
import { getEmployee } from "@/lib/employee-actions";

interface EditEmployeePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  const { id } = await params;
  const result = await getEmployee(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="container p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Employee</h1>
        <p className="text-muted-foreground">Update employee information</p>
      </div>
      <EmployeeForm employee={result.data} />
    </div>
  );
}
