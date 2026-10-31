import { Button } from "./primitives";

/** Grey placeholder cards while saves load. */
export function CardSkeletons({ count = 8 }: { count?: number }) {
  return (
    <ul aria-hidden="true" className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="h-60 animate-pulse-soft rounded-[20px] border border-line bg-sunken/60" />
      ))}
    </ul>
  );
}

/** Whole-page skeleton for folder, topic and save pages while data loads. */
export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading">
      <div className="h-5 w-40 animate-pulse-soft rounded-md bg-sunken" />
      <div className="mt-3 h-56 animate-pulse-soft rounded-[28px] bg-sunken/70" />
      <CardSkeletons count={4} />
    </div>
  );
}

/** Shown when the API can't be reached, with a way to try again. */
export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-lg py-20 text-center">
      <h1 className="font-serif text-4xl leading-none">Couldn’t load your saves</h1>
      <p className="mt-4 text-ink-3">{message}</p>
      <div className="mt-6 flex justify-center">
        <Button onClick={onRetry}>Try again</Button>
      </div>
    </div>
  );
}
