# Role-Based System Implementation - Complete

## ✅ **Features Implemented**

### 1. **Role Selection During Signup**
- Users can choose their role: Student, Faculty, HOD, or Dean
- Department field appears for staff roles
- Backend creates StaffProfile automatically for non-students
- Sets `is_staff=True` for faculty/HOD/dean

### 2. **Role Display in UI**
- **Navbar**: Role badge shown in user dropdown menu
- **Profile**: Role information included in user data
- **API**: Role and department returned in all user endpoints

### 3. **Role-Based Permissions**
- **Announcements**: Only staff can create announcements
- **Post Announcement Button**: Only visible to staff members
- **Create Page**: Redirects students to announcements list

### 4. **Staff-Only Features**
- Post announcements with tags (General, Academic, Event, Urgent, Placement, Exam)
- Pin important announcements
- Role badge in user menu (HOD/Dean/Faculty)

---

## 🎯 **Roles & Permissions**

| Role | Can Post Questions | Can Post Announcements | Can Pin Announcements | Badge Color |
|------|-------------------|----------------------|---------------------|-------------|
| **Student** | ✅ Yes | ❌ No | ❌ No | None |
| **Faculty** | ✅ Yes | ✅ Yes | ✅ Yes | Blue |
| **HOD** | ✅ Yes | ✅ Yes | ✅ Yes | Purple |
| **Dean** | ✅ Yes | ✅ Yes | ✅ Yes | Pink |

---

## 📁 **Files Modified**

### Backend
1. `qa/serializers.py`
   - Updated `RegisterSerializer` with role and department fields
   - Updated `UserSerializer` to include role and department
   - Auto-creates StaffProfile for non-students

2. `accounts/serializers.py`
   - Already had CustomTokenObtainPairSerializer with role support

3. `accounts/models.py`
   - Already had StaffProfile model with roles

### Frontend
1. `frontend/app/signup/page.tsx`
   - Added role selection dropdown
   - Added conditional department field
   - Updated form submission with role data

2. `frontend/components/Navbar.tsx`
   - Added role badge in user dropdown
   - Added "Post Announcement" link for staff

3. `frontend/app/announcements/create/page.tsx` - **NEW**
   - Full announcement creation form
   - Tag selection with colors
   - Pin option
   - Staff-only access

4. `frontend/context/AuthContext.tsx`
   - Added reputation field to User interface

---

## 🚀 **How to Use**

### **For Students:**
1. Sign up and select "Student" role
2. Ask questions, post answers
3. View announcements
4. Cannot create announcements

### **For Faculty/HOD/Dean:**
1. Sign up and select your role
2. Enter your department
3. Get staff badge in profile
4. Access "Post Announcement" in user menu
5. Create and pin announcements
6. All student features available

---

## 🎨 **UI Features**

### **Signup Page**
- Role dropdown with 4 options
- Department field (conditional - only for staff)
- Validation: Department required for staff roles
- Modern gradient design

### **Navbar**
- Role badge in dropdown (HOD/Dean/Faculty)
- "Post Announcement" link for staff
- Gradient user menu header

### **Create Announcement Page**
- Title input (max 200 chars)
- Content textarea
- Tag selection (6 categories with colors)
- Pin checkbox
- Gradient submit button
- Staff-only access (redirects students)

---

## 🔐 **Security**

### Backend Validation
- `AnnouncementViewSet.perform_create()` checks:
  - `user.is_staff` OR
  - `hasattr(user, 'staff_profile')`
- Raises `PermissionDenied` for students

### Frontend Protection
- Create page checks user role
- Redirects students to announcements list
- Post button only visible to staff

---

## 📊 **Database Schema**

### **StaffProfile Model**
```python
class StaffProfile(models.Model):
    user = OneToOneField(User)
    role = CharField(choices=['hod', 'dean', 'faculty'])
    department = CharField(max_length=100)
    employee_id = CharField(unique=True, nullable)
```

### **User Model (Extended)**
- `is_staff` = True for faculty/HOD/dean
- `staff_profile` relationship (OneToOne)
- `userprofile` relationship (OneToOne)

---

## 🧪 **Testing**

### **Test Signup:**
1. Go to http://localhost:3001/signup
2. Fill username and email
3. Select "Faculty" role
4. Enter department (e.g., "Computer Science")
5. Set password
6. Submit

### **Test Announcement Creation:**
1. Login as faculty/HOD/dean
2. Click user menu → "Post Announcement"
3. Fill title and content
4. Select tag (e.g., "Academic")
5. Check "Pin" if needed
6. Submit

### **Test Student Restriction:**
1. Login as student
2. User menu should NOT show "Post Announcement"
3. Try accessing `/announcements/create` directly
4. Should redirect to `/announcements`

---

## 🎯 **Role Badge Colors**

| Role | Badge Text | Background |
|------|-----------|------------|
| HOD | HOD | White/20% opacity |
| Dean | Dean | White/20% opacity |
| Faculty | Faculty | White/20% opacity |

---

## 📝 **API Endpoints**

### **Registration with Role**
```bash
POST /api/register/
{
  "username": "john_doe",
  "email": "john@university.edu",
  "password": "password123",
  "password_confirm": "password123",
  "role": "faculty",
  "department": "Computer Science"
}
```

### **User Info (includes role)**
```bash
GET /api/auth/me/
Response:
{
  "id": 1,
  "username": "john_doe",
  "email": "john@university.edu",
  "role": "faculty",
  "department": "Computer Science",
  "is_staff": true,
  "reputation": 0
}
```

### **Create Announcement (Staff Only)**
```bash
POST /api/announcements/
{
  "title": "Exam Schedule Updated",
  "content": "The final exams have been rescheduled...",
  "tag": "exam",
  "is_pinned": true
}
```

---

## ✨ **Summary**

✅ **Complete role-based system implemented**
✅ **4 roles: Student, Faculty, HOD, Dean**
✅ **Staff can create announcements**
✅ **Role badges in UI**
✅ **Department tracking for staff**
✅ **Secure backend validation**
✅ **Modern gradient UI**
✅ **Fully integrated with existing features**

---

**Status:** 🎉 **COMPLETE & READY TO USE**
