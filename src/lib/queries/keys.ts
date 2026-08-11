export const medtrackKeys = {
  all: ['medtrack'] as const,
  patients: () => [...medtrackKeys.all, 'patients'] as const,
  medications: () => [...medtrackKeys.all, 'medications'] as const,
  doseLogs: () => [...medtrackKeys.all, 'doseLogs'] as const,
};
