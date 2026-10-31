import { LinkButton } from "./primitives";

/** Shared 404 copy, rendered inside the app shell for known routes and bare for unknown URLs. */
export function NotFoundState() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="font-mono text-xs tracking-[0.14em] text-ink-4 uppercase">404</p>
      <h1 className="mt-3 font-serif text-5xl leading-none">Nothing here</h1>
      <p className="mt-4 text-ink-3">That page doesn’t exist, or it moved. Your saves are safe.</p>
      <div className="mt-6 flex justify-center gap-3">
        <LinkButton href="/">Back to Today</LinkButton>
        <LinkButton href="/all" variant="outline">
          All saves
        </LinkButton>
      </div>
    </div>
  );
}
