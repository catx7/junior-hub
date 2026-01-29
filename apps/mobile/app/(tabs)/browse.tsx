import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Search, MapPin, Filter, SlidersHorizontal } from 'lucide-react-native';
import { COLORS, SERVICE_CATEGORIES, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@localservices/shared';

export default function BrowseScreen() {
  const params = useLocalSearchParams();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(params.category || '');
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { id: '', label: 'All' },
    ...Object.values(SERVICE_CATEGORIES).map((c) => ({
      id: c.id,
      label: c.id === 'BABYSITTING' ? 'Babysitting' :
             c.id === 'HOUSE_CLEANING' ? 'Cleaning' :
             c.id === 'LOCAL_FOOD' ? 'Food' : 'Other',
    })),
  ];

  const jobs = [
    {
      id: '1',
      title: 'Babysitter needed for 2 kids this weekend',
      description: 'Looking for an experienced babysitter...',
      budget: 75,
      location: 'Manhattan, NY',
      image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400',
      category: 'BABYSITTING',
      posterName: 'John Smith',
      posterAvatar: null,
      postedAt: '2h ago',
    },
    {
      id: '2',
      title: 'Deep cleaning for 2-bedroom apartment',
      description: 'Need a thorough deep cleaning...',
      budget: 150,
      location: 'Brooklyn, NY',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
      category: 'HOUSE_CLEANING',
      posterName: 'Jane Doe',
      posterAvatar: null,
      postedAt: '5h ago',
    },
    {
      id: '3',
      title: 'Homemade Romanian dinner for 6',
      description: 'Looking for someone to prepare...',
      budget: 120,
      location: 'Queens, NY',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
      category: 'LOCAL_FOOD',
      posterName: 'Alex Johnson',
      posterAvatar: null,
      postedAt: '1d ago',
    },
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchesCategory = !selectedCategory || job.category === selectedCategory;
    const matchesSearch =
      !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const renderJob = ({ item }: { item: typeof jobs[0] }) => (
    <Link href={`/job/${item.id}`} asChild>
      <TouchableOpacity style={styles.jobCard}>
        <Image
          source={{ uri: item.image }}
          style={styles.jobImage}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.jobContent}>
          <View style={styles.jobHeader}>
            <View
              style={[
                styles.categoryBadge,
                {
                  backgroundColor: `${
                    SERVICE_CATEGORIES[item.category as keyof typeof SERVICE_CATEGORIES]
                      ?.color
                  }20`,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryBadgeText,
                  {
                    color:
                      SERVICE_CATEGORIES[item.category as keyof typeof SERVICE_CATEGORIES]
                        ?.color,
                  },
                ]}
              >
                {item.category === 'BABYSITTING' ? 'Babysitting' :
                 item.category === 'HOUSE_CLEANING' ? 'Cleaning' : 'Food'}
              </Text>
            </View>
            <Text style={styles.jobBudget}>${item.budget}</Text>
          </View>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.jobLocation}>
            <MapPin size={14} color={COLORS.textSecondary} />
            <Text style={styles.jobLocationText}>{item.location}</Text>
          </View>
          <View style={styles.jobFooter}>
            <View style={styles.posterInfo}>
              <View style={styles.posterAvatar}>
                <Text style={styles.posterAvatarText}>
                  {item.posterName.charAt(0)}
                </Text>
              </View>
              <Text style={styles.posterName}>{item.posterName}</Text>
            </View>
            <Text style={styles.postedAt}>{item.postedAt}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for services..."
            placeholderTextColor={COLORS.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <SlidersHorizontal size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === item.id && styles.categoryChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Job List */}
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        renderItem={renderJob}
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
            <Search size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No jobs found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'Inter-Regular',
    color: COLORS.text,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.backgroundSecondary,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  listContainer: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  jobCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  jobImage: {
    width: '100%',
    height: 160,
  },
  jobContent: {
    padding: SPACING.md,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
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
  jobBudget: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: 'Inter-Bold',
    color: COLORS.primary,
  },
  jobTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  jobLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  jobLocationText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  posterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  posterAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterAvatarText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.white,
  },
  posterName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: COLORS.textSecondary,
  },
  postedAt: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: 'Inter-Regular',
    color: COLORS.textTertiary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: SPACING.xs,
  },
});
