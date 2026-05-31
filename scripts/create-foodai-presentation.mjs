import fs from "node:fs";
import path from "node:path";
import pptxgen from "pptxgenjs";

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "OpenAI Codex";
pptx.company = "FoodAI";
pptx.subject = "AI-Powered Personalized Diet Planning Platform";
pptx.title = "FoodAI - AI-Powered Personalized Diet Planning Platform";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-IN",
};

const C = {
  green: "20B26B",
  greenDark: "0F8A52",
  blue: "59B9F8",
  blueDark: "1F8FE5",
  navy: "12324A",
  text: "244357",
  muted: "678498",
  white: "FFFFFF",
  bg: "F6FBFE",
  bgAlt: "EAF7F4",
  line: "D6E7F0",
  softBlue: "DFF2FF",
  softGreen: "DCF7E7",
  danger: "FF7F66",
  gold: "FFCC66",
};

const W = 13.333;
const H = 7.5;
const OUT_DIR = path.join(process.cwd(), "output");
const PHOTO_DIR = path.join(process.cwd(), "photo");

const IMG = {
  hero: fileIfExists(path.join(PHOTO_DIR, "image.png")),
  laptop: fileIfExists(path.join(PHOTO_DIR, "laptop1.png")),
  phone: fileIfExists(path.join(PHOTO_DIR, "phone2.png")),
  phoneWide: fileIfExists(path.join(PHOTO_DIR, "phone3.png")),
  phoneMini: fileIfExists(path.join(PHOTO_DIR, "phone5.png")),
};

const speakerNames = [
  "Speaker 1",
  "Speaker 2",
  "Speaker 3",
  "Speaker 4",
  "Speaker 5",
  "Speaker 6",
];

const slides = [
  {
    speaker: 1,
    title: "FoodAI",
    type: "title",
    subtitle: "Eat Smart, Live Better",
  },
  {
    speaker: 1,
    title: "Problem Statement",
    type: "split",
    bullets: [
      "Students skip meals and rely on junk food",
      "Low energy and poor concentration hurt performance",
      "Healthy eating feels expensive and time-consuming",
      "Typical student budget: Rs100-Rs150 per day",
    ],
    visualTitle: "Student Reality",
    stats: [
      ["Skipped meals", "Common during classes and exams"],
      ["Junk dependence", "Fast, cheap, easy choice"],
      ["Budget pressure", "Nutrition often gets ignored"],
    ],
  },
  {
    speaker: 1,
    title: "India's Health Challenge",
    type: "data",
    bullets: [
      "57%+ women are anaemic",
      "67% children are anaemic",
      "India contributes nearly one-third of global undernutrition",
      "Obesity is rising with processed food consumption",
    ],
    chart: {
      kind: "bar",
      title: "Nutrition and lifestyle indicators",
      labels: ["Women", "Children", "Undernutrition", "Obesity risk"],
      values: [57, 67, 33, 28],
    },
    source: "Indicative references: NFHS, UNICEF, WHO",
  },
  {
    speaker: 1,
    title: "Gap in Current Solutions",
    type: "threeup",
    cards: [
      ["Expensive diet apps", "Premium plans do not match student spending power"],
      ["Generic recommendations", "Same diet template for very different users"],
      ["Low real-world fit", "Hard to follow in hostel, mess, and canteen life"],
    ],
  },
  {
    speaker: 2,
    title: "Introducing FoodAI",
    type: "solution",
    bullets: [
      "AI-powered personalized diet planning app",
      "Built for affordability, realism, and daily consistency",
      "Designed around student budgets, goals, and preferences",
    ],
    image: IMG.phone,
  },
  {
    speaker: 2,
    title: "How It Works",
    type: "flow",
    steps: [
      ["Budget", "Set daily spend range"],
      ["Goal", "Weight loss, muscle gain, healthy lifestyle"],
      ["Preference", "Veg, non-veg, allergies, likes"],
      ["FoodAI Plan", "Instant realistic meal recommendation"],
    ],
  },
  {
    speaker: 2,
    title: "Core Idea",
    type: "focus",
    quote: "Not the perfect diet. The realistic diet.",
    bullets: [
      "Works within actual lifestyle constraints",
      "Suggests better choices, not impossible routines",
      "Balances nutrition, convenience, and budget",
    ],
  },
  {
    speaker: 2,
    title: "Unique Value Proposition",
    type: "threeup",
    cards: [
      ["Budget-friendly", "Practical plans within Rs100-Rs150/day"],
      ["Student-focused", "Made for hostel, mess, canteen, and campus life"],
      ["AI-personalized", "Recommendations adapt to each user profile"],
    ],
  },
  {
    speaker: 3,
    title: "Why Personalization Matters",
    type: "split",
    bullets: [
      "Every student has different goals and routines",
      "Budgets, schedules, and food access vary widely",
      "One-size-fits-all plans fail in everyday use",
    ],
    visualTitle: "Personalization Drivers",
    stats: [
      ["Goal", "Fat loss, muscle gain, maintenance"],
      ["Context", "Hostel, PG, home, gym, college timing"],
      ["Preference", "Taste, culture, allergy, dietary choice"],
    ],
  },
  {
    speaker: 3,
    title: "Goal-Based Planning",
    type: "threeup",
    cards: [
      ["Weight loss", "Lower-calorie meals with satiety focus"],
      ["Muscle gain", "Protein-rich meals and recovery support"],
      ["Healthy lifestyle", "Balanced daily nutrition for consistency"],
    ],
  },
  {
    speaker: 3,
    title: "Budget Optimization",
    type: "data",
    bullets: [
      "Affordable plans for Rs100-Rs150 per day",
      "Chooses high-value ingredients first",
      "Makes nutrition possible without premium spending",
    ],
    chart: {
      kind: "bar",
      title: "Example smart allocation",
      labels: ["Breakfast", "Lunch", "Snacks", "Dinner"],
      values: [25, 40, 20, 35],
    },
    source: "Illustrative one-day student budget split in rupees",
  },
  {
    speaker: 3,
    title: "Adaptive AI Engine",
    type: "split",
    bullets: [
      "Tracks meal adherence and progress",
      "Learns user habits and frequent food choices",
      "Updates plans based on what is actually followed",
    ],
    visualTitle: "Adaptive Loop",
    stats: [
      ["Observe", "Logs eating patterns and preferences"],
      ["Learn", "Finds repeatable healthy options"],
      ["Improve", "Refines next-day meal plans automatically"],
    ],
  },
  {
    speaker: 4,
    title: "Real-Life Eating Problem",
    type: "split",
    bullets: [
      "Most students depend on mess or canteen food",
      "Limited menu control leads to poor choices",
      "Convenience usually wins over nutrition",
    ],
    visualTitle: "Campus Constraint",
    stats: [
      ["Mess menu", "Fixed and repetitive"],
      ["Canteen food", "Tasty but often oily or low-protein"],
      ["Time pressure", "Students choose speed over quality"],
    ],
  },
  {
    speaker: 4,
    title: "Smart Suggestions",
    type: "twoCardFeature",
    cards: [
      ["Mess guidance", "Choose dal + rice + curd over fried combos"],
      ["Better swaps", "Replace soft drinks with buttermilk or lemon water"],
      ["Snack alternatives", "Fruit, sprouts, peanuts, eggs, banana shake"],
      ["Quick recommendations", "FoodAI suggests what to pick instantly"],
    ],
  },
  {
    speaker: 4,
    title: "Nutrition Insights",
    type: "data",
    bullets: [
      "Tracks calories and protein intake",
      "Shows where nutrition is missing",
      "Makes daily health metrics easy to understand",
    ],
    chart: {
      kind: "line",
      title: "Daily intake snapshot",
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      values: [42, 51, 56, 60, 64],
      axisTitle: "Protein (g)",
    },
    source: "Illustrative weekly trend for an active student user",
  },
  {
    speaker: 4,
    title: "Main Benefit",
    type: "focus",
    quote: "Smarter food decisions without changing your entire lifestyle",
    bullets: [
      "No strict meal prep required",
      "Works with food students already have access to",
      "Creates healthier habits with low friction",
    ],
  },
  {
    speaker: 5,
    title: "Tracking Features",
    type: "twoCardFeature",
    cards: [
      ["Calorie tracking", "Quick daily snapshot of intake vs target"],
      ["Nutrition tracking", "Protein, carbs, fats, and micronutrient balance"],
      ["Progress trends", "Visual improvements across the week"],
      ["Actionable alerts", "Highlights where users are falling short"],
    ],
  },
  {
    speaker: 5,
    title: "Reminder System",
    type: "solution",
    bullets: [
      "Meal reminders keep plans consistent",
      "Water intake alerts support healthy routines",
      "Simple nudges improve adherence over time",
    ],
    image: IMG.phoneWide,
  },
  {
    speaker: 5,
    title: "Market Opportunity",
    type: "data",
    bullets: [
      "40M+ students in India represent a large addressable user base",
      "Health awareness is growing across campuses and cities",
      "Affordable wellness tools are becoming more relevant",
    ],
    chart: {
      kind: "bar",
      title: "Opportunity landscape",
      labels: ["Students", "Smartphone access", "Health awareness", "Digital wellness use"],
      values: [40, 78, 62, 35],
    },
    source: "Market-sizing slide uses indicative adoption assumptions",
  },
  {
    speaker: 5,
    title: "Future Scope",
    type: "threeup",
    cards: [
      ["AI coaching", "Conversational guidance for better daily food choices"],
      ["Gym integration", "Sync diet suggestions with training intensity"],
      ["Fitness plans", "Expand into complete health and wellness journeys"],
    ],
  },
  {
    speaker: 6,
    title: "Business Model",
    type: "threeup",
    cards: [
      ["Freemium access", "Free core planning for rapid user growth"],
      ["Premium tier", "Advanced insights, tracking, and adaptive coaching"],
      ["Scalable platform", "Low-cost digital delivery with repeat engagement"],
    ],
  },
  {
    speaker: 6,
    title: "Revenue Streams",
    type: "data",
    bullets: [
      "Subscription plan at Rs99 per month",
      "Partnerships with gyms, fitness brands, and food companies",
      "Brand placements and wellness collaborations",
    ],
    chart: {
      kind: "doughnut",
      title: "Expected revenue mix",
      labels: ["Subscriptions", "Gym partners", "Brand tie-ups"],
      values: [60, 25, 15],
    },
    source: "Illustrative monetization split for early-stage rollout",
  },
  {
    speaker: 6,
    title: "Financial Potential",
    type: "data",
    bullets: [
      "User growth target: 50K to 500K",
      "Strong SaaS-style revenue upside with scale",
      "Projected annual revenue potential: Rs3.5 Cr",
    ],
    chart: {
      kind: "line",
      title: "Projected user growth",
      labels: ["Y1", "Y2", "Y3", "Y4"],
      values: [50, 120, 260, 500],
      axisTitle: "Users (thousands)",
    },
    source: "Projection slide uses internal pitch assumptions",
  },
  {
    speaker: 6,
    title: "Conclusion",
    type: "closing",
    bullets: [
      "Simple",
      "Affordable",
      "Practical",
    ],
    tagline: "We don't change your life, we improve it",
  },
];

slides.forEach((cfg, idx) => buildSlide(cfg, idx + 1));

fs.mkdirSync(OUT_DIR, { recursive: true });
await pptx.writeFile({
  fileName: path.join(OUT_DIR, "FoodAI_Presentation_24_Slides.pptx"),
  compression: true,
});

function buildSlide(cfg, num) {
  const slide = pptx.addSlide();
  baseSlide(slide, cfg, num);

  switch (cfg.type) {
    case "title":
      renderTitleSlide(slide, cfg);
      break;
    case "split":
      renderSplitSlide(slide, cfg);
      break;
    case "data":
      renderDataSlide(slide, cfg);
      break;
    case "threeup":
      renderThreeUp(slide, cfg);
      break;
    case "solution":
      renderSolutionSlide(slide, cfg);
      break;
    case "flow":
      renderFlowSlide(slide, cfg);
      break;
    case "focus":
      renderFocusSlide(slide, cfg);
      break;
    case "twoCardFeature":
      renderFeatureGrid(slide, cfg);
      break;
    case "closing":
      renderClosingSlide(slide, cfg);
      break;
    default:
      renderSplitSlide(slide, cfg);
  }
}

function baseSlide(slide, cfg, num) {
  slide.background = { color: C.bg };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: W,
    h: H,
    line: { color: C.bg, transparency: 100 },
    fill: { color: C.bg },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: W,
    h: 0.14,
    line: { color: C.green, transparency: 100 },
    fill: { color: C.green },
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 10.7,
    y: -0.45,
    w: 3.2,
    h: 1.55,
    line: { color: C.softBlue, transparency: 100 },
    fill: { color: C.softBlue, transparency: 30 },
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: -0.5,
    y: 5.9,
    w: 2.3,
    h: 1.2,
    line: { color: C.softGreen, transparency: 100 },
    fill: { color: C.softGreen, transparency: 18 },
  });
  slide.addText(cfg.title, {
    x: 0.72,
    y: 0.48,
    w: 8.7,
    h: 0.48,
    fontFace: "Aptos Display",
    fontSize: 23,
    bold: true,
    color: C.navy,
    margin: 0,
  });
  speakerTag(slide, cfg.speaker, num);
}

function speakerTag(slide, speaker, num) {
  const label = `${speakerNames[speaker - 1]}  |  Slide ${num}/24`;
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 10.0,
    y: 0.44,
    w: 2.55,
    h: 0.38,
    rectRadius: 0.08,
    line: { color: C.line, transparency: 100 },
    fill: { color: C.white },
    shadow: { type: "outer", color: "BBD7E8", blur: 1, angle: 45, distance: 1, opacity: 0.15 },
  });
  slide.addText(label, {
    x: 10.12,
    y: 0.53,
    w: 2.3,
    h: 0.15,
    fontFace: "Aptos",
    fontSize: 9,
    bold: true,
    color: C.greenDark,
    align: "center",
    margin: 0,
  });
}

function renderTitleSlide(slide, cfg) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.72,
    y: 1.15,
    w: 5.9,
    h: 4.85,
    rectRadius: 0.12,
    line: { color: C.white, transparency: 100 },
    fill: { color: C.white },
    shadow: { type: "outer", color: "C3DCEA", blur: 2, angle: 45, distance: 1, opacity: 0.18 },
  });
  slide.addText("FoodAI", {
    x: 1.05,
    y: 1.75,
    w: 3.7,
    h: 0.7,
    fontFace: "Aptos Display",
    fontSize: 28,
    bold: true,
    color: C.greenDark,
    margin: 0,
  });
  slide.addText(cfg.subtitle, {
    x: 1.08,
    y: 2.48,
    w: 3.9,
    h: 0.35,
    fontFace: "Aptos",
    fontSize: 16,
    color: C.blueDark,
    italic: true,
    margin: 0,
  });
  addBulletList(slide, [
    "AI-powered personalized diet planning platform",
    "Affordable meal suggestions for students",
    "Health + technology + practical daily choices",
  ], { x: 1.08, y: 3.1, w: 4.8, h: 1.35 });
  metricPill(slide, 1.1, 5.1, 1.5, 0.58, "Budget-aware", C.softGreen, C.greenDark);
  metricPill(slide, 2.82, 5.1, 1.5, 0.58, "Personalized", C.softBlue, C.blueDark);
  metricPill(slide, 4.54, 5.1, 1.4, 0.58, "Student-first", "E9F1FF", C.navy);

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.05,
    y: 1.12,
    w: 5.42,
    h: 5.45,
    rectRadius: 0.18,
    line: { color: C.line, transparency: 100 },
    fill: { color: C.bgAlt },
  });
  if (IMG.hero) {
    slide.addImage({
      path: IMG.hero,
      x: 7.38,
      y: 1.6,
      w: 4.75,
      h: 3.55,
    });
  }
  drawPhoneMock(slide, 9.2, 3.8, 1.7, 2.25, "AI Diet", ["Budget", "Goal", "Meal Plan"]);
  drawIconBadge(slide, 7.55, 1.45, 0.52, C.green, "AI");
  drawIconBadge(slide, 8.2, 1.45, 0.52, C.blue, "FX");
}

function renderSplitSlide(slide, cfg) {
  const left = panel(slide, 0.72, 1.22, 6.05, 5.78);
  const right = panel(slide, 7.02, 1.22, 5.58, 5.78, C.white);
  sectionLabel(slide, 0.95, 1.42, "Overview");
  addBulletList(slide, cfg.bullets, { x: 0.98, y: 1.92, w: 5.4, h: 2.85 });

  slide.addText(cfg.visualTitle || "Highlights", {
    x: 7.35,
    y: 1.48,
    w: 2.5,
    h: 0.25,
    fontSize: 14,
    bold: true,
    color: C.navy,
    margin: 0,
  });

  (cfg.stats || []).forEach((item, i) => {
    const y = 2.02 + i * 1.15;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 7.35,
      y,
      w: 4.9,
      h: 0.9,
      rectRadius: 0.08,
      line: { color: C.line, transparency: 100 },
      fill: { color: i % 2 === 0 ? C.softGreen : C.softBlue },
    });
    slide.addText(item[0], {
      x: 7.58,
      y: y + 0.16,
      w: 1.45,
      h: 0.22,
      fontSize: 12,
      bold: true,
      color: C.greenDark,
      margin: 0,
    });
    slide.addText(item[1], {
      x: 9.04,
      y: y + 0.13,
      w: 2.85,
      h: 0.42,
      fontSize: 11,
      color: C.text,
      margin: 0,
    });
  });

  drawPhoneMock(slide, 9.2, 5.15, 1.5, 1.95, "Today", ["Meal ideas", "Protein", "Hydration"]);
  if (IMG.phoneMini) {
    slide.addImage({
      path: IMG.phoneMini,
      x: 7.55,
      y: 5.22,
      w: 1.25,
      h: 0.7,
    });
  }
}

function renderDataSlide(slide, cfg) {
  panel(slide, 0.72, 1.22, 4.1, 5.78);
  panel(slide, 5.0, 1.22, 7.6, 5.78);
  sectionLabel(slide, 0.95, 1.42, "Key Data");
  addBulletList(slide, cfg.bullets, { x: 0.98, y: 1.9, w: 3.38, h: 2.85 });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.98,
    y: 5.02,
    w: 3.45,
    h: 1.1,
    rectRadius: 0.08,
    line: { color: C.line, transparency: 100 },
    fill: { color: C.bgAlt },
  });
  slide.addText(cfg.source || "Indicative chart for presentation use", {
    x: 1.16,
    y: 5.32,
    w: 3.05,
    h: 0.34,
    fontSize: 9,
    color: C.muted,
    align: "center",
    margin: 0,
  });

  slide.addText(cfg.chart.title, {
    x: 5.28,
    y: 1.45,
    w: 3.7,
    h: 0.25,
    fontSize: 14,
    bold: true,
    color: C.navy,
    margin: 0,
  });
  addChart(slide, cfg.chart, 5.3, 1.9, 6.8, 3.75);
  addInsightStrip(slide, 5.32, 5.98, [
    shortMetric(cfg.chart.labels[0], cfg.chart.values[0]),
    shortMetric(cfg.chart.labels[1], cfg.chart.values[1]),
    shortMetric(cfg.chart.labels[cfg.chart.labels.length - 1], cfg.chart.values[cfg.chart.values.length - 1]),
  ]);
}

function renderThreeUp(slide, cfg) {
  const cardW = 3.95;
  const cardY = 1.72;
  cfg.cards.forEach((card, i) => {
    const x = 0.72 + i * 4.18;
    panel(slide, x, cardY, cardW, 4.9, i === 1 ? C.bgAlt : C.white);
    drawIconBadge(slide, x + 0.28, cardY + 0.26, 0.5, i === 0 ? C.green : i === 1 ? C.blue : C.gold, `${i + 1}`);
    slide.addText(card[0], {
      x: x + 0.28,
      y: cardY + 1.0,
      w: 3.18,
      h: 0.36,
      fontSize: 16,
      bold: true,
      color: C.navy,
      margin: 0,
    });
    slide.addText(card[1], {
      x: x + 0.28,
      y: cardY + 1.55,
      w: 3.18,
      h: 1.25,
      fontSize: 12,
      color: C.text,
      margin: 0,
      valign: "top",
    });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.28,
      y: cardY + 3.85,
      w: 2.05,
      h: 0.42,
      rectRadius: 0.06,
      line: { color: C.line, transparency: 100 },
      fill: { color: i === 1 ? C.softBlue : C.softGreen },
    });
    slide.addText("Feature highlight", {
      x: x + 0.53,
      y: cardY + 3.97,
      w: 1.55,
      h: 0.12,
      fontSize: 9,
      bold: true,
      color: C.greenDark,
      align: "center",
      margin: 0,
    });
  });
}

function renderSolutionSlide(slide, cfg) {
  panel(slide, 0.72, 1.22, 5.9, 5.78);
  panel(slide, 6.84, 1.22, 5.76, 5.78, C.bgAlt);
  sectionLabel(slide, 0.95, 1.42, "Solution");
  addBulletList(slide, cfg.bullets, { x: 0.98, y: 1.95, w: 5.02, h: 2.1 });
  metricPill(slide, 0.98, 4.75, 1.55, 0.58, "AI-driven", C.softBlue, C.blueDark);
  metricPill(slide, 2.72, 4.75, 1.75, 0.58, "Affordable", C.softGreen, C.greenDark);
  metricPill(slide, 4.66, 4.75, 1.3, 0.58, "Practical", "E8F4FF", C.navy);

  slide.addText("Product view", {
    x: 7.18,
    y: 1.48,
    w: 2.0,
    h: 0.25,
    fontSize: 14,
    bold: true,
    color: C.navy,
    margin: 0,
  });
  if (cfg.image) {
    slide.addImage({
      path: cfg.image,
      x: 7.38,
      y: 1.85,
      w: 4.55,
      h: 3.7,
    });
  } else {
    drawPhoneMock(slide, 8.6, 2.05, 2.1, 3.8, "FoodAI App", ["Budget setup", "Meal cards", "Daily summary"]);
  }
}

function renderFlowSlide(slide, cfg) {
  panel(slide, 0.72, 1.22, 11.88, 5.78);
  sectionLabel(slide, 0.95, 1.42, "Flow Diagram");
  cfg.steps.forEach((step, i) => {
    const x = 1.05 + i * 2.95;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 2.5,
      w: 2.15,
      h: 1.5,
      rectRadius: 0.1,
      line: { color: C.line, transparency: 100 },
      fill: { color: i === 3 ? C.softGreen : C.white },
      shadow: { type: "outer", color: "D4E7F3", blur: 1, angle: 45, distance: 1, opacity: 0.12 },
    });
    drawIconBadge(slide, x + 0.78, 2.08, 0.55, i % 2 === 0 ? C.blue : C.green, `${i + 1}`);
    slide.addText(step[0], {
      x: x + 0.22,
      y: 2.8,
      w: 1.72,
      h: 0.28,
      fontSize: 15,
      bold: true,
      color: C.navy,
      align: "center",
      margin: 0,
    });
    slide.addText(step[1], {
      x: x + 0.18,
      y: 3.18,
      w: 1.8,
      h: 0.48,
      fontSize: 10,
      color: C.text,
      align: "center",
      margin: 0,
    });
    if (i < cfg.steps.length - 1) {
      slide.addShape(pptx.ShapeType.chevron, {
        x: x + 2.24,
        y: 2.98,
        w: 0.45,
        h: 0.45,
        line: { color: C.white, transparency: 100 },
        fill: { color: C.blue },
      });
    }
  });
  slide.addText("Input -> AI processing -> personalized meal output", {
    x: 3.02,
    y: 5.15,
    w: 7.3,
    h: 0.3,
    fontSize: 13,
    italic: true,
    color: C.greenDark,
    align: "center",
    margin: 0,
  });
}

function renderFocusSlide(slide, cfg) {
  panel(slide, 0.72, 1.22, 11.88, 5.78, C.bgAlt);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.08,
    y: 1.8,
    w: 11.05,
    h: 2.05,
    rectRadius: 0.12,
    line: { color: C.line, transparency: 100 },
    fill: { color: C.white },
  });
  slide.addText(cfg.quote, {
    x: 1.38,
    y: 2.35,
    w: 10.5,
    h: 0.7,
    fontFace: "Aptos Display",
    fontSize: 24,
    bold: true,
    color: C.navy,
    align: "center",
    margin: 0,
  });
  addBulletList(slide, cfg.bullets, { x: 2.2, y: 4.45, w: 8.9, h: 1.45 }, 15, true);
}

function renderFeatureGrid(slide, cfg) {
  panel(slide, 0.72, 1.22, 11.88, 5.78);
  const cols = [
    [0.98, 1.85],
    [6.48, 1.85],
    [0.98, 4.05],
    [6.48, 4.05],
  ];
  cfg.cards.forEach((card, i) => {
    const [x, y] = cols[i];
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: 5.02,
      h: 1.55,
      rectRadius: 0.08,
      line: { color: C.line, transparency: 100 },
      fill: { color: i % 2 === 0 ? C.white : C.bgAlt },
    });
    drawIconBadge(slide, x + 0.22, y + 0.38, 0.45, i % 2 === 0 ? C.green : C.blue, `${i + 1}`);
    slide.addText(card[0], {
      x: x + 0.86,
      y: y + 0.26,
      w: 3.5,
      h: 0.22,
      fontSize: 13,
      bold: true,
      color: C.navy,
      margin: 0,
    });
    slide.addText(card[1], {
      x: x + 0.86,
      y: y + 0.63,
      w: 3.78,
      h: 0.5,
      fontSize: 10.5,
      color: C.text,
      margin: 0,
    });
  });
}

function renderClosingSlide(slide, cfg) {
  slide.background = { color: C.bgAlt };
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.72,
    y: 1.08,
    w: 12.0,
    h: 5.95,
    rectRadius: 0.18,
    line: { color: C.white, transparency: 100 },
    fill: { color: C.white },
    shadow: { type: "outer", color: "C3DCEA", blur: 2, angle: 45, distance: 1, opacity: 0.18 },
  });
  slide.addText("FoodAI", {
    x: 1.1,
    y: 1.8,
    w: 4.6,
    h: 0.55,
    fontFace: "Aptos Display",
    fontSize: 28,
    bold: true,
    color: C.greenDark,
    margin: 0,
  });
  slide.addText("simple + affordable + practical", {
    x: 1.1,
    y: 2.42,
    w: 5.8,
    h: 0.3,
    fontSize: 16,
    color: C.blueDark,
    italic: true,
    margin: 0,
  });
  metricPill(slide, 1.1, 3.15, 1.15, 0.58, "Simple", C.softGreen, C.greenDark);
  metricPill(slide, 2.42, 3.15, 1.45, 0.58, "Affordable", C.softBlue, C.blueDark);
  metricPill(slide, 4.05, 3.15, 1.35, 0.58, "Practical", "E9F1FF", C.navy);
  slide.addText(cfg.tagline, {
    x: 1.1,
    y: 4.08,
    w: 5.9,
    h: 0.55,
    fontFace: "Aptos Display",
    fontSize: 20,
    bold: true,
    color: C.navy,
    margin: 0,
  });
  slide.addText("Thank You", {
    x: 1.1,
    y: 5.3,
    w: 2.6,
    h: 0.42,
    fontSize: 18,
    bold: true,
    color: C.greenDark,
    margin: 0,
  });
  if (IMG.phone) {
    slide.addImage({
      path: IMG.phone,
      x: 8.15,
      y: 1.65,
      w: 3.45,
      h: 4.85,
    });
  } else {
    drawPhoneMock(slide, 8.65, 1.8, 2.3, 4.6, "FoodAI", ["Daily plan", "Smart swaps", "Track progress"]);
  }
}

function panel(slide, x, y, w, h, fill = C.white) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.12,
    line: { color: C.line, transparency: 100 },
    fill: { color: fill },
    shadow: { type: "outer", color: "D4E7F3", blur: 1.2, angle: 45, distance: 1, opacity: 0.1 },
  });
}

function sectionLabel(slide, x, y, label) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w: 1.2,
    h: 0.34,
    rectRadius: 0.06,
    line: { color: C.line, transparency: 100 },
    fill: { color: C.softGreen },
  });
  slide.addText(label, {
    x: x + 0.1,
    y: y + 0.1,
    w: 1.0,
    h: 0.1,
    fontSize: 8.8,
    bold: true,
    color: C.greenDark,
    align: "center",
    margin: 0,
  });
}

function metricPill(slide, x, y, w, h, text, fill, color) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.12,
    line: { color: fill, transparency: 100 },
    fill: { color: fill },
  });
  slide.addText(text, {
    x,
    y: y + 0.18,
    w,
    h: 0.12,
    fontSize: 10.5,
    bold: true,
    color,
    align: "center",
    margin: 0,
  });
}

function drawIconBadge(slide, x, y, size, fill, text) {
  slide.addShape(pptx.ShapeType.ellipse, {
    x,
    y,
    w: size,
    h: size,
    line: { color: fill, transparency: 100 },
    fill: { color: fill },
  });
  slide.addText(text, {
    x,
    y: y + size * 0.25,
    w: size,
    h: size * 0.2,
    fontSize: 8.5,
    bold: true,
    color: C.white,
    align: "center",
    margin: 0,
  });
}

function drawPhoneMock(slide, x, y, w, h, title, items) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.18,
    line: { color: C.navy, transparency: 15, width: 1.2 },
    fill: { color: "FDFEFE" },
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: x + 0.18,
    y: y + 0.22,
    w: w - 0.36,
    h: 0.5,
    rectRadius: 0.08,
    line: { color: C.green, transparency: 100 },
    fill: { color: C.green },
  });
  slide.addText(title, {
    x: x + 0.3,
    y: y + 0.39,
    w: w - 0.6,
    h: 0.12,
    fontSize: 10,
    bold: true,
    color: C.white,
    align: "center",
    margin: 0,
  });
  items.forEach((item, i) => {
    const yy = y + 0.92 + i * 0.48;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.18,
      y: yy,
      w: w - 0.36,
      h: 0.32,
      rectRadius: 0.06,
      line: { color: C.line, transparency: 100 },
      fill: { color: i % 2 === 0 ? C.softBlue : C.softGreen },
    });
    slide.addText(item, {
      x: x + 0.3,
      y: yy + 0.09,
      w: w - 0.6,
      h: 0.08,
      fontSize: 8.5,
      color: C.text,
      margin: 0,
    });
  });
}

function addBulletList(slide, items, box, fontSize = 14, centered = false) {
  const runs = [];
  items.forEach((item, idx) => {
    runs.push({ text: `• ${item}`, options: { breakLine: true } });
  });
  slide.addText(runs, {
    ...box,
    fontFace: "Aptos",
    fontSize,
    color: C.text,
    bold: false,
    margin: 0,
    breakLine: true,
    valign: "top",
    align: centered ? "center" : "left",
    paraSpaceAfterPt: 10,
  });
}

function addChart(slide, chart, x, y, w, h) {
  const opts = {
    x,
    y,
    w,
    h,
    showLegend: chart.kind === "doughnut",
    showTitle: false,
    showValue: chart.kind === "doughnut",
    showPercent: chart.kind === "doughnut",
    legendPos: "r",
    chartColors: [C.green, C.blue, C.gold, C.danger, C.greenDark],
    catAxisLabelFontSize: 10,
    valAxisLabelFontSize: 10,
    valAxisTitle: chart.axisTitle,
    valAxisMinVal: 0,
    valGridLine: { color: "DCEAF2", size: 1 },
    catGridLine: { style: "none" },
    chartArea: { border: { color: "FFFFFF", pt: 0 }, roundedCorners: true },
    showDataLabel: true,
    dataLabelPosition: chart.kind === "bar" ? "outEnd" : "t",
    lineSize: 3,
    markerSize: 5,
  };

  slide.addChart(
    pptx.ChartType[chart.kind],
    [{ name: chart.title, labels: chart.labels, values: chart.values }],
    opts
  );
}

function addInsightStrip(slide, x, y, items) {
  items.forEach((item, i) => {
    const xx = x + i * 2.15;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xx,
      y,
      w: 1.92,
      h: 0.76,
      rectRadius: 0.06,
      line: { color: C.line, transparency: 100 },
      fill: { color: i % 2 === 0 ? C.softGreen : C.softBlue },
    });
    slide.addText(item.value, {
      x: xx,
      y: y + 0.13,
      w: 1.92,
      h: 0.18,
      fontSize: 14,
      bold: true,
      color: C.navy,
      align: "center",
      margin: 0,
    });
    slide.addText(item.label, {
      x: xx,
      y: y + 0.42,
      w: 1.92,
      h: 0.12,
      fontSize: 8.5,
      color: C.muted,
      align: "center",
      margin: 0,
    });
  });
}

function shortMetric(label, value) {
  const clean = String(label).replace(" risk", "").replace("Digital ", "");
  const val = Number.isFinite(value) ? `${value}${value > 40 ? "%" : ""}` : String(value);
  return { label: clean, value: val };
}

function fileIfExists(file) {
  return fs.existsSync(file) && fs.statSync(file).size > 0 ? file : null;
}
