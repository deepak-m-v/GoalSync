/**
 * Client-side demo analytics (used when API is unavailable or returns sparse data).
 */
export const analyticsDummy = {
  source: 'demo',
  kpis: {
    totalUsers: 248,
    totalGoals: 1240,
    completionRate: 72,
    onTrackRate: 68,
    avgProgressScore: 74,
    pendingApprovals: 18,
    openEscalations: 7,
  },
  completion: { rate: 72, approved: 892, total: 1240, trend: 5.2 },
  teamPerformance: [
    { team: 'Platform Engineering', completion: 81, onTrack: 76, employees: 28, avgScore: 79 },
    { team: 'Product Engineering', completion: 76, onTrack: 71, employees: 22, avgScore: 74 },
    { team: 'Enterprise Sales', completion: 69, onTrack: 64, employees: 18, avgScore: 68 },
    { team: 'Customer Success', completion: 74, onTrack: 70, employees: 15, avgScore: 72 },
    { team: 'Marketing Ops', completion: 67, onTrack: 62, employees: 12, avgScore: 66 },
    { team: 'Finance & HR', completion: 71, onTrack: 68, employees: 14, avgScore: 70 },
  ],
  departmentPerformance: [
    { name: 'Engineering', completion: 78, goalCount: 420, employees: 86, avgScore: 77 },
    { name: 'Sales', completion: 65, goalCount: 210, employees: 42, avgScore: 64 },
    { name: 'Marketing', completion: 70, goalCount: 165, employees: 35, avgScore: 69 },
    { name: 'Customer Success', completion: 74, goalCount: 145, employees: 28, avgScore: 72 },
    { name: 'Operations', completion: 68, goalCount: 180, employees: 38, avgScore: 67 },
    { name: 'HR', completion: 73, goalCount: 120, employees: 19, avgScore: 71 },
  ],
  quarterlyTrends: [
    { quarter: 'Q1', completion: 58, onTrack: 52, atRisk: 18, avgScore: 61 },
    { quarter: 'Q2', completion: 65, onTrack: 60, atRisk: 15, avgScore: 66 },
    { quarter: 'Q3', completion: 71, onTrack: 67, atRisk: 11, avgScore: 72 },
    { quarter: 'Q4', completion: 76, onTrack: 72, atRisk: 9, avgScore: 76 },
  ],
  heatmap: {
    departments: ['Engineering', 'Sales', 'Marketing', 'Customer Success', 'Operations', 'HR'],
    quarters: ['Q1', 'Q2', 'Q3', 'Q4'],
    values: [
      [62, 70, 76, 81],
      [54, 61, 66, 69],
      [58, 64, 70, 73],
      [60, 68, 74, 78],
      [56, 63, 68, 71],
      [59, 66, 72, 75],
    ],
  },
  managerEffectiveness: [
    { name: 'Sarah Chen', approvalRate: 94, avgReviewDays: 2.1, teamCompletion: 82, reviews: 24 },
    { name: 'Marcus Webb', approvalRate: 88, avgReviewDays: 3.4, teamCompletion: 76, reviews: 19 },
    { name: 'Priya Nair', approvalRate: 91, avgReviewDays: 2.8, teamCompletion: 79, reviews: 22 },
    { name: 'James Ortiz', approvalRate: 85, avgReviewDays: 4.1, teamCompletion: 71, reviews: 17 },
    { name: 'Emily Foster', approvalRate: 92, avgReviewDays: 2.5, teamCompletion: 80, reviews: 21 },
  ],
  goalDistribution: [
    { thrustArea: 'Revenue Growth', count: 280 },
    { thrustArea: 'Customer Experience', count: 220 },
    { thrustArea: 'Operational Excellence', count: 195 },
    { thrustArea: 'Innovation', count: 175 },
    { thrustArea: 'People & Culture', count: 150 },
    { thrustArea: 'Cost Optimization', count: 120 },
    { thrustArea: 'Compliance', count: 100 },
  ],
  statusAnalytics: [
    { status: 'approved', count: 892, percentage: 72 },
    { status: 'locked', count: 148, percentage: 12 },
    { status: 'submitted', count: 96, percentage: 8 },
    { status: 'draft', count: 72, percentage: 6 },
    { status: 'rejected', count: 32, percentage: 2 },
  ],
  goalsByStatus: [
    { status: 'approved', count: 892 },
    { status: 'locked', count: 148 },
    { status: 'submitted', count: 96 },
    { status: 'draft', count: 72 },
    { status: 'rejected', count: 32 },
  ],
  checkInStatus: [
    { status: 'not_started', count: 186 },
    { status: 'on_track', count: 742 },
    { status: 'completed', count: 512 },
  ],
};

export default analyticsDummy;
