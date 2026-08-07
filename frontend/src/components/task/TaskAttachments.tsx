import React, { useState, useEffect, useRef } from 'react';
import { attachmentService, type TaskAttachment } from '../../services/attachmentService';
import { Paperclip, UploadCloud, Trash2, FileText, Image as ImageIcon, File, Download } from 'lucide-react';

interface TaskAttachmentsProps {
  taskId: string;
}

export const TaskAttachments: React.FC<TaskAttachmentsProps> = ({ taskId }) => {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [attachmentToDelete, setAttachmentToDelete] = useState<TaskAttachment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAttachments();
  }, [taskId]);

  const loadAttachments = async () => {
    setLoading(true);
    const fetched = await attachmentService.getAttachments(taskId);
    setAttachments(fetched);
    setLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleUpload(e.target.files[0]);
      // Clear input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (file: File) => {
    // Basic validation
    if (file.size > 20 * 1024 * 1024) {
      alert("File is too large. Max size is 20MB.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const newAttachment = await attachmentService.uploadAttachment(taskId, file, (progress) => {
        setUploadProgress(Math.round(progress));
      });
      setAttachments([newAttachment, ...attachments]);
    } catch (error: any) {
      alert(error.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteClick = (attachment: TaskAttachment) => {
    setAttachmentToDelete(attachment);
  };

  const confirmDelete = async () => {
    if (!attachmentToDelete) return;
    setIsDeleting(true);
    try {
      await attachmentService.deleteAttachment(attachmentToDelete);
      setAttachments(attachments.filter(a => a.id !== attachmentToDelete.id));
    } catch (e) {
      alert("Failed to delete attachment");
    } finally {
      setIsDeleting(false);
      setAttachmentToDelete(null);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon size={20} color="#10B981" />;
    if (type.includes('pdf')) return <FileText size={20} color="#EF4444" />;
    return <File size={20} color="#6B7280" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return <div style={{ fontSize: '0.875rem', color: '#6B7280', padding: '16px 0' }}>Loading attachments...</div>;
  }

  return (
    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#374151', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Paperclip size={16} /> Attachments
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>
          {attachments.length} files
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {attachments.map(att => (
          <div 
            key={att.id}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '10px 12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
            }}
          >
            {getFileIcon(att.fileType)}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {att.fileName}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#6B7280', display: 'flex', gap: '8px', marginTop: '2px' }}>
                <span>{formatSize(att.fileSize)}</span>
                <span>•</span>
                <span>{att.uploadedByName}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '4px' }}>
              {att.downloadUrl && (
                <a 
                href={att.downloadUrl}
                download={att.fileName}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px', color: '#6B7280' }}
                title="Download"
              >
                <Download size={16} />
              </a>
              )}
              <button 
                onClick={() => handleDeleteClick(att)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px', color: '#EF4444' }}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Uploader UI */}
      <div>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        <button
          type="button"
          onClick={() => !uploading && fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            width: '100%',
            padding: '16px',
            border: '2px dashed #D1D5DB',
            borderRadius: '8px',
            backgroundColor: '#F9FAFB',
            color: '#6B7280',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: uploading ? 'not-allowed' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          {uploading ? (
            <>
              <div style={{ width: '100%', maxWidth: '200px', height: '4px', backgroundColor: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${uploadProgress}%`, backgroundColor: '#4F46E5', transition: 'width 0.2s' }} />
              </div>
              <span>Uploading... {uploadProgress}%</span>
            </>
          ) : (
            <>
              <UploadCloud size={24} color="#9CA3AF" />
              <span>Click to upload attachment</span>
            </>
          )}
        </button>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {attachmentToDelete && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '100%',
            maxWidth: '360px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#111827' }}>Delete Attachment?</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#4B5563' }}>
              Are you sure you want to remove <strong>{attachmentToDelete.fileName}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => !isDeleting && setAttachmentToDelete(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  background: 'white',
                  color: '#374151',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.6 : 1
                }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#EF4444',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: isDeleting ? 0.6 : 1
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
