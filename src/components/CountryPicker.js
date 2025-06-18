// src/components/CountryPicker.js
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../styles/colors';

// Complete country list with phone codes
export const COUNTRIES = [
  { code: '+91', flag: '🇮🇳', name: 'India', iso: 'IN' },
  { code: '+1', flag: '🇺🇸', name: 'USA', iso: 'US' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom', iso: 'GB' },
  { code: '+971', flag: '🇦🇪', name: 'UAE', iso: 'AE' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore', iso: 'SG' },
  { code: '+61', flag: '🇦🇺', name: 'Australia', iso: 'AU' },
  { code: '+86', flag: '🇨🇳', name: 'China', iso: 'CN' },
  { code: '+49', flag: '🇩🇪', name: 'Germany', iso: 'DE' },
  { code: '+33', flag: '🇫🇷', name: 'France', iso: 'FR' },
  { code: '+81', flag: '🇯🇵', name: 'Japan', iso: 'JP' },
  { code: '+7', flag: '🇷🇺', name: 'Russia', iso: 'RU' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil', iso: 'BR' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa', iso: 'ZA' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea', iso: 'KR' },
  { code: '+34', flag: '🇪🇸', name: 'Spain', iso: 'ES' },
  { code: '+39', flag: '🇮🇹', name: 'Italy', iso: 'IT' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico', iso: 'MX' },
  { code: '+62', flag: '🇮🇩', name: 'Indonesia', iso: 'ID' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia', iso: 'MY' },
  { code: '+63', flag: '🇵🇭', name: 'Philippines', iso: 'PH' },
  { code: '+66', flag: '🇹🇭', name: 'Thailand', iso: 'TH' },
  { code: '+84', flag: '🇻🇳', name: 'Vietnam', iso: 'VN' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh', iso: 'BD' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan', iso: 'PK' },
  { code: '+94', flag: '🇱🇰', name: 'Sri Lanka', iso: 'LK' },
  { code: '+977', flag: '🇳🇵', name: 'Nepal', iso: 'NP' },
];

const CountryPicker = ({ visible, onClose, onSelect, selectedCountry }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredCountries, setFilteredCountries] = React.useState(COUNTRIES);

  React.useEffect(() => {
    if (searchQuery) {
      const filtered = COUNTRIES.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.code.includes(searchQuery)
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(COUNTRIES);
    }
  }, [searchQuery]);

  const renderCountryItem = ({ item }) => {
    const isSelected = selectedCountry?.code === item.code;
    
    return (
      <TouchableOpacity
        style={[styles.countryItem, isSelected && styles.selectedItem]}
        onPress={() => onSelect(item)}>
        <Text style={styles.flag}>{item.flag}</Text>
        <Text style={[styles.countryName, isSelected && styles.selectedText]}>
          {item.name}
        </Text>
        <Text style={[styles.countryCode, isSelected && styles.selectedText]}>
          {item.code}
        </Text>
        {isSelected && (
          <Icon name="checkmark" size={20} color={colors.gradientStart} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Select Country</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.gray7} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={colors.gray5} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search country or code..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.gray5}
            />
          </View>

          {/* Country List */}
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.iso}
            renderItem={renderCountryItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No countries found</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '75%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray2,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray8,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray1,
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.gray8,
  },
  listContent: {
    paddingBottom: 20,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray1,
  },
  selectedItem: {
    backgroundColor: colors.gray1,
  },
  flag: {
    fontSize: 28,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: colors.gray8,
  },
  countryCode: {
    fontSize: 16,
    color: colors.gray6,
    marginRight: 8,
  },
  selectedText: {
    color: colors.gradientStart,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray5,
  },
});

export default CountryPicker;