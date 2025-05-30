import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { documentTypes } from '@shared/schema';

// Common schema for both lost and found documents
const baseSchema = {
  documentType: z.enum(documentTypes as unknown as [string, ...string[]]),
  description: z.string().optional(),
};

// Lost document specific fields
const lostDocumentSchema = z.object({
  ...baseSchema,
  nameOnDocument: z.string().min(1, "Name is required"),
  dateLost: z.string().min(1, "Date is required"),
  locationLost: z.string().min(1, "Location is required"),
});

// Found document specific fields
const foundDocumentSchema = z.object({
  ...baseSchema,
  dateFound: z.string().min(1, "Date is required"),
  locationFound: z.string().min(1, "Location is required"),
  terms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms",
  }),
});

type LostDocumentFormValues = z.infer<typeof lostDocumentSchema>;
type FoundDocumentFormValues = z.infer<typeof foundDocumentSchema>;

interface DocumentFormProps {
  type: 'lost' | 'found';
  onSubmit: (data: any, imageFile?: File | null) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

const DocumentForm = ({ 
  type, 
  onSubmit, 
  isSubmitting, 
  onCancel 
}: DocumentFormProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const isLostForm = type === 'lost';
  
  const form = useForm<LostDocumentFormValues | FoundDocumentFormValues>({
    resolver: zodResolver(isLostForm ? lostDocumentSchema : foundDocumentSchema),
    defaultValues: isLostForm 
      ? {
          documentType: "aadhaar",
          nameOnDocument: "",
          dateLost: new Date().toISOString().split('T')[0],
          locationLost: "",
          description: "",
        }
      : {
          documentType: "aadhaar",
          dateFound: new Date().toISOString().split('T')[0],
          locationFound: "",
          description: "",
          terms: false,
        }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setImagePreview(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (data: LostDocumentFormValues | FoundDocumentFormValues) => {
    onSubmit(data, imageFile);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

        {/* Lost document specific fields */}
        {isLostForm && (
          <>
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
          </>
        )}

        {/* Found document specific fields */}
        {!isLostForm && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="dateFound"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Found</FormLabel>
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
              name="locationFound"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Found</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Where did you find it?" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={isLostForm 
                    ? "Provide any additional details about the document that might help identify it" 
                    : "Describe the document without revealing sensitive information"
                  } 
                  rows={4} 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {isLostForm 
                  ? "Our AI will analyze this description to better match your document."
                  : "Our AI will analyze this description for better matching."
                }
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Document Image {isLostForm ? '(Optional)' : '(Recommended)'}</FormLabel>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <div>
                  <img src={imagePreview} alt="Document preview" className="max-h-40 mx-auto" />
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2"
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
                  <div className="flex justify-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80">
                      <span>Upload an image</span>
                      <Input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </>
              )}
            </div>
          </div>
          <FormDescription>
            {isLostForm 
              ? "Our AI vision system will analyze the image to extract details"
              : "Our AI will automatically detect document type and extract details while preserving privacy"
            }
          </FormDescription>
        </div>

        {/* Terms checkbox for Found documents */}
        {!isLostForm && (
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I confirm that I'm reporting this found document in good faith and will cooperate with the portal's process to return it to its rightful owner.
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : isLostForm ? 'Report Lost Document' : 'Report Found Document'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DocumentForm;
