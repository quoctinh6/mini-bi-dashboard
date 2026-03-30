import React, { createContext, useContext, useState, ReactNode } from 'react';

export type RegionScope = 'national' | 'north' | 'central' | 'south';
export type UserRole = 'director' | 'manager' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  dataScope: RegionScope[];
  isActive: boolean;
}

// Mock initial users for our system
export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Nguyễn Văn A',
    email: 'nva@company.com',
    avatar: 'NA',
    role: 'director',
    dataScope: ['national'],
    isActive: true,
  },
  {
    id: 'u2',
    name: 'Trần Thị B',
    email: 'ttb@company.com',
    avatar: 'TB',
    role: 'manager',
    dataScope: ['north'],
    isActive: true,
  },
  {
    id: 'u3',
    name: 'Lê Văn C',
    email: 'lvc@company.com',
    avatar: 'LC',
    role: 'manager',
    dataScope: ['south'],
    isActive: true,
  },
  {
    id: 'u4',
    name: 'Phạm Thị D',
    email: 'ptd@company.com',
    avatar: 'PD',
    role: 'employee',
    dataScope: ['central'],
    isActive: true,
  },
  {
    id: 'u5',
    name: 'Vũ Ngọc E',
    email: 'vne@company.com',
    avatar: 'VE',
    role: 'manager',
    dataScope: ['national'],
    isActive: true, // Example of invalid manager with national scope maybe? Handled by settings.
  },
  {
    id: 'u6',
    name: 'Đặng Tuấn F',
    email: 'dtf@company.com',
    avatar: 'DF',
    role: 'employee',
    dataScope: ['south'],
    isActive: false,
  },
  {
    id: 'u7',
    name: 'Bùi Thị G',
    email: 'btg@company.com',
    avatar: 'BG',
    role: 'employee',
    dataScope: ['north'],
    isActive: true,
  },
  {
    id: 'u8',
    name: 'Hoàng Văn H',
    email: 'hvh@company.com',
    avatar: 'HH',
    role: 'employee',
    dataScope: ['central'],
    isActive: true,
  },
  {
    id: 'u9',
    name: 'Ngô Thanh I',
    email: 'nti@company.com',
    avatar: 'NI',
    role: 'employee',
    dataScope: ['south'],
    isActive: true,
  },
  {
    id: 'u10',
    name: 'Lý Quốc K',
    email: 'lqk@company.com',
    avatar: 'LK',
    role: 'manager',
    dataScope: ['central'],
    isActive: true,
  }
];

interface AuthContextType {
  currentUser: User | null;
  originalAdminUser: User | null; // Keeps track of the admin who is impersonating
  allUsers: User[]; // Used for the permissions page
  login: (email: string) => Promise<void>;
  logout: () => void;
  impersonate: (user: User) => void;
  stopImpersonation: () => void;
  updateUserRole: (userId: string, newRole: UserRole, newScope: RegionScope[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [originalAdminUser, setOriginalAdminUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);

  const login = async (email: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Auto-login logic for demo purpose: 
    // If email contains "manager", login as u2. Else director.
    let userToLogin = allUsers[0]; // Default Director
    if (email.includes('manager')) {
      userToLogin = allUsers[1];
    } else if (email.includes('employee')) {
      userToLogin = allUsers[3];
    }
    
    setCurrentUser(userToLogin);
    setOriginalAdminUser(null);
  };

  const logout = () => {
    setCurrentUser(null);
    setOriginalAdminUser(null);
  };

  const impersonate = (user: User) => {
    if (currentUser && currentUser.role === 'director' && !originalAdminUser) {
      setOriginalAdminUser(currentUser);
      setCurrentUser(user);
    }
  };

  const stopImpersonation = () => {
    if (originalAdminUser) {
      setCurrentUser(originalAdminUser);
      setOriginalAdminUser(null);
    }
  };

  const updateUserRole = (userId: string, newRole: UserRole, newScope: RegionScope[]) => {
    setAllUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, role: newRole, dataScope: newScope } : u
    ));
    
    // Update current user if it's the one modified
    if (currentUser?.id === userId) {
       setCurrentUser(prev => prev ? { ...prev, role: newRole, dataScope: newScope } : null);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      originalAdminUser,
      allUsers,
      login,
      logout,
      impersonate,
      stopImpersonation,
      updateUserRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
