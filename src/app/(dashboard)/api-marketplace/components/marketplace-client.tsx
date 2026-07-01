"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast-context";
import { ButtonLoader } from "@/components/ui/button-loader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  subscribeToPlan,
  regenerateApiSecret,
  toggleSubscriptionStatus
} from "@/app/actions/api-subscription";
import {
  Check,
  Copy,
  Database,
  Key,
  RefreshCw,
  FileText,
  Activity,
  ShieldAlert,
  Building,
  CheckCircle,
  XCircle,
  Play,
  Eye,
  EyeOff,
  Terminal,
  Code
} from "lucide-react";
import { format } from "date-fns";

interface MarketplaceClientProps {
  products: any[];
  subscriptionData: any;
  adminData: any;
  currentOrgId: string;
  currentUserId: string;
  isPlatformAdmin: boolean;
  defaultBaseUrl: string;
}

export function MarketplaceClient({
  products,
  subscriptionData,
  adminData,
  currentOrgId,
  currentUserId,
  isPlatformAdmin,
  defaultBaseUrl
}: MarketplaceClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(isPlatformAdmin && !subscriptionData ? "admin" : "credentials");
  const [submittingPlan, setSubmittingPlan] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mask/Show credentials states
  const [showSecret, setShowSecret] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // SDK Language tab state
  const [selectedSdkLang, setSelectedSdkLang] = useState("curl");

  // Local helper for API URL (using window if available)
  const resolvedBaseUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/v1`
    : defaultBaseUrl;

  const subscription = subscriptionData?.subscription;
  const metrics = subscriptionData?.metrics;
  const activeKey = subscription?.keys?.find((k: any) => k.isActive);

  const toast = useToast();
  const [newSecret, setNewSecret] = useState<string | null>(null);

  async function handleSubscribe(productId: string) {
    setSubmittingPlan(productId);
    setError(null);
    const res = await subscribeToPlan(productId);
    setSubmittingPlan(null);

    if (res.success) {
      toast.success("API Subscription activated successfully.");
      router.refresh();
      setActiveTab("credentials");
    } else {
      const errMsg = res.error || "Unable to activate API Subscription.";
      toast.error(errMsg);
      setError(errMsg);
    }
  }

  async function handleRegenerate() {
    if (!activeKey) return;
    if (!confirm("Are you sure you want to regenerate your API Secret? Existing integrations using the old secret will stop working immediately.")) return;

    setRegenerating(true);
    setError(null);
    setNewSecret(null);
    const res = await regenerateApiSecret(activeKey.id);
    setRegenerating(false);

    if (res.success && res.newSecret) {
      toast.success("API Key regenerated successfully.");
      setNewSecret(res.newSecret);
      router.refresh();
    } else {
      const errMsg = res.error || "Unable to regenerate API Key.";
      toast.error(errMsg);
      setError(errMsg);
    }
  }

  async function handleAdminToggle(subId: string, status: string) {
    if (!confirm(`Are you sure you want to change this subscription status to ${status}?`)) return;
    const res = await toggleSubscriptionStatus(subId, status);
    if (res.success) {
      toast.success(`Subscription status updated to ${status}.`);
      router.refresh();
    } else {
      const errMsg = res.error || "Failed to update status.";
      toast.error(errMsg);
    }
  }

  const handleCopy = (text: string, type: "key" | "secret" | string) => {
    navigator.clipboard.writeText(text);
    toast.info("API credentials copied.");
    if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else if (type === "secret") {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedCode(type);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  // Code Snippet Definitions
  const codeExamples: Record<string, Record<string, string>> = {
    curl: {
      title: "cURL",
      code: `curl -X GET "${resolvedBaseUrl}/batches/B-1243" \\
  -H "Authorization: Bearer ${activeKey?.apiKey || "YOUR_API_KEY"}"`
    },
    js: {
      title: "JavaScript",
      code: `fetch("${resolvedBaseUrl}/batches/B-1243", {
  method: "GET",
  headers: {
    "Authorization": "Bearer ${activeKey?.apiKey || "YOUR_API_KEY"}"
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error("Error:", error));`
    },
    csharp: {
      title: "C#",
      code: `using System;
using System.Net.Http;
using System.Threading.Tasks;

class Program {
    static async Task Main() {
        var client = new HttpClient();
        client.DefaultRequestHeaders.Add("Authorization", "Bearer ${activeKey?.apiKey || "YOUR_API_KEY"}");
        
        var response = await client.GetStringAsync("${resolvedBaseUrl}/batches/B-1243");
        Console.WriteLine(response);
    }
}`
    },
    php: {
      title: "PHP",
      code: `<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "${resolvedBaseUrl}/batches/B-1243");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer ${activeKey?.apiKey || "YOUR_API_KEY"}"
]);

$response = curl_exec($ch);
curl_close($ch);
echo $response;`
    },
    python: {
      title: "Python",
      code: `import requests

url = "${resolvedBaseUrl}/batches/B-1243"
headers = {
    "Authorization": "Bearer ${activeKey?.apiKey || "YOUR_API_KEY"}"
}

response = requests.get(url, headers=headers)
print(response.json())`
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-5 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">API Marketplace & Developer Portal</h2>
          <p className="text-muted-foreground mt-1">Integrate BQMS production, test reports, and certificates data into your internal systems.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* UNSUBSCRIBED VIEW: Show available plans */}
      {!subscription && !isPlatformAdmin && (
        <div className="space-y-6">
          <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl flex items-center gap-4">
            <div className="bg-emerald-100 rounded-xl p-3 text-emerald-700">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-emerald-800 text-lg">Secure Developer API Access</h4>
              <p className="text-emerald-700/80 text-sm mt-0.5">Subscribe to a data access plan to generate live keys, view API schemas, and fetch batch quality data securely in JSON format.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {products.map((product) => (
              <Card key={product.id} className="flex flex-col shadow-sm border-muted/70 hover:border-emerald-200 transition">
                <CardHeader>
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{product.description || "API Access Plan"}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-3xl font-bold mb-6">${product.price} <span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      <strong>{product.rateLimit.toLocaleString()}</strong> req / hr Rate Limit
                    </li>
                    {product.features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                    onClick={() => handleSubscribe(product.id)}
                    disabled={submittingPlan !== null}
                  >
                    <ButtonLoader 
                      loading={submittingPlan === product.id} 
                      label="Subscribe Now" 
                      loadingLabel="Subscribing..." 
                      icon={<Check className="h-4 w-4" />}
                    />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* SUBSCRIBED OR PLATFORM_ADMIN VIEW */}
      {(subscription || isPlatformAdmin) && (
        <div className="space-y-6">
          {/* Metrics summary cards */}
          {subscription && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Subscription Status</p>
                      <h4 className="text-xl font-bold mt-1 text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4" /> {subscription.status}
                      </h4>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2.5 text-emerald-600">
                      <Activity className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">API Access Plan</p>
                      <h4 className="text-xl font-bold mt-1 text-primary">{subscription.product.name}</h4>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2.5 text-blue-600">
                      <Database className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Total API Calls</p>
                      <h4 className="text-xl font-bold mt-1">{metrics?.totalCalls || 0}</h4>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2.5 text-purple-600">
                      <Key className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Last API Request</p>
                      <h4 className="text-sm font-bold mt-2">
                        {metrics?.lastRequest ? format(new Date(metrics.lastRequest), "PP p") : "Never"}
                      </h4>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-2.5 text-amber-600">
                      <Activity className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Core Portal Navigation tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex justify-between items-center border-b pb-1">
              <TabsList className="bg-muted/60 p-1 rounded-xl">
                {subscription && (
                  <>
                    <TabsTrigger value="credentials" className="rounded-lg gap-2">
                      <Key className="h-4 w-4" /> Credentials
                    </TabsTrigger>
                    <TabsTrigger value="docs" className="rounded-lg gap-2">
                      <FileText className="h-4 w-4" /> API Documentation
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="rounded-lg gap-2">
                      <Activity className="h-4 w-4" /> Request Logs
                    </TabsTrigger>
                  </>
                )}
                {isPlatformAdmin && (
                  <TabsTrigger value="admin" className="rounded-lg gap-2 text-red-700 font-medium">
                    <ShieldAlert className="h-4 w-4" /> Platform Admin
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* TAB CONTENT: CREDENTIALS */}
            {subscription && (
              <TabsContent value="credentials" className="space-y-6 outline-none">
                {newSecret && (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2 animate-in slide-in-from-top duration-300">
                    <h4 className="font-bold text-emerald-800 text-sm">New API Secret Generated!</h4>
                    <p className="text-xs text-emerald-700">Please copy this secret now. It will not be shown again for security reasons.</p>
                    <div className="flex">
                      <input 
                        type="text" 
                        readOnly 
                        value={newSecret} 
                        className="flex-1 px-4 py-2 bg-white border border-emerald-200 rounded-lg text-sm font-mono text-emerald-800 outline-none" 
                      />
                      <Button 
                        variant="outline" 
                        className="ml-2 border-emerald-200 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 gap-1.5" 
                        onClick={() => handleCopy(newSecret, "secret")}
                      >
                        <Copy className="h-4 w-4" /> Copy
                      </Button>
                    </div>
                  </div>
                )}
                <Card className="shadow-sm border-muted/80">
                  <CardHeader className="border-b pb-4">
                    <CardTitle className="text-lg">Security Credentials</CardTitle>
                    <CardDescription>Authentication tokens for developer REST integrations. Keep your API secret safe and secure.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-3 space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Base API URL</label>
                        <div className="flex">
                          <input 
                            type="text" 
                            readOnly 
                            value={resolvedBaseUrl} 
                            className="flex-1 px-4 py-2 bg-muted/30 border rounded-lg text-sm font-mono text-muted-foreground outline-none" 
                          />
                          <Button 
                            variant="outline" 
                            className="ml-2" 
                            onClick={() => handleCopy(resolvedBaseUrl, "url")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-3">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Developer ID (Subscription Ref)</label>
                        <input 
                          type="text" 
                          readOnly 
                          value={subscription.id} 
                          className="w-full px-4 py-2 bg-muted/20 border rounded-lg text-xs font-mono text-muted-foreground outline-none" 
                        />
                      </div>

                      <div className="space-y-2 md:col-span-3">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">API Key</label>
                        <div className="flex">
                          <input 
                            type="text" 
                            readOnly 
                            value={activeKey?.apiKey || "Key not available"} 
                            className="flex-1 px-4 py-2 bg-muted/40 border rounded-lg text-sm font-mono outline-none" 
                          />
                          <Button 
                            variant="outline" 
                            className="ml-2 gap-1.5"
                            onClick={() => handleCopy(activeKey?.apiKey || "", "key")}
                          >
                            {copiedKey ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            {copiedKey ? "Copied" : "Copy"}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-3">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">API Secret</label>
                        <div className="flex">
                          <input 
                            type={showSecret ? "text" : "password"} 
                            readOnly 
                            value={activeKey?.apiSecret || ""} 
                            className="flex-1 px-4 py-2 bg-muted/40 border rounded-lg text-sm font-mono outline-none" 
                          />
                          <Button 
                            variant="outline" 
                            className="ml-2" 
                            onClick={() => setShowSecret(!showSecret)}
                            title={showSecret ? "Mask Secret" : "Show Secret"}
                          >
                            {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="outline" 
                            className="ml-2 gap-1.5" 
                            onClick={() => handleCopy(activeKey?.apiSecret || "", "secret")}
                          >
                            {copiedSecret ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            {copiedSecret ? "Copied" : "Copy"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/10 border-t justify-between px-6 py-4">
                    <p className="text-xs text-muted-foreground">API Credentials never expire. You can rotate keys at any time.</p>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleRegenerate}
                      disabled={regenerating || !activeKey}
                      className="gap-2"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                      Regenerate Secret
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            )}

            {/* TAB CONTENT: API DOCUMENTATION & SDKS */}
            {subscription && (
              <TabsContent value="docs" className="space-y-6 outline-none">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Documentation details */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Authentication Reference</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm">
                        <p className="text-muted-foreground leading-relaxed">
                          All endpoints on the BQMS REST API are fully secured and require an active API key. 
                          You must pass this key either as a standard HTTP header `X-API-Key` or as a Bearer Token in the `Authorization` header.
                        </p>
                        
                        <div className="space-y-3 bg-muted/40 p-4 rounded-xl font-mono text-xs border">
                          <div>
                            <span className="text-primary font-semibold">Header Style (X-API-Key):</span>
                            <pre className="mt-1 text-muted-foreground bg-muted p-2 rounded">X-API-Key: {activeKey?.apiKey || "YOUR_API_KEY"}</pre>
                          </div>
                          <div>
                            <span className="text-primary font-semibold">Bearer Token Style (Authorization):</span>
                            <pre className="mt-1 text-muted-foreground bg-muted p-2 rounded">Authorization: Bearer {activeKey?.apiKey || "YOUR_API_KEY"}</pre>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Endpoints & Resource Specs</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          <div className="p-6 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-blue-600 hover:bg-blue-600 text-white font-mono">GET</Badge>
                              <code className="text-sm font-semibold">/api/v1/company</code>
                            </div>
                            <p className="text-sm text-muted-foreground">Returns profile details of the authenticated company (address, BIS licence number, status, validities).</p>
                          </div>

                          <div className="p-6 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-blue-600 hover:bg-blue-600 text-white font-mono">GET</Badge>
                              <code className="text-sm font-semibold">/api/v1/licence</code>
                            </div>
                            <p className="text-sm text-muted-foreground">Returns standard and validity validation statuses for the organization's current BIS Licence.</p>
                          </div>

                          <div className="p-6 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-blue-600 hover:bg-blue-600 text-white font-mono">GET</Badge>
                              <code className="text-sm font-semibold">/api/v1/certificates</code>
                            </div>
                            <p className="text-sm text-muted-foreground">Lists all quality certificates generated and linked under the organization.</p>
                          </div>

                          <div className="p-6 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-blue-600 hover:bg-blue-600 text-white font-mono">GET</Badge>
                              <code className="text-sm font-semibold">/api/v1/batches/&#123;batchNumber&#125;</code>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <strong>Primary Aggregation Endpoint:</strong> Combines batch info, full water test parameters, compliance summaries, and certificate items into a single payload. Ideal for external website search widgets or ERP synchronizers.
                            </p>
                          </div>

                          <div className="p-6 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-blue-600 hover:bg-blue-600 text-white font-mono">GET</Badge>
                              <code className="text-sm font-semibold">/api/v1/reports/&#123;reportNumber&#125;</code>
                            </div>
                            <p className="text-sm text-muted-foreground">Returns details, categories, parameters, and evaluated results for a specific laboratory test report code.</p>
                          </div>

                          <div className="p-6 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-blue-600 hover:bg-blue-600 text-white font-mono">GET</Badge>
                              <code className="text-sm font-semibold">/api/v1/search?q=&#123;query&#125;</code>
                            </div>
                            <p className="text-sm text-muted-foreground">Searches and filters reports, batches, and certificates belonging to the authenticated company.</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right SDK Sandbox Code Tabs */}
                  <div className="space-y-6">
                    <Card className="shadow-sm border-2 border-emerald-100 overflow-hidden">
                      <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 py-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-emerald-800">
                          <Code className="h-4 w-4" /> Integration Code Examples
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 bg-slate-900 text-slate-100">
                        {/* Selector Tabs */}
                        <div className="flex border-b border-slate-800 text-xs overflow-x-auto bg-slate-950">
                          {Object.keys(codeExamples).map((lang) => (
                            <button
                              key={lang}
                              className={`px-4 py-2 font-semibold outline-none transition ${
                                selectedSdkLang === lang
                                  ? "text-emerald-400 border-b-2 border-emerald-400 bg-slate-900"
                                  : "text-slate-400 hover:text-slate-200"
                              }`}
                              onClick={() => setSelectedSdkLang(lang)}
                            >
                              {codeExamples[lang].title}
                            </button>
                          ))}
                        </div>
                        
                        {/* Code snippet block */}
                        <div className="p-4 relative group">
                          <pre className="font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed select-all">
                            {codeExamples[selectedSdkLang].code}
                          </pre>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition h-8 w-8 bg-slate-800 hover:bg-slate-700 text-slate-200 border-0"
                            onClick={() => handleCopy(codeExamples[selectedSdkLang].code, selectedSdkLang)}
                          >
                            {copiedCode === selectedSdkLang ? <Check className="h-4.5 w-4.5 text-green-400" /> : <Copy className="h-4.5 w-4.5" />}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-sm font-bold">Error Codes</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-100 text-red-800 font-mono">401</Badge>
                          <span className="font-medium">Unauthorized</span>
                        </div>
                        <p className="text-muted-foreground leading-normal">API Key is missing from the headers.</p>

                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Badge className="bg-red-100 text-red-800 font-mono">403</Badge>
                          <span className="font-medium">Forbidden</span>
                        </div>
                        <p className="text-muted-foreground leading-normal">API key is invalid, inactive, or associated subscription is suspended.</p>

                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Badge className="bg-red-100 text-red-800 font-mono">429</Badge>
                          <span className="font-medium">Rate Limit Exceeded</span>
                        </div>
                        <p className="text-muted-foreground leading-normal">The organization has exceeded its permitted hourly API requests quota.</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            )}

            {/* TAB CONTENT: REQUEST LOGS */}
            {subscription && (
              <TabsContent value="logs" className="space-y-6 outline-none">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent API Requests Logs</CardTitle>
                    <CardDescription>Track real-time accesses, debugging logs, and request headers from external client calls.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Method</TableHead>
                          <TableHead>Request Path</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>User Agent</TableHead>
                          <TableHead className="text-right">Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {!metrics?.logs || metrics.logs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                              No request logs found for this developer account. Initiate an API request to see updates.
                            </TableCell>
                          </TableRow>
                        ) : (
                          metrics.logs.map((log: any) => (
                            <TableRow key={log.id}>
                              <TableCell>
                                <Badge className={log.method === "GET" ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : "bg-green-100 text-green-800 hover:bg-green-100"}>
                                  {log.method}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs font-semibold">{log.path}</TableCell>
                              <TableCell>
                                <Badge className={
                                  log.statusCode >= 200 && log.statusCode < 300 
                                    ? "bg-green-500/10 text-green-700 hover:bg-green-500/10" 
                                    : "bg-red-500/10 text-red-700 hover:bg-red-500/10"
                                }>
                                  {log.statusCode}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs">{log.ipAddress || "127.0.0.1"}</TableCell>
                              <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground" title={log.userAgent}>
                                {log.userAgent || "Unknown"}
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* TAB CONTENT: PLATFORM ADMIN MANAGEMENT */}
            {isPlatformAdmin && adminData && (
              <TabsContent value="admin" className="space-y-6 outline-none">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Global API Subscriptions Management</CardTitle>
                    <CardDescription>Manage subscriber companies, monitor usage statistics, or suspend/reactivate API access.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Organization</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Total Calls</TableHead>
                          <TableHead>Last Request</TableHead>
                          <TableHead>Created Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminData.subscriptions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                              No company subscriptions exist in the marketplace database.
                            </TableCell>
                          </TableRow>
                        ) : (
                          adminData.subscriptions.map((sub: any) => (
                            <TableRow key={sub.id}>
                              <TableCell className="font-semibold">{sub.organization.name}</TableCell>
                              <TableCell className="font-mono text-xs">{sub.product.name}</TableCell>
                              <TableCell>
                                <Badge variant={sub.status === "ACTIVE" ? "default" : "destructive"}>
                                  {sub.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-semibold">{sub.totalCalls}</TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {sub.lastUsedAt ? format(new Date(sub.lastUsedAt), "yyyy-MM-dd HH:mm") : "Never"}
                              </TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {format(new Date(sub.createdAt), "yyyy-MM-dd")}
                              </TableCell>
                              <TableCell className="text-right space-x-2">
                                {sub.status === "ACTIVE" ? (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleAdminToggle(sub.id, "SUSPENDED")}
                                  >
                                    Disable
                                  </Button>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-green-600 hover:text-green-700"
                                    onClick={() => handleAdminToggle(sub.id, "ACTIVE")}
                                  >
                                    Enable
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Global Request Logs for Admin */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Global Live API Logs</CardTitle>
                    <CardDescription>Consolidated real-time request logs from all external developer calls across BQMS.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Request Path</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead className="text-right">Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminData.logs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                              No request logs recorded in the API log buffer.
                            </TableCell>
                          </TableRow>
                        ) : (
                          adminData.logs.map((log: any) => (
                            <TableRow key={log.id}>
                              <TableCell className="font-semibold text-xs">{log.organization.name}</TableCell>
                              <TableCell>
                                <Badge className={log.method === "GET" ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : "bg-green-100 text-green-800 hover:bg-green-100"}>
                                  {log.method}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs font-semibold">{log.path}</TableCell>
                              <TableCell>
                                <Badge className={
                                  log.statusCode >= 200 && log.statusCode < 300 
                                    ? "bg-green-500/10 text-green-700 hover:bg-green-500/10" 
                                    : "bg-red-500/10 text-red-700 hover:bg-red-500/10"
                                }>
                                  {log.statusCode}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs">{log.ipAddress || "127.0.0.1"}</TableCell>
                              <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
    </div>
  );
}
