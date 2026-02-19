import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import {
  MapPin,
  Calendar,
  DollarSign,
  User,
  Star,
  MessageSquare,
  Share2,
  Heart,
  X,
} from 'lucide-react-native';
import {
  COLORS,
  SERVICE_CATEGORIES,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
} from '@localservices/shared';

const { width } = Dimensions.get('window');

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data - replace with actual API call
  const job = {
    id,
    title: 'Babysitter needed for 2 kids this weekend',
    description: `Looking for an experienced babysitter for my 2 children (ages 4 and 7) this Saturday evening from 6 PM to 11 PM.

Requirements:
- Experience with young children
- CPR certified preferred
- Non-smoker
- References available

The kids are well-behaved and enjoy playing board games and watching movies. Light snacks will be provided.

Please message me with your experience and availability.`,
    budget: 75,
    category: 'BABYSITTING',
    location: 'Manhattan, NY',
    scheduledAt: 'Saturday, Jan 20, 6:00 PM',
    status: 'OPEN',
    images: [
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800',
    ],
    poster: {
      id: 'u1',
      name: 'John Smith',
      avatar: null,
      rating: 4.9,
      reviewCount: 15,
      memberSince: 'Jan 2023',
    },
    createdAt: '2 hours ago',
    offersCount: 3,
  };

  const categoryInfo = SERVICE_CATEGORIES[job.category as keyof typeof SERVICE_CATEGORIES];

  const handleSubmitOffer = async () => {
    if (!offerPrice || parseFloat(offerPrice) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setShowOfferModal(false);
      setOfferPrice('');
      setOfferMessage('');
      Alert.alert('Success', 'Your offer has been submitted!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContact = () => {
    // TODO: Create or navigate to conversation
    router.push(`/chat/new?jobId=${id}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: true,
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerBtn} onPress={() => setIsFavorite(!isFavorite)}>
                <Heart
                  size={22}
                  color={isFavorite ? COLORS.error : COLORS.white}
                  fill={isFavorite ? COLORS.error : 'transparent'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn}>
                <Share2 size={22} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
          >
            {job.images.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.image} contentFit="cover" />
            ))}
          </ScrollView>
          {job.images.length > 1 && (
            <View style={styles.pagination}>
              {job.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    currentImageIndex === index && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category & Status */}
          <View style={styles.badgeRow}>
            <View style={[styles.categoryBadge, { backgroundColor: `${categoryInfo?.color}20` }]}>
              <Text style={[styles.categoryBadgeText, { color: categoryInfo?.color }]}>
                {job.category === 'BABYSITTING'
                  ? 'Babysitting'
                  : job.category === 'HOUSE_CLEANING'
                    ? 'Cleaning'
                    : 'Food'}
              </Text>
            </View>
            <View style={[styles.statusBadge, styles.statusOpen]}>
              <Text style={styles.statusText}>Open</Text>
            </View>
          </View>

          {/* Title & Price */}
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.price}>${job.budget}</Text>

          {/* Meta Info */}
          <View style={styles.metaSection}>
            <View style={styles.metaItem}>
              <MapPin size={18} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{job.location}</Text>
            </View>
            {job.scheduledAt && (
              <View style={styles.metaItem}>
                <Calendar size={18} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{job.scheduledAt}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{job.description}</Text>
          </View>

          {/* Poster */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Posted by</Text>
            <TouchableOpacity
              style={styles.posterCard}
              onPress={() => router.push(`/user/${job.poster.id}`)}
            >
              {job.poster.avatar ? (
                <Image
                  source={{ uri: job.poster.avatar }}
                  style={styles.posterAvatar}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.posterAvatarPlaceholder}>
                  <Text style={styles.posterAvatarText}>{job.poster.name.charAt(0)}</Text>
                </View>
              )}
              <View style={styles.posterInfo}>
                <Text style={styles.posterName}>{job.poster.name}</Text>
                <View style={styles.posterRating}>
                  <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
                  <Text style={styles.posterRatingText}>
                    {job.poster.rating} ({job.poster.reviewCount} reviews)
                  </Text>
                </View>
                <Text style={styles.posterMeta}>Member since {job.poster.memberSince}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>
              {job.offersCount} offers • Posted {job.createdAt}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.contactBtn} onPress={handleContact}>
          <MessageSquare size={20} color={COLORS.primary} />
          <Text style={styles.contactBtnText}>Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.offerBtn} onPress={() => setShowOfferModal(true)}>
          <Text style={styles.offerBtnText}>Make an Offer</Text>
        </TouchableOpacity>
      </View>

      {/* Offer Modal */}
      <Modal
        visible={showOfferModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowOfferModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Make an Offer</Text>
              <TouchableOpacity onPress={() => setShowOfferModal(false)}>
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Your Price</Text>
            <View style={styles.priceInput}>
              <DollarSign size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.priceInputField}
                placeholder="0.00"
                placeholderTextColor={COLORS.textTertiary}
                value={offerPrice}
                onChangeText={setOfferPrice}
                keyboardType="decimal-pad"
              />
              <Text style={styles.currency}>USD</Text>
            </View>
            <Text style={styles.budgetHint}>Job budget: ${job.budget}</Text>

            <Text style={styles.modalLabel}>Message (Optional)</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Introduce yourself and explain why you're a good fit..."
              placeholderTextColor={COLORS.textTertiary}
              value={offerMessage}
              onChangeText={setOfferMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitOfferBtn, isSubmitting && styles.submitOfferBtnDisabled]}
              onPress={handleSubmitOffer}
              disabled={isSubmitting}
            >
              <Text style={styles.submitOfferBtnText}>
                {isSubmitting ? 'Submitting...' : 'Submit Offer'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: 300,
    backgroundColor: COLORS.backgroundSecondary,
  },
  image: {
    width,
    height: 300,
  },
  pagination: {
    position: 'absolute',
    bottom: SPACING.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  paginationDotActive: {
    backgroundColor: COLORS.white,
    width: 24,
  },
  content: {
    padding: SPACING.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  categoryBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: 'Inter-Medium',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  statusOpen: {
    backgroundColor: `${COLORS.success}20`,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: 'Inter-Medium',
    color: COLORS.success,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: 'Inter-Bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: 'Inter-Bold',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  metaSection: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  metaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  posterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.md,
  },
  posterAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  posterAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterAvatarText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.white,
  },
  posterInfo: {
    flex: 1,
  },
  posterName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.text,
  },
  posterRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  posterRatingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
  },
  posterMeta: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: 'Inter-Regular',
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  statsRow: {
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  contactBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary,
  },
  offerBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
  },
  offerBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: 'Inter-Bold',
    color: COLORS.text,
  },
  modalLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  priceInputField: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.text,
  },
  currency: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: COLORS.textSecondary,
  },
  budgetHint: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: 'Inter-Regular',
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  messageInput: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'Inter-Regular',
    color: COLORS.text,
    height: 100,
    marginBottom: SPACING.lg,
  },
  submitOfferBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  submitOfferBtnDisabled: {
    opacity: 0.6,
  },
  submitOfferBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.white,
  },
});
