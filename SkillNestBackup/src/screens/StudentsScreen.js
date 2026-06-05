import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import AnimatedBG from '../components/AnimatedBG';
import { GlowingCard, LoadingOverlay, AlertBar } from '../components/UI';
import { COLORS, SIZES, TYPOGRAPHY } from '../theme/theme';
import { getAllStudents, addStudent, deleteStudent } from '../services/api';

export default function StudentsScreen() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    id: '',
    name: '',
    grade: '',
    gender: '',
    phone: '',
    email: '',
    parent: '',
    address: '',
    birth: '',
  });

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, students]);

  const loadStudents = async () => {
    setLoading(true);
    const result = await getAllStudents();
    if (result.success) {
      setStudents(result.data || []);
      setFilteredStudents(result.data || []);
    } else {
      setAlert('Failed to load students');
    }
    setLoading(false);
  };

  const filterStudents = () => {
    if (!searchQuery) {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        s =>
          s.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.grade?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredStudents(filtered);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStudents();
    setRefreshing(false);
  };

  const handleAddStudent = async () => {
    if (!newStudent.id || !newStudent.name || !newStudent.grade) {
      setAlert('ID, Name, and Grade are required');
      return;
    }

    setLoading(true);
    const result = await addStudent(newStudent);
    if (result.success) {
      setAlert('Student added successfully');
      setShowAddModal(false);
      setNewStudent({
        id: '',
        name: '',
        grade: '',
        gender: '',
        phone: '',
        email: '',
        parent: '',
        address: '',
        birth: '',
      });
      await loadStudents();
    } else {
      setAlert(result.error);
    }
    setLoading(false);
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) {
      return;
    }

    setLoading(true);
    const result = await deleteStudent(selectedStudent.id);
    if (result.success) {
      setAlert('Student deleted');
      setShowDetailModal(false);
      await loadStudents();
    } else {
      setAlert(result.error);
    }
    setLoading(false);
  };

  const getAvatarColor = name => {
    const colors = [
      COLORS.cyan,
      COLORS.pink,
      COLORS.purple,
      COLORS.green,
      COLORS.yellow,
      COLORS.orange,
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  const StudentRow = ({ student, onPress }) => (
    <TouchableOpacity onPress={() => onPress(student)} activeOpacity={0.7}>
      <View style={styles.row}>
        <View
          style={[
            styles.rowLeftBar,
            {
              backgroundColor:
                student.gender === 'Male' ? COLORS.cyan : COLORS.pink,
            },
          ]}
        />
        <Text style={styles.rowId}>{student.id}</Text>
        <Text style={styles.rowName}>{student.name}</Text>
        <Text style={styles.rowGrade}>{student.grade}</Text>
        <Text style={styles.rowArrow}>▶</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <AnimatedBG>
      <LoadingOverlay visible={loading} />

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SKILLNEST SYSTEM</Text>
          <Text style={styles.headerSub}>STUDENT MANAGEMENT</Text>
        </View>

        {alert && (
          <AlertBar
            message={alert}
            type="info"
            onDismiss={() => setAlert('')}
          />
        )}

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="SEARCH BY ID / NAME / GRADE..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <View style={styles.addButton}>
            <Text style={styles.addButtonText}>+ ADD STUDENT</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.columnHeader}>
          <Text style={[styles.columnId, { color: COLORS.cyan }]}>ID</Text>
          <Text style={[styles.columnName, { color: COLORS.cyan }]}>NAME</Text>
          <Text style={[styles.columnGrade, { color: COLORS.cyan }]}>
            GRADE
          </Text>
          <Text style={[styles.columnArrow, { color: COLORS.cyan }]}>▶</Text>
        </View>

        <FlatList
          data={filteredStudents}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <StudentRow
              student={item}
              onPress={student => {
                setSelectedStudent(student);
                setShowDetailModal(true);
              }}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.cyan}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>NO STUDENTS FOUND</Text>
          }
        />
      </View>

      {/* Student Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View
              style={[styles.modalHeader, { borderTopColor: COLORS.cyan }]}
            />

            <View style={styles.modalAvatar}>
              <Text
                style={[
                  styles.avatarText,
                  { color: getAvatarColor(selectedStudent?.name || '') },
                ]}
              >
                {selectedStudent?.name?.charAt(0) || '?'}
              </Text>
            </View>
            <Text style={styles.modalName}>{selectedStudent?.name}</Text>
            <Text style={styles.modalSub}>
              {selectedStudent?.id} • Grade {selectedStudent?.grade}
            </Text>

            <View style={styles.detailGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>GENDER</Text>
                <Text style={styles.detailValue}>
                  {selectedStudent?.gender || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>PHONE</Text>
                <Text style={styles.detailValue}>
                  {selectedStudent?.phone || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>EMAIL</Text>
                <Text style={styles.detailValue}>
                  {selectedStudent?.email || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>PARENT</Text>
                <Text style={styles.detailValue}>
                  {selectedStudent?.parent || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>BIRTH</Text>
                <Text style={styles.detailValue}>
                  {selectedStudent?.birth || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>ADDRESS</Text>
                <Text style={styles.detailValue}>
                  {selectedStudent?.address || 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={handleDeleteStudent}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>DELETE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowDetailModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Student Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, styles.addSheet]}>
            <Text style={styles.addTitle}>[ ADD STUDENT ]</Text>

            <ScrollView style={styles.addForm}>
              <TextInput
                style={styles.addInput}
                placeholder="STUDENT ID *"
                placeholderTextColor={COLORS.textMuted}
                value={newStudent.id}
                onChangeText={text =>
                  setNewStudent({ ...newStudent, id: text })
                }
              />
              <TextInput
                style={styles.addInput}
                placeholder="FULL NAME *"
                placeholderTextColor={COLORS.textMuted}
                value={newStudent.name}
                onChangeText={text =>
                  setNewStudent({ ...newStudent, name: text })
                }
              />
              <TextInput
                style={styles.addInput}
                placeholder="GRADE *"
                placeholderTextColor={COLORS.textMuted}
                value={newStudent.grade}
                onChangeText={text =>
                  setNewStudent({ ...newStudent, grade: text })
                }
              />
              <TextInput
                style={styles.addInput}
                placeholder="GENDER (Male/Female)"
                placeholderTextColor={COLORS.textMuted}
                value={newStudent.gender}
                onChangeText={text =>
                  setNewStudent({ ...newStudent, gender: text })
                }
              />
              <TextInput
                style={styles.addInput}
                placeholder="PHONE NUMBER"
                placeholderTextColor={COLORS.textMuted}
                value={newStudent.phone}
                onChangeText={text =>
                  setNewStudent({ ...newStudent, phone: text })
                }
              />
              <TextInput
                style={styles.addInput}
                placeholder="EMAIL"
                placeholderTextColor={COLORS.textMuted}
                value={newStudent.email}
                onChangeText={text =>
                  setNewStudent({ ...newStudent, email: text })
                }
              />
              <TextInput
                style={styles.addInput}
                placeholder="PARENT NAME"
                placeholderTextColor={COLORS.textMuted}
                value={newStudent.parent}
                onChangeText={text =>
                  setNewStudent({ ...newStudent, parent: text })
                }
              />
              <TextInput
                style={styles.addInput}
                placeholder="ADDRESS"
                placeholderTextColor={COLORS.textMuted}
                value={newStudent.address}
                onChangeText={text =>
                  setNewStudent({ ...newStudent, address: text })
                }
              />
              <TextInput
                style={styles.addInput}
                placeholder="DATE OF BIRTH (YYYY-MM-DD)"
                placeholderTextColor={COLORS.textMuted}
                value={newStudent.birth}
                onChangeText={text =>
                  setNewStudent({ ...newStudent, birth: text })
                }
              />
            </ScrollView>

            <View style={styles.addModalButtons}>
              <TouchableOpacity
                onPress={handleAddStudent}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>SAVE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={styles.cancelModalButton}
              >
                <Text style={styles.cancelModalText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AnimatedBG>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SIZES.padding,
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.title,
    color: COLORS.cyan,
    fontSize: 22,
  },
  headerSub: {
    ...TYPOGRAPHY.label,
    color: COLORS.textDim,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SIZES.margin,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.borderGlow,
    borderRadius: 8,
    backgroundColor: COLORS.cardBg,
  },
  searchIcon: {
    color: COLORS.textDim,
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  addButton: {
    marginHorizontal: SIZES.margin,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.cyan,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.cyan,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  columnHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: SIZES.padding,
    backgroundColor: 'rgba(0,15,35,0.9)',
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.cyan,
  },
  columnId: {
    width: 80,
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1,
  },
  columnName: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1,
  },
  columnGrade: {
    width: 60,
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1,
  },
  columnArrow: {
    width: 30,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: SIZES.padding,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  rowLeftBar: {
    width: 3,
    height: 30,
    marginRight: 12,
  },
  rowId: {
    width: 80,
    color: COLORS.text,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  rowName: {
    flex: 1,
    color: COLORS.text,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  rowGrade: {
    width: 60,
    color: COLORS.cyan,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  rowArrow: {
    width: 30,
    color: COLORS.textDim,
    fontSize: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    marginTop: 40,
    fontFamily: 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: COLORS.cyan,
  },
  modalHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  modalAvatar: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 48,
    fontFamily: 'monospace',
  },
  modalName: {
    ...TYPOGRAPHY.title,
    fontSize: 20,
    color: COLORS.text,
    textAlign: 'center',
  },
  modalSub: {
    color: COLORS.textDim,
    textAlign: 'center',
    marginBottom: 20,
  },
  detailGrid: {
    gap: 12,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    color: COLORS.textDim,
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 1,
  },
  detailValue: {
    color: COLORS.text,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: COLORS.pink,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  deleteButtonText: {
    color: COLORS.pink,
    fontFamily: 'monospace',
  },
  closeButton: {
    borderWidth: 1,
    borderColor: COLORS.textDim,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  closeButtonText: {
    color: COLORS.textDim,
    fontFamily: 'monospace',
  },
  addSheet: {
    maxHeight: '80%',
  },
  addTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.cyan,
    textAlign: 'center',
    marginBottom: 20,
  },
  addForm: {
    maxHeight: 400,
  },
  addInput: {
    borderWidth: 1,
    borderColor: COLORS.borderGlow,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  addModalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  saveButton: {
    borderWidth: 1,
    borderColor: COLORS.cyan,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  saveButtonText: {
    color: COLORS.cyan,
    fontFamily: 'monospace',
  },
  cancelModalButton: {
    borderWidth: 1,
    borderColor: COLORS.textDim,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  cancelModalText: {
    color: COLORS.textDim,
    fontFamily: 'monospace',
  },
});
