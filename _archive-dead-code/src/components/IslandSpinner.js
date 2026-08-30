import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Image, Animated, Easing, StyleSheet, PanResponder } from 'react-native';
import { ISLAND_360_FRAMES } from '../data/island360';

// Turntable spinner with two implementations behind one API:
//
// - LoopSpinner (autospin, not draggable — the home card / ranks banner):
//   plays a DENSE frame set (1.25° steps) with hard, sharp swaps. Steps this
//   small read as continuous motion, so no cross-fading (= no haze) is needed.
//   Only a small ring of upcoming frames is mounted at a time; a listener
//   rebinds ring slots a couple of seconds ahead of the playhead, so memory
//   stays low no matter how many frames the set has.
//
// - ScrubSpinner (draggable — the 360° viewer): mounts every frame once so
//   dragging can jump anywhere instantly, and softens the coarser auto-spin
//   steps with a quick end-of-interval dissolve.
//
// Both drive opacity from a single native-driver Animated.Value, so the spin
// itself never depends on JS-thread timing.
export default function IslandSpinner(props) {
  const frames = props.frames || ISLAND_360_FRAMES;
  if (!frames || frames.length === 0) return null;
  if (props.draggable) return <ScrubSpinner {...props} frames={frames} />;
  return <LoopSpinner {...props} frames={frames} />;
}

// progress runs 0 → N once per rotation, looping natively on the UI thread.
function useTurntableProgress(progress, N, autoSpin, secondsPerRotation, paused) {
  useEffect(() => {
    if (!autoSpin || paused || N < 2) return undefined;
    const spin = Animated.loop(
      Animated.timing(progress, {
        toValue: N,
        duration: secondsPerRotation * 1000,
        easing: Easing.linear,
        isInteraction: false,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  }, [autoSpin, paused, N, secondsPerRotation, progress]);
}

// Largest ring size ≤ 24 that divides the frame count evenly, so slot
// assignments cycle cleanly across the loop point.
function ringSize(N) {
  for (let k = Math.min(24, N); k >= 4; k--) {
    if (N % k === 0) return k;
  }
  return N;
}

function LoopSpinner({ frames, size = 140, autoSpin = true, secondsPerRotation = 40, style }) {
  const N = frames.length;
  const K = ringSize(N);
  const progress = useRef(new Animated.Value(0)).current;
  useTurntableProgress(progress, N, autoSpin, secondsPerRotation, false);

  // Slot j shows every frame f with f % K === j. The window covers one frame
  // behind the playhead and K-2 ahead (~3s of decode headroom at play speed).
  const assignmentsFor = (fc) => {
    const arr = new Array(K);
    for (let t = 0; t < K; t++) {
      const w = (((fc - 1 + t) % N) + N) % N;
      arr[w % K] = w;
    }
    return arr;
  };
  const [slotFrames, setSlotFrames] = useState(() => assignmentsFor(0));
  const lastFcRef = useRef(0);

  useEffect(() => {
    if (K >= N) return undefined; // whole set mounted, nothing to rebind
    const id = progress.addListener(({ value }) => {
      const fc = Math.floor(value) % N;
      if (fc === lastFcRef.current) return;
      lastFcRef.current = fc;
      setSlotFrames(assignmentsFor(fc));
    });
    return () => progress.removeListener(id);
  }, [progress, N, K]);

  // Hard-step opacity per slot: 1 while progress is inside one of the slot's
  // frame intervals, 0 otherwise. The final frame holds through progress === N
  // so the island never blanks at the loop point.
  const slotOpacities = useMemo(() => {
    const eps = 1e-4;
    return Array.from({ length: K }, (_, j) => {
      const inputRange = [];
      const outputRange = [];
      for (let f = j; f < N; f += K) {
        inputRange.push(f - eps, f);
        outputRange.push(0, 1);
        if (f === N - 1) {
          inputRange.push(N);
          outputRange.push(1);
        } else {
          inputRange.push(f + 1 - eps, f + 1);
          outputRange.push(1, 0);
        }
      }
      return progress.interpolate({ inputRange, outputRange, extrapolate: 'clamp' });
    });
  }, [progress, N, K]);

  if (!autoSpin || N < 2) {
    return (
      <View style={[{ width: size, height: size }, style]}>
        <Image
          source={frames[0]}
          fadeDuration={0}
          resizeMode="contain"
          style={[styles.layer, { width: size, height: size }]}
        />
      </View>
    );
  }

  return (
    <View style={[{ width: size, height: size }, style]}>
      {slotFrames.map((f, j) => (
        <Animated.Image
          key={j}
          source={frames[f]}
          fadeDuration={0}
          resizeMode="contain"
          style={[styles.layer, { width: size, height: size, opacity: slotOpacities[j] }]}
        />
      ))}
    </View>
  );
}

function ScrubSpinner({ frames, size = 140, autoSpin = true, secondsPerRotation = 40, style }) {
  const N = frames.length;
  const progress = useRef(new Animated.Value(0)).current;
  const valRef = useRef(0);
  const [paused, setPaused] = useState(false);
  useTurntableProgress(progress, N, autoSpin, secondsPerRotation, paused);

  // JS-side mirror of the native value, used as the drag start position.
  useEffect(() => {
    const id = progress.addListener(({ value }) => {
      valRef.current = value;
    });
    return () => progress.removeListener(id);
  }, [progress]);

  // Sharp-hold stepping for the coarser scrub set: each frame is shown clean
  // for most of its interval; only the last XFADE fraction dissolves quickly
  // into the next frame, with the solid current frame kept underneath so the
  // island interior never turns translucent.
  const XFADE = 0.25;
  const opacities = useMemo(
    () =>
      frames.map((_, i) => {
        if (N < 3) {
          return progress.interpolate({
            inputRange: [i - 0.001, i, i + 0.999, i + 1],
            outputRange: [0, 1, 1, 0],
            extrapolate: 'clamp',
          });
        }
        if (i === 0) {
          return progress.interpolate({
            inputRange: [0, 1, 1 + XFADE, N - XFADE, N],
            outputRange: [1, 1, 0, 0, 1],
            extrapolate: 'clamp',
          });
        }
        if (i === N - 1) {
          return progress.interpolate({
            inputRange: [0, XFADE, N - 1 - XFADE, N - 1, N],
            outputRange: [1, 0, 0, 1, 1],
            extrapolate: 'clamp',
          });
        }
        return progress.interpolate({
          inputRange: [i - XFADE, i, i + 1, i + 1 + XFADE],
          outputRange: [0, 1, 1, 0],
          extrapolate: 'clamp',
        });
      }),
    [frames, N, progress]
  );

  // Drag-to-spin. Grabbing pauses the auto-spin.
  const startRef = useRef(0);
  const panRef = useRef(null);
  if (!panRef.current) {
    const PX_PER_FRAME = 4;
    panRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 2,
      onPanResponderGrant: () => {
        setPaused(true);
        startRef.current = valRef.current;
        progress.stopAnimation((v) => {
          startRef.current = v;
          valRef.current = v;
        });
      },
      onPanResponderMove: (_e, g) => {
        let next = (startRef.current - g.dx / PX_PER_FRAME) % N;
        if (next < 0) next += N;
        valRef.current = next;
        progress.setValue(next);
      },
    });
  }

  return (
    <View style={[{ width: size, height: size }, style]} {...panRef.current.panHandlers}>
      {frames.map((f, i) => (
        <Animated.Image
          key={i}
          source={f}
          fadeDuration={0}
          resizeMode="contain"
          style={[styles.layer, { width: size, height: size, opacity: opacities[i] }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, left: 0 },
});
