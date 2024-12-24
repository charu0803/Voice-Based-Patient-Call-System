import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Surface,
  Text,
  TextInput,
  IconButton,
  Avatar,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { messageApi, Message, User } from '../../services/api';
import { Socket } from 'socket.io-client';
import io from 'socket.io-client';
import { CONFIG } from '../../config/environment';
import { Colors } from '../../theme'; // Import Colors

interface SocketMessage extends Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  messageType: 'text' | 'image';
  imageUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export default function MessagesScreen() {
  const [messages, setMessages] = useState<SocketMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [nurses, setNurses] = useState<User[]>([]);
  const [selectedNurse, setSelectedNurse] = useState<User | null>(null);
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const setupSocket = useCallback(() => {
    try {
      socketRef.current = io(CONFIG.API_URL, {
        auth: { token: user?.token },
      });

      socketRef.current.on('connect', () => console.log('Socket connected'));
      socketRef.current.on('disconnect', () => console.log('Socket disconnected'));
      socketRef.current.on('newMessage', (message: SocketMessage) => {
        setMessages((prev) =>
          prev.some((m) => m._id === message._id) ? prev : [message, ...prev]
        );
        if (selectedNurse && message.sender === selectedNurse._id) {
          markMessageAsRead(message._id);
        }
      });
    } catch (error) {
      Alert.alert('Connection Error', 'Failed to initialize chat connection');
    }
  }, [user, selectedNurse]);

  useEffect(() => {
    setupSocket();
    fetchNurses();
    return () => {
      socketRef.current?.disconnect();
    };
  }, [setupSocket]);

  const fetchNurses = async () => {
    try {
      const data = await messageApi.getNurses();
      setNurses(data.filter((nurse) => nurse._id !== user?._id));
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch nurses');
    }
  };

  const fetchMessages = async (nurseId: string) => {
    try {
      const data = await messageApi.getConversation(nurseId);
      setMessages(data);
      data.forEach((msg) => {
        if (!msg.isRead && msg.sender === nurseId) {
          markMessageAsRead(msg._id);
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch messages');
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await messageApi.markMessageAsRead(messageId);
      socketRef.current?.emit('messageRead', { messageId });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!selectedNurse || !content.trim()) return;

    try {
      const response = await messageApi.sendMessage({
        receiver: selectedNurse._id,
        content: content.trim(),
        messageType: 'text',
      });

      setMessages((prev) => [
        {
          _id: response._id,
          sender: user?._id || '',
          receiver: selectedNurse._id,
          content: content.trim(),
          messageType: 'text',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setMessageText('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const renderMessage = ({ item }: { item: SocketMessage }) => {
    const isOwnMessage = item.sender === user?._id;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        {!isOwnMessage && <Avatar.Text size={32} label="NU" style={styles.avatar} />}
        <Surface
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownBubble : styles.otherBubble,
          ]}
        >
          {item.messageType === 'image' ? (
            <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
          ) : (
            <Text style={styles.messageText}>{item.content}</Text>
          )}
        </Surface>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.nurseList}>
        <FlatList
          horizontal
          data={nurses}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.nurseItem,
                selectedNurse?._id === item._id && styles.selectedNurse,
              ]}
              onPress={() => {
                setSelectedNurse(item);
                fetchMessages(item._id);
              }}
            >
              <Avatar.Text size={40} label={`${item.firstName[0]}${item.lastName[0]}`} />
              <Text style={styles.nurseName}>{item.firstName} {item.lastName}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.nurseListContent}
        />
      </View>

      {selectedNurse ? (
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.messagesList}
            inverted
          />
          <View style={styles.inputContainer}>
            <TextInput
              mode="outlined"
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message..."
              style={styles.input}
            />
            <IconButton
              icon="send"
              size={24}
              onPress={() => messageText.trim() && sendMessage(messageText.trim())}
              style={styles.sendButton}
              iconColor={Colors.primary}
            />
          </View>
        </>
      ) : (
        <View style={styles.selectNursePrompt}>
          <Text style={styles.promptText}>Select a nurse to start messaging</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  nurseList: {
    backgroundColor: Colors.secondary,
    paddingVertical: 8,
  },
  nurseListContent: {
    paddingHorizontal: 16,
  },
  nurseItem: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  selectedNurse: {
    backgroundColor: Colors.border,
  },
  nurseName: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.text,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginRight: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '70%',
  },
  ownBubble: {
    backgroundColor: Colors.primary,
  },
  otherBubble: {
    backgroundColor: Colors.secondary,
  },
  messageText: {
    fontSize: 16,
    color: Colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: Colors.background,
  },
  input: {
    flex: 1,
  },
  sendButton: {
    marginLeft: 8,
  },
  selectNursePrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptText: {
    color: Colors.text,
    fontSize: 16,
  },
});
