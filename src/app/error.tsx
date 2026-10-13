"use client";
export default function ProductError({ reset }: { reset: () => void }) {
  return <main className="workspace"><h1>This view is temporarily unavailable</h1><p>Your operational evidence has not been changed. Please try again.</p><button onClick={reset}>Try again</button></main>;
}
