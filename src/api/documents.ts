import { supabase } from '../lib/supabase';
import { Document, DocumentProgress } from '../types/Documents';

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