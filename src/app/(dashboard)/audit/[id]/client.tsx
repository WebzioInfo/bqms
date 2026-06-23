"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Activity, Database, User, Clock, MapPin, Code } from "lucide-react";

interface AuditDetailClientProps {
  log: any;
}

export function AuditDetailClient({ log }: AuditDetailClientProps) {
  const payloadStr = log.payload ? JSON.stringify(log.payload, null, 2) : "{}";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Info */}
      <Card className="lg:col-span-2 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-muted/50 pb-4">
          <CardTitle className="text-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-600" />
              Event Payload
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider bg-zinc-100 text-zinc-800 border">
              ID: {log.id}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-zinc-950 p-6 overflow-x-auto">
            <div className="flex items-center gap-2 mb-4 text-zinc-400 text-sm">
              <Code className="h-4 w-4" /> Raw JSON Data
            </div>
            <pre className="text-sm font-mono text-emerald-400 leading-relaxed">
              {payloadStr}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Side Widgets */}
      <div className="space-y-6">
        <Card className="shadow-sm rounded-xl">
          <CardHeader className="pb-3 border-b border-muted/50 bg-muted/20">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" /> Context Metadata
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Action Type</dt>
                <dd className="text-sm font-semibold">{log.action}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Entity Name</dt>
                <dd className="text-sm font-medium">{log.entityName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Entity Record ID</dt>
                <dd className="text-sm font-mono text-muted-foreground bg-muted/50 p-1.5 rounded inline-block">{log.entityId}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Identity & Network</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 py-2 border-b border-muted/30">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 flex justify-between">
                  <span className="text-muted-foreground">Actor</span>
                  <span className="font-medium truncate max-w-[150px]">{log.user?.name || log.user?.email || "System"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 border-b border-muted/30">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{format(new Date(log.createdAt), "PP pp")}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 flex justify-between">
                  <span className="text-muted-foreground">IP Address</span>
                  <span className="font-mono text-muted-foreground">{log.ipAddress || "N/A"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
