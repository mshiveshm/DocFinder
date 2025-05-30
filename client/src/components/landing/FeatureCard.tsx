import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard = ({ title, description, icon }: FeatureCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
            <div className="text-primary">{icon}</div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900 font-heading">{title}</h3>
          </div>
        </div>
        <div className="mt-4 text-gray-500">
          {description}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
