import type { Answers, Question } from "./types";

export const FIRST_QUESTION_ID = "budget";

const asArray = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

export const QUESTIONS: Record<string, Question> = {
  budget: {
    id: "budget",
    kind: "range",
    prompt: "What's your budget?",
    subtitle: "Total purchase price range in USD.",
    min: 5000,
    max: 150000,
    step: 1000,
    format: (n) => `$${n.toLocaleString()}`,
    next: () => "usage",
  },

  usage: {
    id: "usage",
    kind: "multi",
    prompt: "How will you primarily use the car?",
    subtitle: "Pick all that apply.",
    options: [
      { value: "commute", label: "Daily commute" },
      { value: "family", label: "Family hauler" },
      { value: "road_trips", label: "Long road trips" },
      { value: "off_road", label: "Off-road / adventure" },
      { value: "towing", label: "Hauling or towing" },
      { value: "sport", label: "Sport / weekend fun" },
      { value: "city", label: "Tight city driving" },
    ],
    next: () => "seats",
  },

  seats: {
    id: "seats",
    kind: "single",
    prompt: "How many seats do you need?",
    options: [
      { value: "2", label: "2" },
      { value: "4-5", label: "4 or 5" },
      { value: "6-7", label: "6 or 7" },
      { value: "8+", label: "8+" },
    ],
    next: () => "bodyStyle",
  },

  bodyStyle: {
    id: "bodyStyle",
    kind: "multi",
    prompt: "Which body styles interest you?",
    subtitle: "Pick any that appeal \u2014 we'll narrow from there.",
    options: [
      { value: "sedan", label: "Sedan" },
      { value: "hatchback", label: "Hatchback" },
      { value: "suv", label: "SUV / Crossover" },
      { value: "truck", label: "Pickup truck" },
      { value: "minivan", label: "Minivan" },
      { value: "coupe", label: "Coupe" },
      { value: "convertible", label: "Convertible" },
      { value: "wagon", label: "Wagon" },
    ],
    next: () => "fuelType",
  },

  fuelType: {
    id: "fuelType",
    kind: "single",
    prompt: "What kind of powertrain do you want?",
    options: [
      { value: "gas", label: "Gasoline" },
      { value: "hybrid", label: "Hybrid" },
      { value: "phev", label: "Plug-in hybrid" },
      { value: "ev", label: "Fully electric" },
      { value: "diesel", label: "Diesel" },
      { value: "open", label: "No preference" },
    ],
    next: (a) => (a.fuelType === "ev" || a.fuelType === "phev" ? "chargingAccess" : "newOrUsed"),
  },

  chargingAccess: {
    id: "chargingAccess",
    kind: "single",
    prompt: "Where will you charge?",
    subtitle: "This affects range requirements.",
    options: [
      { value: "home", label: "Home charger available" },
      { value: "work", label: "Charging at work" },
      { value: "public", label: "Mostly public charging" },
      { value: "unsure", label: "Not sure yet" },
    ],
    next: () => "newOrUsed",
  },

  newOrUsed: {
    id: "newOrUsed",
    kind: "single",
    prompt: "New, used, or either?",
    options: [
      { value: "new", label: "New only" },
      { value: "used", label: "Used only" },
      { value: "either", label: "Either is fine" },
    ],
    next: (a) => (a.newOrUsed === "used" ? "maxAge" : "priorities"),
  },

  maxAge: {
    id: "maxAge",
    kind: "single",
    prompt: "How old is too old?",
    options: [
      { value: "3", label: "Up to 3 years old" },
      { value: "5", label: "Up to 5 years old" },
      { value: "8", label: "Up to 8 years old" },
      { value: "any", label: "Age doesn't matter" },
    ],
    next: () => "priorities",
  },

  priorities: {
    id: "priorities",
    kind: "multi",
    prompt: "What matters most to you?",
    subtitle: "Pick up to 3.",
    maxSelections: 3,
    options: [
      { value: "safety", label: "Safety" },
      { value: "performance", label: "Performance" },
      { value: "reliability", label: "Reliability" },
      { value: "fuel_economy", label: "Fuel economy" },
      { value: "tech", label: "Tech & infotainment" },
      { value: "comfort", label: "Comfort" },
      { value: "resale", label: "Resale value" },
      { value: "cargo", label: "Cargo space" },
    ],
    next: (a) => {
      const priorities = asArray(a.priorities);
      if (priorities.includes("performance")) return "performanceDetail";
      if (priorities.includes("safety")) return "safetyFeatures";
      return offRoadOrTowing(a) ? "drivetrain" : "climate";
    },
  },

  performanceDetail: {
    id: "performanceDetail",
    kind: "single",
    prompt: "What level of performance do you want?",
    options: [
      { value: "mild", label: "Peppy", description: "Quick enough to be fun (0\u201360 under 7s)" },
      { value: "hot", label: "Hot hatch / sport sedan", description: "0\u201360 in 5\u20136s" },
      { value: "fast", label: "Seriously fast", description: "0\u201360 under 5s" },
      { value: "supercar", label: "Supercar territory", description: "0\u201360 under 3.5s" },
    ],
    next: (a) => {
      const priorities = asArray(a.priorities);
      if (priorities.includes("safety")) return "safetyFeatures";
      return offRoadOrTowing(a) ? "drivetrain" : "climate";
    },
  },

  safetyFeatures: {
    id: "safetyFeatures",
    kind: "multi",
    prompt: "Which safety features are must-haves?",
    subtitle: "Pick all that apply.",
    options: [
      { value: "aeb", label: "Automatic emergency braking" },
      { value: "blind_spot", label: "Blind-spot monitoring" },
      { value: "adaptive_cruise", label: "Adaptive cruise control" },
      { value: "lane_keep", label: "Lane-keep assist" },
      { value: "360_cam", label: "360\u00b0 camera" },
      { value: "top_iihs", label: "Top IIHS safety rating" },
    ],
    next: (a) => (offRoadOrTowing(a) ? "drivetrain" : "climate"),
  },

  drivetrain: {
    id: "drivetrain",
    kind: "single",
    prompt: "Which drivetrain do you need?",
    subtitle: "You mentioned off-road or towing.",
    options: [
      { value: "fwd", label: "Front-wheel drive" },
      { value: "rwd", label: "Rear-wheel drive" },
      { value: "awd", label: "All-wheel drive" },
      { value: "4wd", label: "Four-wheel drive (body-on-frame)" },
      { value: "unsure", label: "Recommend for me" },
    ],
    next: (a) => (asArray(a.usage).includes("towing") ? "towingCapacity" : "climate"),
  },

  towingCapacity: {
    id: "towingCapacity",
    kind: "single",
    prompt: "How much towing capacity do you need?",
    options: [
      { value: "light", label: "Light (up to 3,500 lbs)", description: "Small trailer, jet ski" },
      { value: "medium", label: "Medium (3,500\u20137,000 lbs)", description: "Mid-size boat, small camper" },
      { value: "heavy", label: "Heavy (7,000\u201312,000 lbs)", description: "Travel trailer, horse trailer" },
      { value: "hd", label: "Heavy-duty (12,000+ lbs)", description: "Fifth-wheel, heavy equipment" },
    ],
    next: () => "climate",
  },

  climate: {
    id: "climate",
    kind: "single",
    prompt: "What's your climate like?",
    subtitle: "Helps us gauge if AWD/4WD is worth it.",
    options: [
      { value: "snow", label: "Snowy or icy winters" },
      { value: "rain", label: "Heavy rain / wet" },
      { value: "hot", label: "Hot & dry" },
      { value: "mild", label: "Mild year-round" },
    ],
    next: () => "brandPreferences",
  },

  brandPreferences: {
    id: "brandPreferences",
    kind: "multi",
    prompt: "Any brand preferences?",
    subtitle: "Optional \u2014 pick brands you love, or skip.",
    optional: true,
    options: [
      { value: "toyota", label: "Toyota" },
      { value: "honda", label: "Honda" },
      { value: "mazda", label: "Mazda" },
      { value: "hyundai", label: "Hyundai" },
      { value: "kia", label: "Kia" },
      { value: "ford", label: "Ford" },
      { value: "chevy", label: "Chevrolet" },
      { value: "subaru", label: "Subaru" },
      { value: "vw", label: "Volkswagen" },
      { value: "bmw", label: "BMW" },
      { value: "audi", label: "Audi" },
      { value: "mercedes", label: "Mercedes-Benz" },
      { value: "tesla", label: "Tesla" },
      { value: "lexus", label: "Lexus" },
      { value: "porsche", label: "Porsche" },
      { value: "volvo", label: "Volvo" },
    ],
    next: () => "dealbreakers",
  },

  dealbreakers: {
    id: "dealbreakers",
    kind: "text",
    prompt: "Anything else we should know?",
    subtitle: "Dealbreakers, must-haves, or quirks \u2014 optional.",
    optional: true,
    placeholder: "e.g. must fit a golden retriever, no CVT, leather required\u2026",
    next: () => null,
  },
};

function offRoadOrTowing(a: Answers): boolean {
  const usage = asArray(a.usage);
  return usage.includes("off_road") || usage.includes("towing");
}

export function getQuestion(id: string): Question {
  const q = QUESTIONS[id];
  if (!q) throw new Error(`Unknown question id: ${id}`);
  return q;
}
