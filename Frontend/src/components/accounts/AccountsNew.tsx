import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Tooltip,
  Divider,
  Alert,
  Snackbar,
  styled
} from '@mui/material';
import { CloseIcon, ContentCopyIcon } from '../icons/FallbackIcons';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import { useTheme } from '../../context/ThemeContext';
import { BORDER_RADIUS, TRANSITIONS } from '../ui/common/constants';

// Define the Account interface
interface Account {
  id: number;
  name: string;
  industry: string;
  location: string;
  size: string;
  status: 'active' | 'inactive' | 'pending';
  contacts: number;
  dateAdded: string;
  logo?: string;
}

// Generate a color based on the account name
const getAccountColor = (name: string): string => {
  const colors = [
    '#4285F4', // Google Blue
    '#EA4335', // Google Red
    '#FBBC05', // Google Yellow
    '#34A853', // Google Green
    '#8A2BE2', // Purple
    '#FF6347', // Tomato
    '#2E8B57', // Sea Green
    '#4682B4', // Steel Blue
    '#D2691E', // Chocolate
    '#9370DB', // Medium Purple
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Get initials from name
const getInitials = (name: string): string => {
  if (!name) return '';
  
  const parts = name.split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Sample data
const sampleAccounts: Account[] = [
  {
    id: 1,
    name: 'Acme Corporation',
    industry: 'Technology',
    location: 'New York, USA',
    size: 'Enterprise',
    status: 'active',
    contacts: 12,
    dateAdded: '2023-10-15',
    logo: 'https://via.placeholder.com/40'
  },
  {
    id: 2,
    name: 'Global Industries',
    industry: 'Manufacturing',
    location: 'Chicago, USA',
    size: 'Enterprise',
    status: 'active',
    contacts: 8,
    dateAdded: '2023-09-22'
  },
  {
    id: 3,
    name: 'Tech Innovators',
    industry: 'Technology',
    location: 'San Francisco, USA',
    size: 'Mid-Market',
    status: 'active',
    contacts: 5,
    dateAdded: '2023-11-05'
  },
  {
    id: 4,
    name: 'Financial Solutions',
    industry: 'Finance',
    location: 'London, UK',
    size: 'Enterprise',
    status: 'inactive',
    contacts: 3,
    dateAdded: '2023-08-30'
  },
  {
    id: 5,
    name: 'Healthcare Plus',
    industry: 'Healthcare',
    location: 'Boston, USA',
    size: 'Mid-Market',
    status: 'active',
    contacts: 7,
    dateAdded: '2023-10-10'
  },
  {
    id: 6,
    name: 'Retail Experts',
    industry: 'Retail',
    location: 'Seattle, USA',
    size: 'Small Business',
    status: 'pending',
    contacts: 2,
    dateAdded: '2023-11-12'
  },
  {
    id: 7,
    name: 'Media Group',
    industry: 'Media',
    location: 'Los Angeles, USA',
    size: 'Mid-Market',
    status: 'active',
    contacts: 6,
    dateAdded: '2023-09-15'
  },
  {
    id: 8,
    name: 'Construction Partners',
    industry: 'Construction',
    location: 'Dallas, USA',
    size: 'Small Business',
    status: 'inactive',
    contacts: 4,
    dateAdded: '2023-07-20'
  }
];

// Styled components
const StatusChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'accountStatus'
})<{ accountStatus: 'active' | 'inactive' | 'pending' }>(({ theme, accountStatus }) => ({
  borderRadius: BORDER_RADIUS.pill,
  fontWeight: 600,
  fontSize: '0.75rem',
  height: 24,
  backgroundColor: 
    accountStatus === 'active' 
      ? theme.palette.mode === 'dark' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(46, 204, 113, 0.1)'
      : accountStatus === 'inactive'
        ? theme.palette.mode === 'dark' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(231, 76, 60, 0.1)'
        : theme.palette.mode === 'dark' ? 'rgba(241, 196, 15, 0.2)' : 'rgba(241, 196, 15, 0.1)',
  color: 
    accountStatus === 'active' 
      ? '#2ecc71'
      : accountStatus === 'inactive'
        ? '#e74c3c'
        : '#f1c40f',
  '& .MuiChip-label': {
    padding: '0 8px'
  }
}));

const AccountsNew: React.FC = () => {
  const { mode } = useTheme();
  const [accounts, setAccounts] = useState<Account[]>(sampleAccounts);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<Account>>({
    name: '',
    industry: '',
    location: '',
    size: '',
    status: 'active'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, accountId: number) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedAccountId(accountId);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedAccountId(null);
  };

  // Handle opening the add account dialog
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  // Handle closing the add account dialog
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewAccount({
      name: '',
      industry: '',
      location: '',
      size: '',
      status: 'active'
    });
  };

  // Handle opening the import dialog
  const handleOpenImportDialog = () => {
    setOpenImportDialog(true);
  };

  // Handle closing the import dialog
  const handleCloseImportDialog = () => {
    setOpenImportDialog(false);
    setCsvFile(null);
    setCsvPreview([]);
    setImportError(null);
  };

  // Handle input change for new account
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    setNewAccount({
      ...newAccount,
      [name as string]: value
    });
  };

  // Handle adding a new account
  const handleAddAccount = () => {
    if (!newAccount.name || !newAccount.industry || !newAccount.location || !newAccount.size) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    const newId = Math.max(...accounts.map(account => account.id), 0) + 1;
    const today = new Date().toISOString().split('T')[0];
    
    const accountToAdd: Account = {
      id: newId,
      name: newAccount.name,
      industry: newAccount.industry,
      location: newAccount.location,
      size: newAccount.size as string,
      status: newAccount.status as 'active' | 'inactive' | 'pending',
      contacts: 0,
      dateAdded: today
    };

    setAccounts([...accounts, accountToAdd]);
    handleCloseAddDialog();
    
    setSnackbar({
      open: true,
      message: 'Account added successfully',
      severity: 'success'
    });
  };

  // Handle deleting an account
  const handleDeleteAccount = () => {
    if (selectedAccountId) {
      setAccounts(accounts.filter(account => account.id !== selectedAccountId));
      handleMenuClose();
      
      setSnackbar({
        open: true,
        message: 'Account deleted successfully',
        severity: 'success'
      });
    }
  };

  // Handle closing the snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Handle file selection for CSV import
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setCsvFile(file);
      
      // Read the file to preview
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n');
          const parsedData = lines.map(line => line.split(',').map(cell => cell.trim()));
          
          // Validate CSV format
          if (parsedData.length < 2) {
            setImportError('CSV file must contain at least a header row and one data row');
            setCsvPreview([]);
            return;
          }
          
          const headers = parsedData[0];
          const requiredHeaders = ['name', 'industry', 'location', 'size', 'status'];
          const missingHeaders = requiredHeaders.filter(header => !headers.map(h => h.toLowerCase()).includes(header));
          
          if (missingHeaders.length > 0) {
            setImportError(`Missing required headers: ${missingHeaders.join(', ')}`);
            setCsvPreview([]);
            return;
          }
          
          setImportError(null);
          setCsvPreview(parsedData.slice(0, 6)); // Show first 5 rows plus header
        } catch (error) {
          setImportError('Error parsing CSV file');
          setCsvPreview([]);
        }
      };
      reader.readAsText(file);
    }
  };

  // Handle importing accounts from CSV
  const handleImportAccounts = () => {
    if (!csvFile || csvPreview.length < 2) {
      setImportError('Please select a valid CSV file');
      return;
    }
    
    try {
      const headers = csvPreview[0].map(header => header.toLowerCase());
      const nameIndex = headers.indexOf('name');
      const industryIndex = headers.indexOf('industry');
      const locationIndex = headers.indexOf('location');
      const sizeIndex = headers.indexOf('size');
      const statusIndex = headers.indexOf('status');
      
      if (nameIndex === -1 || industryIndex === -1 || locationIndex === -1 || sizeIndex === -1 || statusIndex === -1) {
        setImportError('CSV file must contain name, industry, location, size, and status columns');
        return;
      }
      
      // Read the entire file
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const parsedData = lines.map(line => line.split(',').map(cell => cell.trim()));
        
        // Skip header row
        const dataRows = parsedData.slice(1).filter(row => row.length >= Math.max(nameIndex, industryIndex, locationIndex, sizeIndex, statusIndex) + 1);
        
        const newAccounts: Account[] = dataRows.map((row, index) => {
          const status = row[statusIndex].toLowerCase();
          const validStatus: 'active' | 'inactive' | 'pending' = 
            status === 'active' ? 'active' : 
            status === 'inactive' ? 'inactive' : 'pending';
          
          return {
            id: Math.max(...accounts.map(account => account.id), 0) + index + 1,
            name: row[nameIndex],
            industry: row[industryIndex],
            location: row[locationIndex],
            size: row[sizeIndex],
            status: validStatus,
            contacts: 0,
            dateAdded: new Date().toISOString().split('T')[0]
          };
        });
        
        setAccounts([...accounts, ...newAccounts]);
        handleCloseImportDialog();
        
        setSnackbar({
          open: true,
          message: `Successfully imported ${newAccounts.length} accounts`,
          severity: 'success'
        });
      };
      reader.readAsText(csvFile);
    } catch (error) {
      setImportError('Error importing accounts from CSV');
    }
  };

  // Filter accounts based on search query and tab
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = 
      tabValue === 0 || // All accounts
      (tabValue === 1 && account.status === 'active') || // Active accounts
      (tabValue === 2 && account.status === 'inactive') || // Inactive accounts
      (tabValue === 3 && account.status === 'pending'); // Pending accounts
    
    return matchesSearch && matchesTab;
  });

  return (
    <Box sx={{
      width: '100%',
      height: '100vh',
      backgroundColor: 'background.default',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      padding: '0 24px', // Add consistent horizontal padding
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            Accounts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your client accounts and organizations
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon sx={{ fontSize: 20 }} />}
            onClick={handleOpenImportDialog}
            sx={{
              borderRadius: BORDER_RADIUS.md,
              textTransform: 'none',
              fontWeight: 'bold',
              borderColor: mode === 'dark' ? 'white' : 'black',
              color: mode === 'dark' ? 'white' : 'black',
              borderWidth: '1.5px',
              transition: TRANSITIONS.medium,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
                borderColor: mode === 'dark' ? 'white' : 'black',
                borderWidth: '1.5px',
                bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              }
            }}
          >
            Import CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: 20 }} />}
            onClick={handleOpenAddDialog}
            sx={{
              borderRadius: BORDER_RADIUS.md,
              textTransform: 'none',
              fontWeight: 'bold',
              boxShadow: 'none',
              transition: TRANSITIONS.medium,
              bgcolor: mode === 'dark' ? 'white' : 'black',
              color: mode === 'dark' ? 'black' : 'white',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
              }
            }}
          >
            Add Account
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ px: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0'
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              minWidth: 100,
              transition: 'all 0.2s ease',
              '&:hover': {
                color: 'primary.main',
                opacity: 1
              }
            }
          }}
        >
          <Tab label={`All Accounts (${accounts.length})`} />
          <Tab label={`Active (${accounts.filter(a => a.status === 'active').length})`} />
          <Tab label={`Inactive (${accounts.filter(a => a.status === 'inactive').length})`} />
          <Tab label={`Pending (${accounts.filter(a => a.status === 'pending').length})`} />
        </Tabs>
      </Box>

      {/* Main content */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        overflow: 'hidden',
        borderTop: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`
      }}>
        {/* Search and filter */}
        <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
          <TextField
            placeholder="Search accounts..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 20, color: mode === 'dark' ? '#aaaaaa' : '#666666' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: BORDER_RADIUS.md,
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                transition: TRANSITIONS.medium,
                '&:hover': {
                  backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                }
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                  transition: 'border-color 0.2s ease-in-out',
                },
                '&:hover fieldset': {
                  borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: mode === 'dark' ? 'white' : 'black',
                  borderWidth: '1.5px',
                },
              }
            }}
          />
          <IconButton
            sx={{
              borderRadius: BORDER_RADIUS.md,
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              transition: TRANSITIONS.medium,
              padding: '8px',
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            <FilterListIcon sx={{ fontSize: 20, color: mode === 'dark' ? '#ffffff' : '#000000' }} />
          </IconButton>
        </Box>

        {/* Accounts table */}
        <TableContainer 
          component={Paper} 
          sx={{ 
            flexGrow: 1, 
            overflow: 'auto',
            boxShadow: 'none',
            backgroundColor: 'transparent'
          }}
        >
          <Table sx={{ minWidth: 650 }} aria-label="accounts table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Account</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Industry</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Contacts</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date Added</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No accounts found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((account) => (
                  <TableRow
                    key={account.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                      },
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {account.logo ? (
                          <Avatar src={account.logo} alt={account.name} />
                        ) : (
                          <Avatar 
                            sx={{ 
                              bgcolor: getAccountColor(account.name),
                              color: '#fff',
                              fontWeight: 'bold'
                            }}
                          >
                            {getInitials(account.name)}
                          </Avatar>
                        )}
                        <Typography variant="body1" fontWeight="medium">
                          {account.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{account.industry}</TableCell>
                    <TableCell>{account.location}</TableCell>
                    <TableCell>{account.size}</TableCell>
                    <TableCell>
                      <StatusChip 
                        label={account.status.charAt(0).toUpperCase() + account.status.slice(1)} 
                        accountStatus={account.status}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PeopleIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2">{account.contacts}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(account.dateAdded).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" sx={{ mr: 1 }}>
                            <VisibilityIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" sx={{ mr: 1 }}>
                            <EditIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <IconButton 
                          size="small"
                          onClick={(e) => handleMenuOpen(e, account.id)}
                        >
                          <MoreVertIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Account actions menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            boxShadow: mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 4px 20px rgba(0, 0, 0, 0.15)',
            borderRadius: BORDER_RADIUS.md,
            minWidth: 180
          }
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <VisibilityIcon sx={{ fontSize: 18, mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ fontSize: 18, mr: 1 }} />
          Edit Account
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteAccount} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ fontSize: 18, mr: 1 }} />
          Delete Account
        </MenuItem>
      </Menu>

      {/* Add Account Dialog */}
      <Dialog 
        open={openAddDialog} 
        onClose={handleCloseAddDialog}
        PaperProps={{
          sx: {
            borderRadius: BORDER_RADIUS.lg,
            width: '100%',
            maxWidth: 500
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Typography variant="h6" fontWeight="bold">Add New Account</Typography>
          <IconButton onClick={handleCloseAddDialog} size="small">
            <CloseIcon size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Account Name"
              name="name"
              value={newAccount.name}
              onChange={handleInputChange}
              fullWidth
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: BORDER_RADIUS.md,
                  '& fieldset': {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                  },
                  '&:hover fieldset': {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: mode === 'dark' ? 'white' : 'black',
                    borderWidth: '1.5px',
                  },
                }
              }}
            />
            <TextField
              label="Industry"
              name="industry"
              value={newAccount.industry}
              onChange={handleInputChange}
              fullWidth
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: BORDER_RADIUS.md,
                  '& fieldset': {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                  },
                  '&:hover fieldset': {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: mode === 'dark' ? 'white' : 'black',
                    borderWidth: '1.5px',
                  },
                }
              }}
            />
            <TextField
              label="Location"
              name="location"
              value={newAccount.location}
              onChange={handleInputChange}
              fullWidth
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: BORDER_RADIUS.md,
                  '& fieldset': {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                  },
                  '&:hover fieldset': {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: mode === 'dark' ? 'white' : 'black',
                    borderWidth: '1.5px',
                  },
                }
              }}
            />
            <FormControl fullWidth required>
              <InputLabel>Size</InputLabel>
              <Select
                name="size"
                value={newAccount.size}
                onChange={handleInputChange}
                label="Size"
                sx={{
                  borderRadius: BORDER_RADIUS.md,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: mode === 'dark' ? 'white' : 'black',
                    borderWidth: '1.5px',
                  },
                }}
              >
                <MenuItem value="Enterprise">Enterprise</MenuItem>
                <MenuItem value="Mid-Market">Mid-Market</MenuItem>
                <MenuItem value="Small Business">Small Business</MenuItem>
                <MenuItem value="Startup">Startup</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={newAccount.status}
                onChange={handleInputChange}
                label="Status"
                sx={{
                  borderRadius: BORDER_RADIUS.md,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: mode === 'dark' ? 'white' : 'black',
                    borderWidth: '1.5px',
                  },
                }}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseAddDialog}
            sx={{
              borderRadius: BORDER_RADIUS.md,
              textTransform: 'none',
              fontWeight: 'bold',
              color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleAddAccount}
            sx={{
              borderRadius: BORDER_RADIUS.md,
              textTransform: 'none',
              fontWeight: 'bold',
              boxShadow: 'none',
              bgcolor: mode === 'dark' ? 'white' : 'black',
              color: mode === 'dark' ? 'black' : 'white',
              '&:hover': {
                bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                boxShadow: 'none',
              }
            }}
          >
            Add Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog 
        open={openImportDialog} 
        onClose={handleCloseImportDialog}
        PaperProps={{
          sx: {
            borderRadius: BORDER_RADIUS.lg,
            width: '100%',
            maxWidth: 600
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Typography variant="h6" fontWeight="bold">Import Accounts from CSV</Typography>
          <IconButton onClick={handleCloseImportDialog} size="small">
            <CloseIcon size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Upload a CSV file with the following columns: name, industry, location, size, status
            </Typography>
            
            <Box 
              sx={{ 
                border: `2px dashed ${mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                borderRadius: BORDER_RADIUS.md,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                  backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <ContentCopyIcon sx={{ fontSize: 32, color: mode === 'dark' ? '#aaaaaa' : '#666666' }} />
                <Typography variant="body1" fontWeight="medium">
                  {csvFile ? csvFile.name : 'Click to select a CSV file'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {csvFile ? `${(csvFile.size / 1024).toFixed(2)} KB` : 'or drag and drop here'}
                </Typography>
              </Box>
            </Box>
            
            {importError && (
              <Alert severity="error" sx={{ borderRadius: BORDER_RADIUS.md }}>
                {importError}
              </Alert>
            )}
            
            {csvPreview.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  Preview:
                </Typography>
                <TableContainer 
                  component={Paper} 
                  sx={{ 
                    maxHeight: 200,
                    boxShadow: 'none',
                    border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    borderRadius: BORDER_RADIUS.md
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {csvPreview[0].map((header, index) => (
                          <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                            {header}
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
                </TableContainer>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseImportDialog}
            sx={{
              borderRadius: BORDER_RADIUS.md,
              textTransform: 'none',
              fontWeight: 'bold',
              color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleImportAccounts}
            disabled={!csvFile || csvPreview.length === 0 || importError !== null}
            sx={{
              borderRadius: BORDER_RADIUS.md,
              textTransform: 'none',
              fontWeight: 'bold',
              boxShadow: 'none',
              bgcolor: mode === 'dark' ? 'white' : 'black',
              color: mode === 'dark' ? 'black' : 'white',
              '&:hover': {
                bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                boxShadow: 'none',
              },
              '&.Mui-disabled': {
                bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                color: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              }
            }}
          >
            Import Accounts
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            borderRadius: BORDER_RADIUS.md,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AccountsNew;