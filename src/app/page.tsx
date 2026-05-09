"use client";

import {
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Database,
  Eye,
  GraduationCap,
  LayoutDashboard,
  Lock,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  getVerbById,
  packageGroups,
  testPackages,
  verbs,
  type OptionKey,
  type TestPackage,
  type VerbItem,
  type VerbType,
} from "@/data/verb-content";
import { filterVerbs } from "@/lib/learning";

type SectionId =
  | "dashboard"
  | "search"
  | "material"
  | "flipcard"
  | "test"
  | "superadmin";

type StoredProgress = {
  viewedCards: string[];
  submittedTests: Record<
    string,
    {
      answers: Record<string, OptionKey>;
      score: number;
      submittedAt: string;
    }
  >;
};

const STORAGE_KEY = "tbi-regular-irregular-progress-v1";

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "search", label: "Pencarian", icon: Search },
  { id: "material", label: "Materi", icon: BookOpen },
  { id: "flipcard", label: "Flipcard", icon: Brain },
  { id: "test", label: "Tes", icon: ClipboardCheck },
  { id: "superadmin", label: "SuperAdmin", icon: ShieldCheck },
] satisfies Array<{ id: SectionId; label: string; icon: typeof LayoutDashboard }>;

const emptyProgress: StoredProgress = {
  viewedCards: [],
  submittedTests: {},
};

function loadStoredProgress(): StoredProgress {
  if (typeof window === "undefined") {
    return emptyProgress;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return emptyProgress;
    }

    const parsed = JSON.parse(raw) as Partial<StoredProgress>;

    return {
      viewedCards: Array.isArray(parsed.viewedCards)
        ? parsed.viewedCards.filter((value) => typeof value === "string")
        : [],
      submittedTests:
        parsed.submittedTests && typeof parsed.submittedTests === "object"
          ? parsed.submittedTests
          : {},
    };
  } catch {
    return emptyProgress;
  }
}

function saveStoredProgress(progress: StoredProgress) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function percentage(value: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function getTypeLabel(type: VerbType | "mixed") {
  if (type === "regular") {
    return "Regular";
  }

  if (type === "irregular") {
    return "Irregular";
  }

  return "Mixed";
}

function getPackageStatus(
  testPackage: TestPackage,
  progress: StoredProgress,
  draftAnswers: Record<string, Record<string, OptionKey>>,
) {
  if (progress.submittedTests[testPackage.id]) {
    return "Submitted";
  }

  const draft = draftAnswers[testPackage.id];

  if (draft && Object.keys(draft).length > 0) {
    return "Draft";
  }

  return "Not started";
}

export default function Home() {
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [query, setQuery] = useState("");
  const [materialFilter, setMaterialFilter] = useState<VerbType | "all">("all");
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activePackageId, setActivePackageId] = useState(testPackages[0].id);
  const [draftAnswers, setDraftAnswers] = useState<
    Record<string, Record<string, OptionKey>>
  >({});
  const [progress, setProgress] = useState<StoredProgress>(emptyProgress);
  const [progressReady, setProgressReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProgress(loadStoredProgress());
      setProgressReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (progressReady) {
      saveStoredProgress(progress);
    }
  }, [progress, progressReady]);

  const regularCount = verbs.filter((verb) => verb.type === "regular").length;
  const irregularCount = verbs.filter((verb) => verb.type === "irregular").length;
  const viewedCount = progress.viewedCards.length;
  const submittedCount = Object.keys(progress.submittedTests).length;
  const draftCount = testPackages.filter(
    (testPackage) =>
      getPackageStatus(testPackage, progress, draftAnswers) === "Draft",
  ).length;
  const filteredVerbs = useMemo(() => filterVerbs(verbs, query), [query]);
  const materialVerbs = verbs.filter((verb) =>
    materialFilter === "all" ? true : verb.type === materialFilter,
  );
  const currentCard = verbs[cardIndex];
  const activePackage =
    testPackages.find((testPackage) => testPackage.id === activePackageId) ??
    testPackages[0];
  const submittedPackage = progress.submittedTests[activePackage.id];
  const currentDraft = draftAnswers[activePackage.id] ?? {};
  const activeScore = submittedPackage?.score ?? 0;

  function navigateTo(section: SectionId) {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function markCardViewed(verbId: string) {
    setProgress((current) => {
      if (current.viewedCards.includes(verbId)) {
        return current;
      }

      return {
        ...current,
        viewedCards: [...current.viewedCards, verbId],
      };
    });
  }

  function flipCard() {
    setIsFlipped((current) => !current);
    markCardViewed(currentCard.id);
  }

  function moveCard(direction: -1 | 1) {
    setIsFlipped(false);
    setCardIndex((current) => (current + direction + verbs.length) % verbs.length);
  }

  function selectAnswer(questionId: string, optionKey: OptionKey) {
    if (submittedPackage) {
      return;
    }

    setDraftAnswers((current) => ({
      ...current,
      [activePackage.id]: {
        ...(current[activePackage.id] ?? {}),
        [questionId]: optionKey,
      },
    }));
  }

  function submitTest() {
    if (submittedPackage) {
      return;
    }

    const correct = activePackage.questions.filter(
      (question) => currentDraft[question.id] === question.correctKey,
    ).length;

    setProgress((current) => ({
      ...current,
      submittedTests: {
        ...current.submittedTests,
        [activePackage.id]: {
          answers: currentDraft,
          score: correct,
          submittedAt: new Date().toISOString(),
        },
      },
    }));
  }

  function resetDemoProgress() {
    setProgress(emptyProgress);
    setDraftAnswers({});
    saveStoredProgress(emptyProgress);
  }

  return (
    <main className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto grid min-h-dvh w-full max-w-[1480px] grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-[var(--line)] bg-[var(--paper)] lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col gap-6 p-4 sm:p-6">
            <div className="rounded-[8px] border border-[var(--line)] bg-[var(--primary)] p-4 text-[var(--primary-ink)]">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-[8px] bg-[var(--primary-ink)] text-[var(--primary)]">
                  <GraduationCap aria-hidden="true" className="size-6" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-xs uppercase tracking-[0.08em]">
                    Persiapantubel
                  </p>
                  <h1 className="text-xl font-semibold leading-tight break-words">
                    <span className="hidden sm:inline">
                      TBI - Regular and Irregular Verb
                    </span>
                    <span className="sm:hidden">TBI Verbs</span>
                  </h1>
                </div>
              </div>
            </div>

            <nav aria-label="Navigasi utama" className="grid gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => navigateTo(item.id)}
                    className={`flex min-h-12 items-center gap-3 rounded-[8px] border px-3 text-left text-sm font-semibold transition ${
                      isActive
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-ink)]"
                        : "border-transparent text-[var(--foreground)] hover:border-[var(--line)] hover:bg-[var(--surface)]"
                    }`}
                  >
                    <Icon aria-hidden="true" className="size-5 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto rounded-[8px] border border-[var(--line)] bg-[var(--surface)] p-4">
              <p className="font-mono text-xs uppercase text-[var(--muted)]">
                MVP boundary
              </p>
              <p className="mt-2 break-words text-sm leading-6">
                Progress demo tersimpan di browser. Production berikutnya perlu
                auth, database, dan audit log server-side.
              </p>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="border-b border-[var(--line)] bg-[var(--background)] px-4 py-5 sm:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--accent)]">
                  Fresh-start live MVP
                </p>
                <h2 className="mt-2 max-w-4xl break-words text-2xl font-semibold leading-tight sm:text-5xl">
                  Cockpit belajar verb forms untuk TBI Persiapantubel.
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Metric label="Regular" value={regularCount} />
                <Metric label="Irregular" value={irregularCount} />
                <Metric label="Flipcard" value={viewedCount} suffix={`/${verbs.length}`} />
                <Metric
                  label="Tes"
                  value={submittedCount}
                  suffix={`/${testPackages.length}`}
                />
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-8 lg:py-8">
            {activeSection === "dashboard" && (
              <DashboardSection
                viewedCount={viewedCount}
                submittedCount={submittedCount}
                draftCount={draftCount}
                navigateTo={navigateTo}
              />
            )}

            {activeSection === "search" && (
              <SearchSection
                query={query}
                setQuery={setQuery}
                filteredVerbs={filteredVerbs}
              />
            )}

            {activeSection === "material" && (
              <MaterialSection
                materialFilter={materialFilter}
                setMaterialFilter={setMaterialFilter}
                materialVerbs={materialVerbs}
              />
            )}

            {activeSection === "flipcard" && (
              <FlipcardSection
                cardIndex={cardIndex}
                currentCard={currentCard}
                isFlipped={isFlipped}
                moveCard={moveCard}
                flipCard={flipCard}
                viewedCards={progress.viewedCards}
              />
            )}

            {activeSection === "test" && (
              <TestSection
                activePackage={activePackage}
                activePackageId={activePackageId}
                activeScore={activeScore}
                currentDraft={currentDraft}
                draftAnswers={draftAnswers}
                progress={progress}
                selectAnswer={selectAnswer}
                setActivePackageId={setActivePackageId}
                submitTest={submitTest}
                submittedPackage={submittedPackage}
              />
            )}

            {activeSection === "superadmin" && (
              <SuperAdminSection
                resetDemoProgress={resetDemoProgress}
                viewedCount={viewedCount}
                submittedCount={submittedCount}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-[8px] border border-[var(--line)] bg-[var(--paper)] px-4 py-3">
      <p className="font-mono text-[11px] uppercase text-[var(--muted)]">{label}</p>
      <p className="mt-1 font-mono text-xl font-medium">
        {Number.isFinite(value) ? value : ""}
        {suffix && <span className="text-sm text-[var(--muted)]">{suffix}</span>}
      </p>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="mb-6 max-w-4xl">
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--accent)]">
        {eyebrow}
      </p>
      <h3 className="mt-2 break-words text-2xl font-semibold leading-tight sm:text-3xl">
        {title}
      </h3>
      <p className="mt-3 max-w-prose text-base leading-7 text-[var(--muted)]">
        {body}
      </p>
    </div>
  );
}

function DashboardSection({
  viewedCount,
  submittedCount,
  draftCount,
  navigateTo,
}: {
  viewedCount: number;
  submittedCount: number;
  draftCount: number;
  navigateTo: (section: SectionId) => void;
}) {
  const flipPercent = percentage(viewedCount, verbs.length);
  const testPercent = percentage(submittedCount, testPackages.length);

  return (
    <section>
      <SectionTitle
        eyebrow="Dashboard"
        title="Lanjutkan belajar dari status terakhir."
        body="Dashboard menampilkan progres yang bisa ditindaklanjuti: buka flipcard berikutnya, lanjutkan draft tes, atau mulai paket baru."
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-5">
          <div className="flex items-center gap-3">
            <BarChart3 aria-hidden="true" className="size-6 text-[var(--primary)]" />
            <h4 className="text-xl font-semibold">Progress chart</h4>
          </div>
          <div className="mt-6 grid gap-5">
            <ProgressBar
              label="Flipcard dibuka"
              value={viewedCount}
              total={verbs.length}
              percent={flipPercent}
            />
            <ProgressBar
              label="Paket tes submitted"
              value={submittedCount}
              total={testPackages.length}
              percent={testPercent}
            />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric label="Viewed" value={viewedCount} suffix={`/${verbs.length}`} />
            <Metric label="Draft tes" value={draftCount} />
            <Metric
              label="Submitted"
              value={submittedCount}
              suffix={`/${testPackages.length}`}
            />
          </div>
        </div>

        <div className="grid gap-4">
          <ActionCard
            icon={Brain}
            title="Buka flipcard berikutnya"
            body="Latih recall Verb-1, Verb-2, Verb-3, dan arti tanpa melihat jawaban dulu."
            button="Mulai Flipcard"
            onClick={() => navigateTo("flipcard")}
          />
          <ActionCard
            icon={ClipboardCheck}
            title={draftCount > 0 ? "Selesaikan draft tes" : "Mulai paket tes"}
            body="Tes terkunci setelah submit final. Draft tetap bisa diedit sebelum submit."
            button="Buka Tes"
            onClick={() => navigateTo("test")}
          />
        </div>
      </div>
    </section>
  );
}

function ProgressBar({
  label,
  value,
  total,
  percent,
}: {
  label: string;
  value: number;
  total: number;
  percent: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <span className="font-semibold">{label}</span>
        <span className="font-mono text-sm text-[var(--muted)]">
          {value}/{total} - {percent}%
        </span>
      </div>
      <div
        aria-hidden="true"
        className="mt-2 h-3 overflow-hidden rounded-[8px] bg-[var(--surface)]"
      >
        <div
          className="h-full rounded-[8px] bg-[var(--primary)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  body,
  button,
  onClick,
}: {
  icon: typeof Brain;
  title: string;
  body: string;
  button: string;
  onClick: () => void;
}) {
  return (
    <article className="rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-5">
      <Icon aria-hidden="true" className="size-6 text-[var(--accent)]" />
      <h4 className="mt-4 text-xl font-semibold">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p>
      <button
        type="button"
        onClick={onClick}
        className="mt-5 min-h-11 rounded-[8px] bg-[var(--foreground)] px-4 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--primary)]"
      >
        {button}
      </button>
    </article>
  );
}

function SearchSection({
  query,
  setQuery,
  filteredVerbs,
}: {
  query: string;
  setQuery: (value: string) => void;
  filteredVerbs: VerbItem[];
}) {
  return (
    <section>
      <SectionTitle
        eyebrow="Pencarian"
        title="Cari semua verb aktif dari satu tempat."
        body="Search mencakup Verb-1, Verb-2, Verb-3, arti, type, tier, pattern, dan catatan. Cocok untuk lookup cepat saat mengerjakan materi."
      />
      <label className="block max-w-3xl">
        <span className="text-sm font-semibold">Cari verb atau arti</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="mt-2 min-h-12 w-full rounded-[8px] border border-[var(--line)] bg-[var(--paper)] px-4 text-base"
          placeholder="contoh: went, menerapkan, vowel, regular"
        />
      </label>
      <p className="mt-3 font-mono text-sm text-[var(--muted)]" aria-live="polite">
        {filteredVerbs.length} hasil ditemukan
      </p>
      <VerbTable verbs={filteredVerbs} />
    </section>
  );
}

function MaterialSection({
  materialFilter,
  setMaterialFilter,
  materialVerbs,
}: {
  materialFilter: VerbType | "all";
  setMaterialFilter: (value: VerbType | "all") => void;
  materialVerbs: VerbItem[];
}) {
  return (
    <section>
      <SectionTitle
        eyebrow="Materi"
        title="Bank materi berbasis paket dan pola."
        body="Materi menampilkan bentuk lengkap yang dibutuhkan siswa untuk menjawab tes: Verb-1, Verb-2, Verb-3, arti, pattern, note, dan common mistake."
      />
      <PackageRail />
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter materi">
        {(["all", "regular", "irregular"] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            aria-pressed={materialFilter === filter}
            onClick={() => setMaterialFilter(filter)}
            className={`min-h-11 rounded-[8px] border px-4 text-sm font-semibold ${
              materialFilter === filter
                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-ink)]"
                : "border-[var(--line)] bg-[var(--paper)]"
            }`}
          >
            {filter === "all" ? "Semua" : getTypeLabel(filter)}
          </button>
        ))}
      </div>
      <VerbTable verbs={materialVerbs} />
    </section>
  );
}

function PackageRail() {
  return (
    <div className="mb-5 grid gap-3 md:grid-cols-3">
      {packageGroups.map((group) => (
        <div
          key={group.id}
          className="rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-4"
        >
          <p className="font-mono text-xs uppercase text-[var(--muted)]">
            {getTypeLabel(group.type)}
          </p>
          <h4 className="mt-1 font-semibold">{group.title}</h4>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {group.verbIds.length} verb aktif
          </p>
        </div>
      ))}
    </div>
  );
}

function VerbTable({ verbs: tableVerbs }: { verbs: VerbItem[] }) {
  return (
    <div className="mt-5 overflow-hidden rounded-[8px] border border-[var(--line)] bg-[var(--paper)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <thead className="bg-[var(--surface)]">
            <tr>
              {["Type", "Verb-1", "Verb-2", "Verb-3", "Artinya", "Pattern", "Common mistake"].map(
                (head) => (
                  <th key={head} className="px-4 py-3 text-sm font-semibold">
                    {head}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {tableVerbs.map((verb) => (
              <tr key={verb.id} className="border-t border-[var(--line)] align-top">
                <td className="px-4 py-3 font-mono text-xs uppercase">
                  {getTypeLabel(verb.type)}
                </td>
                <td className="px-4 py-3 font-semibold">{verb.verb1}</td>
                <td className="px-4 py-3">{verb.verb2}</td>
                <td className="px-4 py-3">{verb.verb3}</td>
                <td className="px-4 py-3">{verb.meaning}</td>
                <td className="px-4 py-3 text-sm text-[var(--muted)]">{verb.pattern}</td>
                <td className="px-4 py-3 text-sm text-[var(--muted)]">
                  {verb.commonMistake}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FlipcardSection({
  cardIndex,
  currentCard,
  isFlipped,
  moveCard,
  flipCard,
  viewedCards,
}: {
  cardIndex: number;
  currentCard: VerbItem;
  isFlipped: boolean;
  moveCard: (direction: -1 | 1) => void;
  flipCard: () => void;
  viewedCards: string[];
}) {
  const isViewed = viewedCards.includes(currentCard.id);

  return (
    <section>
      <SectionTitle
        eyebrow="Flipcard"
        title="Recall dulu, baru lihat jawaban."
        body="Sisi depan tidak membocorkan Verb-2 dan Verb-3. Sisi belakang menampilkan bentuk lengkap, arti, pattern, dan kesalahan umum."
      />
      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <div className="rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-5">
          <p className="font-mono text-sm text-[var(--muted)]">
            Kartu {cardIndex + 1}/{verbs.length}
          </p>
          <ProgressBar
            label="Flipcard dibuka"
            value={viewedCards.length}
            total={verbs.length}
            percent={percentage(viewedCards.length, verbs.length)}
          />
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => moveCard(-1)}
              aria-label="Kartu sebelumnya"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-[8px] border border-[var(--line)] bg-[var(--paper)]"
            >
              <ChevronLeft aria-hidden="true" className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => moveCard(1)}
              aria-label="Kartu berikutnya"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-[8px] border border-[var(--line)] bg-[var(--paper)]"
            >
              <ChevronRight aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={flipCard}
          aria-expanded={isFlipped}
          className="min-h-[360px] rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-6 text-left transition hover:border-[var(--primary)]"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-xs uppercase text-[var(--muted)]">
              {isFlipped ? "Jawaban" : "Recall"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-[8px] bg-[var(--surface)] px-3 py-2 text-sm">
              <Eye aria-hidden="true" className="size-4" />
              {isViewed ? "Sudah dibuka" : "Belum dibuka"}
            </span>
          </div>
          {!isFlipped ? (
            <div className="mt-16">
              <p className="font-mono text-sm uppercase text-[var(--accent)]">
                {getTypeLabel(currentCard.type)} - {currentCard.tier}
              </p>
              <h4 className="mt-4 text-6xl font-semibold leading-none">
                {currentCard.verb1}
              </h4>
              <p className="mt-5 max-w-prose text-lg leading-8 text-[var(--muted)]">
                Ingat Verb-2, Verb-3, dan artinya sebelum membuka kartu.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-5">
              <div className="grid gap-3 sm:grid-cols-4">
                <AnswerPill label="Verb-1" value={currentCard.verb1} />
                <AnswerPill label="Verb-2" value={currentCard.verb2} />
                <AnswerPill label="Verb-3" value={currentCard.verb3} />
                <AnswerPill label="Arti" value={currentCard.meaning} />
              </div>
              <div className="rounded-[8px] bg-[var(--surface)] p-4">
                <p className="font-semibold">Pattern</p>
                <p className="mt-1 text-[var(--muted)]">{currentCard.pattern}</p>
              </div>
              <div className="rounded-[8px] bg-[var(--surface)] p-4">
                <p className="font-semibold">Common mistake</p>
                <p className="mt-1 text-[var(--muted)]">
                  {currentCard.commonMistake}
                </p>
              </div>
            </div>
          )}
        </button>
      </div>
    </section>
  );
}

function AnswerPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-4">
      <p className="font-mono text-xs uppercase text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function TestSection({
  activePackage,
  activePackageId,
  activeScore,
  currentDraft,
  draftAnswers,
  progress,
  selectAnswer,
  setActivePackageId,
  submitTest,
  submittedPackage,
}: {
  activePackage: TestPackage;
  activePackageId: string;
  activeScore: number;
  currentDraft: Record<string, OptionKey>;
  draftAnswers: Record<string, Record<string, OptionKey>>;
  progress: StoredProgress;
  selectAnswer: (questionId: string, optionKey: OptionKey) => void;
  setActivePackageId: (id: string) => void;
  submitTest: () => void;
  submittedPackage?: StoredProgress["submittedTests"][string];
}) {
  const answeredCount = Object.keys(currentDraft).length;

  return (
    <section>
      <SectionTitle
        eyebrow="Tes"
        title="Submit final mengunci attempt."
        body="Mode demo ini menyimpan draft di sesi browser dan menyimpan hasil submit di localStorage. Production harus memakai database dan audit log."
      />
      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <div className="rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-4 xl:sticky xl:top-6 xl:self-start">
          <p className="font-mono text-xs uppercase text-[var(--muted)]">
            Paket tes
          </p>
          <div className="mt-3 grid gap-2">
            {testPackages.map((testPackage) => {
              const status = getPackageStatus(testPackage, progress, draftAnswers);
              const isActive = activePackageId === testPackage.id;

              return (
                <button
                  key={testPackage.id}
                  type="button"
                  onClick={() => setActivePackageId(testPackage.id)}
                  className={`rounded-[8px] border p-3 text-left ${
                    isActive
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-ink)]"
                      : "border-[var(--line)] bg-[var(--paper)]"
                  }`}
                >
                  <span className="block font-semibold">{testPackage.title}</span>
                  <span className="mt-1 block text-sm opacity-80">{status}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-5 rounded-[8px] bg-[var(--surface)] p-4">
            <p className="font-semibold">{activePackage.title}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {activePackage.description}
            </p>
            <p className="mt-3 font-mono text-sm text-[var(--muted)]">
              Terjawab {answeredCount}/{activePackage.questions.length}
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {submittedPackage && (
            <div className="rounded-[8px] border border-[var(--success)] bg-[var(--paper)] p-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 aria-hidden="true" className="size-6 text-[var(--success)]" />
                <div>
                  <h4 className="font-semibold">Tes sudah submitted</h4>
                  <p className="text-sm text-[var(--muted)]">
                    Skor {activeScore}/{activePackage.questions.length}. Jawaban terkunci.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activePackage.questions.map((question, index) => {
            const selected =
              submittedPackage?.answers[question.id] ?? currentDraft[question.id];
            const isSubmitted = Boolean(submittedPackage);
            const isWrong =
              isSubmitted && selected !== undefined && selected !== question.correctKey;

            return (
              <article
                key={question.id}
                className="rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <h4 className="text-lg font-semibold">
                    {index + 1}. {question.prompt}
                  </h4>
                  {isSubmitted && (
                    <span
                      className={`inline-flex items-center gap-2 rounded-[8px] px-3 py-2 text-sm font-semibold ${
                        selected === question.correctKey
                          ? "bg-[#dceee4] text-[var(--success)]"
                          : "bg-[#f4ddd9] text-[var(--danger)]"
                      }`}
                    >
                      {selected === question.correctKey ? "Benar" : "Salah"}
                    </span>
                  )}
                </div>
                <div className="mt-4 grid gap-2">
                  {question.options.map((quizOption) => {
                    const isSelected = selected === quizOption.key;
                    const isCorrect = question.correctKey === quizOption.key;

                    return (
                      <button
                        key={quizOption.key}
                        type="button"
                        aria-pressed={isSelected}
                        disabled={isSubmitted}
                        onClick={() => selectAnswer(question.id, quizOption.key)}
                        className={`min-h-12 rounded-[8px] border px-4 py-3 text-left transition ${
                          isSubmitted && isCorrect
                            ? "border-[var(--success)] bg-[#eef8f0]"
                            : isSubmitted && isSelected && isWrong
                              ? "border-[var(--danger)] bg-[#fff1ee]"
                              : isSelected
                                ? "border-[var(--primary)] bg-[var(--surface)]"
                                : "border-[var(--line)] bg-[var(--paper)] hover:bg-[var(--surface)]"
                        }`}
                      >
                        <span className="font-mono font-medium">{quizOption.key}.</span>{" "}
                        {quizOption.text}
                        {isSubmitted && isCorrect && (
                          <span className="ml-2 font-semibold text-[var(--success)]">
                            Kunci
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {isSubmitted && (
                  <div className="mt-4 rounded-[8px] bg-[var(--surface)] p-4">
                    <p className="font-semibold">Pembahasan</p>
                    <p className="mt-1 leading-7 text-[var(--muted)]">
                      {question.explanation}
                    </p>
                    {getVerbById(question.verbId) && (
                      <p className="mt-3 font-mono text-sm text-[var(--muted)]">
                        Source verb: {getVerbById(question.verbId)?.verb1}
                      </p>
                    )}
                  </div>
                )}
              </article>
            );
          })}

          <button
            type="button"
            onClick={submitTest}
            disabled={Boolean(submittedPackage)}
            className="min-h-12 rounded-[8px] bg-[var(--foreground)] px-5 font-semibold text-[var(--background)] disabled:cursor-not-allowed disabled:bg-[var(--muted)]"
          >
            {submittedPackage ? "Submitted dan terkunci" : "Submit final"}
          </button>
        </div>
      </div>
    </section>
  );
}

function SuperAdminSection({
  resetDemoProgress,
  viewedCount,
  submittedCount,
}: {
  resetDemoProgress: () => void;
  viewedCount: number;
  submittedCount: number;
}) {
  const healthItems = [
    ["Verb aktif", verbs.length.toString()],
    ["Regular", verbs.filter((verb) => verb.type === "regular").length.toString()],
    ["Irregular", verbs.filter((verb) => verb.type === "irregular").length.toString()],
    ["Paket tes", testPackages.length.toString()],
    [
      "Soal",
      testPackages.reduce((sum, testPackage) => sum + testPackage.questions.length, 0).toString(),
    ],
    ["Opsi", "4 per soal"],
  ];

  return (
    <section>
      <SectionTitle
        eyebrow="SuperAdmin"
        title="Operational summary untuk MVP statis."
        body="Panel ini sengaja tidak memalsukan CRUD produksi. Saat database dan auth dibuat, area ini menjadi student management, content CMS, import/export, reset attempt, dan audit log."
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <div className="rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-5">
          <div className="flex items-center gap-3">
            <Database aria-hidden="true" className="size-6 text-[var(--primary)]" />
            <h4 className="text-xl font-semibold">Content health</h4>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {healthItems.map(([label, value]) => (
              <Metric key={label} label={label} value={Number.NaN} suffix={value} />
            ))}
          </div>
          <div className="mt-5 rounded-[8px] bg-[var(--surface)] p-4">
            <p className="font-semibold">Demo progress controls</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Flipcard dibuka: {viewedCount}. Tes submitted: {submittedCount}. Reset ini
              hanya membersihkan localStorage browser.
            </p>
            <button
              type="button"
              onClick={resetDemoProgress}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-[var(--line)] bg-[var(--paper)] px-4 font-semibold"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              Reset demo progress
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          <AdminBoundaryCard
            icon={Lock}
            title="Production auth"
            body="Nomor WA + password hash, server session, role check, forced password rotation, dan logout."
          />
          <AdminBoundaryCard
            icon={Settings}
            title="Real SuperAdmin CRUD"
            body="Student management, verb bank, package, question, option, publish state, import/export, dan reset attempt."
          />
          <AdminBoundaryCard
            icon={ShieldCheck}
            title="Audit and integrity"
            body="Audit log untuk reset password, reset attempt, publish changes, import confirmation, dan answer key edits."
          />
        </div>
      </div>
    </section>
  );
}

function AdminBoundaryCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Lock;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-5">
      <Icon aria-hidden="true" className="size-6 text-[var(--accent)]" />
      <h4 className="mt-4 font-semibold">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p>
    </article>
  );
}
