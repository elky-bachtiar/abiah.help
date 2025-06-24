import { supabase } from '../lib/supabase';
import { Document, DocumentProgress, GeneratedDocument, DocumentGenerationRequest } from '../types/Documents';

/**
 * Fetch all documents for a user
 * @param userId User ID
 * @returns Promise with array of documents
 */
export const getUserDocuments = async (userId: string): Promise<Document[]> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data as Document[];
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
};

/**
 * Fetch a single document by ID
 * @param documentId Document ID
 * @returns Promise with document data
 */
export const getDocumentById = async (documentId: string): Promise<Document> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (error) throw error;
    return data as Document;
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
};

/**
 * Create a new document
 * @param document Document data
 * @returns Promise with created document
 */
export const createDocument = async (document: Partial<Document>): Promise<Document> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .insert([document])
      .select()
      .single();
    
    if (error) throw error;
    return data as Document;
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
};

/**
 * Update an existing document
 * @param documentId Document ID
 * @param updates Document updates
 * @returns Promise with updated document
 */
export const updateDocument = async (documentId: string, updates: Partial<Document>): Promise<Document> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', documentId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Document;
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

/**
 * Update document progress
 * @param documentId Document ID
 * @param progress Progress data
 * @returns Promise with updated document
 */
export const updateDocumentProgress = async (documentId: string, progress: DocumentProgress): Promise<Document> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .update({
        progress_data: progress,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Document;
  } catch (error) {
    console.error('Error updating document progress:', error);
    throw error;
  }
};

/**
 * Delete a document
 * @param documentId Document ID
 * @returns Promise with success status
 */
export const deleteDocument = async (documentId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

/**
 * Generate a PDF from a document
 * @param document Document to convert
 * @returns Promise with PDF blob
 */
export const generatePDF = async (document: Document): Promise<Blob> => {
  try {
    // This would typically call a backend service to generate the PDF
    // For now, we'll simulate the response
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock PDF blob
    return new Blob(['PDF content would go here'], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Share a document with another user
 * @param documentId Document ID
 * @param email Email to share with
 * @param permissions Permission settings
 * @returns Promise with share details
 */
export const shareDocument = async (
  documentId: string, 
  email: string, 
  permissions: { canEdit: boolean, canDownload: boolean }
): Promise<any> => {
  try {
    // This would create a share record in the database
    // For now, we'll simulate the response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: `share-${Date.now()}`,
      document_id: documentId,
      shared_with: email,
      permissions,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error sharing document:', error);
    throw error;
  }
};

/**
 * Request document generation
 * @param consultationId Consultation ID
 * @param documentType Document type to generate
 * @param parameters Generation parameters
 * @returns Promise with request data
 */
export const requestDocumentGeneration = async (
  consultationId: string,
  documentType: string,
  parameters: any
): Promise<DocumentGenerationRequest> => {
  try {
    // Call the tavus-api-llm function to execute the appropriate tool
    const toolName = documentTypeToToolName(documentType);
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tavus-api-llm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({
        endpoint: '/tools/execute',
        method: 'POST',
        payload: {
          toolName,
          parameters,
          consultationId
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to request document generation');
    }
    
    const { data } = await response.json();
    
    // Fetch the document generation request
    const { data: request, error: requestError } = await supabase
      .from('document_generation_requests')
      .select('*')
      .eq('consultation_id', consultationId)
      .eq('requested_document_type', documentType)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (requestError) {
      throw requestError;
    }
    
    return request as DocumentGenerationRequest;
  } catch (error) {
    console.error('Error requesting document generation:', error);
    throw error;
  }
};

/**
 * Get document generation status
 * @param requestId Document generation request ID
 * @returns Promise with request data
 */
export const getDocumentGenerationStatus = async (requestId: string): Promise<DocumentGenerationRequest> => {
  try {
    const { data, error } = await supabase
      .from('document_generation_requests')
      .select('*')
      .eq('id', requestId)
      .single();
    
    if (error) throw error;
    return data as DocumentGenerationRequest;
  } catch (error) {
    console.error('Error getting document generation status:', error);
    throw error;
  }
};

/**
 * Get generated documents for a consultation
 * @param consultationId Consultation ID
 * @returns Promise with array of generated documents
 */
export const getGeneratedDocuments = async (consultationId: string): Promise<GeneratedDocument[]> => {
  try {
    const { data, error } = await supabase
      .from('generated_documents')
      .select('*')
      .eq('consultation_id', consultationId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as GeneratedDocument[];
  } catch (error) {
    console.error('Error fetching generated documents:', error);
    throw error;
  }
};

/**
 * Get a generated document by ID
 * @param documentId Document ID
 * @returns Promise with document data
 */
export const getGeneratedDocumentById = async (documentId: string): Promise<GeneratedDocument> => {
  try {
    const { data, error } = await supabase
      .from('generated_documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (error) throw error;
    return data as GeneratedDocument;
  } catch (error) {
    console.error('Error fetching generated document:', error);
    throw error;
  }
};

/**
 * Regenerate a document with new parameters
 * @param documentId Original document ID
 * @param newParameters New generation parameters
 * @returns Promise with new document generation request
 */
export const regenerateDocument = async (
  documentId: string,
  newParameters?: any
): Promise<DocumentGenerationRequest> => {
  try {
    // Get the original document
    const { data: document, error: documentError } = await supabase
      .from('generated_documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (documentError) throw documentError;
    
    // Get the original parameters
    const originalParameters = document.metadata.generation_parameters || {};
    const parameters = newParameters || originalParameters;
    
    // Request regeneration
    return await requestDocumentGeneration(
      document.consultation_id,
      document.document_type,
      parameters
    );
  } catch (error) {
    console.error('Error regenerating document:', error);
    throw error;
  }
};

/**
 * Convert document type to tool name
 * @param documentType Document type
 * @returns Tool name
 */
function documentTypeToToolName(documentType: string): string {
  const toolMap: Record<string, string> = {
    'pitch_deck': 'generate_pitch_deck',
    'business_plan': 'create_business_plan',
    'market_analysis': 'analyze_market_research',
    'consultation_summary': 'generate_consultation_summary'
  };
  
  return toolMap[documentType] || toolMap.pitch_deck;
}