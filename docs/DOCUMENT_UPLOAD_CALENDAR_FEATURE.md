# Document Upload + Question + Calendar Feature

## Feature Overview
Users can now upload a document (like a syllabus), ask a question about it (e.g., "what is the final exam date?"), and have the AI automatically extract the date and add it to their calendar - all in one prompt!

## How It Works

### User Flow
1. **Upload Document**: User clicks upload button and selects a file (PDF or image)
2. **Ask Question**: User types a question like "What is the final exam date?" or "When is the deadline?"
3. **AI Processing**: 
   - Document content is extracted (PDF text or image OCR)
   - Document is uploaded to Firebase Storage
   - Document metadata is saved to Firestore
   - AI analyzes the document content + user question
   - AI extracts relevant dates and information
4. **Automatic Calendar Creation**: 
   - If a date is found and user wants it added, AI creates a `calendarEvent` in the response
   - System automatically adds the event to Google Calendar
   - User sees confirmation message

### Example Usage
```
User: [Uploads syllabus.pdf]
User: "What is the final exam date? Add it to my calendar."

AI: "I found the final exam date in your syllabus: December 15, 2025 at 2:00 PM. I've added it to your calendar!"
[Calendar event automatically created]
```

## Technical Implementation

### Frontend (`frontend/app/chat/page.tsx`)

1. **File Upload** (`handleFileUpload`):
   - Validates file type (PDF/images) and size (10MB max)
   - Stores file in `pendingFile` state

2. **Message Sending** (`handleSendMessage`):
   - Checks if `pendingFile` exists
   - If file exists, calls `processPendingFile(file, userPrompt)`

3. **File Processing** (`processPendingFile`):
   - Extracts file content using `readFileContent(file)`
   - Uploads to Firebase Storage via `storageService.uploadFile()`
   - Saves document metadata to Firestore via `documentService.saveDocument()`
   - Calls `analyzeDocumentWithAI(file, content, userPrompt)`

4. **AI Analysis** (`analyzeDocumentWithAI`):
   - Builds prompt with document content + user question
   - Sends to `/api/analyze` endpoint
   - Receives analysis with `calendarEvent` if date found
   - Automatically calls `autoCreateFromMessage(analysis)` to create calendar event
   - Shows AI response immediately

5. **Calendar Creation** (`autoCreateFromMessage`):
   - Checks if `analysis.calendarEvent` exists
   - Validates dates and converts to Date objects
   - Calls `calendarService.addToGoogleCalendar()` to create event
   - Shows success/error toast

### Backend (`backend/pages/api/analyze.ts`)

The `/api/analyze` endpoint:
- Receives document content + user prompt
- Uses GPT-4o-mini to analyze content
- Extracts dates and creates `calendarEvent` object when appropriate
- Returns JSON with:
  - `aiResponse`: Natural language response
  - `calendarEvent`: Event object with title, startTime, endTime, description
  - `reminder`: Optional reminder object
  - Other analysis data

### AI Prompt Enhancement

The prompt now explicitly instructs the AI to:
- Extract dates from documents when asked
- Create calendar events with proper formatting
- Use reasonable default times (9 AM for exams, 11:59 PM for deadlines)
- Set appropriate durations (2-3 hours for exams, 1 hour for meetings)

## Firestore Integration

### Document Storage
- **Collection**: `documents`
- **Fields**: name, type, size, storageId, downloadUrl, content, summary, tags, category, userId, uploadedAt, updatedAt
- **Security**: Users can only access their own documents

### File Storage
- **Location**: Firebase Storage at `users/{userId}/{timestamp}_{filename}`
- **Content**: Full file content stored (truncated to 800KB for Firestore if needed)

### Message Storage
- **Collection**: `conversations`
- **Fields**: userId, title, messages[], createdAt, updatedAt
- **Security**: Users can only access their own conversations

## Testing

### Test Cases
1. ✅ Upload PDF syllabus, ask "What is the final exam date? Add it to calendar"
2. ✅ Upload image of schedule, ask "When is the meeting?"
3. ✅ Upload document, ask general question (no calendar creation)
4. ✅ Verify Firestore saves document correctly
5. ✅ Verify calendar event is created automatically

### Error Handling
- File size validation (10MB max)
- File type validation (PDF/images only)
- Empty content detection
- Firestore save errors are caught and logged
- Calendar creation errors don't block AI response

## Future Enhancements
- Support for more file types (Word docs, Excel)
- Batch processing multiple dates from one document
- Smart event titles based on document context
- Reminder creation for deadlines
- Recurring events for weekly schedules
