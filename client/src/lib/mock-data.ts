import { LostDocument, FoundDocument } from '@shared/schema';

/**
 * Mock data for the dashboard
 * In a real implementation, this would be fetched from the API
 */
export interface DashboardActivity {
  icon: string;
  title: string;
  time: string;
  status: string;
  description?: string;
  location?: string;
  actionLabel?: string;
}

export interface DashboardData {
  potentialMatches: number;
  activities: DashboardActivity[];
  stats: {
    documentsLost: number;
    documentsFound: number;
    successfulMatches: number;
    pendingMatches: number;
  };
  notifications?: {
    id: number;
    message: string;
    time: string;
  }[];
}

export const fetchUserDashboardData = async (): Promise<DashboardData> => {
  // Simulate API request
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    potentialMatches: 2,
    activities: [
      {
        icon: 'file-upload',
        title: 'You reported PAN Card as lost',
        time: '2 hours ago',
        status: 'pending',
        description: 'Your report has been registered. We will notify you if we find a match.',
        location: 'Delhi Metro Station',
        actionLabel: 'View Report'
      },
      {
        icon: 'check',
        title: 'Match found for your Aadhaar Card',
        time: 'Yesterday at 4:30 PM',
        status: 'matched',
        description: 'We found a potential match for your lost Aadhaar Card with 85% confidence.',
        actionLabel: 'View Match'
      },
      {
        icon: 'hand-holding',
        title: 'You reported finding a Voter ID Card',
        time: '3 days ago',
        status: 'reported',
        location: 'Central Park',
        description: 'Your report has been registered. The owner will be notified.',
        actionLabel: 'See Details'
      },
      {
        icon: 'alert',
        title: 'Verification requested for your Passport match',
        time: '4 days ago',
        status: 'pending',
        description: 'Someone claims to be the owner of the document you found. Please verify.',
        actionLabel: 'Verify Now'
      }
    ],
    stats: {
      documentsLost: 3,
      documentsFound: 1,
      successfulMatches: 2,
      pendingMatches: 1,
    },
    notifications: [
      {
        id: 1,
        message: 'We found a potential match for your lost Aadhaar Card',
        time: '2 hours ago'
      },
      {
        id: 2,
        message: 'Someone has reported finding a document that may be yours',
        time: 'Yesterday'
      },
      {
        id: 3,
        message: 'Your report has been submitted successfully',
        time: '3 days ago'
      },
      {
        id: 4,
        message: 'Important: Please verify your email address',
        time: '1 week ago'
      }
    ]
  };
};

/**
 * Mock data for search results
 * In a real implementation, this would be fetched from the API with proper filters
 */
export const fetchSearchResults = async (
  type: string,
  query: string,
  documentType: string,
  location: string
) => {
  // Simulate API request
  await new Promise(resolve => setTimeout(resolve, 700));

  // Base set of documents
  let baseDocuments;

  if (type === 'found') {
    baseDocuments = [
      {
        id: 1,
        documentType: 'aadhaar',
        dateFound: '2023-05-15T10:30:00Z',
        locationFound: 'Delhi',
        description: 'Found an Aadhaar card near the metro station. The card appears to be in good condition.',
        hasImage: true,
        status: 'pending',
      },
      {
        id: 2,
        documentType: 'pan',
        dateFound: '2023-05-10T14:45:00Z',
        locationFound: 'Mumbai',
        description: 'Found a PAN card at the shopping mall. It was left at the food court.',
        hasImage: false,
        status: 'matched',
      },
      {
        id: 3,
        documentType: 'passport',
        dateFound: '2023-05-18T09:15:00Z',
        locationFound: 'Bangalore',
        description: 'Found a passport at the airport. It was left at the check-in counter.',
        hasImage: true,
        status: 'pending',
      },
      {
        id: 4,
        documentType: 'driving_license',
        dateFound: '2023-05-20T16:30:00Z',
        locationFound: 'Chennai',
        description: 'Found a driving license near the beach. It was in the sand.',
        hasImage: false,
        status: 'pending',
      },
    ] as FoundDocument[];
  } else {
    baseDocuments = [
      {
        id: 1,
        documentType: 'aadhaar',
        nameOnDocument: 'Rahul Sharma',
        dateLost: '2023-05-14T08:30:00Z',
        locationLost: 'Delhi',
        description: 'Lost my Aadhaar card while commuting on the metro. It was in a blue wallet.',
        hasImage: true,
        status: 'matched',
      },
      {
        id: 2,
        documentType: 'pan',
        nameOnDocument: 'Priya Patel',
        dateLost: '2023-05-09T13:20:00Z',
        locationLost: 'Mumbai',
        description: 'Lost my PAN card at the shopping mall. It was in a black purse.',
        hasImage: false,
        status: 'pending',
      },
      {
        id: 3,
        documentType: 'passport',
        nameOnDocument: 'Vikram Singh',
        dateLost: '2023-05-17T11:45:00Z',
        locationLost: 'Bangalore',
        description: 'Lost my passport at the airport. It was in a travel pouch.',
        hasImage: true,
        status: 'pending',
      },
      {
        id: 4,
        documentType: 'driving_license',
        nameOnDocument: 'Anjali Kumar',
        dateLost: '2023-05-19T15:10:00Z',
        locationLost: 'Chennai',
        description: 'Lost my driving license at the beach. It was in a waterproof case.',
        hasImage: false,
        status: 'pending',
      },
    ] as LostDocument[];
  }

  // Apply filters
  let results = [...baseDocuments];

  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(doc => {
      const description = doc.description?.toLowerCase() || '';
      const name = 'nameOnDocument' in doc ? doc.nameOnDocument.toLowerCase() : '';
      return description.includes(lowerQuery) || name.includes(lowerQuery);
    });
  }

  if (documentType) {
    results = results.filter(doc => doc.documentType === documentType);
  }

  if (location) {
    const locationField = type === 'found' ? 'locationFound' : 'locationLost';
    results = results.filter(doc => {
      const docLocation = (doc as any)[locationField].toLowerCase();
      return docLocation.includes(location.toLowerCase());
    });
  }

  return { results };
};

/**
 * Mock data for notifications
 * In a real implementation, this would be fetched from the API
 */
export const fetchUserNotifications = async () => {
  // Simulate API request
  await new Promise(resolve => setTimeout(resolve, 300));

  return [
    {
      id: 1,
      message: 'We found a potential match for your lost Aadhaar Card',
      read: false,
      type: 'match',
      relatedId: 1,
      createdAt: '2023-05-20T10:30:00Z',
    },
    {
      id: 2,
      message: 'Someone has reported finding a document that may be yours',
      read: false,
      type: 'found',
      relatedId: 2,
      createdAt: '2023-05-19T14:45:00Z',
    },
    {
      id: 3,
      message: 'Your report has been submitted successfully',
      read: true,
      type: 'confirmation',
      relatedId: 3,
      createdAt: '2023-05-18T09:15:00Z',
    },
  ];
};
