import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ClassSettingsProps {
  currentClassName: string;
  onSave: (newName: string) => void;
  classStats?: {
    totalStudents: number
    totalPoints: number
    averagePoints: number
    topStudent: any | null
    recentActivity: any[]
  }
}

export function ClassSettings({ currentClassName, onSave, classStats }: ClassSettingsProps) {
  const [className, setClassName] = useState(currentClassName);

  const handleSave = () => {
    onSave(className);
  };

  return (
    <div className="space-y-6">
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

      {classStats && (
        <Card>
          <CardHeader>
            <CardTitle>Class Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-600">{classStats.totalStudents}</div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-600">{classStats.totalPoints}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">{classStats.averagePoints}</div>
                <div className="text-sm text-gray-600">Avg Points</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {classStats.topStudent ? classStats.topStudent.points : 0}
                </div>
                <div className="text-sm text-gray-600">Top Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}