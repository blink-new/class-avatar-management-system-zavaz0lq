import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ClassSettingsProps {
  currentClassName: string;
  onSave: (newName: string) => void;
}

export function ClassSettings({ currentClassName, onSave }: ClassSettingsProps) {
  const [className, setClassName] = useState(currentClassName);

  const handleSave = () => {
    onSave(className);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="className">Class Name</Label>
          <Input
            id="className"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
        </div>
        <Button onClick={handleSave}>Save Settings</Button>
      </CardContent>
    </Card>
  );
}
