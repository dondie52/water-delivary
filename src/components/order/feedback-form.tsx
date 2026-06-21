"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FeedbackForm({ orderNumber }: { orderNumber: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const response = await fetch("/api/v1/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, rating, comment })
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Could not save feedback");
      return;
    }

    setMessage("Thank you. Your feedback was saved.");
  }

  return (
    <main className="water-canvas grid min-h-screen place-items-center px-4">
      <form className="w-full max-w-md rounded-lg border bg-white p-5 shadow-sm" onSubmit={submit}>
        <h1 className="text-2xl font-bold text-slate-950">Rate your order</h1>
        <p className="mt-2 text-sm text-slate-600">Order {orderNumber}</p>
        <label className="mt-5 grid gap-2 text-sm font-semibold text-slate-800">
          Rating
          <select className="h-11 rounded-md border bg-white px-3 text-sm focus-ring" value={rating} onChange={(event) => setRating(Number(event.target.value))}>
            {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-800">
          Comment
          <textarea className="min-h-28 rounded-md border bg-white p-3 text-sm focus-ring" value={comment} onChange={(event) => setComment(event.target.value)} />
        </label>
        {message ? <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">{message}</p> : null}
        {error ? <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
        <Button className="mt-5 w-full">Submit feedback</Button>
        <Link className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline" href={`/order/${orderNumber}`}>Back to receipt</Link>
      </form>
    </main>
  );
}
