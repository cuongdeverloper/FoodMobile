import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';

type Props = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  icons?: React.ReactNode; 
  loading?: boolean;
};


const ShareBtn: React.FC<Props> = ({ title, onPress, disabled = false, buttonStyle, textStyle,icons,loading = false }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
       style={[
        styles.button,
        buttonStyle,
        disabled && { opacity: 0.5 } 
      ]}
    >
      {loading && <ActivityIndicator/>}
      {icons && <>{icons}</>}
      <Text style={[styles.text, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 20
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
  text: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ShareBtn;
