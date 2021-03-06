import React, {useEffect, useRef, useState} from 'react';
import {ScrollView, StyleSheet, Text, View, Keyboard} from 'react-native';
import {hideMessage, showMessage} from 'react-native-flash-message';
import {
  Button,
  ChatItem,
  Header,
  InputChat,
  Gap,
  DialogBoxChat,
} from '../../components';
import {Fire} from '../../config';
import {color, fonts, getUserData} from '../../utils';
import Clipboard from '@react-native-community/clipboard';

const Chatting = ({navigation, route}) => {
  const {profile, messageId} = route.params;

  const initialUserData = {
    fullName: '',
    profession: '',
    uid: '',
    email: '',
    photo: '',
  };
  const [userData, setUserData] = useState(initialUserData);
  const [chatContent, setChatContent] = useState('');
  const [chatData, setChatData] = useState([]);
  const [trick, setTrick] = useState(0);
  const [height, setHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [checkPosition, setCheckPosition] = useState(false);
  const [isDialog, setDialog] = useState(false);
  const [contentToCopy, setContentToCopy] = useState(null);

  const chatRef = useRef(null);

  getUserData(setUserData, initialUserData);

  const urlDB = messageId
    ? `chattings/${messageId}/allChat`
    : `chattings/${userData.uid}_${profile.uid}/allChat`;
  useEffect(() => {
    Fire.database()
      .ref(urlDB)
      .on('value', snapshot => {
        const data = snapshot.val();

        if (data) {
          const allDataChat = [];
          Object.keys(data).map(key => {
            const dataChat = [];

            Object.keys(data[key]).map(val => {
              dataChat.push({
                data: data[key][val],
                id: val,
              });
            });

            allDataChat.push({
              id: key,
              data: dataChat,
            });
          });

          setChatData(allDataChat);
        }
      });
  }, [profile.uid, userData.uid, urlDB]);

  useEffect(() => {
    if (currentPosition < height - contentHeight) {
      setCheckPosition(true);
    } else {
      setCheckPosition(false);
    }
  }, [currentPosition, height, contentHeight]);

  useEffect(() => {
    Keyboard.addListener('keyboardDidHide', handleFocus);
    return () => {
      Keyboard.addListener('keyboardDidHide', handleFocus).remove();
    };
  }, []);

  const handleScrollBottom = (w, h) => {
    if (chatRef !== null) {
      chatRef?.current.scrollToEnd({animated: false});
    }

    if (chatData.length > 0) {
      setTimeout(() => {
        setTrick(1);
        setHeight(h);
      }, 500);
    }
  };

  const handleScroll = event => {
    const {y} = event.nativeEvent.contentOffset;
    setCurrentPosition(y);
  };

  const handleFocus = e => {
    Keyboard.dismiss();
  };

  const handleScrollFocus = () => {
    if (chatRef !== null && !checkPosition) {
      setTimeout(() => {
        chatRef.current.scrollToEnd({animated: true});
      }, 300);
    }
  };

  const handleLayout = ({nativeEvent}) => {
    setContentHeight(nativeEvent.layout.height);
  };

  const handleSend = () => {
    if (chatContent.length > 0) {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const date = today.getDate();
      const hour = today.getHours();
      const minute = today.getMinutes();

      const data = {
        sendBy: userData.uid,
        chatDate: today.getTime(),
        chatTime: `${hour}:${minute} ${hour > 12 ? 'PM' : 'AM'}`,
        chatContent,
        seenBy: {
          [userData.uid]: {seen: true},
          [profile.uid]: {seen: false},
        },
      };
      const chatID = messageId ? messageId : `${userData.uid}_${profile.uid}`;
      const urlChat = `chattings/${chatID}/allChat/${year}-${month}-${date}`;
      const urlForUser = `messages/${userData.uid}/${chatID}`;
      const urlForDoctor = `messages/${profile.uid}/${chatID}`;

      Fire.database()
        .ref(urlChat)
        .push(data)
        .then(res => {
          // Set History for user
          Fire.database()
            .ref(urlForUser)
            .set({
              lastChatContent: chatContent,
              lastChatDate: today.getTime(),
              uidPartner: profile.uid,
            });

          // Set History for doctor
          Fire.database()
            .ref(urlForDoctor)
            .set({
              lastChatContent: chatContent,
              lastChatDate: today.getTime(),
              uidPartner: userData.uid,
            });
        })
        .catch(err => {
          showMessage(err.message);

          setTimeout(() => {
            hideMessage();
          }, 5000);
        });
      setChatContent('');
    }
  };

  const handleCopy = () => {
    Clipboard.setString(contentToCopy);
    setDialog(false);
  };

  return (
    <>
      {isDialog && (
        <DialogBoxChat onCopy={handleCopy} onClose={() => setDialog(false)} />
      )}
      <View style={styles.page}>
        <Header
          name={profile.fullName}
          profession={profile.profession}
          photo={profile.photo}
          onPress={() => navigation.goBack()}
          type="chatting"
        />
        <View style={styles.content(trick)}>
          <ScrollView
            onContentSizeChange={handleScrollBottom}
            ref={chatRef}
            onScroll={handleScroll}
            onLayout={handleLayout}
            showsVerticalScrollIndicator={false}>
            <Gap height={16} />
            {chatData?.map(chat => {
              let findDate = chat.id.split('-');
              findDate[1] -= 1;

              const date = new Date(
                Date.UTC(findDate[0], findDate[1], findDate[2]),
              ).toDateString();

              return (
                <View key={chat.id}>
                  <Text style={styles.date}>{date.toLocaleString()}</Text>
                  {chat.data?.map(val => {
                    let splittedChatTime = val.data.chatTime.split(':');
                    let chatTime = splittedChatTime[1].split(' ');
                    chatTime.unshift(splittedChatTime[0]);
                    let fixedChatTime = [];
                    for (let i = 0; i < 2; i++) {
                      if (chatTime[i].length < 2) {
                        let val = '0' + chatTime[i];
                        fixedChatTime.push(val);
                      } else {
                        fixedChatTime.push(chatTime[i]);
                      }
                    }
                    fixedChatTime = fixedChatTime.join(':') + ' ' + chatTime[2];

                    const id = profile.uid;

                    const seen = val?.data.seenBy[id]?.seen;

                    return (
                      <ChatItem
                        key={val.id}
                        content={val.data.chatContent}
                        date={fixedChatTime}
                        isOther={val.data.sendBy !== userData.uid}
                        photoOther={profile.photo}
                        urlDB={urlDB}
                        chatId={chat.id}
                        itemId={val.id}
                        userDataId={userData.uid}
                        chatData={chatData}
                        seen={seen}
                        onLongPress={() => {
                          setDialog(true);
                          setContentToCopy(val.data.chatContent);
                        }}
                      />
                    );
                  })}
                </View>
              );
            })}
          </ScrollView>
        </View>
        <View style={styles.send}>
          <InputChat
            onFocus={handleScrollFocus}
            value={chatContent}
            onChange={value => setChatContent(value)}
          />
          <Button onPress={handleSend} type="send-chat" />
        </View>
      </View>
    </>
  );
};

export default Chatting;

const styles = StyleSheet.create({
  content: trick => ({
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 4,
    opacity: trick,
  }),
  page: {
    backgroundColor: color.white,
    flex: 1,
    justifyContent: 'space-between',
  },
  send: {
    padding: 16,
    paddingTop: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontFamily: fonts.primary[400],
    color: color.text.secondary,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 20,
  },
});
