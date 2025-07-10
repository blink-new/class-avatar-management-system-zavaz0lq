import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import { Palette, Sparkles, Save } from 'lucide-react'

interface AvatarConfig {
  hair: string
  hairColor: string
  eyes: string
  eyeColor: string
  skin: string
  outfit: string
  outfitColor: string
  accessory: string
}

interface AvatarCustomizerProps {
  currentConfig: AvatarConfig | null
  onSave: (config: AvatarConfig) => void
}

const defaultConfig: AvatarConfig = {
  hair: 'short',
  hairColor: '#8B4513',
  eyes: 'normal',
  eyeColor: '#4169E1',
  skin: '#FDBCB4',
  outfit: 'casual',
  outfitColor: '#FF6B6B',
  accessory: 'none'
}

const options = {
  hair: ['short', 'long', 'curly', 'bald', 'ponytail', 'buzz'],
  hairColors: ['#8B4513', '#000000', '#FFD700', '#FF6347', '#9370DB', '#32CD32'],
  eyes: ['normal', 'big', 'small', 'sleepy', 'wink', 'star'],
  eyeColors: ['#4169E1', '#228B22', '#8B4513', '#FF1493', '#00CED1', '#FF4500'],
  skins: ['#FDBCB4', '#F1C27D', '#E0AC69', '#C68642', '#8D5524', '#F3E7DB'],
  outfits: ['casual', 'formal', 'sporty', 'hoodie', 'dress', 'uniform'],
  outfitColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'],
  accessories: ['none', 'glasses', 'hat', 'headband', 'earrings', 'necklace']
}

export function AvatarCustomizer({ currentConfig, onSave }: AvatarCustomizerProps) {
  const [config, setConfig] = useState<AvatarConfig>(currentConfig || defaultConfig)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(config)
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (key: keyof AvatarConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Customize Your Avatar</h2>
        <p className="text-gray-600">Make your avatar unique and express your personality!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Avatar Preview */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>Preview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="relative mx-auto mb-4">
              <AvatarDisplay config={config} size="large" />
            </div>
            <Badge variant="outline" className="mb-4">
              Your Custom Avatar
            </Badge>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Avatar'}
            </Button>
          </CardContent>
        </Card>

        {/* Customization Options */}
        <div className="space-y-6">
          {/* Hair Style */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hair Style</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {options.hair.map((style) => (
                  <Button
                    key={style}
                    variant={config.hair === style ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateConfig('hair', style)}
                    className="capitalize"
                  >
                    {style}
                  </Button>
                ))}
              </div>
              <Label className="text-sm text-gray-600 mb-2 block">Hair Color</Label>
              <div className="flex space-x-2">
                {options.hairColors.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${config.hairColor === color ? 'border-gray-900' : 'border-gray-300'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateConfig('hairColor', color)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Eyes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Eyes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {options.eyes.map((style) => (
                  <Button
                    key={style}
                    variant={config.eyes === style ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateConfig('eyes', style)}
                    className="capitalize"
                  >
                    {style}
                  </Button>
                ))}
              </div>
              <Label className="text-sm text-gray-600 mb-2 block">Eye Color</Label>
              <div className="flex space-x-2">
                {options.eyeColors.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${config.eyeColor === color ? 'border-gray-900' : 'border-gray-300'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateConfig('eyeColor', color)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skin Tone */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skin Tone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                {options.skins.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${config.skin === color ? 'border-gray-900' : 'border-gray-300'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateConfig('skin', color)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Outfit */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Outfit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {options.outfits.map((style) => (
                  <Button
                    key={style}
                    variant={config.outfit === style ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateConfig('outfit', style)}
                    className="capitalize"
                  >
                    {style}
                  </Button>
                ))}
              </div>
              <Label className="text-sm text-gray-600 mb-2 block">Outfit Color</Label>
              <div className="flex space-x-2">
                {options.outfitColors.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${config.outfitColor === color ? 'border-gray-900' : 'border-gray-300'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateConfig('outfitColor', color)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Accessories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Accessories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {options.accessories.map((accessory) => (
                  <Button
                    key={accessory}
                    variant={config.accessory === accessory ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateConfig('accessory', accessory)}
                    className="capitalize"
                  >
                    {accessory}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Simple avatar display component
function AvatarDisplay({ config, size = "medium" }: { config: AvatarConfig; size?: "small" | "medium" | "large" }) {
  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32"
  }

  return (
    <div className={`${sizeClasses[size]} relative bg-gradient-to-br from-purple-100 to-pink-100 rounded-full overflow-hidden border-4 border-white shadow-lg`}>
      {/* Face */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: config.skin }}
      />
      
      {/* Hair */}
      <div
        className="absolute top-0 left-0 right-0 h-1/2 rounded-t-full"
        style={{ backgroundColor: config.hairColor }}
      />
      
      {/* Eyes */}
      <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-white">
        <div
          className="w-1 h-1 rounded-full margin-auto"
          style={{ backgroundColor: config.eyeColor }}
        />
      </div>
      <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-white">
        <div
          className="w-1 h-1 rounded-full margin-auto"
          style={{ backgroundColor: config.eyeColor }}
        />
      </div>
      
      {/* Outfit indication */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/4 rounded-b-full"
        style={{ backgroundColor: config.outfitColor }}
      />
      
      {/* Accessory indicator */}
      {config.accessory !== 'none' && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full" />
      )}
    </div>
  )
}

export { AvatarDisplay }