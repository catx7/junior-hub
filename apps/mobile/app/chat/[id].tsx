import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Send, ImageIcon, Info } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@localservices/shared';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  isRead: boolean;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const currentUserId = 'current-user'; // Replace with actual auth

  // Mock data
  const conversation = {
    id,
    job: {
      id: 'j1',
      title: 'Babysitter needed for 2 kids',
      status: 'OPEN',
    },
    otherUser: {
      id: 'u2',
      name: 'Jane Smith',
      avatar: null,
    },
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hi! I saw your job posting for a babysitter. I have 5 years of experience and am CPR certified.',
      senderId: 'u2',
      createdAt: new Date(Date.now() - 3600000),
      isRead: true,
    },
    {
      id: '2',
      content: 'That sounds great! Can you tell me more about your availability?',
      senderId: currentUserId,
      createdAt: new Date(Date.now() - 3000000),
      isRead: true,
    },
    {
      id: '3',
      content: 'I am available this Saturday from 6 PM onwards. I can also provide references if you would like.',
      senderId: 'u2',
      createdAt: new Date(Date.now() - 2400000),
      isRead: true,
    },
    {
      id: '4',
      content: 'Perfect! Saturday works for me. The job is for about 5 hours. Would $75 work for you?',
      senderId: currentUserId,
      createdAt: new Date(Date.now() - 1800000),
      isRead: true,
    },
    {
      id: '5',
      content: 'Yes, that works perfectly! Should I bring any activities for the kids?',
      senderId: 'u2',
      createdAt: new Date(Date.now() - 600000),
      isRead: false,
    },
  ]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message.trim(),
      senderId: currentUserId,
      createdAt: new Date(),
      isRead: false,
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // TODO: Send via API/Socket
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.senderId === currentUserId;
    const showAvatar = !isOwn && (index === 0 || messages[index - 1].senderId !== item.senderId);

    return (
      <View style={[styles.messageRow, isOwn && styles.messageRowOwn]}>
        {!isOwn && (
          <View style={styles.avatarSpace}>
            {showAvatar && (
              conversation.otherUser.avatar ? (
                <Image
                  source={{ uri: conversation.otherUser.avatar }}
                  style={styles.messageAvatar}
                />
              ) : (
                <View style={styles.messageAvatarPlaceholder}>
                  <Text style={styles.messageAvatarText}>
                    {conversation.otherUser.name.charAt(0)}
                  </Text>
                </View>
              )
            )}
          </View>
        )}
        <View style={[styles.messageBubble, isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther]}>
          <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, isOwn && styles.messageTimeOwn]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: conversation.otherUser.name,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push(`/job/${conversation.job.id}`)}
              style={styles.headerBtn}
            >
              <Info size={22} color={COLORS.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {/* Job Info Banner */}
        <TouchableOpacity
          style={styles.jobBanner}
          onPress={() => router.push(`/job/${conversation.job.id}`)}
        >
          <Text style={styles.jobBannerLabel}>Regarding:</Text>
          <Text style={styles.jobBannerTitle} numberOfLines={1}>
            {conversation.job.title}
          </Text>
        </TouchableOpacity>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          onLayout={() => flatListRef.current?.scrollToEnd()}
        />

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}>
            <ImageIcon size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textTertiary}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !message.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Send size={20} color={message.trim() ? COLORS.white : COLORS.textTertiary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBtn: {
    padding: SPACING.xs,
  },
  jobBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.xs,
  },
  jobBannerLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
  },
  jobBannerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary,
  },
  messagesList: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    alignItems: 'flex-end',
  },
  messageRowOwn: {
    justifyContent: 'flex-end',
  },
  avatarSpace: {
    width: 32,
    marginRight: SPACING.xs,
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  messageAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageAvatarText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.white,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  messageBubbleOwn: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'Inter-Regular',
    color: COLORS.text,
    lineHeight: 22,
  },
  messageTextOwn: {
    color: COLORS.white,
  },
  messageTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: 'Inter-Regular',
    color: COLORS.textTertiary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeOwn: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  attachBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'Inter-Regular',
    color: COLORS.text,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.backgroundSecondary,
  },
});
