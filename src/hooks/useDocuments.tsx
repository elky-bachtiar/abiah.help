import { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { Document, DocumentProgress, GeneratedDocument, DocumentGenerationRequest } from '../types/Documents';
import { 
  getUserDocuments, 
  getDocumentById, 
  createDocument, 
  updateDocument,
  updateDocumentProgress,
  deleteDocument,
  generatePDF,
  shareDocument,
  requestDocumentGeneration,
  getDocumentGenerationStatus,
  getGeneratedDocuments,
  getGeneratedDocumentById,
  regenerateDocument
} from '../api/documents';
import { supabase } from '../lib/supabase';

export function useDocuments() {
  const [user] = useAtom(userAtom);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
  const [activeGenerations, setActiveGenerations] = useState<DocumentGenerationRequest[]>([]);
  const [conversationTranscript, setConversationTranscript] = useState<any[] | null>(null);

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

  // Fetch generated documents for a consultation
  const fetchGeneratedDocuments = useCallback(async (consultationId: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const docs = await getGeneratedDocuments(consultationId);
      setGeneratedDocuments(docs);
      return docs;
    } catch (err) {
      console.error('Error fetching generated documents:', err);
      setError('Failed to load generated documents. Please try again.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Request document generation
  const requestGeneration = useCallback(async (
    consultationId: string,
    documentType: string,
    parameters: any
  ): Promise<DocumentGenerationRequest | null> => {
    try {
      setGenerationStatus('generating');
      setError(null);
      
      const request = await requestDocumentGeneration(
        consultationId,
        documentType,
        parameters
      );
      
      // Add to active generations
      setActiveGenerations(prev => [...prev, request]);
      
      // Start polling for status
      pollGenerationStatus(request.id);
      
      return request;
    } catch (err) {
      console.error('Error requesting document generation:', err);
      setError('Failed to request document generation. Please try again.');
      setGenerationStatus('error');
      return null;
    }
  }, []);

  // Poll for document generation status
  const pollGenerationStatus = useCallback(async (requestId: string) => {
    try {
      const checkStatus = async () => {
        const request = await getDocumentGenerationStatus(requestId);
        
        // Update active generations
        setActiveGenerations(prev => 
          prev.map(gen => gen.id === requestId ? request : gen)
        );
        
        if (request.status === 'completed') {
          setGenerationStatus('completed');
          
          // Fetch the generated document
          if (request.result_document_id) {
            const document = await getGeneratedDocumentById(request.result_document_id);
            
            // Update generated documents
            setGeneratedDocuments(prev => {
              const exists = prev.some(doc => doc.id === document.id);
              return exists ? prev.map(doc => doc.id === document.id ? document : doc) : [...prev, document];
            });
          }
          
          return true;
        } else if (request.status === 'failed') {
          setGenerationStatus('error');
          setError('Document generation failed. Please try again.');
          return true;
        }
        
        return false;
      };
      
      // Check immediately
      const isComplete = await checkStatus();
      if (isComplete) return;
      
      // Poll every 2 seconds
      const interval = setInterval(async () => {
        const isComplete = await checkStatus();
        if (isComplete) {
          clearInterval(interval);
        }
      }, 2000);
      
      // Clean up interval after 5 minutes (timeout)
      setTimeout(() => {
        clearInterval(interval);
        setGenerationStatus('error');
        setError('Document generation timed out. Please try again.');
      }, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    } catch (err) {
      console.error('Error polling generation status:', err);
      setGenerationStatus('error');
      setError('Failed to check document generation status.');
    }
  }, []);

  // Subscribe to document generation updates
  const subscribeToGenerationUpdates = useCallback((consultationId: string) => {
    if (!user) return () => {};
    
    // Subscribe to document_generation_requests table
    const requestsChannel = supabase
      .channel(`document-requests-${consultationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'document_generation_requests',
          filter: `consultation_id=eq.${consultationId}`
        },
        (payload) => {
          console.log('Document generation request update:', payload);
          
          // Refresh active generations
          setActiveGenerations(prev => {
            const exists = prev.some(gen => gen.id === payload.new.id);
            return exists 
              ? prev.map(gen => gen.id === payload.new.id ? payload.new : gen)
              : [...prev, payload.new];
          });
          
          // Update generation status
          if (payload.new.status === 'completed') {
            setGenerationStatus('completed');
            
            // Fetch the generated document
            if (payload.new.result_document_id) {
              getGeneratedDocumentById(payload.new.result_document_id)
                .then(document => {
                  setGeneratedDocuments(prev => {
                    const exists = prev.some(doc => doc.id === document.id);
                    return exists 
                      ? prev.map(doc => doc.id === document.id ? document : doc)
                      : [...prev, document];
                  });
                })
                .catch(console.error);
            }
          } else if (payload.new.status === 'failed') {
            setGenerationStatus('error');
            setError('Document generation failed. Please try again.');
          }
        }
      )
      .subscribe();
    
    // Subscribe to generated_documents table
    const documentsChannel = supabase
      .channel(`generated-documents-${consultationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generated_documents',
          filter: `consultation_id=eq.${consultationId}`
        },
        (payload) => {
          console.log('Generated document update:', payload);
          
          // Update generated documents
          setGeneratedDocuments(prev => {
            const exists = prev.some(doc => doc.id === payload.new.id);
            return exists 
              ? prev.map(doc => doc.id === payload.new.id ? payload.new : doc)
              : [...prev, payload.new];
          });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(documentsChannel);
    };
  }, [user]);

  // Subscribe to conversation webhook events
  const subscribeToConversationEvents = useCallback((consultationId: string) => {
    if (!user) return () => {};
    
    const channel = supabase
      .channel(`user-${user.id}`)
      .on(
        'broadcast',
        { event: 'conversation_completed' },
        (payload) => {
          console.log('Conversation completed:', payload);
          
          if (payload.payload.consultationId === consultationId) {
            setConversationTranscript(payload.payload.transcript);
            
            // Check for document opportunities
            if (payload.payload.documentOpportunities) {
              suggestDocumentGeneration(payload.payload);
            }
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Suggest document generation based on conversation
  const suggestDocumentGeneration = useCallback((conversationPayload: any) => {
    // This would show UI notifications to suggest document generation
    console.log('Document generation opportunities:', conversationPayload.documentOpportunities);
    
    // In a real implementation, this would trigger UI notifications
    // For now, we'll just log the opportunities
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
    // New methods
    fetchGeneratedDocuments,
    requestGeneration,
    generationStatus,
    activeGenerations,
    generatedDocuments,
    conversationTranscript,
    subscribeToGenerationUpdates,
    subscribeToConversationEvents,
    suggestDocumentGeneration
  };
}