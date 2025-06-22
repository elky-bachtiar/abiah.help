import { useState, useEffect, useCallback } from 'react';
import { TeamMember, JoinTeamRequest, JoinRequestResponse } from '../types/Team';
import { fetchTeamMembers, fetchTeamMember, submitJoinRequest } from '../api/team';

export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTeamMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchTeamMembers();
      setMembers(response.members);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError(err instanceof Error ? err.message : 'Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  const getTeamMember = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchTeamMember(id);
      return response.member;
    } catch (err) {
      console.error('Error fetching team member:', err);
      setError(err instanceof Error ? err.message : 'Failed to load team member');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitJoinTeamRequest = useCallback(async (request: JoinTeamRequest): Promise<JoinRequestResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await submitJoinRequest(request);
      return response;
    } catch (err) {
      console.error('Error submitting join request:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit join request');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    members,
    isLoading,
    error,
    loadTeamMembers,
    getTeamMember,
    submitJoinTeamRequest
  };
}