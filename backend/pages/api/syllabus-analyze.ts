import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import formidable from 'formidable'
import fs from 'fs'
import pdfParse from 'pdf-parse'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Configure Next.js to disable body parsing
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      filter: ({ mimetype }) => {
        return mimetype && (mimetype.includes('pdf') || mimetype.includes('image'))
      }
    })

    const [fields, files] = await form.parse(req)
    const file = Array.isArray(files.file) ? files.file[0] : files.file

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    let extractedText = ''
    
    if (file.mimetype === 'application/pdf') {
      const pdfBuffer = fs.readFileSync(file.filepath)
      const pdfData = await pdfParse(pdfBuffer)
      extractedText = pdfData.text
      fs.unlinkSync(file.filepath) // Clean up
    } else if (file.mimetype?.startsWith('image/')) {
      // Handle image syllabus
      const imageBuffer = fs.readFileSync(file.filepath)
      const base64Image = imageBuffer.toString('base64')
      fs.unlinkSync(file.filepath) // Clean up
      
      const imageAnalysis = await analyzeSyllabusImage(base64Image, file)
      return res.status(200).json(imageAnalysis)
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ error: 'No text could be extracted from the document' })
    }

    const syllabusAnalysis = await analyzeSyllabus(extractedText, file.originalFilename || 'syllabus.pdf')
    
    res.status(200).json(syllabusAnalysis)
  } catch (error) {
    console.error('Syllabus analysis error:', error)
    res.status(500).json({ 
      error: 'Failed to analyze syllabus',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function analyzeSyllabus(text: string, fileName: string) {
  const systemPrompt = `You are a specialized AI assistant for analyzing academic syllabi. Extract structured information from course syllabi and return comprehensive data about the course.

SYLLABUS ANALYSIS TASKS:
1. Course Information: Course name, code, instructor, semester, credits
2. Schedule: Class times, locations, recurring meetings
3. Important Dates: Exams, assignments, project deadlines, holidays
4. Grading: Grade breakdown, policies, late submission rules
5. Assignments: All assignments with due dates and descriptions
6. Exams: Midterms, finals, quizzes with dates and formats
7. Reading List: Required readings, chapters, articles
8. Policies: Attendance, academic integrity, communication

ANALYSIS REQUIREMENTS:
- Extract ALL dates in multiple formats (e.g., "March 15", "3/15/2024", "Week 8")
- Identify recurring patterns (weekly assignments, bi-weekly quizzes)
- Prioritize deadlines by importance (exams > assignments > readings)
- Calculate study time recommendations based on workload
- Flag potential conflicts or heavy workload periods

Return ONLY valid JSON in this exact format:
{
  "courseInfo": {
    "courseName": "string",
    "courseCode": "string", 
    "instructor": "string",
    "semester": "string",
    "credits": number,
    "description": "string"
  },
  "schedule": {
    "classTimes": [
      {
        "day": "string",
        "startTime": "string",
        "endTime": "string",
        "location": "string",
        "type": "lecture|lab|discussion"
      }
    ],
    "officeHours": [
      {
        "day": "string",
        "startTime": "string", 
        "endTime": "string",
        "location": "string"
      }
    ]
  },
  "importantDates": [
    {
      "title": "string",
      "date": "string",
      "type": "exam|assignment|project|holiday|deadline",
      "priority": "high|medium|low",
      "description": "string",
      "reminderDays": number
    }
  ],
  "assignments": [
    {
      "title": "string",
      "dueDate": "string",
      "description": "string",
      "points": number,
      "type": "homework|project|essay|presentation",
      "estimatedHours": number
    }
  ],
  "exams": [
    {
      "title": "string",
      "date": "string",
      "time": "string",
      "location": "string",
      "format": "multiple_choice|essay|mixed|online",
      "weight": number,
      "topics": ["string"]
    }
  ],
  "readings": [
    {
      "title": "string",
      "dueDate": "string",
      "chapters": "string",
      "estimatedHours": number,
      "priority": "required|recommended|optional"
    }
  ],
  "grading": {
    "breakdown": [
      {
        "category": "string",
        "percentage": number,
        "description": "string"
      }
    ],
    "policies": ["string"],
    "latePenalty": "string"
  },
  "analysis": {
    "workloadLevel": "light|moderate|heavy|very_heavy",
    "peakWeeks": ["string"],
    "recommendedStudyHours": number,
    "conflictWarnings": ["string"],
    "successTips": ["string"]
  },
  "summary": "string",
  "aiModel": "gpt-5"
}`

  const userPrompt = `Please analyze this syllabus and extract all relevant information:

${text}

Focus on:
1. Extracting ALL dates and deadlines
2. Identifying the course structure and requirements
3. Calculating workload and study recommendations
4. Flagging important dates that need reminders
5. Providing actionable insights for student success`

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: { type: "json_object" },
  })

  const aiResponse = response.choices[0].message.content
  
  if (!aiResponse) {
    throw new Error('No response from AI')
  }

  try {
    const analysis = JSON.parse(aiResponse)
    
    // Enhance the analysis with metadata
    const enhancedAnalysis = {
      ...analysis,
      fileName: fileName,
      extractedAt: new Date().toISOString(),
      wordCount: text.length,
      aiModel: 'gpt-5'
    }

    return enhancedAnalysis
  } catch (parseError) {
    console.error('Failed to parse AI response:', parseError)
    throw new Error('Failed to parse syllabus analysis')
  }
}

async function analyzeSyllabusImage(base64Image: string, file: any) {
  const systemPrompt = `You are a specialized AI assistant for analyzing academic syllabi from images. Extract structured information from course syllabi and return comprehensive data about the course.

SYLLABUS ANALYSIS TASKS:
1. Course Information: Course name, code, instructor, semester, credits
2. Schedule: Class times, locations, recurring meetings
3. Important Dates: Exams, assignments, project deadlines, holidays
4. Grading: Grade breakdown, policies, late submission rules
5. Assignments: All assignments with due dates and descriptions
6. Exams: Midterms, finals, quizzes with dates and formats
7. Reading List: Required readings, chapters, articles
8. Policies: Attendance, academic integrity, communication

ANALYSIS REQUIREMENTS:
- Extract ALL dates in multiple formats (e.g., "March 15", "3/15/2024", "Week 8")
- Identify recurring patterns (weekly assignments, bi-weekly quizzes)
- Prioritize deadlines by importance (exams > assignments > readings)
- Calculate study time recommendations based on workload
- Flag potential conflicts or heavy workload periods

Return ONLY valid JSON in this exact format:
{
  "courseInfo": {
    "courseName": "string",
    "courseCode": "string", 
    "instructor": "string",
    "semester": "string",
    "credits": number,
    "description": "string"
  },
  "schedule": {
    "classTimes": [
      {
        "day": "string",
        "startTime": "string",
        "endTime": "string",
        "location": "string",
        "type": "lecture|lab|discussion"
      }
    ],
    "officeHours": [
      {
        "day": "string",
        "startTime": "string", 
        "endTime": "string",
        "location": "string"
      }
    ]
  },
  "importantDates": [
    {
      "title": "string",
      "date": "string",
      "type": "exam|assignment|project|holiday|deadline",
      "priority": "high|medium|low",
      "description": "string",
      "reminderDays": number
    }
  ],
  "assignments": [
    {
      "title": "string",
      "dueDate": "string",
      "description": "string",
      "points": number,
      "type": "homework|project|essay|presentation",
      "estimatedHours": number
    }
  ],
  "exams": [
    {
      "title": "string",
      "date": "string",
      "time": "string",
      "location": "string",
      "format": "multiple_choice|essay|mixed|online",
      "weight": number,
      "topics": ["string"]
    }
  ],
  "readings": [
    {
      "title": "string",
      "dueDate": "string",
      "chapters": "string",
      "estimatedHours": number,
      "priority": "required|recommended|optional"
    }
  ],
  "grading": {
    "breakdown": [
      {
        "category": "string",
        "percentage": number,
        "description": "string"
      }
    ],
    "policies": ["string"],
    "latePenalty": "string"
  },
  "analysis": {
    "workloadLevel": "light|moderate|heavy|very_heavy",
    "peakWeeks": ["string"],
    "recommendedStudyHours": number,
    "conflictWarnings": ["string"],
    "successTips": ["string"]
  },
  "summary": "string",
  "aiModel": "gpt-5"
}`

  const userPrompt = `Please analyze this syllabus image and extract all relevant information. Focus on reading text clearly and identifying all dates, deadlines, and course requirements.`

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      { role: "system", content: systemPrompt },
      { 
        role: "user", 
        content: [
          { type: "text", text: userPrompt },
          {
            type: "image_url",
            image_url: {
              url: `data:${file.mimetype};base64,${base64Image}`
            }
          }
        ]
      }
    ],
    response_format: { type: "json_object" },
  })

  const aiResponse = response.choices[0].message.content
  
  if (!aiResponse) {
    throw new Error('No response from AI')
  }

  try {
    const analysis = JSON.parse(aiResponse)
    
    // Enhance the analysis with metadata
    const enhancedAnalysis = {
      ...analysis,
      fileName: file.originalFilename || 'syllabus.png',
      extractedAt: new Date().toISOString(),
      aiModel: 'gpt-5'
    }

    return enhancedAnalysis
  } catch (parseError) {
    console.error('Failed to parse AI response:', parseError)
    throw new Error('Failed to parse syllabus analysis')
  }
}
