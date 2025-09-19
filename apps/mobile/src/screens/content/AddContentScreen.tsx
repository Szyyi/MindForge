// src/screens/content/AddContentScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type ContentSource = 'url' | 'file' | 'manual' | null;

export default function AddContentScreen() {
  const navigation = useNavigation<any>();
  const [selectedSource, setSelectedSource] = useState<ContentSource>(null);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<any>(null);

  const handleSourceSelect = (source: ContentSource) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSource(source);
    // Reset other fields when switching source
    setUrl('');
    setTitle('');
    setContent('');
    setUploadedFile(null);
  };

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/epub+zip'],
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets[0]) {
        setUploadedFile(result.assets[0]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      navigation.navigate('ContentDetails', { 
        contentId: 'new-content',
        source: selectedSource 
      });
    }, 2000);
  };

  const canProcess = () => {
    if (!selectedSource) return false;
    if (selectedSource === 'url' && !url) return false;
    if (selectedSource === 'file' && !uploadedFile) return false;
    if (selectedSource === 'manual' && (!title || !content)) return false;
    return true;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0A0F']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
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
                <Text style={styles.title}>Add Content</Text>
                <Text style={styles.subtitle}>Import material to study</Text>
              </View>
            </View>

            {/* Source Selection */}
            <View style={styles.sourceSection}>
              <Text style={styles.sectionTitle}>CHOOSE SOURCE</Text>
              
              <View style={styles.sourceGrid}>
                <TouchableOpacity
                  style={[
                    styles.sourceCard,
                    selectedSource === 'url' && styles.sourceCardActive
                  ]}
                  onPress={() => handleSourceSelect('url')}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.sourceIcon,
                    selectedSource === 'url' && styles.sourceIconActive
                  ]}>
                    <Ionicons 
                      name="link" 
                      size={24} 
                      color={selectedSource === 'url' ? '#0066FF' : 'rgba(255, 255, 255, 0.3)'} 
                    />
                  </View>
                  <Text style={[
                    styles.sourceLabel,
                    selectedSource === 'url' && styles.sourceLabelActive
                  ]}>WEB URL</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sourceCard,
                    selectedSource === 'file' && styles.sourceCardActive
                  ]}
                  onPress={() => handleSourceSelect('file')}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.sourceIcon,
                    selectedSource === 'file' && styles.sourceIconActive
                  ]}>
                    <Ionicons 
                      name="document-text" 
                      size={24} 
                      color={selectedSource === 'file' ? '#0066FF' : 'rgba(255, 255, 255, 0.3)'} 
                    />
                  </View>
                  <Text style={[
                    styles.sourceLabel,
                    selectedSource === 'file' && styles.sourceLabelActive
                  ]}>DOCUMENT</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sourceCard,
                    selectedSource === 'manual' && styles.sourceCardActive
                  ]}
                  onPress={() => handleSourceSelect('manual')}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.sourceIcon,
                    selectedSource === 'manual' && styles.sourceIconActive
                  ]}>
                    <Ionicons 
                      name="create" 
                      size={24} 
                      color={selectedSource === 'manual' ? '#0066FF' : 'rgba(255, 255, 255, 0.3)'} 
                    />
                  </View>
                  <Text style={[
                    styles.sourceLabel,
                    selectedSource === 'manual' && styles.sourceLabelActive
                  ]}>MANUAL</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Input Fields based on selected source */}
            {selectedSource && (
              <View style={styles.inputSection}>
                {selectedSource === 'url' && (
                  <>
                    <Text style={styles.inputLabel}>WEBSITE URL</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="https://example.com/article"
                        placeholderTextColor="rgba(255, 255, 255, 0.2)"
                        value={url}
                        onChangeText={setUrl}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="url"
                      />
                    </View>
                  </>
                )}

                {selectedSource === 'file' && (
                  <>
                    <Text style={styles.inputLabel}>UPLOAD DOCUMENT</Text>
                    <TouchableOpacity 
                      style={styles.uploadButton}
                      onPress={handleFileUpload}
                    >
                      {uploadedFile ? (
                        <View style={styles.uploadedFile}>
                          <Ionicons name="document-attach" size={24} color="#00D4FF" />
                          <Text style={styles.fileName} numberOfLines={1}>
                            {uploadedFile.name}
                          </Text>
                          <TouchableOpacity onPress={() => setUploadedFile(null)}>
                            <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.3)" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.uploadPlaceholder}>
                          <Ionicons name="cloud-upload" size={32} color="rgba(255, 255, 255, 0.2)" />
                          <Text style={styles.uploadText}>Tap to upload PDF, TXT, or EPUB</Text>
                          <Text style={styles.uploadSubtext}>Max size: 10MB</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </>
                )}

                {selectedSource === 'manual' && (
                  <>
                    <Text style={styles.inputLabel}>TITLE</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter content title"
                        placeholderTextColor="rgba(255, 255, 255, 0.2)"
                        value={title}
                        onChangeText={setTitle}
                        autoCapitalize="sentences"
                      />
                    </View>

                    <Text style={[styles.inputLabel, { marginTop: spacing.lg }]}>CONTENT</Text>
                    <View style={[styles.inputContainer, styles.textAreaContainer]}>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Paste or type your content here..."
                        placeholderTextColor="rgba(255, 255, 255, 0.2)"
                        value={content}
                        onChangeText={setContent}
                        multiline
                        textAlignVertical="top"
                      />
                    </View>
                  </>
                )}

                {/* Category Selection */}
                <Text style={[styles.inputLabel, { marginTop: spacing.lg }]}>CATEGORY</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Select or create category"
                    placeholderTextColor="rgba(255, 255, 255, 0.2)"
                    value={category}
                    onChangeText={setCategory}
                    autoCapitalize="words"
                  />
                  <Ionicons 
                    name="chevron-down" 
                    size={20} 
                    color="rgba(255, 255, 255, 0.2)" 
                    style={styles.inputIcon}
                  />
                </View>
              </View>
            )}

            {/* Processing Options */}
            {selectedSource && (
              <View style={styles.optionsSection}>
                <Text style={styles.sectionTitle}>PROCESSING OPTIONS</Text>
                
                <TouchableOpacity style={styles.optionItem}>
                  <View style={styles.optionLeft}>
                    <Ionicons name="time" size={20} color="rgba(255, 255, 255, 0.3)" />
                    <Text style={styles.optionText}>Session Duration</Text>
                  </View>
                  <Text style={styles.optionValue}>5 minutes</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionItem}>
                  <View style={styles.optionLeft}>
                    <Ionicons name="analytics" size={20} color="rgba(255, 255, 255, 0.3)" />
                    <Text style={styles.optionText}>Difficulty Level</Text>
                  </View>
                  <Text style={styles.optionValue}>Auto</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionItem}>
                  <View style={styles.optionLeft}>
                    <Ionicons name="refresh" size={20} color="rgba(255, 255, 255, 0.3)" />
                    <Text style={styles.optionText}>Review Frequency</Text>
                  </View>
                  <Text style={styles.optionValue}>Optimal</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Process Button */}
            {selectedSource && (
              <TouchableOpacity 
                style={[styles.processButton, !canProcess() && styles.processButtonDisabled]}
                onPress={handleProcess}
                disabled={!canProcess() || isProcessing}
              >
                <LinearGradient
                  colors={canProcess() ? ['#0066FF', '#0052CC'] : ['#1a1a1a', '#1a1a1a'] as [string, string]}
                  style={styles.processGradient}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                      <Text style={styles.processText}>PROCESS CONTENT</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
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
  sourceSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  sourceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sourceCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: spacing.borderRadius.medium,
    padding: spacing.lg,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  sourceCardActive: {
    backgroundColor: 'rgba(0, 102, 255, 0.05)',
    borderColor: '#0066FF',
  },
  sourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sourceIconActive: {
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
  },
  sourceLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
  },
  sourceLabelActive: {
    color: '#0066FF',
  },
  inputSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxl,
  },
  inputLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: spacing.borderRadius.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: '#FFFFFF',
    padding: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.md,
  },
  textAreaContainer: {
    height: 150,
    alignItems: 'flex-start',
  },
  textArea: {
    height: '100%',
    paddingTop: spacing.md,
  },
  uploadButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: spacing.borderRadius.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderStyle: 'dashed',
    padding: spacing.xl,
    alignItems: 'center',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: spacing.sm,
  },
  uploadSubtext: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: spacing.xs,
  },
  uploadedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  fileName: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: '#00D4FF',
  },
  optionsSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxl,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  optionText: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  optionValue: {
    fontSize: typography.fontSize.sm,
    color: '#0066FF',
  },
  processButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xxl,
    borderRadius: spacing.borderRadius.medium,
    overflow: 'hidden',
  },
  processButtonDisabled: {
    opacity: 0.5,
  },
  processGradient: {
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  processText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});