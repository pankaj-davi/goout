import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';

import { theme } from '../../theme/index';
import { IUser, useAuth } from '../../context/AuthContext';
import { updateUserProfileToFirestore } from '../../utils/firebase';
import CheckBox from '@react-native-community/checkbox';

export interface UserOnboardDetails {
  name: string;
  dob: string;
  gender: string;
  lifestyle: string;
  workLifeBalance: string;
  purpose: string[];
  bio: string; // Add bio field
}

const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { setUser, logout, user } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    trigger,
    setFocus,
  } = useForm<UserOnboardDetails>({
    defaultValues: {
      name: '',
      dob: '',
      gender: '',
      lifestyle: '',
      workLifeBalance: '',
      purpose: [],
      bio: '', // Add bio default value
    },
    mode: 'onTouched',
    shouldFocusError: true,
  });
  const nameInputRef = useRef<TextInput | null>(null);

  const onSubmit = async (userOnboardDetails: UserOnboardDetails) => {
    try {
      await updateUserProfileToFirestore(userOnboardDetails);

      await navigation.navigate('MainTabs');
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }

    if (selectedDate) {
      const now = new Date();
      if (selectedDate > now) {
        Alert.alert('Error', 'Date of birth cannot be in the future.');
        return;
      }

      const formattedDate = selectedDate.toISOString().split('T')[0];
      setValue('dob', formattedDate);
      trigger('dob');
    }

    setShowDatePicker(false);
  };

  const renderNameInput = () => (
    <View>
      <Text style={styles.subtitle}>Name</Text>
      <Controller
        control={control}
        name="name"
        key="name"
        rules={{ required: 'Name is required' }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              ref={nameInputRef}
              style={[styles.input, errors.name && styles.errorInput]}
              placeholder="Enter name"
              value={value}
              onChangeText={(text) => {
                onChange(text);
                trigger('name');
              }}
              placeholderTextColor="#B0B0B0"
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name.message}</Text>
            )}
          </>
        )}
      />
    </View>
  );

  const renderDateOfBirthInput = () => (
    <View>
      <Text style={styles.subtitle}>Date of birth</Text>
      <Controller
        control={control}
        name="dob"
        key="dob"
        rules={{
          required: 'Date of birth is required',
          validate: (value) => {
            const now = new Date();
            const dob = new Date(value);
            if (dob > now) return 'Date of birth cannot be in the future';
            const age = now.getFullYear() - dob.getFullYear();
            if (age > 100) return 'Age cannot be greater than 120 years';
            return true;
          },
        }}
        render={({ field: { value } }) => (
          <>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[styles.input, errors.dob && styles.errorInput]}
            >
              <Text style={{ color: value ? '#000' : '#B0B0B0' }}>
                {value || 'Select Date of Birth'}
              </Text>
            </TouchableOpacity>
            {errors.dob && (
              <Text style={styles.errorText}>{errors.dob.message}</Text>
            )}
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
              />
            )}
          </>
        )}
      />
    </View>
  );

  const renderBioInput = () => (
    <View>
      <Text style={styles.subtitle}>Bio</Text>
      <Controller
        control={control}
        name="bio"
        key="bio"
        rules={{
          required: 'Bio is required',
          maxLength: {
            value: 200,
            message: 'Bio cannot be more than 200 characters',
          },
        }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                errors.bio && styles.errorInput,
              ]}
              placeholder="Write something about yourself"
              value={value}
              onChangeText={onChange}
              multiline={true}
              numberOfLines={4}
              placeholderTextColor="#B0B0B0"
            />
            {errors.bio && (
              <Text style={styles.errorText}>{errors.bio.message}</Text>
            )}
          </>
        )}
      />
    </View>
  );

  const renderGenderSelection = () => (
    <View>
      <Text style={styles.subtitle}>Gender</Text>
      <Controller
        control={control}
        name="gender"
        key="gender"
        rules={{ required: 'Gender is required' }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.optionContainer}>
            {['Male', 'Female'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  value === option && styles.selectedOption,
                ]}
                onPress={() => onChange(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    value === option && styles.selectedOptionText,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
      {errors.gender && (
        <Text style={styles.errorText}>{errors.gender.message}</Text>
      )}
    </View>
  );

  const renderLifestylePreferences = () => (
    <View>
      <Text style={styles.subtitle}>Lifestyle Preferences</Text>
      <Controller
        control={control}
        name="lifestyle"
        key={'lifestyle'}
        rules={{ required: 'Please select your lifestyle preference' }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.optionContainer}>
            {['Night Owl', 'Early Bird'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  value === option && styles.selectedOption,
                ]}
                onPress={() => onChange(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    value === option && styles.selectedOptionText,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
      {errors.lifestyle && (
        <Text style={styles.errorText}>{errors.lifestyle.message}</Text>
      )}
    </View>
  );

  const renderWorkLifeBalancePreferences = () => (
    <View>
      <Text style={styles.subtitle}>Work-Life Balance</Text>
      <Controller
        control={control}
        key={'workLifeBalance'}
        name="workLifeBalance"
        rules={{
          required: 'Please select your work-life balance preference',
        }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.optionContainer}>
            {['Career-driven', 'Relaxed'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  value === option && styles.selectedOption,
                ]}
                onPress={() => onChange(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    value === option && styles.selectedOptionText,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
      {errors.workLifeBalance && (
        <Text style={styles.errorText}>{errors.workLifeBalance.message}</Text>
      )}
    </View>
  );

  const renderPurposeSelection = () => (
    <View>
      <Text style={styles.subtitle}>Purpose for Connecting</Text>
      <Controller
        control={control}
        name="purpose"
        key="purpose"
        rules={{
          required: 'Please select at least one purpose for connecting',
          validate: (value) =>
            value.length > 0 || 'At least one purpose is required',
        }}
        render={({ field: { onChange, value } }) => (
          <>
            <View style={styles.checkboxContainer}>
              {[
                'Professional',
                'Friendship',
                'Collaboration',
                'Mentorship',
                'Romantic',
              ].map((purpose) => (
                <TouchableOpacity
                  key={purpose}
                  style={styles.checkboxItem}
                  onPress={() => {
                    const newValue = !value.includes(purpose);
                    const newPurpose = newValue
                      ? [...value, purpose]
                      : value.filter((item) => item !== purpose);
                    onChange(newPurpose);
                  }}
                >
                  <CheckBox
                    value={value.includes(purpose)}
                    onValueChange={(newValue) => {
                      const newPurpose = newValue
                        ? [...value, purpose]
                        : value.filter((item) => item !== purpose);
                      onChange(newPurpose);
                    }}
                    style={[
                      styles.checkbox,
                      value.includes(purpose) && styles.checkboxChecked,
                    ]}
                  />
                  <Text style={styles.checkboxLabel}>{purpose}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.purpose && (
              <Text style={styles.errorText}>{errors.purpose.message}</Text>
            )}
          </>
        )}
      />
    </View>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderNameInput();
      case 2:
        return renderDateOfBirthInput();
      case 3:
        return renderBioInput();
      case 4:
        return renderGenderSelection();
      case 5:
        return renderLifestylePreferences();
      case 6:
        return renderWorkLifeBalancePreferences();
      case 7:
        return renderPurposeSelection();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderStepContent()}</View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            const isValid = await trigger();
            if (isValid) {
              if (step < 7) {
                setStep(step + 1);
              } else {
                handleSubmit(onSubmit)();
              }
            } else {
              const firstError = Object.keys(errors)[0];
              if (firstError) setFocus(firstError as any);
            }
          }}
        >
          <Text style={styles.buttonText}>
            {step === 7 ? 'Submit' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: 15,
    paddingTop: 40,
  },
  content: {
    width: '100%',
    color: '#000',
  },
  subtitle: {
    fontSize: 20,
    color: theme.colors.textSecondary,
    textAlign: 'left',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
    color: theme.colors.text,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorInput: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    color: theme.colors.textLight,
    fontWeight: 'bold',
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 10,
    columnGap: 10,
    width: '100%',
    marginTop: 12,
  },
  optionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 25,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: theme.colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  selectedOptionText: {
    color: theme.colors.textLight,
  },
  checkboxContainer: {
    flexDirection: 'column',
    marginTop: 10,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  selectedCheckboxText: {
    color: theme.colors.textLight,
  },
  checkbox: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  checkboxChecked: {
    borderColor: theme.colors.primary,
  },
  checkboxLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
});

export default OnboardingScreen;
