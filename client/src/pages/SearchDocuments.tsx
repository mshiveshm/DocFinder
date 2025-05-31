// import { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import DashboardLayout from '@/components/dashboard/DashboardLayout';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardFooter } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Loader2Icon, SearchIcon, FileTextIcon } from 'lucide-react';
// import { documentTypes } from '@shared/schema';
// import { fetchSearchResults } from '@/lib/mock-data';

// const SearchDocuments = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedType, setSelectedType] = useState<string>('');
//   const [selectedLocation, setSelectedLocation] = useState<string>('');
//   const [activeTab, setActiveTab] = useState('found');

//   const { data, isLoading, refetch } = useQuery({
//     queryKey: ['/api/search', activeTab, searchQuery, selectedType, selectedLocation],
//     queryFn: () => fetchSearchResults(activeTab, searchQuery, selectedType, selectedLocation),
//   });

//   const handleSearch = () => {
//     refetch();
//   };

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//           <h2 className="text-2xl font-bold text-gray-900">Search Documents</h2>
          
//           <Tabs 
//             defaultValue="found" 
//             className="w-full md:w-auto"
//             onValueChange={(value) => setActiveTab(value)}
//           >
//             <TabsList className="grid w-full grid-cols-2">
//               <TabsTrigger value="found">Found Documents</TabsTrigger>
//               <TabsTrigger value="lost">Lost Documents</TabsTrigger>
//             </TabsList>
//           </Tabs>
//         </div>

//         <Card>
//           <CardContent className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
//               <div className="col-span-1 md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Search
//                 </label>
//                 <div className="relative">
//                   <Input
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     placeholder="Search by description or name"
//                     className="pl-10"
//                   />
//                   <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 </div>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Document Type
//                 </label>
//                 <Select
//                   value={selectedType}
//                   onValueChange={setSelectedType}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="All types" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All types</SelectItem>
//                     <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
//                     <SelectItem value="pan">PAN Card</SelectItem>
//                     <SelectItem value="passport">Passport</SelectItem>
//                     <SelectItem value="driving_license">Driving License</SelectItem>
//                     <SelectItem value="voter_id">Voter ID</SelectItem>
//                     <SelectItem value="other">Other</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Location
//                 </label>
//                 <Select
//                   value={selectedLocation}
//                   onValueChange={setSelectedLocation}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="All locations" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All locations</SelectItem>
//                     <SelectItem value="delhi">Delhi</SelectItem>
//                     <SelectItem value="mumbai">Mumbai</SelectItem>
//                     <SelectItem value="bangalore">Bangalore</SelectItem>
//                     <SelectItem value="chennai">Chennai</SelectItem>
//                     <SelectItem value="hyderabad">Hyderabad</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
            
//             <Button 
//               onClick={handleSearch} 
//               className="mt-4 w-full md:w-auto"
//             >
//               {isLoading ? (
//                 <>
//                   <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
//                   Searching...
//                 </>
//               ) : (
//                 <>
//                   <SearchIcon className="mr-2 h-4 w-4" />
//                   Search
//                 </>
//               )}
//             </Button>
//           </CardContent>
//         </Card>

//         <div className="mt-6">
//           <h3 className="text-lg font-medium text-gray-900 mb-4">
//             {activeTab === 'found' ? 'Found Documents' : 'Lost Documents'} 
//             {data?.results.length ? ` (${data.results.length} results)` : ''}
//           </h3>
          
//           {isLoading ? (
//             <div className="flex justify-center items-center h-40">
//               <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
//             </div>
//           ) : data?.results.length === 0 ? (
//             <Card className="bg-gray-50 border border-dashed">
//               <CardContent className="p-6 text-center">
//                 <FileTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
//                 <p className="text-gray-500">
//                   Try adjusting your search criteria or check back later.
//                 </p>
//               </CardContent>
//             </Card>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//               {data?.results.map((document: any, index: number) => (
//                 <Card key={index} className="overflow-hidden">
//                   <div className="h-40 bg-gray-100 flex items-center justify-center">
//                     {document.hasImage ? (
//                       <img 
//                         src="https://via.placeholder.com/300x150?text=Document+Image" 
//                         alt="Document" 
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <FileTextIcon className="h-16 w-16 text-gray-400" />
//                     )}
//                   </div>
//                   <CardContent className="p-4">
//                     <div className="flex justify-between items-start mb-2">
//                       <Badge variant={activeTab === 'found' ? 'secondary' : 'outline'}>
//                         {document.documentType === 'aadhaar' && 'Aadhaar Card'}
//                         {document.documentType === 'pan' && 'PAN Card'}
//                         {document.documentType === 'passport' && 'Passport'}
//                         {document.documentType === 'driving_license' && 'Driving License'}
//                         {document.documentType === 'voter_id' && 'Voter ID'}
//                         {document.documentType === 'other' && 'Other'}
//                       </Badge>
//                       <Badge variant={document.status === 'pending' ? 'outline' : 'default'}>
//                         {document.status}
//                       </Badge>
//                     </div>
                    
//                     {activeTab === 'lost' && (
//                       <p className="text-sm font-medium mb-1">Name: {document.nameOnDocument}</p>
//                     )}
                    
//                     <p className="text-sm text-gray-500 mb-2">
//                       {activeTab === 'found' 
//                         ? `Found on ${new Date(document.dateFound).toLocaleDateString()} at ${document.locationFound}`
//                         : `Lost on ${new Date(document.dateLost).toLocaleDateString()} at ${document.locationLost}`
//                       }
//                     </p>
                    
//                     <p className="text-sm line-clamp-2 text-gray-700">
//                       {document.description || 'No description provided'}
//                     </p>
//                   </CardContent>
//                   <CardFooter className="px-4 py-3 bg-gray-50">
//                     <Button variant="link" className="p-0 h-auto text-primary">
//                       {activeTab === 'found' 
//                         ? 'Is this your document?' 
//                         : 'I found this document'
//                       }
//                     </Button>
//                   </CardFooter>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default SearchDocuments;


import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2Icon, SearchIcon, FileTextIcon, MapPinIcon, CalendarIcon, AlertCircleIcon } from 'lucide-react';
import { documentTypes } from '@shared/schema'; // Assuming this holds valid document type values
import { formatDistanceToNow } from 'date-fns'; // For displaying relative time

// --- Define the expected structure of a single search result item ---
// Adjust these fields based on the actual data returned by your API
// (combination of LostDocument and FoundDocument fields from your schema/storage)
interface SearchResultItem {
  id: number;
  userId: number;
  documentType: string;
  description: string | null;
  createdAt: string; // Assuming ISO date string
  status: string; // e.g., 'pending', 'matched'
  hasImage: boolean;
  imageUrl: string | null;
  // Lost document specific fields (optional)
  nameOnDocument?: string | null;
  dateLost?: string | null; // Assuming ISO date string
  locationLost?: string | null;
  // Found document specific fields (optional)
  dateFound?: string | null; // Assuming ISO date string
  locationFound?: string | null;
  aiAnalysis?: any | null; // Adjust type if needed
}

// --- Define the expected structure of the API response ---
interface SearchApiResponse {
  results: SearchResultItem[];
}

const SearchDocuments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  // Use 'all' as the value for the "All" option
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('found'); // Default to 'found' or 'lost'

  const { data, isLoading, isError, error, refetch } = useQuery<SearchApiResponse, Error>({
    // Query key includes all dependencies that trigger a refetch
    queryKey: ['search', activeTab, searchQuery, selectedType, selectedLocation],
    
    // Function to fetch data from the backend API
    queryFn: async () => {
      const params = new URLSearchParams();
      // Use 'type' parameter name as expected by the backend
      params.append('type', activeTab); 

      if (searchQuery) {
        params.append('query', searchQuery);
      }
      // Only add documentType/location if a specific value (not 'all') is selected
      if (selectedType && selectedType !== 'all') {
        params.append('documentType', selectedType);
      }
      if (selectedLocation && selectedLocation !== 'all') {
        params.append('location', selectedLocation);
      }

      const response = await fetch(`/api/search?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const jsonData: SearchApiResponse = await response.json();
      return jsonData;
    },
    // Keep previous data while refetching for a smoother experience
    // keepPreviousData: true, 
    // Disable automatic refetching on window focus, mount, etc. if desired
    // refetchOnWindowFocus: false,
    // refetchOnMount: false,
    // refetchOnReconnect: false,
    // You might want to disable the query initially and only run it on button click
    enabled: false, 
  });

  const handleSearch = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault(); // Prevent form submission if called from form onSubmit
    // Manually trigger the query refetch with current parameters
    refetch();
  };

  const renderDocumentCard = (document: SearchResultItem) => {
    const isLost = activeTab === 'lost';
    const date = isLost ? document.dateLost : document.dateFound;
    const location = isLost ? document.locationLost : document.locationFound;

    return (
      <Card key={document.id} className="overflow-hidden flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileTextIcon className="w-5 h-5" />
              {document.documentType}
            </span>
            <Badge variant={document.status === 'matched' ? 'success' : 'secondary'}>{document.status}</Badge>
          </CardTitle>
          {document.nameOnDocument && isLost && (
             <CardDescription>Name: {document.nameOnDocument}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-grow space-y-2">
          {document.description && <p className="text-sm text-muted-foreground">{document.description}</p>}
          {date && (
            <div className="flex items-center text-sm text-muted-foreground gap-1">
              <CalendarIcon className="w-4 h-4" />
              <span>{isLost ? 'Lost' : 'Found'} {formatDistanceToNow(new Date(date), { addSuffix: true })}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center text-sm text-muted-foreground gap-1">
              <MapPinIcon className="w-4 h-4" />
              <span>{location}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/50 px-6 py-3">
          {/* Add view details button or other actions */}
          <Button variant="outline" size="sm">View Details</Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-6">Search Documents</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="found">Found Documents</TabsTrigger>
          <TabsTrigger value="lost">Lost Documents</TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleSearch}>
        <Card className="mb-6">
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by keyword, name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md:col-span-2"
            />
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {/* Use values from shared schema or define them */}
                <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                <SelectItem value="pan">PAN Card</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="driving_license">Driving License</SelectItem>
                <SelectItem value="voter_id">Voter ID</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {/* Add more locations as needed */}
                <SelectItem value="all">All locations</SelectItem>
                <SelectItem value="delhi">Delhi</SelectItem>
                <SelectItem value="mumbai">Mumbai</SelectItem>
                <SelectItem value="bangalore">Bangalore</SelectItem>
                <SelectItem value="chennai">Chennai</SelectItem>
                <SelectItem value="hyderabad">Hyderabad</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <SearchIcon className="mr-2 h-4 w-4" />}
              Search
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center p-10">
          <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="border-destructive bg-destructive/10">
           <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                 <AlertCircleIcon className="w-5 h-5"/> Error
              </CardTitle>
           </CardHeader>
           <CardContent>
              <p>Could not fetch search results: {error.message}</p>
              <Button variant="destructive" size="sm" onClick={() => refetch()} className="mt-4">Try Again</Button>
           </CardContent>
        </Card>
      )}

      {/* Success State - No Results */}
      {!isLoading && !isError && data?.results.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No documents found matching your criteria.
          </CardContent>
        </Card>
      )}

      {/* Success State - With Results */}
      {!isLoading && !isError && data && data.results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.results.map(renderDocumentCard)}
        </div>
      )}

    </DashboardLayout>
  );
};

export default SearchDocuments;
