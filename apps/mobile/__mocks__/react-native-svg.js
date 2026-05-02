const React = require('react');
const { View } = require('react-native');

const mock = (name) => {
  const Comp = ({ children, ...props }) => React.createElement(View, props, children);
  Comp.displayName = name;
  return Comp;
};

module.exports = {
  Svg: mock('Svg'),
  Circle: mock('Circle'),
  Path: mock('Path'),
  G: mock('G'),
  Defs: mock('Defs'),
  LinearGradient: mock('LinearGradient'),
  Stop: mock('Stop'),
  ClipPath: mock('ClipPath'),
  Rect: mock('Rect'),
  Text: mock('SvgText'),
  default: mock('Svg'),
};
