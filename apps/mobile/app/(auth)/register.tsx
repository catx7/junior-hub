import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Lock, Eye, EyeOff, Check } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@localservices/shared';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
  ];

  const isPasswordValid = passwordRequirements.every((req) => req.met);
  const isFormValid =
    name.trim() && email.trim() && isPasswordValid && password === confirmPassword && agreeToTerms;

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!isPasswordValid) {
      Alert.alert('Error', 'Please meet all password requirements');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!agreeToTerms) {
      Alert.alert('Error', 'Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement Firebase Auth registration
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert('Success', 'Account created! Please check your email to verify.', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>JuniorHub</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <User size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor={COLORS.textTertiary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={COLORS.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color={COLORS.textSecondary} />
                ) : (
                  <Eye size={20} color={COLORS.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            {/* Password Requirements */}
            {password.length > 0 && (
              <View style={styles.requirements}>
                {passwordRequirements.map((req, index) => (
                  <View key={index} style={styles.requirementRow}>
                    <View style={[styles.requirementIcon, req.met && styles.requirementMet]}>
                      {req.met && <Check size={12} color={COLORS.white} />}
                    </View>
                    <Text style={[styles.requirementText, req.met && styles.requirementTextMet]}>
                      {req.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.inputContainer}>
              <Lock size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                placeholderTextColor={COLORS.textTertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? (
                  <EyeOff size={20} color={COLORS.textSecondary} />
                ) : (
                  <Eye size={20} color={COLORS.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            {/* Terms Checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
            >
              <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                {agreeToTerms && <Check size={14} color={COLORS.white} />}
              </View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.registerBtn,
                (!isFormValid || isLoading) && styles.registerBtnDisabled,
              ]}
              onPress={handleRegister}
              disabled={!isFormValid || isLoading}
            >
              <Text style={styles.registerBtnText}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  logo: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: 'Inter-Bold',
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontFamily: 'Inter-Bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
  },
  form: {
    gap: SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'Inter-Regular',
    color: COLORS.text,
  },
  requirements: {
    gap: SPACING.xs,
    paddingLeft: SPACING.xs,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  requirementIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requirementMet: {
    backgroundColor: COLORS.success,
  },
  requirementText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
  },
  requirementTextMet: {
    color: COLORS.success,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  termsText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.primary,
    fontFamily: 'Inter-Medium',
  },
  registerBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  registerBtnDisabled: {
    opacity: 0.6,
  },
  registerBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.white,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  loginText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.primary,
  },
});
