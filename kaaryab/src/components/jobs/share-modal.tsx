"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy, Link2, MessageCircle, Rss, Send } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
}

export function ShareModal({ open, onClose, title }: ShareModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    toast("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  type Network = "whatsapp" | "telegram" | "facebook" | "twitter";

  const share = (network: Network) => {
    const encoded = encodeURIComponent(url);
    const text = encodeURIComponent(`Check out this opportunity: ${title}`);
    const links: Record<Network, string> = {
      whatsapp: `https://wa.me/?text=${text}%20${encoded}`,
      telegram: `https://t.me/share/url?url=${encoded}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      twitter: `https://twitter.com/intent/tweet?url=${encoded}&text=${text}`,
    };
    window.open(links[network], "_blank", "noopener,noreferrer,width=600,height=500");
    toast("Opening share window…", "info");
  };

  return (
    <Modal open={open} onClose={onClose} title="Share this opportunity" className="max-w-md">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 p-3">
        <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input readOnly value={url} className="w-full bg-transparent text-sm outline-none" aria-label="Share link" />
        <Button variant="outline" size="sm" onClick={copyLink} aria-label="Copy link">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      <p className="mt-5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Share on</p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {(
          [
            { key: "whatsapp", label: "WhatsApp", icon: <MessageCircle className="h-5 w-5" />, color: "bg-emerald-500" },
            { key: "telegram", label: "Telegram", icon: <Send className="h-5 w-5" />, color: "bg-sky-500" },
            { key: "facebook", label: "Facebook", icon: <Rss className="h-5 w-5" />, color: "bg-indigo-500" },
            { key: "twitter", label: "Twitter / X", icon: <Rss className="h-5 w-5" />, color: "bg-slate-700" },
          ] as { key: Network; label: string; icon: ReactNode; color: string }[]
        ).map((s) => (
          <button
            key={s.key}
            onClick={() => share(s.key)}
            className="flex flex-col items-center gap-2 rounded-xl border border-border p-3 transition-all hover:border-primary/40 hover:shadow-soft"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${s.color}`}>
              {s.icon}
            </span>
            <span className="text-xs font-semibold">{s.label}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
