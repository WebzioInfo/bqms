"use client";

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import { Card, CardContent } from "@/components/ui/card";

// Next.js dynamic import because swagger-ui-react is a client-side library
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
        <p className="text-muted-foreground mt-1">Explore and test BQMS enterprise API endpoints.</p>
      </div>

      <Card className="shadow-sm border-muted">
        <CardContent className="p-0">
          <SwaggerUI url="/api/api-docs" />
        </CardContent>
      </Card>
    </div>
  );
}
