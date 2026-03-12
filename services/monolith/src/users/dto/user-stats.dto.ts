export class UserStatsDto {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
  usersByRole: {
    user: number;
    admin: number;
    support: number;
    super_admin: number;
  };
  usersByPlan: {
    free: number;
    premium: number;
    enterprise: number;
  };
}
