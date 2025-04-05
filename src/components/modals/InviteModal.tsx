import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Modal } from './Modal';
import { useUser } from '../../context/userContext';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    if (!user || user.role !== 'ADMIN') {
      toast.error('Only administrators can invite team members');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios({
        method: 'POST',
        url: `http://localhost:8085/api/member/invite/${user.id}`,
        params: { inviteEmail, role: inviteRole },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.data.success) {
        toast.success('Invitation sent successfully!');
        onClose();
        setInviteEmail('');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to send invite';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Team Member"
      error={error}
      submitLabel={isLoading ? 'Sending...' : 'Send Invite'}
      onSubmit={handleInvite}
      isSubmitting={isLoading}
      submitDisabled={isLoading || !inviteEmail.trim()}
    >
      <input
        type="email"
        placeholder="Email address"
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 mb-4"
        value={inviteEmail}
        onChange={(e) => setInviteEmail(e.target.value)}
        disabled={isLoading}
      />
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 mb-4"
        value={inviteRole}
        onChange={(e) => setInviteRole(e.target.value)}
        disabled={isLoading}
      >
        <option value="MEMBER">Member</option>
        <option value="ADMIN">Admin</option>
      </select>
    </Modal>
  );
};
