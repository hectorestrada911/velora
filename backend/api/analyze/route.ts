import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Create a comprehensive prompt for AI analysis
    const systemPrompt = `You are an intelligent personal assistant that analyzes documents and extracts actionable information. Your job is to:

1. **Understand the content** - What is this document about?
2. **Extract tasks and actions** - What needs to be done?
3. **Identify people** - Who is mentioned or involved?
4. **Find dates and deadlines** - When are things due?
5. **Determine priority** - How urgent is this?
6. **Categorize content** - What type of document is this?
7. **Generate tags** - How should this be organized?
8. **Provide conversational responses** - Be helpful and engaging

Analyze the following content and return a structured JSON response with:
- type: document type (meeting, email, report, note, etc.)
- priority: high/medium/low based on urgency
- confidence: 0.0-1.0 how confident you are in your analysis
- summary: brief summary of the content
- tags: relevant tags for organization
- extractedData: {
    people: array of people mentioned
    dates: array of dates/deadlines found
    actions: array of tasks/actions needed
    topics: array of main topics/projects
  }
- calendarEvent: if this should create a calendar event, provide details
- reminder: if this needs a reminder, provide details
- aiResponse: a conversational, helpful response as if you're talking to the user
- followUpQuestions: array of 2-3 helpful follow-up questions to ask the user

Be intelligent and contextual. If someone says "call John tomorrow about the Q4 deadline", extract:
- people: ["John"]
- dates: ["tomorrow"]
- actions: ["call John about Q4 deadline"]
- topics: ["Q4 deadline"]
- priority: "high" (deadline mentioned)
- reminder: "Call John about Q4 deadline"
- aiResponse: "I'll add 'Call John about Q4 deadline' to your calendar for tomorrow. This sounds important!"
- followUpQuestions: ["What time would you like to call John?", "Should I set a reminder 15 minutes before?"]`;

    const userPrompt = `Please analyze this document content:

${content}

Return only valid JSON, no other text.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini", // Using GPT-5 mini for cost-effectiveness
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent analysis
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse the AI response
    let analysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Failed to parse AI analysis');
    }

    // Validate and enhance the analysis
    const enhancedAnalysis = {
      type: analysis.type || 'document',
      priority: analysis.priority || 'medium',
      confidence: analysis.confidence || 0.8,
      summary: analysis.summary || content.substring(0, 150) + '...',
      tags: analysis.tags || ['document', 'uploaded'],
      extractedData: {
        people: analysis.extractedData?.people || [],
        dates: analysis.extractedData?.dates || [],
        actions: analysis.extractedData?.actions || [],
        topics: analysis.extractedData?.topics || []
      },
      calendarEvent: analysis.calendarEvent || null,
      reminder: analysis.reminder || null,
      aiResponse: analysis.aiResponse || "I've analyzed your content and organized it for you!",
      followUpQuestions: analysis.followUpQuestions || ["Is there anything else you'd like me to help with?", "Would you like me to set any reminders?"],
      aiModel: 'gpt-5-mini',
      analysisTimestamp: new Date().toISOString()
    };

    // Log successful analysis
    console.log(`AI analysis completed for content length: ${content.length}`);
    console.log('Analysis result:', enhancedAnalysis);

    return NextResponse.json(enhancedAnalysis);

  } catch (error) {
    console.error('AI analysis error:', error);
    
    // Return a fallback analysis if AI fails
    const fallbackAnalysis = {
      type: 'document',
      priority: 'medium',
      confidence: 0.6,
      summary: 'AI analysis failed, using fallback parsing',
      tags: ['document', 'fallback'],
      extractedData: {
        people: [],
        dates: [],
        actions: [],
        topics: []
      },
      calendarEvent: null,
      reminder: null,
      aiResponse: "I'm having trouble analyzing this right now, but I've saved it for you.",
      followUpQuestions: ["Would you like to try again?", "Can I help you organize it manually?"],
      error: 'AI analysis failed, using fallback',
      fallback: true
    };

    return NextResponse.json(fallbackAnalysis, { status: 500 });
  }
}
