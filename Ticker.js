var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (
          e.indexOf(p[i]) < 0 &&
          Object.prototype.propertyIsEnumerable.call(s, p[i])
        )
          t[p[i]] = s[p[i]];
      }
    return t;
  };
import React, {useRef, useEffect, useState, Children} from 'react';
import {StyleSheet, Text, View, I18nManager, Platform} from 'react-native';
import Animated, {Easing} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
const styles = StyleSheet.create({
  row: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    overflow: 'hidden',
  },
  hide: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0,
  },
});
const uniq = values => {
  return values.filter((value, index) => {
    return values.indexOf(value) === index;
  });
};
const range = length => Array.from({length}, (x, i) => i);
const splitText = (text = '') => (text + '').split('');
const numberRange = range(10).map(p => p + '');
const numAdditional = [',', '.'];
const numberItems = [...numberRange, ...numAdditional];
const isNumber = v => !isNaN(parseInt(v));
const getPosition = ({text, items, height}) => {
  const index = items.findIndex(p => p === text);
  return index * height * -1;
};
export const Tick = _a => {
  var props = __rest(_a, []);
  //@ts-ignore
  return <TickItem {...props} />;
};
const useInitRef = cb => {
  const ref = useRef();
  if (!ref.current) {
    ref.current = cb();
  }
  return ref.current;
};
const TickItem = ({
  children,
  duration,
  textStyle,
  textProps,
  measureMap,
  rotateItems,
}) => {
  const measurement = measureMap[children];
  const position = getPosition({
    text: children,
    height: measurement.height,
    items: rotateItems,
  });
  const widthAnim = useInitRef(() => new Animated.Value(measurement.width));
  const stylePos = useInitRef(() => new Animated.Value(position));
  useEffect(() => {
    if (stylePos) {
      Animated.timing(stylePos, {
        toValue: position,
        duration,
        easing: Easing.linear,
      }).start();
      Animated.timing(widthAnim, {
        toValue: measurement.width,
        duration: 25,
        easing: Easing.linear,
      }).start();
    }
  }, [position, measurement]);
  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      {children != ',' && (
        <LinearGradient
          colors={['#58595B', '#000000']}
          style={{
            height: Platform.OS === 'ios' ? 28 : 35,
            // height: measurement.height,
            width: Platform.OS === 'ios' ? 20 : 21,
            // width: widthAnim,
            overflow: 'hidden',
            margin: 1,
            alignItems: 'center',
            borderRadius: 5,
            borderWidth: 1,
            borderColor: 'transparent',
            shadowColor: '#000',
            shadowOffset: {width: 2, height: 2},
            shadowOpacity: 0.58,
            elevation: 10,
          }}>
          <Animated.View>
            <Animated.View
              style={{
                transform: [{translateY: stylePos}],
              }}>
              {rotateItems.map(v => (
                <Text
                  key={v}
                  {...textProps}
                  style={[textStyle, {height: measurement.height}]}>
                  {v}
                </Text>
              ))}
            </Animated.View>
          </Animated.View>
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              justifyContent: 'center',
            }}>
            <LinearGradient
              colors={['#58595B', '#000000']}
              style={{
                width: '100%',
                height: 1,
                marginTop: -1,
                // backgroundColor: '#383838',
              }}
            />
          </View>
        </LinearGradient>
      )}
      {children == ',' && (
        <View>
          <Text
            style={{
              color: 'black',
              // color: 'white',
              fontSize: 28,
              fontWeight: '300',
              position: 'relative',
              // top: 2,
              left: -1.5,
              bottom: -5,
              letterSpacing: 0,
              marginRight: -5,
              marginLeft: -1,
            }}>
            ,
          </Text>
        </View>
      )}
    </View>
  );
};
const Ticker = ({duration = 250, textStyle, textProps, children}) => {
  const [measured, setMeasured] = useState(false);
  const measureMap = useRef({});
  const measureStrings = Children.map(children, child => {
    if (typeof child === 'string' || typeof child === 'number') {
      return splitText(`${child}`);
    } else {
      //@ts-ignore
      return child.props && child.props.rotateItems;
    }
  }).reduce((acc, val) => acc.concat(val), []);
  const hasNumbers = measureStrings.find(v => isNumber(v)) !== undefined;
  const rotateItems = uniq([
    ...(hasNumbers ? numberItems : []),
    ...measureStrings,
  ]);
  const handleMeasure = (e, v) => {
    if (!measureMap.current) return;
    measureMap.current[v] = {
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    };
    if (Object.keys(measureMap.current).length === rotateItems.length) {
      setMeasured(true);
    }
  };
  return (
    <View style={styles.row}>
      {measured === true &&
        Children.map(children, child => {
          if (typeof child === 'string' || typeof child === 'number') {
            return splitText(`${child}`).map((text, index) => {
              let items = isNumber(text) ? numberItems : [text];
              return (
                <TickItem
                  key={index}
                  duration={duration}
                  textStyle={textStyle}
                  textProps={textProps}
                  rotateItems={items}
                  measureMap={measureMap.current}>
                  {text}
                </TickItem>
              );
            });
          } else {
            //@ts-ignore
            return React.cloneElement(child, {
              duration,
              textStyle,
              textProps,
              measureMap: measureMap.current,
            });
          }
        })}
      {rotateItems.map(v => {
        return (
          <Text
            key={v}
            {...textProps}
            style={[textStyle, styles.hide]}
            onLayout={e => handleMeasure(e, v)}>
            {v}
          </Text>
        );
      })}
    </View>
  );
};
Ticker.defaultProps = {
  duration: 250,
};
export default Ticker;
