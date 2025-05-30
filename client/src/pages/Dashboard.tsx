// import { useState } from 'react';
// import { useLocation } from 'wouter';
// import { useQuery } from '@tanstack/react-query';
// import DashboardLayout from '@/components/dashboard/DashboardLayout';
// import StatCard from '@/components/dashboard/StatCard';
// import ActivityItem from '@/components/dashboard/ActivityItem';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { 
//   AlertCircleIcon, 
//   CheckCircleIcon, 
//   PlusIcon, 
//   ArrowRightIcon, 
//   BarChart3Icon, 
//   CalendarIcon, 
//   FileTextIcon,
//   SearchIcon,
//   HandIcon,
//   // BellIcon // Removed as notifications are not fetched here
//   Loader2Icon // Added for loading state
// } from 'lucide-react';
// import { useAuth } from '@/lib/auth';
// // Removed mock data imports
// import { Progress } from '@/components/ui/progress';

// // --- Interfaces matching the backend /api/dashboard response ---
// interface DashboardStats {
//   documentsLost: number;
//   documentsFound: number;
//   successfulMatches: number;
//   pendingMatches: number;
// }

// interface ActivityItemData {
//   icon: string; // e.g., 'file-upload', 'hand-holding', 'check'
//   title: string;
//   time: string; // Assuming backend sends formatted string
//   status?: string; // Optional status
//   // Add other potential fields if your backend sends them
//   description?: string; 
//   location?: string;
//   actionLabel?: string;
// }

// interface DashboardApiResponse {
//   potentialMatches: number;
//   activities: ActivityItemData[];
//   stats: DashboardStats;
//   // notifications are NOT included in the current backend route
// }

// const Dashboard = () => {
//   const { user } = useAuth();
//   const [, navigate] = useLocation();
//   const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found'>('all');

//   // --- Updated useQuery to fetch from the actual API ---
//   const { data, isLoading, error } = useQuery<DashboardApiResponse, Error>({
//     queryKey: ['dashboardData'], // Use a descriptive query key
//     queryFn: async () => {
//       const response = await fetch('/api/dashboard');
//       if (!response.ok) {
//         if (response.status === 401) {
//           // Handle unauthorized access, maybe redirect to login
//           throw new Error('Not authenticated. Please log in.');
//         }
//         const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
//         throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
//       }
//       const jsonData: DashboardApiResponse = await response.json();
//       return jsonData;
//     },
//     // Optional: Add configuration like refetch intervals or stale time if needed
//     // staleTime: 1000 * 60 * 5, // 5 minutes
//   });

//   // --- Loading State ---
//   if (isLoading) {
//     return (
//       <DashboardLayout>
//         <div className="flex items-center justify-center h-64">
//           <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
//         </div>
//       </DashboardLayout>
//     );
//   }

//   // --- Error State ---
//   if (error) {
//     return (
//       <DashboardLayout>
//         <Alert variant="destructive">
//           <AlertCircleIcon className="h-4 w-4" />
//           <AlertDescription>
//             Error loading dashboard data: {error.message}
//           </AlertDescription>
//         </Alert>
//       </DashboardLayout>
//     );
//   }

//   // --- Quick Actions (No change needed) ---
//   const quickActions = [
//     {
//       title: 'Report Lost Document',
//       description: 'Upload details about your lost document to start searching.',
//       icon: <FileTextIcon className="h-5 w-5 text-primary" />,
//       action: () => navigate('/report-lost'),
//       buttonText: 'Get Started',
//       color: 'bg-blue-50'
//     },
//     {
//       title: 'Report Found Document',
//       description: 'Help someone recover their lost document by reporting it here.',
//       icon: <HandIcon className="h-5 w-5 text-orange-500" />,
//       action: () => navigate('/report-found'),
//       buttonText: 'Submit Found Item',
//       color: 'bg-orange-50'
//     },
//     {
//       title: 'Search Documents',
//       description: 'Browse through our database of found documents.',
//       icon: <SearchIcon className="h-5 w-5 text-green-500" />,
//       action: () => navigate('/search'),
//       buttonText: 'Start Searching',
//       color: 'bg-green-50'
//     }
//   ];

//   // --- Calculate match success rate ---
//   const matchSuccessRate = 
//     data && data.stats && data.stats.documentsLost > 0 
//       ? Math.round((data.stats.successfulMatches / data.stats.documentsLost) * 100) 
//       : 0;

//   // --- Filter activities based on the active tab ---
//   const filteredActivities = data?.activities.filter(activity => {
//     if (activeTab === 'all') return true;
//     // Match icon names based on backend routes.ts
//     if (activeTab === 'lost' && (activity.icon === 'file-upload')) return true; 
//     if (activeTab === 'found' && (activity.icon === 'hand-holding')) return true;
//     // Add 'check' for matches if needed, or adjust logic
//     return false;
//   });

//   return (
//     <DashboardLayout>
//       {/* Welcome Banner */}
//       <Card className="mb-6 border-none bg-gradient-to-r from-blue-50 to-primary/5 shadow-sm">
//         <CardContent className="p-6">
//           <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName || 'User'}!</h1>
//               <p className="text-gray-700 mt-1">
//                 Here's what's happening with your document recovery.
//                 {/* Use data from API */}
//                 {data && data.stats.documentsLost > 0 && ` You have reported ${data.stats.documentsLost} document(s).`}
//               </p>
//             </div>
//             <div className="mt-4 md:mt-0 flex gap-2">
//               <Button 
//                 variant="outline"
//                 className="bg-white" 
//                 onClick={() => navigate('/search')}
//               >
//                 <SearchIcon className="h-4 w-4 mr-2" /> Search Documents
//               </Button>
//               <Button 
//                 onClick={() => navigate('/report-lost')}
//               >
//                 <PlusIcon className="h-4 w-4 mr-2" /> Report Document
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Potential Matches Alert - Use data from API */}
//       {data?.potentialMatches && data.potentialMatches > 0 && (
//         <Alert className="mb-6 bg-green-50 border border-green-200 text-green-800">
//           <CheckCircleIcon className="h-4 w-4 text-green-500" />
//           <AlertDescription className="flex justify-between items-center w-full">
//             <span>
//               Good news! We found <strong>{data.potentialMatches} potential matches</strong> for documents you reported lost.
//             </span>
//             <Button 
//               variant="outline" 
//               className="bg-white border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
//               // Navigate to a page showing matches, maybe search page pre-filtered?
//               onClick={() => navigate('/search')} 
//             >
//               View Matches
//               <ArrowRightIcon className="ml-2 h-3 w-3" />
//             </Button>
//           </AlertDescription>
//         </Alert>
//       )}

//       {/* Stats Overview - Use data from API */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
//         <StatCard 
//           title="Documents Lost" 
//           value={data?.stats.documentsLost ?? 0} 
//           icon="file-export"
//           iconBgColor="bg-red-100"
//           iconColor="text-red-500"
//           // percentChange={12} // Remove or calculate based on historical data if available
//           // subtext="Last 30 days"
//         />
//         <StatCard 
//           title="Documents Found" 
//           value={data?.stats.documentsFound ?? 0} 
//           icon="file-import"
//           iconBgColor="bg-green-100"
//           iconColor="text-green-500"
//           // percentChange={5}
//           // subtext="Last 30 days"
//         />
//         <StatCard 
//           title="Success Rate" 
//           value={matchSuccessRate} 
//           icon="percent"
//           iconBgColor="bg-blue-100"
//           iconColor="text-blue-600"
//           subtext={`${data?.stats.successfulMatches ?? 0} successful matches`}
//         />
//         <StatCard 
//           title="Pending Matches" 
//           value={data?.stats.pendingMatches ?? 0}
//           icon="clock" 
//           iconBgColor="bg-yellow-100"
//           iconColor="text-yellow-500"
//           subtext="Awaiting verification"
//         />
//       </div>

//       {/* Quick Actions (No change needed) */}
//       <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
//         {quickActions.map((action, index) => (
//           <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
//             <div className={`${action.color} px-6 py-4`}>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   {action.icon}
//                   <h3 className="ml-2 text-lg font-medium text-gray-900">{action.title}</h3>
//                 </div>
//               </div>
//             </div>
//             <CardContent className="px-6 py-4">
//               <p className="text-gray-600 mb-4">{action.description}</p>
//               <Button 
//                 variant="ghost"
//                 className="p-0 text-primary font-medium hover:bg-primary/5" 
//                 onClick={action.action}
//               >
//                 {action.buttonText} <ArrowRightIcon className="ml-1 h-3 w-3" />
//               </Button>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Recent Activity */}
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
//         <div className="flex gap-2">
//           <Button 
//             variant={activeTab === 'all' ? 'secondary' : 'ghost'} 
//             size="sm"
//             onClick={() => setActiveTab('all')}
//           >
//             All
//           </Button>
//           <Button 
//             variant={activeTab === 'lost' ? 'secondary' : 'ghost'} 
//             size="sm"
//             onClick={() => setActiveTab('lost')}
//           >
//             Lost
//           </Button>
//           <Button 
//             variant={activeTab === 'found' ? 'secondary' : 'ghost'} 
//             size="sm"
//             onClick={() => setActiveTab('found')}
//           >
//             Found
//           </Button>
//         </div>
//       </div>
//       <Card className="mb-8">
//         {/* Use filteredActivities based on API data */}
//         {filteredActivities?.length === 0 ? (
//           <CardContent className="p-6 text-center">
//             <p className="text-gray-500">No activity found for this filter.</p>
//           </CardContent>
//         ) : (
//           <CardContent className="p-0">
//             <ul className="divide-y divide-gray-200">
//               {filteredActivities?.map((activity, index) => (
//                 <ActivityItem 
//                   key={index} 
//                   // Pass props based on ActivityItemData interface
//                   icon={activity.icon as any} // Cast needed if ActivityItem expects specific icon types
//                   title={activity.title} 
//                   time={activity.time} // Already a string from backend
//                   status={activity.status}
//                   description={activity.description}
//                   location={activity.location}
//                   actionLabel={activity.actionLabel || "View Details"}
//                   // Define action based on activity type if needed
//                   onAction={() => navigate('/search')} 
//                 />
//               ))}
//             </ul>
//           </CardContent>
//         )}
//       </Card>

//       {/* Additional Stats & Analytics */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
//         {/* Match Success Rate */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-lg font-semibold flex items-center">
//               <BarChart3Icon className="h-5 w-5 mr-2 text-primary" />
//               Match Success Rate
//             </CardTitle>
//             <CardDescription>Visual representation of document recovery</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               <div>
//                 <div className="flex justify-between mb-1">
//                   <span className="text-sm font-medium">All Documents Reported Lost</span>
//                   <span className="text-sm font-medium">{data?.stats.documentsLost ?? 0} total</span>
//                 </div>
//                 {/* Progress bar representing all lost documents */}
//               </div>
              
//               <div>
//                 <div className="flex justify-between mb-1">
//                   <span className="text-sm font-medium">Successfully Matched</span>
//                   <span className="text-sm font-medium">{data?.stats.successfulMatches ?? 0} matched ({matchSuccessRate}%)</span>
//                 </div>
//                 <Progress 
//                   value={matchSuccessRate} 
//                   className="h-2" // Removed bg-gray-200, relies on default styling
//                 />
//               </div>
              
//               <div>
//                 <div className="flex justify-between mb-1">
//                   <span className="text-sm font-medium">Pending Matches</span>
//                   <span className="text-sm font-medium">{data?.stats.pendingMatches ?? 0} pending</span>
//                 </div>
//                 <Progress 
//                   value={(data && data.stats.documentsLost > 0 ? (data.stats.pendingMatches / data.stats.documentsLost) * 100 : 0)} 
//                   className="h-2" 
//                   indicatorClassName="bg-yellow-400" // Example: Style pending differently
//                 />
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* --- Recent Notifications Card Removed --- */}
//         {/* 
//           The /api/dashboard endpoint doesn't return notifications.
//           To display notifications here, you would need to:
//           1. Ensure the backend /api/notifications endpoint works.
//           2. Add another useQuery hook here to fetch data from /api/notifications.
//           3. Render the notifications based on the data from that second query.
//         */}
//          <Card>
//           <CardHeader>
//             <CardTitle className="text-lg font-semibold flex items-center">
//               {/* <BellIcon className="h-5 w-5 mr-2 text-primary" /> */}
//               Notifications
//             </CardTitle>
//             <CardDescription>Latest updates and alerts</CardDescription>
//           </CardHeader>
//           <CardContent className="text-center text-muted-foreground">
//              Notifications data not loaded from /api/dashboard. 
//              <br/>
//              <Button 
//               variant="link" 
//               className="p-0 h-auto mt-2"
//               onClick={() => navigate('/notifications')}
//              >
//                Go to Notifications Page
//              </Button>
//           </CardContent>
//         </Card>

//       </div>

//       {/* Upcoming Features (No change needed) */}
//       <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
//         <div className="flex items-start">
//           <div className="bg-white p-2 rounded-full shadow-sm">
//             <CalendarIcon className="h-5 w-5 text-primary" />
//           </div>
//           <div className="ml-3">
//             <h3 className="font-medium text-gray-900">Coming Soon</h3>
//             <p className="text-sm text-gray-600 mt-1">
//               We're adding location-based search and AI-powered document verification. Stay tuned for updates!
//             </p>
//           </div>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default Dashboard;

import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import ActivityItem from '@/components/dashboard/ActivityItem';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircleIcon,
  CheckCircleIcon,
  PlusIcon,
  ArrowRightIcon,
  BarChart3Icon,
  CalendarIcon,
  FileTextIcon,
  SearchIcon,
  HandIcon,
  BellIcon, // Added back for notifications card
  Loader2Icon // Added for loading state
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Progress } from '@/components/ui/progress';
import { type Notification as NotificationData } from '../../../shared/schema'; // Import Notification type

// --- Interfaces matching the backend /api/dashboard response ---
interface DashboardStats {
  documentsLost: number;
  documentsFound: number;
  successfulMatches: number;
  pendingMatches: number;
}

interface ActivityItemData {
  id: number; // Assuming activities have IDs
  icon: string; // e.g., 'reported_lost', 'reported_found', 'match_found', 'match_lost'
  message: string; // Use message from notification for title/description
  createdAt: string; // Assuming backend sends formatted string or Date object
  type: string; // Notification type
  read: boolean;
  relatedId?: number | null;
  // Map notification fields to ActivityItem props
  title?: string; // Will derive from message
  time?: string; // Will derive from createdAt
  status?: string; // Can derive from type or read status
  description?: string; // Can derive from message
  location?: string; // Not directly available in notification
  actionLabel?: string; // Can set based on type
}

interface DashboardApiResponse {
  potentialMatches: number;
  activities: ActivityItemData[]; // This now maps from NotificationData
  stats: DashboardStats;
}

// --- Interface for /api/notifications response ---
interface NotificationsApiResponse {
    notifications: NotificationData[];
}


// --- Helper to format date/time ---
// Accepts Date object or string
const formatRelativeTime = (dateInput: string | Date): string => {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) { // Check if date is valid
        return typeof dateInput === 'string' ? dateInput : 'Invalid Date';
    }
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return `Yesterday`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(); // Fallback for older dates
  } catch (e) {
    return typeof dateInput === 'string' ? dateInput : 'Error formatting date'; // Return original if parsing fails
  }
};

// --- Helper to map notification type to ActivityItem icon ---
const mapNotificationTypeToIcon = (type: string): string => {
    switch (type) {
        case 'reported_lost': return 'FileUp'; // Match routes.ts mapping
        case 'reported_found': return 'HandHelping'; // Match routes.ts mapping
        case 'match_found': return 'CheckCircle2'; // Match routes.ts mapping
        case 'match_lost': return 'CheckCircle2'; // Match routes.ts mapping
        default: return 'Bell'; // Default icon
    }
};


const Dashboard = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found'>('all');

  // --- Query for Dashboard Stats & Activities (from /api/dashboard) ---
  const { data: dashboardData, isLoading: isLoadingDashboard, error: dashboardError } = useQuery<DashboardApiResponse, Error>({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        if (response.status === 401) throw new Error('Not authenticated. Please log in.');
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      const jsonData: DashboardApiResponse = await response.json();
      // Map activities from backend structure to ActivityItemData
      const mappedActivities = jsonData.activities.map(act => ({
          ...act,
          icon: mapNotificationTypeToIcon(act.type), // Map type to icon name
          title: act.message, // Use message as title
          time: formatRelativeTime(act.createdAt), // Format time
          status: act.read ? 'Read' : 'Unread', // Example status based on read
          actionLabel: act.type.startsWith('match_') ? 'View Match' : 'View Details', // Example action label
      }));
      return { ...jsonData, activities: mappedActivities };
    },
  });

  // --- Query for Notifications (from /api/notifications) ---
  const { data: notificationsData, isLoading: isLoadingNotifications, error: notificationsError } = useQuery<NotificationsApiResponse, Error>({
      queryKey: ['notificationsData'],
      queryFn: async () => {
          const response = await fetch('/api/notifications');
          if (!response.ok) {
              if (response.status === 401) throw new Error('Not authenticated. Please log in.');
              const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
              throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
          }
          const jsonData: NotificationsApiResponse = await response.json();
          // Ensure createdAt is parsed as Date if it comes as string
          jsonData.notifications = jsonData.notifications.map(n => ({
              ...n,
              createdAt: new Date(n.createdAt) // Ensure it's a Date object
          }));
          // Sort notifications by date descending if needed (backend might already do this)
          // jsonData.notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          return jsonData;
      },
      // staleTime: 1000 * 60 * 1, // Optional: Refetch notifications more frequently (e.g., every minute)
  });


  // --- Combined Loading State ---
  if (isLoadingDashboard || isLoadingNotifications) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
          <span className="ml-4 text-muted-foreground">Loading dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  // --- Combined Error State ---
  // Show the first error encountered
  const combinedError = dashboardError || notificationsError;
  if (combinedError) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>
            Error loading dashboard data: {combinedError.message}
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  // --- Quick Actions (No change needed) ---
  const quickActions = [
    {
      title: 'Report Lost Document',
      description: 'Upload details about your lost document to start searching.',
      icon: <FileTextIcon className="h-5 w-5 text-primary" />,
      action: () => navigate('/report-lost'),
      buttonText: 'Get Started',
      color: 'bg-blue-50'
    },
    {
      title: 'Report Found Document',
      description: 'Help someone recover their lost document by reporting it here.',
      icon: <HandIcon className="h-5 w-5 text-orange-500" />,
      action: () => navigate('/report-found'),
      buttonText: 'Submit Found Item',
      color: 'bg-orange-50'
    },
    {
      title: 'Search Documents',
      description: 'Browse through our database of found documents.',
      icon: <SearchIcon className="h-5 w-5 text-green-500" />,
      action: () => navigate('/search'),
      buttonText: 'Start Searching',
      color: 'bg-green-50'
    }
  ];

  // --- Calculate match success rate ---
  const matchSuccessRate =
    dashboardData && dashboardData.stats && dashboardData.stats.documentsLost > 0
      ? Math.round((dashboardData.stats.successfulMatches / dashboardData.stats.documentsLost) * 100)
      : 0;

  // --- Filter activities based on the active tab ---
  // Use the mapped activities from dashboardData
  const filteredActivities = dashboardData?.activities.filter(activity => {
    if (activeTab === 'all') return true;
    // Match based on the mapped icon name or original type
    if (activeTab === 'lost' && (activity.icon === 'FileUp' || activity.type === 'reported_lost')) return true;
    if (activeTab === 'found' && (activity.icon === 'HandHelping' || activity.type === 'reported_found')) return true;
    return false;
  });

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <Card className="mb-6 border-none bg-gradient-to-r from-blue-50 to-primary/5 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName || 'User'}!</h1>
              <p className="text-gray-700 mt-1">
                Here's what's happening with your document recovery.
                {/* Use data from API */}
                {dashboardData && dashboardData.stats.documentsLost > 0 && ` You have reported ${dashboardData.stats.documentsLost} document(s).`}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <Button
                variant="outline"
                className="bg-white"
                onClick={() => navigate('/search')}
              >
                <SearchIcon className="h-4 w-4 mr-2" /> Search Documents
              </Button>
              <Button
                onClick={() => navigate('/report-lost')}
              >
                <PlusIcon className="h-4 w-4 mr-2" /> Report Document
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Potential Matches Alert - Use data from API */}
      {dashboardData?.potentialMatches && dashboardData.potentialMatches > 0 && (
        <Alert className="mb-6 bg-green-50 border border-green-200 text-green-800">
          <CheckCircleIcon className="h-4 w-4 text-green-500" />
          <AlertDescription className="flex justify-between items-center w-full">
            <span>
              Good news! We found <strong>{dashboardData.potentialMatches} potential matches</strong> for documents you reported lost.
            </span>
            <Button
              variant="outline"
              className="bg-white border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
              // Navigate to a page showing matches, maybe search page pre-filtered?
              onClick={() => navigate('/notifications')} // Navigate to notifications page to see matches
            >
              View Notifications
              <ArrowRightIcon className="ml-2 h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Overview - Use data from API */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Documents Lost"
          value={dashboardData?.stats.documentsLost ?? 0}
          icon="file-export"
          iconBgColor="bg-red-100"
          iconColor="text-red-500"
        />
        <StatCard
          title="Documents Found"
          value={dashboardData?.stats.documentsFound ?? 0}
          icon="file-import"
          iconBgColor="bg-green-100"
          iconColor="text-green-500"
        />
        <StatCard
          title="Success Rate"
          value={matchSuccessRate}
          icon="percent"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          subtext={`${dashboardData?.stats.successfulMatches ?? 0} successful matches`}
        />
        <StatCard
          title="Pending Matches"
          value={dashboardData?.stats.pendingMatches ?? 0}
          icon="clock"
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-500"
          subtext="Awaiting verification"
        />
      </div>

      {/* Quick Actions (No change needed) */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {quickActions.map((action, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className={`${action.color} px-6 py-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {action.icon}
                  <h3 className="ml-2 text-lg font-medium text-gray-900">{action.title}</h3>
                </div>
              </div>
            </div>
            <CardContent className="px-6 py-4">
              <p className="text-gray-600 mb-4">{action.description}</p>
              <Button
                variant="ghost"
                className="p-0 text-primary font-medium hover:bg-primary/5"
                onClick={action.action}
              >
                {action.buttonText} <ArrowRightIcon className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('all')}
          >
            All
          </Button>
          <Button
            variant={activeTab === 'lost' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('lost')}
          >
            Lost
          </Button>
          <Button
            variant={activeTab === 'found' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('found')}
          >
            Found
          </Button>
        </div>
      </div>
      <Card className="mb-8">
        {/* Use filteredActivities based on API data */}
        {!filteredActivities || filteredActivities.length === 0 ? (
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No activity found for this filter.</p>
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-200">
              {filteredActivities?.map((activity) => (
                <ActivityItem
                  key={activity.id} // Use notification ID as key
                  // Pass props based on ActivityItemData interface
                  icon={activity.icon} // Use mapped icon
                  // Provide fallback empty strings for required props
                  title={activity.title ?? ''}
                  time={activity.time ?? ''}
                  status={activity.status ?? 'unknown'} // Default status if undefined
                  description={activity.description} // Optional prop
                  location={activity.location} // Optional prop
                  actionLabel={activity.actionLabel} // Optional prop
                  // Define action based on activity type if needed
                  onAction={() => navigate(`/notifications/${activity.id}`)} // Navigate to specific notification or related item
                />
              ))}
            </ul>
          </CardContent>
        )}
      </Card>

      {/* Additional Stats & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {/* Match Success Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <BarChart3Icon className="h-5 w-5 mr-2 text-primary" />
              Match Success Rate
            </CardTitle>
            <CardDescription>Visual representation of document recovery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">All Documents Reported Lost</span>
                  <span className="text-sm font-medium">{dashboardData?.stats.documentsLost ?? 0} total</span>
                </div>
                {/* Progress bar representing all lost documents */}
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Successfully Matched</span>
                  <span className="text-sm font-medium">{dashboardData?.stats.successfulMatches ?? 0} matched ({matchSuccessRate}%)</span>
                </div>
                <Progress
                  value={matchSuccessRate}
                  className="h-2" // Removed bg-gray-200, relies on default styling
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Pending Matches</span>
                  <span className="text-sm font-medium">{dashboardData?.stats.pendingMatches ?? 0} pending</span>
                </div>
                <Progress
                  value={(dashboardData && dashboardData.stats.documentsLost > 0 ? (dashboardData.stats.pendingMatches / dashboardData.stats.documentsLost) * 100 : 0)}
                  className="h-2"
                  indicatorClassName="bg-yellow-400" // Example: Style pending differently
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Updated Recent Notifications Card --- */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <BellIcon className="h-5 w-5 mr-2 text-primary" />
              Recent Notifications
            </CardTitle>
            <CardDescription>Latest updates and alerts</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[250px] overflow-y-auto p-4 space-y-3"> {/* Adjusted padding and added space-y */}
            {isLoadingNotifications ? (
              <div className="flex items-center justify-center text-muted-foreground">
                <Loader2Icon className="h-4 w-4 animate-spin mr-2" /> Loading...
              </div>
            ) : notificationsError ? (
              <p className="text-sm text-destructive">Error loading notifications.</p>
            ) : !notificationsData || notificationsData.notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">No recent notifications.</p>
            ) : (
              <ul className="space-y-3">
                {notificationsData.notifications.slice(0, 4).map((notification) => ( // Show latest 4
                  <li key={notification.id} className="flex items-start">
                    <div className={`rounded-full p-1 mt-0.5 ${notification.read ? 'bg-gray-100' : 'bg-blue-100'}`}>
                      <CheckCircleIcon className={`h-3 w-3 ${notification.read ? 'text-gray-500' : 'text-blue-600'}`} />
                    </div>
                    <div className="ml-2 flex-1">
                      <p className={`text-sm ${notification.read ? 'text-muted-foreground' : 'font-medium'}`}>{notification.message}</p>
                      {/* Pass the Date object directly to formatRelativeTime */}
                      <p className="text-xs text-gray-500">{formatRelativeTime(notification.createdAt)}</p>
                    </div>
                    {/* Optional: Add a button/link to mark as read or navigate */}
                    {/* <Button variant="ghost" size="sm" className="ml-auto">...</Button> */}
                  </li>
                ))}
              </ul>
            )}
            {/* Keep the View All button outside the conditional rendering */}
            {notificationsData && notificationsData.notifications.length > 0 && (
                 <Button
                    variant="ghost"
                    className="w-full mt-3 text-primary hover:bg-primary/5"
                    onClick={() => navigate('/notifications')}
                 >
                    View All Notifications
                 </Button>
            )}
             {/* Show link even if loading/error/empty */}
             {(!notificationsData || notificationsData.notifications.length === 0) && !isLoadingNotifications && (
                 <Button
                    variant="link"
                    className="w-full mt-3 text-primary"
                    onClick={() => navigate('/notifications')}
                 >
                    Go to Notifications Page
                 </Button>
             )}
          </CardContent>
        </Card>

      </div>

      {/* Upcoming Features (No change needed) */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-start">
          <div className="bg-white p-2 rounded-full shadow-sm">
            <CalendarIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-900">Coming Soon</h3>
            <p className="text-sm text-gray-600 mt-1">
              We're adding location-based search and AI-powered document verification. Stay tuned for updates!
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;