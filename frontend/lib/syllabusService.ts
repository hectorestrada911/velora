import { storageService } from './storageService'
import { calendarService } from './calendarService'
import { memoryService } from './memoryService'

export interface CourseInfo {
  courseName: string
  courseCode: string
  instructor: string
  semester: string
  credits: number
  description: string
}

export interface ClassTime {
  day: string
  startTime: string
  endTime: string
  location: string
  type: 'lecture' | 'lab' | 'discussion'
}

export interface OfficeHour {
  day: string
  startTime: string
  endTime: string
  location: string
}

export interface Schedule {
  classTimes: ClassTime[]
  officeHours: OfficeHour[]
}

export interface ImportantDate {
  title: string
  date: string
  type: 'exam' | 'assignment' | 'project' | 'holiday' | 'deadline'
  priority: 'high' | 'medium' | 'low'
  description: string
  reminderDays: number
}

export interface Assignment {
  title: string
  dueDate: string
  description: string
  points: number
  type: 'homework' | 'project' | 'essay' | 'presentation'
  estimatedHours: number
}

export interface Exam {
  title: string
  date: string
  time: string
  location: string
  format: 'multiple_choice' | 'essay' | 'mixed' | 'online'
  weight: number
  topics: string[]
}

export interface Reading {
  title: string
  dueDate: string
  chapters: string
  estimatedHours: number
  priority: 'required' | 'recommended' | 'optional'
}

export interface GradingBreakdown {
  category: string
  percentage: number
  description: string
}

export interface Grading {
  breakdown: GradingBreakdown[]
  policies: string[]
  latePenalty: string
}

export interface Analysis {
  workloadLevel: 'light' | 'moderate' | 'heavy' | 'very_heavy'
  peakWeeks: string[]
  recommendedStudyHours: number
  conflictWarnings: string[]
  successTips: string[]
}

export interface SyllabusAnalysis {
  courseInfo: CourseInfo
  schedule: Schedule
  importantDates: ImportantDate[]
  assignments: Assignment[]
  exams: Exam[]
  readings: Reading[]
  grading: Grading
  analysis: Analysis
  summary: string
  fileName: string
  extractedAt: string
  wordCount?: number
  aiModel: string
}

export class SyllabusService {
  private static instance: SyllabusService

  public static getInstance(): SyllabusService {
    if (!SyllabusService.instance) {
      SyllabusService.instance = new SyllabusService()
    }
    return SyllabusService.instance
  }

  async analyzeSyllabus(file: File): Promise<SyllabusAnalysis> {
    try {
      // Upload file to storage first
      const storedFile = await storageService.uploadFile(file)
      
      // Create form data for API
      const formData = new FormData()
      formData.append('file', file)

      // Call syllabus analysis API
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://velora-production.up.railway.app'
      const apiUrl = baseUrl.replace('/api/analyze', '')
      const response = await fetch(`${apiUrl}/api/syllabus-analyze`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Syllabus analysis failed: ${response.status} - ${errorText}`)
      }

      const analysis: SyllabusAnalysis = await response.json()
      
      // Auto-integrate with calendar and reminders
      await this.integrateWithCalendar(analysis)
      await this.createSmartReminders(analysis)
      await this.saveCourseMemory(analysis)

      return analysis
    } catch (error) {
      console.error('Syllabus analysis error:', error)
      throw error
    }
  }

  private async integrateWithCalendar(analysis: SyllabusAnalysis) {
    try {
      // Create recurring class events
      for (const classTime of analysis.schedule.classTimes) {
        const eventTitle = `${analysis.courseInfo.courseCode}: ${classTime.type.charAt(0).toUpperCase() + classTime.type.slice(1)}`
        const eventDescription = `Location: ${classTime.location}\nCourse: ${analysis.courseInfo.courseName}`
        
        await calendarService.addToLocalCalendar({
          title: eventTitle,
          description: eventDescription,
          startTime: this.parseClassTime(classTime.day, classTime.startTime),
          endTime: this.parseClassTime(classTime.day, classTime.endTime),
          location: classTime.location
        })
      }

      // Create exam events
      for (const exam of analysis.exams) {
        await calendarService.addToLocalCalendar({
          title: `Exam: ${exam.title}`,
          description: `Format: ${exam.format}\nLocation: ${exam.location}\nTopics: ${exam.topics.join(', ')}`,
          startTime: new Date(exam.date + ' ' + exam.time),
          endTime: new Date(new Date(exam.date + ' ' + exam.time).getTime() + 2 * 60 * 60 * 1000), // 2 hours
          location: exam.location
        })
      }

      // Create assignment deadlines
      for (const assignment of analysis.assignments) {
        await calendarService.addToLocalCalendar({
          title: `Due: ${assignment.title}`,
          description: `${assignment.description}\nPoints: ${assignment.points}\nType: ${assignment.type}`,
          startTime: new Date(assignment.dueDate),
          endTime: new Date(assignment.dueDate)
        })
      }

      console.log('Calendar integration completed for syllabus')
    } catch (error) {
      console.error('Calendar integration error:', error)
    }
  }

  private async createSmartReminders(analysis: SyllabusAnalysis) {
    try {
      // Create reminders for important dates
      for (const importantDate of analysis.importantDates) {
        if (importantDate.type === 'exam' || importantDate.priority === 'high') {
          const reminderDate = new Date(importantDate.date)
          reminderDate.setDate(reminderDate.getDate() - importantDate.reminderDays)

          await calendarService.createReminder({
            title: `Upcoming: ${importantDate.title}`,
            description: importantDate.description,
            dueDate: reminderDate,
            priority: importantDate.priority,
            category: 'personal'
          })
        }
      }

      // Create study reminders for exams
      for (const exam of analysis.exams) {
        const examDate = new Date(exam.date)
        
        // 1 week before reminder
        const weekBefore = new Date(examDate)
        weekBefore.setDate(weekBefore.getDate() - 7)
        
        await calendarService.createReminder({
          title: `Study for ${exam.title}`,
          description: `Exam in 1 week. Topics: ${exam.topics.join(', ')}`,
          dueDate: weekBefore,
          priority: 'high',
          category: 'personal'
        })

        // 3 days before reminder
        const daysBefore = new Date(examDate)
        daysBefore.setDate(daysBefore.getDate() - 3)
        
        await calendarService.createReminder({
          title: `Final Review: ${exam.title}`,
          description: `Exam in 3 days. Review key concepts and practice problems.`,
          dueDate: daysBefore,
          priority: 'high',
          category: 'personal'
        })
      }

      console.log('Smart reminders created for syllabus')
    } catch (error) {
      console.error('Reminder creation error:', error)
    }
  }

  private async saveCourseMemory(analysis: SyllabusAnalysis) {
    try {
      // Save course information to memory
      const courseMemory = `Course: ${analysis.courseInfo.courseName} (${analysis.courseInfo.courseCode})
Instructor: ${analysis.courseInfo.instructor}
Credits: ${analysis.courseInfo.credits}
Semester: ${analysis.courseInfo.semester}

Key Information:
- Workload Level: ${analysis.analysis.workloadLevel}
- Recommended Study Hours: ${analysis.analysis.recommendedStudyHours} hours/week
- Peak Weeks: ${analysis.analysis.peakWeeks.join(', ')}

Important Dates:
${analysis.importantDates.map(date => `- ${date.title}: ${date.date} (${date.type})`).join('\n')}

Success Tips:
${analysis.analysis.successTips.map(tip => `- ${tip}`).join('\n')}`

      await memoryService.addMemory(courseMemory, 'personal', 'high')

      // Save grading information
      const gradingMemory = `Grading for ${analysis.courseInfo.courseCode}:
${analysis.grading.breakdown.map(item => `- ${item.category}: ${item.percentage}%`).join('\n')}
Late Penalty: ${analysis.grading.latePenalty}`

      await memoryService.addMemory(gradingMemory, 'personal', 'high')

      console.log('Course memory saved successfully')
    } catch (error) {
      console.error('Memory saving error:', error)
    }
  }

  private parseClassTime(day: string, time: string): Date {
    // Simple parsing - in production, you'd want more robust date parsing
    const today = new Date()
    const dayMap: { [key: string]: number } = {
      'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6, 'sunday': 0
    }
    
    const targetDay = dayMap[day.toLowerCase()]
    if (targetDay !== undefined) {
      const dayDiff = targetDay - today.getDay()
      const targetDate = new Date(today)
      targetDate.setDate(today.getDate() + dayDiff)
      
      const [hours, minutes] = time.split(':').map(Number)
      targetDate.setHours(hours, minutes, 0, 0)
      
      return targetDate
    }
    
    return new Date()
  }

  getWorkloadColor(workloadLevel: string): string {
    switch (workloadLevel) {
      case 'light': return 'text-green-400'
      case 'moderate': return 'text-yellow-400'
      case 'heavy': return 'text-orange-400'
      case 'very_heavy': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-900/20'
      case 'medium': return 'text-yellow-400 bg-yellow-900/20'
      case 'low': return 'text-green-400 bg-green-900/20'
      default: return 'text-gray-400 bg-gray-900/20'
    }
  }
}

export const syllabusService = SyllabusService.getInstance()
