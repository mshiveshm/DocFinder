import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckIcon, 
  FileTextIcon, 
  HandIcon, 
  ClockIcon, 
  AlertCircleIcon, 
  MapPinIcon, 
  CalendarIcon, 
  ArrowRightIcon
} from 'lucide-react';

interface ActivityItemProps {
  icon: string;
  title: string;
  time: string;
  status: string;
  description?: string;
  location?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const ActivityItem = ({ 
  icon, 
  title, 
  time, 
  status='unknown', 
  description, 
  location,
  actionLabel,
  onAction
}: ActivityItemProps) => {
  // Define status styles
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'matched':
        return 'bg-green-100 text-green-800';
      case 'reported':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get icon component
  const getIcon = () => {
    switch (icon) {
      case 'file-upload':
        return (
          <div className="bg-blue-100 rounded-full p-2">
            <FileTextIcon className="h-5 w-5 text-blue-600" />
          </div>
        );
      case 'check':
        return (
          <div className="bg-green-100 rounded-full p-2">
            <CheckIcon className="h-5 w-5 text-green-600" />
          </div>
        );
      case 'hand-holding':
        return (
          <div className="bg-orange-100 rounded-full p-2">
            <HandIcon className="h-5 w-5 text-orange-600" />
          </div>
        );
      case 'alert':
        return (
          <div className="bg-red-100 rounded-full p-2">
            <AlertCircleIcon className="h-5 w-5 text-red-600" />
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 rounded-full p-2">
            <ClockIcon className="h-5 w-5 text-gray-600" />
          </div>
        );
    }
  };

  return (
    <li className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start">
        {getIcon()}
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <Badge className={getStatusStyles()}>
              {status}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">{time}</p>
          
          {description && (
            <p className="text-sm text-gray-600 mt-2">{description}</p>
          )}
          
          {location && (
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <MapPinIcon className="h-3.5 w-3.5 mr-1" />
              <span>{location}</span>
              
              {/* Time information can be displayed next to location */}
              <span className="mx-2">•</span>
              <CalendarIcon className="h-3.5 w-3.5 mr-1" />
              <span>{time.split(' ')[0]}</span> {/* Just date part */}
            </div>
          )}
          
          {actionLabel && onAction && (
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-primary hover:text-primary/80 hover:bg-primary/10 -ml-2" 
                onClick={onAction}
              >
                {actionLabel}
                <ArrowRightIcon className="ml-1 h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

export default ActivityItem;
