import { reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import { changeMyPassword } from '../api/auth';
import { PASSWORD_MESSAGES } from '../utils/module-ui';

export function usePasswordChange(options) {
  const {
    currentUser,
  } = options;

  const passwordModalOpen = ref(false);
  const passwordSubmitting = ref(false);
  const passwordForm = reactive({
    password: '',
    confirmPassword: '',
  });

  function openPasswordModal() {
    passwordForm.password = '';
    passwordForm.confirmPassword = '';
    passwordModalOpen.value = true;
  }

  function closePasswordModal() {
    passwordModalOpen.value = false;
  }

  async function submitPasswordChange() {
    const password = String(passwordForm.password || '');
    const confirmPassword = String(passwordForm.confirmPassword || '');
    if (!password) {
      message.warning(PASSWORD_MESSAGES.empty);
      return;
    }
    if (password !== confirmPassword) {
      message.warning(PASSWORD_MESSAGES.mismatch);
      return;
    }

    passwordSubmitting.value = true;
    try {
      await changeMyPassword(currentUser?.value, password);
      message.success(PASSWORD_MESSAGES.success);
      closePasswordModal();
    } catch (error) {
      message.error(error?.message || PASSWORD_MESSAGES.fail);
    } finally {
      passwordSubmitting.value = false;
    }
  }

  return {
    passwordModalOpen,
    passwordSubmitting,
    passwordForm,
    openPasswordModal,
    closePasswordModal,
    submitPasswordChange,
  };
}
