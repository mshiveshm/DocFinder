import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import ReportLostDocument from "@/pages/ReportLostDocument";
import ReportFoundDocument from "@/pages/ReportFoundDocument";
import SearchDocuments from "@/pages/SearchDocuments";
import Profile from "@/pages/Profile";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

import NotificationsPage from "@/pages/NotificationsPage";

// Protected route component
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType, path: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Route
      {...rest}
      component={() => (isAuthenticated ? <Component /> : <Redirect to="/" />)}
    />
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/report-lost" component={ReportLostDocument} />
      <ProtectedRoute path="/report-found" component={ReportFoundDocument} />
      <ProtectedRoute path="/search" component={SearchDocuments} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/notifications" component={NotificationsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;




// import { Router, Route, Switch } from 'wouter';
// import LandingPage from './pages/LandingPage'; // Import your LandingPage component
// import Dashboard from './pages/Dashboard';
// import ReportLostPage from './pages/ReportLostPage';
// import ReportFoundPage from './pages/ReportFoundPage';
// import SearchPage from './pages/SearchPage';
// import NotificationsPage from './pages/NotificationsPage';
// import ProfilePage from './pages/ProfilePage';
// import SettingsPage from './pages/SettingsPage'; // Assuming you have this
// import NotFoundPage from './pages/NotFoundPage'; // Optional: 404 page
// import ProtectedRoute from './ProtectedRoute'; // Your component to protect routes
// import { AuthProvider } from './lib/auth';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { Toaster } from "@/components/ui/toaster"; // Or your preferred toast library

// const queryClient = new QueryClient();

// function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <AuthProvider>
//         <Router> {/* Ensure Router wraps everything */}
//           <Switch> {/* Switch renders the first matching route */}
//             {/* --- THIS IS THE CRUCIAL ROUTE --- */}
//             <Route path="/">
//               <LandingPage />
//             </Route>

//             {/* Protected Dashboard Routes */}
//             <ProtectedRoute path="/dashboard">
//               <Dashboard />
//             </ProtectedRoute>
//             <ProtectedRoute path="/report-lost">
//               <ReportLostPage />
//             </ProtectedRoute>
//             <ProtectedRoute path="/report-found">
//               <ReportFoundPage />
//             </ProtectedRoute>
//             <ProtectedRoute path="/search">
//               <SearchPage />
//             </ProtectedRoute>
//             <ProtectedRoute path="/notifications">
//               <NotificationsPage />
//             </ProtectedRoute>
//              <ProtectedRoute path="/notifications/:id"> {/* Optional: Route for specific notification */}
//               {/* <NotificationDetailPage /> */}
//               <NotificationsPage /> {/* Or reuse NotificationsPage */}
//             </ProtectedRoute>
//             <ProtectedRoute path="/profile">
//               <ProfilePage />
//             </ProtectedRoute>
//              <ProtectedRoute path="/settings">
//               <SettingsPage />
//             </ProtectedRoute>

//             {/* Add other public routes if needed */}

//             {/* Fallback 404 Route */}
//             <Route>
//               <NotFoundPage />
//             </Route>
//           </Switch>
//         </Router>
//         <Toaster />
//       </AuthProvider>
//     </QueryClientProvider>
//   );
// }

// export default App;