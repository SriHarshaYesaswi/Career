import express from "express";
import app from "./app";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import connectDB from "./config/db";
import { protect } from "./middleware/authMiddleware";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

// Initialize Gemini SDK
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Helper to interact with Gemini safely with exponential backoff and model fallbacks
async function askGemini(systemInstruction: string, prompt: string): Promise<string> {
  if (!ai) {
    return JSON.stringify({
      error: "Gemini API key is not configured. Please supply a valid GEMINI_API_KEY in your environment."
    });
  }

  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    let attempts = 3;
    let delay = 1000;
    
    while (attempts > 0) {
      try {
        console.log(`Attempting Gemini API call on model ${model} (${attempts} attempts remaining)...`);
        const response = await ai.models.generateContent({
          model: model,
          contents: `${systemInstruction}\n\nUser Input: ${prompt}`,
        });
        
        if (response.text) {
          console.log(`Successfully generated content using model: ${model}`);
          return response.text;
        }
      } catch (error: any) {
        lastError = error;
        const errorMsg = error.message || String(error);
        console.warn(`Gemini API Error on model ${model}: ${errorMsg}`);
        
        const status = error.status || (error.error && error.error.code);
        const isTransient = status === 503 || status === 429 || 
                            errorMsg.includes("503") || errorMsg.includes("429") ||
                            errorMsg.toLowerCase().includes("high demand") || 
                            errorMsg.toLowerCase().includes("temporary") ||
                            errorMsg.toLowerCase().includes("rate limit") ||
                            errorMsg.toLowerCase().includes("resource_exhausted") ||
                            errorMsg.toLowerCase().includes("unavailable");
                            
        if (isTransient) {
          attempts--;
          if (attempts > 0) {
            console.log(`Transient error detected on ${model}. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
            continue;
          }
        } else {
          console.log(`Non-transient error on ${model}. Trying next model...`);
          break;
        }
      }
    }
  }

  console.error("All Gemini models and retry attempts failed. Last error details:", lastError);
  throw lastError || new Error("Failed to contact Gemini API after multiple attempts across fallback models.");
}

// Helper to strip markdown code fences from Gemini responses
function parseJsonResponse(text: string): any {
  let clean = text.trim();
  if (clean.startsWith("```json")) clean = clean.substring(7);
  if (clean.startsWith("```")) clean = clean.substring(3);
  if (clean.endsWith("```")) clean = clean.substring(0, clean.length - 3);
  return JSON.parse(clean.trim());
}

// -------------------------------------------------------------
// SECURE BACKEND AI API ENDPOINTS
// -------------------------------------------------------------

// 1. Smart Notes Generator & Flashcard Hub
app.post("/api/ai/notes-generator", protect, async (req, res) => {
  try {
    const { content, title } = req.body;
    if (!content) return res.status(400).json({ error: "Content is required" });

    const systemPrompt = `You are an elite academic AI assistant. Analyze the textbook notes or lecture transcription provided and generate a structured JSON containing:
1. summary (a rich paragraph summarizing primary arguments)
2. keyConcepts (an array of 3-5 items with title and definition)
3. questions (an array of 3-5 high-probability exam questions with descriptive answers)
4. flashcards (an array of 4-6 flashcards, each containing question and answer strings)

Your entire output MUST be valid raw JSON. Do not include markdown code block formatting like \`\`\`json. Match this structure exactly:
{
  "summary": "...",
  "keyConcepts": [{"title": "...", "description": "..."}],
  "questions": [{"id": "...", "question": "...", "answer": "..."}],
  "flashcards": [{"question": "...", "answer": "..."}]
}`;

    const promptText = `Title: ${title || "Lecture Notes"}\nContent: ${content}`;
    
    if (!ai) {
      return res.json({
        summary: `This lecture notes study set covers ${title || "the subject matter"} in detail.`,
        keyConcepts: [
          { title: "Primary Paradigm", description: "The central core framework governing all subsequent structural designs." },
          { title: "Latency Bound", description: "The architectural limit in operation processing speed governed by transport delay." },
          { title: "Orthogonality", description: "A system design principle where changing one element does not ripple or impact others." }
        ],
        questions: [
          { id: "q_1", question: "Explain the fundamental trade-off between throughput and response latency.", answer: "Throughput measures aggregate capacity over a timeline, while latency measures singular transport delay." },
          { id: "q_2", question: "How does decentralization handle split-brain partitions?", answer: "By utilizing quorum consensus protocols ensuring a majority vote before writing records." }
        ],
        flashcards: [
          { question: "What is Idempotency?", answer: "An operation where executing multiple times produces the same result as running it once." },
          { question: "What is a Bloom Filter?", answer: "A space-efficient probabilistic data structure used to test whether an element is in a set." }
        ]
      });
    }

    const responseText = await askGemini(systemPrompt, promptText);
    res.json(parseJsonResponse(responseText));
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to process notes" });
  }
});

// 2. Doubt Solver Endpoint
app.post("/api/ai/doubt-solver", protect, async (req, res) => {
  try {
    const { question, subjectContext } = req.body;
    if (!question) return res.status(400).json({ error: "Question is required" });

    const systemPrompt = `You are Socrates College AI, a dedicated professor. Solve the student's doubt step-by-step.
Your response MUST be formatted strictly with clean Markdown. Provide:
- **Direct Solution Summary** 
- **In-Depth Scientific/Theoretical Explanation**
- **Concrete Example Pattern**
- **A Practice Exercise Problem**`;

    const promptText = `Subject: ${subjectContext || "Computer Science / General"}\nStudent's Doubt: ${question}`;

    if (!ai) {
      return res.json({ answer: `### Solution Summary\nThis is a simulated AI solver response because the \`GEMINI_API_KEY\` is not currently initialized.\n\n### Explanation\nTo answer **"${question}"**, let's understand the underlying core concepts.` });
    }

    const answer = await askGemini(systemPrompt, promptText);
    res.json({ answer });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to solve doubt" });
  }
});

// 3. Exam Predictor Dashboard
app.post("/api/ai/exam-predictor", protect, async (req, res) => {
  try {
    const { courseCode, courseName, previousWeightsText } = req.body;
    
    const systemPrompt = `You are a university academic registrar analytics engine. Analyze the course parameters and predict important topics and potential exam questions.
Provide your response strictly in JSON format. Match this exact JSON schema:
{
  "predictedFocusTopics": [
    { "topicName": "...", "probability": 92, "reason": "...", "difficulty": "Hard" }
  ],
  "samplePredictedQuestions": [
    { "question": "...", "weightage": 10, "markingScheme": "..." }
  ],
  "studyStrategyTip": "..."
}`;

    const promptText = `Course: ${courseCode} - ${courseName}\nExtra Historical Context: ${previousWeightsText || "Standard university syllabus distribution layout"}`;

    if (!ai) {
      return res.json({
        predictedFocusTopics: [
          { topicName: "Sliding Window Handshakes & Flow Controllers", probability: 95, reason: "Invariably examined heavily in Semester exams.", difficulty: "Hard" },
          { topicName: "LR(1) Parsing Table Construction", probability: 88, reason: "A core compiler design pillar, highly weighted in midterm examinations.", difficulty: "Medium" }
        ],
        samplePredictedQuestions: [
          { question: "Design an LR(1) parser DFA state graph for a simple assignment grammar.", weightage: 15, markingScheme: "5 marks for grammar items expansion, 5 marks for states transition DFA, 5 marks for table conflict analysis." }
        ],
        studyStrategyTip: "Spend 60% of your time mastering standard algorithms and drawing DFA state trees."
      });
    }

    const responseText = await askGemini(systemPrompt, promptText);
    res.json(parseJsonResponse(responseText));
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to predict exam metrics" });
  }
});

// 4. Learning Path / Smart Resource Hub Recommendation
app.post("/api/ai/learning-path", protect, async (req, res) => {
  try {
    const { careerGoal, skillsText, weakSubjects } = req.body;

    const systemPrompt = `You are a senior tech career architect. Suggest a robust personalized learning path and resource recommendations.
Format your response strictly in cohesive JSON. Match this JSON layout exactly:
{
  "recommendedPathName": "...",
  "weeks": [
    { "weekRange": "Weeks 1-2", "focus": "...", "tasks": ["...", "..."], "resources": ["...", "..."] }
  ],
  "suggestedBooks": ["...", "..."],
  "freeOnlineCourses": [
    { "title": "...", "platform": "..." }
  ]
}`;

    const promptText = `Professional Goal: ${careerGoal}\nCurrent Skills: ${skillsText}\nStruggles or Weak Subjects: ${weakSubjects || "None"}`;

    if (!ai) {
      return res.json({
        recommendedPathName: `Bespoke Career Path for: ${careerGoal}`,
        weeks: [
          { weekRange: "Weeks 1-2", focus: "Core Foundations Recovery", tasks: ["Master baseline syntax structure", "Resolve weak nodes in basic logic controls"], resources: ["Official Documentation Guides", "Standard University Lectures YouTube Playlist"] },
          { weekRange: "Weeks 3-5", focus: "Architecture & Integration", tasks: ["Apply standard database bindings", "Formulate localized context engines in code"], resources: ["Academic Sandbox Tutorials", "Standard Interactive Exercises Sheets"] },
          { weekRange: "Weeks 6-8", focus: "Portfolio Readiness", tasks: ["Optimize bundle packaging", "Host container on Cloud Run for live review"], resources: ["Deployment Best Practices Hub", "Open Source Boilerplate GitHub Repo"] }
        ],
        suggestedBooks: ["The Pragmatic Programmer by David Thomas", "Introduction to Algorithms (CLRS)"],
        freeOnlineCourses: [
          { title: "Full Stack Web Development Essentials", platform: "FreeCodeCamp Online Portal" },
          { title: "Introduction to Artificial Intelligence Systems", platform: "Stanford Coursework Online" }
        ]
      });
    }

    const responseText = await askGemini(systemPrompt, promptText);
    res.json(parseJsonResponse(responseText));
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate learning path" });
  }
});

// 5. Digital Twin / AI Life Coach Intelligence Analyzer
app.post("/api/ai/digital-twin", protect, async (req, res) => {
  try {
    const { studentProfile, academics, projects, goals, skills } = req.body;

    const systemPrompt = `You are the ultimate personalized "Student Digital Twin" - a highly analytical AI who knows the student's performance logs.
Structure your response as a valid JSON with:
1. readinessScore (Placement Readiness percentage, 0-100)
2. strengths (Array of strings)
3. coreWeaknesses (Array of strings)
4. gapAnalysis (A paragraph explaining how to bridge the gap)
5. directRecommendations (Array of actionable bullets)

Return ONLY valid JSON. Match this schema exactly:
{
  "readinessScore": 85,
  "strengths": ["...", "..."],
  "coreWeaknesses": ["...", "..."],
  "gapAnalysis": "...",
  "directRecommendations": ["...", "..."]
}`;

    const promptText = `
Student Portfolio Data:
- Name: ${studentProfile?.name || "Student"}
- Target Profession: ${studentProfile?.profession || "CS Engineering"}
- Course Status: ${JSON.stringify(academics || [])}
- Active Project List: ${JSON.stringify(projects || [])}
- Primary Career Goals: ${JSON.stringify(goals || [])}
- Tracked Skills Array: ${JSON.stringify(skills || [])}
`;

    if (!ai) {
      return res.json({
        readinessScore: 82,
        strengths: [
          "Healthy learning streak with a high daily productivity score",
          "Competent full-stack portfolio projects",
          "Strong skills listed in React, Java, DSA, and Git"
        ],
        coreWeaknesses: [
          "Low grade or attendance tracking in some courses",
          "Unfinished milestones on long-term goals"
        ],
        gapAnalysis: "Your overall trajectory matches industry thresholds for top tier Software Engineer Internships. The primary target is securing referral opportunities and passing technical screening.",
        directRecommendations: [
          "Maintain course attendance to bypass university eligibility caps.",
          "Finalize portfolio projects to introduce secure encryption showcases to recruiters.",
          "Complete cloud certification milestones to boost cloud-native posture on your resume."
        ]
      });
    }

    const responseText = await askGemini(systemPrompt, promptText);
    res.json(parseJsonResponse(responseText));
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to analyze student twin model" });
  }
});

// 6. ATS Resume Keyword Scanner API
app.post("/api/ai/resume-scanner", protect, async (req, res) => {
  try {
    const { resumeText, targetJobRole } = req.body;
    if (!resumeText) return res.status(400).json({ error: "Resume text or details are required" });

    const systemPrompt = `You are a professional corporate ATS recruiter tool.
Analyze the provided resume details against the core target job role and compute:
1. atsScore (percentage overall match score, 0-100)
2. matchedKeywords (array of correct technologies/skills matched)
3. missingKeywords (critical tools the recruiter looks for that are absent in resume)
4. suggestionBulletPoints (3 actionable resume editing tips)

Return exclusively valid JSON. Match this structure:
{
  "atsScore": 76,
  "matchedKeywords": ["...", "..."],
  "missingKeywords": ["...", "..."],
  "suggestionBulletPoints": ["...", "..."]
}`;

    const promptText = `Target Role: ${targetJobRole || "Software Engineer Intern"}\nResume Text:\n${resumeText}`;

    if (!ai) {
      return res.json({
        atsScore: 78,
        matchedKeywords: ["React.js", "Java", "Python", "Data Structures", "Git"],
        missingKeywords: ["CI/CD Pipeline Configurations", "Docker Containerization", "Unit Testing Frameworks"],
        suggestionBulletPoints: [
          "Quantify bullet points with structural metrics.",
          "Include a dedicated cloud deployment section.",
          "List automated unit testing protocols or logging practices."
        ]
      });
    }

    const responseText = await askGemini(systemPrompt, promptText);
    res.json(parseJsonResponse(responseText));
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to analyze resume details" });
  }
});

// 7. Interactive Gamified Career Universe & Multiverse API Endpoint
app.post("/api/ai/career-universe", protect, async (req, res) => {
  try {
    const { task, payload } = req.body;
    if (!task) return res.status(400).json({ error: "Task type is required" });

    if (task === "multiverse_comparison") {
      const { sourceUniverse, targetUniverse, currentSkills, currentProjects } = payload;
      const systemPrompt = `You are a Sci-Fi Career Multiverse Quantum Computer. Compare Universe A (${sourceUniverse}) against Universe B (${targetUniverse}).
Format your output as a single valid JSON:
{
  "compatibilityMultiplier": 84,
  "quantumGapStatement": "...",
  "missingVibeSkills": ["...", "...", "..."],
  "missingProjectNodes": ["...", "...", "..."],
  "recommendedActionItems": ["...", "...", "..."]
}
Only return raw JSON. No markdown wrappers.`;

      const promptText = `Source Path: ${sourceUniverse}\nTarget Path: ${targetUniverse}\nCurrent Skills: ${JSON.stringify(currentSkills || [])}\nCurrent Projects: ${JSON.stringify(currentProjects || [])}`;

      if (!ai) {
        return res.json({
          compatibilityMultiplier: 65,
          quantumGapStatement: `Transitioning from ${sourceUniverse} to ${targetUniverse} represents a significant quantum divergence.`,
          missingVibeSkills: ["Statistical Inference & Hypothesis Testing", "Advanced SQL Window Functions", "Pandas & Numpy Vectorization"],
          missingProjectNodes: ["Large-scale EDA on structural financial logs", "Real-time regression estimator dashboard"],
          recommendedActionItems: ["Pivot your next coding activity toward the target domain.", "Adjust portfolio to highlight relevant skills.", "Complete a fast 15-hour micro-course on critical missing nodes."]
        });
      }

      const responseText = await askGemini(systemPrompt, promptText);
      return res.json(parseJsonResponse(responseText));
    }

    if (task === "simulation") {
      const { targetRole, skills, projects, hoursInvested } = payload;
      const systemPrompt = `You are a Quantum Career Future Simulator. Analyze the student's statistics and calculate target role readiness.
Format output as raw JSON:
{
  "monthsToGoal": 14,
  "percentageComplete": 62,
  "simulationText": "...",
  "fastestPathSuggestions": ["...", "...", "..."]
}
Only return raw JSON. No markdown wraps.`;

      const promptText = `Target Role Goal: ${targetRole}\nCurrent Skills & Levels: ${JSON.stringify(skills || [])}\nCurrent Portfolio: ${JSON.stringify(projects || [])}\nEstimated weekly study time: ${hoursInvested || 15} hours`;

      if (!ai) {
        return res.json({
          monthsToGoal: Math.max(6, Math.floor(18 - (skills ? skills.length * 1.2 : 5))),
          percentageComplete: Math.min(95, Math.floor(35 + (skills ? skills.length * 5 : 20))),
          simulationText: `Running sub-atomic lifetime trajectories... At your current pace of ${hoursInvested || 15} hours/week, you safely bypass major placement hurdles.`,
          fastestPathSuggestions: [
            `Boost weekly learning focus hours to ${Math.floor((hoursInvested || 15) * 1.5)} to truncate the timeline by 4 months.`,
            "Publish your portfolio repositories to active community registries for organic technical reviews.",
            "Complete 2 real-world hackathons to simulate pressurized industry delivery cycles."
          ]
        });
      }

      const responseText = await askGemini(systemPrompt, promptText);
      return res.json(parseJsonResponse(responseText));
    }

    if (task === "hidden_skills") {
      const { activitiesList } = payload;
      const systemPrompt = `You are an elite talent recruiter and skill auditor. Scan everyday student activity lists and uncover overlooked professional soft skills.
Structure response as valid raw JSON:
{
  "detectedSkills": [
    { "skill": "...", "justification": "...", "category": "..." }
  ],
  "professionalAdvice": "..."
}
Return only JSON.`;

      const promptText = `Completed Activities: ${JSON.stringify(activitiesList || [])}`;

      if (!ai) {
        return res.json({
          detectedSkills: [
            { skill: "Cross-Functional Collaboration", justification: "Extracted from organizing team activities.", category: "Leadership & Culture" },
            { skill: "Agile Priority Management", justification: "Extracted from consistent scheduling of tight daily coding blocks.", category: "Operational Scaling" }
          ],
          professionalAdvice: "Create a 'Professional Operations & Leadership' section on your resume to highlight these hidden items."
        });
      }

      const responseText = await askGemini(systemPrompt, promptText);
      return res.json(parseJsonResponse(responseText));
    }

    res.status(400).json({ error: "Invalid task parameter supplied" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to process career universe simulation" });
  }
});

// 8. AI Badge Honor & Daily Work Performance Analysis Endpoint
app.post("/api/ai/badge-honor-analysis", protect, async (req, res) => {
  try {
    const { currentUser, activities, goals, skills, badges } = req.body;
    if (!currentUser) return res.status(400).json({ error: "User profile data is required for daily evaluation." });

    const systemPrompt = `You are the Grand Master of the Professional Badge Cabinet. You analyze a student's daily logged activities, academic records, goals, and skills to verify if they have achieved the honor points for standard badges.
Evaluate recent work and provide:
1. "score": An aggregate daily achievement score out of 100.
2. "analysisReport": A short inspiring paragraph detailing how the student's daily progress meets the badge honor standards.
3. "unlockedBadgeIds": A list of badge IDs matching ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8'].
4. "milestoneInsights": An array of objects showing key badge paths, progress percentage (0-100), status, and customized feedback.
5. "honorPoints": Total honorary points earned today.

Format your output as a single valid JSON:
{
  "score": 88,
  "analysisReport": "...",
  "unlockedBadgeIds": ["b1", "b2"],
  "milestoneInsights": [
    { "title": "...", "progress": 85, "status": "...", "feedback": "..." }
  ],
  "honorPoints": 240
}
Only return raw JSON without markdown syntax blocks.`;

    const promptText = `
Student: ${currentUser.name} (${currentUser.profession})
Current CGPA: ${currentUser.cgpa || "N/A"}
Weekly Focus Target: ${currentUser.hoursInvested || 15} hours
Completed Daily Logs: ${JSON.stringify(activities || [])}
Standard Goals: ${JSON.stringify(goals || [])}
Current Skills: ${JSON.stringify(skills || [])}
Existing Badges: ${JSON.stringify(badges || [])}
`;

    if (!ai) {
      return res.json({
        score: Math.min(100, 75 + (activities ? activities.length * 5 : 10) + (skills ? skills.length * 2 : 5)),
        analysisReport: `Sensational progress observed! Your daily rhythm represents a high-caliber professional trajectory. By maintaining strict logs of tasks and staying aligned with your ${currentUser.profession} goals, you are rapidly accumulating professional badge honors.`,
        unlockedBadgeIds: ["b1", "b2", "b3", "b7"],
        milestoneInsights: [
          { title: "First Milestone", progress: 100, status: "Honored ✓", feedback: "First daily progress logging criteria fully achieved." },
          { title: "Productivity Engine", progress: 100, status: "Honored ✓", feedback: "Active focus & study thresholds successfully exceeded today." },
          { title: "Socrates (Academic Deep)", progress: 100, status: "Honored ✓", feedback: "CGPA and doubt-solving logs meet the master criteria." },
          { title: "Streak Master", progress: 100, status: "Honored ✓", feedback: "Consecutive daily work streaks maintained." }
        ],
        honorPoints: 350
      });
    }

    const responseText = await askGemini(systemPrompt, promptText);
    return res.json(parseJsonResponse(responseText));
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to analyze professional badge honor state." });
  }
});

// -------------------------------------------------------------
// START SERVER
// -------------------------------------------------------------
async function startServer() {
  await connectDB();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend API server running on http://localhost:${PORT}`);
  });
}

startServer();
