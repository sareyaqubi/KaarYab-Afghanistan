"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarPlus, Loader2 } from "lucide-react";
import { useData } from "@/providers/data";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { Application, InterviewMode } from "@/lib/types";

const schema = z.object({
  mode: z.enum(["online", "offline", "video", "phone"]),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;

interface ScheduleInterviewModalProps {
  open: boolean;
  onClose: () => void;
  application: Application | null;
}

const modeValues: [InterviewMode, ...InterviewMode[]] = ["online", "offline", "video", "phone"];
const modeLabels: Record<InterviewMode, string> = {
  online: "Online",
  offline: "In person",
  video: "Video call",
  phone: "Phone",
};

export function ScheduleInterviewModal({ open, onClose, application }: ScheduleInterviewModalProps) {
  const { scheduleInterview } = useData();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { mode: "video" },
  });

  if (!application) return null;

  const onSubmit = async (values: FormValues) => {
    scheduleInterview({
      applicationId: application.id,
      jobId: application.jobId,
      applicantId: application.applicantId,
      companyId: application.companyId,
      mode: values.mode,
      date: new Date(values.date).toISOString(),
      time: values.time,
      location: values.location || undefined,
      notes: values.notes || undefined,
    });
    toast("Interview scheduled");
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Schedule interview" description="The applicant will be notified instantly.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label>Mode</Label>
          <Select {...register("mode")}>
            {modeValues.map((m) => (
              <option key={m} value={m}>{modeLabels[m]}</option>
            ))}
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" {...register("date")} />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Time</Label>
            <Input type="time" {...register("time")} />
            {errors.time && <p className="text-xs text-destructive">{errors.time.message}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Location / Link (optional)</Label>
          <Input placeholder="e.g. Office address or meeting link" {...register("location")} />
        </div>
        <div className="space-y-2">
          <Label>Notes (optional)</Label>
          <Textarea rows={3} placeholder="Anything the applicant should prepare…" {...register("notes")} />
        </div>
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="gradient" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
            Schedule
          </Button>
        </div>
      </form>
    </Modal>
  );
}
