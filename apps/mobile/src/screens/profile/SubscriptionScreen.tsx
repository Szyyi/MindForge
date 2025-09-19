// src/screens/profile/SubscriptionScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type PlanType = 'free' | 'pro' | 'lifetime';
type BillingPeriod = 'monthly' | 'yearly';

interface Feature {
  text: string;
  included: boolean;
}

interface Plan {
  id: PlanType;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  savings?: number;
  features: Feature[];
  highlighted?: boolean;
  badge?: string;
}

export default function SubscriptionScreen() {
  const navigation = useNavigation<any>();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('pro');
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('yearly');
  const [currentPlan] = useState<PlanType>('free'); // User's current plan

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: {
        monthly: 0,
        yearly: 0,
      },
      features: [
        { text: '2 skill categories', included: true },
        { text: '50 cards per month', included: true },
        { text: 'Basic review features', included: true },
        { text: 'Progress tracking', included: true },
        { text: 'Unlimited categories', included: false },
        { text: 'AI-powered generation', included: false },
        { text: 'Offline mode', included: false },
        { text: 'Advanced analytics', included: false },
        { text: 'Priority support', included: false },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: {
        monthly: 9.99,
        yearly: 89.99,
      },
      savings: 25,
      highlighted: true,
      badge: 'MOST POPULAR',
      features: [
        { text: 'Unlimited skill categories', included: true },
        { text: 'Unlimited cards', included: true },
        { text: 'AI-powered generation', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Offline mode with sync', included: true },
        { text: 'Custom review schedules', included: true },
        { text: 'Export capabilities', included: true },
        { text: 'Priority processing', included: true },
        { text: 'Priority support', included: true },
      ],
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: {
        monthly: 299.99,
        yearly: 299.99,
      },
      badge: 'ONE-TIME',
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Lifetime updates', included: true },
        { text: 'Early access features', included: true },
        { text: 'Custom themes', included: true },
        { text: 'API access', included: true },
        { text: 'Dedicated support', included: true },
        { text: 'Support development', included: true },
      ],
    },
  ];

  const handlePlanSelect = (planId: PlanType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(planId);
  };

  const handleBillingToggle = (period: BillingPeriod) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBillingPeriod(period);
  };

  const handleSubscribe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const plan = plans.find(p => p.id === selectedPlan);
    if (plan) {
      // Handle subscription
      Alert.alert(
        'Subscribe to ' + plan.name,
        `You're about to subscribe to ${plan.name} for £${
          plan.id === 'lifetime' 
            ? plan.price.monthly 
            : plan.price[billingPeriod]
        }${plan.id !== 'lifetime' ? `/${billingPeriod === 'monthly' ? 'month' : 'year'}` : ''}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Subscribe', 
            style: 'default',
            onPress: () => {
              // Process payment
              navigation.goBack();
            }
          },
        ]
      );
    }
  };

  const handleRestorePurchases = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Handle restore purchases
  };

  const renderPlanCard = (plan: Plan) => {
    const isSelected = selectedPlan === plan.id;
    const isCurrent = currentPlan === plan.id;
    const price = plan.id === 'lifetime' 
      ? plan.price.monthly 
      : plan.price[billingPeriod];
    
    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planCard,
          isSelected && styles.planCardSelected,
          plan.highlighted && styles.planCardHighlighted,
        ]}
        onPress={() => handlePlanSelect(plan.id)}
        activeOpacity={0.7}
      >
        {/* Badge */}
        {(plan.badge || isCurrent) && (
          <View style={[
            styles.badge,
            isCurrent && styles.badgeCurrent,
            plan.badge === 'MOST POPULAR' && styles.badgePopular,
          ]}>
            <Text style={styles.badgeText}>
              {isCurrent ? 'CURRENT PLAN' : plan.badge}
            </Text>
          </View>
        )}

        {/* Plan Header */}
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name.toUpperCase()}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceSymbol}>£</Text>
            <Text style={styles.priceAmount}>{price}</Text>
            {plan.id !== 'lifetime' && plan.id !== 'free' && (
              <Text style={styles.pricePeriod}>
                /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
              </Text>
            )}
          </View>
          {plan.savings && billingPeriod === 'yearly' && (
            <Text style={styles.savingsText}>Save {plan.savings}%</Text>
          )}
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons
                name={feature.included ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={feature.included ? '#10B981' : 'rgba(255, 255, 255, 0.2)'}
              />
              <Text style={[
                styles.featureText,
                !feature.included && styles.featureTextDisabled,
              ]}>
                {feature.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Selection Indicator */}
        <View style={[
          styles.selectionIndicator,
          isSelected && styles.selectionIndicatorActive,
        ]}>
          {isSelected && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0A0F']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Text style={styles.title}>Upgrade to Pro</Text>
              <Text style={styles.subtitle}>Unlock your full learning potential</Text>
            </View>
          </View>

          {/* Value Proposition */}
          <View style={styles.valueCard}>
            <LinearGradient
              colors={['rgba(0, 102, 255, 0.1)', 'rgba(0, 212, 255, 0.05)'] as [string, string]}
              style={styles.valueGradient}
            >
              <Ionicons name="sparkles" size={32} color="#00D4FF" />
              <Text style={styles.valueTitle}>Learn 3x Faster</Text>
              <Text style={styles.valueText}>
                Pro users retain 85% more information with AI-powered review schedules and unlimited content
              </Text>
            </LinearGradient>
          </View>

          {/* Billing Toggle */}
          {selectedPlan !== 'lifetime' && selectedPlan !== 'free' && (
            <View style={styles.billingToggle}>
              <TouchableOpacity
                style={[
                  styles.billingOption,
                  billingPeriod === 'monthly' && styles.billingOptionActive,
                ]}
                onPress={() => handleBillingToggle('monthly')}
              >
                <Text style={[
                  styles.billingText,
                  billingPeriod === 'monthly' && styles.billingTextActive,
                ]}>
                  Monthly
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.billingOption,
                  billingPeriod === 'yearly' && styles.billingOptionActive,
                ]}
                onPress={() => handleBillingToggle('yearly')}
              >
                <Text style={[
                  styles.billingText,
                  billingPeriod === 'yearly' && styles.billingTextActive,
                ]}>
                  Yearly
                </Text>
                {billingPeriod === 'yearly' && (
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveBadgeText}>SAVE 25%</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Plans */}
          <View style={styles.plansContainer}>
            {plans.map(renderPlanCard)}
          </View>

          {/* Trust Badges */}
          <View style={styles.trustSection}>
            <View style={styles.trustItem}>
              <Ionicons name="lock-closed" size={16} color="rgba(255, 255, 255, 0.3)" />
              <Text style={styles.trustText}>Secure payment</Text>
            </View>
            <View style={styles.trustItem}>
              <Ionicons name="refresh" size={16} color="rgba(255, 255, 255, 0.3)" />
              <Text style={styles.trustText}>Cancel anytime</Text>
            </View>
            <View style={styles.trustItem}>
              <Ionicons name="shield-checkmark" size={16} color="rgba(255, 255, 255, 0.3)" />
              <Text style={styles.trustText}>7-day trial</Text>
            </View>
          </View>

          {/* Subscribe Button */}
          {selectedPlan !== currentPlan && (
            <TouchableOpacity 
              style={styles.subscribeButton}
              onPress={handleSubscribe}
            >
              <LinearGradient
                colors={['#0066FF', '#0052CC'] as [string, string]}
                style={styles.subscribeGradient}
              >
                <Text style={styles.subscribeText}>
                  {selectedPlan === 'free' ? 'DOWNGRADE TO FREE' : 'UPGRADE NOW'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Restore Purchases */}
          <TouchableOpacity 
            style={styles.restoreButton}
            onPress={handleRestorePurchases}
          >
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>

          {/* Terms */}
          <View style={styles.terms}>
            <Text style={styles.termsText}>
              By subscribing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: spacing.xs,
  },
  valueCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: spacing.borderRadius.medium,
    overflow: 'hidden',
  },
  valueGradient: {
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.1)',
    borderRadius: spacing.borderRadius.medium,
  },
  valueTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '400',
    color: '#FFFFFF',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  valueText: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: typography.fontSize.sm * 1.5,
  },
  billingToggle: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: spacing.borderRadius.medium,
    padding: 4,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  billingOption: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: spacing.borderRadius.medium - 4,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  billingOptionActive: {
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
  },
  billingText: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  billingTextActive: {
    color: '#0066FF',
  },
  saveBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.small,
  },
  saveBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  plansContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: spacing.borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#0066FF',
    backgroundColor: 'rgba(0, 102, 255, 0.05)',
  },
  planCardHighlighted: {
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: spacing.borderRadius.small,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeCurrent: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
  },
  badgePopular: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderColor: '#00D4FF',
  },
  badgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 1,
  },
  planHeader: {
    marginBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  planName: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceSymbol: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255, 255, 255, 0.5)',
    marginRight: 2,
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: '200',
    color: '#FFFFFF',
  },
  pricePeriod: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: spacing.xs,
  },
  savingsText: {
    fontSize: typography.fontSize.xs,
    color: '#10B981',
    marginTop: spacing.xs,
  },
  featuresContainer: {
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    flex: 1,
  },
  featureTextDisabled: {
    color: 'rgba(255, 255, 255, 0.3)',
    textDecorationLine: 'line-through',
  },
  selectionIndicator: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionIndicatorActive: {
    backgroundColor: '#0066FF',
    borderColor: '#0066FF',
  },
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  trustText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  subscribeButton: {
    marginHorizontal: spacing.lg,
    borderRadius: spacing.borderRadius.medium,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  subscribeGradient: {
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  subscribeText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  restoreText: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(0, 212, 255, 0.7)',
  },
  terms: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  termsText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.3)',
    textAlign: 'center',
    lineHeight: typography.fontSize.xs * 1.5,
  },
  termsLink: {
    color: 'rgba(0, 212, 255, 0.7)',
    textDecorationLine: 'underline',
  },
});