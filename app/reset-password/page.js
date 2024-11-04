'use client';

import { useState } from 'react';
import PasswordResetModal from '../components/PasswordResetModal';

export default function ResetPasswordPage() {
  const [showModal, setShowModal] = useState(true);

  return (
    <PasswordResetModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
    />
  );
}
