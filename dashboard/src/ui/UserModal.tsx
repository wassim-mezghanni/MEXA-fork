import React, { useState } from 'react';
import { Modal } from './Modal.tsx';
import { Input } from '../form/Input.tsx';
import { Select } from '../form/Select.tsx';
import { Checkbox } from '../form/Checkbox.tsx';
import { Button } from './Button.tsx';
import { UserRole, FeatureModule } from '../../types/auth.ts';
import { mockCompanies } from '../../mocks/adminMock.ts';

export interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
  initialData?: any;
  mode?: 'create' | 'edit';
  isAdmin?: boolean; // If true, can select company
}

export function UserModal({
  open,
  onClose,
  onSave,
  initialData,
  mode = 'create',
  isAdmin = false,
}: UserModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    role: initialData?.role || UserRole.USER,
    companyId: initialData?.companyId || '1',
    modules: initialData?.permissions?.modules || [FeatureModule.CHAT],
  });

  const handleModuleToggle = (module: FeatureModule) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.includes(module)
        ? prev.modules.filter(m => m !== module)
        : [...prev.modules, module]
    }));
  };

  const roleOptions = [
    { label: 'Standard User', value: UserRole.USER },
    { label: 'Admin', value: UserRole.ORG_ADMIN },
    { label: 'Viewer (Read-only)', value: UserRole.VIEWER },
    { label: 'Super Admin (Quatelio)', value: UserRole.SUPER_ADMIN },
  ];

  const companyOptions = mockCompanies.map(c => ({
    label: c.name,
    value: c.id
  }));

  const featureList = [
    { id: FeatureModule.CHAT, label: 'Chat Assistant', icon: 'chat_bubble' },
    { id: FeatureModule.SELECTION, label: 'Data Selection', icon: 'checklist' },
    { id: FeatureModule.TABLES, label: 'Tables & Analysis', icon: 'table_rows' },
    { id: FeatureModule.ANALYTICS, label: 'Advanced Analytics', icon: 'leaderboard' },
    { id: FeatureModule.LIBRARY, label: 'Design Library', icon: 'style' },
    { id: FeatureModule.WORKFLOWS, label: 'Custom Workflows', icon: 'account_tree' },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'Create New User' : 'Edit User Access'}
      className="max-w-3xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon="save" onClick={() => onSave(formData)}>
            {mode === 'create' ? 'Create User' : 'Save Changes'}
          </Button>
        </>
      }
    >
      <div className="space-y-8">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-6">
          <Input 
            label="Full Name" 
            placeholder="e.g. John Doe"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            icon="person"
          />
          <Input 
            label="Email Address" 
            placeholder="john@company.com"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            icon="mail"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {isAdmin && (
            <Select 
              label="Organization" 
              options={companyOptions}
              value={formData.companyId}
              onChange={e => setFormData({ ...formData, companyId: e.target.value })}
            />
          )}
          <Select 
            label="System Role" 
            options={roleOptions}
            value={formData.role}
            onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
          />
        </div>

        {/* Feature Access Section */}
        <div className="pt-4 border-t border-outline-variant/10">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-on-surface font-headline uppercase tracking-wider">Feature Module Access</h3>
            <p className="text-xs text-outline font-label mt-1">Determine which parts of the platform this user can interact with.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {featureList.map(feature => (
              <div 
                key={feature.id}
                className={`
                  p-4 rounded-xl border transition-all duration-300 cursor-pointer
                  ${formData.modules.includes(feature.id) 
                    ? 'bg-primary/5 border-primary/20 shadow-sm' 
                    : 'bg-surface-container-low/30 border-outline-variant/10 hover:border-outline-variant/30'}
                `}
                onClick={() => handleModuleToggle(feature.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`icon text-2xl ${formData.modules.includes(feature.id) ? 'text-primary' : 'text-outline/40'}`}>
                    {feature.icon}
                  </span>
                  <Checkbox 
                    label="" 
                    checked={formData.modules.includes(feature.id)}
                    onChange={() => handleModuleToggle(feature.id)}
                  />
                </div>
                <p className={`text-[12px] font-bold font-label ${formData.modules.includes(feature.id) ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                  {feature.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
