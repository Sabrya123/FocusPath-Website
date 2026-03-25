import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  AppState,
  Vibration,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../utils/colors';
import { validateHabitPhoto } from '../utils/photoValidator';
import { CloseIcon, CheckIcon, CameraIcon, FireIcon } from '../components/Icons';

const EXTRA_TIME_BONUS = 20;

// Steps: 'before_photo' → 'timer' → 'after_photo' → 'done_check' → 'extra_time' → 'complete'
export default function HabitSessionScreen({ navigation, route }) {
  const { habit, onComplete, onPause, resumeTimeLeft, resumeBeforePhoto } = route.params;
  const isResuming = resumeTimeLeft != null;
  const [step, setStep] = useState(isResuming ? 'timer' : 'before_photo');
  const [beforePhoto, setBeforePhoto] = useState(resumeBeforePhoto || null);
  const [afterPhoto, setAfterPhoto] = useState(null);
  const [timeLeft, setTimeLeft] = useState(resumeTimeLeft != null ? resumeTimeLeft : habit.timer * 60);
  const [extraTimeStart, setExtraTimeStart] = useState(null);
  const [extraSeconds, setExtraSeconds] = useState(0);
  const [validating, setValidating] = useState(false);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const bgTimeRef = useRef(null);

  // Handle app going to background/foreground during timer
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current === 'active' && nextState.match(/inactive|background/)) {
        // Going to background — save timestamp
        bgTimeRef.current = Date.now();
      } else if (nextState === 'active' && bgTimeRef.current) {
        // Coming back — adjust timer
        const elapsed = Math.floor((Date.now() - bgTimeRef.current) / 1000);
        bgTimeRef.current = null;
        if (step === 'timer') {
          setTimeLeft(prev => Math.max(0, prev - elapsed));
        } else if (step === 'extra_time' && extraTimeStart) {
          setExtraSeconds(Math.floor((Date.now() - extraTimeStart) / 1000));
        }
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, [step, extraTimeStart]);

  // Main countdown timer
  useEffect(() => {
    if (step === 'timer' && timeLeft > 0 && !paused) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            Vibration.vibrate([0, 500, 200, 500]);
            setStep('after_photo');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [step, timeLeft, paused]);

  // Extra time tracker
  useEffect(() => {
    if (step === 'extra_time') {
      const interval = setInterval(() => {
        if (extraTimeStart) {
          setExtraSeconds(Math.floor((Date.now() - extraTimeStart) / 1000));
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, extraTimeStart]);

  async function takePhoto(purpose) {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera Permission', 'We need camera access to verify your habit.');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.5,
      allowsEditing: false,
    });

    if (result.canceled) return null;
    return result.assets[0].uri;
  }

  async function handleBeforePhoto() {
    const uri = await takePhoto('before');
    if (!uri) return;

    setValidating(true);
    // Validate the photo matches the habit category
    const validation = validateHabitPhoto(habit.category, habit.name, 'before');
    setValidating(false);

    if (!validation.valid) {
      Alert.alert('Photo Check', validation.message);
      return;
    }

    setBeforePhoto(uri);

    if (habit.timer > 0) {
      setStep('timer');
    } else {
      // No timer — go straight to after photo
      setStep('after_photo');
    }
  }

  async function handleAfterPhoto() {
    const uri = await takePhoto('after');
    if (!uri) return;

    setValidating(true);
    const validation = validateHabitPhoto(habit.category, habit.name, 'after');
    setValidating(false);

    if (!validation.valid) {
      Alert.alert('Photo Check', validation.message);
      return;
    }

    setAfterPhoto(uri);
    setStep('done_check');
  }

  function handleDone() {
    if (onComplete) {
      onComplete({ extraPoints: 0 });
    }
    navigation.goBack();
  }

  function handleNotDone() {
    setExtraTimeStart(Date.now());
    setStep('extra_time');
  }

  function handleExtraDone() {
    const extraMinutes = Math.floor(extraSeconds / 60);
    const bonus = extraMinutes > 0 ? EXTRA_TIME_BONUS : 0;
    if (onComplete) {
      onComplete({ extraPoints: bonus });
    }
    navigation.goBack();
  }

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function formatExtraTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `+${m}m ${s}s`;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Quit Session?', 'You will lose progress for this habit.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Quit', style: 'destructive', onPress: () => navigation.goBack() },
              ]);
            }}
          >
            <CloseIcon size={18} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.habitBadge}>
            <Text style={styles.habitBadgeText}>{habit.name}</Text>
          </View>
          <View style={{ width: 30 }} />
        </View>

        {/* STEP: Before Photo */}
        {step === 'before_photo' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Start Your Habit</Text>
            <Text style={styles.stepDesc}>
              Take a photo to prove you're starting{'\n'}
              "{habit.name}"
            </Text>
            <View style={styles.photoPlaceholder}>
              {beforePhoto ? (
                <Image source={{ uri: beforePhoto }} style={styles.photoPreview} />
              ) : (
                <>
                  <View style={styles.cameraIcon}><CameraIcon size={36} /></View>
                  <Text style={styles.photoPlaceholderText}>Take a before photo</Text>
                </>
              )}
            </View>
            <TouchableOpacity
              style={[styles.primaryBtn, validating && styles.primaryBtnDisabled]}
              onPress={handleBeforePhoto}
              disabled={validating}
            >
              <Text style={styles.primaryBtnText}>
                {validating ? 'Checking...' : 'Take Photo & Start'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP: Timer */}
        {step === 'timer' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>In Progress</Text>
            <Text style={styles.stepDesc}>Stay focused on "{habit.name}"</Text>

            {beforePhoto && (
              <Image source={{ uri: beforePhoto }} style={styles.photoSmall} />
            )}

            <View style={styles.timerCircle}>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              <Text style={styles.timerLabel}>remaining</Text>
            </View>

            <TouchableOpacity
              style={styles.endEarlyBtn}
              onPress={() => {
                // Save progress and go back to home
                if (onPause) {
                  onPause({ timeLeft, beforePhoto });
                }
                navigation.goBack();
              }}
            >
              <Text style={styles.endEarlyBtnText}>End Early</Text>
            </TouchableOpacity>

            <Text style={styles.timerTip}>
              You can leave the app — the timer continues!
            </Text>
          </View>
        )}


        {/* STEP: After Photo */}
        {step === 'after_photo' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {habit.timer > 0 ? 'Time\'s Up!' : 'Verify Completion'}
            </Text>
            <Text style={styles.stepDesc}>
              Take a photo to verify you completed{'\n'}
              "{habit.name}"
            </Text>
            <View style={styles.photoPlaceholder}>
              {afterPhoto ? (
                <Image source={{ uri: afterPhoto }} style={styles.photoPreview} />
              ) : (
                <>
                  <View style={styles.cameraIcon}><CameraIcon size={36} /></View>
                  <Text style={styles.photoPlaceholderText}>Take an after photo</Text>
                </>
              )}
            </View>
            <TouchableOpacity
              style={[styles.primaryBtn, validating && styles.primaryBtnDisabled]}
              onPress={handleAfterPhoto}
              disabled={validating}
            >
              <Text style={styles.primaryBtnText}>
                {validating ? 'Checking...' : 'Take Completion Photo'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP: Done Check */}
        {step === 'done_check' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Are You Done?</Text>
            <Text style={styles.stepDesc}>
              Great work completing "{habit.name}"!
            </Text>

            <View style={styles.photoPair}>
              {beforePhoto && (
                <View style={styles.photoCompare}>
                  <Text style={styles.photoCompareLabel}>Before</Text>
                  <Image source={{ uri: beforePhoto }} style={styles.photoCompareImg} />
                </View>
              )}
              {afterPhoto && (
                <View style={styles.photoCompare}>
                  <Text style={styles.photoCompareLabel}>After</Text>
                  <Image source={{ uri: afterPhoto }} style={styles.photoCompareImg} />
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleDone}>
              <Text style={styles.primaryBtnText}>Yes, I'm Done!</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleNotDone}>
              <Text style={styles.secondaryBtnText}>No, I Want Extra Time</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP: Extra Time */}
        {step === 'extra_time' && (
          <View style={styles.stepContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center' }}>
              <Text style={styles.stepTitle}>Extra Time</Text>
              <FireIcon size={22} />
            </View>
            <Text style={styles.stepDesc}>
              Keep going! You'll earn bonus points{'\n'}
              (+{EXTRA_TIME_BONUS} pts for extra effort)
            </Text>

            <View style={styles.extraTimerCircle}>
              <Text style={styles.extraTimerText}>{formatExtraTime(extraSeconds)}</Text>
              <Text style={styles.timerLabel}>extra time</Text>
            </View>

            <Text style={styles.timerTip}>
              Leave the app and keep working.{'\n'}Come back when you're done!
            </Text>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleExtraDone}>
              <Text style={styles.primaryBtnText}>I'm Done Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1, padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cancelText: {
    color: Colors.textMuted,
    fontSize: 22,
    width: 30,
  },
  habitBadge: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  habitBadgeText: {
    color: Colors.textBright,
    fontSize: 14,
    fontWeight: '600',
  },

  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textBright,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },

  // Photo
  photoPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: Colors.bgCard,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    overflow: 'hidden',
  },
  cameraIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  photoPlaceholderText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  photoSmall: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Timer
  timerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.textBright,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
  timerCirclePaused: {
    borderColor: Colors.textMuted,
    opacity: 0.6,
  },
  pauseBtn: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  pauseBtnText: {
    color: Colors.textBright,
    fontSize: 16,
    fontWeight: '700',
  },
  endEarlyBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  endEarlyBtnText: {
    color: Colors.redLight,
    fontSize: 15,
    fontWeight: '600',
  },
  timerTip: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Extra time
  extraTimerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  extraTimerText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.green,
    fontVariant: ['tabular-nums'],
  },

  // Photos comparison
  photoPair: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 30,
  },
  photoCompare: {
    alignItems: 'center',
  },
  photoCompareLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 6,
    fontWeight: '600',
  },
  photoCompareImg: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Buttons
  primaryBtn: {
    backgroundColor: Colors.red,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    width: '100%',
    marginTop: 16,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryBtnText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
