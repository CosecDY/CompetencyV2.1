// Portfolio-specific types
export type TabType = "overview" | "sfia" | "tpqi";

export interface PortfolioPageProps {
  initialTab?: TabType;
}

export interface PortfolioState {
  activeTab: TabType;
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

// Component-specific types
export interface HeaderProps {
  userEmail: string;
  isDataStale?: boolean;
  loading?: boolean;
  onRefresh?: () => void;
  lastUpdated?: Date;
}

export interface StateComponentProps {
  loading?: boolean;
  error?: string | null;
  lastFetched?: Date | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  onRefresh?: () => void;
  recommendations?: string[];
}

export interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  sfiaSkillsCount: number;
  tpqiCareersCount: number;
}

// Chart and Stats types
export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface StatCardData {
  title: string;
  value: number;
  progress: number;
  icon: React.ComponentType;
  color: string;
  bgColor: string;
  textColor: string;
}
