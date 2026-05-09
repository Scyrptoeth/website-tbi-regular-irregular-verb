"use client";

import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  ClipboardCheck,
  Eye,
  LayoutDashboard,
  Lock,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Search,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  getVerbById,
  testPackages,
  verbs,
  type OptionKey,
  type QuizQuestion,
  type TestPackage,
  type VerbItem,
  type VerbType,
} from "@/data/verb-content";
import { filterVerbs } from "@/lib/learning";

type View = "dashboard" | "search" | "materi" | "flipcard" | "tes" | "superadmin";
type PackageStatus = "ready" | "draft" | "submitted";

type DraftAttempt = {
  answers: Partial<Record<string, OptionKey>>;
  updatedAt: string;
};

type SubmittedAttempt = DraftAttempt & {
  score: number;
  submittedAt: string;
};

type StoredProgress = {
  viewedCards: string[];
  drafts: Record<string, DraftAttempt>;
  submitted: Record<string, SubmittedAttempt>;
};

type StudyPackage = {
  id: string;
  title: string;
  type: VerbType;
  order: number;
  description: string;
  verbs: VerbItem[];
};

type RailItem = {
  id: string;
  title: string;
  subtitle: string;
  order: number;
  status: PackageStatus;
};

const STORAGE_KEY = "tbi-regular-irregular-progress-v3";
const PACKAGE_PAGE_SIZE = 10;
const STUDY_PACKAGE_SIZE = 10;

const emptyProgress: StoredProgress = {
  viewedCards: [],
  drafts: {},
  submitted: {},
};

const navigation: Array<{ id: View; label: string; icon: LucideIcon }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "search", label: "Pencarian", icon: Search },
  { id: "materi", label: "Materi", icon: BookOpen },
  { id: "flipcard", label: "Flipcard", icon: Brain },
  { id: "tes", label: "Tes", icon: ClipboardCheck },
  { id: "superadmin", label: "SuperAdmin", icon: ShieldCheck },
];

function chunkVerbs(items: VerbItem[], size: number) {
  const chunks: VerbItem[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

const regularPackages = chunkVerbs(
  verbs.filter((verb) => verb.type === "regular"),
  STUDY_PACKAGE_SIZE,
);

const irregularPackages = chunkVerbs(
  verbs.filter((verb) => verb.type === "irregular"),
  STUDY_PACKAGE_SIZE,
);

const studyPackages: StudyPackage[] = [
  ...regularPackages.map((packageVerbs, index) => ({
    id: `regular-set-${index + 1}`.padStart(13, "0"),
    title: `Verb Forms ${String(index + 1).padStart(2, "0")}`,
    type: "regular" as const,
    order: index + 1,
    description: "Regular verb package with academic and workplace vocabulary.",
    verbs: packageVerbs,
  })),
  ...irregularPackages.map((packageVerbs, index) => ({
    id: `irregular-set-${index + 1}`.padStart(15, "0"),
    title: `Verb Forms ${String(regularPackages.length + index + 1).padStart(2, "0")}`,
    type: "irregular" as const,
    order: regularPackages.length + index + 1,
    description: "Irregular verb package with high-priority TBI forms.",
    verbs: packageVerbs,
  })),
];

function isOptionKey(value: unknown): value is OptionKey {
  return value === "A" || value === "B" || value === "C" || value === "D";
}

function sanitizeAnswers(value: unknown): Partial<Record<string, OptionKey>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce<Partial<Record<string, OptionKey>>>(
    (answers, [questionId, answer]) => {
      if (isOptionKey(answer)) {
        answers[questionId] = answer;
      }

      return answers;
    },
    {},
  );
}

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
    const drafts = Object.entries(parsed.drafts ?? {}).reduce<
      Record<string, DraftAttempt>
    >((safeDrafts, [packageId, value]) => {
      if (!value || typeof value !== "object") {
        return safeDrafts;
      }

      const draft = value as Partial<DraftAttempt>;
      safeDrafts[packageId] = {
        answers: sanitizeAnswers(draft.answers),
        updatedAt:
          typeof draft.updatedAt === "string"
            ? draft.updatedAt
            : new Date().toISOString(),
      };

      return safeDrafts;
    }, {});

    const submitted = Object.entries(parsed.submitted ?? {}).reduce<
      Record<string, SubmittedAttempt>
    >((safeSubmitted, [packageId, value]) => {
      if (!value || typeof value !== "object") {
        return safeSubmitted;
      }

      const attempt = value as Partial<SubmittedAttempt>;
      const score = typeof attempt.score === "number" ? attempt.score : 0;

      safeSubmitted[packageId] = {
        answers: sanitizeAnswers(attempt.answers),
        updatedAt:
          typeof attempt.updatedAt === "string"
            ? attempt.updatedAt
            : new Date().toISOString(),
        score,
        submittedAt:
          typeof attempt.submittedAt === "string"
            ? attempt.submittedAt
            : new Date().toISOString(),
      };

      return safeSubmitted;
    }, {});

    return {
      viewedCards: Array.isArray(parsed.viewedCards)
        ? parsed.viewedCards.filter((value) => typeof value === "string")
        : [],
      drafts,
      submitted,
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
  return total === 0 ? 0 : Math.round((value / total) * 100);
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStudyPackageStatus(
  studyPackage: StudyPackage,
  progress: StoredProgress,
): PackageStatus {
  const viewed = studyPackage.verbs.filter((verb) =>
    progress.viewedCards.includes(verb.id),
  ).length;

  if (viewed === studyPackage.verbs.length && studyPackage.verbs.length > 0) {
    return "submitted";
  }

  return viewed > 0 ? "draft" : "ready";
}

function getTestPackageStatus(
  testPackage: TestPackage,
  progress: StoredProgress,
): PackageStatus {
  if (progress.submitted[testPackage.id]) {
    return "submitted";
  }

  const answerCount = Object.keys(
    progress.drafts[testPackage.id]?.answers ?? {},
  ).length;

  return answerCount > 0 ? "draft" : "ready";
}

function scoreQuestions(
  questions: QuizQuestion[],
  answers: Partial<Record<string, OptionKey>>,
) {
  return questions.filter((question) => answers[question.id] === question.correctKey)
    .length;
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function ProgressBar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const progress = percentage(value, total);

  return (
    <div className="progress-line">
      <div>
        <span>{label}</span>
        <strong>
          {value}/{total}
        </strong>
      </div>
      <div
        aria-label={`${label}: ${progress}%`}
        className="progress-track"
        role="img"
      >
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function PackageStatusIcon({ status }: { status: PackageStatus }) {
  if (status === "submitted") {
    return <CheckCircle2 aria-label="Selesai" size={18} />;
  }

  if (status === "draft") {
    return <Eye aria-label="Berjalan" size={18} />;
  }

  return <Circle aria-label="Tersedia" size={18} />;
}

function PackageRail({
  title,
  items,
  activeId,
  collapsed,
  onToggleCollapsed,
  onSelect,
}: {
  title: string;
  items: RailItem[];
  activeId: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onSelect: (id: string) => void;
}) {
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeId),
  );
  const [page, setPage] = useState(Math.floor(activeIndex / PACKAGE_PAGE_SIZE));
  const pageCount = Math.max(1, Math.ceil(items.length / PACKAGE_PAGE_SIZE));

  const safePage = Math.min(page, pageCount - 1);
  const firstIndex = safePage * PACKAGE_PAGE_SIZE;
  const visibleItems = items.slice(firstIndex, firstIndex + PACKAGE_PAGE_SIZE);

  return (
    <aside
      aria-label={`${title} packages`}
      className={`package-rail ${collapsed ? "is-collapsed" : ""}`}
    >
      <div className="package-rail-header">
        <div>
          <span className="eyebrow">Paket</span>
          <strong>{title}</strong>
        </div>
        <button
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Buka daftar paket" : "Tutup daftar paket"}
          className="rail-toggle"
          onClick={onToggleCollapsed}
          type="button"
        >
          {collapsed ? <Menu size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <div className="package-page-controls">
        <button
          aria-label="Paket sebelumnya"
          disabled={safePage === 0}
          onClick={() => setPage((current) => Math.max(0, current - 1))}
          type="button"
        >
          <ChevronLeft size={16} />
          <span>Prev</span>
        </button>
        <span>
          {firstIndex + 1}-{Math.min(firstIndex + PACKAGE_PAGE_SIZE, items.length)} /{" "}
          {items.length}
        </span>
        <button
          aria-label="Paket berikutnya"
          disabled={safePage >= pageCount - 1}
          onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
          type="button"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="package-list">
        {visibleItems.map((item) => (
          <button
            aria-label={`${item.title}: ${item.subtitle}`}
            aria-current={item.id === activeId ? "page" : undefined}
            className={item.id === activeId ? "active" : ""}
            key={item.id}
            onClick={() => onSelect(item.id)}
            type="button"
          >
            <span className="package-compact-number">
              {String(item.order).padStart(2, "0")}
            </span>
            <span className="package-copy">
              <strong>{item.title}</strong>
              <small>{item.subtitle}</small>
            </span>
            <PackageStatusIcon status={item.status} />
          </button>
        ))}
      </div>
    </aside>
  );
}

export function LearningApp() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [query, setQuery] = useState("");
  const [materialFilter, setMaterialFilter] = useState<VerbType | "all">("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [activeStudyPackageId, setActiveStudyPackageId] = useState(
    studyPackages[0]?.id ?? "",
  );
  const [activeTestPackageId, setActiveTestPackageId] = useState(
    testPackages[0]?.id ?? "",
  );
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [progressReady, setProgressReady] = useState(false);
  const [progress, setProgress] = useState<StoredProgress>(emptyProgress);

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

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const regularCount = verbs.filter((verb) => verb.type === "regular").length;
  const irregularCount = verbs.filter((verb) => verb.type === "irregular").length;
  const viewedCount = progress.viewedCards.length;
  const submittedCount = Object.keys(progress.submitted).length;
  const draftCount = testPackages.filter(
    (testPackage) => getTestPackageStatus(testPackage, progress) === "draft",
  ).length;
  const filteredVerbs = useMemo(() => filterVerbs(verbs, query), [query]);
  const activeStudyPackage =
    studyPackages.find((item) => item.id === activeStudyPackageId) ??
    studyPackages[0];
  const activeTestPackage =
    testPackages.find((item) => item.id === activeTestPackageId) ??
    testPackages[0];
  const activeStudyVerbs = activeStudyPackage?.verbs ?? [];
  const materialVerbs = activeStudyVerbs.filter((verb) =>
    materialFilter === "all" ? true : verb.type === materialFilter,
  );
  const currentCard = activeStudyVerbs[cardIndex] ?? verbs[0];
  const submittedAttempt = activeTestPackage
    ? progress.submitted[activeTestPackage.id]
    : undefined;
  const activeDraft = activeTestPackage
    ? progress.drafts[activeTestPackage.id]
    : undefined;
  const activeAnswers = submittedAttempt?.answers ?? activeDraft?.answers ?? {};
  const activeScore =
    submittedAttempt && activeTestPackage
      ? submittedAttempt.score
      : activeTestPackage
        ? scoreQuestions(activeTestPackage.questions, activeAnswers)
        : 0;

  const studyRailItems: RailItem[] = studyPackages.map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: `${getTypeLabel(item.type)} | ${item.verbs.length} verb`,
    order: item.order,
    status: getStudyPackageStatus(item, progress),
  }));

  const testRailItems: RailItem[] = testPackages.map((item, index) => ({
    id: item.id,
    title: item.title,
    subtitle: `${getTypeLabel(item.type)} | ${item.questions.length} soal`,
    order: index + 1,
    status: getTestPackageStatus(item, progress),
  }));

  function navigateTo(view: View) {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectStudyPackage(packageId: string) {
    setActiveStudyPackageId(packageId);
    setCardIndex(0);
    setIsFlipped(false);
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
    if (!currentCard) {
      return;
    }

    if (!isFlipped) {
      markCardViewed(currentCard.id);
    }

    setIsFlipped((current) => !current);
  }

  function moveCard(direction: -1 | 1) {
    setIsFlipped(false);
    setCardIndex(
      (current) =>
        (current + direction + activeStudyVerbs.length) % activeStudyVerbs.length,
    );
  }

  function selectAnswer(questionId: string, optionKey: OptionKey) {
    if (!activeTestPackage || submittedAttempt) {
      return;
    }

    setProgress((current) => {
      const existing = current.drafts[activeTestPackage.id]?.answers ?? {};
      const nextAnswers = { ...existing };

      if (nextAnswers[questionId] === optionKey) {
        delete nextAnswers[questionId];
      } else {
        nextAnswers[questionId] = optionKey;
      }

      return {
        ...current,
        drafts: {
          ...current.drafts,
          [activeTestPackage.id]: {
            answers: nextAnswers,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  }

  function submitTest() {
    if (!activeTestPackage || submittedAttempt) {
      return;
    }

    const score = scoreQuestions(activeTestPackage.questions, activeAnswers);
    const now = new Date().toISOString();

    setProgress((current) => ({
      ...current,
      submitted: {
        ...current.submitted,
        [activeTestPackage.id]: {
          answers: activeAnswers,
          score,
          updatedAt: current.drafts[activeTestPackage.id]?.updatedAt ?? now,
          submittedAt: now,
        },
      },
    }));
  }

  function resetDemoProgress() {
    setProgress(emptyProgress);
    saveStoredProgress(emptyProgress);
  }

  return (
    <main className="app-shell">
      <aside className={`app-sidebar ${sidebarCollapsed ? "is-collapsed" : ""}`}>
        <div className="sidebar-head">
          <div className="brand-block">
            <div className="brand-logo-block">
              <Image
                alt="Persiapantubel"
                height={54}
                priority
                src="/persiapantubel-logo.png"
                width={176}
              />
            </div>
            <span className="brand-kicker">TBI Learning</span>
            <strong>Verb Forms</strong>
          </div>
          <button
            aria-expanded={!sidebarCollapsed}
            aria-label={
              sidebarCollapsed ? "Buka sidebar utama" : "Tutup sidebar utama"
            }
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed((current) => !current)}
            type="button"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={19} />
            ) : (
              <PanelLeftClose size={19} />
            )}
          </button>
        </div>

        <nav aria-label="Navigasi utama">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                aria-label={item.label}
                aria-current={activeView === item.id ? "page" : undefined}
                className={activeView === item.id ? "active" : ""}
                key={item.id}
                onClick={() => navigateTo(item.id)}
                type="button"
              >
                <Icon aria-hidden="true" size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="main-content">
        {activeView === "dashboard" && (
          <section className="view-stack" aria-labelledby="dashboard-title">
            <div className="dashboard-hero">
              <div className="dashboard-copy">
                <span className="eyebrow">Persiapantubel</span>
                <h1 id="dashboard-title">TBI - Regular and Irregular Verb</h1>
                <p>
                  Cockpit belajar untuk menguasai Verb-1, Verb-2, Verb-3, dan
                  arti bahasa Indonesia melalui Materi, Flipcard, dan Tes.
                </p>
              </div>
              <div className="hero-mark">
                <small>Verb Bank</small>
                <span>{verbs.length}</span>
              </div>
            </div>

            <div className="stat-grid">
              <StatCard
                detail={`${regularCount} regular, ${irregularCount} irregular`}
                label="Konten aktif"
                value={`${verbs.length}`}
              />
              <StatCard
                detail={`${percentage(viewedCount, verbs.length)}% dari bank sample`}
                label="Flipcard dilihat"
                value={`${viewedCount}/${verbs.length}`}
              />
              <StatCard
                detail={`${draftCount} draft tersimpan lokal`}
                label="Tes submitted"
                value={`${submittedCount}/${testPackages.length}`}
              />
            </div>

            <section className="panel progress-panel" aria-labelledby="progress-title">
              <div>
                <span className="eyebrow">Progress</span>
                <h2 id="progress-title">Status belajar</h2>
              </div>
              <ProgressBar label="Flipcard viewed" total={verbs.length} value={viewedCount} />
              <ProgressBar
                label="Tes submitted"
                total={testPackages.length}
                value={submittedCount}
              />
              <ProgressBar
                label="Draft tes"
                total={testPackages.length}
                value={draftCount}
              />
            </section>

            <div className="action-stack">
              <button className="action-row" onClick={() => navigateTo("materi")} type="button">
                <span>
                  <span className="eyebrow">Next</span>
                  <strong>Buka materi paket pertama</strong>
                </span>
                <ChevronRight aria-hidden="true" />
              </button>
              <button className="action-row" onClick={() => navigateTo("tes")} type="button">
                <span>
                  <span className="eyebrow">Assessment</span>
                  <strong>Lanjutkan tes bentuk verb</strong>
                </span>
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
          </section>
        )}

        {activeView === "search" && (
          <section className="view-stack" aria-labelledby="search-title">
            <div className="section-header">
              <div>
                <span className="eyebrow">Pencarian</span>
                <h2 id="search-title">Daftar Verb</h2>
              </div>
              <label className="search-box">
                <Search aria-hidden="true" size={18} />
                <span className="sr-only">Cari verb</span>
                <input
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari Verb-1, Verb-2, Verb-3, arti, pola..."
                  type="search"
                  value={query}
                />
              </label>
            </div>

            <div aria-live="polite" className="search-result-meta">
              <span>{filteredVerbs.length}</span>
              <p>hasil dari {verbs.length} verb aktif</p>
            </div>

            <div className="search-result-list">
              {filteredVerbs.map((verb) => (
                <article className="search-result-row" key={verb.id}>
                  <div>
                    <span className="badge badge-teal">{getTypeLabel(verb.type)}</span>
                    <h3>{verb.verb1}</h3>
                    <p>
                      {verb.verb1} - {verb.verb2} - {verb.verb3} | {verb.meaning}
                    </p>
                  </div>
                  <span className="badge">{verb.pattern}</span>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeView === "materi" && activeStudyPackage && (
          <section className="view-stack" aria-labelledby="materi-title">
            <div className="section-header">
              <div>
                <span className="eyebrow">Materi</span>
                <h2 id="materi-title">Belajar bentuk verb</h2>
              </div>
              <div className="segmented" aria-label="Filter tipe verb">
                {(["all", "regular", "irregular"] as const).map((filter) => (
                  <button
                    aria-pressed={materialFilter === filter}
                    className={materialFilter === filter ? "active" : ""}
                    key={filter}
                    onClick={() => setMaterialFilter(filter)}
                    type="button"
                  >
                    {filter === "all" ? "Semua" : getTypeLabel(filter)}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`learning-layout ${railCollapsed ? "package-collapsed" : ""}`}
            >
              <PackageRail
                activeId={activeStudyPackageId}
                collapsed={railCollapsed}
                items={studyRailItems}
                onSelect={selectStudyPackage}
                onToggleCollapsed={() => setRailCollapsed((current) => !current)}
                title="Materi"
              />

              <div className="content-stack">
                <article className="panel package-summary">
                  <span className="eyebrow">{getTypeLabel(activeStudyPackage.type)}</span>
                  <h3>{activeStudyPackage.title}</h3>
                  <p>{activeStudyPackage.description}</p>
                </article>

                <div className="verb-list">
                  {materialVerbs.map((verb) => (
                    <VerbRow key={verb.id} verb={verb} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeView === "flipcard" && activeStudyPackage && currentCard && (
          <section className="view-stack" aria-labelledby="flipcard-title">
            <div className="section-header">
              <div>
                <span className="eyebrow">Flipcard</span>
                <h2 id="flipcard-title">Active recall</h2>
              </div>
              <span className="badge">
                {cardIndex + 1}/{activeStudyVerbs.length}
              </span>
            </div>

            <div
              className={`learning-layout ${railCollapsed ? "package-collapsed" : ""}`}
            >
              <PackageRail
                activeId={activeStudyPackageId}
                collapsed={railCollapsed}
                items={studyRailItems}
                onSelect={selectStudyPackage}
                onToggleCollapsed={() => setRailCollapsed((current) => !current)}
                title="Flipcard"
              />

              <div className="content-stack">
                <button
                  aria-expanded={isFlipped}
                  className={`flipcard ${isFlipped ? "is-flipped" : ""}`}
                  onClick={flipCard}
                  type="button"
                >
                  <span className="flip-face flip-front">
                    <span className="badge">{currentCard.difficulty}</span>
                    <strong>{currentCard.verb1}</strong>
                    <small>Tap untuk lihat bentuk lengkap</small>
                  </span>
                  <span className="flip-face flip-back">
                    <span>
                      <span className="badge badge-teal">{getTypeLabel(currentCard.type)}</span>
                      <strong>
                        {currentCard.verb1} - {currentCard.verb2} - {currentCard.verb3}
                      </strong>
                    </span>
                    <span>{currentCard.meaning}</span>
                    <small>
                      {currentCard.pattern}. {currentCard.commonMistake}
                    </small>
                  </span>
                </button>

                <div className="control-row">
                  <button
                    className="icon-button"
                    onClick={() => moveCard(-1)}
                    type="button"
                    aria-label="Flipcard sebelumnya"
                  >
                    <ChevronLeft aria-hidden="true" />
                  </button>
                  <button
                    className="primary-button"
                    onClick={flipCard}
                    type="button"
                  >
                    <RotateCcw aria-hidden="true" size={18} />
                    Reveal
                  </button>
                  <button
                    className="icon-button"
                    onClick={() => moveCard(1)}
                    type="button"
                    aria-label="Flipcard berikutnya"
                  >
                    <ChevronRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeView === "tes" && activeTestPackage && (
          <section className="view-stack" aria-labelledby="tes-title">
            <div className="section-header">
              <div>
                <span className="eyebrow">Tes</span>
                <h2 id="tes-title">Paket soal bentuk verb</h2>
              </div>
              {submittedAttempt ? (
                <span className="result-pill">
                  <Lock aria-hidden="true" size={16} />
                  {activeScore}/{activeTestPackage.questions.length}
                </span>
              ) : null}
            </div>

            <div
              className={`learning-layout ${railCollapsed ? "package-collapsed" : ""}`}
            >
              <PackageRail
                activeId={activeTestPackageId}
                collapsed={railCollapsed}
                items={testRailItems}
                onSelect={setActiveTestPackageId}
                onToggleCollapsed={() => setRailCollapsed((current) => !current)}
                title="Tes"
              />

              <TestPanel
                activeAnswers={activeAnswers}
                activeScore={activeScore}
                onSelectAnswer={selectAnswer}
                onSubmit={submitTest}
                submittedAttempt={submittedAttempt}
                testPackage={activeTestPackage}
              />
            </div>
          </section>
        )}

        {activeView === "superadmin" && (
          <section className="view-stack" aria-labelledby="admin-title">
            <div className="section-header">
              <div>
                <span className="eyebrow">SuperAdmin</span>
                <h2 id="admin-title">Operational summary</h2>
              </div>
              <button className="primary-button" onClick={resetDemoProgress} type="button">
                <RotateCcw aria-hidden="true" size={18} />
                Reset local MVP
              </button>
            </div>

            <div className="stat-grid">
              <StatCard
                detail="Sample kurasi awal"
                label="Verb aktif"
                value={`${verbs.length}`}
              />
              <StatCard
                detail="Paket materi/flipcard"
                label="Learning packages"
                value={`${studyPackages.length}`}
              />
              <StatCard
                detail="Draft, submit, lock"
                label="Test packages"
                value={`${testPackages.length}`}
              />
            </div>

            <article className="panel admin-note">
              <span className="eyebrow">Boundary</span>
              <h3>MVP ini memakai localStorage</h3>
              <p>
                SuperAdmin production tetap harus memakai auth, database, role check,
                attempt snapshot, dan audit log sebelum dipakai untuk progres siswa
                nyata.
              </p>
            </article>
          </section>
        )}
      </div>

      <button
        aria-label="Kembali ke atas"
        className={`scroll-top-button ${showScrollTop ? "is-visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        type="button"
      >
        <ChevronUp aria-hidden="true" />
      </button>
    </main>
  );
}

function VerbRow({ verb }: { verb: VerbItem }) {
  return (
    <article className="verb-row">
      <div>
        <span className="badge badge-teal">{getTypeLabel(verb.type)}</span>
        <h3>{verb.verb1}</h3>
        <p>{verb.note}</p>
      </div>
      <div className="verb-detail-grid">
        <div className="verb-detail">
          <span>Verb-2</span>
          <strong>{verb.verb2}</strong>
        </div>
        <div className="verb-detail">
          <span>Verb-3</span>
          <strong>{verb.verb3}</strong>
        </div>
        <div className="verb-detail">
          <span>Artinya</span>
          <strong>{verb.meaning}</strong>
        </div>
        <div className="verb-detail">
          <span>Pattern</span>
          <strong>{verb.pattern}</strong>
        </div>
      </div>
      <p className="usage-note">{verb.commonMistake}</p>
    </article>
  );
}

function TestPanel({
  activeAnswers,
  activeScore,
  onSelectAnswer,
  onSubmit,
  submittedAttempt,
  testPackage,
}: {
  activeAnswers: Partial<Record<string, OptionKey>>;
  activeScore: number;
  onSelectAnswer: (questionId: string, optionKey: OptionKey) => void;
  onSubmit: () => void;
  submittedAttempt: SubmittedAttempt | undefined;
  testPackage: TestPackage;
}) {
  const answered = testPackage.questions.filter(
    (question) => activeAnswers[question.id],
  );
  const unanswered = testPackage.questions.filter(
    (question) => !activeAnswers[question.id],
  );

  return (
    <div className="content-stack">
      <article className="panel package-summary">
        <span className="eyebrow">{getTypeLabel(testPackage.type)}</span>
        <h3>{testPackage.title}</h3>
        <p>{testPackage.description}</p>
        {testPackage.coverage ? (
          <small>
            Coverage: {testPackage.coverage.verbCount}/{testPackage.coverage.bankSize} verb
            bank | {testPackage.coverage.regularCount} regular,{" "}
            {testPackage.coverage.irregularCount} irregular
          </small>
        ) : null}
        {submittedAttempt ? (
          <small>Submitted: {formatDate(submittedAttempt.submittedAt)}</small>
        ) : null}
      </article>

      <div className="test-navigator">
        <div className="answer-progress-summary">
          <div className="answer-stats">
            <div>
              <span>Total</span>
              <strong>{testPackage.questions.length}</strong>
            </div>
            <div>
              <span>Terjawab</span>
              <strong>{answered.length}</strong>
            </div>
            <div>
              <span>Kosong</span>
              <strong>{unanswered.length}</strong>
            </div>
            <div className="answer-submit-slot">
              <button
                className="primary-button"
                disabled={Boolean(submittedAttempt)}
                onClick={onSubmit}
                type="button"
              >
                {submittedAttempt ? (
                  <>
                    <Lock aria-hidden="true" size={16} />
                    Locked
                  </>
                ) : (
                  <>
                    <CheckCircle2 aria-hidden="true" size={16} />
                    Submit final
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="answer-number-grid">
            <AnswerNumberGroup label="Terjawab" questions={answered} type="done" />
            <AnswerNumberGroup
              label="Belum dijawab"
              questions={unanswered}
              type="pending"
            />
          </div>
        </div>
      </div>

      <div className="test-surface">
        {submittedAttempt ? (
          <p className="result-pill">
            Skor: {activeScore}/{testPackage.questions.length}
          </p>
        ) : null}

        <div className="question-stack">
          {testPackage.questions.map((question, index) => {
            const selected = activeAnswers[question.id];
            const correct = selected === question.correctKey;
            const questionVerb = getVerbById(question.verbId);

            return (
              <article
                className="question-block"
                id={`question-${question.id}`}
                key={question.id}
              >
                <div className="question-title">
                  <span>{index + 1}</span>
                  <div>
                    <h3>{question.prompt}</h3>
                    {questionVerb ? (
                      <small>
                        Fokus: {questionVerb.pattern} | {questionVerb.difficulty}
                      </small>
                    ) : null}
                  </div>
                </div>

                <div className="option-grid">
                  {question.options.map((option) => {
                    const isSelected = selected === option.key;
                    const isCorrectOption = option.key === question.correctKey;
                    const submittedClass = submittedAttempt
                      ? isCorrectOption
                        ? "correct"
                        : isSelected && !correct
                          ? "wrong"
                          : ""
                      : "";

                    return (
                      <button
                        aria-pressed={isSelected}
                        className={`option-button ${
                          isSelected && !submittedAttempt ? "selected" : ""
                        } ${submittedClass}`}
                        disabled={Boolean(submittedAttempt)}
                        key={option.key}
                        onClick={() => onSelectAnswer(question.id, option.key)}
                        type="button"
                      >
                        <span>{option.key}</span>
                        {option.text}
                      </button>
                    );
                  })}
                </div>

                {submittedAttempt ? (
                  <div className="explanation">
                    <strong>
                      Jawaban benar: {question.correctKey}.{" "}
                      {correct ? "Benar." : "Perlu review."}
                    </strong>
                    <p>{question.explanation}</p>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AnswerNumberGroup({
  label,
  questions,
  type,
}: {
  label: string;
  questions: QuizQuestion[];
  type: "done" | "pending";
}) {
  return (
    <div className="answer-number-group">
      <span>{label}</span>
      <div>
        {questions.length === 0 ? (
          <small>-</small>
        ) : (
          questions.map((question) => (
            <a
              className={`answer-number ${type}`}
              href={`#question-${question.id}`}
              key={question.id}
            >
              {question.id.split("-").at(-1)?.slice(0, 2).toUpperCase() ?? "Q"}
            </a>
          ))
        )}
      </div>
    </div>
  );
}
