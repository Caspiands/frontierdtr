"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function ShowcaseError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#F3F5F8] px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 text-[#13294B] shadow-sm">
        <Alert variant="destructive">
          <AlertTitle>The roadmap could not be opened</AlertTitle>
          <AlertDescription>Something went wrong while loading this page. Try again.</AlertDescription>
        </Alert>
        <Button type="button" className="mt-4 h-11 bg-[#13294B] text-white hover:bg-[#0d1c36]" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
