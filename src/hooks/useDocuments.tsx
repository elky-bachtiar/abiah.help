import { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { Document, DocumentProgress } from '../types/Documents';
import { 
  getUserDocuments, 
  getDocumentById, 
  createDocument, 
  updateDocument,
  updateDocumentProgress,
  deleteDocument,
  generatePDF,
  shareDocument
} from '../api/documents';

export function useDocuments() {
  const [user] = useAtom(userAtom);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all documents for the current user
  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const docs = await getUserDocuments(user.id);
      setDocuments(docs);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch a single document by ID
  const fetchDocument = useCallback(async (documentId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const doc = await getDocumentById(documentId);
      return doc;
    } catch (err) {
      console.error('Error fetching document:', err);
      setError('Failed to load document. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new document
  const addDocument = useCallback(async (document: Partial<Document>) => {
    if (!user) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      const newDoc = await createDocument({
        ...document,
        user_id: user.id
      });
      setDocuments(prev => [newDoc, ...prev]);
      return newDoc;
    } catch (err) {
      console.error('Error creating document:', err);
      setError('Failed to create document. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Update an existing document
  const updateDocumentById = useCallback(async (documentId: string, updates: Partial<Document>) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedDoc = await updateDocument(documentId, updates);
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId ? updatedDoc : doc
      ));
      return updatedDoc;
    } catch (err) {
      console.error('Error updating document:', err);
      setError('Failed to update document. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update document progress
  const updateProgress = useCallback(async (documentId: string, progress: DocumentProgress) => {
    try {
      setError(null);
      const updatedDoc = await updateDocumentProgress(documentId, progress);
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId ? updatedDoc : doc
      ));
      return updatedDoc;
    } catch (err) {
      console.error('Error updating document progress:', err);
      setError('Failed to update progress. Please try again.');
      return null;
    }
  }, []);

  // Delete a document
  const removeDocument = useCallback(async (documentId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      return true;
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate PDF from document
  const downloadPDF = useCallback(async (document: Document) => {
    try {
      setIsLoading(true);
      setError(null);
      const pdfBlob = await generatePDF(document);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Share document with another user
  const shareDocumentWithUser = useCallback(async (
    documentId: string, 
    email: string, 
    permissions: { canEdit: boolean, canDownload: boolean }
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await shareDocument(documentId, email, permissions);
      return result;
    } catch (err) {
      console.error('Error sharing document:', err);
      setError('Failed to share document. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load documents on mount
  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user, fetchDocuments]);

  return {
    documents,
    isLoading,
    error,
    fetchDocuments,
    fetchDocument,
    addDocument,
    updateDocument: updateDocumentById,
    updateProgress,
    removeDocument,
    downloadPDF,
    shareDocumentWithUser,
  };
}