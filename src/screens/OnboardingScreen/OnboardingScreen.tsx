import React, { useState, useRef } from 'react';
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

interface UserDetails {
  name: string;
  dob: string;
  gender: string;
  lifestyle: string;
  workLifeBalance: string;
}

const OnboardingScreen: React.FC = () => {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    trigger,
    setFocus,
  } = useForm<UserDetails>({
    defaultValues: {
      name: '',
      dob: '',
      gender: '',
      lifestyle: '',
      workLifeBalance: '',
    },
    mode: 'onTouched',
    shouldFocusError: true,
  });

  const [step, setStep] = useState<number>(1);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const nameInputRef = useRef<TextInput | null>(null);

  const onSubmit = (data: UserDetails) => {
    console.log('User Details:', data);
    Alert.alert('Form Submitted', JSON.stringify(data, null, 2));
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

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderNameInput();
      case 2:
        return renderDateOfBirthInput();
      case 3:
        return renderGenderSelection();
      case 4:
        return renderLifestylePreferences();
      case 5:
        return renderWorkLifeBalancePreferences();
      default:
        return null;
    }
  };

  const renderNameInput = () => (
    <View>
      <Text style={styles.subtitle}>Name</Text>
      <Controller
        control={control}
        name="name"
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

  const renderGenderSelection = () => (
    <View>
      <Text style={styles.subtitle}>Gender</Text>
      <Controller
        control={control}
        name="gender"
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

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderStepContent()}</View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            const isValid = await trigger();
            if (isValid) {
              if (step < 5) {
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
            {step === 5 ? 'Submit' : 'Continue'}
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
});

export default OnboardingScreen;
