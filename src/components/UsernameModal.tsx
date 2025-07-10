import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface UsernameModalProps {
  open: boolean;
  onSave: (username: string) => void;
}

export function UsernameModal({ open, onSave }: UsernameModalProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }
    if (username.length < 2 || username.length > 20) {
      setError('Username must be 2-20 characters');
      return;
    }
    setError('');
    onSave(username.trim());
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Choose Your Username</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            autoFocus
            placeholder="Enter a username..."
            value={username}
            onChange={e => setUsername(e.target.value)}
            maxLength={20}
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button className="w-full" onClick={handleSave}>
            Save Username
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
