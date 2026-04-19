import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

interface SaveScenarioDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}

export default function SaveScenarioDialog({
  open,
  onClose,
  onSave,
}: Readonly<SaveScenarioDialogProps>) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a name for this scenario.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(trimmed);
      setName('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save scenario.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    setName('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: '#1A1A2E' }}>
        Save Scenario
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: '#5A5A7A', mb: 2 }}>
          Give this scenario a name so you can find it later.
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          autoFocus
          fullWidth
          label="Scenario name"
          placeholder="e.g. Standard 10-year plan"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleSave();
          }}
          disabled={saving}
          slotProps={{ htmlInput: { maxLength: 80 } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={saving} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={() => void handleSave()}
          disabled={saving || !name.trim()}
          variant="contained"
          sx={{ fontWeight: 700 }}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
