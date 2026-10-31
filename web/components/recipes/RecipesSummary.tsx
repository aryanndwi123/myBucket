"use client";

import { useState } from "react";
import { FOLDER_DOT } from "@/lib/data";
import { folderHref } from "@/lib/folders";
import { RECIPES_SUMMARY, type ShopItem } from "@/lib/recipes";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { CheckIcon, HeartIcon, ShareIcon } from "@/components/ui/icons";
import { Button, Checkbox, Eyebrow } from "@/components/ui/primitives";

const S = RECIPES_SUMMARY;

const sectionHeading = "font-serif text-4xl leading-none";

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card px-5 py-3">
      <p className="font-serif text-4xl leading-none tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-ink-3">{label}</p>
    </div>
  );
}

function ShopList({ title, items, ticked, onToggle }: { title: string; items: ShopItem[]; ticked: Set<string>; onToggle: (name: string) => void }) {
  return (
    <div role="group" aria-label={title}>
      <h3 className="font-serif text-2xl">{title}</h3>
      <div className="mt-2">
        {items.map((item) => (
          <Checkbox key={item.name} checked={ticked.has(item.name)} onChange={() => onToggle(item.name)}>
            {item.name}
            <span className="block text-xs text-ink-4">for {item.forRecipe}</span>
          </Checkbox>
        ))}
      </div>
    </div>
  );
}

export function RecipesSummary() {
  const [ticked, setTicked] = useState<Set<string>>(new Set());
  const [reminded, setReminded] = useState<Set<string>>(new Set());

  const toggle = (set: Set<string>, name: string) => {
    const next = new Set(set);
    if (!next.delete(name)) next.add(name);
    return next;
  };
  const shopTotal = S.utensils.length + S.ingredients.length;

  return (
    <>
      <Breadcrumb trail={[{ label: "Saves", href: "/" }, { label: "Recipes", href: folderHref("Recipes") }, { label: "Summary" }]} />

      <header className="mt-2 flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
        <div className="max-w-2xl">
          <Eyebrow className="text-xs tracking-[0.12em]">Folder summary</Eyebrow>
          <h1 className="mt-2 font-serif text-5xl leading-[1.02] sm:text-[56px]">Recipes</h1>
          <p className="mt-3 text-lg leading-snug text-ink-2">{S.oneLiner}</p>
        </div>
        <div className="flex gap-3">
          <Stat value={S.saved} label="saved" />
          <Stat value={S.tried} label="tried" />
          <Stat value={S.liked} label="liked" />
        </div>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-14">
          <section aria-labelledby="top-heading">
            <h2 id="top-heading" className={sectionHeading}>
              Top shared recipes
            </h2>
            <p className="mt-2 text-sm text-ink-3">Most liked and most shared across Stashd this week.</p>
            <ol className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
              {S.topShared.map((r, i) => (
                <li key={r.title} className="flex flex-col overflow-hidden rounded-[22px] border border-line bg-card">
                  <div className="relative h-28" style={{ background: r.tint }}>
                    <span className="absolute top-3 left-3 rounded-md bg-white/85 px-2 py-1 font-mono text-[11px] leading-none">#{i + 1}</span>
                    <span className="absolute right-3 bottom-3 rounded-md bg-white/85 px-2 py-1 font-mono text-[11px] leading-none">{r.sub}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-[15px] leading-snug font-semibold">{r.title}</p>
                    <p className="mt-1.5 text-sm leading-snug text-ink-3">{r.blurb}</p>
                    <p className="mt-auto pt-3 text-xs text-ink-4">
                      {r.by} · {r.time}
                    </p>
                    <p className="mt-2 flex gap-4 text-sm font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <HeartIcon className="size-4 text-ember" />
                        {r.likes}
                        <span className="sr-only">likes</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <ShareIcon className="size-4 text-ink-3" />
                        {r.shares}
                        <span className="sr-only">shares</span>
                      </span>
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="liked-heading">
            <h2 id="liked-heading" className={sectionHeading}>
              Liked by you
            </h2>
            <p className="mt-2 text-sm text-ink-3">Three recipes you liked, sorted into subcategories.</p>
            <ul className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
              {S.likedByYou.map((r) => (
                <li key={r.title}>
                  <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-ink-3 uppercase">
                    <span className="size-2 rounded-full" style={{ background: FOLDER_DOT.Recipes }} />
                    {r.sub}
                  </p>
                  <div className="mt-2 rounded-[22px] border border-line bg-card p-4">
                    <p className="text-[15px] leading-snug font-semibold">{r.title}</p>
                    <p className="mt-1.5 text-sm leading-snug text-ink-3">{r.blurb}</p>
                    <p className="mt-3 flex items-center justify-between gap-3 text-xs text-ink-4">
                      <span>{r.by}</span>
                      {r.saved && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-sunken px-2 py-1 font-medium text-ink">
                          <CheckIcon className="size-3" /> Saved
                        </span>
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="shop-heading">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h2 id="shop-heading" className={sectionHeading}>
                To buy and look for
              </h2>
              <p className="text-sm text-ink-3">
                {ticked.size} of {shopTotal} ticked off
              </p>
            </div>
            <p className="mt-2 text-sm text-ink-3">What the recipes you liked will need, so Sunday doesn&rsquo;t start with a shop run.</p>
            <div className="mt-5 grid gap-x-10 gap-y-6 rounded-3xl border border-line bg-card p-6 sm:grid-cols-2">
              <ShopList title="Utensils to look for" items={S.utensils} ticked={ticked} onToggle={(n) => setTicked((t) => toggle(t, n))} />
              <ShopList title="Ingredients to buy" items={S.ingredients} ticked={ticked} onToggle={(n) => setTicked((t) => toggle(t, n))} />
            </div>
          </section>

          <p className="font-mono text-[11px] text-ink-4">Sample data · this page is a static preview of the folder summary</p>
        </div>

        <aside aria-labelledby="sunday-heading" className="rounded-3xl bg-ink p-6 text-on-ink lg:sticky lg:top-24">
          <p className="font-mono text-[11px] tracking-[0.14em] text-ember-soft uppercase">Do this now</p>
          <h2 id="sunday-heading" className="mt-3 font-serif text-4xl leading-none">
            Sunday, you can try this
          </h2>
          <ul className="mt-6 flex flex-col gap-6">
            {S.sunday.map((p) => {
              const on = reminded.has(p.title);
              return (
                <li key={p.title} className="border-t border-ink-border pt-5 first:border-t-0 first:pt-0">
                  <p className="font-mono text-xs text-ember-soft">
                    {p.time} · {p.slot}
                  </p>
                  <p className="mt-1.5 text-[17px] leading-snug font-semibold">{p.title}</p>
                  <p className="mt-1.5 text-sm leading-snug text-on-ink-muted">{p.why}</p>
                  <Button
                    variant={on ? "light" : "dark-outline"}
                    size="sm"
                    aria-pressed={on}
                    className="mt-3"
                    onClick={() => setReminded((r) => toggle(r, p.title))}
                  >
                    {on ? (
                      <>
                        <CheckIcon className="size-4" /> Reminder set
                      </>
                    ) : (
                      "Remind me Sunday"
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </>
  );
}
