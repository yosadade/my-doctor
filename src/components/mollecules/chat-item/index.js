import React from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {color, fonts} from '../../../utils';
import {DummyDoctor} from '../../../assets';

const ChatItem = ({isOther}) => {
  return (
    <View style={styles.container(isOther)}>
      {isOther && <Image style={styles.avatar} source={DummyDoctor} />}
      <View>
        <View style={styles.chatContainer(isOther)}>
          <Text style={styles.chat(isOther)}>
            Ibu dokter, apakah memakan jeruk tiap hari itu buruk?
          </Text>
        </View>
        <Text style={styles.time(isOther)}>4.20 AM</Text>
      </View>
    </View>
  );
};

export default ChatItem;

const styles = StyleSheet.create({
  container: isOther => ({
    alignItems: isOther ? 'flex-start' : 'flex-end',
    marginBottom: 20,
    flexDirection: isOther ? 'row' : 'column',
  }),
  chatContainer: isOther => ({
    backgroundColor: isOther ? color.primary : color.categoryLight,
    borderRadius: 10,
    borderBottomRightRadius: isOther ? 10 : 0,
    borderBottomLeftRadius: isOther ? 0 : 10,
    maxWidth: '80%',
    marginBottom: 8,
  }),
  chat: isOther => ({
    padding: 12,
    fontFamily: fonts.primary[400],
    color: isOther ? color.white : color.text.primary,
  }),
  time: isOther => ({
    fontFamily: fonts.primary[400],
    color: color.text.secondary,
    fontSize: 11,
    alignSelf: isOther ? 'flex-start' : 'flex-end',
  }),
  avatar: {
    height: 30,
    width: 30,
    alignSelf: 'flex-end',
    marginRight: 8,
  },
});
