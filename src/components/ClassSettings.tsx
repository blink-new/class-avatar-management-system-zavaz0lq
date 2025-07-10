import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

export function ClassSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="className">Class Name</Label>
          <Input id="className" defaultValue="My Awesome Class" />
        </div>
        <Button>Save Settings</Button>
      </CardContent>
    </Card>
  )
}
