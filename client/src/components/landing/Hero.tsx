import { Button } from "@/components/ui/button";
import { ArrowRightIcon, SearchIcon, FileTextIcon, CheckCircleIcon } from "lucide-react";
import MyImage from "@/assets/img.png"
interface HeroProps {
  onGetStarted: () => void;
}

const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <div className="relative bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <div className="flex items-center mb-4 sm:justify-center lg:justify-start">
                <span className="bg-blue-100 p-2 rounded-full">
                  <FileTextIcon className="h-6 w-6 text-primary" />
                </span>
                <h2 className="ml-2 text-sm sm:text-base text-primary font-semibold tracking-wide uppercase">
                  AI-Powered Recovery
                </h2>
              </div>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl font-heading">
                <span className="block xl:inline">Lost Document</span>{' '}
                <span className="block text-primary xl:inline">Recovery Portal</span>
              </h1>
              <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Lost an important document? Found someone else's? Our AI-powered system helps reunite people with their lost documents quickly and efficiently.
              </p>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-center lg:justify-start">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span>Advanced AI Document Analysis</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span>Secure & Confidential</span>
                </div>
              </div>
              
              <div className="mt-6 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div>
                  <Button 
                    size="lg" 
                    className="shadow-sm w-full sm:w-auto"
                    onClick={onGetStarted}
                  >
                    Get Started
                  </Button>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-blue-50 text-primary hover:bg-blue-100 w-full sm:w-auto"
                  >
                    Learn More
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <div className="h-56 w-full sm:h-72 md:h-96 lg:w-full lg:h-full bg-gradient-to-br from-blue-100 to-primary/10 relative overflow-hidden">
          <img
            className="h-full w-full object-cover"
            src={MyImage}
            alt="ID card and passport documents with magnifying glass"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/20"></div>
          <div className="absolute bottom-8 right-8 bg-white p-3 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <SearchIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">AI-Powered</p>
                <p className="text-xs text-gray-600">Document Matching</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
