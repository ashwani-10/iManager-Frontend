import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Modal } from './Modal';
import { useUser } from '../../context/userContext';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRoleModal: React.FC<CreateRoleModalProps> = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    
    setIsCreatingRole(true);
    setError(null);

    try {
      const response = await axios({
        method: 'POST',
        url: 'http://localhost:8085/api/role/create',
        data: {
          name: newRoleName,
          description: newRoleDescription,
          orgId: user?.id
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data) {
        toast.success('Role created successfully!');
        onClose();
        setNewRoleName('');
        setNewRoleDescription('');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create role';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreatingRole(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Role"
      error={error}
      submitLabel={isCreatingRole ? 'Creating...' : 'Create Role'}
      onSubmit={handleCreateRole}
      isSubmitting={isCreatingRole}
      submitDisabled={isCreatingRole || !newRoleName.trim()}
    >
      <input
        type="text"
        placeholder="Role Name"
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 mb-4"
        value={newRoleName}
        onChange={(e) => setNewRoleName(e.target.value)}
        disabled={isCreatingRole}
      />
      <textarea
        placeholder="Role Description"
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 mb-4"
        value={newRoleDescription}
        onChange={(e) => setNewRoleDescription(e.target.value)}
        disabled={isCreatingRole}
      />
    </Modal>
  );
};
