import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
// Import CheckCircleIcon here
import { Loader2Icon, BellIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react'; 
import { formatDistanceToNow } from 'date-fns'; // For relative time display

// --- Define the expected structure of a single notification item ---
// Adjust based on the actual data returned by /api/notifications (from storage.getNotificationsForUser)
interface NotificationItem {
  id: number;
  userId: number;
  message: string;
  type: 'match_found' | 'document_verified' | 'general' | string; // Add other types if needed
  relatedId: number | null; // ID of the related document or match
  isRead: boolean; // Assuming the backend provides this
  createdAt: string; // Assuming ISO date string
}

// --- Define the expected structure of the API response ---
interface NotificationsApiResponse {
  notifications: NotificationItem[];
}

const NotificationsPage = () => {
  // --- Fetch notifications data ---
  const { data, isLoading, isError, error, refetch } = useQuery<NotificationsApiResponse, Error>({
    queryKey: ['notifications'], // Unique query key for notifications
    queryFn: async () => {
      const response = await fetch('/api/notifications'); // Fetch from the correct endpoint
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Not authenticated. Please log in.');
        }
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      const jsonData: NotificationsApiResponse = await response.json();
      return jsonData;
    },
    // Optional: Refetch periodically or on window focus if desired
    // refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });

  // --- Render individual notification ---
  const renderNotification = (notification: NotificationItem) => {
    // Choose an icon based on type (customize as needed)
    let icon = <BellIcon className="w-4 h-4 text-blue-500" />;
    if (notification.type === 'match_found') {
      icon = <CheckCircleIcon className="w-4 h-4 text-green-500" />; 
    } else if (notification.type === 'document_verified') {
       icon = <CheckCircleIcon className="w-4 h-4 text-green-500" />;
    }

    return (
      <li key={notification.id} className={`flex items-start gap-4 p-4 ${!notification.isRead ? 'bg-primary/5' : ''}`}>
        <span className="mt-1">{icon}</span>
        <div className="flex-1">
          <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
          {/* Add actions like "View Match" or "Mark as Read" if needed */}
          {/* <Button size="sm" variant="link" className="p-0 h-auto mt-1">View Details</Button> */}
        </div>
        {/* Optional: Mark as read indicator/button */}
        {!notification.isRead && (
           <span className="w-2 h-2 bg-primary rounded-full mt-2" title="Unread"></span>
        )}
      </li>
    );
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-6">Notifications</h1>

      <Card>
        <CardHeader>
          <CardTitle>Recent Updates</CardTitle>
          <CardDescription>All your notifications and alerts will appear here.</CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center p-10">
              <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="p-6">
              <Alert variant="destructive">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertDescription>
                  Could not load notifications: {error.message}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Success State - No Notifications */}
          {/* Check if data exists AND data.notifications is an array before checking length */}
          {!isLoading && !isError && data && Array.isArray(data.notifications) && data.notifications.length === 0 && (
            <div className="p-6 text-center text-muted-foreground">
              You have no notifications yet.
            </div>
          )}

          {/* Success State - With Notifications */}
          {/* Check if data exists AND data.notifications is a non-empty array before mapping */}
          {!isLoading && !isError && data && Array.isArray(data.notifications) && data.notifications.length > 0 && (
            <ul className="divide-y divide-border">
              {data.notifications.map(renderNotification)}
            </ul>
          )}
        </CardContent>
        {/* Optional: Add footer with actions like "Mark all as read" */}
        {/* <CardFooter className="pt-4 border-t">
          <Button variant="outline" size="sm">Mark all as read</Button>
        </CardFooter> */}
      </Card>
    </DashboardLayout>
  );
};

// Removed the commented-out import from the bottom

export default NotificationsPage;