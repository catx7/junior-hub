import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { MapPin, Camera, X, DollarSign, Calendar } from 'lucide-react-native';
import { COLORS, SERVICE_CATEGORIES, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@localservices/shared';

type Category = keyof typeof SERVICE_CATEGORIES;

export default function PostJobScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = Object.values(SERVICE_CATEGORIES).filter(c => c.id !== 'OTHER');

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can upload up to 5 images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!budget || parseFloat(budget) <= 0) {
      Alert.alert('Error', 'Please enter a valid budget');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Success', 'Your job has been posted!', [
        { text: 'OK', onPress: () => router.push('/browse') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  category === cat.id && {
                    borderColor: cat.color,
                    backgroundColor: `${cat.color}10`,
                  },
                ]}
                onPress={() => setCategory(cat.id as Category)}
              >
                <Text style={styles.categoryEmoji}>
                  {cat.id === 'BABYSITTING' ? '👶' :
                   cat.id === 'HOUSE_CLEANING' ? '🏠' : '🍽️'}
                </Text>
                <Text style={[
                  styles.categoryLabel,
                  category === cat.id && { color: cat.color },
                ]}>
                  {cat.id === 'BABYSITTING' ? 'Babysitting' :
                   cat.id === 'HOUSE_CLEANING' ? 'Cleaning' : 'Food'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Need a babysitter for 2 kids"
            placeholderTextColor={COLORS.textTertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe what you need in detail..."
            placeholderTextColor={COLORS.textTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={2000}
          />
          <Text style={styles.charCount}>{description.length}/2000</Text>
        </View>

        {/* Budget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget</Text>
          <View style={styles.inputWithIcon}>
            <DollarSign size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.inputInner}
              placeholder="0.00"
              placeholderTextColor={COLORS.textTertiary}
              value={budget}
              onChangeText={setBudget}
              keyboardType="decimal-pad"
            />
            <Text style={styles.currency}>USD</Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity style={styles.inputWithIcon}>
            <MapPin size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.inputInner}
              placeholder="Enter address or use current location"
              placeholderTextColor={COLORS.textTertiary}
              value={location}
              onChangeText={setLocation}
            />
          </TouchableOpacity>
        </View>

        {/* Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos (Optional)</Text>
          <Text style={styles.sectionSubtitle}>Add up to 5 photos</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imagesContainer}
          >
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.uploadedImage} contentFit="cover" />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => removeImage(index)}
                >
                  <X size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                <Camera size={24} color={COLORS.textSecondary} />
                <Text style={styles.addImageText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitBtnText}>
            {isSubmitting ? 'Posting...' : 'Post Job'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING['3xl'],
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
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  categoryCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  categoryLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'Inter-Regular',
    color: COLORS.text,
  },
  textArea: {
    height: 120,
    paddingTop: SPACING.sm + 2,
  },
  charCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: 'Inter-Regular',
    color: COLORS.textTertiary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  inputInner: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'Inter-Regular',
    color: COLORS.text,
  },
  currency: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: COLORS.textSecondary,
  },
  imagesContainer: {
    gap: SPACING.sm,
  },
  imageWrapper: {
    position: 'relative',
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.lg,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageBtn: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  addImageText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: 'Inter-Medium',
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.white,
  },
});
