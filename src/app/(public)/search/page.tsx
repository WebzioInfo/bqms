"use client";

import { useState } from "react";
import { searchOrganizations } from "@/lib/meilisearch/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function SearchClientPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query) return;
    
    setLoading(true);
    try {
      const hits = await searchOrganizations(query);
      setResults(hits);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold font-heading">Global Search</h1>
          <p className="text-muted-foreground">Search across all verified organizations.</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex space-x-2">
          <Input 
            className="flex-1" 
            placeholder="Enter Establishment Name..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>

        <div className="space-y-4">
          {results.length === 0 && !loading && (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted/50" />
              <p>No results found. Enter a search term.</p>
            </div>
          )}

          {results.map((org) => (
            <Link key={org.id} href={`/verify/${org.type.toLowerCase()}/${org.slug}`}>
              <Card className="hover:border-primary transition-all cursor-pointer mb-4">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{org.name}</h3>
                    <p className="text-xs text-muted-foreground">{org.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Trust Score</p>
                    <p className="font-bold text-primary">{org.trustScore || "N/A"}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
