import ReactNativeBiometrics from 'react-native-biometrics';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const biometrics = new ReactNativeBiometrics();
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const useBiometric = () => {
  const check = async () => {
    try {
      const { available, biometryType } = await biometrics.isSensorAvailable();

      let typeName = '';
      if (biometryType === 'FaceID') {
        typeName = 'Face ID';
      } else if (biometryType === 'TouchID') {
        typeName = 'Fingerprint';
      } else if (biometryType === 'Biometrics') {
        typeName = 'Biometric';
      }

      return {
        available,
        hardware: available,
        enrolled: available,
        types: typeName ? [typeName] : [],
        biometryType,
      };
    } catch (error) {
      return {
        available: false,
        hardware: false,
        enrolled: false,
        types: [],
      };
    }
  };

  const authenticate = async (reason = 'Authenticate to access SkillNest') => {
    try {
      const { success, error } = await biometrics.simplePrompt({
        promptMessage: reason,
        cancelButtonText: 'Cancel',
      });
      if (success) {
        ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
      }
      return { success, error: error || null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const triggerHaptic = (type = 'impactLight') => {
    ReactNativeHapticFeedback.trigger(type, hapticOptions);
  };

  return { check, authenticate, triggerHaptic };
};

export default useBiometric;
