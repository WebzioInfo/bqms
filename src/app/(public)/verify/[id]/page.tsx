import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Download, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-4xl">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        <div className="w-full md:w-2/3 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-heading">AquaPure Mineral Water</h1>
              <ShieldCheck className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" /> 123 Industrial Park, Cityville
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
              <CardDescription>Official BQMS Compliance Record</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                <span className="font-medium">Current Status</span>
                <Badge className="bg-green-500 hover:bg-green-600">VERIFIED</Badge>
              </div>
              <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                <span className="font-medium">Trust Score</span>
                <span className="font-bold text-lg text-primary">Excellent (98/100)</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                <span className="font-medium flex items-center gap-2"><Calendar className="h-4 w-4"/> Last Inspection</span>
                <span>October 12, 2026</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-1/3 space-y-6">
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle>Quality Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="p-4 bg-primary/10 rounded-lg text-primary text-sm font-medium">
                Batch: #AQ-2026-X19
              </div>
              <Button className="w-full" variant="default">
                <Download className="mr-2 h-4 w-4" />
                Download PDF Report
              </Button>
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
