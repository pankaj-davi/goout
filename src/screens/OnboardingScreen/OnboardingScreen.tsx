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
import CheckBox from '@react-native-community/checkbox';

import { colors } from '../../theme/colors';

interface UserDetails {
  name: string;
  dob: string;
  gender: string;
  purpose: string[];
  languages: string[];
  interests: string[];
  personality: string;
  funFact: string;
  privacy: string;
  lifestyle: string;
  workLifeBalance: string;
  culturalAppreciation: string;
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
      purpose: [],
      languages: [],
      interests: [],
      personality: '',
      funFact: '',
      privacy: '',
      lifestyle: '',
      workLifeBalance: '',
      culturalAppreciation: '',
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

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      if (step < 7) setStep(step + 1);
    } else {
      const firstError = Object.keys(errors)[0];
      if (firstError) setFocus(firstError as any);
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
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
                    value={getValues('name')}
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
      case 2:
        return (
          <View>
            <Text style={styles.subtitle}>DOB</Text>
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
                  if (age > 120) return 'Age cannot be greater than 120 years';
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
                      {getValues('dob') || 'Select Date of Birth'}
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
      case 3:
        return (
          <View>
            <Text style={styles.subtitle}>Gender</Text>
            <Controller
              control={control}
              name="gender"
              rules={{ required: 'Gender is required' }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.genderContainer}>
                  {['Male', 'Female'].map((genderOption) => (
                    <TouchableOpacity
                      key={genderOption}
                      style={[
                        styles.genderButton,
                        value === genderOption && styles.selectedGender,
                      ]}
                      onPress={() => onChange(genderOption)}
                    >
                      <Text
                        style={[
                          styles.genderText,
                          value === genderOption && styles.selectedGenderText,
                        ]}
                      >
                        {genderOption}
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
      case 4:
        return (
          <View>
            <Text style={styles.subtitle}>Purpose for Connecting</Text>
            <Controller
              control={control}
              name="purpose"
              rules={{
                required: 'Please select at least one purpose for connecting',
                validate: (value) =>
                  value.length > 0 || 'At least one purpose is required',
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  <View style={styles.checkboxContainer}>
                    {[
                      'professional',
                      'Friendship',
                      'Collaboration',
                      'Mentorship',
                      'Romantic',
                    ].map((purpose) => (
                      <View key={purpose} style={styles.checkboxItem}>
                        <TouchableOpacity
                          onPress={() => {
                            const newValue = !value.includes(purpose)
                              ? [...value, purpose]
                              : value.filter((item) => item !== purpose);
                            onChange(newValue);
                          }}
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                          <CheckBox
                            value={value.includes(purpose)}
                            onValueChange={(newValue) => {
                              const newPurpose = newValue
                                ? [...value, purpose]
                                : value.filter((item) => item !== purpose);
                              onChange(newPurpose); // Update the form state
                            }}
                            tintColors={{ true: '#007BFF', false: 'gray' }}
                          />
                          <Text
                            style={[
                              styles.checkboxText,
                              value.includes(purpose) &&
                                styles.selectedCheckboxText,
                            ]}
                          >
                            {purpose}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                  {errors.purpose && (
                    <Text style={styles.errorText}>
                      {errors.purpose.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>
        );
      // Inside renderStep, add this for step 5:
      case 5:
        return (
          <View>
            <Text style={styles.subtitle}>Contextual Factors</Text>

            {/* Lifestyle Preferences */}
            <Text style={styles.subtitle}>Lifestyle Preferences</Text>
            <Controller
              control={control}
              name="lifestyle"
              rules={{ required: 'Please select your lifestyle preference' }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.checkboxContainer}>
                  {['Night Owl', 'Early Bird'].map((preference) => (
                    <TouchableOpacity
                      key={preference}
                      style={[
                        styles.checkboxItem,
                        value === preference && styles.selectedCheckboxItem,
                      ]}
                      onPress={() => onChange(preference)}
                    >
                      <Text
                        style={[
                          styles.checkboxText,
                          value === preference && styles.selectedCheckboxText,
                        ]}
                      >
                        {preference}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
            {errors.lifestyle && (
              <Text style={styles.errorText}>{errors.lifestyle.message}</Text>
            )}

            {/* Work-Life Balance */}
            <Text style={styles.subtitle}>Work-Life Balance</Text>
            <Controller
              control={control}
              name="workLifeBalance"
              rules={{
                required: 'Please select your work-life balance preference',
              }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.checkboxContainer}>
                  {['Career-driven', 'Relaxed'].map((balance) => (
                    <TouchableOpacity
                      key={balance}
                      style={[
                        styles.checkboxItem,
                        value === balance && styles.selectedCheckboxItem,
                      ]}
                      onPress={() => onChange(balance)}
                    >
                      <Text
                        style={[
                          styles.checkboxText,
                          value === balance && styles.selectedCheckboxText,
                        ]}
                      >
                        {balance}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
            {errors.workLifeBalance && (
              <Text style={styles.errorText}>
                {errors.workLifeBalance.message}
              </Text>
            )}

            {/* Cultural Appreciation */}
            <Text style={styles.subtitle}>Cultural Appreciation</Text>
            <Controller
              control={control}
              name="culturalAppreciation"
              rules={{
                required: 'Please select your cultural appreciation preference',
              }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.checkboxContainer}>
                  {['Shared', 'Open to Diversity'].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.checkboxItem,
                        value === option && styles.selectedCheckboxItem,
                      ]}
                      onPress={() => onChange(option)}
                    >
                      <Text
                        style={[
                          styles.checkboxText,
                          value === option && styles.selectedCheckboxText,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
            {errors.culturalAppreciation && (
              <Text style={styles.errorText}>
                {errors.culturalAppreciation.message}
              </Text>
            )}
          </View>
        );
      // Add more steps here (like purpose, languages, etc.)
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderStep()}</View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, step === 1 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={step === 1}
        >
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>
        {step === 7 ? (
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 15,
    paddingTop: 40,
  },
  content: {
    flex: 1,
    width: '100%',
    color: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  subtitle: {
    fontSize: 20,
    color: colors.textSecondary,
    textAlign: 'left',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
    color: '#000',
  },
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
  },
  disabledButton: {
    backgroundColor: '#B0C4DE',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 10,
    columnGap: 10,
  },
  genderButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    width: '30%',
    alignItems: 'center',
  },
  selectedGender: {
    backgroundColor: '#007BFF',
  },
  genderText: {
    fontSize: 16,
    color: '#000',
  },
  selectedGenderText: {
    color: '#fff',
  },
  checkboxContainer: {
    // flexDirection: 'row',
    // flexWrap: 'wrap',
    // justifyContent: 'space-between',
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  checkboxText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#000',
  },
  selectedCheckboxText: {
    fontWeight: 'bold',
  },
  selectedCheckboxItem: {
    backgroundColor: '#D3E4FF', // Light blue background when selected
    borderColor: '#007BFF', // Blue border when selected
    borderWidth: 2,
  },
});

export default OnboardingScreen;
