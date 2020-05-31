import React from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import {
  IconDoctor,
  IconHospitals,
  IconMessages,
  IconDoctorActive,
  IconHospitalsActive,
  IconMessagesActive,
} from '../../../assets';
import {fonts, color} from '../../../utils';

const TabItem = ({label, onPress, onLongPress, active}) => {
  const Icon = () => {
    if (label === 'Doctor') {
      return active ? <IconDoctorActive /> : <IconDoctor />;
    }

    if (label === 'Hospitals') {
      return active ? <IconHospitalsActive /> : <IconHospitals />;
    }

    if (label === 'Messages') {
      return active ? <IconMessagesActive /> : <IconMessages />;
    }

    return <IconDoctor />;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.container}>
      <Icon />
      <Text style={styles.label(active)}>{label}</Text>
    </TouchableOpacity>
  );
};

export default TabItem;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: active => ({
    fontSize: 10,
    fontFamily: fonts.primary[600],
    marginTop: 5,
    color: active ? color.text.menuActive : color.text.menuInactive,
  }),
});