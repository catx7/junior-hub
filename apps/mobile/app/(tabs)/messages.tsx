import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { MessageSquare } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@localservices/shared';

interface Conversation {
  id: string;
  jobTitle: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    isRead: boolean;
  };
}

export default function MessagesScreen() {
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - replace with actual API call
  const conversations: Conversation[] = [
    {
      id: '1',
      jobTitle: 'Babysitter needed for 2 kids',
      otherUser: {
        id: 'u1',
        name: 'Jane Smith',
        avatar: null,
      },
      lastMessage: {
        content: 'Hi! I am interested in the babysitting job.',
        createdAt: '2 min ago',
        isRead: false,
      },
    },
    {
      id: '2',
      jobTitle: 'Deep cleaning for apartment',
      otherUser: {
        id: 'u2',
        name: 'Mike Johnson',
        avatar: null,
      },
      lastMessage: {
        content: 'When would you like me to come?',
        createdAt: '1 hour ago',
        isRead: true,
      },
    },
    {
      id: '3',
      jobTitle: 'Homemade Romanian dinner',
      otherUser: {
        id: 'u3',
        name: 'Elena Popescu',
        avatar: null,
      },
      lastMessage: {
        content: 'I can prepare sarmale and mici for your dinner party!',
        createdAt: 'Yesterday',
        isRead: true,
      },
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch conversations from API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <Link href={`/chat/${item.id}`} asChild>
      <TouchableOpacity style={styles.conversationCard}>
        <View style={styles.avatarContainer}>
          {item.otherUser.avatar ? (
            <Image
              source={{ uri: item.otherUser.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.otherUser.name.charAt(0)}
              </Text>
            </View>
          )}
          {!item.lastMessage.isRead && <View style={styles.unreadBadge} />}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.otherUser.name}
            </Text>
            <Text style={styles.timestamp}>{item.lastMessage.createdAt}</Text>
          </View>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {item.jobTitle}
          </Text>
          <Text
            style={[
              styles.lastMessage,
              !item.lastMessage.isRead && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {item.lastMessage.content}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MessageSquare size={64} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>
              When you connect with service providers, your conversations will appear here
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    flexGrow: 1,
  },
  conversationCard: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    gap: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.white,
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: 'Inter-Regular',
    color: COLORS.textTertiary,
  },
  jobTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
  },
  unreadMessage: {
    fontFamily: 'Inter-Medium',
    color: COLORS.text,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 56 + SPACING.md * 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING['3xl'],
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    lineHeight: 20,
  },
});
