"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { QrCode, Search, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function QrCodesClient({ initialData }: { initialData: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCert, setSelectedCert] = useState<any | null>(null);

  const filtered = initialData.filter(c => 
    c.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.certificateNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getVerificationUrl = (batchNumber: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://bqms.biofix.com";
    return `${origin}/verify/${batchNumber}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Certificates</CardTitle>
          <CardDescription>Select a certificate to generate its verification QR code.</CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-2.5 top-5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certificate ID</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((cert) => (
                  <TableRow key={cert.id} className={selectedCert?.id === cert.id ? "bg-muted/50" : ""}>
                    <TableCell className="font-medium">{cert.certificateNumber}</TableCell>
                    <TableCell>{cert.batchNumber}</TableCell>
                    <TableCell>{new Date(cert.issuedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant={selectedCert?.id === cert.id ? "default" : "outline"} size="sm" onClick={() => setSelectedCert(cert)}>
                        <QrCode className="h-4 w-4 mr-2" />
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No certificates found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>QR Preview</CardTitle>
          <CardDescription>Scan to verify authenticity</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 pt-4">
          {selectedCert ? (
            <>
              <div className="p-4 bg-white rounded-lg shadow-sm border">
                <QRCodeSVG 
                  value={getVerificationUrl(selectedCert.batchNumber)} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="text-center space-y-1">
                <p className="font-bold">{selectedCert.batchNumber}</p>
                <p className="text-xs text-muted-foreground break-all">{getVerificationUrl(selectedCert.batchNumber)}</p>
              </div>
              <Button className="w-full" variant="outline" onClick={() => {
                const svg = document.querySelector('.qrcode-svg');
                window.print();
              }}>
                <Download className="h-4 w-4 mr-2" /> Print QR Label
              </Button>
            </>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-muted-foreground space-y-2">
              <QrCode className="h-12 w-12 opacity-20" />
              <p className="text-sm">Select a certificate to generate QR</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
