// src/components/CourseCards.jsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, Plus } from 'lucide-react';

export default function CourseCard({ 
  courses = [], 
  limit = 5, 
  title = "Department Courses", 
  onView = () => {}, 
  onAdd = () => {} 
}) {
  const [filterText, setFilterText] = useState('');

  const filteredCourses = courses
    .filter(course =>
      course.courseTitle.toLowerCase().includes(filterText.toLowerCase()) ||
      course.courseId.toLowerCase().includes(filterText.toLowerCase())
    )
    .slice(0, limit); // apply limit

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>{title}</CardTitle>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter courses..."
                className="pl-8 pr-3 py-2 border rounded-md w-full sm:w-64"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4 mr-1" /> Add Course
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map(course => (
            <Card key={course.id} className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">{course.courseId}</CardTitle>
                <p className="text-sm text-muted-foreground">{course.courseTitle}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">
                  Lecturer: <span className="font-semibold">{course.lecturer}</span>
                </p>
                <Button size="sm" className="flex-1" onClick={() => onView(course)}>
                  View
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
