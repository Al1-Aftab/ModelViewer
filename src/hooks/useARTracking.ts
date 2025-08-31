import { useState } from 'react';
import { ViroTrackingStateConstants } from '@reactvision/react-viro';
import { ARTrackingState } from '../types';
import { AR_STATUS_MESSAGES } from '../constants';

/**
 * Custom hook for managing AR tracking state
 */
export const useARTracking = (planeDetectionMode: boolean) => {
  const [trackingState, setTrackingState] = useState<ARTrackingState>({
    isReady: false,
    statusText: AR_STATUS_MESSAGES.INITIALIZING,
  });

  const handleTrackingUpdate = (state: any, reason: any) => {
    console.log("AR Tracking Update:", state, reason);

    let newState: ARTrackingState;

    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      newState = {
        isReady: true,
        statusText: planeDetectionMode 
          ? AR_STATUS_MESSAGES.READY_WITH_DETECTION
          : AR_STATUS_MESSAGES.READY_NO_DETECTION,
      };
    } else if (state === ViroTrackingStateConstants.TRACKING_LIMITED) {
      newState = {
        isReady: false,
        statusText: AR_STATUS_MESSAGES.TRACKING_LIMITED,
      };
    } else if (state === ViroTrackingStateConstants.TRACKING_UNAVAILABLE) {
      newState = {
        isReady: false,
        statusText: AR_STATUS_MESSAGES.TRACKING_UNAVAILABLE,
      };
    } else {
      newState = {
        isReady: false,
        statusText: AR_STATUS_MESSAGES.INITIALIZING,
      };
    }

    setTrackingState(newState);
  };

  return {
    trackingState,
    handleTrackingUpdate,
  };
};
