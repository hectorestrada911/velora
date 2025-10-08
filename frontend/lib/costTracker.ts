// Cost Tracking Service
// Real-time per-user cost monitoring for Follow-Up Radar

import { doc, getDoc, setDoc, increment, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

interface CostMetrics {
  // Email costs
  emailsSent: number;
  emailCostUSD: number; // $0.50 per 1000 emails
  
  // LLM costs
  tokensUsed: number;
  llmCostUSD: number; // $0.001 per 1000 tokens (GPT-5-mini)
  
  // Firestore costs
  firestoreReads: number;
  firestoreWrites: number;
  firestoreCostUSD: number; // $0.36 per 100k reads, $1.08 per 100k writes
  
  // Total
  totalCostUSD: number;
  
  // Metadata
  lastUpdated: number;
  period: 'day' | 'week' | 'month';
}

interface UserCostSummary {
  userId: string;
  dailyCost: number;
  monthlyCost: number;
  avgCostPerFollowup: number;
  activeFollowups: number;
  totalFollowups: number;
  arpu: number; // Average Revenue Per User ($15/month for Pro)
  cogsPercentage: number; // COGS as % of ARPU
  isHealthy: boolean; // True if COGS < 30% of ARPU
}

class CostTracker {
  // Pricing constants (as of Oct 2025)
  private readonly EMAIL_COST_PER_1K = 0.50; // Resend/Postmark pricing
  private readonly LLM_COST_PER_1K_TOKENS = 0.001; // GPT-5-mini pricing
  private readonly FIRESTORE_READ_COST_PER_100K = 0.36;
  private readonly FIRESTORE_WRITE_COST_PER_100K = 1.08;
  
  private readonly PRO_ARPU = 15.00; // Pro plan monthly revenue
  private readonly TARGET_COGS_PERCENTAGE = 0.30; // 30% COGS target

  /**
   * Track email sent cost
   */
  async trackEmail(userId: string, emailType: 'reminder' | 'digest'): Promise<void> {
    const costUSD = this.EMAIL_COST_PER_1K / 1000; // Cost per email
    
    await this.incrementCost(userId, {
      emailsSent: 1,
      emailCostUSD: costUSD,
      totalCostUSD: costUSD
    });
  }

  /**
   * Track LLM usage cost
   */
  async trackLLM(userId: string, tokensUsed: number, model: 'gpt-5-mini' | 'gpt-5'): Promise<void> {
    const costPerToken = model === 'gpt-5-mini' ? 0.001 / 1000 : 0.005 / 1000;
    const costUSD = tokensUsed * costPerToken;
    
    await this.incrementCost(userId, {
      tokensUsed,
      llmCostUSD: costUSD,
      totalCostUSD: costUSD
    });
  }

  /**
   * Track Firestore operation cost
   */
  async trackFirestore(userId: string, reads: number, writes: number): Promise<void> {
    const readCost = (reads / 100000) * this.FIRESTORE_READ_COST_PER_100K;
    const writeCost = (writes / 100000) * this.FIRESTORE_WRITE_COST_PER_100K;
    const totalCost = readCost + writeCost;
    
    await this.incrementCost(userId, {
      firestoreReads: reads,
      firestoreWrites: writes,
      firestoreCostUSD: totalCost,
      totalCostUSD: totalCost
    });
  }

  /**
   * Increment user's cost metrics
   */
  private async incrementCost(userId: string, metrics: Partial<CostMetrics>): Promise<void> {
    try {
      const dayKey = this.getDayKey();
      const docRef = doc(db, 'user_costs', `${userId}_${dayKey}`);
      
      const updates: any = {
        userId,
        lastUpdated: Date.now(),
        period: 'day'
      };
      
      // Add increments for each metric
      if (metrics.emailsSent) updates.emailsSent = increment(metrics.emailsSent);
      if (metrics.emailCostUSD) updates.emailCostUSD = increment(metrics.emailCostUSD);
      if (metrics.tokensUsed) updates.tokensUsed = increment(metrics.tokensUsed);
      if (metrics.llmCostUSD) updates.llmCostUSD = increment(metrics.llmCostUSD);
      if (metrics.firestoreReads) updates.firestoreReads = increment(metrics.firestoreReads);
      if (metrics.firestoreWrites) updates.firestoreWrites = increment(metrics.firestoreWrites);
      if (metrics.firestoreCostUSD) updates.firestoreCostUSD = increment(metrics.firestoreCostUSD);
      if (metrics.totalCostUSD) updates.totalCostUSD = increment(metrics.totalCostUSD);
      
      await setDoc(docRef, updates, { merge: true });
      
    } catch (error) {
      console.error('Cost tracking failed:', error);
      // Fail silently for reliability
    }
  }

  /**
   * Get user's cost summary
   */
  async getUserCostSummary(userId: string): Promise<UserCostSummary> {
    const dailyCost = await this.getDailyCost(userId);
    const monthlyCost = dailyCost * 30; // Estimate
    
    // Get followup count from radarService
    const { radarService } = await import('./radarService');
    const stats = await radarService.getRadarStats(userId);
    const activeFollowups = stats.overdueCount + stats.todayCount + stats.upcomingCount;
    
    const avgCostPerFollowup = activeFollowups > 0 ? dailyCost / activeFollowups : 0;
    const cogsPercentage = this.PRO_ARPU > 0 ? (monthlyCost / this.PRO_ARPU) : 0;
    const isHealthy = cogsPercentage <= this.TARGET_COGS_PERCENTAGE;
    
    return {
      userId,
      dailyCost,
      monthlyCost,
      avgCostPerFollowup,
      activeFollowups,
      totalFollowups: activeFollowups, // TODO: Get from historical data
      arpu: this.PRO_ARPU,
      cogsPercentage,
      isHealthy
    };
  }

  /**
   * Get daily cost for user
   */
  async getDailyCost(userId: string): Promise<number> {
    try {
      const dayKey = this.getDayKey();
      const docRef = doc(db, 'user_costs', `${userId}_${dayKey}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data()?.totalCostUSD || 0;
      }
      
      return 0;
    } catch (error) {
      console.error('Failed to get daily cost:', error);
      return 0;
    }
  }

  /**
   * Get detailed cost breakdown
   */
  async getCostBreakdown(userId: string): Promise<CostMetrics> {
    try {
      const dayKey = this.getDayKey();
      const docRef = doc(db, 'user_costs', `${userId}_${dayKey}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as CostMetrics;
      }
      
      return {
        emailsSent: 0,
        emailCostUSD: 0,
        tokensUsed: 0,
        llmCostUSD: 0,
        firestoreReads: 0,
        firestoreWrites: 0,
        firestoreCostUSD: 0,
        totalCostUSD: 0,
        lastUpdated: Date.now(),
        period: 'day'
      };
    } catch (error) {
      console.error('Failed to get cost breakdown:', error);
      return {
        emailsSent: 0,
        emailCostUSD: 0,
        tokensUsed: 0,
        llmCostUSD: 0,
        firestoreReads: 0,
        firestoreWrites: 0,
        firestoreCostUSD: 0,
        totalCostUSD: 0,
        lastUpdated: Date.now(),
        period: 'day'
      };
    }
  }

  /**
   * Get day key for current day (YYYYMMDD)
   */
  private getDayKey(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * Calculate estimated monthly cost for user
   */
  async estimateMonthlyCost(userId: string): Promise<{
    estimatedCost: number;
    breakdown: {
      emails: number;
      llm: number;
      firestore: number;
    };
    projection: string;
    isHealthy: boolean;
  }> {
    const breakdown = await this.getCostBreakdown(userId);
    
    // Estimate monthly cost (30 days)
    const estimatedEmails = breakdown.emailCostUSD * 30;
    const estimatedLLM = breakdown.llmCostUSD * 30;
    const estimatedFirestore = breakdown.firestoreCostUSD * 30;
    const estimatedTotal = estimatedEmails + estimatedLLM + estimatedFirestore;
    
    const cogsPercentage = estimatedTotal / this.PRO_ARPU;
    const isHealthy = cogsPercentage <= this.TARGET_COGS_PERCENTAGE;
    
    let projection = 'healthy';
    if (cogsPercentage > 0.50) projection = 'critical';
    else if (cogsPercentage > 0.30) projection = 'warning';
    
    return {
      estimatedCost: estimatedTotal,
      breakdown: {
        emails: estimatedEmails,
        llm: estimatedLLM,
        firestore: estimatedFirestore
      },
      projection,
      isHealthy
    };
  }

  /**
   * Get platform-wide cost metrics
   */
  async getPlatformMetrics(): Promise<{
    totalUsers: number;
    totalDailyCost: number;
    avgCostPerUser: number;
    totalRevenue: number;
    grossMargin: number;
    healthyUsersCount: number;
    unhealthyUsersCount: number;
  }> {
    // This would aggregate across all users
    // For now, return placeholder
    return {
      totalUsers: 0,
      totalDailyCost: 0,
      avgCostPerUser: 0,
      totalRevenue: 0,
      grossMargin: 0,
      healthyUsersCount: 0,
      unhealthyUsersCount: 0
    };
  }
}

// Export singleton instance
export const costTracker = new CostTracker();
export default costTracker;

// Export types
export { CostMetrics, UserCostSummary };
