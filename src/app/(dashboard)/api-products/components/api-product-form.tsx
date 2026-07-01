"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createApiProduct, updateApiProduct } from "@/app/actions/api-product";
import { Loader2, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface ApiProductFormProps {
  initialData?: any;
  currentUserId: string;
}

import { useToast } from "@/components/ui/toast-context";
import { ButtonLoader } from "@/components/ui/button-loader";

export function ApiProductForm({ initialData, currentUserId }: ApiProductFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialData;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    // Parse features from comma-separated string if provided
    const featuresStr = formData.get("features") as string;
    const features = featuresStr ? featuresStr.split(',').map(f => f.trim()).filter(f => f) : [];

    const data = {
      name: formData.get("name"),
      description: formData.get("description"),
      basePrice: formData.get("basePrice"),
      requestLimit: formData.get("requestLimit"),
      features: features,
      isActive: formData.get("isActive") === "on",
    };

    const res = isEditing 
      ? await updateApiProduct(initialData.id, data, currentUserId)
      : await createApiProduct(data, currentUserId);

    setIsSubmitting(false);

    if (res.success && res.data) {
      toast.success(isEditing ? "API Product updated successfully." : "API Product created successfully.");
      router.push(`/api-products/${res.data.id}`);
    } else {
      const errMsg = res.error || "Unable to save API product.";
      toast.error(errMsg);
      setError(errMsg);
    }
  }

  const defaultFeatures = initialData?.features ? initialData.features.join(", ") : "";

  return (
    <Card className="shadow-sm border-muted/60 overflow-hidden rounded-xl">
      <CardContent className="p-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name <span className="text-red-500">*</span></Label>
              <Input id="name" name="name" defaultValue={initialData?.name} required placeholder="e.g. Starter Plan" className="bg-muted/30" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="basePrice">Monthly Price ($) <span className="text-red-500">*</span></Label>
              <Input id="basePrice" name="basePrice" type="number" step="0.01" defaultValue={initialData?.basePrice} required placeholder="99.00" className="bg-muted/30" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestLimit">Daily Request Limit <span className="text-red-500">*</span></Label>
              <Input id="requestLimit" name="requestLimit" type="number" defaultValue={initialData?.requestLimit || 1000} required placeholder="1000" className="bg-muted/30" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={initialData?.description || ""} placeholder="Briefly describe the product tier..." className="bg-muted/30 min-h-[80px]" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="features">Features (Comma separated)</Label>
              <Input id="features" name="features" defaultValue={defaultFeatures} placeholder="Real-time webhooks, PDF Reports, Advanced Analytics" className="bg-muted/30" />
              <p className="text-xs text-muted-foreground">List features separated by commas.</p>
            </div>

            <div className="flex items-center space-x-3 md:col-span-2 bg-muted/20 p-4 rounded-lg border border-muted/50 mt-2">
              <Switch id="isActive" name="isActive" defaultChecked={initialData ? initialData.isActive : true} />
              <Label htmlFor="isActive" className="cursor-pointer">Product is Available for Subscription</Label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="button" variant="outline" className="mr-3" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <ButtonLoader 
                loading={isSubmitting} 
                label={isEditing ? "Save Changes" : "Create Product"} 
                loadingLabel={isEditing ? "Saving..." : "Creating..."} 
                icon={<Save className="h-4 w-4" />}
              />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
