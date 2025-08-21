import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import wastePickupService from '../services/wastePickupService';
import { CreateWastePickupRequest, WastePickup } from '../types/foodListing';

export const useWastePickups = () => {
  const queryClient = useQueryClient();

  // Get all waste pickup requests
  const {
    data: pickups = [],
    isLoading: pickupsLoading,
    error: pickupsError,
  } = useQuery({
    queryKey: ['wastePickups'],
    queryFn: wastePickupService.getAll,
  });

  // Get user's waste pickup requests
  const {
    data: myPickups = [],
    isLoading: myPickupsLoading,
    error: myPickupsError,
  } = useQuery({
    queryKey: ['myWastePickups'],
    queryFn: wastePickupService.getMyPickups,
  });

  // Create waste pickup mutation
  const createPickup = useMutation({
    mutationFn: (pickupData: CreateWastePickupRequest) =>
      wastePickupService.create(pickupData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wastePickups'] });
      queryClient.invalidateQueries({ queryKey: ['myWastePickups'] });
    },
  });

  // Update waste pickup mutation
  const updatePickup = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateWastePickupRequest> }) =>
      wastePickupService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wastePickups'] });
      queryClient.invalidateQueries({ queryKey: ['myWastePickups'] });
    },
  });

  // Delete waste pickup mutation
  const deletePickup = useMutation({
    mutationFn: (id: string) => wastePickupService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wastePickups'] });
      queryClient.invalidateQueries({ queryKey: ['myWastePickups'] });
    },
  });

  // Get pickup by ID
  const getPickupById = (id: string) => {
    return useQuery({
      queryKey: ['wastePickup', id],
      queryFn: () => wastePickupService.getById(id),
      enabled: !!id,
    });
  };

  return {
    pickups,
    myPickups,
    pickupsLoading,
    myPickupsLoading,
    pickupsError,
    myPickupsError,
    createPickup: createPickup.mutateAsync,
    updatePickup: updatePickup.mutateAsync,
    deletePickup: deletePickup.mutateAsync,
    getPickupById,
    isCreating: createPickup.isPending,
    isUpdating: updatePickup.isPending,
    isDeleting: deletePickup.isPending,
  };
};

export default useWastePickups;
