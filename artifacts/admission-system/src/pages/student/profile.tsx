import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetStudent, useUpdateStudent } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Users, Phone } from "lucide-react";

const profileSchema = z.object({
  rollNumber: z.string().min(1, "Roll number is required"),
  cnic: z.string().min(13, "CNIC must be at least 13 characters"),
  name: z.string().min(2, "Name is required"),
  fatherName: z.string().min(2, "Father name is required"),
  phone: z.string().min(10, "Phone is required"),
  program: z.string().min(2, "Program is required"),
  schoolCollege: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const studentId = localStorage.getItem("student_id");
  const parsedId = parseInt(studentId || "0", 10);
  const { toast } = useToast();
  const { data: student, isLoading } = useGetStudent(parsedId, {
    query: { queryKey: ["student", parsedId], enabled: !!parsedId },
  });
  const updateStudent = useUpdateStudent();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      rollNumber: "",
      cnic: "",
      name: "",
      fatherName: "",
      phone: "",
      program: "",
      schoolCollege: "",
    },
  });

  useEffect(() => {
    if (!studentId) {
      setLocation("/");
      return;
    }
  }, [studentId, setLocation]);

  useEffect(() => {
    if (student) {
      form.reset({
        rollNumber: student.rollNumber,
        cnic: student.cnic,
        name: student.name,
        fatherName: student.fatherName,
        phone: student.phone,
        program: student.program,
        schoolCollege: student.schoolCollege ?? "",
      });
    }
  }, [student]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!parsedId) return;
    try {
      await updateStudent.mutateAsync({
        id: parsedId,
        data: {
          rollNumber: values.rollNumber,
          cnic: values.cnic,
          name: values.name,
          fatherName: values.fatherName,
          phone: values.phone,
          program: values.program,
          schoolCollege: values.schoolCollege || undefined,
        },
      });
      toast({ title: "Profile updated", description: "You can now start your entry test." });
      setLocation("/instructions");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  if (!studentId) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Redirecting...</div>;
  }

  if (isLoading || !student) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Card className="w-full max-w-3xl shadow-lg border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-3 py-10">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-900">Complete Your Profile</CardTitle>
          <CardDescription className="text-slate-500 max-w-xl mx-auto">
            Please confirm or complete your student details before you start the entry test.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <User className="w-4 h-4" />
            <AlertDescription>
              Make sure your name, father name, roll number, and phone number are correct.
            </AlertDescription>
          </Alert>

          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...form.register("name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherName">Father Name</Label>
                <Input id="fatherName" {...form.register("fatherName")} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input id="rollNumber" {...form.register("rollNumber")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnic">CNIC</Label>
                <Input id="cnic" {...form.register("cnic")} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" {...form.register("phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Input id="program" {...form.register("program")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolCollege">School / College</Label>
              <Input id="schoolCollege" {...form.register("schoolCollege")} />
            </div>

            <div className="flex justify-between items-center gap-4 pt-4">
              <Button variant="outline" onClick={() => setLocation("/student/dashboard")}>Back to Dashboard</Button>
              <Button type="submit" disabled={updateStudent.isPending}>
                {updateStudent.isPending ? "Saving..." : "Save and Continue to Test"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
