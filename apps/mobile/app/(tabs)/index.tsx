import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, MapPin, Star, ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SERVICE_CATEGORIES, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@localservices/shared';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

export default function HomeScreen() {
  const categories = Object.values(SERVICE_CATEGORIES).filter(c => c.id !== 'OTHER');

  const featuredJobs = [
    {
      id: '1',
      title: 'Babysitter needed for 2 kids',
      budget: 75,
      location: 'Manhattan, NY',
      image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400',
      category: 'BABYSITTING',
    },
    {
      id: '2',
      title: 'Deep cleaning for apartment',
      budget: 150,
      location: 'Brooklyn, NY',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
      category: 'HOUSE_CLEANING',
    },
    {
      id: '3',
      title: 'Homemade Romanian dinner',
      budget: 120,
      location: 'Queens, NY',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
      category: 'LOCAL_FOOD',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello there!</Text>
            <Text style={styles.title}>Find Local Services</Text>
          </View>
          <TouchableOpacity style={styles.avatar}>
            <Text style={styles.avatarText}>JS</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <Link href="/browse" asChild>
          <TouchableOpacity style={styles.searchBar}>
            <Search size={20} color={COLORS.textSecondary} />
            <Text style={styles.searchPlaceholder}>Search for services...</Text>
          </TouchableOpacity>
        </Link>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Link href="/browse" asChild>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See all</Text>
                <ArrowRight size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </Link>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/browse?category=${category.id}`}
                asChild
              >
                <TouchableOpacity style={styles.categoryCard}>
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: `${category.color}20` },
                    ]}
                  >
                    <Text style={[styles.categoryEmoji, { color: category.color }]}>
                      {category.id === 'BABYSITTING' ? '👶' :
                       category.id === 'HOUSE_CLEANING' ? '🏠' : '🍽️'}
                    </Text>
                  </View>
                  <Text style={styles.categoryName}>
                    {category.id === 'BABYSITTING' ? 'Babysitting' :
                     category.id === 'HOUSE_CLEANING' ? 'Cleaning' : 'Food'}
                  </Text>
                </TouchableOpacity>
              </Link>
            ))}
          </ScrollView>
        </View>

        {/* Featured Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Jobs</Text>
            <Link href="/browse" asChild>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See all</Text>
                <ArrowRight size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </Link>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.jobsContainer}
            snapToInterval={CARD_WIDTH + SPACING.md}
            decelerationRate="fast"
          >
            {featuredJobs.map((job) => (
              <Link key={job.id} href={`/job/${job.id}`} asChild>
                <TouchableOpacity style={styles.jobCard}>
                  <Image
                    source={{ uri: job.image }}
                    style={styles.jobImage}
                    contentFit="cover"
                    transition={200}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.jobGradient}
                  />
                  <View style={styles.jobContent}>
                    <View
                      style={[
                        styles.jobBadge,
                        {
                          backgroundColor:
                            SERVICE_CATEGORIES[job.category as keyof typeof SERVICE_CATEGORIES]
                              ?.color,
                        },
                      ]}
                    >
                      <Text style={styles.jobBadgeText}>
                        {job.category === 'BABYSITTING' ? 'Babysitting' :
                         job.category === 'HOUSE_CLEANING' ? 'Cleaning' : 'Food'}
                      </Text>
                    </View>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <View style={styles.jobMeta}>
                      <MapPin size={14} color={COLORS.white} />
                      <Text style={styles.jobLocation}>{job.location}</Text>
                    </View>
                    <Text style={styles.jobBudget}>${job.budget}</Text>
                  </View>
                </TouchableOpacity>
              </Link>
            ))}
          </ScrollView>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>10K+</Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>5K+</Text>
            <Text style={styles.statLabel}>Jobs Done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>4.9</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontFamily: 'Inter-Regular',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: 'Inter-Bold',
    color: COLORS.text,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  searchPlaceholder: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    fontFamily: 'Inter-Regular',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.text,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontFamily: 'Inter-Medium',
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  categoryCard: {
    alignItems: 'center',
    width: 80,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: COLORS.text,
    textAlign: 'center',
  },
  jobsContainer: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  jobCard: {
    width: CARD_WIDTH,
    height: 220,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  jobImage: {
    width: '100%',
    height: '100%',
  },
  jobGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  jobContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
  },
  jobBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.xs,
  },
  jobBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: 'Inter-Medium',
    color: COLORS.white,
  },
  jobTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  jobLocation: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: COLORS.white,
    opacity: 0.9,
  },
  jobBudget: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: 'Inter-Bold',
    color: COLORS.white,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.backgroundSecondary,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: 'Inter-Bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
