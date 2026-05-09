import {
  additionalIrregularVerbs,
  additionalRegularVerbs,
} from "./additional-verbs";

export type VerbType = "regular" | "irregular";
export type VerbTier = "Core" | "Exam-support" | "Extended";
export type Difficulty = "Basic" | "Medium" | "Advanced";
export type OptionKey = "A" | "B" | "C" | "D";

export type VerbItem = {
  id: string;
  type: VerbType;
  verb1: string;
  verb2: string;
  verb3: string;
  meaning: string;
  pattern: string;
  tier: VerbTier;
  difficulty: Difficulty;
  note: string;
  commonMistake: string;
};

export type QuizOption = {
  key: OptionKey;
  text: string;
};

export type QuizQuestion = {
  id: string;
  verbId: string;
  prompt: string;
  options: QuizOption[];
  correctKey: OptionKey;
  explanation: string;
};

export type TestPackage = {
  id: string;
  title: string;
  type: "regular" | "irregular" | "mixed";
  description: string;
  coverage?: {
    bankSize: number;
    coveredVerbIds: string[];
    irregularCount: number;
    regularCount: number;
    verbCount: number;
  };
  questions: QuizQuestion[];
};

export type TestCoverageSummary = {
  coveredVerbCount: number;
  duplicateVerbIds: string[];
  irregularCovered: number;
  packageCount: number;
  questionCount: number;
  regularCovered: number;
  totalBankVerbs: number;
  uncoveredVerbIds: string[];
};

const EXPECTED_VERB_TOTAL = 600;
const EXPECTED_REGULAR_TOTAL = 300;
const EXPECTED_IRREGULAR_TOTAL = 300;
const OPTION_KEYS: OptionKey[] = ["A", "B", "C", "D"];
const TEST_PACKAGE_SIZE = 10;

const baseVerbs: VerbItem[] = [
  {
    id: "reg-accept",
    type: "regular",
    verb1: "accept",
    verb2: "accepted",
    verb3: "accepted",
    meaning: "menerima",
    pattern: "add -ed",
    tier: "Core",
    difficulty: "Basic",
    note: "Sering dipakai dalam konteks agreement, offer, dan application.",
    commonMistake: "Jangan menulis acceptted karena huruf t tidak digandakan.",
  },
  {
    id: "reg-achieve",
    type: "regular",
    verb1: "achieve",
    verb2: "achieved",
    verb3: "achieved",
    meaning: "mencapai",
    pattern: "add -d after final -e",
    tier: "Exam-support",
    difficulty: "Medium",
    note: "Relevan untuk teks akademik tentang target dan outcomes.",
    commonMistake: "Jangan menulis achieveed; cukup tambah -d.",
  },
  {
    id: "reg-analyze",
    type: "regular",
    verb1: "analyze",
    verb2: "analyzed",
    verb3: "analyzed",
    meaning: "menganalisis",
    pattern: "add -d after final -e",
    tier: "Exam-support",
    difficulty: "Medium",
    note: "Bentuk British spelling dapat memakai analyse/analyzed atau analysed sesuai varian.",
    commonMistake: "Konsisten dengan spelling yang dipilih dalam satu jawaban.",
  },
  {
    id: "reg-apply",
    type: "regular",
    verb1: "apply",
    verb2: "applied",
    verb3: "applied",
    meaning: "menerapkan",
    pattern: "consonant + y -> ied",
    tier: "Core",
    difficulty: "Medium",
    note: "Sering muncul dalam instruksi, pekerjaan, dan academic writing.",
    commonMistake: "Jangan menulis applyed.",
  },
  {
    id: "reg-compare",
    type: "regular",
    verb1: "compare",
    verb2: "compared",
    verb3: "compared",
    meaning: "membandingkan",
    pattern: "add -d after final -e",
    tier: "Core",
    difficulty: "Basic",
    note: "Umum dalam soal reading dan writing task.",
    commonMistake: "Jangan menambahkan -ed penuh menjadi compareed.",
  },
  {
    id: "reg-complete",
    type: "regular",
    verb1: "complete",
    verb2: "completed",
    verb3: "completed",
    meaning: "menyelesaikan",
    pattern: "add -d after final -e",
    tier: "Core",
    difficulty: "Basic",
    note: "Dipakai untuk tugas, formulir, proyek, dan proses.",
    commonMistake: "Completed adalah Verb-2 sekaligus Verb-3.",
  },
  {
    id: "reg-develop",
    type: "regular",
    verb1: "develop",
    verb2: "developed",
    verb3: "developed",
    meaning: "mengembangkan",
    pattern: "add -ed",
    tier: "Exam-support",
    difficulty: "Medium",
    note: "Sering muncul pada teks ekonomi, pendidikan, dan teknologi.",
    commonMistake: "Jangan menulis developped dalam American English.",
  },
  {
    id: "reg-identify",
    type: "regular",
    verb1: "identify",
    verb2: "identified",
    verb3: "identified",
    meaning: "mengidentifikasi",
    pattern: "consonant + y -> ied",
    tier: "Exam-support",
    difficulty: "Medium",
    note: "Kata kerja penting untuk analisis soal dan laporan.",
    commonMistake: "Jangan menulis identifyed.",
  },
  {
    id: "reg-improve",
    type: "regular",
    verb1: "improve",
    verb2: "improved",
    verb3: "improved",
    meaning: "meningkatkan",
    pattern: "add -d after final -e",
    tier: "Core",
    difficulty: "Basic",
    note: "Sangat umum dalam konteks performance dan learning progress.",
    commonMistake: "Improved adalah Verb-2 dan Verb-3.",
  },
  {
    id: "reg-include",
    type: "regular",
    verb1: "include",
    verb2: "included",
    verb3: "included",
    meaning: "mencakup",
    pattern: "add -d after final -e",
    tier: "Core",
    difficulty: "Basic",
    note: "Umum dalam deskripsi daftar, fitur, dan cakupan.",
    commonMistake: "Jangan menulis includded.",
  },
  {
    id: "reg-manage",
    type: "regular",
    verb1: "manage",
    verb2: "managed",
    verb3: "managed",
    meaning: "mengelola",
    pattern: "add -d after final -e",
    tier: "Exam-support",
    difficulty: "Medium",
    note: "Relevan untuk workplace English dan teks organisasi.",
    commonMistake: "Jangan menulis manageed.",
  },
  {
    id: "reg-observe",
    type: "regular",
    verb1: "observe",
    verb2: "observed",
    verb3: "observed",
    meaning: "mengamati",
    pattern: "add -d after final -e",
    tier: "Exam-support",
    difficulty: "Medium",
    note: "Sering dipakai pada teks ilmiah dan laporan.",
    commonMistake: "Observed tidak memakai double v.",
  },
  {
    id: "reg-organize",
    type: "regular",
    verb1: "organize",
    verb2: "organized",
    verb3: "organized",
    meaning: "mengatur",
    pattern: "add -d after final -e",
    tier: "Exam-support",
    difficulty: "Medium",
    note: "British spelling dapat memakai organise/organised.",
    commonMistake: "Jangan mencampur organize dengan organised dalam satu set jawaban.",
  },
  {
    id: "reg-plan",
    type: "regular",
    verb1: "plan",
    verb2: "planned",
    verb3: "planned",
    meaning: "merencanakan",
    pattern: "double final consonant + ed",
    tier: "Core",
    difficulty: "Medium",
    note: "Huruf n digandakan karena pola CVC pada kata satu suku kata.",
    commonMistake: "Jangan menulis planed.",
  },
  {
    id: "reg-prefer",
    type: "regular",
    verb1: "prefer",
    verb2: "preferred",
    verb3: "preferred",
    meaning: "lebih memilih",
    pattern: "double final consonant + ed",
    tier: "Core",
    difficulty: "Medium",
    note: "Tekanan suku kata akhir membuat r digandakan.",
    commonMistake: "Jangan menulis prefered.",
  },
  {
    id: "reg-provide",
    type: "regular",
    verb1: "provide",
    verb2: "provided",
    verb3: "provided",
    meaning: "menyediakan",
    pattern: "add -d after final -e",
    tier: "Core",
    difficulty: "Basic",
    note: "Sangat umum pada reading passage dan instruction.",
    commonMistake: "Provided adalah Verb-2 dan Verb-3.",
  },
  {
    id: "reg-receive",
    type: "regular",
    verb1: "receive",
    verb2: "received",
    verb3: "received",
    meaning: "menerima",
    pattern: "add -d after final -e",
    tier: "Core",
    difficulty: "Medium",
    note: "Perhatikan e sebelum i dalam spelling receive.",
    commonMistake: "Jangan menulis recieved.",
  },
  {
    id: "reg-refer",
    type: "regular",
    verb1: "refer",
    verb2: "referred",
    verb3: "referred",
    meaning: "merujuk",
    pattern: "double final consonant + ed",
    tier: "Exam-support",
    difficulty: "Advanced",
    note: "Sering muncul dalam academic reference dan instruction.",
    commonMistake: "Jangan menulis refered.",
  },
  {
    id: "reg-require",
    type: "regular",
    verb1: "require",
    verb2: "required",
    verb3: "required",
    meaning: "memerlukan",
    pattern: "add -d after final -e",
    tier: "Core",
    difficulty: "Basic",
    note: "Umum pada aturan, requirement, dan pengumuman.",
    commonMistake: "Required adalah Verb-2 dan Verb-3.",
  },
  {
    id: "reg-study",
    type: "regular",
    verb1: "study",
    verb2: "studied",
    verb3: "studied",
    meaning: "belajar",
    pattern: "consonant + y -> ied",
    tier: "Core",
    difficulty: "Basic",
    note: "Verb yang sering dipakai dalam konteks pendidikan.",
    commonMistake: "Jangan menulis studyed.",
  },
  {
    id: "irr-become",
    type: "irregular",
    verb1: "become",
    verb2: "became",
    verb3: "become",
    meaning: "menjadi",
    pattern: "V1 and V3 same",
    tier: "Core",
    difficulty: "Medium",
    note: "Sering dipakai untuk perubahan kondisi.",
    commonMistake: "Jangan menulis becomed.",
  },
  {
    id: "irr-begin",
    type: "irregular",
    verb1: "begin",
    verb2: "began",
    verb3: "begun",
    meaning: "memulai",
    pattern: "i-a-u vowel change",
    tier: "Core",
    difficulty: "Medium",
    note: "Umum dalam narasi dan instruksi proses.",
    commonMistake: "Jangan membalik began dan begun.",
  },
  {
    id: "irr-break",
    type: "irregular",
    verb1: "break",
    verb2: "broke",
    verb3: "broken",
    meaning: "memecahkan",
    pattern: "vowel change + -en participle",
    tier: "Core",
    difficulty: "Medium",
    note: "Bisa bermakna merusak, melanggar, atau jeda tergantung konteks.",
    commonMistake: "Jangan menulis breaked.",
  },
  {
    id: "irr-bring",
    type: "irregular",
    verb1: "bring",
    verb2: "brought",
    verb3: "brought",
    meaning: "membawa",
    pattern: "ought pattern",
    tier: "Core",
    difficulty: "Medium",
    note: "Relevan untuk instruksi dan kegiatan sehari-hari.",
    commonMistake: "Jangan menulis brang atau bringed.",
  },
  {
    id: "irr-build",
    type: "irregular",
    verb1: "build",
    verb2: "built",
    verb3: "built",
    meaning: "membangun",
    pattern: "d -> t ending",
    tier: "Exam-support",
    difficulty: "Medium",
    note: "Sering muncul pada teks pembangunan, sistem, dan proses.",
    commonMistake: "Jangan menulis builded.",
  },
  {
    id: "irr-choose",
    type: "irregular",
    verb1: "choose",
    verb2: "chose",
    verb3: "chosen",
    meaning: "memilih",
    pattern: "oo-o-osen pattern",
    tier: "Core",
    difficulty: "Medium",
    note: "Perhatikan perbedaan choose dan chose.",
    commonMistake: "Jangan menulis choosed.",
  },
  {
    id: "irr-come",
    type: "irregular",
    verb1: "come",
    verb2: "came",
    verb3: "come",
    meaning: "datang",
    pattern: "V1 and V3 same",
    tier: "Core",
    difficulty: "Basic",
    note: "Salah satu verb paling umum dalam teks dan percakapan.",
    commonMistake: "Jangan menulis comed.",
  },
  {
    id: "irr-drive",
    type: "irregular",
    verb1: "drive",
    verb2: "drove",
    verb3: "driven",
    meaning: "mengemudi",
    pattern: "i-o-iven pattern",
    tier: "Core",
    difficulty: "Medium",
    note: "Juga dapat berarti mendorong suatu perubahan.",
    commonMistake: "Jangan menulis drived.",
  },
  {
    id: "irr-eat",
    type: "irregular",
    verb1: "eat",
    verb2: "ate",
    verb3: "eaten",
    meaning: "makan",
    pattern: "vowel change + -en participle",
    tier: "Core",
    difficulty: "Basic",
    note: "Umum dalam daily English.",
    commonMistake: "Jangan memakai eaten sebagai Verb-2.",
  },
  {
    id: "irr-find",
    type: "irregular",
    verb1: "find",
    verb2: "found",
    verb3: "found",
    meaning: "menemukan",
    pattern: "i-ou vowel change",
    tier: "Core",
    difficulty: "Basic",
    note: "Sering muncul di reading question dan laporan.",
    commonMistake: "Jangan menulis finded.",
  },
  {
    id: "irr-give",
    type: "irregular",
    verb1: "give",
    verb2: "gave",
    verb3: "given",
    meaning: "memberi",
    pattern: "i-a-iven pattern",
    tier: "Core",
    difficulty: "Basic",
    note: "Umum dalam instruksi, contoh, dan passive voice.",
    commonMistake: "Jangan membalik gave dan given.",
  },
  {
    id: "irr-go",
    type: "irregular",
    verb1: "go",
    verb2: "went",
    verb3: "gone",
    meaning: "pergi",
    pattern: "suppletive past form",
    tier: "Core",
    difficulty: "Basic",
    note: "Verb-2 go tidak mirip dengan Verb-1.",
    commonMistake: "Jangan menulis goed atau wented.",
  },
  {
    id: "irr-know",
    type: "irregular",
    verb1: "know",
    verb2: "knew",
    verb3: "known",
    meaning: "mengetahui",
    pattern: "ew-own participle",
    tier: "Core",
    difficulty: "Medium",
    note: "Sering muncul dalam knowledge dan evidence contexts.",
    commonMistake: "Jangan menulis knowed.",
  },
  {
    id: "irr-lead",
    type: "irregular",
    verb1: "lead",
    verb2: "led",
    verb3: "led",
    meaning: "memimpin",
    pattern: "vowel sound change",
    tier: "Exam-support",
    difficulty: "Advanced",
    note: "Lead sebagai verb berbeda pengucapan dari lead sebagai noun logam.",
    commonMistake: "Jangan menulis leaded untuk makna memimpin.",
  },
  {
    id: "irr-make",
    type: "irregular",
    verb1: "make",
    verb2: "made",
    verb3: "made",
    meaning: "membuat",
    pattern: "ake -> ade",
    tier: "Core",
    difficulty: "Basic",
    note: "Sangat umum pada collocation akademik dan kerja.",
    commonMistake: "Jangan menulis maked.",
  },
  {
    id: "irr-read",
    type: "irregular",
    verb1: "read",
    verb2: "read",
    verb3: "read",
    meaning: "membaca",
    pattern: "same spelling, different past pronunciation",
    tier: "Core",
    difficulty: "Medium",
    note: "Spelling sama, tetapi pronunciation past berbeda.",
    commonMistake: "Jangan menulis readed.",
  },
  {
    id: "irr-see",
    type: "irregular",
    verb1: "see",
    verb2: "saw",
    verb3: "seen",
    meaning: "melihat",
    pattern: "ee-aw-een pattern",
    tier: "Core",
    difficulty: "Basic",
    note: "Sering muncul dalam observation dan narrative.",
    commonMistake: "Jangan memakai seen sebagai Verb-2.",
  },
  {
    id: "irr-speak",
    type: "irregular",
    verb1: "speak",
    verb2: "spoke",
    verb3: "spoken",
    meaning: "berbicara",
    pattern: "ea-o-oken pattern",
    tier: "Core",
    difficulty: "Medium",
    note: "Umum untuk komunikasi dan language contexts.",
    commonMistake: "Jangan menulis speaked.",
  },
  {
    id: "irr-take",
    type: "irregular",
    verb1: "take",
    verb2: "took",
    verb3: "taken",
    meaning: "mengambil",
    pattern: "ake-ook-aken pattern",
    tier: "Core",
    difficulty: "Basic",
    note: "Banyak collocation: take notes, take a test, take time.",
    commonMistake: "Jangan menulis taked.",
  },
  {
    id: "irr-write",
    type: "irregular",
    verb1: "write",
    verb2: "wrote",
    verb3: "written",
    meaning: "menulis",
    pattern: "i-o-itten pattern",
    tier: "Core",
    difficulty: "Medium",
    note: "Relevan untuk academic tasks dan laporan.",
    commonMistake: "Jangan menulis writed.",
  },
];

export const verbs: VerbItem[] = [
  ...baseVerbs,
  ...additionalRegularVerbs,
  ...additionalIrregularVerbs,
];

const option = (key: OptionKey, text: string): QuizOption => ({ key, text });

function answerText(verb: VerbItem, meaning = verb.meaning) {
  return `${verb.verb1} - ${verb.verb2} - ${verb.verb3} - ${meaning}`;
}

function getMeaningDistractor(verb: VerbItem, questionIndex: number) {
  for (let offset = 7; offset < verbs.length; offset += 7) {
    const candidate = verbs[(questionIndex + offset) % verbs.length];

    if (candidate.id !== verb.id && candidate.meaning !== verb.meaning) {
      return candidate.meaning;
    }
  }

  return "arti lain";
}

function getFormDistractors(verb: VerbItem, questionIndex: number) {
  const base = verb.verb1;
  const inventedPast = `${base}en`;
  const inventedProgressive = `${base}ing`;
  const wrongMeaning = getMeaningDistractor(verb, questionIndex);

  const candidates =
    verb.type === "regular"
      ? [
          `${base} - ${inventedPast} - ${inventedPast} - ${verb.meaning}`,
          `${base} - ${verb.verb2} - ${inventedPast} - ${verb.meaning}`,
          answerText(verb, wrongMeaning),
          `${base} - ${inventedProgressive} - ${verb.verb2} - ${verb.meaning}`,
          `${base} - ${verb.verb3} - ${verb.verb2} - ${verb.meaning}`,
        ]
      : [
          `${base} - ${inventedPast} - ${inventedPast} - ${verb.meaning}`,
          `${base} - ${verb.verb3} - ${verb.verb2} - ${verb.meaning}`,
          answerText(verb, wrongMeaning),
          `${base} - ${verb.verb2} - ${inventedPast} - ${verb.meaning}`,
          `${base} - ${inventedProgressive} - ${verb.verb3} - ${verb.meaning}`,
        ];

  return candidates.filter((candidate, index) => {
    const correct = answerText(verb);
    return candidate !== correct && candidates.indexOf(candidate) === index;
  });
}

function createCoverageQuestion(verb: VerbItem, questionIndex: number): QuizQuestion {
  const correctKey = OPTION_KEYS[questionIndex % OPTION_KEYS.length];
  const correctAnswer = answerText(verb);
  const distractors = getFormDistractors(verb, questionIndex).slice(0, 3);

  if (distractors.length !== 3) {
    throw new Error(`Unable to build three distractors for ${verb.id}.`);
  }

  let distractorIndex = 0;
  const options = OPTION_KEYS.map((key) => {
    if (key === correctKey) {
      return option(key, correctAnswer);
    }

    const distractor = distractors[distractorIndex];
    distractorIndex += 1;
    return option(key, distractor);
  });

  return {
    id: `q-bank-${verb.id}`,
    verbId: verb.id,
    prompt: `Tentukan kelengkapan dari verb berikut: "${verb.verb1}".`,
    options,
    correctKey,
    explanation: `"${verb.verb1}" adalah ${verb.type} verb dengan pola ${verb.pattern}. Bentuk lengkap yang benar adalah "${verb.verb1} - ${verb.verb2} - ${verb.verb3}" dan artinya "${verb.meaning}". Pilihan lain salah karena memakai bentuk tidak baku, menukar bentuk, atau memasangkan arti yang tidak sesuai.`,
  };
}

function chunkItems<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function interleaveByType(regularItems: VerbItem[], irregularItems: VerbItem[]) {
  const ordered: VerbItem[] = [];
  const maxLength = Math.max(regularItems.length, irregularItems.length);

  for (let index = 0; index < maxLength; index += 1) {
    if (regularItems[index]) {
      ordered.push(regularItems[index]);
    }

    if (irregularItems[index]) {
      ordered.push(irregularItems[index]);
    }
  }

  return ordered;
}

const baseTestPackages: TestPackage[] = [
  {
    id: "verb-forms-set-01",
    title: "Verb Forms Set 01",
    type: "mixed",
    description: "Paket campuran agar siswa fokus pada bentuk lengkap, bukan label kategori.",
    questions: [
      {
        id: "q-go",
        verbId: "irr-go",
        prompt: 'Tentukan kelengkapan dari verb berikut: "go".',
        options: [
          option("A", "go - went - gone - makan"),
          option("B", "go - gone - went - makan"),
          option("C", "go - went - wented - pergi"),
          option("D", "go - went - gone - pergi"),
        ],
        correctKey: "D",
        explanation:
          '"Go" adalah irregular verb. Verb-2-nya adalah "went", Verb-3-nya adalah "gone", dan artinya "pergi". Pilihan lain salah karena arti keliru, urutan terbalik, atau memakai bentuk tidak baku.',
      },
      {
        id: "q-apply",
        verbId: "reg-apply",
        prompt: 'Tentukan kelengkapan dari verb berikut: "apply".',
        options: [
          option("A", "apply - applyed - applyed - menerapkan"),
          option("B", "apply - applied - applied - menerapkan"),
          option("C", "apply - applied - applyed - menerima"),
          option("D", "apply - applies - applied - menerapkan"),
        ],
        correctKey: "B",
        explanation:
          '"Apply" adalah regular verb dengan pola consonant + y menjadi -ied, sehingga bentuknya "apply - applied - applied" dan artinya "menerapkan".',
      },
      {
        id: "q-begin",
        verbId: "irr-begin",
        prompt: 'Tentukan kelengkapan dari verb berikut: "begin".',
        options: [
          option("A", "begin - began - begun - memulai"),
          option("B", "begin - begun - began - memulai"),
          option("C", "begin - beginned - beginned - memulai"),
          option("D", "begin - began - began - membangun"),
        ],
        correctKey: "A",
        explanation:
          '"Begin" mengikuti pola irregular i-a-u: "begin - began - begun". Artinya "memulai".',
      },
      {
        id: "q-plan",
        verbId: "reg-plan",
        prompt: 'Tentukan kelengkapan dari verb berikut: "plan".',
        options: [
          option("A", "plan - planed - planed - merencanakan"),
          option("B", "plan - planned - planned - merencanakan"),
          option("C", "plan - planned - planed - menerapkan"),
          option("D", "plan - planning - planned - merencanakan"),
        ],
        correctKey: "B",
        explanation:
          '"Plan" menggandakan huruf n sebelum -ed, sehingga bentuk yang benar adalah "plan - planned - planned".',
      },
      {
        id: "q-write",
        verbId: "irr-write",
        prompt: 'Tentukan kelengkapan dari verb berikut: "write".',
        options: [
          option("A", "write - writed - writed - menulis"),
          option("B", "write - written - wrote - menulis"),
          option("C", "write - wrote - written - menulis"),
          option("D", "write - wrote - written - membaca"),
        ],
        correctKey: "C",
        explanation:
          '"Write" adalah irregular verb: "write - wrote - written". Artinya "menulis".',
      },
      {
        id: "q-achieve",
        verbId: "reg-achieve",
        prompt: 'Tentukan kelengkapan dari verb berikut: "achieve".',
        options: [
          option("A", "achieve - achieved - achieved - mencapai"),
          option("B", "achieve - achieveed - achieveed - mencapai"),
          option("C", "achieve - achieved - achieveed - mengamati"),
          option("D", "achieve - achieven - achieved - mencapai"),
        ],
        correctKey: "A",
        explanation:
          '"Achieve" berakhir dengan -e, jadi cukup tambah -d: "achieved". Artinya "mencapai".',
      },
      {
        id: "q-choose",
        verbId: "irr-choose",
        prompt: 'Tentukan kelengkapan dari verb berikut: "choose".',
        options: [
          option("A", "choose - choosed - choosed - memilih"),
          option("B", "choose - chosen - chose - memilih"),
          option("C", "choose - chose - chosen - memilih"),
          option("D", "choose - chose - choose - menerima"),
        ],
        correctKey: "C",
        explanation:
          '"Choose" adalah irregular verb: "choose - chose - chosen". Artinya "memilih".',
      },
      {
        id: "q-receive",
        verbId: "reg-receive",
        prompt: 'Tentukan kelengkapan dari verb berikut: "receive".',
        options: [
          option("A", "receive - received - received - menerima"),
          option("B", "receive - recieved - recieved - menerima"),
          option("C", "receive - received - receive - menerima"),
          option("D", "receive - received - received - memberi"),
        ],
        correctKey: "A",
        explanation:
          '"Receive" adalah regular verb. Bentuk Verb-2 dan Verb-3 adalah "received"; perhatikan spelling "ei" setelah c.',
      },
      {
        id: "q-take",
        verbId: "irr-take",
        prompt: 'Tentukan kelengkapan dari verb berikut: "take".',
        options: [
          option("A", "take - taked - taked - mengambil"),
          option("B", "take - took - taken - mengambil"),
          option("C", "take - taken - took - mengambil"),
          option("D", "take - took - taken - berbicara"),
        ],
        correctKey: "B",
        explanation:
          '"Take" adalah irregular verb: "take - took - taken". Artinya "mengambil".',
      },
      {
        id: "q-study",
        verbId: "reg-study",
        prompt: 'Tentukan kelengkapan dari verb berikut: "study".',
        options: [
          option("A", "study - studyed - studyed - belajar"),
          option("B", "study - studied - studied - belajar"),
          option("C", "study - studied - studyed - belajar"),
          option("D", "study - studied - studied - berbicara"),
        ],
        correctKey: "B",
        explanation:
          '"Study" mengikuti pola consonant + y menjadi -ied, sehingga bentuknya "study - studied - studied".',
      },
    ],
  },
];

const baseTestVerbIds = new Set(
  baseTestPackages.flatMap((testPackage) =>
    testPackage.questions.map((question) => question.verbId),
  ),
);
const remainingRegularVerbs = verbs.filter(
  (verb) => verb.type === "regular" && !baseTestVerbIds.has(verb.id),
);
const remainingIrregularVerbs = verbs.filter(
  (verb) => verb.type === "irregular" && !baseTestVerbIds.has(verb.id),
);
const coveragePackageSize = TEST_PACKAGE_SIZE;
const coverageVerbOrder = interleaveByType(remainingRegularVerbs, remainingIrregularVerbs);
const coverageChunks = chunkItems(coverageVerbOrder, coveragePackageSize);

const coverageTestPackages: TestPackage[] = coverageChunks.map((packageVerbs, packageIndex) => {
  const packageNumber = baseTestPackages.length + packageIndex + 1;
  const regularCount = packageVerbs.filter((verb) => verb.type === "regular").length;
  const irregularCount = packageVerbs.filter((verb) => verb.type === "irregular").length;

  return {
    id: `verb-forms-set-${String(packageNumber).padStart(2, "0")}`,
    title: `Verb Forms Set ${String(packageNumber).padStart(2, "0")}`,
    type: "mixed",
    description:
      "Paket campuran untuk melacak coverage bank verb tanpa membocorkan kategori jawaban.",
    coverage: {
      bankSize: verbs.length,
      coveredVerbIds: packageVerbs.map((verb) => verb.id),
      irregularCount,
      regularCount,
      verbCount: packageVerbs.length,
    },
    questions: packageVerbs.map((verb, questionIndex) =>
      createCoverageQuestion(
        verb,
        packageIndex * coveragePackageSize + questionIndex,
      ),
    ),
  };
});

function withCoverageMetadata(testPackage: TestPackage): TestPackage {
  const packageVerbs = testPackage.questions
    .map((question) => verbs.find((verb) => verb.id === question.verbId))
    .filter((verb): verb is VerbItem => Boolean(verb));

  return {
    ...testPackage,
    coverage: {
      bankSize: verbs.length,
      coveredVerbIds: testPackage.questions.map((question) => question.verbId),
      irregularCount: packageVerbs.filter((verb) => verb.type === "irregular").length,
      regularCount: packageVerbs.filter((verb) => verb.type === "regular").length,
      verbCount: testPackage.questions.length,
    },
  };
}

export const testPackages: TestPackage[] = [
  ...baseTestPackages,
  ...coverageTestPackages,
].map(withCoverageMetadata);

function createTestCoverageSummary(
  packages: TestPackage[],
  bank: VerbItem[],
): TestCoverageSummary {
  const coveredVerbIds = packages.flatMap((testPackage) =>
    testPackage.questions.map((question) => question.verbId),
  );
  const seenVerbIds = new Set<string>();
  const duplicateVerbIds = new Set<string>();

  for (const verbId of coveredVerbIds) {
    if (seenVerbIds.has(verbId)) {
      duplicateVerbIds.add(verbId);
    }

    seenVerbIds.add(verbId);
  }

  const coveredVerbs = bank.filter((verb) => seenVerbIds.has(verb.id));

  return {
    coveredVerbCount: seenVerbIds.size,
    duplicateVerbIds: [...duplicateVerbIds],
    irregularCovered: coveredVerbs.filter((verb) => verb.type === "irregular").length,
    packageCount: packages.length,
    questionCount: coveredVerbIds.length,
    regularCovered: coveredVerbs.filter((verb) => verb.type === "regular").length,
    totalBankVerbs: bank.length,
    uncoveredVerbIds: bank
      .filter((verb) => !seenVerbIds.has(verb.id))
      .map((verb) => verb.id),
  };
}

export const testCoverage = createTestCoverageSummary(testPackages, verbs);

export const packageGroups = [
  {
    id: "regular-core",
    title: "Regular Core",
    type: "regular" as const,
    verbIds: verbs.filter((verb) => verb.type === "regular").map((verb) => verb.id),
  },
  {
    id: "irregular-core",
    title: "Irregular Core",
    type: "irregular" as const,
    verbIds: verbs.filter((verb) => verb.type === "irregular").map((verb) => verb.id),
  },
  {
    id: "mixed-test",
    title: "Mixed Verb Forms",
    type: "mixed" as const,
    verbIds: testPackages.flatMap((testPackage) =>
      testPackage.questions.map((question) => question.verbId),
    ),
  },
];

export function getVerbById(id: string) {
  return verbs.find((verb) => verb.id === id);
}

export function validateVerbContent() {
  const verbIds = new Set<string>();
  const verbForms = new Set<string>();
  const questionIds = new Set<string>();

  if (verbs.length !== EXPECTED_VERB_TOTAL) {
    throw new Error(
      `Expected ${EXPECTED_VERB_TOTAL} verbs, received ${verbs.length}.`,
    );
  }

  const regularTotal = verbs.filter((verb) => verb.type === "regular").length;
  const irregularTotal = verbs.filter((verb) => verb.type === "irregular").length;

  if (regularTotal !== EXPECTED_REGULAR_TOTAL) {
    throw new Error(
      `Expected ${EXPECTED_REGULAR_TOTAL} regular verbs, received ${regularTotal}.`,
    );
  }

  if (irregularTotal !== EXPECTED_IRREGULAR_TOTAL) {
    throw new Error(
      `Expected ${EXPECTED_IRREGULAR_TOTAL} irregular verbs, received ${irregularTotal}.`,
    );
  }

  for (const verb of verbs) {
    const fields = [
      verb.id,
      verb.verb1,
      verb.verb2,
      verb.verb3,
      verb.meaning,
      verb.pattern,
      verb.note,
      verb.commonMistake,
    ];

    if (fields.some((field) => !field.trim())) {
      throw new Error(`Verb ${verb.id || "(missing id)"} has an empty field.`);
    }

    if (verbIds.has(verb.id)) {
      throw new Error(`Duplicate verb id: ${verb.id}.`);
    }

    const formKey = verb.verb1.toLowerCase();

    if (verbForms.has(formKey)) {
      throw new Error(`Duplicate verb form: ${formKey}.`);
    }

    verbIds.add(verb.id);
    verbForms.add(formKey);
  }

  for (const testPackage of testPackages) {
    if (testPackage.type !== "mixed") {
      throw new Error(`${testPackage.id} must be a mixed package to avoid label leaks.`);
    }

    if (testPackage.questions.length !== TEST_PACKAGE_SIZE) {
      throw new Error(`${testPackage.id} must have exactly ${TEST_PACKAGE_SIZE} questions.`);
    }

    const packageRegularTotal = testPackage.questions.filter((question) => {
      const questionVerb = getVerbById(question.verbId);
      return questionVerb?.type === "regular";
    }).length;
    const packageIrregularTotal = testPackage.questions.filter((question) => {
      const questionVerb = getVerbById(question.verbId);
      return questionVerb?.type === "irregular";
    }).length;

    if (Math.abs(packageRegularTotal - packageIrregularTotal) > 1) {
      throw new Error(`${testPackage.id} must balance regular and irregular questions.`);
    }

    for (const question of testPackage.questions) {
      if (!verbIds.has(question.verbId)) {
        throw new Error(`${question.id} references missing verb ${question.verbId}.`);
      }

      if (questionIds.has(question.id)) {
        throw new Error(`Duplicate question id: ${question.id}.`);
      }

      questionIds.add(question.id);

      const optionKeys = question.options.map((optionItem) => optionItem.key);
      const optionTexts = question.options.map((optionItem) => optionItem.text);
      const questionVerb = getVerbById(question.verbId);

      if (question.options.length !== OPTION_KEYS.length) {
        throw new Error(`${question.id} must have exactly four options.`);
      }

      if (optionKeys.join("") !== OPTION_KEYS.join("")) {
        throw new Error(`${question.id} options must be ordered A-D.`);
      }

      if (!optionKeys.includes(question.correctKey)) {
        throw new Error(`${question.id} correct key is not in options.`);
      }

      if (new Set(optionTexts).size !== optionTexts.length) {
        throw new Error(`${question.id} must not contain duplicate option text.`);
      }

      const correctOption = question.options.find(
        (optionItem) => optionItem.key === question.correctKey,
      );

      if (!questionVerb || correctOption?.text !== answerText(questionVerb)) {
        throw new Error(`${question.id} correct option must match the referenced verb.`);
      }

      const correctTextCount = optionTexts.filter(
        (optionText) => questionVerb && optionText === answerText(questionVerb),
      ).length;

      if (correctTextCount !== 1) {
        throw new Error(`${question.id} must have exactly one correct answer text.`);
      }

      if (!question.prompt.includes('"') || !question.explanation.trim()) {
        throw new Error(`${question.id} must include a quoted prompt and explanation.`);
      }
    }
  }

  if (testCoverage.totalBankVerbs !== verbs.length) {
    throw new Error("Test coverage bank size does not match the active verb bank.");
  }

  if (testCoverage.questionCount !== verbs.length) {
    throw new Error(
      `Expected test coverage to have ${verbs.length} questions, received ${testCoverage.questionCount}.`,
    );
  }

  if (testCoverage.coveredVerbCount !== verbs.length) {
    throw new Error(
      `Expected test coverage to cover ${verbs.length} verbs, received ${testCoverage.coveredVerbCount}.`,
    );
  }

  if (testCoverage.regularCovered !== regularTotal) {
    throw new Error(
      `Expected test coverage to cover ${regularTotal} regular verbs, received ${testCoverage.regularCovered}.`,
    );
  }

  if (testCoverage.irregularCovered !== irregularTotal) {
    throw new Error(
      `Expected test coverage to cover ${irregularTotal} irregular verbs, received ${testCoverage.irregularCovered}.`,
    );
  }

  if (testCoverage.uncoveredVerbIds.length > 0) {
    throw new Error(`Uncovered verb ids: ${testCoverage.uncoveredVerbIds.join(", ")}.`);
  }

  if (testCoverage.duplicateVerbIds.length > 0) {
    throw new Error(`Duplicate test coverage ids: ${testCoverage.duplicateVerbIds.join(", ")}.`);
  }
}

validateVerbContent();
