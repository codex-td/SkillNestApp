import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { COLORS } from '../theme/theme';

const { width, height } = Dimensions.get('window');

const AnimatedBG = ({ children }) => {
  const particles = useRef(
    [...Array(18)].map(() => ({
      translateY: new Animated.Value(height),
      translateX: new Animated.Value(Math.random() * width),
      opacity: new Animated.Value(0),
      size: 2 + Math.random() * 4,
      duration: 6000 + Math.random() * 8000,
      delay: Math.random() * 5000,
      color: [COLORS.cyan, COLORS.pink, COLORS.purple, COLORS.green][
        Math.floor(Math.random() * 4)
      ],
    })),
  ).current;

  const blob1Scale = useRef(new Animated.Value(0.85)).current;
  const blob1Opacity = useRef(new Animated.Value(0.06)).current;
  const blob2Scale = useRef(new Animated.Value(1)).current;
  const blob2Opacity = useRef(new Animated.Value(0.08)).current;
  const blob3Scale = useRef(new Animated.Value(0.9)).current;
  const blob3Opacity = useRef(new Animated.Value(0.05)).current;

  const cyanLineY = useRef(new Animated.Value(-50)).current;
  const purpleLineY = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    particles.forEach(particle => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(particle.translateY, {
            toValue: -100,
            duration: particle.duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(particle.opacity, {
              toValue: 0.8,
              duration: 500,
              delay: particle.delay,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: particle.duration - 500,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    });

    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(blob1Scale, {
            toValue: 1.1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(blob1Scale, {
            toValue: 0.85,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(blob1Opacity, {
            toValue: 0.22,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(blob1Opacity, {
            toValue: 0.06,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();

    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(blob2Scale, {
            toValue: 0.85,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(blob2Scale, {
            toValue: 1.1,
            duration: 5000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(blob2Opacity, {
            toValue: 0.2,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(blob2Opacity, {
            toValue: 0.08,
            duration: 5000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();

    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(blob3Scale, {
            toValue: 1.05,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(blob3Scale, {
            toValue: 0.9,
            duration: 6000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(blob3Opacity, {
            toValue: 0.18,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(blob3Opacity, {
            toValue: 0.05,
            duration: 6000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();

    Animated.loop(
      Animated.timing(cyanLineY, {
        toValue: height + 100,
        duration: 7000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.timing(purpleLineY, {
        toValue: height + 100,
        duration: 11000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const gridLines = [];
  for (let i = 0; i < 12; i++) {
    gridLines.push(
      <View
        key={`h-${i}`}
        style={[styles.gridLine, { top: (height / 12) * i, width }]}
      />,
    );
  }
  for (let i = 0; i < 8; i++) {
    gridLines.push(
      <View
        key={`v-${i}`}
        style={[styles.gridLine, { left: (width / 8) * i, height }]}
      />,
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.bg} />
      {gridLines}

      <Animated.View
        style={[
          styles.blob,
          styles.blob1,
          { transform: [{ scale: blob1Scale }], opacity: blob1Opacity },
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          styles.blob2,
          { transform: [{ scale: blob2Scale }], opacity: blob2Opacity },
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          styles.blob3,
          { transform: [{ scale: blob3Scale }], opacity: blob3Opacity },
        ]}
      />

      <Animated.View
        style={[
          styles.scanLine,
          styles.cyanLine,
          { transform: [{ translateY: cyanLineY }] },
        ]}
      />
      <Animated.View
        style={[
          styles.scanLine,
          styles.purpleLine,
          { transform: [{ translateY: purpleLineY }] },
        ]}
      />

      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              width: particle.size,
              height: particle.size,
              borderRadius: particle.size / 2,
              backgroundColor: particle.color,
              transform: [
                { translateX: particle.translateX },
                { translateY: particle.translateY },
              ],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}

      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(0,200,255,0.025)',
    height: 1,
  },
  blob: {
    position: 'absolute',
    borderRadius: 250,
  },
  blob1: {
    width: 500,
    height: 500,
    backgroundColor: COLORS.cyan,
    top: -180,
    left: -160,
  },
  blob2: {
    width: 380,
    height: 380,
    backgroundColor: COLORS.pink,
    bottom: -120,
    right: -100,
  },
  blob3: {
    width: 300,
    height: 300,
    backgroundColor: COLORS.purple,
    top: '38%',
    right: -60,
  },
  scanLine: {
    position: 'absolute',
    width: width,
    height: 2,
    left: 0,
  },
  cyanLine: {
    backgroundColor: COLORS.cyan,
    opacity: 0.2,
  },
  purpleLine: {
    backgroundColor: COLORS.purple,
    opacity: 0.15,
  },
  particle: {
    position: 'absolute',
    bottom: 0,
  },
  content: {
    flex: 1,
  },
});

export default AnimatedBG;
