import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  FlatList,
} from 'react-native';
import {
  Text,
  Surface,
  TextInput,
  Avatar,
  Chip,
} from 'react-native-paper';
import { useLLM } from '../../contexts/LLMContext';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  FadeInDown,
  FadeOutUp,
  SlideInRight,
  Layout,
} from 'react-native-reanimated';
import { Colors } from '../../theme';

const quickOptions = [
  { id: 'pain', text: 'I am in pain', icon: 'bandage' },
  { id: 'medication', text: 'Need medication', icon: 'pill' },
  { id: 'nurse', text: 'Call nurse', icon: 'doctor' },
  { id: 'emergency', text: 'Emergency', icon: 'alert' },
];

export default function ChatScreen() {
  const { messages, sendMessage, isTyping } = useLLM();
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const keyboardDidShow = () => setShowSuggestions(false);
    const keyboardDidHide = () => {
      if (!inputText.trim()) setShowSuggestions(true);
    };

    const showSubscription = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
    const hideSubscription = Keyboard.addListener('keyboardDidHide', keyboardDidHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [inputText]);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText.trim());
      setInputText('');
      setShowSuggestions(true);
    }
  };

  const handleQuickOption = (option) => {
    sendMessage(option.text);
    setShowSuggestions(false);
  };

  const renderMessage = ({ item, index }) => {
    let displayText = item.text;

    try {
      const messageData = JSON.parse(item.text);
      if (messageData.response) displayText = messageData.response;
    } catch (error) {
      // Not a JSON object, fallback to plain text
    }

    return (
      <Animated.View
        entering={SlideInRight.delay(index * 100)}
        layout={Layout.springify()}
        style={[
          styles.messageContainer,
          item.isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        {!item.isUser && <Avatar.Icon size={32} icon="robot" style={styles.avatar} />}
        <Surface
          style={[
            styles.messageBubble,
            item.isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              item.isUser ? styles.userMessageText : styles.assistantMessageText,
            ]}
          >
            {displayText}
          </Text>
        </Surface>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.primary, Colors.secondary] as const}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Medical Assistant</Text>
            <Avatar.Icon size={40} icon="robot" color="#fff" style={{ backgroundColor: Colors.primary }} />
          </View>
        </BlurView>
      </LinearGradient>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListFooterComponent={
          isTyping ? (
            <Animated.View
              entering={FadeInDown}
              exiting={FadeOutUp}
              style={styles.typingIndicator}
            >
              <Surface style={styles.typingBubble}>
                <Text style={styles.typingText}>AI is typing</Text>
                <View style={styles.dotContainer}>
                  {[0, 1, 2].map((dot) => (
                    <View key={dot} style={styles.typingDot} />
                  ))}
                </View>
              </Surface>
            </Animated.View>
          ) : null
        }
      />

      {showSuggestions && (
        <Animated.View
          entering={FadeInDown}
          exiting={FadeOutUp}
          style={styles.suggestionsContainer}
        >
          <FlatList
            horizontal
            data={quickOptions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Chip
                icon={() => <Icon name={item.icon} size={20} color={Colors.primary} />}
                onPress={() => handleQuickOption(item)}
                style={styles.suggestionChip}
                mode="outlined"
              >
                {item.text}
              </Chip>
            )}
            contentContainerStyle={styles.suggestionsScroll}
            showsHorizontalScrollIndicator={false}
          />
        </Animated.View>
      )}

      <Surface style={styles.inputContainer}>
        <TextInput
          mode="flat"
          placeholder="Type your message..."
          value={inputText}
          onChangeText={setInputText}
          style={styles.input}
          right={<TextInput.Icon icon="send" disabled={!inputText.trim()} onPress={handleSend} />}
        />
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerBlur: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.secondary,
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  assistantMessageText: {
    color: Colors.text,
  },
  typingIndicator: {
    marginLeft: 48,
    marginBottom: 16,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    maxWidth: 100,
  },
  typingText: {
    fontSize: 14,
    color: Colors.mutedText,
    marginRight: 8,
  },
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.mutedText,
    marginHorizontal: 2,
    opacity: 0.6,
  },
  suggestionsContainer: {
    padding: 8,
  },
  suggestionsScroll: {
    paddingHorizontal: 8,
  },
  suggestionChip: {
    marginHorizontal: 4,
    borderColor: Colors.primary,
  },
  inputContainer: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    backgroundColor: '#fff',
  },
});
