/**
 * What's Your Guess? — estimation question bank.
 *
 * HOW TO ADD A QUESTION (no coding knowledge needed):
 * Copy any block, change the id, question, answer, unit and explanation.
 * - `answer` must be a plain number (no units inside the number).
 * - `unit` is shown next to the answer in the reveal, e.g. "metres".
 * The daily game picks 5 questions from this list with a date seed,
 * so every visitor gets the same five on the same day.
 */

export interface GuessQuestion {
  id: string;
  question: string;
  answer: number;
  unit: string;
  explanation: string;
}

export const GUESS_QUESTIONS: GuessQuestion[] = [
  {
    id: "piano-keys",
    question: "How many keys does a standard full-size piano have?",
    answer: 88,
    unit: "keys",
    explanation: "52 white and 36 black keys — a layout set by Steinway in the 1880s and copied ever since.",
  },
  {
    id: "human-bones",
    question: "How many bones are in the adult human body?",
    answer: 206,
    unit: "bones",
    explanation: "Babies start with about 300; many fuse together as we grow.",
  },
  {
    id: "boiling-fahrenheit",
    question: "At sea level, at what temperature does water boil in degrees Fahrenheit?",
    answer: 212,
    unit: "°F",
    explanation: "212 °F equals 100 °C — the classic reference point of the Fahrenheit scale.",
  },
  {
    id: "sunlight-minutes",
    question: "How many minutes does sunlight take to reach Earth?",
    answer: 8,
    unit: "minutes",
    explanation: "Light covers the 150 million km at roughly 8 minutes and 20 seconds.",
  },
  {
    id: "un-members",
    question: "How many member states does the United Nations have?",
    answer: 193,
    unit: "countries",
    explanation: "The newest member is South Sudan, admitted in 2011.",
  },
  {
    id: "eiffel-height",
    question: "How tall is the Eiffel Tower, including its antennas, in metres?",
    answer: 330,
    unit: "metres",
    explanation: "It measured 300 m in 1889 and reached 330 m after a new antenna was fitted in 2022.",
  },
  {
    id: "sound-speed",
    question: "How fast does sound travel through air at room temperature, in metres per second?",
    answer: 343,
    unit: "m/s",
    explanation: "About 343 m/s (1,235 km/h) at 20 °C — roughly a kilometre every three seconds.",
  },
  {
    id: "chess-squares",
    question: "How many squares are there on a chessboard?",
    answer: 64,
    unit: "squares",
    explanation: "Eight ranks by eight files — though if you count squares of every size there are 204.",
  },
  {
    id: "octopus-hearts",
    question: "How many hearts does an octopus have?",
    answer: 3,
    unit: "hearts",
    explanation: "Two pump blood to the gills, one to the rest of the body.",
  },
  {
    id: "angel-falls",
    question: "How high is Angel Falls, the world's tallest waterfall, in metres?",
    answer: 979,
    unit: "metres",
    explanation: "The Venezuelan falls drop 979 m — water turns to mist long before it lands.",
  },
  {
    id: "elements",
    question: "How many elements are in the periodic table (as of 2024)?",
    answer: 118,
    unit: "elements",
    explanation: "Element 118, oganesson, completed the seventh row in 2016.",
  },
  {
    id: "everest-height",
    question: "How high is Mount Everest above sea level, in metres?",
    answer: 8849,
    unit: "metres",
    explanation: "The 2020 joint China–Nepal survey fixed the height at 8,848.86 m.",
  },
  {
    id: "liberty-height",
    question: "How tall is the Statue of Liberty from the ground to her torch tip, in metres?",
    answer: 93,
    unit: "metres",
    explanation: "The statue itself is 46 m; the pedestal raises the total to about 93 m.",
  },
  {
    id: "russia-timezones",
    question: "How many time zones does Russia span?",
    answer: 11,
    unit: "time zones",
    explanation: "From Kaliningrad (UTC+2) to Kamchatka (UTC+12) — the most of any country.",
  },
  {
    id: "sun-temperature",
    question: "What is the approximate surface temperature of the Sun, in degrees Celsius?",
    answer: 5500,
    unit: "°C",
    explanation: "The photosphere burns at about 5,500 °C; the core reaches 15 million °C.",
  },
  {
    id: "flag-stripes",
    question: "How many stripes are on the flag of the United States?",
    answer: 13,
    unit: "stripes",
    explanation: "One for each original colony; the star count, not the stripes, changes over time.",
  },
  {
    id: "marathon-km",
    question: "How long is an official marathon, in kilometres?",
    answer: 42,
    unit: "km",
    explanation: "Exactly 42.195 km — set when the 1908 London race ran from Windsor to the royal box.",
  },
  {
    id: "moon-distance",
    question: "On average, how far is the Moon from Earth, in kilometres?",
    answer: 384400,
    unit: "km",
    explanation: "About 384,400 km — thirty Earth diameters would just about bridge the gap.",
  },
  {
    id: "adult-teeth",
    question: "How many teeth does a healthy adult have, including wisdom teeth?",
    answer: 32,
    unit: "teeth",
    explanation: "16 per arch: 8 incisors, 4 canines, 8 premolars and 12 molars.",
  },
  {
    id: "earth-orbit-speed",
    question: "How fast does Earth travel around the Sun, in kilometres per second?",
    answer: 30,
    unit: "km/s",
    explanation: "Roughly 30 km/s — about 107,000 km/h without you feeling a thing.",
  },
  {
    id: "swiss-languages",
    question: "How many languages have official national status in Switzerland?",
    answer: 4,
    unit: "languages",
    explanation: "German, French, Italian and Romansh.",
  },
  {
    id: "pyramid-height",
    question: "How tall was the Great Pyramid of Giza when it was new, in metres?",
    answer: 146,
    unit: "metres",
    explanation: "About 146 m originally; the loss of its casing stones leaves it near 139 m today.",
  },
  {
    id: "space-shuttles",
    question: "How many Space Shuttle orbiters flew to space?",
    answer: 5,
    unit: "orbiters",
    explanation: "Columbia, Challenger, Discovery, Atlantis and Endeavour; Enterprise never left the atmosphere.",
  },
  {
    id: "mars-moons",
    question: "How many moons does Mars have?",
    answer: 2,
    unit: "moons",
    explanation: "Phobos and Deimos — fear and dread, named after the horses of the war god's chariot.",
  },
  {
    id: "rugby-players",
    question: "How many players from one rugby union team are on the pitch at kick-off?",
    answer: 15,
    unit: "players",
    explanation: "Eight forwards and seven backs; rugby league uses 13.",
  },
  {
    id: "bee-wings",
    question: "How many wings does a honeybee have in total?",
    answer: 4,
    unit: "wings",
    explanation: "Two pairs that hook together in flight and beat over 200 times a second.",
  },
  {
    id: "germany-neighbours",
    question: "How many countries share a land border with Germany?",
    answer: 9,
    unit: "countries",
    explanation: "Denmark, Poland, Czechia, Austria, Switzerland, France, Luxembourg, Belgium and the Netherlands.",
  },
  {
    id: "great-wall-km",
    question: "The official survey puts the Great Wall of China's total length at about how many kilometres?",
    answer: 21196,
    unit: "km",
    explanation: "A 2012 state survey measured all branches at 21,196 km — over half the equator.",
  },
  {
    id: "spider-legs",
    question: "How many legs does a spider have?",
    answer: 8,
    unit: "legs",
    explanation: "Four pairs — insects have six; counting eight legs is the quickest spider check there is.",
  },
  {
    id: "harry-potter-books",
    question: "How many books are in the main Harry Potter series?",
    answer: 7,
    unit: "books",
    explanation: "One school year each, from Philosopher's Stone to Deathly Hallows.",
  },
];
