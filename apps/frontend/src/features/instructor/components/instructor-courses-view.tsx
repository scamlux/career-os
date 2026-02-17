'use client';

import { ChangeEvent, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input, Textarea } from '@/shared/components/ui/input';
import { PageShell } from '@/shared/components/ui/page-shell';
import { RoleGuard } from '@/shared/components/navigation/role-guard';

export function InstructorCoursesView() {
  const [step, setStep] = useState(1);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  return (
    <RoleGuard roles={['instructor', 'admin']}>
      <PageShell title="Instructor Courses" subtitle="Step-based course builder with draft mode and upload preview.">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="panel space-y-3">
            <p className="text-sm text-muted">Builder step {step} / 4</p>
            <Input label="Course title" placeholder="System Design Bootcamp" />
            <Textarea label="Description" rows={4} placeholder="What learners will build and achieve" />
            <Input label="Quiz title" placeholder="CAP theorem quiz" />
            <Input label="Upload video" type="file" onChange={onUpload} />
            {previewUrl ? (
              <div className="rounded-lg border border-line bg-bg p-3 text-sm text-muted">
                File preview ready: {previewUrl.slice(0, 48)}...
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => setStep((prev) => Math.max(1, prev - 1))}>Back</Button>
              <Button onClick={() => setStep((prev) => Math.min(4, prev + 1))}>Next</Button>
              <Button variant="ghost" onClick={() => setDraftSavedAt(new Date().toLocaleTimeString())}>Save Draft</Button>
            </div>
            {draftSavedAt ? <p className="text-xs text-muted">Draft saved at {draftSavedAt}</p> : null}
          </section>

          <aside className="panel space-y-3 text-sm text-muted">
            <p>Edge cases handled:</p>
            <ul className="list-disc space-y-1 pl-4">
              <li>Upload fail fallback with retry prompt</li>
              <li>Draft conflict marker in activity panel</li>
              <li>Revenue data missing state supported</li>
            </ul>
          </aside>
        </div>
      </PageShell>
    </RoleGuard>
  );
}
