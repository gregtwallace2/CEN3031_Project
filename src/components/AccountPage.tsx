import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import type { Scenario } from '../lib/scenarios';
import { renameScenario, deleteScenario } from '../lib/scenarios';

interface AccountPageProps {
  scenarios: Scenario[];
  onBack: () => void;
  onLoad: (scenario: Scenario) => void;
  onScenariosChange: (scenarios: Scenario[]) => void;
}

const PLAN_LABELS: Record<string, string> = {
  standard: 'Standard',
  ibr: 'IBR',
  icr: 'ICR',
  paye: 'PAYE',
};

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AccountPage({
  scenarios,
  onBack,
  onLoad,
  onScenariosChange,
}: Readonly<AccountPageProps>) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startEdit = (scenario: Scenario) => {
    setEditingId(scenario.id);
    setEditName(scenario.name);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const confirmRename = async (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      setError('Name cannot be empty.');
      return;
    }
    setRenaming(true);
    setError(null);
    const { error: err } = await renameScenario(id, trimmed);
    setRenaming(false);
    if (err) {
      setError(err.message);
      return;
    }
    onScenariosChange(
      scenarios.map((s) => (s.id === id ? { ...s, name: trimmed } : s)),
    );
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    const { error: err } = await deleteScenario(id);
    setDeletingId(null);
    if (err) {
      setError(err.message);
      return;
    }
    onScenariosChange(scenarios.filter((s) => s.id !== id));
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 1 }}>
          <IconButton onClick={onBack} aria-label="Back to calculator" sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0021A5', lineHeight: 1.2 }}>
              My Scenarios
            </Typography>
            <Typography variant="body2" sx={{ color: '#5A5A7A' }}>
              {scenarios.length === 0 && 'No saved scenarios yet'}
              {scenarios.length === 1 && '1 saved scenario'}
              {scenarios.length > 1 && `${String(scenarios.length)} saved scenarios`}
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            onClose={() => {
              setError(null);
            }}
          >
            {error}
          </Alert>
        )}

        {scenarios.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              border: '1px solid #E2E8F0',
              borderRadius: 3,
              p: 6,
              textAlign: 'center',
            }}
          >
            <FolderOpenIcon sx={{ fontSize: 56, color: '#D0D5DD', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#5A5A7A', fontWeight: 600 }}>
              No saved scenarios yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#9AA5B4', mt: 1, mb: 3 }}>
              Use the Save button in the calculator to save your loan scenarios here.
            </Typography>
            <Button variant="outlined" onClick={onBack}>
              Go to Calculator
            </Button>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{ border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}
          >
            {scenarios.map((scenario, index) => (
              <Box key={scenario.id}>
                {index > 0 && <Divider sx={{ borderColor: '#E2E8F0' }} />}
                <Box
                  sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    '&:hover': { backgroundColor: '#FAFBFC' },
                    transition: 'background-color 0.15s',
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {editingId === scenario.id ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <TextField
                          size="small"
                          value={editName}
                          onChange={(e) => {
                            setEditName(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') void confirmRename(scenario.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          disabled={renaming}
                          slotProps={{ htmlInput: { maxLength: 80 } }}
                          autoFocus
                          sx={{ flex: 1 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => void confirmRename(scenario.id)}
                          disabled={renaming || !editName.trim()}
                          color="primary"
                          aria-label="Confirm rename"
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={cancelEdit}
                          disabled={renaming}
                          aria-label="Cancel rename"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, color: '#1A1A2E', mb: 0.5 }}
                        noWrap
                      >
                        {scenario.name}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 0.75 }}>
                      <Chip
                        label={PLAN_LABELS[scenario.repayment_plan] ?? scenario.repayment_plan}
                        size="small"
                        sx={{
                          backgroundColor: '#EEF2FF',
                          color: '#0021A5',
                          fontWeight: 600,
                          fontSize: '0.72rem',
                        }}
                      />
                      <Chip
                        label={formatCurrency(scenario.principal)}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.72rem' }}
                      />
                      <Chip
                        label={`${String(scenario.loan_term)} ${scenario.term_unit}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.72rem' }}
                      />
                      <Chip
                        label={`${String(scenario.interest_rate)}%`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.72rem' }}
                      />
                      {scenario.income && (
                        <Chip
                          label={`Income: ${formatCurrency(scenario.income)}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.72rem' }}
                        />
                      )}
                    </Box>

                    <Typography variant="caption" sx={{ color: '#9AA5B4' }}>
                      Saved {formatDate(scenario.updated_at)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        onLoad(scenario);
                      }}
                      sx={{ fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                    >
                      Load
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => {
                        startEdit(scenario);
                      }}
                      disabled={!!editingId}
                      aria-label="Rename scenario"
                      sx={{ color: '#5A5A7A' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => void handleDelete(scenario.id)}
                      disabled={deletingId === scenario.id}
                      aria-label="Delete scenario"
                      sx={{ color: '#FA4616' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ))}
          </Paper>
        )}
      </Container>
    </Box>
  );
}
