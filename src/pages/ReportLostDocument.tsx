import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { documentTypes } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { analyzeDocumentText, analyzeDocumentImage } from '@/lib/gemini';
import { CloudUploadIcon, Loader2Icon } from 'lucide-react';
import { useAuth } from '@/lib/auth';

// Form schema
const formSchema = z.object({
  documentType: z.enum(documentTypes as unknown as [string, ...string[]]),
  nameOnDocument: z.string().min(1, "Name is required"),
  dateLost: z.string().min(1, "Date is required"),
  locationLost: z.string().min(1, "Location is required"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const ReportLostDocument = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentType: "aadhaar",
      nameOnDocument: "",
      dateLost: new Date().toISOString().split('T')[0],
      locationLost: "",
      description: "",
    }
  });

  const reportMutation = useMutation({
    mutationFn: async (data: FormData & { imageBase64?: string }) => {
      return apiRequest('POST', '/api/documents/lost', {
        ...data,
        userId: user?.id,
        hasImage: !!imageFile,
        aiAnalysis: aiSuggestions,
      });
    },
    onSuccess: () => {
      toast({
        title: "Document reported successfully",
        description: "We'll notify you if we find a match.",
      });
      navigate('/dashboard');
    },
    onError: (error) => {
      toast({
        title: "Failed to report document",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setImagePreview(e.target.result);
      }
    };
    reader.readAsDataURL(file);
    setImageFile(file);

    // Analyze image with Gemini Vision API
    try {
      setIsAnalyzing(true);
      const base64Image = await fileToBase64(file);
      const analysis = await analyzeDocumentImage(base64Image);
      
      if (analysis) {
        setAiSuggestions(analysis);
        
        // Auto-fill form fields from AI analysis
        if (analysis.documentType) {
          form.setValue('documentType', analysis.documentType);
        }
        if (analysis.nameOnDocument) {
          form.setValue('nameOnDocument', analysis.nameOnDocument);
        }
        // Add more auto-fill logic for other fields as needed
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast({
        title: "Image Analysis Failed",
        description: "We couldn't analyze your document image. You can continue manually.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeDescription = async () => {
    const description = form.getValues('description');
    if (!description || description.length < 10) {
      toast({
        title: "Description too short",
        description: "Please provide a more detailed description for analysis.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      const analysis = await analyzeDocumentText(description);
      
      if (analysis) {
        setAiSuggestions(prev => ({ ...prev, ...analysis }));
        
        // Auto-fill form fields from AI analysis
        if (analysis.documentType && !form.getValues('documentType')) {
          form.setValue('documentType', analysis.documentType);
        }
        if (analysis.nameOnDocument && !form.getValues('nameOnDocument')) {
          form.setValue('nameOnDocument', analysis.nameOnDocument);
        }
        // Add more auto-fill logic as needed
      }
    } catch (error) {
      console.error("Error analyzing description:", error);
      toast({
        title: "Text Analysis Failed",
        description: "We couldn't analyze your description. You can continue manually.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    let imageBase64 = null;
    if (imageFile) {
      imageBase64 = await fileToBase64(imageFile);
    }
    reportMutation.mutate({ ...data, imageBase64 });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data:image/jpeg;base64, prefix
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  return (
    <DashboardLayout>
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Report a Lost Document</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                          <SelectItem value="pan">PAN Card</SelectItem>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="driving_license">Driving License</SelectItem>
                          <SelectItem value="voter_id">Voter ID</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nameOnDocument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name on Document</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Full name as it appears on the document" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dateLost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Lost</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="locationLost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Lost</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Where did you lose it?" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Textarea 
                          placeholder="Provide any additional details about the document that might help identify it" 
                          rows={4} 
                          {...field} 
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={analyzeDescription}
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : 'Analyze Description with AI'}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Our AI will analyze this description to better match your document.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Document Image (Optional)</FormLabel>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <div className="flex flex-col items-center">
                        <img 
                          src={imagePreview} 
                          alt="Document preview" 
                          className="max-h-40 max-w-full mb-4 rounded" 
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <>
                        <CloudUploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80"
                          >
                            <span>Upload an image</span>
                            <Input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleFileChange}
                              disabled={isAnalyzing}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                        {isAnalyzing && (
                          <div className="mt-2 flex items-center justify-center text-sm text-primary">
                            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing image with AI...
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <FormDescription>
                  Our AI vision system will analyze the image to extract details
                </FormDescription>
              </div>

              {aiSuggestions && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="font-medium text-blue-800 mb-2">AI Analysis Results</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {aiSuggestions.documentType && (
                      <li>Document Type: {aiSuggestions.documentType}</li>
                    )}
                    {aiSuggestions.nameOnDocument && (
                      <li>Name: {aiSuggestions.nameOnDocument}</li>
                    )}
                    {aiSuggestions.otherDetails && (
                      <li>Other Details: {aiSuggestions.otherDetails}</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={reportMutation.isPending || isAnalyzing}
                >
                  {reportMutation.isPending ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : 'Report Lost Document'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ReportLostDocument;
