"use client";
import React, { useState } from "react";
import { Section } from "@/components/ui/section";

export default function Page() {
  const [state, setState] = useState({ name: "", email: "", message: "" });

  return (
    <Section title="Contact" subtitle="Tell us what you're trying to build.">
      <form
        className="mx-auto max-w-xl rounded-2xl border bg-background/60 p-6 backdrop-blur"
        onSubmit={(e) => {
          e.preventDefault();
          alert("Thanks — we'll reply soon!");
        }}
      >
        <label className="block text-sm">
          Name
          <input
            className="mt-1 w-full rounded-xl border bg-background px-3 py-2"
            value={state.name}
            onChange={(e) => setState({ ...state, name: e.target.value })}
            required
          />
        </label>
        <label className="mt-4 block text-sm">
          Email
          <input
            type="email"
            className="mt-1 w-full rounded-xl border bg-background px-3 py-2"
            value={state.email}
            onChange={(e) => setState({ ...state, email: e.target.value })}
            required
          />
        </label>
        <label className="mt-4 block text-sm">
          Message
          <textarea
            rows={5}
            className="mt-1 w-full rounded-xl border bg-background px-3 py-2"
            value={state.message}
            onChange={(e) => setState({ ...state, message: e.target.value })}
          />
        </label>
        <button
          className="mt-5 w-full rounded-xl border px-4 py-2 font-medium hover:bg-accent"
          type="submit"
        >
          Send
        </button>
      </form>
    </Section>
  );
}
