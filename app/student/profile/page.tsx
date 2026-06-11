"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, MapPin } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Student Profile</h1>
          <p className="text-slate-500 mt-1">Manage your personal information</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mx-auto w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center mb-4">
                <User className="w-16 h-16 text-slate-400" />
              </div>
              <Button variant="outline" size="sm">Change Photo</Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="Muhammad" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Ahmed" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input id="email" type="email" defaultValue="ahmed@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </Label>
                <Input id="phone" type="tel" defaultValue="+92 300 1234567" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </Label>
                <Input id="address" defaultValue="Lahore, Pakistan" />
              </div>

              <div className="flex gap-3 pt-4">
                <Button>Save Changes</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                <span className="text-sm font-medium">Application ID</span>
                <span className="text-sm text-slate-600">APP-2024-1234</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                <span className="text-sm font-medium">Status</span>
                <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                  Under Review
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                <span className="text-sm font-medium">Program Applied</span>
                <span className="text-sm text-slate-600">Computer Science</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
