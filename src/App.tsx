import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Users, Star, Settings, Crown, Sparkles } from 'lucide-react'
import { AvatarCustomizer } from './components/AvatarCustomizer'
import { ClassGallery } from './components/ClassGallery'
import { PointsManager } from './components/PointsManager'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  displayName?: string
  role: 'student' | 'teacher'
  points: number
  avatarConfig?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [classSettings] = useState({
    className: 'My Awesome Class',
    teacherId: ''
  })

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      if (state.user) {
        initializeUser(state.user)
      }
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const initializeUser = async (authUser: { id: string; email: string; displayName?: string }) => {
    try {
      // Check if user exists in our database
      const existingUsers = await blink.db.users.list({
        where: { email: authUser.email }
      })

      if (existingUsers.length > 0) {
        setUser(existingUsers[0])
      } else {
        // Create new user profile
        const newUser = await blink.db.users.create({
          id: authUser.id,
          email: authUser.email,
          displayName: authUser.displayName || authUser.email.split('@')[0],
          role: 'student',
          points: 0,
          avatarConfig: JSON.stringify({
            hair: 'short',
            hairColor: '#8B4513',
            eyes: 'normal',
            eyeColor: '#4169E1',
            skin: '#FDBCB4',
            outfit: 'casual',
            outfitColor: '#FF6B6B',
            accessory: 'none'
          }),
          createdAt: new Date().toISOString()
        })
        setUser(newUser)
      }
      
      // Load all users for gallery
      loadAllUsers()
    } catch (error) {
      console.error('Error initializing user:', error)
      toast.error('Failed to initialize user profile')
    }
  }

  const loadAllUsers = async () => {
    try {
      const allUsers = await blink.db.users.list({
        orderBy: { points: 'desc' }
      })
      setUsers(allUsers)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const updateUserAvatar = async (avatarConfig: Record<string, string>) => {
    if (!user) return
    
    try {
      await blink.db.users.update(user.id, {
        avatarConfig: JSON.stringify(avatarConfig)
      })
      setUser({ ...user, avatarConfig: JSON.stringify(avatarConfig) })
      toast.success('Avatar updated successfully!')
      loadAllUsers()
    } catch (error) {
      console.error('Error updating avatar:', error)
      toast.error('Failed to update avatar')
    }
  }

  const updateUserPoints = async (userId: string, pointsChange: number) => {
    if (!user || user.role !== 'teacher') return
    
    try {
      const targetUser = users.find(u => u.id === userId)
      if (!targetUser) return
      
      const newPoints = Math.max(0, targetUser.points + pointsChange)
      await blink.db.users.update(userId, {
        points: newPoints
      })
      
      toast.success(`${pointsChange > 0 ? 'Added' : 'Removed'} ${Math.abs(pointsChange)} points ${pointsChange > 0 ? 'to' : 'from'} ${targetUser.displayName}`)
      loadAllUsers()
    } catch (error) {
      console.error('Error updating points:', error)
      toast.error('Failed to update points')
    }
  }

  const makeTeacher = async () => {
    if (!user) return
    
    try {
      await blink.db.users.update(user.id, {
        role: 'teacher'
      })
      setUser({ ...user, role: 'teacher' })
      toast.success('You are now a teacher!')
    } catch (error) {
      console.error('Error making teacher:', error)
      toast.error('Failed to update role')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your class...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Welcome to Class Avatar</CardTitle>
            <CardDescription>
              Please sign in to customize your avatar and join the class
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => blink.auth.login()} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{classSettings.className}</h1>
                <p className="text-sm text-gray-600">{users.length} students</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold text-gray-900">{user.points} points</span>
              </div>
              
              {user.role === 'teacher' && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <Crown className="w-3 h-3 mr-1" />
                  Teacher
                </Badge>
              )}
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Hi, {user.displayName}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => blink.auth.logout()}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="gallery" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Class Gallery</span>
            </TabsTrigger>
            <TabsTrigger value="customize" className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>Customize Avatar</span>
            </TabsTrigger>
            {user.role === 'teacher' && (
              <TabsTrigger value="manage" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Manage Class</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="gallery">
            <ClassGallery users={users} currentUser={user} />
          </TabsContent>

          <TabsContent value="customize">
            <AvatarCustomizer
              currentConfig={user.avatarConfig ? JSON.parse(user.avatarConfig) : null}
              onSave={updateUserAvatar}
            />
          </TabsContent>

          {user.role === 'teacher' && (
            <TabsContent value="manage">
              <PointsManager
                users={users}
                onUpdatePoints={updateUserPoints}
              />
            </TabsContent>
          )}
        </Tabs>

        {/* Debug - Make teacher button */}
        {user.role === 'student' && (
          <div className="fixed bottom-4 right-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Crown className="w-4 h-4 mr-2" />
                  Become Teacher
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Become a Teacher</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    This will give you teacher privileges to manage student points.
                  </p>
                  <Button onClick={makeTeacher} className="w-full">
                    Confirm
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  )
}

export default App