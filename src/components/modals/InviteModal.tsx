import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
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
        url: `http://43.204.115.57:8085/api/member/invite/${user.id}`,
        params: { inviteEmail, role: inviteRole },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold">Invite Team Member</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="mt-4">
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={(e) => { e.preventDefault(); handleInvite(); }}>
            <div className="mb-4">
              <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="inviteEmail"
                type="email"
                placeholder="Enter email address"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="inviteRole" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="inviteRole"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                disabled={isLoading}
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                disabled={isLoading || !inviteEmail.trim()}
              >
                {isLoading ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
