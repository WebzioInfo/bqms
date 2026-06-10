import Link from "next/link";
import { Button } from "@/components/ui/button";
import { KeyRound, ArrowLeft } from "lucide-react";

export default function ApiClientNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-500">
      <div className="bg-muted p-4 rounded-full mb-6">
        <KeyRound className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">API Client Not Found</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        The API client configuration you are looking for doesn't exist, has been revoked, or you don't have permission to view it.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link href="/api-marketplace">
          <Button variant="outline" className="min-w-[140px]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
        </Link>
      </div>
    </div>
  );
}
