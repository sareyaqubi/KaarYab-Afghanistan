"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useData } from "@/providers/data";
import { useAuth } from "@/providers/auth";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
}

const reasons = [
  "Fake or misleading posting",
  "Scam or fraudulent activity",
  "Offensive or inappropriate content",
  "Duplicate posting",
  "Expired opportunity",
  "Other",
];

export function ReportModal({ open, onClose, jobId }: ReportModalProps) {
  const { reportJob } = useData();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [reason, setReason] = useState(reasons[0]);
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);

  const submit = () => {
    reportJob(jobId, currentUser?.id ?? "guest", reason, detail);
    setDone(true);
    toast("Report submitted. Our team will review it.", "info");
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setDone(false);
        setDetail("");
        onClose();
      }}
      title={done ? "Thank you" : "Report this opportunity"}
      hideClose={done}
    >
      {done ? (
        <div className="py-6 text-center">
          <Flag className="mx-auto h-12 w-12 text-amber-500" />
          <p className="mt-3 text-sm text-muted-foreground">
            Our moderation team will review this report. Thank you for keeping KaarYab safe.
          </p>
          <Button
            variant="outline"
            className="mt-5"
            onClick={() => {
              setDone(false);
              onClose();
            }}
          >
            Close
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Why are you reporting this opportunity?</p>
          <div className="flex flex-col gap-2">
            {reasons.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all",
                  reason === r
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                )}
              >
                <span
                  className={cn(
                    "h-3.5 w-3.5 rounded-full border-2",
                    reason === r ? "border-primary bg-primary" : "border-muted-foreground/40"
                  )}
                />
                {r}
              </button>
            ))}
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium">Additional details (optional)</p>
            <Textarea value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Tell us more..." />
          </div>
          <Button variant="destructive" className="w-full" onClick={submit}>
            <Flag className="h-4 w-4" />
            Submit report
          </Button>
        </div>
      )}
    </Modal>
  );
}
