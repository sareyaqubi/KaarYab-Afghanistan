"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { Loader2, Star } from "lucide-react";
import { useData } from "@/providers/data";
import { useAuth } from "@/providers/auth";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(4),
  content: z.string().min(20),
  pros: z.string(),
  cons: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
}

export function ReviewModal({ open, onClose, companyId, companyName }: ReviewModalProps) {
  const { addReview } = useData();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
  });

  if (!currentUser) return null;

  const onSubmit = async (values: FormValues) => {
    addReview({
      companyId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      role: currentUser.applicantProfile?.headline ?? "Employee",
      rating,
      salaryAccuracy: rating,
      management: rating,
      communication: rating,
      environment: rating,
      culture: rating,
      growth: rating,
      title: values.title,
      content: values.content,
      pros: values.pros,
      cons: values.cons,
      verified: false,
    });
    toast("Review submitted — thank you!");
    reset();
    setRating(5);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={`Review ${companyName}`} description="Share your experience to help other job seekers.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label>Overall rating</Label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="p-0.5"
                aria-label={`${star} stars`}
              >
                <Star
                  className={cn(
                    "h-7 w-7 transition-colors",
                    (hover || rating) >= star ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                  )}
                />
              </button>
            ))}
            <span className="ml-2 text-sm font-semibold">{rating}.0 / 5</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Review title</Label>
          <Input placeholder="e.g. Great company to grow with" {...register("title")} />
          {errors.title && <p className="text-xs text-destructive">Title is required (min 4 characters)</p>}
        </div>

        <div className="space-y-2">
          <Label>Your review</Label>
          <Textarea rows={4} placeholder="What was it like working here?" {...register("content")} />
          {errors.content && <p className="text-xs text-destructive">Review is required (min 20 characters)</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Pros</Label>
            <Textarea rows={3} placeholder="What did you like?" {...register("pros")} />
          </div>
          <div className="space-y-2">
            <Label>Cons</Label>
            <Textarea rows={3} placeholder="What could improve?" {...register("cons")} />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="gradient" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
            Submit review
          </Button>
        </div>
      </form>
    </Modal>
  );
}
