"use client";

import { useState } from "react";
import { createOrganization } from "@/app/actions/organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function NewOrganizationPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      type: formData.get("type") as "MINERAL_WATER" | "RESTAURANT" | "HOTEL" | "CAFE" | "INSTITUTION",
    };

    const result = await createOrganization(data);
    if (result.success) {
      router.push("/dashboard");
    } else {
      alert("Error: " + result.error);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Register Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Organization Name</label>
              <Input name="name" required placeholder="AquaPure Water Co." />
            </div>
            <div>
              <label className="text-sm font-medium">URL Slug</label>
              <Input name="slug" required placeholder="aquapure" />
            </div>
            <div>
              <label className="text-sm font-medium">Entity Type</label>
              <select name="type" className="w-full flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm">
                <option value="MINERAL_WATER">Mineral Water Company</option>
                <option value="RESTAURANT">Restaurant</option>
                <option value="HOTEL">Hotel</option>
                <option value="CAFE">Cafe</option>
                <option value="INSTITUTION">Institution</option>
              </select>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Organization"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
