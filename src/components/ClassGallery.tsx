import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Star, Crown, Trophy, Medal, Award } from 'lucide-react'
import { AvatarDisplay } from './AvatarCustomizer'

interface User {
  id: string
  email: string
  displayName?: string
  role: 'student' | 'teacher'
  points: number
  avatarConfig?: string
}

interface ClassGalleryProps {
  users: User[]
  currentUser: User
}

export function ClassGallery({ users, currentUser }: ClassGalleryProps) {
  const sortedUsers = [...users].sort((a, b) => b.points - a.points)
  
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-5 h-5 text-yellow-500" />
      case 1: return <Medal className="w-5 h-5 text-gray-400" />
      case 2: return <Award className="w-5 h-5 text-amber-600" />
      default: return <Star className="w-4 h-4 text-gray-400" />
    }
  }

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0: return <Badge className="bg-yellow-500 text-white">🥇 1st Place</Badge>
      case 1: return <Badge className="bg-gray-400 text-white">🥈 2nd Place</Badge>
      case 2: return <Badge className="bg-amber-600 text-white">🥉 3rd Place</Badge>
      default: return <Badge variant="outline">#{index + 1}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Class Gallery</h2>
        <p className="text-gray-600">Check out everyone's awesome avatars and see the leaderboard!</p>
      </div>

      {/* Top 3 Podium */}
      {sortedUsers.length >= 3 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-center text-gray-900 mb-6">🏆 Top Performers</h3>
          <div className="flex justify-center items-end space-x-4">
            {/* 2nd Place */}
            <div className="text-center">
              <div className="relative">
                <AvatarDisplay 
                  config={sortedUsers[1].avatarConfig ? JSON.parse(sortedUsers[1].avatarConfig) : null} 
                  size="medium"
                />
                <div className="absolute -top-2 -right-2 bg-gray-400 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <div className="mt-2 bg-gray-400 text-white px-3 py-1 rounded-full text-sm font-medium">
                {sortedUsers[1].displayName}
              </div>
              <div className="mt-1 text-gray-600 text-sm">{sortedUsers[1].points} points</div>
            </div>

            {/* 1st Place */}
            <div className="text-center">
              <div className="relative">
                <AvatarDisplay 
                  config={sortedUsers[0].avatarConfig ? JSON.parse(sortedUsers[0].avatarConfig) : null} 
                  size="large"
                />
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  1
                </div>
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="text-2xl">👑</div>
                </div>
              </div>
              <div className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {sortedUsers[0].displayName}
              </div>
              <div className="mt-1 text-gray-600 text-sm">{sortedUsers[0].points} points</div>
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <div className="relative">
                <AvatarDisplay 
                  config={sortedUsers[2].avatarConfig ? JSON.parse(sortedUsers[2].avatarConfig) : null} 
                  size="medium"
                />
                <div className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <div className="mt-2 bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {sortedUsers[2].displayName}
              </div>
              <div className="mt-1 text-gray-600 text-sm">{sortedUsers[2].points} points</div>
            </div>
          </div>
        </div>
      )}

      {/* All Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedUsers.map((user, index) => (
          <Card 
            key={user.id} 
            className={`transition-all duration-300 hover:shadow-lg ${
              user.id === currentUser.id ? 'ring-2 ring-purple-500 bg-purple-50' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getRankIcon(index)}
                  <span className="font-medium text-gray-900">
                    {user.displayName || user.email.split('@')[0]}
                  </span>
                </div>
                {user.role === 'teacher' && (
                  <Crown className="w-4 h-4 text-purple-600" />
                )}
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative mb-4">
                <AvatarDisplay 
                  config={user.avatarConfig ? JSON.parse(user.avatarConfig) : null} 
                  size="medium"
                />
                {user.id === currentUser.id && (
                  <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    ✨
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                {getRankBadge(index)}
                
                <div className="flex items-center justify-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-lg">{user.points}</span>
                  <span className="text-gray-600 text-sm">points</span>
                </div>
                
                {user.role === 'teacher' && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Teacher
                  </Badge>
                )}
                
                {user.id === currentUser.id && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-800">
                    That's You!
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Class Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-600">{users.length}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {users.reduce((sum, user) => sum + user.points, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {users.length > 0 ? Math.round(users.reduce((sum, user) => sum + user.points, 0) / users.length) : 0}
            </div>
            <div className="text-sm text-gray-600">Average Points</div>
          </div>
        </div>
      </div>
    </div>
  )
}