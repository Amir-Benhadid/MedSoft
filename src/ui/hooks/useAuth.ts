/**
 * Authentication Hooks
 * TanStack Query hooks for authentication operations
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';
import { useToast } from '@/ui/hooks/use-toast';

export function useVerifyPin() {
	const { toast } = useToast();

	return useMutation({
		mutationFn: async (pin: string) => {
			return await orpcClient.auth.verifyPin({ pin });
		},
		onError: (error) => {
			console.error('PIN verification error:', error);
			toast({
				variant: 'destructive',
				title: 'Erreur',
				description: 'Erreur lors de la vérification du PIN',
			});
		},
	});
}

export function useUpdatePin() {
	const { toast } = useToast();

	return useMutation({
		mutationFn: async (params: { newPin: string; confirmPin: string }) => {
			return await orpcClient.auth.updatePin(params);
		},
		onSuccess: () => {
			toast({
				variant: 'success',
				title: 'Succès',
				description: 'Code PIN modifié avec succès',
			});
		},
		onError: (error) => {
			console.error('PIN update error:', error);
			toast({
				variant: 'destructive',
				title: 'Erreur',
				description: error?.message || 'Erreur lors de la modification du PIN',
			});
		},
	});
}

export function useHasPin() {
	return useQuery({
		queryKey: ['auth', 'hasPin'],
		queryFn: async () => {
			return await orpcClient.auth.getPin();
		},
	});
}

