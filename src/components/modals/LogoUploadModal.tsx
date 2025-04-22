import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { useUser } from '../../context/userContext';
import axios from 'axios';
import { toast } from 'react-toastify';

interface LogoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoUploaded: (logoUrl: string) => void;
}

export const LogoUploadModal: React.FC<LogoUploadModalProps> = ({ isOpen, onClose, onLogoUploaded }) => {
  const { user } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'imanager-preset'); // Replace with your Cloudinary upload preset

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dnzpwthcr/image/upload', // Replace with your cloud name
        formData
      );
      console.log(response.data.secure_url);
      return response.data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Failed to upload to Cloudinary');
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    try {
      // First upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(file);
      const loggedId = user?.role === 'ADMIN' ? user?.id : user?.orgId;
      // Then send the Cloudinary URL to your backend
      const response = await axios.post(
        `https://imanager2.duckdns.org/api/service1/db/api/org/upload/logo/${loggedId}?logoUrl=${encodeURIComponent(cloudinaryUrl)}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response) {  
        toast.success('Logo uploaded successfully!');
        onClose();
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold">Upload Company Logo</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6">
          <div className="flex flex-col items-center justify-center">
            {previewUrl ? (
              <div className="relative w-32 h-32 mb-4">
                <img
                  src={previewUrl}
                  alt="Logo preview"
                  className="w-full h-full object-contain rounded-lg"
                />
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  aria-label="Remove preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4 cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
              aria-label="Upload logo file"
            />

            <button
              onClick={handleUpload}
              disabled={isUploading || !previewUrl}
              className={`w-full px-4 py-2 rounded-lg text-white ${
                isUploading || !previewUrl
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Upload Logo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 
