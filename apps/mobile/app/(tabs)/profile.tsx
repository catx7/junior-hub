import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  Settings,
  Edit2,
  Star,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  ChevronRight,
  LogOut,
  Bell,
  Shield,
  HelpCircle,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@localservices/shared';

export default function ProfileScreen() {
  const router = useRouter();

  // Mock user data - replace with actual auth state
  const user = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    avatar: null,
    bio: 'Reliable and experienced service provider. Always on time and ready to help!',
    location: 'Manhattan, NY',
    rating: 4.8,
    reviewCount: 24,
    jobsCompleted: 32,
    memberSince: 'Jan 2024',
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          // TODO: Implement actual logout
          router.replace('/login');
        },
      },
    ]);
  };

  const menuItems = [
    {
      id: 'my-jobs',
      icon: Briefcase,
      label: 'My Jobs',
      subtitle: 'View posted and accepted jobs',
      href: '/my-jobs',
    },
    {
      id: 'reviews',
      icon: Star,
      label: 'Reviews',
      subtitle: `${user.reviewCount} reviews received`,
      href: '/reviews',
    },
    {
      id: 'notifications',
      icon: Bell,
      label: 'Notifications',
      subtitle: 'Manage notification preferences',
      href: '/settings/notifications',
    },
    {
      id: 'security',
      icon: Shield,
      label: 'Security',
      subtitle: 'Password and account security',
      href: '/settings/security',
    },
    {
      id: 'help',
      icon: HelpCircle,
      label: 'Help & Support',
      subtitle: 'FAQ and contact support',
      href: '/help',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarSection}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
            </View>
          )}
          <Link href="/profile/edit" asChild>
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Edit2 size={16} color={COLORS.white} />
            </TouchableOpacity>
          </Link>
        </View>

        <Text style={styles.userName}>{user.name}</Text>

        <View style={styles.ratingRow}>
          <Star size={18} color={COLORS.warning} fill={COLORS.warning} />
          <Text style={styles.ratingText}>{user.rating}</Text>
          <Text style={styles.reviewCountText}>({user.reviewCount} reviews)</Text>
        </View>

        {user.bio && (
          <Text style={styles.bio} numberOfLines={2}>
            {user.bio}
          </Text>
        )}

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MapPin size={14} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{user.location}</Text>
          </View>
          <View style={styles.infoItem}>
            <Mail size={14} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{user.email}</Text>
          </View>
        </View>

        <Link href="/profile/edit" asChild>
          <TouchableOpacity style={styles.editProfileBtn}>
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.jobsCompleted}</Text>
          <Text style={styles.statLabel}>Jobs Done</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.rating}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.memberSince}</Text>
          <Text style={styles.statLabel}>Member Since</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item) => (
          <Link key={item.id} href={item.href as any} asChild>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <item.icon size={22} color={COLORS.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>
          </Link>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut size={20} color={COLORS.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.versionText}>JuniorHub v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarSection: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontFamily: 'Inter-Bold',
    color: COLORS.white,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: 'Inter-Bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.text,
  },
  reviewCountText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
  },
  bio: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
  },
  editProfileBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editProfileBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.lg,
    marginTop: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: 'Inter-Bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  menuSection: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'Inter-Medium',
    color: COLORS.text,
  },
  menuSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  logoutText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'Inter-Medium',
    color: COLORS.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  versionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: 'Inter-Regular',
    color: COLORS.textTertiary,
  },
});
