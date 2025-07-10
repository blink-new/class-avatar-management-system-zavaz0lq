import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Plus, Minus } from 'lucide-react'
import { AvatarDisplay } from './AvatarCustomizer'

interface User {
  id: string
  email: string
  displayName?: string
  role: 'student' | 'teacher'
  points: number
  avatarConfig?: string
}

interface PointsManagerProps {
  users: User[]
  onUpdatePoints: (userId: string, pointsChange: number, reason: string) => void
  currentUserRole: 'student' | 'teacher'
}

export function PointsManager({ users, onUpdatePoints, currentUserRole }: PointsManagerProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [points, setPoints] = useState(10)
  const [reason, setReason] = useState('')

  const handlePointUpdate = (multiplier: 1 | -1) => {
    if (!selectedUser) return
    onUpdatePoints(selectedUser.id, points * multiplier, reason)
    setReason('')
  }

  const students = users.filter(u => u.role === 'student')

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Student List */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Select a Student</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {students.map(student => (
              <div
                key={student.id}
                onClick={() => setSelectedUser(student)}
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  selectedUser?.id === student.id
                    ? 'bg-purple-100 ring-2 ring-purple-500'
                    : 'hover:bg-gray-100'
                }`}>
                <AvatarDisplay config={student.avatarConfig ? JSON.parse(student.avatarConfig) : null} size="small" />
                <div>
                  <p className="font-semibold text-gray-900">{student.displayName}</p>
                  <p className="text-sm text-gray-600">{student.points} points</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Points Control */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Manage Points</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedUser ? (
              <div className="text-center space-y-4">
                <div className="inline-block">
                  <AvatarDisplay config={selectedUser.avatarConfig ? JSON.parse(selectedUser.avatarConfig) : null} size="large" />
                </div>
                <h3 className="text-xl font-bold">{selectedUser.displayName}</h3>
                
                <div className="w-full max-w-sm mx-auto">
                  <Label htmlFor="points" className="mb-2 block">Points to Add/Remove</Label>
                  <Input
                    id="points"
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="text-center text-lg"
                  />
                </div>

                <div className="w-full max-w-sm mx-auto">
                  <Label htmlFor="reason" className="mb-2 block">Reason (Optional)</Label>
                  <Input
                    id="reason"
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Great participation!"
                  />
                </div>

                <div className="flex justify-center space-x-4">
                  <Button onClick={() => handlePointUpdate(1)} size="lg" className="bg-green-500 hover:bg-green-600" disabled={currentUserRole !== 'teacher'}>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Points
                  </Button>
                  <Button onClick={() => handlePointUpdate(-1)} size="lg" variant="destructive" disabled={currentUserRole !== 'teacher'}>
                    <Minus className="w-5 h-5 mr-2" />
                    Remove Points
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Select a student from the list to manage their points.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}