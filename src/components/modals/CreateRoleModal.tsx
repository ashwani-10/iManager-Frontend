import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useUser } from '../../context/userContext';

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  error?: string | null;
  submitLabel: string;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitDisabled: boolean;
  customStyles?: React.CSSProperties;
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  error,
  submitLabel,
  onSubmit,
  isSubmitting,
  submitDisabled,
  customStyles,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div
        className="bg-white rounded-lg shadow-lg p-6"
        style={customStyles}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">{children}</div>
        <div className="flex justify-end">
          <button
            onClick={onSubmit}
            disabled={submitDisabled}
            className={`px-4 py-2 rounded-md text-white ${
              submitDisabled ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// CreateRoleModal Component
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
  const [selectedOperations, setSelectedOperations] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [operations, setOperations] = useState<{ id: string; name: string }[]>([]);

  const isAdmin = user?.role === 'ADMIN';
  const canCreateRole = isAdmin || (user?.operations?.includes('create-role') ?? false);

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        const response = await axios.get('https://imanager2.duckdns.org/api/service2/api/operation/get', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setOperations(response.data);
      } catch (err: any) {
        toast.error('Failed to fetch operations');
      }
    };

    if (isOpen && canCreateRole) {
      fetchOperations();
    }
  }, [isOpen, canCreateRole]);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleOperationChange = (operationId: string) => {
    setSelectedOperations((prev) =>
      prev.includes(operationId)
        ? prev.filter((id) => id !== operationId)
        : [...prev, operationId]
    );
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;

    setIsCreatingRole(true);
    setError(null);

    try {
      const response = await axios({
        method: 'POST',
        url: 'https://imanager2.duckdns.org/api/service2/api/role/create',
        data: {
          name: newRoleName,
          description: newRoleDescription,
          orgId: user?.id,
          operationsId: selectedOperations,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data) {
        toast.success('Role created successfully!');
        onClose();
        setNewRoleName('');
        setNewRoleDescription('');
        setSelectedOperations([]);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create role';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreatingRole(false);
    }
  };

  if (!canCreateRole) {
    return null;
  }

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
      customStyles={{ width: '500px', height: '350px' }}
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
      <div className="relative mb-4">
        <button
          type="button"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white shadow-sm hover:bg-gray-50"
          onClick={toggleDropdown}
          disabled={isCreatingRole}
        >
          Select Operations
        </button>
        {dropdownOpen && (
          <div
            className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
            style={{
              top: dropdownOpen ? 'auto' : '100%',
              bottom: dropdownOpen ? '100%' : 'auto',
              left: 0,
            }}
          >
            {operations.map((operation) => (
              <label
                key={operation.id}
                className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedOperations.includes(operation.id)}
                  onChange={() => handleOperationChange(operation.id)}
                  disabled={isCreatingRole}
                />
                {operation.name}
              </label>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
