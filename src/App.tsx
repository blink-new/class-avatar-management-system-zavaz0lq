import { useState, useEffect } from 'react';
import { blink } from './blink/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Users, Star, Settings, Crown, Sparkles } from 'lucide-react';
import { AvatarCustomizer, AvatarConfig } from './components/AvatarCustomizer';
import { ClassGallery } from './components/ClassGallery';
import { PointsManager } from './components/PointsManager';
import { ClassSettings } from './components/ClassSettings';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  displayName?: string;
  role: 'student' | 'teacher';
  points: number;
  avatarConfig?: string;
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

const mockUsers: User[] = [
  { id: '1', email: 'student1@example.com', displayName: 'Alice', role: 'student', points: 120, avatarConfig: JSON.stringify({ ...defaultAvatar, hair: 'long', outfitColor: '#4ECDC4' }) },
  { id: '2', email: 'student2@example.com', displayName: 'Bob', role: 'student', points: 95, avatarConfig: JSON.stringify({ ...defaultAvatar, hair: 'buzz', skin: '#C68642' }) },
  { id: '3', email: 'student3@example.com', displayName: 'Charlie', role: 'student', points: 150, avatarConfig: JSON.stringify({ ...defaultAvatar, accessory: 'glasses', hairColor: '#000000' }) },
  { id: '4', email: 'student4@example.com', displayName: 'Diana', role: 'student', points: 80, avatarConfig: JSON.stringify({ ...defaultAvatar, hair: 'ponytail', eyeColor: '#228B22' }) },
];

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const data = localStorage.getItem('users');
      return data ? JSON.parse(data) : mockUsers;
    } catch {
      return mockUsers;
    }
  });
  const [pointTransactions, setPointTransactions] = useState<PointTransaction[]>(() => loadPointTransactions());
  const [className, setClassName] = useState('My Awesome Class');

  // Save users and transactions to localStorage on change
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    savePointTransactions(pointTransactions);
  }, [pointTransactions]);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      if (state.user) {
        const authUser = state.user;
        const existingUser = users.find(u => u.email === authUser.email);
        if (existingUser) {
          setUser(existingUser);
        } else {
          const newUser: User = {
            id: authUser.id,
            email: authUser.email,
            displayName: authUser.displayName || authUser.email.split('@')[0],
            role: 'student',
            points: 0,
            avatarConfig: JSON.stringify(defaultAvatar),
          };
          const updatedUsers = [...users, newUser];
          setUsers(updatedUsers);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(state.isLoading);
    });
    return unsubscribe;
  }, [users]);

  const updateUserAvatar = (avatarConfig: AvatarConfig) => {
    if (!user) return;
    const updatedUser = { ...user, avatarConfig: JSON.stringify(avatarConfig) };
    setUser(updatedUser);
    setUsers(users.map(u => (u.id === user.id ? updatedUser : u)));
    toast.success('Avatar updated successfully!');
  };

  const updateUserPoints = (userId: string, pointsChange: number, reason: string) => {
    if (!user || user.role !== 'teacher') return;
    setUsers(users.map(u => {
      if (u.id === userId) {
        const newPoints = Math.max(0, u.points + pointsChange);
        // Log transaction
        const transaction: PointTransaction = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
          userId,
          teacherId: user.id,
          pointsChange,
          reason,
          createdAt: new Date().toISOString(),
        };
        setPointTransactions(prev => [transaction, ...prev]);
        toast.success(`${pointsChange > 0 ? 'Added' : 'Removed'} ${Math.abs(pointsChange)} points ${pointsChange > 0 ? 'to' : 'from'} ${u.displayName}${reason ? ` for ${reason}`: ''}.`);
        return { ...u, points: newPoints };
      }
      return u;
    }));
  };

  const makeTeacher = () => {
    if (!user) return;
    const updatedUser = { ...user, role: 'teacher' as const };
    setUser(updatedUser);
    setUsers(users.map(u => (u.id === user.id ? updatedUser : u)));
    toast.success('You are now a teacher!');
  };

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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-100">
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{className}</h1>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="gallery">Class Gallery</TabsTrigger>
            <TabsTrigger value="customize">Customize Avatar</TabsTrigger>
            <TabsTrigger value="manage">Manage Class</TabsTrigger>
          </TabsList>

          <TabsContent value="gallery">
            <ClassGallery users={users} currentUser={user} />
            {/* Student's point history */}
            {user.role === 'student' && (
              <div className="mt-8 max-w-xl mx-auto">
                <h3 className="text-xl font-bold mb-2 text-center">Your Point History</h3>
                <div className="bg-white rounded-lg shadow p-4">
                  {pointTransactions.filter(t => t.userId === user.id).length === 0 ? (
                    <p className="text-gray-500 text-center">No points awarded yet.</p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {pointTransactions.filter(t => t.userId === user.id).map(t => (
                        <li key={t.id} className="py-2 flex items-center justify-between">
                          <span className={t.pointsChange > 0 ? 'text-green-600' : 'text-red-600'}>
                            {t.pointsChange > 0 ? '+' : ''}{t.pointsChange} pts
                          </span>
                          <span className="text-gray-700 text-sm">
                            {t.reason ? t.reason : (t.pointsChange > 0 ? 'Awarded' : 'Deducted')}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(t.createdAt).toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="customize">
            <AvatarCustomizer
              currentConfig={user.avatarConfig ? JSON.parse(user.avatarConfig) : defaultAvatar}
              onSave={updateUserAvatar}
            />
          </TabsContent>

          <TabsContent value="manage">
            {user.role === 'teacher' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <PointsManager users={users} onUpdatePoints={updateUserPoints} currentUserRole={user.role} />
                    <ClassSettings currentClassName={className} onSave={setClassName} />
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Restricted Access</CardTitle>
                        <CardDescription>This section is for teachers only.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Please ask your teacher for access to class management features.</p>
                    </CardContent>
                </Card>
            )}
          </TabsContent>
        </Tabs>

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
  );
}

export default App;