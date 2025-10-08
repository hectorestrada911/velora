// Language Detection & Multilingual Pattern Matching
// Supports English + Spanish for Follow-Up Radar

interface DetectionPatterns {
  asks: RegExp[];
  promises: RegExp[];
  deadlines: RegExp[];
  polite: RegExp[];
}

interface LanguageResult {
  language: 'en' | 'es' | 'unknown';
  confidence: number;
}

class LanguageDetector {
  // English patterns (existing)
  private englishPatterns: DetectionPatterns = {
    asks: [
      /can you (please )?(confirm|review|send|share|check|update|provide|approve)/i,
      /could you (please )?/i,
      /would you (please )?/i,
      /please (confirm|review|send|share|check|update|provide|approve)/i,
      /let me know (when|if|about)/i,
      /need (your|you to)/i,
      /waiting (for|on) (you|your)/i,
      /have you (had a chance to)?/i
    ],
    promises: [
      /i'?ll (send|share|update|get back|circle back|follow up)/i,
      /let me (send|share|update|get back|circle back|follow up)/i,
      /i will (send|share|update|get back|circle back|follow up)/i,
      /will (send|share|update) (you|this|that)/i,
      /i'?m going to/i,
      /expect (to hear|my|the)/i
    ],
    deadlines: [
      /by (tomorrow|today|eod|end of day|friday|monday|tuesday|wednesday|thursday)/i,
      /by (\d{1,2}\/\d{1,2})/,
      /before (friday|monday|tuesday|wednesday|thursday|the weekend)/i,
      /deadline (is|:)/i,
      /due (by|on|:)/i,
      /next (week|month|friday|monday)/i,
      /this (week|friday|monday)/i
    ],
    polite: [
      /thank you/i,
      /thanks/i,
      /appreciate/i,
      /please/i,
      /kind regards/i,
      /best/i
    ]
  };

  // Spanish patterns
  private spanishPatterns: DetectionPatterns = {
    asks: [
      /puedes (por favor )?(confirmar|revisar|enviar|compartir|verificar|actualizar|proporcionar|aprobar)/i,
      /podrías (por favor )?/i,
      /podrías (confirmar|revisar|enviar)/i,
      /por favor (confirma|revisa|envía|comparte|verifica|actualiza)/i,
      /avísame (cuando|si|sobre)/i,
      /necesito que (me|tú)/i,
      /esperando (tu|su)/i,
      /has tenido (tiempo|oportunidad) de/i,
      /¿podrías/i,
      /¿puedes/i
    ],
    promises: [
      /te (envío|enviaré|mando|mandaré|comparto|compartiré)/i,
      /voy a (enviar|mandar|compartir|actualizar|hacer)/i,
      /déjame (enviar|mandar|compartir|actualizar)/i,
      /te (contacto|contactaré|llamo|llamaré)/i,
      /te (aviso|avisaré|informo|informaré)/i,
      /espero (poder|tu)/i
    ],
    deadlines: [
      /para (mañana|hoy|el viernes|el lunes|el martes|el miércoles|el jueves)/i,
      /para el (\d{1,2}\/\d{1,2})/,
      /antes de(l)? (viernes|lunes|martes|miércoles|jueves|fin de semana)/i,
      /fecha (límite|tope)/i,
      /vence (el|para|:)/i,
      /(la )?próxima (semana|mes)/i,
      /esta (semana|semana)/i,
      /fin de mes/i
    ],
    polite: [
      /gracias/i,
      /te agradezco/i,
      /muchas gracias/i,
      /por favor/i,
      /saludos/i,
      /cordialmente/i,
      /atte/i,
      /atentamente/i
    ]
  };

  // Language indicators
  private languageIndicators = {
    english: [
      'the', 'is', 'are', 'was', 'were', 'have', 'has', 'had',
      'can', 'could', 'would', 'should', 'will', 'shall',
      'you', 'your', 'we', 'our', 'please', 'thank', 'thanks'
    ],
    spanish: [
      'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 
      'para', 'por', 'con', 'que', 'se', 'es', 'está', 'están',
      'tu', 'su', 'nuestro', 'gracias', 'por favor', 'hola'
    ]
  };

  /**
   * Detect language from text
   */
  detectLanguage(text: string): LanguageResult {
    const lowerText = text.toLowerCase();
    let englishScore = 0;
    let spanishScore = 0;

    // Count English indicators
    this.languageIndicators.english.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) englishScore += matches.length;
    });

    // Count Spanish indicators
    this.languageIndicators.spanish.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) spanishScore += matches.length;
    });

    // Calculate confidence
    const total = englishScore + spanishScore;
    if (total === 0) {
      return { language: 'unknown', confidence: 0 };
    }

    if (englishScore > spanishScore) {
      return { 
        language: 'en', 
        confidence: englishScore / total 
      };
    } else {
      return { 
        language: 'es', 
        confidence: spanishScore / total 
      };
    }
  }

  /**
   * Get patterns for detected language
   */
  getPatterns(text: string): DetectionPatterns {
    const { language } = this.detectLanguage(text);
    
    if (language === 'es') {
      return this.spanishPatterns;
    }
    
    // Default to English
    return this.englishPatterns;
  }

  /**
   * Detect asks in text (language-aware)
   */
  detectAsks(text: string): { detected: boolean; matches: string[]; language: string } {
    const { language } = this.detectLanguage(text);
    const patterns = this.getPatterns(text);
    
    const matches: string[] = [];
    
    patterns.asks.forEach(pattern => {
      const match = text.match(pattern);
      if (match) {
        matches.push(match[0]);
      }
    });
    
    return {
      detected: matches.length > 0,
      matches,
      language
    };
  }

  /**
   * Detect promises in text (language-aware)
   */
  detectPromises(text: string): { detected: boolean; matches: string[]; language: string } {
    const { language } = this.detectLanguage(text);
    const patterns = this.getPatterns(text);
    
    const matches: string[] = [];
    
    patterns.promises.forEach(pattern => {
      const match = text.match(pattern);
      if (match) {
        matches.push(match[0]);
      }
    });
    
    return {
      detected: matches.length > 0,
      matches,
      language
    };
  }

  /**
   * Extract deadlines from text (language-aware)
   */
  extractDeadlines(text: string): { detected: boolean; matches: string[]; language: string } {
    const { language } = this.detectLanguage(text);
    const patterns = this.getPatterns(text);
    
    const matches: string[] = [];
    
    patterns.deadlines.forEach(pattern => {
      const match = text.match(pattern);
      if (match) {
        matches.push(match[0]);
      }
    });
    
    return {
      detected: matches.length > 0,
      matches,
      language
    };
  }

  /**
   * Get language-specific prompt for LLM
   */
  getLanguagePrompt(language: 'en' | 'es' | 'unknown'): string {
    if (language === 'es') {
      return `El siguiente correo está en español. Analiza el contenido y extrae información sobre compromisos y seguimientos.`;
    }
    
    return `The following email is in English. Analyze the content and extract information about commitments and follow-ups.`;
  }

  /**
   * Translate follow-up direction
   */
  translateDirection(direction: 'YOU_OWE' | 'THEY_OWE', language: 'en' | 'es'): string {
    if (language === 'es') {
      return direction === 'YOU_OWE' ? 'Tú debes' : 'Te deben';
    }
    
    return direction === 'YOU_OWE' ? 'You owe' : 'They owe';
  }

  /**
   * Get language-specific draft template
   */
  getDraftTemplate(language: 'en' | 'es'): {
    greeting: string;
    followUpLine: string;
    closing: string;
  } {
    if (language === 'es') {
      return {
        greeting: 'Hola',
        followUpLine: 'Siguiendo con nuestro correo anterior sobre',
        closing: 'Saludos cordiales'
      };
    }
    
    return {
      greeting: 'Hi',
      followUpLine: 'Following up on our previous conversation about',
      closing: 'Best regards'
    };
  }
}

// Export singleton instance
export const languageDetector = new LanguageDetector();
export default languageDetector;

// Export types
export { DetectionPatterns, LanguageResult };
