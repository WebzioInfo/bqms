"use client";

import { useState } from "react";
import { createOrganization } from "@/app/actions/organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Building2, AlertCircle, Loader2 } from "lucide-react";

export default function NewOrganizationPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      type: formData.get("type") as "MINERAL_WATER" | "RESTAURANT" | "HOTEL" | "CAFE" | "INSTITUTION",
    };

    if (!data.name || !data.slug) {
      setError("Please fill out all required fields.");
      setLoading(false);
      return;
    }

    try {
      const result = await createOrganization(data);
      if (result.success) {
        router.push("/organizations");
      } else {
        setError(result.error || "Failed to create organization.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8 animate-in fade-in duration-500">
      <div className="mb-6 flex items-center gap-3">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Organization</h1>
          <p className="text-muted-foreground text-sm">Register a new business entity to issue certificates and log batches.</p>
        </div>
      </div>

      <Card className="shadow-lg border-muted">
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Enter the primary details for the new entity.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 flex gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h4 className="font-semibold">Error</h4>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Organization Name <span className="text-destructive">*</span>
              </label>
              <Input id="name" name="name" required placeholder="e.g. AquaPure Water Co." className="transition-all focus-visible:ring-primary" autoFocus />
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                URL Slug <span className="text-destructive">*</span>
              </label>
              <Input id="slug" name="slug" required placeholder="e.g. aquapure" className="transition-all focus-visible:ring-primary" />
              <p className="text-xs text-muted-foreground">This will be used for their public verification profile (e.g. /verify/company/aquapure).</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Entity Type <span className="text-destructive">*</span>
              </label>
              <select 
                id="type"
                name="type" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
              >
                <option value="MINERAL_WATER">Mineral Water Company</option>
                <option value="RESTAURANT">Restaurant</option>
                <option value="HOTEL">Hotel</option>
                <option value="CAFE">Cafe</option>
                <option value="INSTITUTION">Institution</option>
              </select>
            </div>

            <div className="pt-4 flex gap-4">
              <Button type="button" variant="outline" className="w-full" onClick={() => router.back()} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Organization"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
