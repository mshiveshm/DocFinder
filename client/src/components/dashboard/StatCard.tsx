import { Card } from '@/components/ui/card';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  FileTextIcon, 
  FileUpIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  PieChartIcon, 
  PercentIcon, 
  HandIcon 
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | undefined;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  percentChange?: number;
  subtext?: string;
}

const StatCard = ({ 
  title, 
  value, 
  icon, 
  iconBgColor,
  iconColor,
  percentChange,
  subtext
}: StatCardProps) => {
  // Function to get the appropriate icon
  const getIcon = () => {
    switch(icon) {
      case 'file-export':
        return <FileUpIcon className={`h-5 w-5 ${iconColor}`} />;
      case 'file-import':
        return <HandIcon className={`h-5 w-5 ${iconColor}`} />;
      case 'check-circle':
        return <CheckCircleIcon className={`h-5 w-5 ${iconColor}`} />;
      case 'clock':
        return <ClockIcon className={`h-5 w-5 ${iconColor}`} />;
      case 'pie-chart':
        return <PieChartIcon className={`h-5 w-5 ${iconColor}`} />;
      case 'percent':
        return <PercentIcon className={`h-5 w-5 ${iconColor}`} />;
      default:
        return <FileTextIcon className={`h-5 w-5 ${iconColor}`} />;
    }
  };

  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          
          {percentChange !== undefined && (
            <div className={`flex items-center mt-1 text-xs ${percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {percentChange >= 0 ? (
                <ArrowUpIcon className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownIcon className="h-3 w-3 mr-1" />
              )}
              <span>{Math.abs(percentChange)}% from last month</span>
            </div>
          )}
          
          {subtext && (
            <p className="text-xs text-gray-500 mt-1">{subtext}</p>
          )}
        </div>
        <div className={`${iconBgColor} rounded-full h-12 w-12 flex items-center justify-center`}>
          {getIcon()}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
