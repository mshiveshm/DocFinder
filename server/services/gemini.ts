import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Google Generative AI with API key
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Missing Gemini API key. Please set the GEMINI_API_KEY environment variable.');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Safety settings to prevent harmful content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Document analysis type definitions
export interface DocumentAnalysisResult {
  documentType?: string;
  nameOnDocument?: string;
  otherDetails?: Record<string, any>;
}

/**
 * Analyzes document text using Gemini AI
 * Extracts information like document type, name on document, etc.
 */
export async function analyzeDocumentText(text: string): Promise<DocumentAnalysisResult> {
  try {
    // Get the text-only model
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    
    const prompt = `
      Analyze the following document text and extract these details:
      1. Document type (ID card, passport, driver's license, etc.)
      2. Name on document (if present)
      3. Any other relevant details (issue date, expiry date, ID number, etc.)
      
      Format the response as JSON with keys: documentType, nameOnDocument, and otherDetails.
      
      Document text: "${text}"
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Extract JSON from the response
    try {
      // The AI might wrap the JSON in markdown code blocks, so we need to extract it
      const jsonMatch = responseText.match(/```(?:json)?\s*({[\s\S]*?})\s*```/) || 
                        responseText.match(/{[\s\S]*?}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // If we can't parse the JSON, log the response and return a basic object
      console.log("Could not parse JSON from AI response:", responseText);
      return {
        documentType: "unknown",
        nameOnDocument: undefined,
        otherDetails: { rawResponse: responseText }
      };
    } catch (error: any) {
      console.error("Error parsing AI response:", error);
      return {
        documentType: "unknown",
        nameOnDocument: undefined,
        otherDetails: { error: "Failed to parse AI response", rawResponse: responseText }
      };
    }
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    throw new Error(`Failed to analyze document text: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Analyzes document image using Gemini Vision
 * Extracts information like document type, name on document, etc.
 */
export async function analyzeDocumentImage(base64Image: string): Promise<DocumentAnalysisResult> {
  try {
    // Remove the data URL prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    // Get the multimodal model that supports images
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro-vision" });
    
    // Prepare the image data
    const imageData = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg" // assuming JPEG; adjust if needed
      }
    };
    
    const prompt = `
      Analyze this document image and extract these details:
      1. Document type (ID card, passport, driver's license, etc.)
      2. Name on document (if present)
      3. Any other relevant details (issue date, expiry date, ID number, etc.)
      
      Format the response as JSON with keys: documentType, nameOnDocument, and otherDetails.
    `;
    
    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const responseText = response.text();
    
    // Extract JSON from the response
    try {
      // The AI might wrap the JSON in markdown code blocks, so we need to extract it
      const jsonMatch = responseText.match(/```(?:json)?\s*({[\s\S]*?})\s*```/) || 
                        responseText.match(/{[\s\S]*?}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // If we can't parse the JSON, log the response and return a basic object
      console.log("Could not parse JSON from AI response for image:", responseText);
      return {
        documentType: "unknown",
        nameOnDocument: undefined,
        otherDetails: { rawResponse: responseText }
      };
    } catch (error: any) {
      console.error("Error parsing AI response for image:", error);
      return {
        documentType: "unknown",
        nameOnDocument: undefined,
        otherDetails: { error: "Failed to parse AI response", rawResponse: responseText }
      };
    }
  } catch (error: any) {
    console.error("Error calling Gemini Vision API:", error);
    throw new Error(`Failed to analyze document image: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Matches lost documents with found documents using AI
 * Returns sorted array of potential matches with confidence scores
 */
export async function matchDocuments(lostDoc: any, foundDocs: any[]): Promise<any[]> {
  try {
    if (!foundDocs.length) {
      return [];
    }
    
    // Get the text-only model
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    
    // Prepare the lost document info
    const lostDocInfo = `
      Document Type: ${lostDoc.documentType}
      Name on Document: ${lostDoc.nameOnDocument || "N/A"}
      Date Lost: ${lostDoc.dateLost ? new Date(lostDoc.dateLost).toLocaleDateString() : "N/A"}
      Location Lost: ${lostDoc.locationLost || "N/A"}
      Description: ${lostDoc.description || "N/A"}
    `;
    
    // Prepare the found documents info
    const foundDocsInfo = foundDocs.map((doc, index) => `
      Document ${index + 1}:
      Document Type: ${doc.documentType}
      Date Found: ${doc.dateFound ? new Date(doc.dateFound).toLocaleDateString() : "N/A"}
      Location Found: ${doc.locationFound || "N/A"}
      Description: ${doc.description || "N/A"}
    `).join("\n\n");
    
    const prompt = `
      You are an advanced lost and found document matching system.
      
      LOST DOCUMENT DETAILS:
      ${lostDocInfo}
      
      FOUND DOCUMENTS TO COMPARE:
      ${foundDocsInfo}
      
      For each found document, analyze how likely it is to be the same document that was lost.
      Consider factors like document type, location, timing, and descriptions.
      
      Return a JSON array of objects with:
      1. "id": the index of the found document (0-based)
      2. "confidence": a score from 0-100 on how likely this is a match
      3. "reasoning": brief explanation of why
      
      Sort the results by confidence score from highest to lowest.
      Only include documents with a confidence score above 30.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Extract JSON from the response
    try {
      // The AI might wrap the JSON in markdown code blocks, so we need to extract it
      const jsonMatch = responseText.match(/```(?:json)?\s*([\[\{][\s\S]*?[\]\}])\s*```/) || 
                        responseText.match(/\[[\s\S]*?\]/);
      
      if (jsonMatch) {
        const matches = JSON.parse(jsonMatch[1]);
        
        // Map the index back to the actual document ID
        return matches.map((match: any) => ({
          ...match,
          foundDocumentId: foundDocs[match.id]?.id || match.id,
        })).filter((match: any) => match.confidence > 30);
      }
      
      console.log("Could not parse JSON from AI match response:", responseText);
      return [];
    } catch (error: any) {
      console.error("Error parsing AI match response:", error);
      return [];
    }
  } catch (error: any) {
    console.error("Error calling Gemini API for document matching:", error);
    return [];
  }
}