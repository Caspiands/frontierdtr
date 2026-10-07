"use client";

import { ContentProvider } from "@/components/showcase/content-context";
import { DocumentView } from "@/components/showcase/document-view";
import { UiProvider } from "@/components/showcase/ui-context";
import type { Role } from "@/lib/types";

export function ShowcaseApp({
  role,
  email,
  initialTexts,
}: {
  role: Role;
  email: string;
  initialTexts: Record<string, string>;
}) {
  return (
    <ContentProvider role={role} email={email} initialTexts={initialTexts}>
      <UiProvider>
        <div className="dtr" data-role={role}>
          <DocumentView />
        </div>
      </UiProvider>
    </ContentProvider>
  );
}
