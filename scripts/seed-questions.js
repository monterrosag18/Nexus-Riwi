const { db } = require('@vercel/postgres');

const questions = [
  // --- PROGRAMMING (10) ---
  { q: "Which HTML element is used for the largest heading?", options: ["<h6>", "<head>", "<h1>", "<header>"], correct: 2, type: "code", difficulty: 1 },
  { q: "Which symbol is used for comments in JavaScript?", options: ["//", "/* */", "#", "Both // and /* */"], correct: 3, type: "code", difficulty: 1 },
  { q: "What does SQL stand for?", options: ["System Query Language", "Structured Query Language", "Simple Query Language", "Stable Query Logic"], correct: 1, type: "code", difficulty: 2 },
  { q: "How do you declare a variable in ES6?", options: ["var", "let", "const", "Both let and const"], correct: 3, type: "code", difficulty: 2 },
  { q: "Which array method adds an element to the end?", options: ["pop()", "shift()", "push()", "unshift()"], correct: 2, type: "code", difficulty: 1 },
  { q: "What is the result of '2' + 2 in JavaScript?", options: ["4", "'22'", "undefined", "NaN"], correct: 1, type: "code", difficulty: 2 },
  { q: "In CSS, what property changes the text color?", options: ["font-color", "text-style", "color", "background-color"], correct: 2, type: "code", difficulty: 1 },
  { q: "Which company developed Java?", options: ["Microsoft", "Oracle", "Sun Microsystems", "Google"], correct: 2, type: "code", difficulty: 2 },
  { q: "What is the default value of a boolean in many languages?", options: ["true", "false", "null", "0"], correct: 1, type: "code", difficulty: 1 },
  { q: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"], correct: 1, type: "code", difficulty: 1 },

  // --- ENGLISH (10) ---
  { q: "Which is the correct plural of 'Child'?", options: ["Childs", "Childrens", "Children", "Childes"], correct: 2, type: "english", difficulty: 1 },
  { q: "Identify the synonym for 'Fast'.", options: ["Slow", "Quick", "Brave", "Quiet"], correct: 1, type: "english", difficulty: 1 },
  { q: "Choose the correct sentence.", options: ["He don't like appies.", "He doesn't likes apples.", "He doesn't like apples.", "He not like apples."], correct: 2, type: "english", difficulty: 2 },
  { q: "What is the past tense of 'Go'?", options: ["Goed", "Went", "Gone", "Going"], correct: 1, type: "english", difficulty: 1 },
  { q: "Which word is a verb?", options: ["Blue", "Quickly", "Run", "Happiness"], correct: 2, type: "english", difficulty: 1 },
  { q: "It ____ raining yesterday.", options: ["is", "were", "was", "will"], correct: 2, type: "english", difficulty: 1 },
  { q: "Opposite of 'Difficult'?", options: ["Hard", "Easy", "Complex", "Simple"], correct: 1, type: "english", difficulty: 1 },
  { q: "Select the correctly spelled word.", options: ["Recieve", "Receive", "Receve", "Reseive"], correct: 1, type: "english", difficulty: 2 },
  { q: "____ you like some coffee?", options: ["Would", "Do", "Are", "Will"], correct: 0, type: "english", difficulty: 1 },
  { q: "A person who designs buildings is an ____.", options: ["Artist", "Engineer", "Architect", "Builder"], correct: 2, type: "english", difficulty: 2 },

  // --- HABILIDADES PARA LA VIDA / SOFT SKILLS (10) ---
  { q: "What is a key part of active listening?", options: ["Interrupting", "Checking your phone", "Eye contact", "Looking away"], correct: 2, type: "soft-skills", difficulty: 1 },
  { q: "What does 'Empathy' mean?", options: ["Feeling sorry", "Understanding others' feelings", "Ignoring problems", "Thinking of yourself"], correct: 1, type: "soft-skills", difficulty: 1 },
  { q: "How should you handle constructive criticism?", options: ["Get angry", "Ignore it", "Listen and learn", "Argue back"], correct: 2, type: "soft-skills", difficulty: 1 },
  { q: "Teamwork requires ____.", options: ["Competition", "Communication", "Secrets", "Isolation"], correct: 1, type: "soft-skills", difficulty: 1 },
  { q: "When solving a problem, what is the first step?", options: ["Panic", "Blame others", "Identify the problem", "Guess the answer"], correct: 2, type: "soft-skills", difficulty: 2 },
  { q: "Time management helps to ____.", options: ["Stress more", "Waste time", "Be productive", "Procrastinate"], correct: 2, type: "soft-skills", difficulty: 1 },
  { q: "A good leader ____.", options: ["Shouts at people", "Takes all credit", "Encourages others", "Works alone"], correct: 2, type: "soft-skills", difficulty: 2 },
  { q: "Resilience is the ability to ____.", options: ["Give up", "Recover from failure", "Avoid risks", "Stay angry"], correct: 1, type: "soft-skills", difficulty: 2 },
  { q: "Flexibility at work means ____.", options: ["Sticking to one plan", "Adapting to change", "Refusing to help", "Working less"], correct: 1, type: "soft-skills", difficulty: 1 },
  { q: "Conflict resolution aiming for a 'Win-Win' means ____.", options: ["One person wins", "Both lose", "Compromise for mutual benefit", "Avoiding the person"], correct: 2, type: "soft-skills", difficulty: 2 }
];

async function seed() {
  const client = await db.connect();
  console.log('Seeding questions...');
  
  try {
    // Clear existing
    await client.sql`DELETE FROM questions;`;
    
    for (const q of questions) {
      await client.sql`
        INSERT INTO questions (q, options, correct, type, difficulty)
        VALUES (${q.q}, ${JSON.stringify(q.options)}, ${q.correct}, ${q.type}, ${q.difficulty});
      `;
    }
    console.log('Successfully seeded 30 questions.');
  } catch (e) {
    console.error('Seed failed:', e);
  } finally {
    await client.end();
  }
}

seed();
