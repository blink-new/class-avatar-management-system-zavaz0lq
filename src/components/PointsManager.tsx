import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Plus, Minus, Star, Settings, Users } from 'lucide-react'
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
}

export function PointsManager({ users, onUpdatePoints }: PointsManagerProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [pointsAmount, setPointsAmount] = useState(10)
  const [reason, setReason] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const students = users.filter(user => user.role === 'student')

  const handlePointsChange = (isAdd: boolean) => {
    if (!selectedUser) return
    
    const change = isAdd ? pointsAmount : -pointsAmount
    onUpdatePoints(selectedUser.id, change, reason || (isAdd ? 'Good work!' : 'Needs improvement'))
    
    setIsDialogOpen(false)
    setSelectedUser(null)
    setPointsAmount(10)
    setReason('')
  }

  const openDialog = (user: User) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Manage Student Points</h2>
        <p className="text-gray-600">Reward students for their achievements or provide feedback</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Plus className="w-5 h-5" />
              <span>Quick Reward</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-green-700 mb-2">Give +10 points for good behavior</p>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Most Common
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Star className="w-5 h-5" />
              <span>Custom Points</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-blue-700 mb-2">Add or remove custom amounts</p>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              Flexible
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-purple-800">
              <Users className="w-5 h-5" />
              <span>Class Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-purple-700 mb-2">{students.length} students total</p>
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              {students.reduce((sum, student) => sum + student.points, 0)} Total Points
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => (
          <Card key={student.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AvatarDisplay 
                    config={student.avatarConfig ? JSON.parse(student.avatarConfig) : null} 
                    size="small"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {student.displayName || student.email.split('@')[0]}
                    </h3>
                    <p className="text-sm text-gray-500">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-lg">{student.points}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => onUpdatePoints(student.id, 10, 'Quick reward')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  +10
                </Button>
                <Button
                  size="sm"
                  onClick={() => onUpdatePoints(student.id, -5, 'Minor correction')}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <Minus className="w-4 h-4 mr-1" />
                  -5
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openDialog(student)}
                  className="flex-1"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Custom
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Points Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Manage Points for {selectedUser?.displayName || selectedUser?.email.split('@')[0]}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedUser && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <AvatarDisplay 
                  config={selectedUser.avatarConfig ? JSON.parse(selectedUser.avatarConfig) : null} 
                  size="small"
                />
                <div>
                  <p className="font-medium">{selectedUser.displayName || selectedUser.email.split('@')[0]}</p>
                  <p className="text-sm text-gray-600">Current points: {selectedUser.points}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="points-amount">Points Amount</Label>
              <Input
                id="points-amount"
                type="number"
                value={pointsAmount}
                onChange={(e) => setPointsAmount(Number(e.target.value))}
                placeholder="Enter points amount"
                min="1"
                max="100"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Great participation, Excellent homework, etc."
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => handlePointsChange(true)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Points
              </Button>
              <Button
                onClick={() => handlePointsChange(false)}
                variant="destructive"
                className="flex-1"
              >
                <Minus className="w-4 h-4 mr-2" />
                Remove Points
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}