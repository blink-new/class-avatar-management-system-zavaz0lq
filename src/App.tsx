import { useState, useEffect } from 'react';
import { blink } from './blink/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Users, Star, Crown, Sparkles, UserPlus } from 'lucide-react';
import { AvatarCustomizer, AvatarConfig } from './components/AvatarCustomizer';
import { ClassGallery } from './components/ClassGallery';
import { PointsManager } from './components/PointsManager';
import { ClassSettings } from './components/ClassSettings';
import toast, { Toaster } from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  displayName?: string;
  role: 'student' | 'teacher';
  points: number;
  avatarConfig?: string;
  joinedAt?: string;
  lastActiveAt?: string;
}

interface PointTransaction {
  id: string;
  userId: string;
  teacherId: string;
  pointsChange: number;
  reason?: string;
  createdAt: string;
}

const defaultAvatar: AvatarConfig = {
  hair: 'short',
  hairColor: '#8B4513',
  eyes: 'normal',
  eyeColor: '#4169E1',
  skin: '#FDBCB4',
  outfit: 'casual',
  outfitColor: '#FF6B6B',
  accessory: 'none',
};

// Mock users for fallback
const mockUsers: User[] = [
  { id: '1', email: 'student1@example.com', displayName: 'Alice', role: 'student', points: 120, avatarConfig: JSON.stringify({ ...defaultAvatar, hair: 'long', outfitColor: '#4ECDC4' }) },
  { id: '2', email: 'student2@example.com', displayName: 'Bob', role: 'student', points: 95, avatarConfig: JSON.stringify({ ...defaultAvatar, hair: 'buzz', skin: '#C68642' }) },
  { id: '3', email: 'student3@example.com', displayName: 'Charlie', role: 'student', points: 150, avatarConfig: JSON.stringify({ ...defaultAvatar, accessory: 'glasses', hairColor: '#000000' }) },
  { id: '4', email: 'student4@example.com', displayName: 'Diana', role: 'student', points: 80, avatarConfig: JSON.stringify({ ...defaultAvatar, hair: 'ponytail', eyeColor: '#228B22' }) },
];

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [pointTransactions, setPointTransactions] = useState<PointTransaction[]>([]);
  const [className, setClassName] = useState('My Awesome Class');

  // Calculate class stats
  const classStats = {
    totalStudents: users.filter(u => u.role === 'student').length,
    totalPoints: users.reduce((sum, u) => sum + u.points, 0),
    averagePoints: users.length > 0 ? Math.round(users.reduce((sum, u) => sum + u.points, 0) / users.filter(u => u.role === 'student').length) : 0,
    topStudent: users.filter(u => u.role === 'student').sort((a, b) => b.points - a.points)[0] || null,
    recentActivity: pointTransactions.slice(0, 5)
  };

  // Load users - first try database, fallback to localStorage, then mock data
  const loadUsers = async () => {
    try {
      // Try database first
      const dbUsers = await blink.db.users.list({
        orderBy: { points: 'desc' }
      });
      
      if (dbUsers.length > 0) {
        const formattedUsers = dbUsers.map(dbUser => ({
          id: dbUser.id,
          email: dbUser.email,
          displayName: dbUser.displayName || dbUser.email.split('@')[0],
          role: dbUser.role as 'student' | 'teacher',
          points: Number(dbUser.points) || 0,
          avatarConfig: dbUser.avatarConfig,
          joinedAt: dbUser.createdAt,
          lastActiveAt: dbUser.updatedAt
        }));
        setUsers(formattedUsers);
        return;
      }
    } catch (error) {
      console.warn('Database not available, using localStorage:', error);
    }

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem('classUsers');
      if (stored) {
        const storedUsers = JSON.parse(stored);
        setUsers(storedUsers);
        return;
      }
    } catch (error) {
      console.warn('localStorage not available:', error);
    }

    // Final fallback to mock data
    setUsers(mockUsers);
    localStorage.setItem('classUsers', JSON.stringify(mockUsers));
  };

  // Load point transactions
  const loadPointTransactions = async () => {
    try {
      const dbTransactions = await blink.db.pointTransactions.list({
        orderBy: { createdAt: 'desc' },
        limit: 50
      });
      
      const formattedTransactions = dbTransactions.map(tx => ({
        id: tx.id,
        userId: tx.userId,
        teacherId: tx.teacherId,
        pointsChange: Number(tx.pointsChange),
        reason: tx.reason,
        createdAt: tx.createdAt
      }));
      
      setPointTransactions(formattedTransactions);
    } catch (error) {
      console.warn('Could not load transactions from database:', error);
      // Try localStorage fallback
      try {
        const stored = localStorage.getItem('pointTransactions');
        if (stored) {
          setPointTransactions(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('Could not load transactions from localStorage:', e);
      }
    }
  };

  // Save to localStorage as backup
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('classUsers', JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    if (pointTransactions.length > 0) {
      localStorage.setItem('pointTransactions', JSON.stringify(pointTransactions));
    }
  }, [pointTransactions]);

  // Initialize auth and load data
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged(async (state) => {
      if (state.user) {
        const authUser = state.user;
        let currentUser: User;
        
        // Find or create user
        const existingUser = users.find(u => u.email === authUser.email);
        
        if (existingUser) {
          currentUser = existingUser;
        } else {
          // Create new user
          currentUser = {
            id: authUser.id,
            email: authUser.email,
            displayName: authUser.displayName || authUser.email.split('@')[0],
            role: 'student',
            points: 0,
            avatarConfig: JSON.stringify(defaultAvatar),
            joinedAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString()
          };
          
          // Try to save to database
          try {
            await blink.db.users.create({
              id: currentUser.id,
              email: currentUser.email,
              displayName: currentUser.displayName,
              role: currentUser.role,
              points: currentUser.points,
              avatarConfig: currentUser.avatarConfig,
            });
          } catch (error) {
            console.warn('Could not save user to database:', error);
          }
          
          // Update local state
          setUsers(prev => {
            const updated = [...prev, currentUser];
            localStorage.setItem('classUsers', JSON.stringify(updated));
            return updated;
          });
        }
        
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(state.isLoading);
    });
    
    return unsubscribe;
  }, [users]);

  // Load data when component mounts
  useEffect(() => {
    loadUsers();
    loadPointTransactions();
  }, []);

  const updateUserAvatar = async (avatarConfig: AvatarConfig) => {
    if (!user) return;
    
    const avatarConfigString = JSON.stringify(avatarConfig);
    const updatedUser = { ...user, avatarConfig: avatarConfigString };
    
    // Update local state immediately
    setUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    
    // Try to update database
    try {
      await blink.db.users.update(user.id, {
        avatarConfig: avatarConfigString,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Could not update avatar in database:', error);
    }
    
    toast.success('✨ Avatar updated successfully!');
  };

  const updateUserPoints = async (userId: string, pointsChange: number, reason: string) => {
    if (!user || user.role !== 'teacher') return;
    
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    
    const newPoints = Math.max(0, targetUser.points + pointsChange);
    const updatedUser = { ...targetUser, points: newPoints };
    
    // Create transaction
    const transaction: PointTransaction = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      userId,
      teacherId: user.id,
      pointsChange,
      reason: reason || (pointsChange > 0 ? 'Points awarded' : 'Points deducted'),
      createdAt: new Date().toISOString(),
    };
    
    // Update local state immediately
    setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    setPointTransactions(prev => [transaction, ...prev]);
    
    // Try to update database
    try {
      await blink.db.users.update(userId, {
        points: newPoints,
        updatedAt: new Date().toISOString()
      });
      
      await blink.db.pointTransactions.create(transaction);
    } catch (error) {
      console.warn('Could not update points in database:', error);
    }
    
    toast.success(`${pointsChange > 0 ? '➕' : '➖'} ${Math.abs(pointsChange)} points ${pointsChange > 0 ? 'to' : 'from'} ${targetUser.displayName}${reason ? ` for ${reason}` : ''}!`);
  };

  const makeTeacher = async () => {
    if (!user) return;
    
    const updatedUser = { ...user, role: 'teacher' as const };
    
    // Update local state immediately
    setUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    
    // Try to update database
    try {
      await blink.db.users.update(user.id, {
        role: 'teacher',
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Could not update role in database:', error);
    }
    
    toast.success('👑 You are now a teacher! You can manage student points.');
  };

  const updateClassName = (newName: string) => {
    setClassName(newName);
    localStorage.setItem('className', newName);
    toast.success('📝 Class name updated!');
  };

  // Load saved class name
  useEffect(() => {
    const saved = localStorage.getItem('className');
    if (saved) {
      setClassName(saved);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your class...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-100 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Users className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to Class Avatar
            </CardTitle>
            <CardDescription className="text-lg">
              Join your class, customize your avatar, and earn points!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => blink.auth.login()} 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 text-lg"
            >
              🚀 Sign In to Join Class
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-100">
      <Toaster position="top-right" />
      
      <div className="bg-white/90 backdrop-blur-md border-b border-purple-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{className}</h1>
                <p className="text-sm text-gray-600">
                  {classStats.totalStudents} students • {classStats.totalPoints} total points
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold text-gray-900">{user.points}</span>
                <span className="text-sm text-gray-600">pts</span>
              </div>
              
              {user.role === 'teacher' && (
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                  <Crown className="w-3 h-3 mr-1" />
                  Teacher
                </Badge>
              )}
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Hi, <span className="font-semibold text-purple-700">{user.displayName}</span>! 👋
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => blink.auth.logout()}
                  className="hover:bg-gray-50"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="gallery" className="data-[state=active]:bg-purple-100">
              🎨 Class Gallery
            </TabsTrigger>
            <TabsTrigger value="customize" className="data-[state=active]:bg-purple-100">
              ✨ Customize Avatar
            </TabsTrigger>
            <TabsTrigger value="manage" className="data-[state=active]:bg-purple-100">
              ⚙️ Manage Class
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery">
            <ClassGallery users={users} currentUser={user} classStats={classStats} />
          </TabsContent>

          <TabsContent value="customize">
            <AvatarCustomizer
              currentConfig={user.avatarConfig ? JSON.parse(user.avatarConfig) : defaultAvatar}
              onSave={updateUserAvatar}
            />
          </TabsContent>

          <TabsContent value="manage">
            {user.role === 'teacher' ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <PointsManager 
                      users={users} 
                      onUpdatePoints={updateUserPoints} 
                      currentUserRole={user.role}
                      pointTransactions={pointTransactions}
                    />
                  </div>
                  <div className="space-y-6">
                    <ClassSettings 
                      currentClassName={className} 
                      onSave={updateClassName}
                      classStats={classStats}
                    />
                    
                    {/* Recent Activity */}
                    <Card className="bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-600" />
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {pointTransactions.slice(0, 5).map(transaction => {
                          const student = users.find(u => u.id === transaction.userId);
                          return (
                            <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${transaction.pointsChange > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm font-medium">{student?.displayName || 'Unknown Student'}</span>
                              </div>
                              <div className="text-right">
                                <div className={`text-sm font-bold ${transaction.pointsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {transaction.pointsChange > 0 ? '+' : ''}{transaction.pointsChange} pts
                                </div>
                                <div className="text-xs text-gray-500 truncate max-w-32">
                                  {transaction.reason || 'Points update'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {pointTransactions.length === 0 && (
                          <div className="text-center py-8">
                            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500">No activity yet</p>
                            <p className="text-xs text-gray-400">Start awarding points to see activity here!</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ) : (
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-purple-600" />
                    Class Management
                  </CardTitle>
                  <CardDescription>This section is for teachers only.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">You need teacher privileges to access class management features.</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Request Teacher Access
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Crown className="w-5 h-5 text-purple-600" />
                          Become a Teacher
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          This will give you teacher privileges to manage student points and class settings.
                        </p>
                        <Button 
                          onClick={makeTeacher} 
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          Confirm - Make Me Teacher
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;