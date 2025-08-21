import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import foodDonationService from '../services/foodDonationService';
import { CreateFoodDonationRequest, FoodDonation } from '../types/foodListing';
import useApi from './useApi';

export const useFoodDonations = () => {
  const queryClient = useQueryClient();

  // Get all food donations
  const {
    data: donations = [],
    isLoading: donationsLoading,
    error: donationsError,
  } = useQuery({
    queryKey: ['foodDonations'],
    queryFn: foodDonationService.getAll,
  });

  // Get user's food donations
  const {
    data: myDonations = [],
    isLoading: myDonationsLoading,
    error: myDonationsError,
  } = useQuery({
    queryKey: ['myFoodDonations'],
    queryFn: foodDonationService.getMyDonations,
  });

  // Create food donation mutation
  const createDonation = useMutation({
    mutationFn: (donationData: CreateFoodDonationRequest) =>
      foodDonationService.create(donationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodDonations'] });
      queryClient.invalidateQueries({ queryKey: ['myFoodDonations'] });
    },
  });

  // Update food donation mutation
  const updateDonation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFoodDonationRequest> }) =>
      foodDonationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodDonations'] });
      queryClient.invalidateQueries({ queryKey: ['myFoodDonations'] });
    },
  });

  // Delete food donation mutation
  const deleteDonation = useMutation({
    mutationFn: (id: string) => foodDonationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodDonations'] });
      queryClient.invalidateQueries({ queryKey: ['myFoodDonations'] });
    },
  });

  // Get donation by ID
  const getDonationById = (id: string) => {
    return useQuery({
      queryKey: ['foodDonation', id],
      queryFn: () => foodDonationService.getById(id),
      enabled: !!id,
    });
  };

  return {
    donations,
    myDonations,
    donationsLoading,
    myDonationsLoading,
    donationsError,
    myDonationsError,
    createDonation: createDonation.mutateAsync,
    updateDonation: updateDonation.mutateAsync,
    deleteDonation: deleteDonation.mutateAsync,
    getDonationById,
    isCreating: createDonation.isPending,
    isUpdating: updateDonation.isPending,
    isDeleting: deleteDonation.isPending,
  };
};

export default useFoodDonations;
