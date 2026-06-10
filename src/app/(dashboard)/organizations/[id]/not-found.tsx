import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Search, ArrowLeft } from "lucide-react";

export default function OrganizationNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-500">
      <div className="bg-muted p-4 rounded-full mb-6">
        <Building2 className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Organization Not Found</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        The organization you are looking for doesn't exist, has been removed, or you don't have permission to view it.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link href="/organizations">
          <Button variant="outline" className="min-w-[140px]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
        </Link>
        <Link href="/search">
          <Button className="min-w-[140px]">
            <Search className="mr-2 h-4 w-4" />
            Global Search
          </Button>
        </Link>
      </div>
    </div>
  );
}
