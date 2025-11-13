import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Avatar,
  styled,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  Fade,
  Skeleton,
  Collapse,
  Badge,
  Breadcrumbs,
  Link,
  Alert,
  Snackbar,
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  FormHelperText,
  Grid,
  Stack,
  Step,
  StepLabel,
  Stepper,
  LinearProgress,
} from "@mui/material";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import CircularProgress from "@mui/material/CircularProgress";
import FlyingIconAnimation from "../animations/FlyingIconAnimation";
import SearchIcon from "@mui/icons-material/Search";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import BarChartIcon from "@mui/icons-material/BarChart";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ChatIcon from "@mui/icons-material/Chat";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import MessageIcon from "@mui/icons-material/Message";
import EmailIcon from "@mui/icons-material/Email";
import CallIcon from "@mui/icons-material/Call";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StarIcon from "@mui/icons-material/Star";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import BusinessIcon from "@mui/icons-material/Business";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ArticleIcon from "@mui/icons-material/Article";
import TaskIcon from "@mui/icons-material/Task";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

// Use the global theme from ThemeContext

const CompaniesContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "100%",
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(0, 3), // Add horizontal padding
  boxSizing: "border-box",
}));

const Header = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1.5, 0),
  position: "sticky",
  top: 0,
  zIndex: 10,
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const SearchBar = styled(TextField)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: "3px",
  "& .MuiOutlinedInput-root": {
    borderRadius: "3px",
    "& fieldset": {
      borderColor: theme.palette.divider,
    },
    "&:hover fieldset": {
      borderColor: theme.palette.divider,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
  width: "300px",
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: "3px",
  textTransform: "none",
  padding: theme.spacing(0.75, 2.5),
  marginLeft: theme.spacing(1.5),
  boxShadow: "none",
  fontWeight: 600,
  fontSize: "0.875rem",
  "&.MuiButton-contained": {
    backgroundColor: theme.palette.secondary.main,
    "&:hover": {
      backgroundColor: theme.palette.secondary.dark,
      boxShadow: "none",
    },
  },
  "&.MuiButton-outlined": {
    borderColor: theme.palette.divider,
    color: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
      borderColor: theme.palette.divider,
    },
  },
}));

const TabsContainer = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
  "& .MuiTabs-indicator": {
    backgroundColor: theme.palette.primary.main,
    height: 3,
    borderRadius: "3px",
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  minWidth: "auto",
  padding: theme.spacing(2, 3),
  "&.Mui-selected": {
    fontWeight: 700,
    color: theme.palette.primary.main,
  },
}));

const TabCount = styled("span")(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.action.hover,
  color: theme.palette.text.secondary,
  borderRadius: "50%",
  width: "22px",
  height: "22px",
  fontSize: "0.75rem",
  marginLeft: theme.spacing(1),
  fontWeight: 700,
}));

const TableHeader = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.mode === "dark" ? theme.palette.text.secondary : "#666",
  borderBottom: `1px solid ${
    theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0"
  }`,
  padding: theme.spacing(1.5, 2),
  fontSize: "0.875rem",
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(30, 30, 30, 0.95)"
      : "rgba(255, 255, 255, 0.95)",
  position: "sticky",
  top: 0,
  zIndex: 3,
  backdropFilter: "blur(4px)",
}));

const TableContent = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${
    theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0"
  }`,
  padding: theme.spacing(1.5, 2),
  color: theme.palette.mode === "dark" ? theme.palette.text.primary : "#333",
  fontSize: "0.875rem",
}));

interface StatusChipProps {
  status: "completed" | "pending" | "failed" | "loading";
}

// Status indicator component
const StatusIndicator = styled(Box, {
  shouldForwardProp: (prop) => prop !== "status",
})<{ status: "completed" | "pending" | "failed" | "loading" }>(
  ({ theme, status }) => ({
  width: 10,
  height: 10,
    borderRadius: "2px",
  backgroundColor:
      status === "completed"
        ? theme.palette.success.main
        : status === "failed"
        ? theme.palette.error.main
        : status === "loading"
        ? theme.palette.info.main
        : theme.palette.warning.main,
  marginRight: theme.spacing(0.75),
    display: "inline-block",
    transition: "all 0.2s ease-in-out",
  })
);

const StatusLabel = styled(Box, {
  shouldForwardProp: (prop) => prop !== "status",
})<{ status: "completed" | "pending" | "failed" | "loading" }>(
  ({ theme, status }) => ({
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 6px",
    borderRadius: "3px",
    fontSize: "0.7rem",
  fontWeight: 700,
  lineHeight: 1,
  backgroundColor:
      status === "completed"
        ? theme.palette.mode === "dark"
          ? "rgba(46, 204, 113, 0.3)"
          : theme.palette.success.light
        : status === "failed"
        ? theme.palette.mode === "dark"
          ? "rgba(231, 76, 60, 0.3)"
          : theme.palette.error.light
        : status === "loading"
        ? theme.palette.mode === "dark"
          ? "rgba(52, 152, 219, 0.3)"
          : theme.palette.info.light
        : theme.palette.mode === "dark"
        ? "rgba(241, 196, 15, 0.3)"
        : theme.palette.warning.light,
  color:
      status === "completed"
        ? theme.palette.mode === "dark"
          ? "#2ecc71"
          : theme.palette.success.main
        : status === "failed"
        ? theme.palette.mode === "dark"
          ? "#e74c3c"
          : theme.palette.error.main
        : status === "loading"
        ? theme.palette.mode === "dark"
          ? "#3498db"
          : theme.palette.info.main
        : theme.palette.mode === "dark"
        ? "#f1c40f"
        : theme.palette.warning.main,
  })
);

interface Asset {
  id: number;
  name: string;
  type: string;
  status: "active" | "inactive";
  lastUpdated: string;
}

interface Company {
  id: number;
  companyName: string;
  location: string;
  industry: string;
  activeAssets: string;
  assets: Asset[];
  productFamily: string;
  exitRate: string;
  updates: "completed" | "pending" | "failed" | "loading";
  logoSrc: string;
  color?: string;
  confidence?: number;
  reasons?: string[];
  website?: string;
  insights?: CompanyInsight[];
  actionPlan?: string;
  suggestedSolutions?: string;
  articles?: {
    directly_relevant?: Article[];
    indirectly_useful?: Article[];
    not_relevant?: Article[];
  };
}

interface Article {
  title: string;
  url: string;
  source: string;
  published_date?: string;
}

interface CompanyInsight {
  question: string;
  points: string[];
}

interface SuggestedSolution {
  title: string;
  description: string;
  tag: string;
}

interface AIDescription {
  summary: string;
  strengths: string[];
  opportunities: string[];
  isLoading: boolean;
}

// Campaign interface for storing generated templates
interface Campaign {
  id: number;
  title: string;
  description: string;
  companyName: string;
  companyId: number;
  type: "email" | "call" | "meeting";
  content: string;
  createdAt: string;
  isRead: boolean;
}

// Function to generate a stable color based on a string
const stringToColor = (string: string) => {
  // Safety check to avoid errors
  if (!string) return "#1A73E8"; // Default color for empty strings

  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Palette of vibrant but professional colors
  const colors = [
    "#1A73E8", // Google blue
    "#EA4335", // Google red
    "#34A853", // Google green
    "#FBBC05", // Google yellow
    "#7B1FA2", // purple
    "#0097A7", // cyan
    "#00796B", // teal
    "#C62828", // red
    "#AD1457", // pink
    "#6A1B9A", // deep purple
    "#4527A0", // dark indigo
    "#283593", // indigo
    "#1565C0", // blue
    "#0277BD", // light blue
    "#00838F", // cyan
    "#00695C", // teal
    "#2E7D32", // green
    "#558B2F", // light green
    "#F9A825", // amber
    "#EF6C00", // orange
    "#D84315", // deep orange
    "#4E342E", // brown
  ];

  return colors[Math.abs(hash) % colors.length];
};

// Function to generate a single-letter avatar from a name
const getInitials = (name: string) => {
  if (!name) return "?";

  const trimmed = name.trim();
  if (!trimmed) return "?";

  // Find the first alphanumeric character to use as the avatar letter
  const match = trimmed.match(/[A-Za-z0-9]/);
  return (match ? match[0] : trimmed.charAt(0)).toUpperCase();
};

// Base companies that will be used as templates (fallback if CSV loading fails)

// We'll generate companies dynamically in the component

const mockInsights: CompanyInsight[] = [
  {
    question:
      "What are the latest company updates, including leadership changes, financial health, and strategic moves?",
    points: [
      "XYZ Corp recently raised $50M in Series B funding, led by ABC Ventures, to expand its AI-powered analytics platform.",
      "CEO Jane Doe stepped down last month, with John Smith, former CTO, taking over as interim CEO.",
      "The company announced a 5% workforce reduction as part of cost-cutting measures despite steady revenue growth.",
    ],
  },
  {
    question:
      "What are the company's biggest challenges, priorities, or inefficiencies right now?",
    points: [
      "Struggling to integrate their new customer data platform, leading to inefficiencies in sales and marketing.",
      "Facing regulatory pressure due to new industry compliance rules, which could delay product launches.",
      "Recent customer feedback suggests poor user experience on their mobile app, with complaints about slow performance.",
    ],
  },
  {
    question:
      "Who are the key decision-makers, and how are they shaping the company's direction?",
    points: [
      "John Smith (CEO) is prioritizing AI-driven automation and expanding into international markets.",
      "Emma Chen (CFO) is focused on improving profitability and optimizing operational costs.",
      "New VP of Product, David Patel, was hired from a top competitor and is expected to introduce a major product revamp.",
    ],
  },
  {
    question:
      "How does the company position itself against competitors, and what market trends are affecting them?",
    points: [
      "Positions as the premium, enterprise-focused solution in the market with higher pricing but better support.",
      "Facing increasing competition from new startups offering similar solutions at lower price points.",
      "Industry shift toward integrated platforms is favorable for their all-in-one solution approach.",
    ],
  },
  {
    question:
      "What upcoming initiatives, partnerships, or expansions is the company planning?",
    points: [
      "Planning to launch a new AI-powered analytics module in Q2, targeting enterprise customers in the financial sector.",
      "Announced strategic partnership with Microsoft Azure to enhance cloud infrastructure and expand global reach.",
      "Expanding operations to three new markets in Southeast Asia, with local offices opening in Singapore and Jakarta.",
      "Developing a mobile-first solution to capture the growing SMB market segment, expected to launch by year-end.",
    ],
  },
];

const mockSolutions: SuggestedSolution[] = [
  {
    title: "LSEG AI-Powered Financial Compliance Suite",
    description:
      "Automates compliance checks, reducing regulatory risks for companies expanding into new markets.",
    tag: "",
  },
  {
    title: "LSEG Competitive Intelligence Dashboard",
    description:
      "Real-time benchmarking of XYZ Corp vs. competitors, offering strategic insights on pricing, market share, and tech adoption.",
    tag: "",
  },
  {
    title: "LSEG Emerging Market Expansion Toolkit",
    description:
      "A set of localized data, financial insights, and risk assessment tools tailored for Latin America.",
    tag: "",
  },
];

const InformationCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
}));

const SectionTitle = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  "& .MuiTypography-root": {
    fontSize: "1.1rem",
    fontWeight: 700,
  },
  "& .MuiSvgIcon-root": {
    marginRight: theme.spacing(1),
  },
}));

const DetailTab = styled(Button, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active: boolean }>(({ theme, active }) => ({
  textTransform: "none",
  borderBottom: active ? `2px solid ${theme.palette.primary.main}` : "none",
  borderRadius: 0,
  padding: theme.spacing(1.5, 2),
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  fontWeight: active ? 700 : 600,
  "&:hover": {
    backgroundColor: "transparent",
    color: theme.palette.primary.main,
  },
  transition: theme.transitions.create(["color", "border-bottom"], {
    duration: theme.transitions.duration.shorter,
    easing: theme.transitions.easing.easeInOut,
  }),
}));

const AnimatedContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  transition: theme.transitions.create("all", {
    duration: theme.transitions.duration.standard,
    easing: theme.transitions.easing.easeInOut,
  }),
}));

const BookmarkButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(1),
  color: theme.palette.warning.main,
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(66, 66, 66, 0.8)"
      : "rgba(255, 255, 255, 0.8)",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 1px 3px rgba(0,0,0,0.3)"
      : "0 1px 3px rgba(0,0,0,0.12)",
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(66, 66, 66, 0.95)"
        : "rgba(255, 255, 255, 0.95)",
    transform: "scale(1.05)",
  },
  transition: theme.transitions.create(
    ["background-color", "box-shadow", "transform"],
    {
    duration: theme.transitions.duration.short,
    easing: theme.transitions.easing.easeOut,
    }
  ),
}));

const AccountListItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0.75, 1.5),
  cursor: "pointer",
  transition: theme.transitions.create(["background-color", "transform"], {
    duration: theme.transitions.duration.shortest,
    easing: theme.transitions.easing.easeInOut,
  }),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    transform: "translateX(2px)",
  },
}));

const AccountBadge = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0.5, 1),
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.1)"
      : theme.palette.action.hover,
  color:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.9)"
      : theme.palette.text.primary,
  borderRadius: theme.shape.borderRadius,
  marginRight: theme.spacing(1),
  fontSize: "0.75rem",
  fontWeight: 600,
}));

const AssetsDropdown = styled(Box)(({ theme }) => ({
  position: "absolute",
  zIndex: 1000,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 8px 32px rgba(0, 0, 0, 0.5)"
      : "0 8px 32px rgba(0, 0, 0, 0.15)",
  padding: theme.spacing(2),
  minWidth: "250px",
  maxWidth: "300px",
  maxHeight: "300px",
  overflow: "auto",
  border: `1px solid ${theme.palette.divider}`,
  marginTop: theme.spacing(1),
}));

const AssetItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0.75),
  borderRadius: theme.shape.borderRadius,
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "& + &": {
    marginTop: theme.spacing(0.5),
  },
}));

const AssetTypeChip = styled(Box)(({ theme }) => ({
  fontSize: "0.7rem",
  fontWeight: 600,
  padding: theme.spacing(0.25, 0.75),
  borderRadius: theme.shape.borderRadius,
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.05)",
  marginLeft: "auto",
}));

// Adding a transition component for views
const PageTransition = styled(Box)(({ theme }) => ({
  transition: theme.transitions.create(
    ["width", "margin", "opacity", "transform"],
    {
      easing: "cubic-bezier(0.4, 0, 0.2, 1)", // Smoother ease-in-ease-out
      duration: "600ms", // Longer duration for smoother transition
    }
  ),
}));

// Styled components for company creation and import
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: "center",
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(0, 0, 0, 0.02)",
  transition: "all 0.2s ease-in-out",
  cursor: "pointer",
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.04)",
    borderColor: theme.palette.primary.main,
  },
}));

const CSVPreviewTable = styled(TableContainer)(({ theme }) => ({
  maxHeight: "300px",
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  "& .MuiTableCell-root": {
    padding: theme.spacing(1),
    fontSize: "0.75rem",
  },
}));

// Filter options for dropdowns
const filterOptions = {
  industries: [
    "Technology",
    "Finance",
    "Healthcare",
    "Manufacturing",
    "Retail",
    "Media",
    "Consulting",
    "Education",
    "Energy",
    "Transportation",
    "Broker",
    "Other",
  ],
  productFamilies: [
    "Enterprise Solutions",
    "Cloud Services",
    "Data Analytics",
    "Security Systems",
    "Mobile Platforms",
    "Customer Experience",
    "Business Intelligence",
    "Infrastructure",
    "Digital Transformation",
    "IoT Solutions",
    "Risk & Financial",
    "Social Media",
    "Hardware & Software",
    "Search & Advertising",
    "Other",
  ],
};

interface CompaniesProps {
  onNewCampaign?: () => void;
}

const Companies: React.FC<CompaniesProps> = ({ onNewCampaign }) => {
  const { mode: appTheme } = useTheme();
  const muiTheme = useMuiTheme(); // Fallback to MUI theme if context theme is not available
  const { user } = useAuth(); // Get current authenticated user (SME)
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Company;
    direction: "asc" | "desc";
  } | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [detailsView, setDetailsView] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: Analysis, 1: News, 2: Tasks (main tabs)
  const [, setDetailTab] = useState("tasks"); // tasks/notes/comments (sub tabs in Analysis)
  const [companyTasks, setCompanyTasks] = useState<
    { id: number; text: string; completed: boolean }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [analyzingCompany, setAnalyzingCompany] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisProgressTarget, setAnalysisProgressTarget] = useState(0);
  const [analysisStatusMessage, setAnalysisStatusMessage] = useState(
    "Starting analysis..."
  );
  const [analysisCompletionPending, setAnalysisCompletionPending] =
    useState(false);
  const [analysisProgressByCompany, setAnalysisProgressByCompany] = useState<
    Record<number, { target: number; display: number; message: string }>
  >({});
  const [generatingOutreach, setGeneratingOutreach] = useState<string | null>(
    null
  ); // Track which outreach type is being generated
  const [, setAssetsDropdownOpen] = useState<number | null>(null);
  
  // Animation states
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationIconType, setAnimationIconType] = useState<
    "email" | "call" | "meeting"
  >("email");
  const [animationStartElement, setAnimationStartElement] =
    useState<HTMLElement | null>(null);
  const [animationEndElement, setAnimationEndElement] =
    useState<HTMLElement | null>(null);
  const assetsDropdownRef = React.useRef<HTMLDivElement>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
    companyId: number | null;
  }>({
    open: false,
    message: "",
    severity: "info",
    companyId: null,
  });
  const [bookmarked, setBookmarked] = useState<number[]>([]);
  const [companyMenuAnchor, setCompanyMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [menuCompany, setMenuCompany] = useState<Company | null>(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [outreachMenuAnchor, setOutreachMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [expandedInsights, setExpandedInsights] = useState<number[]>([]);
  const [filters, setFilters] = useState<{
    location: string[];
    industry: string[];
    productFamily: string[];
    status: ("completed" | "pending" | "failed" | "loading")[];
  }>({
    location: [],
    industry: [],
    productFamily: [],
    status: [],
  });

  // For infinite scrolling
  const [displayLimit, setDisplayLimit] = useState(30);
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [animatingTransition, setAnimatingTransition] = useState(false);
  const analysisProgressIntervalRef =
    React.useRef<ReturnType<typeof setInterval> | null>(null);
  const analysisResetTimeoutRef =
    React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const analysisJobMetaRef = React.useRef<{
    jobId: string;
    companyId: number;
  } | null>(null);
  const analysisProgressTargetRef = React.useRef(0);

  React.useEffect(() => {
    analysisProgressTargetRef.current = analysisProgressTarget;
  }, [analysisProgressTarget]);

  // Company creation and import states
  const [openAddCompanyDialog, setOpenAddCompanyDialog] = useState(false);
  const [addCompanyStep, setAddCompanyStep] = useState(0);
  const [newCompany, setNewCompany] = useState<Partial<Company>>({
    companyName: "",
    location: "",
    industry: "",
    productFamily: "",
    updates: "pending",
    assets: [],
  });
  const [companyFormErrors, setCompanyFormErrors] = useState<{
    companyName?: string;
    location?: string;
    industry?: string;
    productFamily?: string;
  }>({});

  // CSV import states
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvMapping, setCsvMapping] = useState<{ [key: string]: string }>({});
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [importInProgress, setImportInProgress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Companies state
  const [companies, setCompanies] = useState<Company[]>([]);

  // Selected companies for multiple deletion
  const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);

  // AI-generated company description
  const [aiDescription, setAiDescription] = useState<AIDescription>({
    summary: "",
    strengths: [],
    opportunities: [],
    isLoading: false,
  });

  // Campaigns state for storing generated templates
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Campaign view state
  const [campaignView, setCampaignView] = useState<{
    open: boolean;
    filter: "all" | "unread" | "read";
    selectedCampaignId: number | null;
    hasNewNotification: boolean;
  }>({
    open: false,
    filter: "all",
    selectedCampaignId: null,
    hasNewNotification: false,
  });

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<number | null>(null);
  const [multipleDeleteMode, setMultipleDeleteMode] = useState(false);

  // Add company dialog state (using different name to avoid conflict)
  const [addCompanyDialogOpen, setAddCompanyDialogOpen] = useState(false);
  const [addCompanyForm, setAddCompanyForm] = useState({
    name: "",
    location: "",
    industry: "",
    website: "",
    description: "",
  });

  // Edit company dialog state
  const [editCompanyDialogOpen, setEditCompanyDialogOpen] = useState(false);
  const [editCompanyForm, setEditCompanyForm] = useState({
    name: "",
    location: "",
    industry: "",
    website: "",
    description: "",
  });

  // Load companies from backend API
  const loadCompanies = async (): Promise<Company[]> => {
    try {
      if (!user?.sme_id) {
        console.log("No user or sme_id found, skipping company load");
        return [];
      }

      // Fetch companies from backend API filtered by sme_id
      const response = await fetch(
        `https://api.inspire.software/api/inspire/companies?sme_id=${user.sme_id}`,
        {
        headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("auth_token")
              ? {
                  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                }
              : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch companies");
      }

      const apiResponse = await response.json();
      const companies = apiResponse.data || [];

      // Transform backend data to frontend Company format
      const transformedCompanies: Company[] = companies.map((company: any) => ({
        id: company.company_id,
        companyName: company.name,
        location: company.location || "Unknown",
        industry: company.industry || "General",
        activeAssets: "0", // Not available from backend
        assets: [],
        productFamily: "General", // Not available from backend
        exitRate: "0.00", // Not available from backend
        updates: "completed" as "completed",
        logoSrc: "/images/avatar.png",
        color: stringToColor(company.name),
        website: company.website,
      }));

      return transformedCompanies;
    } catch (error) {
      console.error("Error loading companies from API:", error);
      return [];
    }
  };

  // Initialize companies from backend
  React.useEffect(() => {
    const initializeCompanies = async () => {
      if (!user?.sme_id) {
        setCompanies([]);
        return;
      }
      
    setLoading(true);
      const companies = await loadCompanies();
      setCompanies(companies);
    setLoading(false);
    };

    initializeCompanies();
  }, [user?.sme_id]);

  const clearAnalysisProgress = (
    status?: "completed" | "failed",
    companyId?: number,
    message?: string
  ) => {
    if (analysisProgressIntervalRef.current !== null) {
      window.clearInterval(analysisProgressIntervalRef.current);
      analysisProgressIntervalRef.current = null;
    }

    if (status && companyId) {
      setAnalysisProgressByCompany((prev) => {
        const previousEntry = prev[companyId];
        const previousDisplay =
          previousEntry?.display ?? previousEntry?.target ?? 0;
        const shouldAnimateToTarget =
          status === "completed" && analyzingCompany;

        return {
          ...prev,
          [companyId]: {
            target: status === "completed" ? 100 : previousEntry?.target ?? 0,
            display: shouldAnimateToTarget
              ? previousDisplay
              : status === "completed"
              ? 100
              : previousDisplay,
            message:
              message ||
              (status === "completed"
                ? "Analysis completed."
                : "Analysis failed."),
          },
        };
      });
      if (
        analysisJobMetaRef.current &&
        analysisJobMetaRef.current.companyId === companyId
      ) {
        setAnalysisProgressTarget(
          status === "completed" ? 100 : analysisProgressTargetRef.current
        );
      }
    }
  };

  const startAnalysisProgressPolling = (jobId: string, companyId: number) => {
    if (!jobId || !companyId) return;

    if (analysisProgressIntervalRef.current !== null) {
      window.clearInterval(analysisProgressIntervalRef.current);
    }
    if (analysisResetTimeoutRef.current !== null) {
      window.clearTimeout(analysisResetTimeoutRef.current);
      analysisResetTimeoutRef.current = null;
    }

    analysisJobMetaRef.current = { jobId, companyId };

    const initialMessage = "Starting analysis...";
    const initialProgress = 10;
    setAnalysisProgress(initialProgress);
    setAnalysisProgressTarget(initialProgress);
    setAnalysisStatusMessage(initialMessage);
    setAnalysisProgressByCompany((prev) => ({
      ...prev,
      [companyId]: {
        target: initialProgress,
      display: initialProgress,
        message: initialMessage,
      },
    }));

    const pollProgress = async () => {
      try {
        const progressResponse = await fetch(
          `https://api.inspire.software/api/v1/unified/unified-analysis/progress/${jobId}`,
          {
            headers: {
              ...(localStorage.getItem("auth_token")
                ? {
                    Authorization: `Bearer ${localStorage.getItem(
                      "auth_token"
                    )}`,
                  }
                : {}),
            },
          }
        );

        if (!progressResponse.ok) {
          throw new Error("Failed to fetch analysis progress");
        }

        const progressData = await progressResponse.json();

        if (progressData.success && progressData.data) {
          const rawPercent = progressData.data.percent;
          const percent =
            typeof rawPercent === "number"
              ? rawPercent
              : parseFloat(rawPercent ?? "0");
          const boundedPercent = Math.max(0, Math.min(100, percent));
          const message =
            progressData.data.message || "Processing company analysis...";
          const status = progressData.data.status || "running";

          setAnalysisProgressTarget((prevTarget) =>
            boundedPercent > prevTarget ? boundedPercent : prevTarget
          );
          setAnalysisStatusMessage(message);
          setAnalysisProgressByCompany((prev) => ({
            ...prev,
            [companyId]: {
              target: Math.max(
                prev[companyId]?.target ?? 0,
                boundedPercent
              ),
              display: Math.max(
                prev[companyId]?.display ?? 0,
                boundedPercent
              ),
              message,
            },
          }));

          if (status === "completed" || boundedPercent >= 100) {
            setAnalysisProgressTarget(100);
            setAnalysisStatusMessage(
              message || "Analysis completed successfully."
            );
            setAnalysisProgressByCompany((prev) => ({
              ...prev,
              [companyId]: {
                target: 100,
                display: 100,
                message: message || "Analysis completed successfully.",
              },
            }));
            clearAnalysisProgress();
          } else if (status === "failed") {
            setAnalysisStatusMessage(message || "Analysis failed.");
            setAnalysisProgressByCompany((prev) => ({
              ...prev,
              [companyId]: {
                target: boundedPercent,
                display: Math.max(
                  prev[companyId]?.display ?? 0,
                  boundedPercent
                ),
                message: message || "Analysis failed.",
              },
            }));
            clearAnalysisProgress();
          }
        }
      } catch (error) {
        console.warn("Analysis progress polling error:", error);
      }
    };

    pollProgress();
    analysisProgressIntervalRef.current = window.setInterval(pollProgress, 2000);
  };

  React.useEffect(() => {
    return () => {
      if (analysisProgressIntervalRef.current !== null) {
        window.clearInterval(analysisProgressIntervalRef.current);
      }
      if (analysisResetTimeoutRef.current !== null) {
        window.clearTimeout(analysisResetTimeoutRef.current);
        analysisResetTimeoutRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    if (!analyzingCompany) return;

    const animationInterval = window.setInterval(() => {
      const target = analysisProgressTargetRef.current;

      setAnalysisProgress((prev) => {
        if (prev >= target) {
          return prev;
        }
        const nextStep = Math.ceil((prev + 1) / 10) * 10;
        const next = Math.min(target, Math.max(prev + 1, nextStep));
        return next;
      });

      if (analysisJobMetaRef.current) {
        const { companyId } = analysisJobMetaRef.current;
        setAnalysisProgressByCompany((prev) => {
          const entry = prev[companyId];
          if (!entry) return prev;
          if (entry.display >= entry.target) return prev;
          const entryNextStep = Math.ceil((entry.display + 1) / 10) * 10;
          const nextDisplay = Math.min(
            entry.target,
            Math.max(entry.display + 1, entryNextStep)
          );
          if (nextDisplay === entry.display) return prev;
          return {
            ...prev,
            [companyId]: { ...entry, display: nextDisplay },
          };
        });
      }
    }, 700);

    return () => {
      window.clearInterval(animationInterval);
    };
  }, [analyzingCompany, analysisProgressTarget]);

  React.useEffect(() => {
    if (!analysisCompletionPending) return;
    if (analysisProgress < 100) return;
    if (analysisResetTimeoutRef.current !== null) return;

    analysisResetTimeoutRef.current = window.setTimeout(() => {
      setAnalysisCompletionPending(false);
      setAnalyzingCompany(false);
      analysisJobMetaRef.current = null;
      setAnalysisProgressTarget(0);
      setAnalysisProgress(0);
      setAnalysisStatusMessage("Starting analysis...");
      analysisResetTimeoutRef.current = null;
    }, 800);
  }, [analysisCompletionPending, analysisProgress]);

  // Function to open add company dialog
  const handleAddCompany = () => {
    setAddCompanyDialogOpen(true);
  };

  // Function to close add company dialog
  const handleCloseAddCompany = () => {
    setAddCompanyDialogOpen(false);
    // Reset form
    setAddCompanyForm({
      name: "",
      location: "",
      industry: "",
      website: "",
      description: "",
    });
  };

  // Function to handle edit company
  const handleEditCompany = () => {
    if (menuCompany) {
      // Populate edit form with company data
      setEditCompanyForm({
        name: menuCompany.companyName,
        location: menuCompany.location,
        industry: menuCompany.industry,
        website: menuCompany.website || "",
        description: "",
      });
      setEditCompanyDialogOpen(true);
      setCompanyMenuAnchor(null);
    }
  };

  // Function to close edit company dialog
  const handleCloseEditCompany = () => {
    setEditCompanyDialogOpen(false);
    // Reset form
    setEditCompanyForm({
      name: "",
      location: "",
      industry: "",
      website: "",
      description: "",
    });
  };

  // Function to save edited company
  const handleSaveEditCompany = async () => {
    if (!menuCompany || !editCompanyForm.name) {
      setNotification({
        open: true,
        message: "Company name is required",
        severity: "error",
        companyId: null,
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(
        `https://api.inspire.software/api/inspire/companies/${menuCompany.id}`,
        {
          method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("auth_token")
              ? {
                  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                }
              : {}),
        },
        body: JSON.stringify({
          name: editCompanyForm.name,
          location: editCompanyForm.location,
          industry: editCompanyForm.industry,
            website: editCompanyForm.website || "",
          description: editCompanyForm.description,
            sme_id: user?.sme_id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update company");
      }

      // Reload companies list to show updated data
      const updatedCompanies = await loadCompanies();
      setCompanies(updatedCompanies);

      // Close dialog and reset form
      handleCloseEditCompany();
      
          setNotification({
            open: true,
        message: "Company updated successfully",
        severity: "success",
        companyId: menuCompany.id,
      });
    } catch (error) {
      console.error("Error updating company:", error);
      setNotification({
        open: true,
        message: "Failed to update company",
        severity: "error",
        companyId: null,
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to analyze company using unified analysis endpoint
  const handleAnalyzeCompany = async () => {
    if (!selectedCompany || !user?.sme_id) {
      setNotification({
        open: true,
        message: "Please select a company and ensure you are logged in",
        severity: "error",
        companyId: null,
      });
      return;
    }

    let analysisCompletedSuccessfully = false;

    try {
      setAnalyzingCompany(true);
      setAnalysisCompletionPending(false);
      setAnalysisProgress(0);
      setAnalysisProgressTarget(0);
      const companyId = selectedCompany.id;
      const companyName = selectedCompany.companyName;
      
      // Get SME objective from user or default
      const sme_objective =
        user.objective || "General business intelligence and market analysis";

      if (companyId) {
        setCompanies((prev) =>
          prev.map((company) =>
            company.id === companyId
              ? { ...company, updates: "loading" as "loading" }
              : company
          )
        );
        setSelectedCompany((prev) =>
          prev ? { ...prev, updates: "loading" as "loading" } : prev
        );
      }

      const jobIdentifier = `analysis-${companyId ?? "manual"}-${Date.now()}`;

      // Call unified analysis endpoint
      const formData = new FormData();
      formData.append("company_name", selectedCompany.companyName);
      formData.append("company_location", selectedCompany.location);
      formData.append("sme_id", user.sme_id.toString());
      formData.append("sme_objective", sme_objective);
      formData.append("max_articles", "100");
      // Pass company_id if available (when manually analyzing an existing company)
      if (selectedCompany.id) {
        formData.append("company_id", selectedCompany.id.toString());
      }
      formData.append("job_id", jobIdentifier);

      if (companyId) {
        startAnalysisProgressPolling(jobIdentifier, companyId);
      } else {
        setAnalysisProgress(5);
        setAnalysisStatusMessage("Starting analysis...");
      }

      const response = await fetch(
        "https://api.inspire.software/api/v1/unified/unified-analysis",
        {
          method: "POST",
        headers: {
            ...(localStorage.getItem("auth_token")
              ? {
                  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                }
              : {}),
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Analysis failed");
      }

      const result = await response.json();

      // Store analysis results
      if (result.data) {
        const ragAnalysis = result.data.rag_analysis || {};

        console.log("📰 Articles received:", result.data.all_articles);
        console.log("🤖 RAG Analysis received:", ragAnalysis);

        // Extract company_info, strengths, and opportunities from RAG analysis
        const companyInfoData = ragAnalysis["8_company_info"]?.data || {};
        const strengthsData = ragAnalysis["9_strengths"]?.data || {};
        const opportunitiesData = ragAnalysis["10_opportunities"]?.data || {};

        // Format company_info as a paragraph (5 sentences)
        let companyInfoText = "";
        if (companyInfoData.description) {
          const sentences = [
            companyInfoData.description.sentence1,
            companyInfoData.description.sentence2,
            companyInfoData.description.sentence3,
            companyInfoData.description.sentence4,
            companyInfoData.description.sentence5,
          ]
            .filter((s) => s && s.trim())
            .join(" ");
          companyInfoText = sentences;
        }

        // Format strengths as array of strings
        const strengthsArray: string[] = [];
        if (strengthsData.strengths && Array.isArray(strengthsData.strengths)) {
          strengthsArray.push(
            ...strengthsData.strengths.map((s: any) => {
              const strengthText = s.strength || "";
              const evidenceText = s.evidence ? ` (${s.evidence})` : "";
              return `${strengthText}${evidenceText}`;
            })
          );
        }

        // Format opportunities as array of strings
        const opportunitiesArray: string[] = [];
        if (
          opportunitiesData.opportunities &&
          Array.isArray(opportunitiesData.opportunities)
        ) {
          opportunitiesArray.push(
            ...opportunitiesData.opportunities.map((o: any) => {
              const oppText = o.opportunity || "";
              const basisText = o.basis ? ` - ${o.basis}` : "";
              return `${oppText}${basisText}`;
            })
          );
        }

        // Update AI description with RAG data
        setAiDescription({
          summary: companyInfoText || aiDescription.summary,
          strengths:
            strengthsArray.length > 0
              ? strengthsArray
              : aiDescription.strengths,
          opportunities:
            opportunitiesArray.length > 0
              ? opportunitiesArray
              : aiDescription.opportunities,
          isLoading: false,
        });
        
        // Store in selectedCompany for display
        setSelectedCompany((prev) =>
          prev
            ? {
                ...prev,
          insights: [
            {
              question: "What are the latest company updates?",
                    points:
                      ragAnalysis["1_latest_updates"]?.data?.updates?.map(
                        (u: any) => u.update || ""
                      ) || [],
            },
            {
              question: "What are the company's challenges?",
                    points:
                      ragAnalysis["2_challenges"]?.data?.challenges?.map(
                        (c: any) =>
                          `${c.challenge || ""}${
                            c.impact ? ` (Impact: ${c.impact})` : ""
                          }`
                      ) || [],
            },
            {
              question: "Who are the key decision-makers?",
                    points:
                      ragAnalysis["3_decision_makers"]?.data?.decision_makers?.map(
                        (d: any) => `${d.name || ""} - ${d.role || ""}`
                      ) || [],
            },
            {
              question: "How does the company position itself?",
                    points: [
                      ragAnalysis["4_market_position"]?.data?.description || "",
                    ].filter((p) => p),
            },
            {
              question: "What are the company's future plans?",
                    points:
                      ragAnalysis["5_future_plans"]?.data?.plans?.map(
                        (p: any) =>
                          `${p.plan || ""}${
                            p.timeline ? ` (Timeline: ${p.timeline})` : ""
                          }`
                      ) || [],
                  },
                ],
                actionPlan: JSON.stringify(
                  ragAnalysis["6_action_plan"]?.data || {}
                ),
                suggestedSolutions: JSON.stringify(
                  ragAnalysis["7_solution"]?.data || {}
                ),
                articles:
                  result.data.articles_by_classification ||
                  result.data.all_articles ||
                  {},
                updates: "completed",
              }
            : prev
        );

        console.log(
          "📰 Articles stored in selectedCompany:",
          result.data.all_articles
        );
        console.log("✅ Company Info, Strengths, Opportunities updated");
      }

      setNotification({
        open: true,
        message: result.message || "Company analysis completed successfully",
        severity: "success",
        companyId: selectedCompany.id,
      });

      if (companyId) {
        setAnalysisProgressTarget((prev) => Math.max(prev, 100));
        setAnalysisStatusMessage("Analysis completed successfully.");
        clearAnalysisProgress(
          "completed",
          companyId,
          `Analysis completed for ${companyName}.`
        );
        analysisCompletedSuccessfully = true;
        setAnalysisCompletionPending(true);
      }

      // Reload companies to show updated data
      const updatedCompanies = await loadCompanies();
      setCompanies(updatedCompanies);
    } catch (error: any) {
      console.error("Error analyzing company:", error);
      setAnalysisCompletionPending(false);
      setNotification({
        open: true,
        message: error.message || "Failed to analyze company",
        severity: "error",
        companyId: null,
      });

      if (selectedCompany?.id) {
        setAnalysisStatusMessage(error.message || "Analysis failed.");
        setCompanies((prev) =>
          prev.map((company) =>
            company.id === selectedCompany.id
              ? { ...company, updates: "failed" as "failed" }
              : company
          )
        );
        setSelectedCompany((prev) =>
          prev ? { ...prev, updates: "failed" as "failed" } : prev
        );
        clearAnalysisProgress(
          "failed",
          selectedCompany.id,
          error.message || "Analysis failed."
        );
      }
    } finally {
      if (analysisProgressIntervalRef.current !== null) {
        window.clearInterval(analysisProgressIntervalRef.current);
        analysisProgressIntervalRef.current = null;
      }

      if (!analysisCompletedSuccessfully) {
        if (analysisResetTimeoutRef.current !== null) {
          window.clearTimeout(analysisResetTimeoutRef.current);
          analysisResetTimeoutRef.current = null;
        }
        setAnalysisCompletionPending(false);
        setAnalyzingCompany(false);
        analysisJobMetaRef.current = null;
        setAnalysisProgressTarget(0);
        setAnalysisProgress(0);
        setAnalysisStatusMessage("Starting analysis...");
      }
    }
  };

  // Function to generate outreach content
  const handleGenerateOutreach = async (
    outreachType: "email" | "call" | "meeting"
  ) => {
    if (!selectedCompany || !user?.sme_id) {
      setNotification({
        open: true,
        message: "Please select a company and ensure you are logged in",
        severity: "error",
        companyId: null,
      });
      return;
    }

    try {
      setGeneratingOutreach(outreachType);
      
      // Call outreach generation endpoint
      const formData = new FormData();
      formData.append("company_id", selectedCompany.id.toString());
      formData.append("outreach_type", outreachType);

      const response = await fetch(
        "https://api.inspire.software/api/outreach/generate",
        {
          method: "POST",
        headers: {
            ...(localStorage.getItem("auth_token")
              ? {
                  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                }
              : {}),
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Outreach generation failed");
      }

      const result = await response.json();
      
      setNotification({
        open: true,
        message: `${
          outreachType.charAt(0).toUpperCase() + outreachType.slice(1)
        } outreach generated successfully! Check your campaigns.`,
        severity: "success",
        companyId: null,
      });

      console.log(`✅ ${outreachType} outreach generated:`, result.data);
      
      // Trigger campaign notification
      if (onNewCampaign) {
        onNewCampaign();
      }
    } catch (error) {
      console.error(`Error generating ${outreachType} outreach:`, error);
      setNotification({
        open: true,
        message: `Failed to generate ${outreachType} outreach: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        severity: "error",
        companyId: null,
      });
    } finally {
      setGeneratingOutreach(null);
    }
  };

  // Function to load existing analysis and articles for a company
  const loadCompanyAnalysisAndArticles = async (companyId: number) => {
    try {
      console.log(
        `📊 Loading analysis and articles for company ID: ${companyId}`
      );

      // Fetch company details (includes company_info, strengths, opportunities)
      const companyResponse = await fetch(
        `https://api.inspire.software/api/inspire/companies/${companyId}`,
        {
          headers: {
            ...(localStorage.getItem("auth_token")
              ? {
                  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                }
              : {}),
          },
        }
      );
      
      // Fetch latest analysis
      const analysisResponse = await fetch(
        `https://api.inspire.software/api/inspire/companies/${companyId}/analysis`,
        {
        headers: {
            ...(localStorage.getItem("auth_token")
              ? {
                  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        }
              : {}),
          },
        }
      );

      // Fetch articles grouped by classification
      const articlesResponse = await fetch(
        `https://api.inspire.software/api/inspire/companies/${companyId}/articles`,
        {
        headers: {
            ...(localStorage.getItem("auth_token")
              ? {
                  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                }
              : {}),
          },
        }
      );

      // Process company data (includes company_info, strengths, opportunities)
      if (companyResponse.ok) {
        const companyResult = await companyResponse.json();
        if (companyResult.success && companyResult.data) {
          const companyData = companyResult.data;
          console.log("✅ Company data loaded:", companyData);

          // Extract and format company_info, strengths, and opportunities
          let companyInfoText = "";
          let strengthsArray: string[] = [];
          let opportunitiesArray: string[] = [];

          // Parse company_info (JSON string)
          if (companyData.company_info) {
            try {
              const companyInfoData = JSON.parse(companyData.company_info);
              if (companyInfoData.description) {
                if (typeof companyInfoData.description === "string") {
                  companyInfoText = companyInfoData.description;
                } else if (companyInfoData.description.sentence1) {
                  // Format as 5 sentences
                  const sentences = [
                    companyInfoData.description.sentence1,
                    companyInfoData.description.sentence2,
                    companyInfoData.description.sentence3,
                    companyInfoData.description.sentence4,
                    companyInfoData.description.sentence5,
                  ]
                    .filter((s) => s && s.trim())
                    .join(" ");
                  companyInfoText = sentences || companyInfoText;
                }
              }
            } catch (e) {
              console.error("Error parsing company_info:", e);
              companyInfoText = companyData.company_info;
            }
          }

          // Parse strengths (JSON string)
          if (companyData.strengths) {
            try {
              const strengthsData = JSON.parse(companyData.strengths);
              if (
                strengthsData.strengths &&
                Array.isArray(strengthsData.strengths)
              ) {
                strengthsArray = strengthsData.strengths.map((s: any) => {
                  const strengthText = s.strength || "";
                  const evidenceText = s.evidence ? ` (${s.evidence})` : "";
                  return `${strengthText}${evidenceText}`;
                });
              }
            } catch (e) {
              console.error("Error parsing strengths:", e);
              // Fallback: try to split as plain text
              strengthsArray = companyData.strengths
                .split(/\n|•|\*/)
                .filter((s) => s.trim())
                .map((s) => s.trim());
            }
          }

          // Parse opportunities (JSON string)
          if (companyData.opportunities) {
            try {
              const opportunitiesData = JSON.parse(companyData.opportunities);
              if (
                opportunitiesData.opportunities &&
                Array.isArray(opportunitiesData.opportunities)
              ) {
                opportunitiesArray = opportunitiesData.opportunities.map(
                  (o: any) => {
                    const oppText = o.opportunity || "";
                    const basisText = o.basis ? ` - ${o.basis}` : "";
                    return `${oppText}${basisText}`;
                  }
                );
              }
            } catch (e) {
              console.error("Error parsing opportunities:", e);
              // Fallback: try to split as plain text
              opportunitiesArray = companyData.opportunities
                .split(/\n|•|\*/)
                .filter((s) => s.trim())
                .map((s) => s.trim());
            }
          }

          // Update AI description with company data
          // Only update if we have real data (from backend), don't fallback to dummy data
          if (
            companyInfoText ||
            strengthsArray.length > 0 ||
            opportunitiesArray.length > 0
          ) {
            setAiDescription({
              summary: companyInfoText,
              strengths: strengthsArray.length > 0 ? strengthsArray : [],
              opportunities:
                opportunitiesArray.length > 0 ? opportunitiesArray : [],
              isLoading: false,
            });
          } else {
            // No real data found, mark as not loading but keep empty
            setAiDescription({
              summary: "",
              strengths: [],
              opportunities: [],
              isLoading: false,
            });
          }
        }
      }

      // Process analysis if exists
      if (analysisResponse.ok) {
        const analysisResult = await analysisResponse.json();
        if (analysisResult.success && analysisResult.data) {
          const analysisData = analysisResult.data;
          console.log("✅ Analysis loaded:", analysisData);
          
          // Update selectedCompany with analysis data
          setSelectedCompany((prev) => ({
            ...prev!,
            insights: [
              {
                question: "What are the latest company updates?",
                points: [analysisData.latest_updates || ""],
              },
              {
                question: "What are the company's challenges?",
                points: [analysisData.challenges || ""],
              },
              {
                question: "Who are the key decision-makers?",
                points: [analysisData.decision_makers || ""],
              },
              {
                question: "How does the company position itself?",
                points: [analysisData.market_position || ""],
              },
              {
                question: "What are the company's future plans?",
                points: [analysisData.future_plans || ""],
              },
            ],
            actionPlan: analysisData.action_plan || "",
            suggestedSolutions: analysisData.solutions || "",
          }));
        }
      }

      // Process articles if exists
      if (articlesResponse.ok) {
        const articlesResult = await articlesResponse.json();
        if (
          articlesResult.success &&
          articlesResult.data &&
          articlesResult.data.articles
        ) {
          const articles = articlesResult.data.articles;
          console.log("✅ Articles loaded:", articles);
          
          // Update selectedCompany with articles data
          setSelectedCompany((prev) => ({
            ...prev!,
            articles: {
              directly_relevant: articles.directly_relevant || [],
              indirectly_useful: articles.indirectly_useful || [],
              not_relevant: articles.not_relevant || [],
            },
          }));
        }
      }
    } catch (error) {
      console.error("Error loading company analysis and articles:", error);
    }
  };

  // Function to update company via API
  const handleUpdateCompany = async (
    companyId: number,
    companyData: Partial<Company>
  ) => {
    try {
      const response = await fetch(
        `https://api.inspire.software/api/inspire/companies/${companyId}`,
        {
          method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("auth_token")
              ? {
                  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                }
              : {}),
        },
        body: JSON.stringify({
          name: companyData.companyName,
          location: companyData.location,
          industry: companyData.industry,
            website: companyData.website || "",
            description: "",
            sme_id: user?.sme_id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update company");
      }

      // Reload companies to get updated data
      const companies = await loadCompanies();
      setCompanies(companies);

          setNotification({
            open: true,
        message: "Company updated successfully",
        severity: "success",
        companyId: null,
      });
    } catch (error) {
      console.error("Error updating company:", error);
      setNotification({
        open: true,
        message: "Failed to update company",
        severity: "error",
        companyId: null,
      });
    }
  };

  // Function to handle delete company from menu
  const handleDeleteCompanyFromMenu = () => {
    if (menuCompany) {
      setCompanyToDelete(menuCompany.id);
      setDeleteDialogOpen(true);
      setCompanyMenuAnchor(null);
    }
  };

  // Function to close menu
  const handleCloseCompanyMenu = () => {
    setCompanyMenuAnchor(null);
    setMenuCompany(null);
  };

  // Function to save new company
  const handleSaveNewCompany = async () => {
    if (!addCompanyForm.name) {
      setNotification({
        open: true,
        message: "Company name is required",
        severity: "error",
        companyId: null,
      });
      return;
    }

    try {
      setLoading(true);

      // Get SME ID from authenticated user
      if (!user?.sme_id) {
        setNotification({
          open: true,
          message: "Please log in to add companies",
          severity: "error",
          companyId: null,
        });
        setLoading(false);
        return;
      }
      const sme_id = user.sme_id;

      // 1. Create the company in the backend
      const response = await fetch(
        "https://api.inspire.software/api/inspire/companies",
        {
          method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("auth_token")
              ? {
                  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                }
              : {}),
        },
        body: JSON.stringify({
          name: addCompanyForm.name,
          location: addCompanyForm.location,
          industry: addCompanyForm.industry,
          website: addCompanyForm.website,
          description: addCompanyForm.description,
            sme_id: sme_id,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to create company");
      }
      const result = await response.json();
      const newCompanyId = result.data?.company_id || result.data?.id;
      if (!newCompanyId) {
        throw new Error("No company ID returned from backend");
      }
      // Add new company to in-memory state as 'loading'
      const newCompany = {
        id: newCompanyId,
        companyName: addCompanyForm.name,
        location: addCompanyForm.location || "",
        industry: addCompanyForm.industry || "",
        website: addCompanyForm.website || "",
        description: addCompanyForm.description || "",
        updates: "loading" as "loading",
        assets: [],
        activeAssets: "0",
        productFamily: "General",
        exitRate: "0.00",
        logoSrc: "/images/avatar.png",
        color: stringToColor(addCompanyForm.name),
      };
      setCompanies((prev) => [...prev, newCompany]);
      handleCloseAddCompany();
      setNotification({
        open: true,
        message: "Company added. Analysis starting...",
        severity: "info",
        companyId: newCompanyId,
      });

      // 2. Trigger unified analysis in background (non-blocking)
      const triggerAnalysis = async () => {
      try {
        const formData = new FormData();
          formData.append("company_name", addCompanyForm.name);
          formData.append("company_location", addCompanyForm.location);
          formData.append("sme_id", String(sme_id));
          formData.append("sme_objective", user.objective || "");
          formData.append("max_articles", "100");
          formData.append("company_id", String(newCompanyId)); // Pass the newly created company ID
          const backgroundJobId = `analysis-${newCompanyId}-${Date.now()}`;
          formData.append("job_id", backgroundJobId);

          startAnalysisProgressPolling(backgroundJobId, newCompanyId);

          const analysisResponse = await fetch(
            "https://api.inspire.software/api/v1/unified/unified-analysis",
            {
              method: "POST",
          headers: {
                ...(localStorage.getItem("auth_token")
                  ? {
                      Authorization: `Bearer ${localStorage.getItem(
                        "auth_token"
                      )}`,
                    }
                  : {}),
              },
              body: formData,
            }
          );

        if (!analysisResponse.ok) {
            throw new Error("Analysis failed");
        }

        const analysisData = await analysisResponse.json();

          // Update company status to completed
          setCompanies((prev) =>
            prev.map((c) =>
              c.id === newCompanyId
                ? {
          ...c,
                    updates: "completed" as "completed",
                    analysis: analysisData.data,
                  }
                : c
            )
          );
          clearAnalysisProgress(
            "completed",
            newCompanyId,
            `Analysis completed for ${addCompanyForm.name}.`
          );

          setNotification({
            open: true,
            message: `Analysis completed for ${addCompanyForm.name}!`,
            severity: "success",
            companyId: newCompanyId,
          });
      } catch (analysisErr) {
          console.error("Analysis error:", analysisErr);
          setCompanies((prev) =>
            prev.map((c) =>
              c.id === newCompanyId
                ? {
                    ...c,
                    updates: "failed" as "failed",
                  }
                : c
            )
          );
          clearAnalysisProgress(
            "failed",
            newCompanyId,
            `Analysis failed for ${addCompanyForm.name}.`
          );
          setNotification({
            open: true,
            message: `Analysis failed for ${addCompanyForm.name}.`,
            severity: "error",
            companyId: newCompanyId,
          });
        }
      };

      // Start analysis in background (non-blocking)
      triggerAnalysis();
    } catch (error) {
      console.error("Error creating company:", error);
      setNotification({
        open: true,
        message: "Failed to add company. Please try again.",
        severity: "error",
        companyId: null,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle click outside to close assets dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        assetsDropdownRef.current &&
        !assetsDropdownRef.current.contains(event.target as Node)
      ) {
        setAssetsDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // We'll move the infinite scrolling effect after sortedCompanies is defined

  // Handle closing the notification
  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  // Toggle assets dropdown
  const handleToggleAssetsDropdown = (
    event: React.MouseEvent,
    companyId: number
  ) => {
    event.stopPropagation();
    setAssetsDropdownOpen((prevState) =>
      prevState === companyId ? null : companyId
    );
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSort = (key: keyof Company) => {
    let direction: "asc" | "desc" = "asc";

    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Company) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    
    return sortConfig.direction === "asc" ? (
      <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} />
    ) : (
      <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
    );
  };

  // Get unique values for filter options
  const getUniqueFilterOptions = () => {
    const locations = new Set<string>();
    const industries = new Set<string>();
    const productFamilies = new Set<string>();

    companies.forEach((company) => {
      locations.add(company.location);
      industries.add(company.industry);
      productFamilies.add(company.productFamily);
    });

    return {
      locations: Array.from(locations).sort(),
      industries: Array.from(industries).sort(),
      productFamilies: Array.from(productFamilies).sort(),
    };
  };

  // Update filter options when companies change
  const [dynamicFilterOptions, setDynamicFilterOptions] = useState({
    locations: [] as string[],
    industries: [] as string[],
    productFamilies: [] as string[],
  });

  React.useEffect(() => {
    setDynamicFilterOptions(getUniqueFilterOptions());
  }, [companies]);

  // Handle filter changes
  const handleFilterChange = (
    filterType: "location" | "industry" | "productFamily" | "status",
    value: string
  ) => {
    setFilters((prev) => {
      const currentValues = [...prev[filterType]];
      const valueIndex = currentValues.indexOf(value as any);

      if (valueIndex === -1) {
        // Add the value to the filter
        return {
          ...prev,
          [filterType]: [...currentValues, value],
        };
      } else {
        // Remove the value from the filter
        currentValues.splice(valueIndex, 1);
        return {
          ...prev,
          [filterType]: currentValues,
        };
      }
    });

    // Don't close the filter menu when selecting options
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      location: [],
      industry: [],
      productFamily: [],
      status: [],
    });
  };

  // Apply filters to companies
  const filteredCompanies = companies.filter((company) => {
    // Text search filter
    const matchesSearch =
      !searchQuery ||
      company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.productFamily.toLowerCase().includes(searchQuery.toLowerCase());

    // Location filter
    const matchesLocation =
      filters.location.length === 0 ||
      filters.location.includes(company.location);

    // Industry filter
    const matchesIndustry =
      filters.industry.length === 0 ||
      filters.industry.includes(company.industry);

    // Product family filter
    const matchesProductFamily =
      filters.productFamily.length === 0 ||
      filters.productFamily.includes(company.productFamily);

    // Status filter
    const matchesStatus =
      filters.status.length === 0 || filters.status.includes(company.updates);

    return (
      matchesSearch &&
      matchesLocation &&
      matchesIndustry &&
      matchesProductFamily &&
      matchesStatus
    );
  });

  const getFilteredCompaniesByStatus = () => {
    if (tabValue === 0) return filteredCompanies; // All companies
    if (tabValue === 1)
      return filteredCompanies.filter(
        (company) => company.updates === "completed"
      );
    if (tabValue === 2)
      return filteredCompanies.filter(
        (company) => company.updates === "failed"
      );
    if (tabValue === 3)
      // Processing includes both "loading" and "pending" statuses
      return filteredCompanies.filter(
        (company) =>
          company.updates === "loading" || company.updates === "pending"
      );
    return filteredCompanies;
  };

  const completedCount = companies.filter(
    (company) => company.updates === "completed"
  ).length;
  const failedCount = companies.filter(
    (company) => company.updates === "failed"
  ).length;
  const processingCount = companies.filter(
    (company) => company.updates === "loading" || company.updates === "pending"
  ).length;

  const filteredByStatusCompanies = getFilteredCompaniesByStatus();

  // Define mockCompanies as the filtered companies for the company list view
  const mockCompanies = filteredByStatusCompanies;

  const sortedCompanies = React.useMemo(() => {
    let sortableCompanies = [...filteredByStatusCompanies];

    if (sortConfig !== null) {
      sortableCompanies.sort((a, b) => {
        // Check if properties exist on objects a and b
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Handle cases where values might be undefined
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined)
          return sortConfig.direction === "asc" ? -1 : 1;
        if (bValue === undefined)
          return sortConfig.direction === "asc" ? 1 : -1;

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableCompanies;
  }, [filteredByStatusCompanies, sortConfig]);

  // Handle infinite scrolling
  React.useEffect(() => {
    const handleScroll = () => {
      if (tableContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          tableContainerRef.current;

        // When user scrolls to bottom (with a 100px threshold)
        if (scrollTop + clientHeight >= scrollHeight - 100) {
          // Load more companies (increase limit by 20)
          setDisplayLimit((prevLimit) =>
            Math.min(prevLimit + 20, sortedCompanies.length)
          );
        }
      }
    };

    const tableContainer = tableContainerRef.current;
    if (tableContainer) {
      tableContainer.addEventListener("scroll", handleScroll);
      return () => {
        tableContainer.removeEventListener("scroll", handleScroll);
      };
    }
  }, [sortedCompanies.length]);

  // Handle company selection
  const handleCompanySelect = async (company: Company) => {
    if (multipleDeleteMode) {
      // In multiple delete mode, toggle selection instead of showing details
      handleToggleCompanySelection(company.id);
    } else {
      setAnimatingTransition(true);
      setLoading(true);
      setSelectedCompany(company);

      // Set loading state (don't generate dummy data - wait for real data)
      setAiDescription({
        summary: "",
        strengths: [],
        opportunities: [],
        isLoading: true,
      });

      // Load existing analysis and articles from backend (this will populate real data)
      try {
        await loadCompanyAnalysisAndArticles(company.id);
      } catch (error) {
        console.error("Error loading company data:", error);
        // Only generate dummy data if loading fails
        generateAIDescription(company);
      }

      // Delay for animation before displaying details
      setTimeout(() => {
        setDetailsView(true);
        setLoading(false);

        // Finish the animation
        setTimeout(() => {
          setAnimatingTransition(false);
        }, 500);
      }, 400);
    }
  };

  // Toggle company selection for multiple deletion
  const handleToggleCompanySelection = (companyId: number) => {
    setSelectedCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  // Open delete confirmation dialog for a single company
  const handleDeleteCompany = (companyId: number, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setCompanyToDelete(companyId);
    setMultipleDeleteMode(false);
    setDeleteDialogOpen(true);
  };

  // Open delete confirmation dialog for multiple companies
  const handleDeleteMultipleCompanies = () => {
    setMultipleDeleteMode(true);
    setDeleteDialogOpen(true);
  };

  // Toggle multiple delete mode
  const toggleMultipleDeleteMode = () => {
    setMultipleDeleteMode((prev) => !prev);
    if (multipleDeleteMode) {
      // Clear selections when exiting multiple delete mode
      setSelectedCompanies([]);
    }
  };

  // Confirm deletion of company(s)
  const confirmDeleteCompanies = async () => {
    if (multipleDeleteMode) {
      // Delete multiple companies
      if (selectedCompanies.length > 0) {
        try {
          // Delete each company via API
          for (const companyId of selectedCompanies) {
            const response = await fetch(
              `https://api.inspire.software/api/inspire/companies/${companyId}`,
              {
                method: "DELETE",
              headers: {
                  "Content-Type": "application/json",
                  ...(localStorage.getItem("auth_token")
                    ? {
                        Authorization: `Bearer ${localStorage.getItem(
                          "auth_token"
                        )}`,
                      }
                    : {}),
                },
              }
            );

            if (!response.ok) {
              throw new Error("Failed to delete company");
            }
          }
          
          // Reload companies list from API
          const updatedCompanies = await loadCompanies();
          setCompanies(updatedCompanies);
          setSelectedCompanies([]);
          
        setNotification({
          open: true,
            message: `${selectedCompanies.length} companies deleted successfully`,
            severity: "success",
            companyId: null,
          });
        } catch (error) {
          console.error("Error deleting companies:", error);
          setNotification({
            open: true,
            message: "Failed to delete companies",
            severity: "error",
            companyId: null,
          });
        }
      }
    } else if (companyToDelete) {
      // Delete single company
      try {
        const response = await fetch(
          `https://api.inspire.software/api/inspire/companies/${companyToDelete}`,
          {
            method: "DELETE",
          headers: {
              "Content-Type": "application/json",
              ...(localStorage.getItem("auth_token")
                ? {
                    Authorization: `Bearer ${localStorage.getItem(
                      "auth_token"
                    )}`,
                  }
                : {}),
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete company");
        }

        // Reload companies list from API
        const updatedCompanies = await loadCompanies();
        setCompanies(updatedCompanies);

        // If the deleted company was selected, clear the selection
        if (selectedCompany && selectedCompany.id === companyToDelete) {
          setSelectedCompany(null);
        setDetailsView(false);
      }

      setNotification({
        open: true,
          message: "Company deleted successfully",
          severity: "success",
          companyId: null,
        });
      } catch (error) {
        console.error("Error deleting company:", error);
        setNotification({
          open: true,
          message: "Failed to delete company",
          severity: "error",
          companyId: null,
        });
      }
    }

    // Close dialog and reset state
    setDeleteDialogOpen(false);
    setCompanyToDelete(null);
    setMultipleDeleteMode(false);
  };

  const handleBackToCompanies = () => {
    setAnimatingTransition(true);

    // Delay for animation before returning to the list
    setTimeout(() => {
      setDetailsView(false);

      // Finish the animation
      setTimeout(() => {
        setAnimatingTransition(false);
      }, 500);
    }, 400);
  };

  const handleDetailTabChange = (tab: string) => {
    setDetailTab(tab);
  };

  // Function to generate AI description for an company (fallback only)
  // This should only be called when real data is not available
  const generateAIDescription = (company: Account) => {
    // Check if real data already exists - don't overwrite it
    setAiDescription((prev) => {
      // If we already have real data (non-empty summary with actual content), don't overwrite
      if (prev.summary && prev.summary.length > 50 && !prev.isLoading) {
        console.log(
          "Skipping dummy data generation - real data already exists"
        );
        return prev;
      }

      // Otherwise, reset and generate dummy data
      return {
      summary: "",
      strengths: [],
      opportunities: [],
      isLoading: true,
      };
    });

    // Simulate API call delay
    const timeoutId = setTimeout(() => {
      // Check again before overwriting - real data might have loaded in the meantime
      setAiDescription((prev) => {
        // If real data exists now (non-empty summary that's not generic), don't overwrite with dummy data
        // Real data is usually longer and more specific, not generic like "X is a Y company"
        const hasRealData =
          prev.summary &&
          prev.summary.length > 100 &&
          !prev.summary.includes("is a") &&
          !prev.summary.includes("They are focused on growth") &&
          !prev.isLoading;

        if (hasRealData) {
          console.log("Skipping dummy data - real data loaded during timeout");
          return prev;
        }

        // Also check if we have real strengths/opportunities (non-generic)
        const hasRealStrengths =
          prev.strengths &&
          prev.strengths.length > 0 &&
          !prev.strengths[0].includes("Strong presence in the") &&
          !prev.strengths[0].includes("Established operations");

        const hasRealOpportunities =
          prev.opportunities &&
          prev.opportunities.length > 0 &&
          !prev.opportunities[0].includes("Explore new market opportunities");

        if (hasRealStrengths || hasRealOpportunities) {
          console.log("Skipping dummy data - real data detected");
          return prev;
        }

      // Generate description based on company data
      const industry = company.industry;
      const location = company.location;

      // Generate a summary based on company details
      const summary = `${company.companyName} is a ${industry} company based in ${location}. They are focused on growth and expansion in their sector.`;

      // Generate strengths based on company type
      const strengths = [
        `Strong presence in the ${industry} sector`,
        `Established operations in ${location}`,
        `Experienced team with industry expertise`,
        `Consistent growth and market presence`,
      ];

      // Generate opportunities based on company type
      const opportunities = [
        `Explore new market opportunities in related sectors`,
        `Implement advanced analytics for better insights`,
        `Integrate with other business systems for improved workflow`,
        `Expand operations and market reach`,
      ];

        // Only update if we don't have real data
        return {
        summary,
        strengths,
        opportunities,
        isLoading: false,
        };
      });
    }, 1500); // Simulate 1.5 second delay for API call
  };

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

  // Function to open the campaign view
  const handleOpenCampaignView = () => {
    setCampaignView({
      ...campaignView,
      open: true,
      hasNewNotification: false, // Clear notification when opening
    });
  };

  // Function to close the campaign view
  const handleCloseCampaignView = () => {
    setCampaignView({
      ...campaignView,
      open: false,
      selectedCampaignId: null,
    });
  };

  // Function to change the campaign filter
  const handleCampaignFilterChange = (filter: "all" | "unread" | "read") => {
    setCampaignView({
      ...campaignView,
      filter,
    });
  };

  // Function to select a campaign
  const handleCampaignSelect = (campaignId: number) => {
    // Mark the campaign as read
    setCampaigns((prevCampaigns) =>
      prevCampaigns.map((campaign) =>
        campaign.id === campaignId ? { ...campaign, isRead: true } : campaign
      )
    );

    // Set the selected campaign
    setCampaignView({
      ...campaignView,
      selectedCampaignId: campaignId,
    });
  };

  // Function to delete a campaign
  const handleDeleteCampaign = (campaignId: number) => {
    setCampaigns((prevCampaigns) =>
      prevCampaigns.filter((campaign) => campaign.id !== campaignId)
    );

    // If the deleted campaign was selected, clear the selection
    if (campaignView.selectedCampaignId === campaignId) {
      setCampaignView({
        ...campaignView,
        selectedCampaignId: null,
      });
    }

    // Show notification
    setNotification({
      open: true,
      message: "Campaign deleted successfully",
      severity: "success",
      companyId: null,
    });
  };

  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleOutreachMenuClose = () => {
    setOutreachMenuAnchor(null);
  };

  const handleOutreachTypeSelect = (type: "email" | "call" | "meeting") => {
    // Get the outreach button element for animation start point
    const outreachButton = document.getElementById("generate-outreach-button");
    // Get the campaigns nav button for animation end point
    const campaignsNavButton = document.getElementById("campaigns-nav-button");
    
    if (outreachButton && campaignsNavButton) {
      setAnimationStartElement(outreachButton);
      setAnimationEndElement(campaignsNavButton);
      setAnimationIconType(type);
      setShowAnimation(true);
    }
    
    handleOutreachMenuClose();
    handleGenerateOutreach(type);
  };

  const toggleBookmark = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setBookmarked((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const toggleInsight = (index: number) => {
    setExpandedInsights((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleShowTaskForm = () => {
    setShowTaskForm(true);
  };

  const handleHideTaskForm = () => {
    setShowTaskForm(false);
    setNewTaskText("");
  };

  const handleNewTaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTaskText(e.target.value);
  };

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      console.log("Adding task:", newTaskText);
      setNewTaskText("");
      setShowTaskForm(false);
    }
  };

  // Account creation and import handlers
  const handleOpenAddCompanyDialog = () => {
    setOpenAddCompanyDialog(true);
    setAddCompanyStep(0);
    setNewCompany({
      companyName: "",
      location: "",
      industry: "",
      productFamily: "",
      updates: "pending",
      assets: [],
    });
    setCompanyFormErrors({});
    setCsvFile(null);
    setCsvPreview([]);
    setCsvHeaders([]);
    setCsvMapping({});
    setImportErrors([]);
    setImportSuccess(null);
  };

  const handleCloseAddCompanyDialog = () => {
    setOpenAddCompanyDialog(false);
  };

  const handleCompanyFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewCompany((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field if it exists
    if (companyFormErrors[name as keyof typeof companyFormErrors]) {
      setCompanyFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAccountTypeChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setNewCompany((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field if it exists
    if (companyFormErrors[name as keyof typeof companyFormErrors]) {
      setCompanyFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateCompanyForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!newCompany.companyName?.trim()) {
      errors.companyName = "Company name is required";
    }

    if (!newCompany.location?.trim()) {
      errors.location = "Location is required";
    }

    if (!newCompany.industry?.trim()) {
      errors.industry = "Industry is required";
    }

    if (!newCompany.productFamily?.trim()) {
      errors.productFamily = "Product family is required";
    }

    setCompanyFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (addCompanyStep === 0) {
      // If on the first step (method selection), just go to next step
      setAddCompanyStep(1);
    } else if (addCompanyStep === 1) {
      // If on the second step (company details form), validate before proceeding
      if (validateCompanyForm()) {
        setAddCompanyStep(2);
      }
    }
  };

  const handlePreviousStep = () => {
    setAddCompanyStep((prev) => Math.max(0, prev - 1));
  };

  const handleCreateCompany = () => {
    // Final validation before creating the company
    if (!validateCompanyForm()) return;

    // Generate a new ID (would be handled by backend in real app)
    const newId = Math.max(...companies.map((a) => a.id)) + 1;

    // Generate a vibrant color for the company
    const companyColor = stringToColor(newCompany.companyName || "");

    // Create new company object
    const companyToAdd: Company = {
      id: newId,
      companyName: newCompany.companyName || "",
      location: newCompany.location || "",
      industry: newCompany.industry || "",
      productFamily: newCompany.productFamily || "",
      activeAssets: "0 Assets",
      assets: [],
      exitRate: "0.00",
      updates: "pending",
      logoSrc: "/images/avatar.png",
      color: companyColor,
    };

    // Add to companies state
    setCompanies((prevCompanies) => [companyToAdd, ...prevCompanies]);

    // Show success notification
    setNotification({
      open: true,
      message: `Account "${companyToAdd.companyName}" has been created successfully`,
      severity: "success",
      companyId: companyToAdd.id,
    });

    // Close dialog
    handleCloseAddCompanyDialog();
  };

  // CSV import handlers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setCsvFile(file);

    // Reset states
    setImportErrors([]);
    setCsvPreview([]);
    setCsvHeaders([]);
    setCsvMapping({});

    // Read the file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content) {
          setImportErrors(["Could not read file content"]);
          return;
        }

        // Parse CSV (simple implementation - would use a library in production)
        const lines = content.split("\n");
        if (lines.length < 2) {
          setImportErrors([
            "File must contain at least a header row and one data row",
          ]);
          return;
        }

        // Extract headers and create preview
        const headers = lines[0].split(",").map((h) => h.trim());
        setCsvHeaders(headers);

        // Create initial mapping (try to match headers to company fields)
        const initialMapping: { [key: string]: string } = {};
        headers.forEach((header) => {
          const lowerHeader = header.toLowerCase();
          if (lowerHeader.includes("name"))
            initialMapping[header] = "companyName";
          else if (lowerHeader.includes("location"))
            initialMapping[header] = "location";
          else if (
            lowerHeader.includes("type") ||
            lowerHeader.includes("organization") ||
            lowerHeader.includes("industry")
          )
            initialMapping[header] = "industry";
          else if (
            lowerHeader.includes("product") ||
            lowerHeader.includes("family")
          )
            initialMapping[header] = "productFamily";
        });
        setCsvMapping(initialMapping);

        // Create preview (up to 5 rows)
        const preview: string[][] = [];
        for (let i = 0; i < Math.min(5, lines.length); i++) {
          if (lines[i].trim()) {
            preview.push(lines[i].split(",").map((cell) => cell.trim()));
          }
        }
        setCsvPreview(preview);
      } catch (error) {
        setImportErrors(["Error parsing CSV file. Please check the format."]);
      }
    };

    reader.onerror = () => {
      setImportErrors(["Error reading file"]);
    };

    reader.readAsText(file);
  };

  const handleMappingChange = (header: string, companyField: string) => {
    setCsvMapping((prev) => ({
      ...prev,
      [header]: companyField,
    }));
  };

  const handleImportCompanies = () => {
    if (!csvFile || csvPreview.length === 0) {
      setImportErrors(["No file selected or file is empty"]);
      return;
    }

    setImportInProgress(true);
    setImportErrors([]);

    try {
      // Read the file again to process all rows
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (!content) {
            setImportErrors(["Could not read file content"]);
            setImportInProgress(false);
            return;
          }

          const lines = content.split("\n");
          if (lines.length < 2) {
            setImportErrors([
              "File must contain at least a header row and one data row",
            ]);
            setImportInProgress(false);
            return;
          }

          const headers = lines[0].split(",").map((h) => h.trim());
          const newCompanies: Company[] = [];
          const errors: string[] = [];

          // Start from index 1 to skip header row
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // Skip empty lines

            const values = lines[i].split(",").map((v) => v.trim());
            if (values.length !== headers.length) {
              errors.push(`Row ${i + 1}: Column count mismatch`);
              continue;
            }

            // Create company object from mapped fields
            const companyData: Partial<Company> = {
              updates: "pending",
              assets: [],
            };

            // Map CSV values to company fields
            headers.forEach((header, index) => {
              const companyField = csvMapping[header];
              if (companyField && values[index]) {
                (companyData as any)[companyField] = values[index];
              }
            });

            // Validate required fields
            if (!companyData.companyName) {
              errors.push(`Row ${i + 1}: Account name is required`);
              continue;
            }

            // Generate ID and add other required fields
            const newId =
              Math.max(
                ...companies.map((a) => a.id),
                ...newCompanies.map((a) => a.id)
              ) + 1;
            const newCompany: Company = {
              id: newId,
              companyName: companyData.companyName || "",
              location: companyData.location || "Unknown",
              industry: companyData.industry || "Other",
              productFamily: companyData.productFamily || "Other",
              activeAssets: "0 Assets",
              assets: [],
              exitRate: "0.00",
              updates: "pending",
              logoSrc: "/images/avatar.png",
              color: stringToColor(companyData.companyName || ""),
            };

            newCompanies.push(newCompany);
          }

          if (errors.length > 0) {
            setImportErrors(errors);
            if (newCompanies.length === 0) {
              setImportInProgress(false);
              return;
            }
          }

          // Add companies to the state
          setCompanies((prevCompanies) => [...newCompanies, ...prevCompanies]);

          // Show success notification
          setImportSuccess(
            `Successfully imported ${newCompanies.length} companies`
          );
          setNotification({
            open: true,
            message: `Successfully imported ${newCompanies.length} companies`,
            severity: "success",
            companyId: null,
          });

          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }

          // Close dialog after a delay
          setTimeout(() => {
            handleCloseAddCompanyDialog();
            setImportInProgress(false);
          }, 1500);
        } catch (error) {
          setImportErrors(["Error processing CSV file"]);
          setImportInProgress(false);
        }
      };

      reader.onerror = () => {
        setImportErrors(["Error reading file"]);
        setImportInProgress(false);
      };

      reader.readAsText(csvFile);
    } catch (error) {
      setImportErrors(["Unexpected error during import"]);
      setImportInProgress(false);
    }
  };

  const renderAccountList = () => {
    return (
      <>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {detailsView && (
              <IconButton onClick={handleBackToCompanies} sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography variant="h6" fontWeight="inherit">
              Companies
            </Typography>
          </Box>
          <Tooltip title="Add new company">
            <IconButton
              onClick={handleOpenAddCompanyDialog}
              sx={{
                backgroundColor: (theme) => theme.palette.primary.main,
                color: "#fff",
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.primary.dark,
                },
                width: 32,
                height: 32,
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <TextField
          placeholder="Search companies"
          variant="outlined"
          fullWidth
          size="small"
          value={searchQuery}
          onChange={handleSearch}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: (theme) => theme.shape.borderRadius,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{ color: (theme) => theme.palette.text.secondary }}
                />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ mb: 1 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: (theme) => theme.palette.text.secondary,
              mb: 0.5,
            }}
          >
            Company Name
          </Typography>
        </Box>

        <Paper 
          elevation={0} 
          sx={{ 
            overflow: "hidden",
            mb: 3,
            maxHeight: "calc(100vh - 240px)",
            overflowY: "auto",
          }}
        >
          {companies.map((company, index) => {
            const companyProgress =
              company.updates === "loading"
                ? analysisProgressByCompany[company.id]
                : null;
            return (
            <React.Fragment key={company.id}>
              <AccountListItem
                onClick={() => handleCompanySelect(company)}
                sx={{ 
                  bgcolor:
                    selectedCompany?.id === company.id
                      ? (theme) => theme.palette.action.selected
                      : "transparent",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", minWidth: 40 }}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      backgroundColor:
                        company.color || stringToColor(company.companyName),
                      mr: 1,
                      border:
                        company.logoSrc !== "/images/avatar.png"
                          ? "1px solid rgba(0,0,0,0.1)"
                          : "none",
                    }}
                    src={
                      company.logoSrc !== "/images/avatar.png"
                        ? company.logoSrc
                        : undefined
                    }
                  >
                    {getInitials(company.companyName)}
                  </Avatar>
                  <Box sx={{ flex: 1, overflow: "hidden" }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {company.companyName}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      sx={{ display: "block" }}
                    >
                      {company.industry}
                    </Typography>
                  </Box>
                  <StatusLabel
                    status={company.updates}
                    sx={{ minWidth: 100, justifyContent: "center" }}
                  >
                    {company.updates === "loading" ? (
                      <>
                        <CircularProgress
                          size={12}
                          thickness={4}
                          variant={
                            companyProgress ? "determinate" : "indeterminate"
                          }
                          {...(companyProgress
                            ? {
                                value: Math.max(
                                  0,
                                  Math.min(
                                    100,
                                companyProgress.display || 0
                                  )
                                ),
                              }
                            : {})}
                          sx={{ mr: 0.75 }}
                        />
                        {companyProgress
                          ? `Processing ${Math.round(
                          companyProgress.display
                            )}%`
                          : "Processing"}
                      </>
                    ) : company.updates === "completed" ? (
                      "Analysis Complete"
                    ) : company.updates === "failed" ? (
                      "Analysis Failed"
                    ) : company.updates === "pending" ? (
                      "Pending"
                    ) : (
                      company.updates.charAt(0).toUpperCase() +
                      company.updates.slice(1)
                    )}
                  </StatusLabel>
                  {bookmarked.includes(company.id) && (
                    <BookmarkIcon
                      sx={{
                        ml: 1,
                        fontSize: 16,
                        color: (theme) => theme.palette.warning.main,
                      }}
                    />
                  )}
                </Box>
              </AccountListItem>
              {index < companies.length - 1 && <Divider />}
            </React.Fragment>
            );
          })}
        </Paper>
      </>
    );
  };

  const renderAccountDetails = () => {
    if (!selectedCompany) return null;

    const companyColor =
      selectedCompany.color || stringToColor(selectedCompany.companyName);
    const companyInitials = getInitials(selectedCompany.companyName);
    const selectedCompanyProgress =
      selectedCompany.id &&
      analysisProgressByCompany[selectedCompany.id] &&
      selectedCompany.updates === "loading"
        ? analysisProgressByCompany[selectedCompany.id]
        : null;

    return (
      <AnimatedContainer sx={{ width: "100%" }}>
        {/* Analysis Loading Overlay */}
        {analyzingCompany && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 5,
              pointerEvents: "none",
            }}
          >
            <Paper
              sx={{
                p: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                minWidth: 320,
                pointerEvents: "auto",
              }}
            >
              <CircularProgress
                size={64}
                thickness={5}
                variant="determinate"
                value={Math.max(0, Math.min(100, analysisProgress))}
              />
              <Typography variant="h6" fontWeight={600}>
                Analyzing Company
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ mb: 1 }}
              >
                {analysisStatusMessage}
              </Typography>
              <Box sx={{ width: "100%" }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.max(0, Math.min(100, analysisProgress))}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "rgba(0,0,0,0.08)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 4,
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", textAlign: "center", mt: 1 }}
                >
                  {Math.round(Math.max(0, Math.min(100, analysisProgress)))}%
                  complete
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}

        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <Link
            underline="hover"
            sx={{
              display: "flex",
              alignItems: "center",
              color: "text.primary",
              cursor: "pointer",
            }}
            onClick={handleBackToCompanies}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Companies
          </Link>
          <Typography
            color="text.primary"
            sx={{ display: "flex", alignItems: "center" }}
          >
            {selectedCompany.companyName}
          </Typography>
        </Breadcrumbs>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: (theme) => theme.shape.borderRadius,
            position: "relative",
            borderLeft: "4px solid",
            backgroundColor: (theme) => theme.palette.background.paper,
            borderColor: (theme) =>
              selectedCompany.updates === "completed"
                ? theme.palette.success.main
                : selectedCompany.updates === "failed"
                ? theme.palette.error.main
                : theme.palette.warning.main,
          }}
        >
          <BookmarkButton 
            size="small" 
            onClick={(e) => toggleBookmark(selectedCompany.id, e)}
            aria-label={
              bookmarked.includes(selectedCompany.id)
                ? "Remove bookmark"
                : "Add bookmark"
            }
          >
            {bookmarked.includes(selectedCompany.id) ? (
              <BookmarkIcon />
            ) : (
              <BookmarkBorderIcon />
            )}
          </BookmarkButton>

          <Box sx={{ display: "flex", width: "100%" }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                fontSize: "2rem",
                fontWeight: 700,
                backgroundColor: companyColor,
                mr: 3,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                border:
                  selectedCompany.logoSrc !== "/images/avatar.png"
                    ? "2px solid rgba(255,255,255,0.2)"
                    : "none",
              }}
              src={
                selectedCompany.logoSrc !== "/images/avatar.png"
                  ? selectedCompany.logoSrc
                  : undefined
              }
            >
              {companyInitials}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography variant="h5" fontWeight="inherit" gutterBottom>
                    {selectedCompany.companyName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedCompany.location}
                  </Typography>
                </Box>
                
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Button
                    variant="contained"
                    startIcon={
                      analyzingCompany ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <AnalyticsIcon />
                      )
                    }
                    onClick={handleAnalyzeCompany}
                    disabled={analyzingCompany}
                    sx={{
                      borderRadius: "6px",
                      textTransform: "none",
                      bgcolor: "#1976d2",
                      color: "#fff",
                      fontWeight: 500,
                      px: 2,
                      py: 1,
                      "&:hover": {
                        bgcolor: "#0d47a1",
                      },
                      "&:disabled": {
                        bgcolor: "#1976d2",
                        color: "#fff",
                        opacity: 0.7,
                      },
                    }}
                  >
                    {analyzingCompany ? "Analyzing..." : "Analyze Company"}
                  </Button>
                  
                  <Button
                    id="generate-outreach-button"
                    variant="outlined"
                    startIcon={
                      generatingOutreach ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <MessageIcon />
                      )
                    }
                    onClick={(event) =>
                      setOutreachMenuAnchor(event.currentTarget)
                    }
                    disabled={generatingOutreach !== null}
                    sx={{
                      borderRadius: "6px",
                      textTransform: "none",
                      borderColor: "#1976d2",
                      color: "#1976d2",
                      fontWeight: 500,
                      px: 2,
                      py: 1,
                      "&:hover": {
                        borderColor: "#0d47a1",
                        color: "#0d47a1",
                        backgroundColor: "rgba(25, 118, 210, 0.04)",
                      },
                      "&:disabled": {
                        borderColor: "#1976d2",
                        color: "#1976d2",
                        opacity: 0.7,
                      },
                    }}
                  >
                    {generatingOutreach
                      ? `Generating ${generatingOutreach}...`
                      : "Generate Outreach"}
                    <ExpandMoreIcon sx={{ ml: 0.5, fontSize: 16 }} />
                  </Button>

                  <Tooltip title="Account settings">
                    <IconButton onClick={handleAccountMenuOpen} size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={companyMenuAnchor}
                    open={Boolean(companyMenuAnchor)}
                    onClose={handleCloseCompanyMenu}
                    TransitionComponent={Fade}
                  >
                    <MenuItem onClick={handleEditCompany}>
                      <EditIcon sx={{ mr: 1.5, fontSize: 20 }} />
                      Edit Company
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={handleDeleteCompanyFromMenu}
                      sx={{ color: "error.main" }}
                    >
                      <DeleteIcon
                        sx={{ mr: 1.5, fontSize: 20, color: "error.main" }}
                      />
                      Delete Company
                    </MenuItem>
                  </Menu>

                  {/* Outreach Type Dropdown Menu */}
                  <Menu
                    anchorEl={outreachMenuAnchor}
                    open={Boolean(outreachMenuAnchor)}
                    onClose={handleOutreachMenuClose}
                    TransitionComponent={Fade}
                    PaperProps={{
                      sx: {
                        minWidth: 160,
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      },
                    }}
                  >
                    <MenuItem 
                      onClick={() => handleOutreachTypeSelect("email")}
                      disabled={generatingOutreach !== null}
                            sx={{
                        display: "flex", 
                        alignItems: "center", 
                        gap: 1,
                        py: 1.5,
                        px: 2,
                        opacity: generatingOutreach !== null ? 0.6 : 1,
                      }}
                    >
                      {generatingOutreach === "email" ? (
                        <CircularProgress size={18} sx={{ color: "#4caf50" }} />
                      ) : (
                        <EmailIcon sx={{ fontSize: 18, color: "#4caf50" }} />
                      )}
                      <Typography variant="body2" fontWeight={500}>
                        {generatingOutreach === "email"
                          ? "Generating..."
                          : "Email"}
                              </Typography>
                    </MenuItem>
                    <MenuItem 
                      onClick={() => handleOutreachTypeSelect("call")}
                      disabled={generatingOutreach !== null}
                                sx={{
                        display: "flex", 
                        alignItems: "center", 
                        gap: 1,
                        py: 1.5,
                        px: 2,
                        opacity: generatingOutreach !== null ? 0.6 : 1,
                      }}
                    >
                      {generatingOutreach === "call" ? (
                        <CircularProgress size={18} sx={{ color: "#ff9800" }} />
                      ) : (
                        <CallIcon sx={{ fontSize: 18, color: "#ff9800" }} />
                      )}
                      <Typography variant="body2" fontWeight={500}>
                        {generatingOutreach === "call"
                          ? "Generating..."
                          : "Call"}
                              </Typography>
                    </MenuItem>
                    <MenuItem 
                      onClick={() => handleOutreachTypeSelect("meeting")}
                      disabled={generatingOutreach !== null}
                                sx={{
                        display: "flex", 
                        alignItems: "center", 
                        gap: 1,
                        py: 1.5,
                        px: 2,
                        opacity: generatingOutreach !== null ? 0.6 : 1,
                      }}
                    >
                      {generatingOutreach === "meeting" ? (
                        <CircularProgress size={18} sx={{ color: "#9c27b0" }} />
                      ) : (
                        <MeetingRoomIcon
                          sx={{ fontSize: 18, color: "#9c27b0" }}
                        />
                      )}
                      <Typography variant="body2" fontWeight={500}>
                        {generatingOutreach === "meeting"
                          ? "Generating..."
                          : "Meeting"}
                    </Typography>
                    </MenuItem>
                  </Menu>
                  </Box>
                      </Box>
              
              <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
                {selectedCompany.updates === "loading" ? (
                  <StatusLabel status={selectedCompany.updates}>
                    <CircularProgress
                      size={14}
                      thickness={4}
                      variant={
                        selectedCompanyProgress ? "determinate" : "indeterminate"
                      }
                      {...(selectedCompanyProgress
                        ? {
                            value: Math.max(
                              0,
                              Math.min(
                                100,
                                selectedCompanyProgress.display || 0
                              )
                            ),
                          }
                        : {})}
                      sx={{ mr: 0.75 }}
                    />
                    {selectedCompanyProgress
                      ? `Processing ${Math.round(
                          selectedCompanyProgress.display
                        )}%`
                      : "Processing"}
                  </StatusLabel>
                ) : (
                  <StatusLabel status={selectedCompany.updates}>
                    {selectedCompany.updates === "completed"
                      ? "Analysis Complete"
                      : selectedCompany.updates === "failed"
                      ? "No Results Found"
                      : selectedCompany.updates.charAt(0).toUpperCase() +
                        selectedCompany.updates.slice(1)}
                  </StatusLabel>
                )}
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ mx: 2, height: "20px" }}
                />
                <Typography variant="body2" fontWeight={600}>
                  {selectedCompany.industry}
                    </Typography>
                  </Box>
                  </Box>
              </Box>
            </Paper>

        {/* Navigation Tabs */}
        <Paper
          elevation={0}
          sx={{ borderRadius: (theme) => theme.shape.borderRadius, mb: 3 }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
                  sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                py: 2,
              },
              "& .Mui-selected": {
                color: "#0A2647",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#0A2647",
                height: 3,
              },
            }}
          >
            <Tab
              label="Analysis"
              icon={<AssignmentIcon />}
              iconPosition="start"
            />
            <Tab label="News" icon={<ArticleIcon />} iconPosition="start" />
            <Tab label="Tasks" icon={<TaskIcon />} iconPosition="start" />
          </Tabs>
            </Paper>

        {/* Tab Content */}
        {activeTab === 0 && (
          <>
            {/* AI Account Analysis and Insights Panel Side by Side */}
            <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
              {/* AI-Generated Account Description Card */}
                <Paper 
                  elevation={0}
                  sx={{ 
                    borderRadius: (theme) => theme.shape.borderRadius, 
                  overflow: "hidden",
                  flex: 1,
                }}
              >
                <Box sx={{ p: 2, bgcolor: "#0A2647", color: "white" }}>
                <SectionTitle sx={{ mb: 1 }}>
                    <AssignmentIcon sx={{ color: "white", mr: 1 }} />
                  <Typography variant="h6" fontWeight={600} color="white">
                      Company Analysis
                  </Typography>
                </SectionTitle>
              </Box>

              <Box sx={{ p: 3 }}>
                {aiDescription.isLoading ? (
                  <>
                      <Skeleton
                        variant="text"
                        width="100%"
                        height={24}
                        sx={{ mb: 2 }}
                      />
                      <Skeleton
                        variant="text"
                        width="90%"
                        height={24}
                        sx={{ mb: 3 }}
                      />

                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        sx={{ mb: 1 }}
                      >
                      Key Strengths
                    </Typography>
                      <Skeleton
                        variant="text"
                        width="100%"
                        height={20}
                        sx={{ mb: 1 }}
                      />
                      <Skeleton
                        variant="text"
                        width="95%"
                        height={20}
                        sx={{ mb: 1 }}
                      />
                      <Skeleton
                        variant="text"
                        width="90%"
                        height={20}
                        sx={{ mb: 1 }}
                      />
                      <Skeleton
                        variant="text"
                        width="85%"
                        height={20}
                        sx={{ mb: 3 }}
                      />

                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        sx={{ mb: 1 }}
                      >
                      Opportunities
                    </Typography>
                      <Skeleton
                        variant="text"
                        width="100%"
                        height={20}
                        sx={{ mb: 1 }}
                      />
                      <Skeleton
                        variant="text"
                        width="95%"
                        height={20}
                        sx={{ mb: 1 }}
                      />
                      <Skeleton
                        variant="text"
                        width="90%"
                        height={20}
                        sx={{ mb: 1 }}
                      />
                      <Skeleton
                        variant="text"
                        width="85%"
                        height={20}
                        sx={{ mb: 1 }}
                      />
                  </>
                ) : (
                  <>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                      {aiDescription.summary}
                    </Typography>

                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        sx={{ mb: 1 }}
                      >
                      Key Strengths
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, mb: 3 }}>
                      {aiDescription.strengths.map((strength, index) => (
                        <Box component="li" key={index} sx={{ mb: 0.5 }}>
                            <Typography variant="body2">{strength}</Typography>
                        </Box>
                      ))}
                    </Box>

                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        sx={{ mb: 1 }}
                      >
                      Opportunities
                    </Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                        {aiDescription.opportunities.map(
                          (opportunity, index) => (
                        <Box component="li" key={index} sx={{ mb: 0.5 }}>
                          <Typography variant="body2">
                            {opportunity}
                          </Typography>
                        </Box>
                          )
                        )}
                    </Box>
                  </>
                )}
              </Box>
            </Paper>

            {/* Insights Panel */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: (theme) => theme.shape.borderRadius,
                  overflow: "hidden",
                  flex: 1,
                }}
              >
                <Box sx={{ p: 2, bgcolor: "#212121", color: "white" }}>
                <SectionTitle sx={{ mb: 1 }}>
                    <BarChartIcon sx={{ color: "white", mr: 1 }} />
                  <Typography variant="h6" fontWeight={600} color="white">
                    Insights Panel
                  </Typography>
                </SectionTitle>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color="rgba(255,255,255,0.8)"
                    >
                      {selectedCompany.location}
                  </Typography>
                  <Chip 
                    label="LIVE DATA" 
                    size="small"
                    sx={{ 
                      height: 20,
                        fontSize: "0.625rem",
                        bgcolor: "rgba(255,255,255,0.15)",
                        color: "white",
                    }}
                  />
                </Box>
              </Box>
              
              <Box sx={{ p: 3 }}>
                  {(selectedCompany.insights || mockInsights).map(
                    (insight, index) => (
                  <Paper 
                    key={index} 
                    elevation={0} 
                    sx={{ 
                      mb: 2, 
                        overflow: "hidden",
                      borderRadius: (theme) => theme.shape.borderRadius,
                        border: "1px solid #eee",
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 2, 
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          bgcolor: expandedInsights.includes(index)
                            ? "#f5f5f5"
                            : "transparent",
                          "&:hover": { bgcolor: "#f5f5f5" },
                      }}
                      onClick={() => toggleInsight(index)}
                    >
                      <Typography variant="body2" fontWeight={600}>
                          {index + 1}.{" "}
                          {insight.question.length > 60
                          ? `${insight.question.substring(0, 60)}...` 
                          : insight.question}
                      </Typography>
                      <ExpandMoreIcon 
                        sx={{ 
                            transform: expandedInsights.includes(index)
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                            transition: "transform 0.3s",
                        }} 
                      />
                    </Box>
                    <Collapse in={expandedInsights.includes(index)}>
                      <Box sx={{ px: 2, pb: 2 }}>
                            {(() => {
                              // Parse JSON strings from points
                              const formattedPoints: string[] = [];

                              insight.points.forEach((point) => {
                                if (
                                  !point ||
                                  (typeof point === "string" &&
                                    point.trim() === "")
                                )
                                  return;

                                // Format based on question type (case-insensitive check)
                                const questionLower =
                                  insight.question.toLowerCase();

                                // Handle "latest updates" question specifically - match any variation
                                if (
                                  questionLower.includes("latest update") ||
                                  questionLower.includes(
                                    "latest company update"
                                  )
                                ) {
                                  // Always try to extract using regex first for latest updates - this is most reliable
                                  if (
                                    typeof point === "string" &&
                                    point.trim().length > 0
                                  ) {
                                    const trimmedPoint = point.trim();

                                    // Try multiple regex patterns to ensure we catch all cases
                                    // Pattern 1: Match "update": "text" with proper escaping (handles escaped quotes)
                                    let updatePattern =
                                      /"update"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
                                    let match;
                                    let foundUpdates: string[] = [];

                                    updatePattern.lastIndex = 0;
                                    while (
                                      (match =
                                        updatePattern.exec(trimmedPoint)) !==
                                      null
                                    ) {
                                      if (match[1]) {
                                        const unescaped = match[1]
                                          .replace(/\\"/g, '"')
                                          .replace(/\\n/g, "\n")
                                          .replace(/\\t/g, "\t")
                                          .replace(/\\r/g, "\r")
                                          .replace(/\\\\/g, "\\");
                                        if (unescaped.trim().length > 0) {
                                          foundUpdates.push(unescaped.trim());
                                        }
                                      }
                                    }

                                    // Pattern 2: Simpler pattern - match text between quotes after "update":
                                    // This pattern matches: "update": "text" where text can contain escaped quotes
                                    if (foundUpdates.length === 0) {
                                      updatePattern =
                                        /"update"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
                                      updatePattern.lastIndex = 0;
                                      while (
                                        (match =
                                          updatePattern.exec(trimmedPoint)) !==
                                        null
                                      ) {
                                        if (match[1]) {
                                          const unescaped = match[1]
                                            .replace(/\\"/g, '"')
                                            .replace(/\\n/g, "\n")
                                            .replace(/\\t/g, "\t")
                                            .replace(/\\r/g, "\r")
                                            .replace(/\\\\/g, "\\");
                                          if (unescaped.trim().length > 0) {
                                            foundUpdates.push(unescaped.trim());
                                          }
                                        }
                                      }
                                    }

                                    // Pattern 3: Even simpler - match any text between quotes (non-greedy)
                                    if (foundUpdates.length === 0) {
                                      // Try to match: "update": "anything here" with non-greedy matching
                                      const simplePattern =
                                        /"update"\s*:\s*"((?:(?!",).)+?)"/g;
                                      simplePattern.lastIndex = 0;
                                      while (
                                        (match =
                                          simplePattern.exec(trimmedPoint)) !==
                                        null
                                      ) {
                                        if (
                                          match[1] &&
                                          match[1].trim().length > 0
                                        ) {
                                          foundUpdates.push(match[1].trim());
                                        }
                                      }
                                    }

                                    if (foundUpdates.length > 0) {
                                      foundUpdates.forEach((update) => {
                                        if (
                                          update &&
                                          update.trim().length > 0
                                        ) {
                                          formattedPoints.push(update.trim());
                                        }
                                      });
                                      // Return early if we found updates via regex
                                      return;
                                    }

                                    // If regex didn't work, try JSON parsing as fallback
                                    try {
                                      const parsed = JSON.parse(trimmedPoint);
                                      if (
                                        parsed &&
                                        parsed.updates &&
                                        Array.isArray(parsed.updates)
                                      ) {
                                        parsed.updates.forEach(
                                          (update: any) => {
                                            if (
                                              update &&
                                              typeof update === "object" &&
                                              update.update
                                            ) {
                                              formattedPoints.push(
                                                String(update.update).trim()
                                              );
                                            }
                                          }
                                        );
                                        if (formattedPoints.length > 0) return;
                                      }
                                    } catch (e) {
                                      // JSON parse failed, continue
                                    }

                                    // If nothing worked, don't show raw JSON
                                    return;
                                  } else if (
                                    typeof point === "object" &&
                                    point !== null
                                  ) {
                                    // Already an object, try to extract directly
                                    if (
                                      point.updates &&
                                      Array.isArray(point.updates)
                                    ) {
                                      point.updates.forEach((update: any) => {
                                        if (
                                          update &&
                                          typeof update === "object" &&
                                          update.update
                                        ) {
                                          formattedPoints.push(
                                            String(update.update).trim()
                                          );
                                        }
                                      });
                                      if (formattedPoints.length > 0) return;
                                    }
                                    // Try nested structure
                                    if (
                                      point.data &&
                                      point.data.updates &&
                                      Array.isArray(point.data.updates)
                                    ) {
                                      point.data.updates.forEach(
                                        (update: any) => {
                                          if (
                                            update &&
                                            typeof update === "object" &&
                                            update.update
                                          ) {
                                            formattedPoints.push(
                                              String(update.update).trim()
                                            );
                                          }
                                        }
                                      );
                                      if (formattedPoints.length > 0) return;
                                    }
                                  }

                                  // If all else fails, don't show raw JSON - just return without adding anything
                                  // This prevents raw JSON from being displayed
                                  return;
                                }

                                // Handle other question types
                                try {
                                  // Try to parse as JSON (handle both string and already parsed objects)
                                  let parsed;
                                  if (typeof point === "string") {
                                    // Check if it looks like JSON (starts with { or [)
                                    const trimmedPoint = point.trim();
                                    if (
                                      trimmedPoint.startsWith("{") ||
                                      trimmedPoint.startsWith("[")
                                    ) {
                                      try {
                                        parsed = JSON.parse(trimmedPoint);
                                      } catch (e) {
                                        // JSON parsing failed, use as plain text
                                        formattedPoints.push(point);
                                        return;
                                      }
                                    } else {
                                      // Not JSON format, use as plain text
                                      formattedPoints.push(point);
                                      return;
                                    }
                                  } else {
                                    parsed = point;
                                  }

                                  // Process other question types (challenges, decision-makers, etc.)
                                  if (questionLower.includes("challenge")) {
                                    // Extract challenges
                                    if (
                                      parsed.challenges &&
                                      Array.isArray(parsed.challenges)
                                    ) {
                                      parsed.challenges.forEach(
                                        (challenge: any) => {
                                          const challengeText =
                                            challenge.challenge ||
                                            String(challenge);
                                          const impact = challenge.impact
                                            ? ` (Impact: ${challenge.impact})`
                                            : "";
                                          formattedPoints.push(
                                            `${challengeText}${impact}`
                                          );
                                        }
                                      );
                                    } else {
                                      formattedPoints.push(String(point));
                                    }
                                  } else if (
                                    questionLower.includes("decision-maker") ||
                                    questionLower.includes("decision maker")
                                  ) {
                                    // Extract decision makers
                                    if (
                                      parsed &&
                                      parsed.decision_makers &&
                                      Array.isArray(parsed.decision_makers)
                                    ) {
                                      parsed.decision_makers.forEach(
                                        (person: any) => {
                                          const name = person.name || "";
                                          const role = person.role
                                            ? ` - ${person.role}`
                                            : "";
                                          formattedPoints.push(
                                            `${name}${role}`
                                          );
                                        }
                                      );
                                    } else {
                                      formattedPoints.push(String(point));
                                    }
                                  } else if (
                                    questionLower.includes("position")
                                  ) {
                                    // Extract market position
                                    if (parsed && parsed.description) {
                                      formattedPoints.push(parsed.description);
                                    }
                                    if (
                                      parsed &&
                                      parsed.competitors &&
                                      Array.isArray(parsed.competitors) &&
                                      parsed.competitors.length > 0
                                    ) {
                                      formattedPoints.push(
                                        `Competitors: ${parsed.competitors.join(
                                          ", "
                                        )}`
                                      );
                                    }
                                    if (parsed && parsed.market_share) {
                                      formattedPoints.push(
                                        `Market Share: ${parsed.market_share}`
                                      );
                                    }
                                    if (formattedPoints.length === 0 && point) {
                                      formattedPoints.push(String(point));
                                    }
                                  } else if (
                                    questionLower.includes("future plan")
                                  ) {
                                    // Extract future plans
                                    if (
                                      parsed &&
                                      parsed.plans &&
                                      Array.isArray(parsed.plans)
                                    ) {
                                      parsed.plans.forEach((plan: any) => {
                                        const planText =
                                          plan.plan || String(plan);
                                        const timeline = plan.timeline
                                          ? ` (Timeline: ${plan.timeline})`
                                          : "";
                                        formattedPoints.push(
                                          `${planText}${timeline}`
                                        );
                                      });
                                    } else {
                                      formattedPoints.push(String(point));
                                    }
                                  } else {
                                    // Fallback: use point as-is
                                    formattedPoints.push(String(point));
                                  }
                                } catch (e) {
                                  // Not JSON, use as plain text
                                  console.error(
                                    "Error parsing insight point:",
                                    e,
                                    point
                                  );
                                  formattedPoints.push(String(point));
                                }
                              });

                              // Display as bullet points
                              if (formattedPoints.length === 0) {
                                return (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontStyle: "italic" }}
                                  >
                                    No information available
                                  </Typography>
                                );
                              }

                              return (
                        <List dense sx={{ pl: 2, mt: 0 }}>
                                  {formattedPoints.map((point, i) => (
                              <ListItem
                                key={i}
                                sx={{
                                  display: "list-item",
                                  listStyleType: "disc",
                                  pl: 0,
                                  py: 0.5,
                                }}
                              >
                                      <Typography variant="body2">
                                        {point}
                                      </Typography>
                            </ListItem>
                          ))}
                        </List>
                              );
                            })()}
                      </Box>
                    </Collapse>
                  </Paper>
                    )
                  )}
              </Box>
            </Paper>
            </Box>

            {/* Suggested Solutions and Action Plan Side by Side */}
            <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
              {/* Suggested Solutions Box */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: (theme) => theme.shape.borderRadius,
                  p: 3,
                  flex: 1,
                }}
              >
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Suggested Solutions to Pitch
                </Typography>

                {selectedCompany.suggestedSolutions
                  ? (() => {
                      try {
                        const solutionsData =
                          typeof selectedCompany.suggestedSolutions === "string"
                            ? JSON.parse(selectedCompany.suggestedSolutions)
                            : selectedCompany.suggestedSolutions;

                        const solutions = solutionsData?.solutions || [];

                        if (solutions.length === 0) {
                          return (
                            <Typography variant="body2" color="text.secondary">
                              No solutions available.
                            </Typography>
                          );
                        }

                        return (
                          <Box>
                            {solutions.map((solution: any, index: number) => (
                              <Paper
                                key={index}
                                elevation={0}
                                sx={{
                                  mb: 2,
                                  p: 2.5,
                                  borderRadius: (theme) =>
                                    theme.shape.borderRadius,
                                  border: "1px solid #e0e0e0",
                                  bgcolor:
                                    appTheme === "dark"
                                      ? "rgba(255, 255, 255, 0.02)"
                                      : "#fff",
                                  transition: "all 0.2s ease-in-out",
                                  "&:hover": {
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                    borderColor: "#1976d2",
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    justifyContent: "space-between",
                                    mb: 1.5,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Box
                                      component="span"
                                      sx={{
                                        display: "inline-block",
                                        width: 10,
                                        height: 10,
                                        bgcolor: "#1976d2",
                                        borderRadius: "50%",
                                        mr: 1.5,
                                        mt: 0.7,
                                      }}
                                    />
                                    <Typography
                                      variant="body1"
                                      fontWeight={600}
                                    >
                                      {solution.solution || "Solution"}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={
                                      solution.relevance?.toUpperCase() ||
                                      "MEDIUM"
                                    }
                                    size="small"
                                    sx={{
                                      fontWeight: 600,
                                      bgcolor:
                                        solution.relevance === "high"
                                          ? "#e8f5e9"
                                          : solution.relevance === "medium"
                                          ? "#fff3e0"
                                          : "#f3e5f5",
                                      color:
                                        solution.relevance === "high"
                                          ? "#2e7d32"
                                          : solution.relevance === "medium"
                                          ? "#e65100"
                                          : "#7b1fa2",
                                    }}
                                  />
                                </Box>

                                {solution.value_proposition && (
                                  <Box
                                    sx={{
                                      pl: 2.5,
                                      borderLeft: "2px solid #1976d2",
                                      mt: 1.5,
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{
                                        display: "block",
                                        mb: 0.5,
                                        fontWeight: 600,
                                      }}
                                    >
                                      Value Proposition:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ lineHeight: 1.7 }}
                                    >
                                      {solution.value_proposition}
                                    </Typography>
                                  </Box>
                                )}
                              </Paper>
                            ))}
                          </Box>
                        );
                      } catch (error) {
                        return (
                  <Typography
                    variant="body2"
                    sx={{ 
                              whiteSpace: "pre-wrap",
                      lineHeight: 1.8,
                              color: "text.primary",
                    }}
                  >
                    {selectedCompany.suggestedSolutions}
                  </Typography>
                        );
                      }
                    })()
                  : mockSolutions.map((solution, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: (theme) => theme.shape.borderRadius,
                      border: "1px solid #eee",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        borderColor: "#ddd",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                      <Box
                        component="span"
                        sx={{
                          display: "inline-block",
                          width: 10,
                          height: 10,
                          bgcolor: "#0C4A6E",
                          borderRadius: "50%",
                          mr: 1.5,
                          mt: 0.7,
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          gutterBottom
                        >
                          {solution.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {solution.description}
                        </Typography>
                        <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                        >
                          <Button
                            variant="text"
                            size="small"
                            sx={{
                              textTransform: "none",
                              fontSize: "0.75rem",
                              color: "#000",
                              p: 0,
                            }}
                          >
                            View Details
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                    ))}
              </Paper>

              {/* Action Plan Box */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: (theme) => theme.shape.borderRadius,
                  overflow: "hidden",
                  flex: 1,
                }}
              >
                <Box sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                <SectionTitle sx={{ mb: 0 }}>
                    <AssignmentIcon sx={{ color: "#666", mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Action Plan
                  </Typography>
                </SectionTitle>
              </Box>
              
              <Box sx={{ p: 3 }}>
                {selectedCompany.actionPlan ? (
                    (() => {
                      try {
                        const actionPlanData =
                          typeof selectedCompany.actionPlan === "string"
                            ? JSON.parse(selectedCompany.actionPlan)
                            : selectedCompany.actionPlan;

                        const actionSteps = actionPlanData?.action_steps || [];

                        if (actionSteps.length === 0) {
                          return (
                            <Typography variant="body2" color="text.secondary">
                              No action plan available.
                            </Typography>
                          );
                        }

                        return (
                          <Box>
                            {actionSteps.map((step: any, index: number) => (
                              <Paper
                                key={index}
                                elevation={0}
                                sx={{
                                  mb: 2,
                                  p: 2.5,
                                  borderRadius: (theme) =>
                                    theme.shape.borderRadius,
                                  borderLeft: `4px solid ${
                                    step.priority === "high"
                                      ? "#d32f2f"
                                      : step.priority === "medium"
                                      ? "#ed6c02"
                                      : "#1976d2"
                                  }`,
                                  bgcolor:
                                    appTheme === "dark"
                                      ? "rgba(255, 255, 255, 0.02)"
                                      : "#fff",
                                  transition: "all 0.2s ease-in-out",
                                  "&:hover": {
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    mb: 1.5,
                                  }}
                                >
                                  <Chip
                                    label={`Step ${index + 1}`}
                                    size="small"
                                    sx={{
                                      mr: 1.5,
                                      fontWeight: 600,
                                      bgcolor:
                                        appTheme === "dark"
                                          ? "rgba(255, 255, 255, 0.1)"
                                          : "#f5f5f5",
                                    }}
                                  />
                                  <Chip
                                    label={
                                      step.priority?.toUpperCase() || "MEDIUM"
                                    }
                                    size="small"
                                    sx={{
                                      fontWeight: 600,
                                      bgcolor:
                                        step.priority === "high"
                                          ? "#ffebee"
                                          : step.priority === "medium"
                                          ? "#fff3e0"
                                          : "#e3f2fd",
                                      color:
                                        step.priority === "high"
                                          ? "#c62828"
                                          : step.priority === "medium"
                                          ? "#e65100"
                                          : "#1565c0",
                                    }}
                                  />
                                </Box>

                                <Typography
                                  variant="body1"
                                  fontWeight={600}
                                  sx={{ mb: 1.5, lineHeight: 1.6 }}
                                >
                                  {step.step || "Action step"}
                                </Typography>

                                {step.rationale && (
                                  <Box
                                    sx={{
                                      pl: 2,
                                      borderLeft: "2px solid #e0e0e0",
                                      mt: 1.5,
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{
                                        display: "block",
                                        mb: 0.5,
                                        fontWeight: 600,
                                      }}
                                    >
                                      Rationale:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ lineHeight: 1.7 }}
                                    >
                                      {step.rationale}
                                    </Typography>
                                  </Box>
                                )}
                              </Paper>
                            ))}
                          </Box>
                        );
                      } catch (error) {
                        return (
                  <Typography
                    variant="body2"
                    sx={{ 
                              whiteSpace: "pre-wrap",
                      lineHeight: 1.8,
                              color: "text.primary",
                    }}
                  >
                    {selectedCompany.actionPlan}
                  </Typography>
                        );
                      }
                    })()
                ) : (
                  <>
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 3, 
                      "& .MuiAlert-icon": { alignItems: "center" },
                      borderRadius: (theme) => theme.shape.borderRadius,
                  }}
                >
                        Personalized recommendations based on recent client
                        activity and market trends.
                </Alert>

                <Box sx={{ mb: 3 }}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      mb: 2, 
                      p: 3, 
                        bgcolor: "#fff",
                      borderRadius: (theme) => theme.shape.borderRadius, 
                        borderLeft: "3px solid #1a73e8",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontStyle: "italic", mb: 1, fontWeight: 500 }}
                      >
                            "We see that integrating your new customer data
                            platform has been a challenge. LSEG has a proven
                            AI-based solution that can accelerate the process by
                            30%."
                    </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", textAlign: "right" }}
                      >
                      Based on recent technology adoption
                    </Typography>
                  </Paper>
                  
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      mb: 2, 
                      p: 3, 
                        bgcolor: "#fff",
                      borderRadius: (theme) => theme.shape.borderRadius, 
                        borderLeft: "3px solid #1a73e8",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontStyle: "italic", mb: 1, fontWeight: 500 }}
                      >
                            "Given the rising regulatory compliance risks,
                            LSEG's compliance monitoring tools could help you
                            stay ahead of upcoming changes."
                    </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", textAlign: "right" }}
                      >
                      Addressing regulatory pressure
                    </Typography>
                  </Paper>
                  
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      mb: 2, 
                      p: 3, 
                        bgcolor: "#fff",
                      borderRadius: (theme) => theme.shape.borderRadius, 
                        borderLeft: "3px solid #1a73e8",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontStyle: "italic", mb: 1, fontWeight: 500 }}
                      >
                        "We noticed your upcoming expansion into Latin
                            America—LSEG provides tailored financial data
                            solutions for emerging markets that can enhance your
                            market entry strategy."
                    </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", textAlign: "right" }}
                      >
                      Strategic market expansion
                    </Typography>
                  </Paper>
                </Box>
                </>
                )}
              </Box>
                  </Paper>
                </Box>
          </>
        )}

        {/* News Tab Content */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              Latest News & Articles
            </Typography>

            {/* Show real articles if available */}
            {selectedCompany.articles && (
              <>
                {/* Directly Relevant Articles */}
                {selectedCompany.articles.directly_relevant &&
                  selectedCompany.articles.directly_relevant.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Chip
                      label={`Directly Relevant (${selectedCompany.articles.directly_relevant.length})`}
                      color="success"
                      sx={{ mb: 2, fontWeight: 600 }}
                    />
                    <Grid container spacing={3}>
                        {selectedCompany.articles.directly_relevant.map(
                          (article, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Paper
                            elevation={0}
                    sx={{
                              p: 3,
                                  borderRadius: (theme) =>
                                    theme.shape.borderRadius,
                              border: "1px solid #eee",
                                  "&:hover": {
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                  },
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  gutterBottom
                                >
                              {article.title}
                            </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: "block", mb: 1 }}
                                >
                                  {article.source} •{" "}
                                  {article.published_date || "Unknown date"}
                            </Typography>
                  <Button
                              size="small"
                              component="a"
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ mt: 1, textTransform: "none" }}
                            >
                              Read More
                            </Button>
                          </Paper>
                        </Grid>
                          )
                        )}
                    </Grid>
                  </Box>
                )}

                {/* Indirectly Useful Articles */}
                {selectedCompany.articles.indirectly_useful &&
                  selectedCompany.articles.indirectly_useful.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Chip
                      label={`Indirectly Useful (${selectedCompany.articles.indirectly_useful.length})`}
                      color="warning"
                      sx={{ mb: 2, fontWeight: 600 }}
                    />
                    <Grid container spacing={3}>
                        {selectedCompany.articles.indirectly_useful.map(
                          (article, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Paper
                            elevation={0}
                    sx={{
                              p: 3,
                                  borderRadius: (theme) =>
                                    theme.shape.borderRadius,
                              border: "1px solid #eee",
                                  "&:hover": {
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                  },
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  gutterBottom
                                >
                              {article.title}
                            </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: "block", mb: 1 }}
                                >
                                  {article.source} •{" "}
                                  {article.published_date || "Unknown date"}
                            </Typography>
                  <Button
                              size="small"
                              component="a"
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ mt: 1, textTransform: "none" }}
                            >
                              Read More
                            </Button>
                          </Paper>
                        </Grid>
                          )
                        )}
                    </Grid>
                  </Box>
                )}

                {/* Not Relevant Articles */}
                {selectedCompany.articles.not_relevant &&
                  selectedCompany.articles.not_relevant.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Chip
                      label={`Not Relevant (${selectedCompany.articles.not_relevant.length})`}
                      color="default"
                      sx={{ mb: 2, fontWeight: 600 }}
                    />
                    <Grid container spacing={3}>
                        {selectedCompany.articles.not_relevant.map(
                          (article, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Paper
                            elevation={0}
                    sx={{
                              p: 3,
                                  borderRadius: (theme) =>
                                    theme.shape.borderRadius,
                              border: "1px solid #eee",
                                  "&:hover": {
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                  },
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  gutterBottom
                                >
                              {article.title}
                            </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: "block", mb: 1 }}
                                >
                                  {article.source} •{" "}
                                  {article.published_date || "Unknown date"}
                            </Typography>
                            <Button
                              size="small"
                              component="a"
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ mt: 1, textTransform: "none" }}
                            >
                              Read More
                  </Button>
            </Paper>
                        </Grid>
                          )
                        )}
                    </Grid>
                  </Box>
                )}
              </>
            )}

            {/* Show placeholder if no articles available */}
            {(!selectedCompany.articles || 
              (!selectedCompany.articles.directly_relevant?.length && 
               !selectedCompany.articles.indirectly_useful?.length && 
               !selectedCompany.articles.not_relevant?.length)) && (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="body1" color="text.secondary">
                  No articles available. Please run the analysis to fetch
                  articles.
              </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Tasks Tab Content */}
        {activeTab === 2 && (
          <Box>
                    <Box
                      sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                My Tasks for {selectedCompany?.companyName}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  const taskText = prompt("Enter task description:");
                  if (taskText) {
                    setCompanyTasks([
                      ...companyTasks,
                      { id: Date.now(), text: taskText, completed: false },
                    ]);
                  }
                }}
                    sx={{
                  textTransform: "none",
                  bgcolor: "#0A2647",
                  "&:hover": { bgcolor: "#0d3461" },
                }}
              >
                Add Task
              </Button>
                </Box>

            {companyTasks.length === 0 ? (
              <Paper
                elevation={0}
                  sx={{
                  p: 6,
                  textAlign: "center",
                  borderRadius: (theme) => theme.shape.borderRadius,
                  border: "1px dashed #ddd",
                }}
              >
                <TaskIcon sx={{ fontSize: 48, color: "#ccc", mb: 2 }} />
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No tasks yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add tasks to track your work with this company
                </Typography>
              </Paper>
            ) : (
              <Paper
                elevation={0}
                  sx={{
                  borderRadius: (theme) => theme.shape.borderRadius,
                  border: "1px solid #eee",
                }}
              >
                <List>
                  {companyTasks.map((task, index) => (
                    <React.Fragment key={task.id}>
                      <ListItem
                  sx={{
                          py: 2,
                          px: 3,
                          "&:hover": { bgcolor: "#f9f9f9" },
                          textDecoration: task.completed
                            ? "line-through"
                            : "none",
                          opacity: task.completed ? 0.6 : 1,
                        }}
                      >
                        <IconButton
                          edge="start"
                          onClick={() => {
                            setCompanyTasks(
                              companyTasks.map((t) =>
                                t.id === task.id
                                  ? { ...t, completed: !t.completed }
                                  : t
                              )
                            );
                          }}
                          sx={{ mr: 2 }}
                        >
                          {task.completed ? (
                            <CheckBoxIcon color="primary" />
                          ) : (
                            <CheckBoxOutlineBlankIcon />
                          )}
                        </IconButton>
                        <ListItemText
                          primary={task.text}
                          primaryTypographyProps={{
                            variant: "body1",
                            fontWeight: task.completed ? 400 : 500,
                          }}
                        />
                        <IconButton
                          edge="end"
                          onClick={() => {
                            setCompanyTasks(
                              companyTasks.filter((t) => t.id !== task.id)
                            );
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItem>
                      {index < companyTasks.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
            </Paper>
            )}

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {companyTasks.filter((t) => t.completed).length} of{" "}
                {companyTasks.length} tasks completed
              </Typography>
          </Box>
        </Box>
        )}
      </AnimatedContainer>
    );
  };

  const theme = useMuiTheme();
  const { mode } = useTheme();

  return (
    <CompaniesContainer>
      <PageTransition
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 64px)",
          overflow: "hidden",
          position: "relative",
        }}
      >
          {/* Header commun qui reste toujours visible */}
          <Header>
            <Box>
              <Typography 
                variant="h4" 
                fontWeight="inherit" 
                sx={{ 
                position: "relative",
                "&::after": {
                    content: '""',
                  position: "absolute",
                    bottom: -8,
                    left: 0,
                    width: 40,
                    height: 4,
                  backgroundColor: "primary.main",
                    borderRadius: 2,
                },
                }}
              >
              Companies
              </Typography>
              {/* Removed subtitle text */}
            </Box>
            
            {!detailsView ? (
            <Box display="flex" alignItems="center" gap={1}>
              <Tooltip title="Add new company">
                <IconButton
                  onClick={handleAddCompany}
                  sx={{
                    backgroundColor: (theme) => theme.palette.secondary.main,
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: (theme) => theme.palette.secondary.dark,
                    },
                    width: 32,
                    height: 32,
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
                <SearchBar
                placeholder="Search companies"
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                      <SearchIcon
                        sx={{ color: (theme) => theme.palette.text.secondary }}
                      />
                      </InputAdornment>
                    ),
                  }}
                />
                <ActionButton
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                  sx={{
                  borderColor: Object.values(filters).some(
                    (arr) => arr.length > 0
                  )
                    ? "primary.main"
                    : undefined,
                  color: Object.values(filters).some((arr) => arr.length > 0)
                    ? "primary.main"
                    : undefined,
                  fontWeight: Object.values(filters).some(
                    (arr) => arr.length > 0
                  )
                    ? 600
                    : undefined,
                }}
              >
                Filter{" "}
                {Object.values(filters).some((arr) => arr.length > 0) &&
                  `(${Object.values(filters).reduce(
                    (acc, arr) => acc + arr.length,
                    0
                  )})`}
                </ActionButton>
                <Menu
                  anchorEl={filterMenuAnchor}
                  open={Boolean(filterMenuAnchor)}
                  onClose={() => setFilterMenuAnchor(null)}
                  TransitionComponent={Fade}
                  slotProps={{
                    paper: {
                      sx: {
                        mt: 1,
                        width: 300,
                        maxHeight: 500,
                      overflow: "auto",
                    },
                  },
                  }}
                >
                  <Box sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1.5,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      Filters
                    </Typography>
                    {Object.values(filters).some((arr) => arr.length > 0) && (
                        <Button
                          size="small"
                          onClick={clearAllFilters}
                        sx={{ textTransform: "none", fontSize: "0.75rem" }}
                        >
                          Clear All
                        </Button>
                      )}
                    </Box>

                    <Divider sx={{ mb: 1.5 }} />

                    {/* Status Filter */}
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Status
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}
                  >
                    {["completed", "pending", "failed", "loading"].map(
                      (status) => (
                        <Chip
                          key={status}
                          label={
                            status === "completed"
                              ? "Complete"
                              : status === "pending"
                              ? "Pending"
                              : status === "failed"
                              ? "Failed"
                              : "Processing"
                          }
                          size="small"
                          onClick={() => handleFilterChange("status", status)}
                          color={
                            filters.status.includes(status as any)
                              ? "primary"
                              : "default"
                          }
                          variant={
                            filters.status.includes(status as any)
                              ? "filled"
                              : "outlined"
                          }
                          sx={{
                            borderRadius: "4px",
                            height: "24px",
                            fontSize: "0.75rem",
                          }}
                        />
                      )
                    )}
                    </Box>

                    {/* Location Filter */}
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Location
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      mb: 2,
                      maxHeight: 100,
                      overflow: "auto",
                    }}
                  >
                    {dynamicFilterOptions.locations
                      .slice(0, 15)
                      .map((location) => (
                        <Chip
                          key={location}
                          label={location.split(",")[0]} // Show only city name to save space
                          size="small"
                          onClick={() =>
                            handleFilterChange("location", location)
                          }
                          color={
                            filters.location.includes(location)
                              ? "primary"
                              : "default"
                          }
                          variant={
                            filters.location.includes(location)
                              ? "filled"
                              : "outlined"
                          }
                          sx={{
                            borderRadius: "4px",
                            height: "24px",
                            fontSize: "0.75rem",
                          }}
                        />
                      ))}
                    </Box>

                  {/* Industry Filter */}
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Industry
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}
                  >
                    {dynamicFilterOptions.industries.map((type) => (
                        <Chip
                          key={type}
                          label={type}
                          size="small"
                        onClick={() => handleFilterChange("industry", type)}
                        color={
                          filters.industry.includes(type)
                            ? "primary"
                            : "default"
                        }
                        variant={
                          filters.industry.includes(type)
                            ? "filled"
                            : "outlined"
                        }
                          sx={{
                          borderRadius: "4px",
                          height: "24px",
                          fontSize: "0.75rem",
                          }}
                        />
                      ))}
                    </Box>

                    {/* Product Family Filter */}
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Product Family
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      mb: 1,
                      maxHeight: 100,
                      overflow: "auto",
                    }}
                  >
                      {dynamicFilterOptions.productFamilies.map((family) => (
                        <Chip
                          key={family}
                          label={family}
                          size="small"
                        onClick={() =>
                          handleFilterChange("productFamily", family)
                        }
                        color={
                          filters.productFamily.includes(family)
                            ? "primary"
                            : "default"
                        }
                        variant={
                          filters.productFamily.includes(family)
                            ? "filled"
                            : "outlined"
                        }
                          sx={{
                          borderRadius: "4px",
                          height: "24px",
                          fontSize: "0.75rem",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Divider />

                <Box
                  sx={{ p: 1.5, display: "flex", justifyContent: "flex-end" }}
                >
                    <Button
                      size="small"
                      onClick={() => setFilterMenuAnchor(null)}
                      variant="contained"
                    sx={{ textTransform: "none" }}
                    >
                      Apply Filters
                    </Button>
                  </Box>
                </Menu>
                {multipleDeleteMode ? (
                  <>
                    <ActionButton
                      variant="outlined"
                      color="error"
                    disabled={selectedCompanies.length === 0}
                    onClick={handleDeleteMultipleCompanies}
                      startIcon={<DeleteIcon />}
                    >
                    Delete ({selectedCompanies.length})
                    </ActionButton>
                    <ActionButton
                      variant="outlined"
                      onClick={toggleMultipleDeleteMode}
                    >
                      Cancel
                    </ActionButton>
                  </>
                ) : (
                  <>
                    <ActionButton
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                    onClick={handleOpenAddCompanyDialog}
                    >
                      Add Account
                    </ActionButton>
                  </>
                )}
              </Box>
            ) : (
              <IconButton 
              onClick={handleBackToCompanies}
                sx={{ 
                bgcolor: "action.hover",
                "&:hover": {
                  bgcolor: "action.focus",
                },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
          </Header>

        <Box
          sx={{
            display: "flex",
            flex: 1,
            overflow: "hidden",
            mt: 0,
            pt: 0,
          }}
        >
            {/* Section de liste des comptes - réduite mais toujours visible en mode détails */}
            <PageTransition
              sx={{
              width: detailsView ? "280px" : "100%",
              transition: theme.transitions.create(["width"], {
                  easing: theme.transitions.easing.easeInOut,
                  duration: theme.transitions.duration.standard,
                }),
              overflow: "hidden",
                mr: detailsView ? 3 : 0,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              }}
            >
              {!detailsView ? (
                <>
                  {/* Removed Filters title */}

                  <TabsContainer
                    sx={{
                    position: "sticky",
                      top: 0,
                      zIndex: 2,
                    backgroundColor: (theme) =>
                      theme.palette.background.default,
                      mt: 0,
                    }}
                  >
                    <Tabs 
                      value={tabValue} 
                      onChange={handleTabChange}
                      indicatorColor="primary"
                      textColor="primary"
                    >
                      <StyledTab 
                        label={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          All Companies <TabCount>{companies.length}</TabCount>
                          </Box>
                        } 
                      />
                      <StyledTab 
                        label={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            Completed <TabCount>{completedCount}</TabCount>
                          </Box>
                        } 
                      />
                      <StyledTab 
                        label={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            Failed <TabCount>{failedCount}</TabCount>
                          </Box>
                        } 
                      />
                      <StyledTab 
                        label={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          Processing <TabCount>{processingCount}</TabCount>
                          </Box>
                        } 
                      />
                    </Tabs>
                  </TabsContainer>

                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: (theme) => theme.shape.borderRadius,
                    overflow: "hidden",
                      flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    }}
                  >
                    <TableContainer
                      ref={tableContainerRef}
                      sx={{
                      height: "calc(100vh - 160px)",
                        flex: 1,
                      overflowY: "auto",
                      "&::-webkit-scrollbar": {
                        width: "8px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.2)"
                            : "rgba(0,0,0,0.2)",
                        borderRadius: "4px",
                      },
                      "&::-webkit-scrollbar-track": {
                        backgroundColor: "transparent",
                        },
                      }}
                    >
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            {multipleDeleteMode && (
                              <TableHeader sx={{ width: 50, py: 1.5 }}>
                                <Checkbox
                                  size="small"
                                indeterminate={
                                  selectedCompanies.length > 0 &&
                                  selectedCompanies.length <
                                    sortedCompanies.length
                                }
                                checked={
                                  selectedCompanies.length > 0 &&
                                  selectedCompanies.length ===
                                    sortedCompanies.length
                                }
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                    // Select all companies
                                    setSelectedCompanies(
                                      sortedCompanies.map(
                                        (company) => company.id
                                      )
                                    );
                                    } else {
                                    // Deselect all companies
                                    setSelectedCompanies([]);
                                    }
                                  }}
                                />
                              </TableHeader>
                            )}
                          <TableHeader
                            onClick={() => handleSort("companyName")}
                            sx={{
                              cursor: "pointer",
                              pl: multipleDeleteMode ? 1 : 3,
                              py: 1.5,
                            }}
                          >
                              <Box display="flex" alignItems="center">
                              Account Name {getSortIcon("companyName")}
                              </Box>
                            </TableHeader>
                          <TableHeader
                            onClick={() => handleSort("location")}
                            sx={{ cursor: "pointer", py: 1.5 }}
                          >
                              <Box display="flex" alignItems="center">
                              Location {getSortIcon("location")}
                              </Box>
                            </TableHeader>
                          <TableHeader
                            onClick={() => handleSort("industry")}
                            sx={{ cursor: "pointer", py: 1.5 }}
                          >
                              <Box display="flex" alignItems="center">
                              Organisation Type {getSortIcon("industry")}
                              </Box>
                            </TableHeader>
                          <TableHeader
                            onClick={() => handleSort("updates")}
                            sx={{ cursor: "pointer", pr: 3, py: 1.5 }}
                          >
                              <Box display="flex" alignItems="center">
                              Updates {getSortIcon("updates")}
                              </Box>
                            </TableHeader>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                        {loading
                          ? Array.from(new Array(5)).map((_, index) => (
                              <TableRow key={index}>
                                <TableContent sx={{ py: 1 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Skeleton
                                      variant="rounded"
                                      width={28}
                                      height={28}
                                      sx={{ mr: 2 }}
                                    />
                                    <Skeleton variant="text" width={120} />
                                  </Box>
                                </TableContent>
                                <TableContent sx={{ py: 1 }}>
                                  <Skeleton variant="text" width={150} />
                                </TableContent>
                                <TableContent sx={{ py: 1 }}>
                                  <Skeleton variant="text" width={100} />
                                </TableContent>
                                <TableContent sx={{ py: 1 }}>
                                  <Skeleton
                                    variant="rounded"
                                    width={80}
                                    height={24}
                                  />
                                </TableContent>
                              </TableRow>
                            ))
                          : sortedCompanies
                              .slice(0, displayLimit)
                              .map((company) => {
                                const companyProgress =
                                  analysisProgressByCompany[company.id];
                                return (
                              <TableRow
                                  key={company.id}
                                hover
                                  onClick={() => handleCompanySelect(company)}
                                sx={{
                                    cursor: "pointer",
                                    transition: (theme) =>
                                      theme.transitions.create(
                                        ["background-color"],
                                        {
                                          duration:
                                            theme.transitions.duration.shortest,
                                        }
                                      ),
                                    bgcolor:
                                      multipleDeleteMode &&
                                      selectedCompanies.includes(company.id)
                                        ? (theme) =>
                                            theme.palette.action.selected
                                        : selectedCompany?.id === company.id
                                        ? (theme) =>
                                            theme.palette.action.selected
                                        : "transparent",
                                }}
                              >
                                {multipleDeleteMode && (
                                  <TableContent sx={{ width: 50, py: 1 }}>
                                    <Checkbox
                                      size="small"
                                        checked={selectedCompanies.includes(
                                          company.id
                                        )}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                          handleToggleAccountSelection(
                                            company.id
                                          );
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </TableContent>
                                )}
                                  <TableContent
                                    sx={{
                                      pl: multipleDeleteMode ? 1 : 3,
                                      py: 1,
                                    }}
                                  >
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      sx={{ position: "relative" }}
                                    >
                                    <Avatar
                                      sx={{
                                        width: 28,
                                        height: 28,
                                        fontWeight: 600,
                                          fontSize: "0.75rem",
                                          backgroundColor:
                                            company.color ||
                                            stringToColor(company.companyName),
                                        mr: 1.5,
                                          border:
                                            company.logoSrc !==
                                            "/images/avatar.png"
                                              ? "1px solid rgba(0,0,0,0.1)"
                                              : "none",
                                        }}
                                        src={
                                          company.logoSrc !==
                                          "/images/avatar.png"
                                            ? company.logoSrc
                                            : undefined
                                        }
                                      >
                                        {getInitials(company.companyName)}
                                    </Avatar>
                                      <Box
                                        sx={{ maxWidth: 150, minWidth: 120 }}
                                      >
                                        <Typography
                                          variant="body2"
                                          fontWeight={600}
                                          noWrap
                                        >
                                          {company.companyName}
                                      </Typography>
                                    </Box>
                                    <IconButton
                                      size="small"
                                      sx={{ ml: 1, p: 0.5 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                          toggleBookmark(company.id, e);
                                        }}
                                      >
                                        {bookmarked.includes(company.id) ? (
                                          <BookmarkIcon
                                            fontSize="small"
                                            color="warning"
                                          />
                                        ) : (
                                          <BookmarkBorderIcon
                                            fontSize="small"
                                            color="disabled"
                                          />
                                        )}
                                    </IconButton>
                                  </Box>
                                </TableContent>
                                <TableContent sx={{ py: 1 }}>
                                    <Typography
                                      variant="body2"
                                      noWrap
                                      sx={{ maxWidth: 120 }}
                                    >
                                      {company.location}
                                          </Typography>
                                </TableContent>
                                <TableContent sx={{ py: 1 }}>
                                    {company.industry}
                                </TableContent>
                                <TableContent sx={{ pr: 3, py: 1 }}>
                                    {company.updates === "loading" ? (
                                      <StatusLabel
                                        status={company.updates}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Filter by processing (loading + pending)
                                          setTabValue(3);
                                        }}
                                        sx={{
                                          cursor: "pointer",
                                          "&:hover": {
                                            opacity: 0.8,
                                            transform: "scale(1.05)",
                                          },
                                          transition: "all 0.2s ease",
                                        }}
                                      >
                                        <CircularProgress
                                          size={12}
                                          thickness={4}
                                          variant={
                                            companyProgress
                                              ? "determinate"
                                              : "indeterminate"
                                          }
                                          {...(companyProgress
                                            ? {
                                                value: Math.max(
                                                  0,
                                                  Math.min(
                                                    100,
                                                    companyProgress.display || 0
                                                  )
                                                ),
                                              }
                                            : {})}
                                          sx={{ mr: 0.75 }}
                                        />
                                        {companyProgress
                                          ? `Processing ${Math.round(
                                              companyProgress.display
                                            )}%`
                                          : "Processing"}
                                    </StatusLabel>
                                  ) : (
                                      <StatusLabel
                                        status={company.updates}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Filter by status
                                          if (company.updates === "completed") {
                                            setTabValue(1);
                                          } else if (
                                            company.updates === "failed"
                                          ) {
                                            setTabValue(2);
                                          } else if (
                                            company.updates === "pending" ||
                                            company.updates === "loading"
                                          ) {
                                            setTabValue(3);
                                          }
                                        }}
                                        sx={{
                                          cursor: "pointer",
                                          "&:hover": {
                                            opacity: 0.8,
                                            transform: "scale(1.05)",
                                          },
                                          transition: "all 0.2s ease",
                                        }}
                                      >
                                        <StatusIndicator
                                          status={company.updates}
                                        />
                                        {company.updates === "completed"
                                          ? "Analysis Complete"
                                          : company.updates === "failed"
                                          ? "Analysis Failed"
                                          : company.updates === "loading"
                                          ? "Processing"
                                          : company.updates === "pending"
                                          ? "Pending"
                                          : company.updates
                                              .charAt(0)
                                              .toUpperCase() +
                                            company.updates.slice(1)}
                                    </StatusLabel>
                                  )}
                                </TableContent>
                                  <TableContent
                                    sx={{ pr: 3, py: 1, width: 48 }}
                                  >
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMenuCompany(company);
                                      setCompanyMenuAnchor(e.currentTarget);
                                    }}
                                      sx={{ color: "text.secondary" }}
                                  >
                                    <MoreVertIcon fontSize="small" />
                                  </IconButton>
                                </TableContent>
                              </TableRow>
                                );
                              })}
                        {!loading && displayLimit < sortedCompanies.length && (
                            <TableRow>
                            <TableCell
                              colSpan={4}
                              align="center"
                              sx={{ py: 2 }}
                            >
                                <CircularProgress size={24} thickness={4} />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1 }}
                              >
                                Loading more companies...
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        {!loading && sortedCompanies.length === 0 && (
                            <TableRow>
                            <TableContent
                              colSpan={4}
                              align="center"
                              sx={{ py: 6 }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <BusinessIcon
                                  sx={{
                                    fontSize: 64,
                                    color: "text.secondary",
                                    opacity: 0.5,
                                  }}
                                />
                                <Typography
                                  variant="h6"
                                  color="text.secondary"
                                  gutterBottom
                                >
                                  No companies found
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 2 }}
                                >
                                  Add companies to get started
                                </Typography>
                                <Button
                                  variant="outlined"
                                  startIcon={<AddIcon />}
                                  onClick={handleAddCompany}
                                  sx={{
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1,
                                    textTransform: "none",
                                    fontSize: "0.9rem",
                                    fontWeight: 500,
                                  }}
                                >
                                  Add Company
                                </Button>
                              </Box>
                              </TableContent>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </>
              ) : (
                <Paper 
                  elevation={0}
                  sx={{ 
                  height: "100%",
                    borderRadius: (theme) => theme.shape.borderRadius,
                    p: 3,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  }}
                >
                  {renderAccountList()}
                </Paper>
              )}
            </PageTransition>

            {/* Section de détails du compte - visible uniquement en mode détails */}
            {detailsView && (
              <PageTransition
                sx={{ 
                  flex: 1,
                  opacity: animatingTransition ? 0 : 1,
                transform: animatingTransition
                  ? "translateX(20px)"
                  : "translateX(0)",
                transition: theme.transitions.create(["opacity", "transform"], {
                    easing: theme.transitions.easing.easeInOut,
                    duration: theme.transitions.duration.standard,
                  }),
                overflow: "auto",
                height: "100%",
                }}
              >
                {loading ? (
                  <Box sx={{ p: 3 }}>
                  <Skeleton
                    variant="rectangular"
                    height={140}
                    sx={{
                      borderRadius: (theme) => theme.shape.borderRadius,
                      mb: 3,
                    }}
                  />
                  <Box sx={{ display: "flex", gap: 3 }}>
                    <Box sx={{ width: "60%" }}>
                      <Skeleton
                        variant="rectangular"
                        height={200}
                        sx={{
                          borderRadius: (theme) => theme.shape.borderRadius,
                          mb: 3,
                        }}
                      />
                      <Skeleton
                        variant="rectangular"
                        height={300}
                        sx={{
                          borderRadius: (theme) => theme.shape.borderRadius,
                        }}
                      />
                      </Box>
                    <Box sx={{ width: "40%" }}>
                      <Skeleton
                        variant="rectangular"
                        height={400}
                        sx={{
                          borderRadius: (theme) => theme.shape.borderRadius,
                          mb: 3,
                        }}
                      />
                      <Skeleton
                        variant="rectangular"
                        height={100}
                        sx={{
                          borderRadius: (theme) => theme.shape.borderRadius,
                        }}
                      />
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  renderAccountDetails()
                )}
              </PageTransition>
            )}
          </Box>
        </PageTransition>

        {/* Campaign Inbox Dialog */}
        <Dialog
          open={campaignView.open}
          onClose={handleCloseCampaignView}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: (theme) => theme.shape.borderRadius,
            height: "80vh",
            maxHeight: "80vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            pb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ArticleIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Campaign Inbox</Typography>
            {campaigns.filter((c) => !c.isRead).length > 0 && (
                <Chip
                label={campaigns.filter((c) => !c.isRead).length}
                  size="small"
                  sx={{
                    ml: 1,
                  bgcolor: "primary.main",
                  color: "white",
                  fontWeight: "bold",
                    height: 20,
                  minWidth: 20,
                  }}
                />
              )}
            </Box>
            <Box>
              <Button
              variant={campaignView.filter === "all" ? "contained" : "outlined"}
                size="small"
              onClick={() => handleCampaignFilterChange("all")}
              sx={{ mr: 1, textTransform: "none" }}
              >
                All
              </Button>
              <Button
              variant={
                campaignView.filter === "unread" ? "contained" : "outlined"
              }
                size="small"
              onClick={() => handleCampaignFilterChange("unread")}
              sx={{ mr: 1, textTransform: "none" }}
              >
                Unread
              </Button>
              <Button
              variant={
                campaignView.filter === "read" ? "contained" : "outlined"
              }
                size="small"
              onClick={() => handleCampaignFilterChange("read")}
              sx={{ mr: 1, textTransform: "none" }}
              >
                Read
              </Button>
            <IconButton
              edge="end"
              onClick={handleCloseCampaignView}
              aria-label="close"
            >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
        <DialogContent dividers sx={{ p: 0, display: "flex", height: "100%" }}>
          <Box
            sx={{
              width: "300px",
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              height: "100%",
              overflow: "auto",
            }}
          >
              {/* Campaign List */}
              <List disablePadding>
                {campaigns.length === 0 ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      No campaigns yet. Generate templates to see them here.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {/* Unread Campaigns Section */}
                  {campaigns.filter((c) => !c.isRead).length > 0 &&
                    (campaignView.filter === "all" ||
                      campaignView.filter === "unread") && (
                      <>
                        <Box
                          sx={{
                          p: 1.5,
                            bgcolor: "rgba(25, 118, 210, 0.05)",
                            borderBottom: (theme) =>
                              `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            color="primary"
                          >
                            NEW ({campaigns.filter((c) => !c.isRead).length})
                          </Typography>
                        </Box>
                        {campaigns
                          .filter((campaign) => !campaign.isRead)
                          .map((campaign) => (
                            <ListItem
                              key={campaign.id}
                              button
                              selected={
                                campaignView.selectedCampaignId === campaign.id
                              }
                              onClick={() => handleCampaignSelect(campaign.id)}
                              sx={{
                                borderBottom: (theme) =>
                                  `1px solid ${theme.palette.divider}`,
                                bgcolor: "rgba(25, 118, 210, 0.05)",
                                py: 1.5,
                              }}
                            >
                              <ListItemAvatar sx={{ minWidth: 40 }}>
                                <ArticleIcon color="primary" />
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    sx={{
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {campaign.title}
                                  </Typography>
                                }
                                secondary={
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{
                                        display: "block",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {campaign.description}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {new Date(
                                        campaign.createdAt
                                      ).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                }
                              />
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  bgcolor: "error.main",
                                  ml: 1,
                                }}
                              />
                            </ListItem>
                          ))}
                      </>
                    )}

                    {/* Read Campaigns Section */}
                  {campaigns.filter((c) => c.isRead).length > 0 &&
                    (campaignView.filter === "all" ||
                      campaignView.filter === "read") && (
                      <>
                        <Box
                          sx={{
                          p: 1.5,
                            bgcolor: "rgba(0, 0, 0, 0.02)",
                            borderBottom: (theme) =>
                              `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            color="text.secondary"
                          >
                            EARLIER ({campaigns.filter((c) => c.isRead).length})
                          </Typography>
                        </Box>
                        {campaigns
                          .filter((campaign) => campaign.isRead)
                          .map((campaign) => (
                            <ListItem
                              key={campaign.id}
                              button
                              selected={
                                campaignView.selectedCampaignId === campaign.id
                              }
                              onClick={() => handleCampaignSelect(campaign.id)}
                              sx={{
                                borderBottom: (theme) =>
                                  `1px solid ${theme.palette.divider}`,
                                py: 1.5,
                              }}
                            >
                              <ListItemAvatar sx={{ minWidth: 40 }}>
                                <ArticleIcon color="primary" />
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {campaign.title}
                                  </Typography>
                                }
                                secondary={
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{
                                        display: "block",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {campaign.description}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {new Date(
                                        campaign.createdAt
                                      ).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                      </>
                    )}

                    {/* No Results Message */}
                  {((campaignView.filter === "unread" &&
                    campaigns.filter((c) => !c.isRead).length === 0) ||
                    (campaignView.filter === "read" &&
                      campaigns.filter((c) => c.isRead).length === 0)) && (
                    <Box sx={{ p: 3, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          No {campaignView.filter} campaigns found.
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </List>
            </Box>
          <Box sx={{ flexGrow: 1, height: "100%", overflow: "auto", p: 0 }}>
              {/* Campaign Detail */}
              {campaignView.selectedCampaignId ? (
                (() => {
                const selectedCampaign = campaigns.find(
                  (c) => c.id === campaignView.selectedCampaignId
                );
                  if (!selectedCampaign) return null;

                  return (
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      sx={{
                        p: 3,
                        borderBottom: (theme) =>
                          `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {selectedCampaign.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {selectedCampaign.description}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Chip
                              label={
                                selectedCampaign.type === "email"
                                  ? "Email Template"
                                  : selectedCampaign.type === "call"
                                  ? "Call Script"
                                  : "Meeting Points"
                              }
                                size="small"
                                sx={{
                                  mr: 1,
                                bgcolor:
                                  selectedCampaign.type === "email"
                                    ? "rgba(25, 118, 210, 0.1)"
                                    : selectedCampaign.type === "call"
                                    ? "rgba(46, 125, 50, 0.1)"
                                    : "rgba(106, 27, 154, 0.1)",
                                color:
                                  selectedCampaign.type === "email"
                                    ? "primary.main"
                                    : selectedCampaign.type === "call"
                                    ? "success.main"
                                    : "secondary.main",
                                }}
                              />
                              <Chip
                              label={selectedCampaign.companyName}
                                size="small"
                                sx={{ mr: 1 }}
                              />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Created on{" "}
                              {new Date(
                                selectedCampaign.createdAt
                              ).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        <IconButton
                          onClick={() =>
                            handleDeleteCampaign(selectedCampaign.id)
                          }
                        >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    <Box sx={{ p: 3, flexGrow: 1, overflow: "auto" }}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 3,
                          whiteSpace: "pre-wrap",
                          fontFamily: "monospace",
                          fontSize: "0.875rem",
                          lineHeight: 1.6,
                          }}
                        >
                          {selectedCampaign.content}
                        </Paper>
                      </Box>
                    <Box
                      sx={{
                        p: 2,
                        borderTop: (theme) =>
                          `1px solid ${theme.palette.divider}`,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                        <Button
                          variant="outlined"
                          startIcon={<CloudUploadIcon />}
                          sx={{ mr: 1 }}
                        >
                          Use Template
                        </Button>
                      <Button variant="contained" startIcon={<ArticleIcon />}>
                          Send Email
                        </Button>
                      </Box>
                    </Box>
                  );
                })()
              ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <ArticleIcon
                    sx={{
                      fontSize: 60,
                      color: "text.secondary",
                      mb: 2,
                      opacity: 0.3,
                    }}
                  />
                    <Typography variant="h6" color="text.secondary">
                      Select a campaign to view
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your AI-generated templates will appear here
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>
        </Dialog>

        {/* Add Company Dialog */}
        <Dialog
          open={addCompanyDialogOpen}
          onClose={handleCloseAddCompany}
          maxWidth="sm"
          fullWidth
        >
        <DialogTitle>Add New Company</DialogTitle>
          <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
              <TextField
                label="Company Name *"
                value={addCompanyForm.name}
              onChange={(e) =>
                setAddCompanyForm({ ...addCompanyForm, name: e.target.value })
              }
                fullWidth
                required
              />
              <TextField
                label="Location"
                value={addCompanyForm.location}
              onChange={(e) =>
                setAddCompanyForm({
                  ...addCompanyForm,
                  location: e.target.value,
                })
              }
                fullWidth
              />
              <TextField
                label="Industry"
                value={addCompanyForm.industry}
              onChange={(e) =>
                setAddCompanyForm({
                  ...addCompanyForm,
                  industry: e.target.value,
                })
              }
                fullWidth
              />
              <TextField
                label="Website"
                value={addCompanyForm.website}
              onChange={(e) =>
                setAddCompanyForm({
                  ...addCompanyForm,
                  website: e.target.value,
                })
              }
                fullWidth
                type="url"
              />
              <TextField
                label="Description"
                value={addCompanyForm.description}
              onChange={(e) =>
                setAddCompanyForm({
                  ...addCompanyForm,
                  description: e.target.value,
                })
              }
                fullWidth
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddCompany}>Cancel</Button>
            <Button
              onClick={handleSaveNewCompany} 
              variant="contained"
              disabled={!addCompanyForm.name}
            >
              Add Company
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Company Dialog */}
        <Dialog
          open={editCompanyDialogOpen}
          onClose={handleCloseEditCompany}
          maxWidth="sm"
                fullWidth
        >
        <DialogTitle>Edit Company</DialogTitle>
          <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
              <TextField
                label="Company Name *"
                value={editCompanyForm.name}
              onChange={(e) =>
                setEditCompanyForm({ ...editCompanyForm, name: e.target.value })
              }
                fullWidth
                required
              />
              <TextField
                label="Location"
                value={editCompanyForm.location}
              onChange={(e) =>
                setEditCompanyForm({
                  ...editCompanyForm,
                  location: e.target.value,
                })
              }
                fullWidth
              />
              <TextField
                label="Industry"
                value={editCompanyForm.industry}
              onChange={(e) =>
                setEditCompanyForm({
                  ...editCompanyForm,
                  industry: e.target.value,
                })
              }
                fullWidth
              />
              <TextField
                label="Website"
                value={editCompanyForm.website}
              onChange={(e) =>
                setEditCompanyForm({
                  ...editCompanyForm,
                  website: e.target.value,
                })
              }
                fullWidth
                type="url"
              />
              <TextField
                label="Description"
                value={editCompanyForm.description}
              onChange={(e) =>
                setEditCompanyForm({
                  ...editCompanyForm,
                  description: e.target.value,
                })
              }
                fullWidth
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditCompany}>Cancel</Button>
            <Button
              onClick={handleSaveEditCompany} 
              variant="contained"
              disabled={!editCompanyForm.name}
            >
              Update Company
            </Button>
          </DialogActions>
        </Dialog>

        {/* Company Menu (for list items) */}
        <Menu
          anchorEl={companyMenuAnchor}
          open={Boolean(companyMenuAnchor)}
          onClose={handleCloseCompanyMenu}
          TransitionComponent={Fade}
        >
          <MenuItem onClick={handleEditCompany}>
            <EditIcon sx={{ mr: 1.5, fontSize: 20 }} />
            Edit Company
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={handleDeleteCompanyFromMenu}
            sx={{ color: "error.main" }}
          >
            <DeleteIcon sx={{ mr: 1.5, fontSize: 20, color: "error.main" }} />
            Delete Company
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>
            {multipleDeleteMode
              ? `Delete ${selectedCompanies.length} Companies?`
              : "Delete Company?"}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {multipleDeleteMode
                ? `Are you sure you want to delete ${selectedCompanies.length} companies? This action cannot be undone.`
                : "Are you sure you want to delete this company? This action cannot be undone."}
            </Typography>
          </DialogContent>
          <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={confirmDeleteCompanies}
              variant="contained"
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification for AI processing completion */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          sx={{
          minWidth: "320px",
          maxWidth: "400px",
          }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            variant="filled"
            sx={{
            width: "100%",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            padding: "12px 16px",
            "& .MuiAlert-icon": {
              display: "none",
            },
            "& .MuiAlert-action": {
              padding: "0 0 0 8px",
              marginRight: 0,
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start" }}>
            {notification.companyId && (
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    fontWeight: 600,
                  fontSize: "0.875rem",
                    backgroundColor: (theme) => {
                    const company = companies.find(
                      (a) => a.id === notification.companyId
                    );
                    return (
                      company?.color ||
                      stringToColor(company?.companyName || "")
                    );
                    },
                    mr: 1.5,
                    mt: 0.5,
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
                src={
                  companies.find((a) => a.id === notification.companyId)
                    ?.logoSrc !== "/images/avatar.png"
                    ? companies.find((a) => a.id === notification.companyId)
                        ?.logoSrc
                    : undefined
                }
              >
                {getInitials(
                  companies.find((a) => a.id === notification.companyId)
                    ?.companyName || ""
                )}
                </Avatar>
              )}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                  {notification.message}
                </Typography>
              {notification.companyId && (
                  <Box sx={{ mt: 1 }}>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => {
                      const company = companies.find(
                        (a) => a.id === notification.companyId
                      );
                      if (company) {
                        handleCompanySelect(company);
                          handleCloseNotification();
                        }
                      }}
                      sx={{
                      color: "inherit",
                      textTransform: "none",
                        fontWeight: 600,
                      fontSize: "0.75rem",
                      padding: "2px 8px",
                      minWidth: "auto",
                        opacity: 0.9,
                      "&:hover": {
                          opacity: 1,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                      }}
                    startIcon={<VisibilityIcon sx={{ fontSize: "0.875rem" }} />}
                    >
                      View Account Details
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </Alert>
        </Snackbar>

        {/* Add Account Dialog */}
        <Dialog
        open={openAddCompanyDialog}
        onClose={handleCloseAddCompanyDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: muiTheme.shape.borderRadius,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          },
          }}
        >
        <DialogTitle
          sx={{
            borderBottom: `1px solid ${muiTheme.palette.divider}`,
            px: 3,
            py: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
              <Typography variant="h6" fontWeight="600">
                Add New Account
              </Typography>
            <IconButton onClick={handleCloseAddCompanyDialog} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
          <Stepper activeStep={addCompanyStep} sx={{ mb: 4, mt: 1 }}>
              <Step>
                <StepLabel>Select Method</StepLabel>
              </Step>
              <Step>
                <StepLabel>Account Details</StepLabel>
              </Step>
              <Step>
                <StepLabel>Review & Create</StepLabel>
              </Step>
            </Stepper>

            {/* Step 1: Select Method */}
          {addCompanyStep === 0 && (
              <Box>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                How would you like to add companies?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose whether to add a single company or import multiple
                companies from a CSV file.
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                      border: `1px solid ${muiTheme.palette.divider}`,
                        borderRadius: muiTheme.shape.borderRadius,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: muiTheme.palette.primary.main,
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                      },
                    }}
                    onClick={() => setAddCompanyStep(1)}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                          backgroundColor: "rgba(25, 118, 210, 0.1)",
                            color: muiTheme.palette.primary.main,
                          mb: 2,
                          }}
                        >
                          <BusinessIcon />
                        </Avatar>
                      <Typography
                        variant="subtitle1"
                        fontWeight="600"
                        gutterBottom
                      >
                          Add Single Account
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                        Create a new company by filling out a form with company
                        details.
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                      border: `1px solid ${muiTheme.palette.divider}`,
                        borderRadius: muiTheme.shape.borderRadius,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: muiTheme.palette.primary.main,
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                      },
                      }}
                      onClick={() => {
                      setAddCompanyStep(1);
                        // Trigger file input click
                        if (fileInputRef.current) {
                          fileInputRef.current.click();
                        }
                      }}
                    >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                          backgroundColor: "rgba(25, 118, 210, 0.1)",
                            color: muiTheme.palette.primary.main,
                          mb: 2,
                          }}
                        >
                          <CloudUploadIcon />
                        </Avatar>
                      <Typography
                        variant="subtitle1"
                        fontWeight="600"
                        gutterBottom
                      >
                          Import from CSV
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                        Upload a CSV file to import multiple companies at once.
                        </Typography>
                        <VisuallyHiddenInput
                          type="file"
                          accept=".csv"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                        />
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Step 2: Account Details Form */}
          {addCompanyStep === 1 && !csvFile && (
              <Box>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                  Enter Account Details
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Fill out the form below with the company information.
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                    label="Company Name"
                    name="companyName"
                    value={newCompany.companyName || ""}
                    onChange={handleCompanyFormChange}
                      fullWidth
                      required
                    error={!!companyFormErrors.companyName}
                    helperText={companyFormErrors.companyName}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Location"
                      name="location"
                    value={newCompany.location || ""}
                    onChange={handleCompanyFormChange}
                      fullWidth
                      required
                    error={!!companyFormErrors.location}
                    helperText={companyFormErrors.location}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    required
                    error={!!companyFormErrors.industry}
                  >
                    <InputLabel>Industry</InputLabel>
                      <Select
                      name="industry"
                      value={newCompany.industry || ""}
                        onChange={handleAccountTypeChange}
                      label="Industry"
                      >
                      {dynamicFilterOptions.industries.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    {companyFormErrors.organisationType && (
                      <FormHelperText>
                        {companyFormErrors.organisationType}
                      </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                  <FormControl
                    fullWidth
                    required
                    error={!!companyFormErrors.productFamily}
                  >
                      <InputLabel>Product Family</InputLabel>
                      <Select
                        name="productFamily"
                      value={newCompany.productFamily || ""}
                        onChange={handleAccountTypeChange}
                        label="Product Family"
                      >
                        {dynamicFilterOptions.productFamilies.map((family) => (
                          <MenuItem key={family} value={family}>
                            {family}
                          </MenuItem>
                        ))}
                      </Select>
                    {companyFormErrors.productFamily && (
                      <FormHelperText>
                        {companyFormErrors.productFamily}
                      </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Step 2 (Alternative): CSV Import */}
          {addCompanyStep === 1 && csvFile && (
              <Box>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                  CSV Import
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Map the columns from your CSV file to company fields.
                </Typography>

                {importErrors.length > 0 && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="medium">
                      There were errors with your CSV file:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
                      {importErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </Box>
                  </Alert>
                )}

                {csvPreview.length > 0 && (
                  <>
                  <Typography
                    variant="subtitle2"
                    fontWeight="600"
                    sx={{ mt: 3, mb: 1 }}
                  >
                      File Preview
                    </Typography>

                    <CSVPreviewTable>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            {csvPreview[0].map((header, index) => (
                              <TableCell key={index}>
                                <Box>
                                  <Typography variant="caption" fontWeight="bold">
                                    {header}
                                  </Typography>
                                <FormControl
                                  fullWidth
                                  size="small"
                                  sx={{ mt: 1 }}
                                >
                                    <InputLabel>Map to</InputLabel>
                                    <Select
                                    value={csvMapping[header] || ""}
                                    onChange={(e) =>
                                      handleMappingChange(
                                        header,
                                        e.target.value
                                      )
                                    }
                                      label="Map to"
                                      size="small"
                                    >
                                      <MenuItem value="">
                                        <em>Skip</em>
                                      </MenuItem>
                                    <MenuItem value="companyName">
                                      Company Name
                                    </MenuItem>
                                    <MenuItem value="location">
                                      Location
                                    </MenuItem>
                                    <MenuItem value="industry">
                                      Industry
                                    </MenuItem>
                                    <MenuItem value="productFamily">
                                      Product Family
                                    </MenuItem>
                                    </Select>
                                  </FormControl>
                                </Box>
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {csvPreview.slice(1).map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <TableCell key={cellIndex}>{cell}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CSVPreviewTable>

                  <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<UploadFileIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        sx={{ mr: 2 }}
                      >
                        Change File
                      </Button>
                      <Typography variant="body2" color="text.secondary">
                        {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            )}

            {/* Step 3: Review & Create */}
          {addCompanyStep === 2 && !csvFile && (
              <Box>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                  Review Account Details
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please review the company information before creating.
                </Typography>

                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: `1px solid ${muiTheme.palette.divider}`,
                    borderRadius: muiTheme.shape.borderRadius,
                  mb: 3,
                  }}
                >
                  <Grid container spacing={2}>
                  <Grid
                    item
                    xs={12}
                    display="flex"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          fontWeight: 600,
                        fontSize: "1rem",
                        backgroundColor: stringToColor(
                          newCompany.companyName || ""
                        ),
                          mr: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                      {getInitials(newCompany.companyName || "")}
                      </Avatar>
                      <Typography variant="h6" fontWeight="600">
                      {newCompany.companyName}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                      {newCompany.location}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                      Industry
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                      {newCompany.industry}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Product Family
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                      {newCompany.productFamily}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            )}
          </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${muiTheme.palette.divider}`,
          }}
        >
          {addCompanyStep > 0 && (
              <Button onClick={handlePreviousStep} sx={{ mr: 1 }}>
                Back
              </Button>
            )}

            <Box sx={{ flex: 1 }} />

          <Button onClick={handleCloseAddCompanyDialog} sx={{ mr: 1 }}>
              Cancel
            </Button>

          {addCompanyStep < 2 && (
              <Button
                variant="contained"
                onClick={handleNextStep}
              disabled={
                addCompanyStep === 1 && csvFile && csvPreview.length === 0
              }
              >
                Next
              </Button>
            )}

          {addCompanyStep === 2 && !csvFile && (
              <Button
                variant="contained"
              onClick={handleCreateCompany}
                startIcon={<AddIcon />}
              >
                Create Account
              </Button>
            )}

          {addCompanyStep === 2 && csvFile && (
              <Button
                variant="contained"
              onClick={handleImportCompanies}
              startIcon={
                importInProgress ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <FileUploadIcon />
                )
              }
                disabled={importInProgress}
              >
              {importInProgress ? "Importing..." : "Import Companies"}
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Flying Icon Animation */}
        <FlyingIconAnimation
          isActive={showAnimation}
          iconType={animationIconType}
          startElement={animationStartElement}
          endElement={animationEndElement}
          onAnimationComplete={() => {
            setShowAnimation(false);
            setAnimationStartElement(null);
            setAnimationEndElement(null);
          }}
        />
    </CompaniesContainer>
  );
};

export default Companies;
