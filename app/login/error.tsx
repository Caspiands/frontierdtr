"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function LoginError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#13294B] px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 text-[#13294B]">
        <Alert variant="destructive">
          <AlertTitle>Sign-in is unavailable</AlertTitle>
          <AlertDescription>The sign-in screen could not be opened. Try again.</AlertDescription>
        </Alert>
        <Button type="button" className="mt-4 h-11 bg-[#C8102E] text-white hover:bg-[#a30d26]" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
