"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Reveal from "../Reveal";
import { GardenCard } from "./GardenCard";
import type { GardenNode } from "@/lib/garden";
import {
  bookBadge,
  bookGenre,
  BOOK_GENRE_ORDER,
  type BookBadgeStatus,
  type BookGenreId,
} from "@/lib/reading-shelf";

type FilterTab = "status" | "genre";

const STATUS_FILTERS: { value: BookBadgeStatus; label: string }[] = [
  { value: "reading", label: "Reading" },
  { value: "half-read", label: "Half read" },
  { value: "to-read", label: "To read" },
  { value: "read", label: "Read" },
];

function toggleSet<T>(current: Set<T>, value: T): Set<T> {
  const next = new Set(current);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function filterBooks(
  books: GardenNode[],
  statuses: Set<BookBadgeStatus>,
  genres: Set<BookGenreId>,
): GardenNode[] {
  let list = books;

  if (statuses.size > 0) {
    list = list.filter((book) => statuses.has(bookBadge(book).cls));
  }
  if (genres.size > 0) {
    list = list.filter((book) => genres.has(bookGenre(book)));
  }

  return list;
}

function ReadingFilterMenu({
  statuses,
  genres,
  genreOptions,
  onStatuses,
  onGenres,
  onClear,
}: {
  statuses: Set<BookBadgeStatus>;
  genres: Set<BookGenreId>;
  genreOptions: { id: BookGenreId; label: string; shortLabel: string }[];
  onStatuses: (value: Set<BookBadgeStatus>) => void;
  onGenres: (value: Set<BookGenreId>) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<FilterTab | null>(null);
  const [panelPos, setPanelPos] = useState<{ top: number; right: number } | null>(
    null,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const filtered = statuses.size > 0 || genres.size > 0;

  const updatePanelPos = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setPanelPos({
      top: rect.bottom + 5,
      right: Math.max(12, window.innerWidth - rect.right),
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePanelPos();
    window.addEventListener("resize", updatePanelPos);
    window.addEventListener("scroll", updatePanelPos, true);
    return () => {
      window.removeEventListener("resize", updatePanelPos);
      window.removeEventListener("scroll", updatePanelPos, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);

  const toggleOpen = () => {
    if (open) {
      setOpen(false);
      return;
    }
    setTab(null);
    updatePanelPos();
    setOpen(true);
  };

  const panel =
    open && panelPos ? (
      <div
        ref={panelRef}
        className="reading-filter__panel reading-filter__panel--portal"
        style={{ top: panelPos.top, right: panelPos.right }}
      >
        <div className="reading-filter__tabs" role="group" aria-label="Filter by">
          <button
            type="button"
            className={`reading-shelf-pill reading-shelf-pill--compact${tab === "status" ? " is-active" : ""}`}
            aria-pressed={tab === "status"}
            onClick={() => setTab("status")}
          >
            Status
          </button>
          <button
            type="button"
            className={`reading-shelf-pill reading-shelf-pill--compact${tab === "genre" ? " is-active" : ""}`}
            aria-pressed={tab === "genre"}
            onClick={() => setTab("genre")}
          >
            Genre
          </button>
        </div>

        {tab === "status" ? (
          <div className="reading-filter__list" role="group" aria-label="Status">
            {STATUS_FILTERS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`reading-shelf-pill reading-shelf-pill--compact${statuses.has(opt.value) ? " is-active" : ""}`}
                aria-pressed={statuses.has(opt.value)}
                onClick={() => onStatuses(toggleSet(statuses, opt.value))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : null}

        {tab === "genre" ? (
          <div
            className="reading-filter__list reading-filter__list--scroll"
            role="group"
            aria-label="Genre"
          >
            {genreOptions.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`reading-shelf-pill reading-shelf-pill--compact${genres.has(g.id) ? " is-active" : ""}`}
                aria-pressed={genres.has(g.id)}
                onClick={() => onGenres(toggleSet(genres, g.id))}
              >
                {g.shortLabel}
              </button>
            ))}
          </div>
        ) : null}

        {filtered ? (
          <button
            type="button"
            className="reading-shelf-pill reading-shelf-pill--compact reading-filter__clear"
            onClick={onClear}
          >
            Clear
          </button>
        ) : null}
      </div>
    ) : null;

  return (
    <div className="reading-filter">
      <button
        ref={triggerRef}
        type="button"
        className={`reading-shelf-pill reading-filter__trigger${filtered ? " is-active" : ""}${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={toggleOpen}
      >
        Filter
      </button>

      {typeof document !== "undefined" && panel
        ? createPortal(panel, document.body)
        : null}
    </div>
  );
}

export function ReadingShelf({ books }: { books: GardenNode[] }) {
  const [statuses, setStatuses] = useState<Set<BookBadgeStatus>>(new Set());
  const [genres, setGenres] = useState<Set<BookGenreId>>(new Set());

  const visible = useMemo(
    () => filterBooks(books, statuses, genres),
    [books, statuses, genres],
  );

  const genreOptions = useMemo(
    () =>
      BOOK_GENRE_ORDER.filter(
        (g) => g.id === "other" || books.some((book) => bookGenre(book) === g.id),
      ),
    [books],
  );

  const clearFilters = () => {
    setStatuses(new Set());
    setGenres(new Set());
  };

  return (
    <>
      <div className="reading-page__toolbar">
        <div className="reading-page__label">
          Reading &middot; <b>Books</b>
          <span className="reading-page__chev" aria-hidden>
            {" "}
            &rsaquo;
          </span>
        </div>
        <ReadingFilterMenu
          statuses={statuses}
          genres={genres}
          genreOptions={genreOptions}
          onStatuses={setStatuses}
          onGenres={setGenres}
          onClear={clearFilters}
        />
      </div>

      <div className="reading-shelf">
        {visible.length === 0 ? (
          <p className="reading-shelf__empty">No books match that filter.</p>
        ) : (
          visible.map((book, i) => (
            <div key={book.id} className="reading-shelf__cell">
              <Reveal delay={(i % 4) * 40} className="reading-shelf__reveal">
                <GardenCard node={book} shelf />
              </Reveal>
            </div>
          ))
        )}
      </div>
    </>
  );
}
