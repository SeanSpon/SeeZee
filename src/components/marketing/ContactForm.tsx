"use client";
import { useState, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
export default function ContactForm() {
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const feedback = useRef<HTMLDivElement>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: `Project: ${data.get("service")}\n\n${data.get("message")}`,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || "Your message could not be sent. Please try again.",
        );
      setReference(result.referenceId || "");
      setMessage(
        result.teamNotified
          ? "Your message is saved and the team has been notified."
          : "Your message is saved. You can also reach us by phone or email below.",
      );
      setStatus("success");
      form.reset();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again or email us directly.",
      );
      setStatus("error");
    }
    requestAnimationFrame(() => feedback.current?.focus());
  }
  return (
    <form className="studio-form" onSubmit={submit}>
      <h2>Tell us a little about it.</h2>
      <div className="studio-form-row">
        <label>
          Your name
          <input
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            placeholder="First and last name"
          />
        </label>
        <label>
          Email address
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={255}
            placeholder="you@company.com"
          />
        </label>
      </div>
      <label>
        What can we help with?
        <select name="service" defaultValue="">
          <option value="" disabled>
            Select a service
          </option>
          <option>New website or redesign</option>
          <option>Custom app or automation</option>
          <option>Maintenance or technical support</option>
          <option>Not sure yet</option>
        </select>
      </label>
      <label>
        What do you have in mind?
        <textarea
          name="message"
          rows={6}
          required
          maxLength={4500}
          placeholder="What does your organization do, and what would you like to improve?"
        />
      </label>
      <p className="studio-form-note">
        We use these details to respond to your inquiry.{" "}
        <a href="/privacy">Privacy policy</a>
      </p>
      <button
        type="submit"
        className="studio-button"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending…" : "Send your message"}
        <ArrowUpRight size={18} aria-hidden="true" />
      </button>
      <div
        ref={feedback}
        tabIndex={-1}
        role={status === "error" ? "alert" : "status"}
        aria-live="polite"
        className={`studio-form-feedback studio-form-${status}`}
      >
        {message}
        {reference && <p>Reference: {reference}</p>}
      </div>
    </form>
  );
}
