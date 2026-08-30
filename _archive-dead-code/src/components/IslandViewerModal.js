import React from 'react';
import {
  Modal,
  View,
  ImageBackground,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloseIcon } from './Icons';
import IslandSpinner from './IslandSpinner';
import { getIslandFrames, getRankBackground, ISLAND_360_FRAMES } from '../data/island360';

const { width, height } = Dimensions.get('window');

// Interactive 360° island as a popup. The heavy frame stack is only mounted
// while the popup is actually open (so it costs nothing when closed).
export default function IslandViewerModal({ visible, rankName, onClose }) {
  const allFrames = getIslandFrames(rankName) || ISLAND_360_FRAMES;
  // The scrub viewer mounts every frame at once for instant drag access, so
  // thin dense sets to every 2nd frame to keep its memory use in check.
  const frames = React.useMemo(
    () => (allFrames.length > 160 ? allFrames.filter((_, i) => i % 2 === 0) : allFrames),
    [allFrames]
  );
  const background = getRankBackground(rankName);
  const islandSize = Math.min(width * 0.9, height * 0.52);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {visible && (
        <View style={styles.root}>
          <ImageBackground source={background} style={StyleSheet.absoluteFill} resizeMode="cover">
            <View style={styles.scrim} />
            <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
              <View style={styles.header}>
                <Text style={styles.title}>{rankName}</Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <CloseIcon size={22} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.stage}>
                <IslandSpinner
                  frames={frames}
                  size={islandSize}
                  autoSpin
                  draggable
                  secondsPerRotation={26}
                />
              </View>

              <View style={styles.footer}>
                <Text style={styles.hint}>‹  Drag to spin the island  ›</Text>
              </View>
            </SafeAreaView>
          </ImageBackground>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#bfe3fb' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.12)' },
  safe: { flex: 1, justifyContent: 'space-between' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  footer: { alignItems: 'center', paddingBottom: 28 },
  hint: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    overflow: 'hidden',
  },
});
