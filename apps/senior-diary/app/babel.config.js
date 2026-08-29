// babel-preset-expo already wires expo-router. No reanimated plugin: the
// breathing/pulse animation (P2) uses RN's built-in Animated API, so we avoid
// adding react-native-worklets + its babel plugin as extra native surface.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
