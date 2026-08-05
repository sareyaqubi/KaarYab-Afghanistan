"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  Paperclip,
  Plus,
  Send,
  Smile,
} from "lucide-react";
import { useData } from "@/providers/data";
import { useAuth } from "@/providers/auth";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";
import type { Conversation, Message, User } from "@/lib/types";

const AUTO_REPLIES = [
  "Thanks for reaching out! I'll get back to you shortly.",
  "Sounds good, let me review and respond soon.",
  "Great, thanks for the update!",
  "I've noted it down. Talk soon!",
  "Got it — appreciate your message.",
];

const EMOJIS = ["😀", "😂", "😊", "👍", "🙏", "❤️", "🎉", "🔥", "💼", "📚", "✅", "⭐", "🚀", "🤝", "🙌", "💪", "👏", "😉", "✨", "🎯"];

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" });
}

export function MessagesPage() {
  const { toast } = useToast();
  const { currentUser, users } = useAuth();
  const { conversations, sendMessage, markConversationRead, createConversation } = useData();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [composing, setComposing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoReplyRef = useRef<{ convId: string; msgId: string } | null>(null);

  const uid = currentUser?.id ?? "";
  const usersById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const myConvos = useMemo(
    () =>
      conversations
        .filter((c) => c.participants.includes(uid))
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [conversations, uid]
  );

  const active = useMemo(() => myConvos.find((c) => c.id === activeId) ?? null, [myConvos, activeId]);

  const otherParticipant = (conv: Conversation): User | null => {
    const otherId = conv.participants.find((p) => p !== uid);
    return otherId ? usersById.get(otherId) ?? null : null;
  };

  const unreadFor = (conv: Conversation) =>
    conv.messages.filter((m) => m.senderId !== uid && !m.readBy.includes(uid)).length;

  const lastMessage = (conv: Conversation) => conv.messages[conv.messages.length - 1];

  useEffect(() => {
    if (!activeId) return;
    markConversationRead(activeId, uid);
  }, [activeId, uid, markConversationRead]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, typing]);

  useEffect(() => {
    if (!active || active.messages.length === 0) return;
    const last = active.messages[active.messages.length - 1];
    if (last.senderId !== uid) return;
    if (autoReplyRef.current?.convId === active.id && autoReplyRef.current?.msgId === last.id) return;
    autoReplyRef.current = { convId: active.id, msgId: last.id };
    const other = otherParticipant(active);
    if (!other) return;
    const timer = setTimeout(() => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
        sendMessage(active.id, other.id, uid, reply);
      }, 1200);
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id, active?.messages.length]);

  if (!currentUser) return null;

  const select = (id: string) => {
    setActiveId(id);
    setComposing(false);
  };

  const openNew = () => {
    setNewMessageOpen(true);
    setComposing(false);
  };

  const startConversation = (user: User) => {
    const existing = conversations.find(
      (c) => c.participants.includes(uid) && c.participants.includes(user.id)
    );
    const id = existing?.id ?? createConversation([uid, user.id]).id;
    setNewMessageOpen(false);
    setActiveId(id);
    setComposing(true);
  };

  const send = () => {
    const trimmed = text.trim();
    const other = active ? otherParticipant(active) : null;
    if (!trimmed || !other || !active) return;
    sendMessage(active.id, uid, other.id, trimmed);
    setText("");
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  const attachFile = () => {
    if (!active) return;
    const other = otherParticipant(active);
    if (!other) return;
    sendMessage(active.id, uid, other.id, "Shared a file", "pdf", "resume.pdf");
    toast("File sent");
  };

  const recipients = users.filter((u) => u.id !== uid && u.role !== "guest");

  const renderMessages = (conv: Conversation) => {
    const msgs = conv.messages;
    const nodes: React.ReactNode[] = [];
    let lastDay = "";
    msgs.forEach((m, i) => {
      const day = new Date(m.createdAt).toDateString();
      if (day !== lastDay) {
        lastDay = day;
        nodes.push(
          <div key={`d-${day}`} className="my-3 flex justify-center">
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              {formatDate(m.createdAt)}
            </span>
          </div>
        );
      }
      nodes.push(<MessageBubble key={m.id} message={m} isMine={m.senderId === uid} isLast={i === msgs.length - 1} />);
    });
    return nodes;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex h-[calc(100vh-13rem)] min-h-[480px]">
        {/* Conversation list */}
        <div className={cn("w-full flex-col border-r border-border lg:flex lg:w-80", activeId && !composing ? "hidden lg:flex" : "flex")}>
          <div className="flex items-center justify-between gap-2 border-b border-border p-4">
            <h2 className="font-bold">Messages</h2>
            <Button variant="ghost" size="icon-sm" onClick={openNew} aria-label="New message">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {myConvos.length === 0 ? (
              <div className="flex h-full items-center justify-center p-6">
                <p className="text-center text-sm text-muted-foreground">
                  No conversations yet.
                  <button onClick={openNew} className="mt-1 block w-full font-semibold text-primary hover:underline">
                    Start a new message
                  </button>
                </p>
              </div>
            ) : (
              myConvos.map((conv) => {
                const other = otherParticipant(conv);
                const unread = unreadFor(conv);
                const last = lastMessage(conv);
                const isActive = conv.id === activeId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => select(conv.id)}
                    className={cn(
                      "flex w-full items-center gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                      isActive && "bg-primary/5"
                    )}
                  >
                    <Avatar src={other?.applicantProfile?.photo} name={other?.name ?? "User"} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{other?.name ?? "User"}</p>
                        {last && (
                          <span className="shrink-0 text-[11px] text-muted-foreground">{formatRelativeTime(last.createdAt)}</span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <p className={cn("truncate text-xs", unread > 0 ? "font-semibold text-foreground" : "text-muted-foreground")}>
                          {last ? (last.type === "pdf" ? "Shared a file" : last.text) : "Say hello 👋"}
                        </p>
                        {unread > 0 && (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Thread */}
        <div className={cn("flex-1 flex-col lg:flex", activeId && composing ? "flex" : "hidden lg:flex")}>
          {!active ? (
            <div className="flex h-full items-center justify-center p-8">
              <EmptyState
                icon={<MessageSquare className="h-6 w-6" />}
                title="Select a conversation"
                hint="Pick a conversation from the list, or start a new one."
                action={
                  <Button variant="gradient" onClick={openNew}>
                    <Plus className="h-4 w-4" />
                    New message
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-border p-4">
                <button className="lg:hidden" onClick={() => setComposing(false)} aria-label="Back to conversations">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar src={otherParticipant(active)?.applicantProfile?.photo} name={otherParticipant(active)?.name ?? "User"} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{otherParticipant(active)?.name ?? "User"}</p>
                  <p className="text-xs text-muted-foreground">
                    {typing ? (
                      <span className="flex items-center gap-1 text-primary">
                        typing
                        <span className="flex gap-0.5">
                          <span className="h-1 w-1 animate-bounce rounded-full bg-primary" />
                          <span className="h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:120ms]" />
                          <span className="h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:240ms]" />
                        </span>
                      </span>
                    ) : (
                      <Badge variant="outline">{usersById.get(otherParticipant(active)?.id ?? "")?.role}</Badge>
                    )}
                  </p>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={attachFile} aria-label="Attach file">
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>

              <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto bg-muted/20 p-4">
                {renderMessages(active)}
                {typing && (
                  <div className="flex items-center gap-2">
                    <div className="rounded-2xl rounded-bl-md border border-border bg-card px-4 py-2.5">
                      <span className="flex gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:120ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:240ms]" />
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative border-t border-border p-3">
                <AnimatePresence>
                  {pickerOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      className="absolute bottom-16 left-3 z-10 grid w-64 grid-cols-8 gap-1 rounded-2xl border border-border bg-card p-2 shadow-xl"
                    >
                      {EMOJIS.map((e) => (
                        <button
                          key={e}
                          onClick={() => setText((prev) => prev + e)}
                          className="rounded-lg p-1 text-lg transition-colors hover:bg-muted"
                        >
                          {e}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setPickerOpen((o) => !o)} aria-label="Emoji picker">
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    placeholder="Type a message…"
                    className="flex-1"
                  />
                  <Button variant="gradient" size="icon" onClick={send} aria-label="Send message" disabled={!text.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New message modal */}
      <Modal open={newMessageOpen} onClose={() => setNewMessageOpen(false)} title="New message" description="Choose who to message.">
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {recipients.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No users available.</p>
          ) : (
            recipients.map((u) => (
              <button
                key={u.id}
                onClick={() => startConversation(u)}
                className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-muted"
              >
                <Avatar src={u.applicantProfile?.photo} name={u.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{u.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.role}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}

function MessageBubble({ message, isMine, isLast }: { message: Message; isMine: boolean; isLast: boolean }) {
  return (
    <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[75%]", isMine && "text-right")}>
        {message.type === "pdf" ? (
          <div
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-4 py-2.5",
              isMine ? "rounded-br-md border-primary/30 bg-primary/10" : "rounded-bl-md border-border bg-card"
            )}
          >
            <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", isMine ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
              <FileText className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">{message.fileName ?? "document.pdf"}</p>
              <p className="text-xs text-muted-foreground">PDF • {(1 + (message.id.charCodeAt(0) % 9) / 10).toFixed(1)} MB</p>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              isMine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border bg-card"
            )}
          >
            {message.text}
          </div>
        )}
        <p className={cn("mt-1 text-[11px] text-muted-foreground", isMine && "flex items-center justify-end gap-1")}>
          {formatTime(message.createdAt)}
          {isMine && isLast && (message.readBy.length > 1 ? <span className="text-sky-500">✓✓</span> : <span>✓</span>)}
        </p>
      </div>
    </div>
  );
}
