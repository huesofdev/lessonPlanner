import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router";
import './index.css'
import Auth from './routes/auth/auth'
import Home from './routes/home/home';
import Hello from './routes/someother/hello';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './routes/Dashboard';
import DashboardNavigator from './components/DashboardNavigator';
import AddLessonRecord from './routes/lecturer/addLessonRecord';
import AssignedCourses from './routes/lecturer/AssignedCourses';
import LessonRecordsList from './routes/lecturer/LessonRecordsList';
import AssignLecturers from './routes/hod/AssignLecturers';
import ViewAssignments from './routes/hod/ViewAssignments';
import ManageCourses from './routes/hod/ManageCourses';
import AddCourse from './routes/hod/AddCourse';
import DepartmentLessonRecords from './routes/hod/DepartmentLessonRecords';
import PendingUserApprovals from './routes/admin/PendingUserApprovals';
import ApprovedRejectedUsers from './routes/admin/ApprovedRejectedUsers';
import ProfilePage from './components/ProfilePage';
import UserLessonRecords from './routes/lecturer/UserLessonRecords';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Home, 
    children:[
      {
        path: "auth",
        Component: Auth
      },
      {
        path: 'some',
        Component: Hello
      }
    ]
  },
  {
    path: '/dashboard',
    Component: Dashboard,
    children:[
      {
        index:true,
        Component: DashboardNavigator
      },
      {
        path: 'lessons/add',
        Component: AddLessonRecord
      },
      {
        path: 'courses',
        Component: AssignedCourses
      },
       {
        path: 'lessons/list/:courseId',
        Component: LessonRecordsList
      },{
        path: 'lessons/list/all',
        Component: UserLessonRecords
      },
      {
        path: 'hod/assign/',
        Component: AssignLecturers
      },
      {
        path: 'hod/assignments',
        Component: ViewAssignments
      },
        {
        path: 'hod/courses',
        Component: ManageCourses
      },
        {
        path: 'hod/course/add',
        Component: AddCourse
      },
        {
        path: 'hod/lessons/list',
        Component: DepartmentLessonRecords
      },
        {
        path: 'admin/pending',
        Component: PendingUserApprovals
      },
        {
        path: 'admin/allusers',
        Component: ApprovedRejectedUsers
      },
      {
        path: 'profile',
        Component: ProfilePage
      }
      
      
      
    ]
  }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
  <RouterProvider router={router}/>
  </AuthProvider>
  </StrictMode>,
)
